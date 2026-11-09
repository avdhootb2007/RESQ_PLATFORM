export type ThreatLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type DisasterCategory = 
  | 'FLOOD' 
  | 'CYCLONE' 
  | 'EARTHQUAKE' 
  | 'WILDFIRE' 
  | 'TSUNAMI' 
  | 'LANDSLIDE' 
  | 'SEVERE_STORM' 
  | 'EXTREME_HEAT';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface LocationData {
  regionName: string;
  zone: string;
  coords: {
    lat: number;
    lng: number;
  };
  accuracyMeters: number;
  elevationMeters: number;
  lastUpdated: string;
  threatLevel: ThreatLevel;
  primaryHazard: DisasterCategory;
  evacuationStatus: 'NORMAL' | 'ADVISORY' | 'VOLUNTARY' | 'MANDATORY';
  evacuationZone?: string;
}

export interface DisasterAlert {
  id: string;
  headline: string;
  severity: 'CRITICAL' | 'WARNING' | 'WATCH' | 'ADVISORY';
  category: DisasterCategory;
  issuedAt: string;
  expiresAt: string;
  affectedRadiusKm: number;
  sourceAuthority: string;
  summary: string;
  instructions: {
    do: string[];
    dont: string[];
  };
  audioWarningAvailable: boolean;
  translations?: {
    hi?: { headline: string; summary: string };
    mr?: { headline: string; summary: string };
  };
}

export interface WeatherData {
  temperatureC: number;
  condition: string;
  highC: number;
  lowC: number;
  humidityPct: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirection: string;
  barometricHpa: number;
  precipitationChancePct: number;
  precipitationAccumulationMm: number;
  aqi: number;
  aqiStatus: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  floodRiskScore: number; // 0 to 100
  uvIndex: number;
  hourlyForecast: Array<{
    hour: string;
    tempC: number;
    precipChance: number;
    windSpeed: number;
    condition: string;
  }>;
}

export interface EmergencyServiceContact {
  id: string;
  name: string;
  category: 'POLICE' | 'FIRE_RESCUE' | 'AMBULANCE' | 'DISASTER_FORCE' | 'COAST_GUARD' | 'POISON_CONTROL' | 'WOMEN_CHILD_HELPLINE';
  shortCode: string;
  fullPhone: string;
  status: 'ONLINE' | 'HIGH_DEMAND' | 'DISPATCH_READY';
  averageResponseMinutes: number;
  description: string;
  iconName: string;
}

export type FacilityType = 'SHELTER' | 'HOSPITAL' | 'RELIEF_STATION' | 'BLOOD_BANK';

export interface BloodStock {
  'O+': number;
  'O-': number;
  'A+': number;
  'B+': number;
  'AB+': number;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  distanceKm: number;
  driveTimeMin: number;
  walkTimeMin: number;
  coords: {
    lat: number;
    lng: number;
  };
  status: 'OPEN' | 'NEAR_CAPACITY' | 'FULL' | 'CLOSED';
  capacityTotal: number;
  capacityUsed: number;
  phone: string;
  bloodStock?: BloodStock;
  features: {
    backupGenerator: boolean;
    cleanWater: boolean;
    medicalStaff: boolean;
    petFriendly: boolean;
    wheelchairAccessible: boolean;
    pediatricCare?: boolean;
    traumaCare?: boolean;
    foodDaysStock: number;
  };
}

export interface CommunityIncident {
  id: string;
  title: string;
  category: 'ROAD_BLOCK' | 'FLOODING' | 'POWER_OUTAGE' | 'FIRE' | 'STRUCTURAL' | 'MEDICAL' | 'HAZARD' | 'LANDSLIDE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  locationName: string;
  coords: {
    lat: number;
    lng: number;
  };
  distanceKm: number;
  reportedAt: string;
  reportedBy: string;
  isVerified: boolean;
  upvotes: number;
  description: string;
  status?: 'SUBMITTED' | 'VERIFIED' | 'RESPONDING' | 'RESOLVED';
  photoUrl?: string;
  aiVerificationScore?: number; // 0-100
}

export interface ActiveSosState {
  isActive: boolean;
  beaconId: string | null;
  startedAt: string | null;
  emergencyType: string;
  coords: { lat: number; lng: number };
  bloodType: string;
  medicalNotes: string;
  contactsNotifiedCount: number;
  isSirenPlaying: boolean;
  isStrobeActive: boolean;
  workflowStage?: 'BROADCASTED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ON_SCENE';
  assignedUnit?: string;
  etaMinutes?: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  status: 'SAFE' | 'EVACUATING' | 'NEEDS_HELP' | 'OFFLINE';
  lastKnownLocation: string;
  batteryPct: number;
  lastUpdated: string;
  phone: string;
}

export interface ExplainableRiskAssessment {
  overallScore: number; // 0-100
  floodRiskPct: number;
  landslideRiskPct: number;
  heatwaveRiskPct: number;
  factors: Array<{
    name: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    value: string;
    description: string;
  }>;
  explanationText: string;
}

export interface IoTSensorStream {
  id: string;
  name: string;
  sensorType: 'SOIL_MOISTURE' | 'TERRAIN_TILT' | 'RIVER_LEVEL' | 'HEAT_INDEX';
  location: string;
  currentReading: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  trend: 'RISING' | 'STABLE' | 'FALLING';
}

export interface ClimateHealthRisk {
  id: string;
  hazardSource: 'FLOOD' | 'HEATWAVE' | 'CYCLONE';
  diseaseName: string;
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  transmissionVector: string;
  preventiveIndicators: string[];
  disclaimer: string;
}

export type LifecycleStage = 'PREDICT' | 'EXPLAIN' | 'ALERT' | 'REPORT' | 'RESPOND' | 'RECOVER';

export interface MultiOrgResource {
  id: string;
  orgName: string;
  orgType: 'AUTHORITY' | 'HOSPITAL' | 'NGO' | 'SUPPLIER';
  resourceCategory: 'DRINKING_WATER' | 'TRAUMA_KITS' | 'FOOD_RATIONS' | 'BLANKETS_COTS' | 'HEAVY_EQUIPMENT';
  availableQty: string;
  assignedToSector: string;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'DEPLOYED';
}
