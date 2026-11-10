// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Supabase Backend & Cross-Interface Synchronization Layer
// ─────────────────────────────────────────────────────────────────────────────
// Persists and syncs shared state across Citizen, Authority, and Admin views
// using Supabase PostgreSQL + Realtime (and BroadcastChannel/localStorage when
// running in Local Demo Mode).
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabase';
import type {
  Facility,
  CommunityIncident,
  ActiveSosState,
  DisasterAlert,
  MultiOrgResource,
  ResourceRequest,
  SosBeaconRecord,
  SosWorkflowStage,
  LifecycleStage,
} from '../types/disaster';

// ── Facilities ───────────────────────────────────────────────────────────────
export async function fetchFacilitiesFromDb(): Promise<Facility[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .order('distance_km', { ascending: true });

  if (error || !data || data.length === 0) {
    if (error) console.warn('Supabase facilities read fallback:', error.message);
    return null;
  }

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    address: row.address,
    distanceKm: Number(row.distance_km),
    driveTimeMin: Number(row.drive_time_min),
    walkTimeMin: Number(row.walk_time_min),
    coords: { lat: Number(row.lat), lng: Number(row.lng) },
    status: row.status,
    capacityTotal: Number(row.capacity_total),
    capacityUsed: Number(row.capacity_used),
    phone: row.phone,
    bloodStock: row.blood_stock ?? undefined,
    features: row.features ?? {
      backupGenerator: false,
      cleanWater: true,
      medicalStaff: false,
      petFriendly: false,
      wheelchairAccessible: true,
      foodDaysStock: 3,
    },
  }));
}

export async function updateFacilityInDb(facility: Facility): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('facilities')
    .update({
      capacity_total: facility.capacityTotal,
      capacity_used: facility.capacityUsed,
      status: facility.status,
      blood_stock: facility.bloodStock ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', facility.id);

  if (error) console.warn('Supabase facility update skipped:', error.message);
}

// ── Incidents (Citizen → Authority Bridge) ───────────────────────────────────
export async function fetchIncidentsFromDb(): Promise<CommunityIncident[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    if (error) console.warn('Supabase incidents read fallback:', error.message);
    return null;
  }

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    severity: row.severity,
    locationName: row.location_name,
    coords: { lat: Number(row.lat), lng: Number(row.lng) },
    distanceKm: Number(row.distance_km),
    reportedAt: row.reported_at_label || 'Recently',
    reportedBy: row.reported_by,
    isVerified: Boolean(row.is_verified),
    upvotes: Number(row.upvotes),
    description: row.description,
    status: row.status ?? 'SUBMITTED',
    photoUrl: row.photo_url ?? undefined,
    aiVerificationScore: row.ai_verification_score ?? undefined,
  }));
}

export async function createIncidentInDb(
  incident: CommunityIncident,
  userId?: string
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('incidents').insert({
    id: incident.id,
    title: incident.title,
    category: incident.category,
    severity: incident.severity,
    location_name: incident.locationName,
    lat: incident.coords.lat,
    lng: incident.coords.lng,
    distance_km: incident.distanceKm,
    reported_at_label: incident.reportedAt,
    reported_by: incident.reportedBy,
    reported_by_uid: userId ?? null,
    is_verified: incident.isVerified,
    upvotes: incident.upvotes,
    description: incident.description,
    status: incident.status ?? 'SUBMITTED',
    photo_url: incident.photoUrl ?? null,
    ai_verification_score: incident.aiVerificationScore ?? null,
  });

  if (error) console.warn('Supabase incident insert skipped:', error.message);
}

export async function updateIncidentStatusInDb(
  incidentId: string,
  status: NonNullable<CommunityIncident['status']>,
  severity?: CommunityIncident['severity']
): Promise<void> {
  if (!supabase) return;
  const patch: Record<string, any> = {
    status,
    is_verified: status !== 'SUBMITTED',
  };
  if (severity) patch.severity = severity;

  const { error } = await supabase
    .from('incidents')
    .update(patch)
    .eq('id', incidentId);

  if (error) console.warn('Supabase incident status update skipped:', error.message);
}

export async function upvoteIncidentInDb(incidentId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.rpc('upvote_incident', {
    target_incident_id: incidentId,
  });
  if (error) console.warn('Supabase incident upvote skipped:', error.message);
}

