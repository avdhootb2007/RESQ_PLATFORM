import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { supabase } from './lib/supabase';
import {
  fetchFacilitiesFromDb,
  fetchIncidentsFromDb,
  fetchAllActiveSosBeaconsFromDb,
  fetchAlertsFromDb,
  fetchResourcesFromDb,
  fetchResourceRequestsFromDb,
  fetchLifecycleStageFromDb,
  updateFacilityInDb,
  createIncidentInDb,
  updateIncidentStatusInDb,
  upvoteIncidentInDb,
  createSosBeaconInDb,
  updateSosBeaconDispatchInDb,
  deactivateSosBeaconInDb,
  createAlertInDb,
  updateResourceInDb,
  createResourceRequestInDb,
  fulfillResourceRequestInDb,
  saveLifecycleStageInDb,
  DEMO_CHANNEL_NAME,
  DEMO_STATE_STORAGE_KEY,
} from './lib/resqBackend';

import { NavigationSidebar } from './components/NavigationSidebar';
import { EnterpriseHeader } from './components/EnterpriseHeader';
import { MetricStrip } from './components/MetricStrip';
import { TelemetryChart } from './components/TelemetryChart';
import { RiskStatusBanner } from './components/RiskStatusBanner';
import { CitizenInterface } from './components/CitizenInterface';
import { AuthorityInterface } from './components/AuthorityInterface';
import { AdminInterface } from './components/AdminInterface';

import { SosModal } from './components/SosModal';
import { SosActiveBar } from './components/SosActiveBar';
import { DisasterMap } from './components/DisasterMap';
import { AlertsStream } from './components/AlertsStream';
import { EmergencyServicesGrid } from './components/EmergencyServicesGrid';
import { SheltersHospitalsView } from './components/SheltersHospitalsView';
import { IncidentsFeed } from './components/IncidentsFeed';
import { ReportIncidentModal } from './components/ReportIncidentModal';
import { DirectionsModal } from './components/DirectionsModal';
import { EmergencyToolsModal } from './components/EmergencyToolsModal';
import { RescueStrobeOverlay } from './components/RescueStrobeOverlay';
import { UserMenu } from './components/UserMenu';

import {
  REGION_PRESETS,
  INITIAL_FACILITIES,
  INITIAL_INCIDENTS,
  INITIAL_SOS_BEACONS,
  INITIAL_RESOURCE_REQUESTS,
  MOCK_MULTI_ORG_RESOURCES,
} from './data/mockDisasterData';
import type {
  LocationData,
  DisasterAlert,
  WeatherData,
  Facility,
  CommunityIncident,
  ActiveSosState,
  SupportedLanguage,
  SosBeaconRecord,
  MultiOrgResource,
  ResourceRequest,
  LifecycleStage,
  OfflineQueueItem,
} from './types/disaster';
import { audioBeacon } from './utils/audioBeacon';
import { TRANSLATIONS } from './utils/translations';

const OFFLINE_QUEUE_KEY = 'resq_offline_queue_v1';

interface SharedDemoState {
  alerts?: DisasterAlert[];
  facilities?: Facility[];
  incidents?: CommunityIncident[];
  sosBeacons?: SosBeaconRecord[];
  resources?: MultiOrgResource[];
  resourceRequests?: ResourceRequest[];
  lifecycleStage?: LifecycleStage;
}

