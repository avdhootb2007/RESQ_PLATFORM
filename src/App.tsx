import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

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

import { useState } from 'react';
import { 
  REGION_PRESETS, 
  INITIAL_FACILITIES, 
  INITIAL_INCIDENTS 
} from './data/mockDisasterData';
import { 
  LocationData, 
  DisasterAlert, 
  WeatherData, 
  Facility, 
  CommunityIncident, 
  ActiveSosState,
  SupportedLanguage 
} from './types/disaster';
import { audioBeacon } from './utils/audioBeacon';
import { TRANSLATIONS } from './utils/translations';

// ── Main Dashboard (authenticated) ──────────────────────────────────────────
function Dashboard() {
  // Role comes from Firebase custom claims now
  const { role } = useAuth();

  // Multilingual State (Feature #13: English, Hindi, Marathi)
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const t = TRANSLATIONS[language];

  // Navigation tab: 'dashboard', 'alerts', 'map', 'incidents', 'services', 'shelters', 'tools'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Region and Hazard Scenario
  const [currentPresetId, setCurrentPresetId] = useState<string>('coastal-metro');
  const activePreset = REGION_PRESETS.find(p => p.id === currentPresetId) || REGION_PRESETS[0];

  const [location, setLocation] = useState<LocationData>(activePreset.location);
  const [weather, setWeather] = useState<WeatherData>(activePreset.weather);
  const [alerts, setAlerts] = useState<DisasterAlert[]>(activePreset.alerts);

  // Facilities and Field Incidents
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [incidents, setIncidents] = useState<CommunityIncident[]>(INITIAL_INCIDENTS);

  // Emergency SOS State
  const [sosState, setSosState] = useState<ActiveSosState>({
    isActive: false,
    beaconId: null,
    startedAt: null,
    emergencyType: 'GENERAL_RESCUE',
    coords: location.coords,
    bloodType: 'O+',
    medicalNotes: '',
    contactsNotifiedCount: 3,
    isSirenPlaying: false,
    isStrobeActive: false,
    workflowStage: 'BROADCASTED',
    assignedUnit: 'NDRF Fast Response Unit #4',
    etaMinutes: 6
  });

  // Modal Dialogs
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [selectedFacilityForRoute, setSelectedFacilityForRoute] = useState<Facility | null>(null);

  // Switch Scenario handler
  const handleSelectPreset = (presetId: string) => {
    setCurrentPresetId(presetId);
    const chosen = REGION_PRESETS.find(p => p.id === presetId);
    if (chosen) {
      setLocation(chosen.location);
      setWeather(chosen.weather);
      setAlerts(chosen.alerts);
    }
  };

  // SOS Handlers
  const handleActivateSos = (data: {
    emergencyType: string;
    bloodType: string;
    medicalNotes: string;
    peopleCount: number;
  }) => {
    const beaconCode = `RESQ-SOS-${Math.floor(1000 + Math.random() * 9000)}`;
    setSosState({
      isActive: true,
      beaconId: beaconCode,
      startedAt: new Date().toISOString(),
      emergencyType: data.emergencyType,
      coords: location.coords,
      bloodType: data.bloodType,
      medicalNotes: data.medicalNotes,
      contactsNotifiedCount: 3,
      isSirenPlaying: false,
      isStrobeActive: false,
      workflowStage: 'BROADCASTED',
      assignedUnit: 'NDRF Fast Response Unit #4',
      etaMinutes: 6
    });
  };

  const handleDeactivateSos = () => {
    audioBeacon.stop();
    setSosState((prev) => ({
      ...prev,
      isActive: false,
      beaconId: null,
      isSirenPlaying: false,
      isStrobeActive: false,
    }));
    setIsSosModalOpen(false);
  };

  const handleToggleSiren = () => {
    if (sosState.isSirenPlaying) {
      audioBeacon.stop();
      setSosState((prev) => ({ ...prev, isSirenPlaying: false }));
    } else {
      audioBeacon.startSiren(0.3);
      setSosState((prev) => ({ ...prev, isSirenPlaying: true }));
    }
  };

  const handleToggleStrobe = () => {
    setSosState((prev) => ({ ...prev, isStrobeActive: !prev.isStrobeActive }));
  };

  // Facility & Incident handlers
  const handleUpdateFacility = (updated: Facility) => {
    setFacilities(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const handleAddIncident = (newIncident: CommunityIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
  };

  const handleVerifyIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, isVerified: true, status: 'VERIFIED' } : inc));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-row antialiased selection:bg-slate-200 selection:text-slate-900">
      
      {/* Enterprise IT Developer-Grade Sidebar */}
      <NavigationSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        setRole={() => {/* Role now managed by Firebase - no client toggle */}}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeAlertsCount={alerts.length}
        language={language}
      />

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header with Breadcrumbs, Language Switcher, Live Clock, and SOS Trigger */}
        <div className="flex items-center">
          <div className="flex-1">
            <EnterpriseHeader
              location={location}
              onSelectPreset={handleSelectPreset}
              currentPresetId={currentPresetId}
              role={role}
              setRole={() => {/* Role now managed by Firebase */}}
              onOpenSos={() => setIsSosModalOpen(true)}
              isSosActive={sosState.isActive}
              onOpenTools={() => setIsToolsModalOpen(true)}
              activeAlertsCount={alerts.length}
              language={language}
              onSelectLanguage={setLanguage}
            />
          </div>
          {/* User Menu in header */}
          <div className="pr-4 pt-2">
            <UserMenu />
          </div>
        </div>

        {/* Pinned Active SOS Broadcast Bar */}
        <SosActiveBar
          sosState={sosState}
          onOpenSosModal={() => setIsSosModalOpen(true)}
          onDeactivateSos={handleDeactivateSos}
          onToggleSiren={handleToggleSiren}
          onToggleStrobe={handleToggleStrobe}
        />

        {/* Full-Screen Night Rescue Strobe Overlay */}
        <RescueStrobeOverlay
          isActive={sosState.isStrobeActive}
          onClose={() => setSosState((prev) => ({ ...prev, isStrobeActive: false }))}
        />

        {/* Workspace Canvas Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Active Disaster Risk Alert Banner */}
          <RiskStatusBanner
            location={location}
            weather={weather}
            onViewEvacuationMap={() => {
              setActiveTab('map');
            }}
          />

          {/* Structured Telemetry Metric Strip */}
          <MetricStrip weather={weather} location={location} />

          {/* Tab View: Dashboard / Main Ops */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Telemetry Chart: Real SVG meteorological and rainfall model */}
              <TelemetryChart />

              {/* Role Badge (read-only — shows Firebase-assigned role) */}
              <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-mono uppercase text-slate-500 font-bold px-3">
                    {t.activeConsole}
                  </span>
                  <div className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white shadow-sm`}>
                    {role === 'citizen' ? t.citizenHub : role === 'authority' ? t.authorityOps : t.systemAdmin}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono ml-2">
                    Role assigned by Firebase Admin
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 pr-3">
                  <span>GPS Lock: <strong className="text-slate-900 font-semibold">{location.coords.lat.toFixed(4)}°N, {location.coords.lng.toFixed(4)}°E</strong></span>
                </div>
              </div>

              {/* Role-Specific Active Workspace */}
              {role === 'citizen' && (
                <CitizenInterface
                  onOpenSos={() => setIsSosModalOpen(true)}
                  isSosActive={sosState.isActive}
                  facilities={facilities}
                  onSelectFacility={(fac) => setSelectedFacilityForRoute(fac)}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  onOpenTools={() => setIsToolsModalOpen(true)}
                  location={location}
                  language={language}
                  incidents={incidents}
                  onUpvoteIncident={(id) => {
                    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, upvotes: inc.upvotes + 1 } : inc));
                  }}
                />
              )}

              {role === 'authority' && (
                <AuthorityInterface
                  location={location}
                  incidents={incidents}
                  onVerifyIncident={handleVerifyIncident}
                  language={language}
                />
              )}

              {role === 'admin' && (
                <AdminInterface
                  facilities={facilities}
                  onUpdateFacility={handleUpdateFacility}
                  language={language}
                />
              )}

            </div>
          )}

          {/* Tab View: Active Alerts */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <AlertsStream alerts={alerts} />
              <EmergencyServicesGrid location={location} />
            </div>
          )}

          {/* Tab View: Tactical Radar & Map */}
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

          {/* Tab View: Field Incidents */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <IncidentsFeed
                incidents={incidents}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onUpvoteIncident={(id) => {
                  setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, upvotes: inc.upvotes + 1 } : inc));
                }}
              />
            </div>
          )}

          {/* Tab View: Emergency Services */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <EmergencyServicesGrid location={location} />
            </div>
          )}

          {/* Tab View: Shelters, Hospitals & Blood Banks */}
          {activeTab === 'shelters' && (
            <div className="space-y-6">
              <SheltersHospitalsView
                facilities={facilities}
                onSelectFacilityForDirections={(fac) => setSelectedFacilityForRoute(fac)}
              />
            </div>
          )}

          {/* Tab View: Readiness & Tools */}
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

        {/* System Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div>RESQ Platform · National Emergency Response System v2.4.1</div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Offline Protocol Ready</span>
            <span>·</span>
            <span>Emergency Dispatch: <strong className="text-slate-900">112 / 911</strong></span>
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
        onToggleStrobe={handleToggleStrobe}
      />

      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        location={location}
        onSubmitIncident={handleAddIncident}
      />

      <DirectionsModal
        facility={selectedFacilityForRoute}
        onClose={() => setSelectedFacilityForRoute(null)}
        userLocation={location}
      />

      <EmergencyToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        location={location}
        onLaunchStrobe={() => setSosState((prev) => ({ ...prev, isStrobeActive: true }))}
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