// ── SOS Beacons (Citizen ↔ Authority Live Dispatch Sync) ─────────────────────
function mapSosRow(row: any): SosBeaconRecord {
  const startedMs = row.started_at ? new Date(row.started_at).getTime() : Date.now();
  const minsAgo = Math.max(0, Math.round((Date.now() - startedMs) / 60000));
  return {
    id: row.id,
    beaconCode: row.beacon_code,
    callerName: row.caller_name || 'Citizen Caller',
    userId: row.user_id ?? undefined,
    emergencyType: row.emergency_type,
    locationName: row.location_name || 'GPS Coordinate Lock',
    coords: { lat: Number(row.lat), lng: Number(row.lng) },
    peopleCount: Number(row.people_count ?? 1),
    bloodType: row.blood_type || 'O+',
    medicalNotes: row.medical_notes || '',
    workflowStage: (row.workflow_stage || 'BROADCASTED') as SosWorkflowStage,
    assignedUnit: row.assigned_unit ?? undefined,
    etaMinutes: row.eta_minutes ?? undefined,
    isActive: Boolean(row.is_active),
    startedAt: row.started_at,
    timeAgo: minsAgo === 0 ? 'Just now' : `${minsAgo} mins ago`,
  };
}

export async function fetchAllActiveSosBeaconsFromDb(): Promise<SosBeaconRecord[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sos_beacons')
    .select('*')
    .eq('is_active', true)
    .order('started_at', { ascending: false })
    .limit(50);

  if (error || !data) {
    if (error) console.warn('Supabase SOS beacons read fallback:', error.message);
    return null;
  }
  return data.map(mapSosRow);
}

export async function createSosBeaconInDb(beacon: SosBeaconRecord, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('sos_beacons').insert({
    beacon_code: beacon.beaconCode,
    user_id: userId,
    caller_name: beacon.callerName,
    emergency_type: beacon.emergencyType,
    location_name: beacon.locationName,
    lat: beacon.coords.lat,
    lng: beacon.coords.lng,
    blood_type: beacon.bloodType,
    medical_notes: beacon.medicalNotes,
    people_count: beacon.peopleCount,
    contacts_notified_count: 3,
    workflow_stage: beacon.workflowStage,
    assigned_unit: beacon.assignedUnit ?? 'Pending EOC Triage',
    eta_minutes: beacon.etaMinutes ?? 8,
    is_active: true,
  });

  if (error) console.warn('Supabase SOS beacon insert skipped:', error.message);
}

export async function updateSosBeaconDispatchInDb(
  beaconCode: string,
  workflowStage: SosWorkflowStage,
  assignedUnit?: string,
  etaMinutes?: number
): Promise<void> {
  if (!supabase) return;
  const patch: Record<string, any> = { workflow_stage: workflowStage };
  if (assignedUnit !== undefined) patch.assigned_unit = assignedUnit;
  if (etaMinutes !== undefined) patch.eta_minutes = etaMinutes;

  const { error } = await supabase
    .from('sos_beacons')
    .update(patch)
    .eq('beacon_code', beaconCode);

  if (error) console.warn('Supabase SOS dispatch update skipped:', error.message);
}

export async function deactivateSosBeaconInDb(beaconCode: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('sos_beacons')
    .update({ is_active: false, resolved_at: new Date().toISOString() })
    .eq('beacon_code', beaconCode);

  if (error) console.warn('Supabase SOS beacon deactivate skipped:', error.message);
}

export async function fetchActiveSosForUser(userId: string): Promise<ActiveSosState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sos_beacons')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    isActive: true,
    beaconId: data.beacon_code,
    startedAt: data.started_at,
    emergencyType: data.emergency_type,
    coords: { lat: Number(data.lat), lng: Number(data.lng) },
    bloodType: data.blood_type ?? 'O+',
    medicalNotes: data.medical_notes ?? '',
    contactsNotifiedCount: data.contacts_notified_count ?? 3,
    isSirenPlaying: false,
    isStrobeActive: false,
    workflowStage: data.workflow_stage ?? 'BROADCASTED',
    assignedUnit: data.assigned_unit ?? 'Pending EOC Triage',
    etaMinutes: data.eta_minutes ?? 8,
  };
}