function loadDemoState(): SharedDemoState {
  try {
    const raw = localStorage.getItem(DEMO_STATE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

// ── Main Dashboard (authenticated) ──────────────────────────────────────────
function Dashboard() {
  const { user, role, isDemoMode, switchDemoRole } = useAuth();

  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const t = TRANSLATIONS[language];

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [currentPresetId, setCurrentPresetId] = useState<string>('coastal-metro');
  const activePreset = REGION_PRESETS.find((p) => p.id === currentPresetId) || REGION_PRESETS[0];

  const [location, setLocation] = useState<LocationData>(activePreset.location);
  const [weather, setWeather] = useState<WeatherData>(activePreset.weather);

  // Shared Interconnected State across Citizen, Authority & Admin
  const initialDemo = isDemoMode ? loadDemoState() : {};
  const [alerts, setAlerts] = useState<DisasterAlert[]>(initialDemo.alerts ?? activePreset.alerts);
  const [facilities, setFacilities] = useState<Facility[]>(initialDemo.facilities ?? INITIAL_FACILITIES);
  const [incidents, setIncidents] = useState<CommunityIncident[]>(initialDemo.incidents ?? INITIAL_INCIDENTS);
  const [sosBeacons, setSosBeacons] = useState<SosBeaconRecord[]>(initialDemo.sosBeacons ?? INITIAL_SOS_BEACONS);
  const [resources, setResources] = useState<MultiOrgResource[]>(initialDemo.resources ?? MOCK_MULTI_ORG_RESOURCES);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>(
    initialDemo.resourceRequests ?? INITIAL_RESOURCE_REQUESTS
  );
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>(initialDemo.lifecycleStage ?? 'RESPOND');

  // Citizen's own active SOS tracker state (auto-synced with Authority's dispatch actions)
  const [myActiveBeaconCode, setMyActiveBeaconCode] = useState<string | null>(null);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);

  const myBeacon = myActiveBeaconCode
    ? sosBeacons.find((b) => b.beaconCode === myActiveBeaconCode && b.isActive) ?? null
    : null;

  const sosState: ActiveSosState = {
    isActive: Boolean(myBeacon),
    beaconId: myBeacon?.beaconCode ?? null,
    startedAt: myBeacon?.startedAt ?? null,
    emergencyType: myBeacon?.emergencyType ?? 'GENERAL_RESCUE',
    coords: myBeacon?.coords ?? location.coords,
    bloodType: myBeacon?.bloodType ?? 'O+',
    medicalNotes: myBeacon?.medicalNotes ?? '',
    contactsNotifiedCount: 3,
    isSirenPlaying,
    isStrobeActive,
    workflowStage: myBeacon?.workflowStage ?? 'BROADCASTED',
    assignedUnit: myBeacon?.assignedUnit ?? 'Pending EOC Triage',
    etaMinutes: myBeacon?.etaMinutes ?? 8,
  };

  // Offline Queue (Feature #12)
  const [browserOffline, setBrowserOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const isOffline = browserOffline || simulatedOffline;

  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
    } catch {}
  }, [offlineQueue]);

  useEffect(() => {
    const onOffline = () => setBrowserOffline(true);
    const onOnline = () => setBrowserOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  // Modals
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [selectedFacilityForRoute, setSelectedFacilityForRoute] = useState<Facility | null>(null);

  // Persist & broadcast Demo Mode changes across browser tabs
  const broadcastDemoPatch = useCallback(
    (patch: SharedDemoState) => {
      if (!isDemoMode) return;
      try {
        const next = { ...loadDemoState(), ...patch };
        localStorage.setItem(DEMO_STATE_STORAGE_KEY, JSON.stringify(next));
        if (typeof BroadcastChannel !== 'undefined') {
          const ch = new BroadcastChannel(DEMO_CHANNEL_NAME);
          ch.postMessage(next);
          ch.close();
        }
      } catch {}
    },
    [isDemoMode]
  );

  useEffect(() => {
    if (!isDemoMode || typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(DEMO_CHANNEL_NAME);
    ch.onmessage = (evt) => {
      const data = evt.data as SharedDemoState;
      if (data.alerts) setAlerts(data.alerts);
      if (data.facilities) setFacilities(data.facilities);
      if (data.incidents) setIncidents(data.incidents);
      if (data.sosBeacons) setSosBeacons(data.sosBeacons);
      if (data.resources) setResources(data.resources);
      if (data.resourceRequests) setResourceRequests(data.resourceRequests);
      if (data.lifecycleStage) setLifecycleStage(data.lifecycleStage);
    };
    return () => ch.close();
  }, [isDemoMode]);

  // Sync live data from Supabase (when configured and signed in)
  const refreshFromBackend = useCallback(async () => {
    if (!user || isDemoMode || !supabase) return;
    const [
      dbFacilities,
      dbIncidents,
      dbBeacons,
      dbAlerts,
      dbResources,
      dbRequests,
      dbStage,
    ] = await Promise.all([
      fetchFacilitiesFromDb(),
      fetchIncidentsFromDb(),
      fetchAllActiveSosBeaconsFromDb(),
      fetchAlertsFromDb(),
      fetchResourcesFromDb(),
      fetchResourceRequestsFromDb(),
      fetchLifecycleStageFromDb(),
    ]);

    if (dbFacilities) setFacilities(dbFacilities);
    if (dbIncidents) setIncidents(dbIncidents);
    if (dbBeacons) {
      setSosBeacons(dbBeacons.length > 0 ? dbBeacons : INITIAL_SOS_BEACONS);
      const mine = dbBeacons.find((b) => b.userId === user.id && b.isActive);
      if (mine) setMyActiveBeaconCode(mine.beaconCode);
    }
    if (dbAlerts) setAlerts(dbAlerts);
    if (dbResources) setResources(dbResources);
    if (dbRequests) setResourceRequests(dbRequests);
    if (dbStage) setLifecycleStage(dbStage);
  }, [user, isDemoMode]);

  useEffect(() => {
    refreshFromBackend();

    const client = supabase;
    if (!user || isDemoMode || !client) return;

    const channel = client
      .channel('resq-dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchIncidentsFromDb().then((rows) => rows && setIncidents(rows));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'facilities' }, () => {
        fetchFacilitiesFromDb().then((rows) => rows && setFacilities(rows));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_beacons' }, () => {
        fetchAllActiveSosBeaconsFromDb().then((rows) => rows && setSosBeacons(rows));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        fetchAlertsFromDb().then((rows) => rows && setAlerts(rows));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => {
        fetchResourcesFromDb().then((rows) => rows && setResources(rows));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resource_requests' }, () => {
        fetchResourceRequestsFromDb().then((rows) => rows && setResourceRequests(rows));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_state' }, () => {
        fetchLifecycleStageFromDb().then((st) => st && setLifecycleStage(st));
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user, isDemoMode, refreshFromBackend]);

  // Switch Scenario Preset
  const handleSelectPreset = (presetId: string) => {
    setCurrentPresetId(presetId);
    const chosen = REGION_PRESETS.find((p) => p.id === presetId);
    if (chosen) {
      setLocation(chosen.location);
      setWeather(chosen.weather);
      setAlerts(chosen.alerts);
      broadcastDemoPatch({ alerts: chosen.alerts });
    }
  };

  // ── Interconnected SOS Handlers (Citizen ↔ Authority) ──────────────────────
  const handleActivateSos = (data: {
    emergencyType: string;
    bloodType: string;
    medicalNotes: string;
    peopleCount: number;
  }) => {
    const beaconCode = `RESQ-SOS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBeacon: SosBeaconRecord = {
      id: `beacon-${Date.now()}`,
      beaconCode,
      callerName: user?.displayName || user?.email || user?.phone || 'Citizen Caller',
      userId: user?.id,
      emergencyType: data.emergencyType,
      locationName: `${location.regionName} (${location.zone.split('-')[0].trim()})`,
      coords: location.coords,
      peopleCount: data.peopleCount,
      bloodType: data.bloodType,
      medicalNotes: data.medicalNotes,
      workflowStage: 'BROADCASTED',
      assignedUnit: 'Pending EOC Triage',
      etaMinutes: 8,
      isActive: true,
      startedAt: new Date().toISOString(),
      timeAgo: 'Just now',
    };

    setMyActiveBeaconCode(beaconCode);

    if (isOffline) {
      setSosBeacons((prev) => [newBeacon, ...prev]);
      setOfflineQueue((prev) => [
        ...prev,
        { id: `q-${Date.now()}`, kind: 'SOS', createdAt: new Date().toISOString(), label: beaconCode, payload: newBeacon },
      ]);
      return;
    }

    setSosBeacons((prev) => {
      const next = [newBeacon, ...prev];
      broadcastDemoPatch({ sosBeacons: next });
      return next;
    });

    if (user && !isDemoMode) {
      createSosBeaconInDb(newBeacon, user.id);
    }
  };

  const handleDeactivateSos = () => {
    const activeCode = myActiveBeaconCode;
    audioBeacon.stop();
    setIsSirenPlaying(false);
    setIsStrobeActive(false);
    setMyActiveBeaconCode(null);
    setIsSosModalOpen(false);

    if (activeCode) {
      setSosBeacons((prev) => {
        const next = prev.map((b) => (b.beaconCode === activeCode ? { ...b, isActive: false } : b));
        broadcastDemoPatch({ sosBeacons: next });
        return next;
      });
      if (!isDemoMode) {
        deactivateSosBeaconInDb(activeCode);
      }
    }
  };

  const handleDispatchSosBeacon = (beaconCode: string, unitName: string) => {
    setSosBeacons((prev) => {
      const next = prev.map((b) =>
        b.beaconCode === beaconCode
          ? { ...b, workflowStage: 'DISPATCHED' as const, assignedUnit: unitName, etaMinutes: 6 }
          : b
      );
      broadcastDemoPatch({ sosBeacons: next });
      return next;
    });
    if (!isDemoMode) {
      updateSosBeaconDispatchInDb(beaconCode, 'DISPATCHED', unitName, 6);
    }
  };

  const handleAdvanceSosBeacon = (beaconCode: string) => {
    let nextStage: SosBeaconRecord['workflowStage'] = 'IN_TRANSIT';
    let nextEta = 3;
    setSosBeacons((prev) => {
      const next = prev.map((b) => {
        if (b.beaconCode !== beaconCode) return b;
        if (b.workflowStage === 'DISPATCHED') {
          nextStage = 'IN_TRANSIT';
          nextEta = 3;
          return { ...b, workflowStage: 'IN_TRANSIT' as const, etaMinutes: 3 };
        }
        nextStage = 'ON_SCENE';
        nextEta = 0;
        return { ...b, workflowStage: 'ON_SCENE' as const, etaMinutes: 0 };
      });
      broadcastDemoPatch({ sosBeacons: next });
      return next;
    });
    if (!isDemoMode) {
      updateSosBeaconDispatchInDb(beaconCode, nextStage, undefined, nextEta);
    }
  };

  const handleToggleSiren = () => {
    if (isSirenPlaying) {
      audioBeacon.stop();
      setIsSirenPlaying(false);
    } else {
      audioBeacon.startSiren(0.3);
      setIsSirenPlaying(true);
    }
  };

  // ── Interconnected Incidents (Citizen ↔ Authority) ─────────────────────────
  const handleAddIncident = (newIncident: CommunityIncident) => {
    if (isOffline) {
      setIncidents((prev) => [newIncident, ...prev]);
      setOfflineQueue((prev) => [
        ...prev,
        {
          id: `q-${Date.now()}`,
          kind: 'INCIDENT',
          createdAt: new Date().toISOString(),
          label: newIncident.title,
          payload: newIncident,
        },
      ]);
      return;
    }

    setIncidents((prev) => {
      const next = [newIncident, ...prev];
      broadcastDemoPatch({ incidents: next });
      return next;
    });
    if (!isDemoMode) {
      createIncidentInDb(newIncident, user?.id);
    }
  };

  const handleUpdateIncidentStatus = (
    id: string,
    status: NonNullable<CommunityIncident['status']>,
    severity?: CommunityIncident['severity']
  ) => {
    setIncidents((prev) => {
      const next = prev.map((inc) =>
        inc.id === id
          ? { ...inc, status, isVerified: status !== 'SUBMITTED', severity: severity ?? inc.severity }
          : inc
      );
      broadcastDemoPatch({ incidents: next });
      return next;
    });
    if (!isDemoMode) {
      updateIncidentStatusInDb(id, status, severity);
    }
  };

  const handleUpvoteIncident = (id: string) => {
    setIncidents((prev) => {
      const next = prev.map((inc) => (inc.id === id ? { ...inc, upvotes: inc.upvotes + 1 } : inc));
      broadcastDemoPatch({ incidents: next });
      return next;
    });
    if (!isDemoMode) {
      upvoteIncidentInDb(id);
    }
  };

  // ── Sync Offline Queue when Online ─────────────────────────────────────────
  const handleSyncOfflineQueue = useCallback(() => {
    if (isOffline || offlineQueue.length === 0) return;
    offlineQueue.forEach((item) => {
      if (item.kind === 'INCIDENT' && !isDemoMode) {
        createIncidentInDb(item.payload as CommunityIncident, user?.id);
      }
      if (item.kind === 'SOS' && user && !isDemoMode) {
        createSosBeaconInDb(item.payload as SosBeaconRecord, user.id);
      }
    });
    if (isDemoMode) {
      broadcastDemoPatch({ incidents, sosBeacons });
    }
    setOfflineQueue([]);
  }, [isOffline, offlineQueue, isDemoMode, user, incidents, sosBeacons, broadcastDemoPatch]);

  useEffect(() => {
    if (!isOffline && offlineQueue.length > 0) {
      handleSyncOfflineQueue();
    }
  }, [isOffline, offlineQueue.length, handleSyncOfflineQueue]);

  // ── Interconnected Alerts, Lifecycle, Facilities & Resources ───────────────
  const handleBroadcastAlert = (newAlert: DisasterAlert) => {
    setAlerts((prev) => {
      const next = [newAlert, ...prev];
      broadcastDemoPatch({ alerts: next });
      return next;
    });
    if (!isDemoMode) {
      createAlertInDb(newAlert);
    }
  };

  const handleBroadcastUrgentBloodAlert = (facilityName: string) => {
    handleBroadcastAlert({
      id: `ALT-BLD-${Date.now()}`,
      headline: `Urgent Blood Reserve Call: Donors Needed at ${facilityName}`,
      severity: 'WARNING',
      category: location.primaryHazard,
      issuedAt: 'Just now (Blood Registry)',
      expiresAt: 'In 12 hours',
      affectedRadiusKm: 15,
      sourceAuthority: `Multi-Agency Health Grid · ${facilityName}`,
      summary: 'Hospital trauma intake requires O- and O+ units. Eligible healthy donors requested at safe medical hubs.',
      instructions: {
        do: ['Check hospital routes on the Live Risk Map before traveling.', 'Carry photo ID and blood donor card.'],
        dont: ['Do not travel through flooded or barricaded roadways.'],
      },
      audioWarningAvailable: false,
    });
  };

  const handleChangeLifecycleStage = (stage: LifecycleStage) => {
    setLifecycleStage(stage);
    broadcastDemoPatch({ lifecycleStage: stage });
    if (!isDemoMode) {
      saveLifecycleStageInDb(stage);
    }
  };

  const handleUpdateFacility = (updated: Facility) => {
    setFacilities((prev) => {
      const next = prev.map((f) => (f.id === updated.id ? updated : f));
      broadcastDemoPatch({ facilities: next });
      return next;
    });
    if (!isDemoMode) {
      updateFacilityInDb(updated);
    }
  };

  const handleAllocateResource = (id: string, targetSector: string) => {
    let updatedRes: MultiOrgResource | undefined;
    setResources((prev) => {
      const next = prev.map((r) => {
        if (r.id !== id) return r;
        updatedRes = { ...r, status: 'DEPLOYED', assignedToSector: targetSector };
        return updatedRes;
      });
      broadcastDemoPatch({ resources: next });
      return next;
    });
    if (!isDemoMode && updatedRes) {
      updateResourceInDb(updatedRes);
    }
  };

  const handleCreateResourceRequest = (req: ResourceRequest) => {
    setResourceRequests((prev) => {
      const next = [req, ...prev];
      broadcastDemoPatch({ resourceRequests: next });
      return next;
    });
    if (!isDemoMode) {
      createResourceRequestInDb(req);
    }
  };

  const handleFulfillResourceRequest = (requestId: string, resourceId: string) => {
    const req = resourceRequests.find((r) => r.id === requestId);
    const res = resources.find((r) => r.id === resourceId);
    if (!req || !res) return;

    const updatedRes: MultiOrgResource = { ...res, status: 'DEPLOYED', assignedToSector: req.sector };
    setResources((prev) => {
      const next = prev.map((r) => (r.id === resourceId ? updatedRes : r));
      broadcastDemoPatch({ resources: next });
      return next;
    });
    setResourceRequests((prev) => {
      const next = prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'MATCHED' as const, matchedResourceId: resourceId, matchedOrgName: res.orgName }
          : r
      );
      broadcastDemoPatch({ resourceRequests: next });
      return next;
    });

    if (!isDemoMode) {
      updateResourceInDb(updatedRes);
      fulfillResourceRequestInDb(requestId, resourceId, res.orgName, 'MATCHED');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-row antialiased selection:bg-slate-200 selection:text-slate-900">
      <NavigationSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        setRole={switchDemoRole}
        canSwitchRole={isDemoMode}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeAlertsCount={alerts.length}
        language={language}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <EnterpriseHeader
          location={location}
          onSelectPreset={handleSelectPreset}
          currentPresetId={currentPresetId}
          role={role}
          setRole={switchDemoRole}
          onOpenSos={() => setIsSosModalOpen(true)}
          isSosActive={sosState.isActive}
          onOpenTools={() => setIsToolsModalOpen(true)}
          activeAlertsCount={alerts.length}
          language={language}
          onSelectLanguage={setLanguage}
          userMenu={<UserMenu />}
        />

        <SosActiveBar
          sosState={sosState}
          onOpenSosModal={() => setIsSosModalOpen(true)}
          onDeactivateSos={handleDeactivateSos}
          onToggleSiren={handleToggleSiren}
          onToggleStrobe={() => setIsStrobeActive((s) => !s)}
        />

        <RescueStrobeOverlay
          isActive={sosState.isStrobeActive}
          onClose={() => setIsStrobeActive(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <RiskStatusBanner
            location={location}
            weather={weather}
            onViewEvacuationMap={() => setActiveTab('map')}
          />

          <MetricStrip weather={weather} location={location} />

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <TelemetryChart />

              {/* Role Header Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-mono uppercase text-slate-500 font-bold px-3">
                    {t.activeConsole}
                  </span>
                  <div className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white shadow-sm">
                    {role === 'citizen' ? t.citizenHub : role === 'authority' ? t.authorityOps : t.systemAdmin}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono ml-2">
                    {isDemoMode
                      ? 'Local Demo Mode (Cross-Interface Sync Active)'
                      : 'Role managed by Supabase RBAC'}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 pr-3">
                  <span>
                    GPS Lock:{' '}
                    <strong className="text-slate-900 font-semibold">
                      {location.coords.lat.toFixed(4)}°N, {location.coords.lng.toFixed(4)}°E
                    </strong>
                  </span>
                </div>
              </div>

              {role === 'citizen' && (
                <CitizenInterface
                  onOpenSos={() => setIsSosModalOpen(true)}
                  isSosActive={sosState.isActive}
                  sosState={sosState}
                  facilities={facilities}
                  onSelectFacility={(fac) => setSelectedFacilityForRoute(fac)}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  onOpenTools={() => setIsToolsModalOpen(true)}
                  location={location}
                  weather={weather}
                  alerts={alerts}
                  lifecycleStage={lifecycleStage}
                  resources={resources}
                  language={language}
                  incidents={incidents}
                  onUpvoteIncident={handleUpvoteIncident}
                  isOffline={isOffline}
                  onToggleOfflineSim={() => setSimulatedOffline((s) => !s)}
                  offlineQueueCount={offlineQueue.length}
                  onSyncOfflineQueue={handleSyncOfflineQueue}
                />
              )}

              {role === 'authority' && (
                <AuthorityInterface
                  location={location}
                  incidents={incidents}
                  onUpdateIncidentStatus={handleUpdateIncidentStatus}
                  sosBeacons={sosBeacons}
                  onDispatchSosBeacon={handleDispatchSosBeacon}
                  onAdvanceSosBeacon={handleAdvanceSosBeacon}
                  lifecycleStage={lifecycleStage}
                  onChangeLifecycleStage={handleChangeLifecycleStage}
                  onBroadcastAlert={handleBroadcastAlert}
                  facilities={facilities}
                  resources={resources}
                  resourceRequests={resourceRequests}
                  onCreateResourceRequest={handleCreateResourceRequest}
                  language={language}
                />
              )}

              {role === 'admin' && (
                <AdminInterface
                  facilities={facilities}
                  onUpdateFacility={handleUpdateFacility}
                  resources={resources}
                  onAllocateResource={handleAllocateResource}
                  resourceRequests={resourceRequests}
                  onFulfillResourceRequest={handleFulfillResourceRequest}
                  incidents={incidents}
                  sosBeacons={sosBeacons}
                  lifecycleStage={lifecycleStage}
                  onBroadcastUrgentBloodAlert={handleBroadcastUrgentBloodAlert}
                  language={language}
                />
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <AlertsStream alerts={alerts} />
              <EmergencyServicesGrid location={location} />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-6">
              <DisasterMap
                location={location}
                facilities={facilities}
                incidents={incidents}
                onSelectFacility={(fac) => setSelectedFacilityForRoute(fac)}
              />
              <SheltersHospitalsView
                facilities={facilities}
                onSelectFacilityForDirections={(fac) => setSelectedFacilityForRoute(fac)}
              />
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <IncidentsFeed
                incidents={incidents}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onUpvoteIncident={handleUpvoteIncident}
              />
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              <EmergencyServicesGrid location={location} />
            </div>
          )}

          {activeTab === 'shelters' && (
            <div className="space-y-6">
              <SheltersHospitalsView
                facilities={facilities}
                onSelectFacilityForDirections={(fac) => setSelectedFacilityForRoute(fac)}
              />
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-3 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Emergency Readiness & Survival Deck</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Access your 72-hour survival go-bag packing checklist, one-touch "I'm Safe" family check-in broadcaster, and offline medical protocols.
                </p>
                <button
                  onClick={() => setIsToolsModalOpen(true)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Open Survival Checklist & Tools
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div>RESQ Platform · National Emergency Response System v2.4.1</div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>{isOffline ? 'Offline Queue Mode' : 'Offline Protocol Ready'}</span>
            <span>·</span>
            <span>
              Emergency Dispatch: <strong className="text-slate-900">112 / 911</strong>
            </span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        location={location}
        sosState={sosState}
        onActivateSos={handleActivateSos}
        onDeactivateSos={handleDeactivateSos}
        onToggleSiren={handleToggleSiren}
        onToggleStrobe={() => setIsStrobeActive((s) => !s)}
      />

      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        location={location}
        reporterLabel={user?.displayName || user?.email || 'Resident Citizen'}
        isOffline={isOffline}
        onSubmitIncident={handleAddIncident}
      />

      <DirectionsModal
        facility={selectedFacilityForRoute}
        onClose={() => setSelectedFacilityForRoute(null)}
        userLocation={location}
        incidents={incidents}
      />

      <EmergencyToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        location={location}
        onLaunchStrobe={() => setIsStrobeActive(true)}
      />
    </div>
  );
}

// ── Root App with Routing ────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