// ── Alerts (Authority EAS Broadcast → Citizens & Admin) ──────────────────────
export async function fetchAlertsFromDb(): Promise<DisasterAlert[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) return null;
  return data.map((row: any) => ({
    id: row.id,
    headline: row.headline,
    severity: row.severity,
    category: row.category,
    issuedAt: row.issued_at_label || 'Just now',
    expiresAt: row.expires_at_label || 'In 6 hours',
    affectedRadiusKm: Number(row.affected_radius_km ?? 20),
    sourceAuthority: row.source_authority,
    summary: row.summary,
    instructions: row.instructions ?? { do: [], dont: [] },
    audioWarningAvailable: Boolean(row.audio_warning_available),
    translations: row.translations ?? undefined,
  }));
}

export async function createAlertInDb(alert: DisasterAlert): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('alerts').insert({
    id: alert.id,
    headline: alert.headline,
    severity: alert.severity,
    category: alert.category,
    issued_at_label: alert.issuedAt,
    expires_at_label: alert.expiresAt,
    affected_radius_km: alert.affectedRadiusKm,
    source_authority: alert.sourceAuthority,
    summary: alert.summary,
    instructions: alert.instructions,
    audio_warning_available: alert.audioWarningAvailable,
    translations: alert.translations ?? null,
  });

  if (error) console.warn('Supabase alert insert skipped:', error.message);
}

// ── Multi-Org Resources & Authority Resource Requests (Authority ↔ Admin) ────
export async function fetchResourcesFromDb(): Promise<MultiOrgResource[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('id', { ascending: true });

  if (error || !data || data.length === 0) return null;
  return data.map((row: any) => ({
    id: row.id,
    orgName: row.org_name,
    orgType: row.org_type,
    resourceCategory: row.resource_category,
    availableQty: row.available_qty,
    assignedToSector: row.assigned_to_sector,
    status: row.status,
  }));
}

export async function updateResourceInDb(resource: MultiOrgResource): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('resources')
    .update({
      assigned_to_sector: resource.assignedToSector,
      status: resource.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', resource.id);

  if (error) console.warn('Supabase resource update skipped:', error.message);
}

export async function fetchResourceRequestsFromDb(): Promise<ResourceRequest[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('resource_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return null;
  return data.map((row: any) => ({
    id: row.id,
    requestedBy: row.requested_by,
    sector: row.sector,
    resourceCategory: row.resource_category,
    neededQty: row.needed_qty,
    urgency: row.urgency,
    notes: row.notes ?? undefined,
    status: row.status,
    matchedResourceId: row.matched_resource_id ?? undefined,
    matchedOrgName: row.matched_org_name ?? undefined,
    createdAt: 'Recently',
  }));
}

export async function createResourceRequestInDb(req: ResourceRequest): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('resource_requests').insert({
    id: req.id,
    requested_by: req.requestedBy,
    sector: req.sector,
    resource_category: req.resourceCategory,
    needed_qty: req.neededQty,
    urgency: req.urgency,
    notes: req.notes ?? null,
    status: req.status,
  });

  if (error) console.warn('Supabase resource request insert skipped:', error.message);
}

export async function fulfillResourceRequestInDb(
  requestId: string,
  resourceId: string,
  orgName: string,
  status: ResourceRequest['status'] = 'MATCHED'
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('resource_requests')
    .update({
      status,
      matched_resource_id: resourceId,
      matched_org_name: orgName,
    })
    .eq('id', requestId);

  if (error) console.warn('Supabase resource request update skipped:', error.message);
}

// ── Closed-Loop Lifecycle Stage Sync ─────────────────────────────────────────
export async function fetchLifecycleStageFromDb(): Promise<LifecycleStage | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('platform_state')
    .select('value')
    .eq('key', 'active_lifecycle_stage')
    .maybeSingle();

  if (error || !data) return null;
  const stage = data.value as LifecycleStage;
  return stage;
}

export async function saveLifecycleStageInDb(stage: LifecycleStage): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('platform_state')
    .upsert({
      key: 'active_lifecycle_stage',
      value: stage,
      updated_at: new Date().toISOString(),
    });

  if (error) console.warn('Supabase lifecycle stage update skipped:', error.message);
}

// ── Cross-Tab Local Demo Sync (BroadcastChannel) ─────────────────────────────
export const DEMO_CHANNEL_NAME = 'resq_interconnected_sync_v1';
export const DEMO_STATE_STORAGE_KEY = 'resq_shared_demo_state_v1';
