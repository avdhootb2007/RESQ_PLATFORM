import { 
  LocationData, 
  DisasterAlert, 
  WeatherData, 
  EmergencyServiceContact, 
  Facility, 
  CommunityIncident,
  FamilyMember,
  ExplainableRiskAssessment,
  IoTSensorStream,
  ClimateHealthRisk,
  MultiOrgResource
} from '../types/disaster';

export interface RegionPreset {
  id: string;
  name: string;
  location: LocationData;
  weather: WeatherData;
  alerts: DisasterAlert[];
}

export const REGION_PRESETS: RegionPreset[] = [
  {
    id: 'coastal-metro',
    name: 'Coastal Bay District (Cyclone & Surge Watch)',
    location: {
      regionName: 'Bay Harbor & Southern Coastal Basin',
      zone: 'Zone 4 - Vulnerable Coastal Plain',
      coords: { lat: 18.9220, lng: 72.8347 },
      accuracyMeters: 6,
      elevationMeters: 4.2,
      lastUpdated: 'Just now',
      threatLevel: 'HIGH',
      primaryHazard: 'CYCLONE',
      evacuationStatus: 'VOLUNTARY',
      evacuationZone: 'Coastal Strip 100m - 500m inland'
    },
    weather: {
      temperatureC: 27.5,
      condition: 'Heavy Squall & Gale Winds',
      highC: 29.0,
      lowC: 24.5,
      humidityPct: 93,
      windSpeedKmh: 68,
      windGustKmh: 94,
      windDirection: 'SSW',
      barometricHpa: 988.4,
      precipitationChancePct: 95,
      precipitationAccumulationMm: 142.0,
      aqi: 24,
      aqiStatus: 'Good',
      floodRiskScore: 84,
      uvIndex: 1.2,
      hourlyForecast: [
        { hour: 'Now', tempC: 27, precipChance: 95, windSpeed: 68, condition: 'Squall' },
        { hour: '11:00', tempC: 26, precipChance: 98, windSpeed: 74, condition: 'Heavy Rain' },
        { hour: '12:00', tempC: 26, precipChance: 100, windSpeed: 82, condition: 'Storm Surge' },
        { hour: '13:00', tempC: 25, precipChance: 90, windSpeed: 78, condition: 'Torrential' },
        { hour: '14:00', tempC: 26, precipChance: 80, windSpeed: 65, condition: 'High Wind' },
        { hour: '15:00', tempC: 27, precipChance: 65, windSpeed: 52, condition: 'Showers' },
      ]
    },
    alerts: [
      {
        id: 'ALT-CYC-902',
        headline: 'Severe Cyclone Warning: Gale Winds & Tidal Inundation',
        severity: 'CRITICAL',
        category: 'CYCLONE',
        issuedAt: '42 mins ago',
        expiresAt: 'In 6 hours',
        affectedRadiusKm: 35,
        sourceAuthority: 'Met Office & National Disaster Management Authority',
        summary: 'Deep cyclonic system tracking 45km offshore. Coastal flooding and localized power disruption expected.',
        instructions: {
          do: [
            'Secure loose outdoor items, shutter windows, and unplug non-vital heavy appliances.',
            'Move emergency rations, potable water, medications, and vital documents above ground level.',
            'Keep portable radios and power banks fully charged; monitor local civil frequency 104.2 FM.'
          ],
          dont: [
            'Do not venture onto promenades, piers, sea-facing walls, or low bridges.',
            'Do not attempt to wade through flooded underpasses or fast-moving water courses.',
            'Do not touch sagging power cables or damaged transformer boxes.'
          ]
        },
        audioWarningAvailable: true,
        translations: {
          hi: {
            headline: 'गंभीर चक्रवात चेतावनी: तेज आंधी और ज्वार का खतरा',
            summary: 'तटीय क्षेत्र से 45 किमी दूर गहरा चक्रवाती तंत्र। बाढ़ और बिजली बाधित होने की संभावना।'
          },
          mr: {
            headline: 'तीव्र चक्रीवादळ इशारा: जोरदार वारे आणि समुद्राची भरती',
            summary: 'किनारपट्टीपासून 45 किमी अंतरावर चक्रीवादळ प्रणाली. पूर आणि वीजपुरवठा खंडित होण्याची शक्यता.'
          }
        }
      },
      {
        id: 'ALT-FLD-411',
        headline: 'Flash Flood Watch: Low-Lying Storm Drains Surcharged',
        severity: 'WARNING',
        category: 'FLOOD',
        issuedAt: '1 hr ago',
        expiresAt: 'In 4 hours',
        affectedRadiusKm: 18,
        sourceAuthority: 'Municipal Stormwater Command & River Basin Authority',
        summary: 'Tidal high water at 12:45 PM coincides with 50mm/hr rainfall band. Harbor lowlands at risk of standing water up to 0.7m.',
        instructions: {
          do: [
            'Relocate vehicles parked in underground or basement garages to higher terrain structures.',
            'Check on elderly neighbors and mobility-impaired residents on ground floors.'
          ],
          dont: [
            'Never drive through water where you cannot see the road markings (Turn Around, Don’t Drown).'
          ]
        },
        audioWarningAvailable: false,
        translations: {
          hi: {
            headline: 'अचानक बाढ़ का अलर्ट: निचले नाले उफान पर',
            summary: 'निचले इलाकों में 0.7 मीटर तक जलभराव की आशंका। बेसमेंट से वाहन हटा लें।'
          },
          mr: {
            headline: 'अचानक पुराचा इशारा: सखल भागातील नाले तुडुंब',
            summary: 'सखल भागात 0.7 मीटरपर्यंत पाणी साचण्याची शक्यता. सुरक्षित उंच ठिकाणी जावे.'
          }
        }
      }
    ]
  },
  {
    id: 'river-valley',
    name: 'River Valley Basin (Flash Flood Warning)',
    location: {
      regionName: 'Cedar River Valley & East Fork Basin',
      zone: 'Sector 2 - Floodplain Core',
      coords: { lat: 47.6062, lng: -122.3321 },
      accuracyMeters: 4,
      elevationMeters: 12.0,
      lastUpdated: '2 mins ago',
      threatLevel: 'CRITICAL',
      primaryHazard: 'FLOOD',
      evacuationStatus: 'MANDATORY',
      evacuationZone: 'Parcels bordering North Bank between Miles 14 and 22'
    },
    weather: {
      temperatureC: 13.8,
      condition: 'Torrential Continuous Downpour',
      highC: 15.0,
      lowC: 11.2,
      humidityPct: 98,
      windSpeedKmh: 34,
      windGustKmh: 52,
      windDirection: 'NW',
      barometricHpa: 996.1,
      precipitationChancePct: 100,
      precipitationAccumulationMm: 118.5,
      aqi: 18,
      aqiStatus: 'Good',
      floodRiskScore: 96,
      uvIndex: 0.8,
      hourlyForecast: [
        { hour: 'Now', tempC: 14, precipChance: 100, windSpeed: 34, condition: 'Heavy Rain' },
        { hour: '11:00', tempC: 14, precipChance: 100, windSpeed: 38, condition: 'Torrential' },
        { hour: '12:00', tempC: 13, precipChance: 95, windSpeed: 42, condition: 'Crest Peak' },
        { hour: '13:00', tempC: 13, precipChance: 85, windSpeed: 30, condition: 'Heavy Rain' },
        { hour: '14:00', tempC: 14, precipChance: 70, windSpeed: 25, condition: 'Showers' },
        { hour: '15:00', tempC: 14, precipChance: 55, windSpeed: 20, condition: 'Drizzle' },
      ]
    },
    alerts: [
      {
        id: 'ALT-FLD-880',
        headline: 'Mandatory Evacuation: Cedar River Cresting +3.2m Above Bankfull',
        severity: 'CRITICAL',
        category: 'FLOOD',
        issuedAt: '18 mins ago',
        expiresAt: 'In 8 hours',
        affectedRadiusKm: 22,
        sourceAuthority: 'County Emergency Management Bureau',
        summary: 'River gauge reports unprecedented rapid runoff. Levee inspection unit reports seepage near Old Mill bend.',
        instructions: {
          do: [
            'Evacuate immediately via Highway 9 East corridor toward Westview High School shelter.',
            'Turn off main gas shut-off valves and electricity breakers before leaving premises.',
            'Take prescription medications, warm waterproof clothing, phone chargers, and ID papers.'
          ],
          dont: [
            'Do not attempt to cross submerged creek bridges or ford walking paths.',
            'Do not return to retrieve belongings once order is issued.'
          ]
        },
        audioWarningAvailable: true
      }
    ]
  },
  {
    id: 'foothill-landslide',
    name: 'Ghat Foothill Corridor (Landslide & Cloudburst Risk)',
    location: {
      regionName: 'Western Ghats Ridge & Konkan Incline',
      zone: 'Sector 7 - Mountain Soil-Slip Incline',
      coords: { lat: 18.7500, lng: 73.4000 },
      accuracyMeters: 5,
      elevationMeters: 620.0,
      lastUpdated: '5 mins ago',
      threatLevel: 'HIGH',
      primaryHazard: 'LANDSLIDE',
      evacuationStatus: 'MANDATORY',
      evacuationZone: 'Steep hillside hamlets above 450m elevation'
    },
    weather: {
      temperatureC: 22.4,
      condition: 'Cloudburst & Ground Slope Saturation',
      highC: 24.0,
      lowC: 20.0,
      humidityPct: 99,
      windSpeedKmh: 42,
      windGustKmh: 64,
      windDirection: 'SW',
      barometricHpa: 994.0,
      precipitationChancePct: 100,
      precipitationAccumulationMm: 210.0,
      aqi: 12,
      aqiStatus: 'Good',
      floodRiskScore: 91,
      uvIndex: 0.5,
      hourlyForecast: [
        { hour: 'Now', tempC: 22, precipChance: 100, windSpeed: 42, condition: 'Cloudburst' },
        { hour: '11:00', tempC: 22, precipChance: 100, windSpeed: 45, condition: 'Heavy Rain' },
        { hour: '12:00', tempC: 21, precipChance: 95, windSpeed: 40, condition: 'Torrential' },
        { hour: '13:00', tempC: 22, precipChance: 85, windSpeed: 35, condition: 'Rain' },
        { hour: '14:00', tempC: 23, precipChance: 70, windSpeed: 28, condition: 'Showers' },
        { hour: '15:00', tempC: 23, precipChance: 60, windSpeed: 22, condition: 'Overcast' },
      ]
    },
    alerts: [
      {
        id: 'ALT-LND-301',
        headline: 'Critical Landslide Alert: Mountain Slope Tilt Shift Detected',
        severity: 'CRITICAL',
        category: 'LANDSLIDE',
        issuedAt: '12 mins ago',
        expiresAt: 'In 10 hours',
        affectedRadiusKm: 15,
        sourceAuthority: 'Geological Survey & State Disaster Management Authority',
        summary: 'IoT ground tilt sensor indicates 4.8° slope deflection following 210mm rainfall. Immediate evacuation of lower valley homes required.',
        instructions: {
          do: [
            'Move immediately away from slope bases, ravines, and natural drainage gullies.',
            'Listen for unusual sounds like trees cracking or boulders knocking together.',
            'Assemble at designated Ridge High Ground Community Hall.'
          ],
          dont: [
            'Do not cross road sections with active mudflow or fresh asphalt cracks.',
            'Do not enter bottom floors of hillside homes.'
          ]
        },
        audioWarningAvailable: true
      }
    ]
  }
];

export const EMERGENCY_SERVICES: EmergencyServiceContact[] = [
  {
    id: 'srv-police',
    name: 'Police & Civil Security',
    category: 'POLICE',
    shortCode: '112 / 911',
    fullPhone: 'tel:112',
    status: 'ONLINE',
    averageResponseMinutes: 7,
    description: 'Active patrol dispatch, perimeter security, evacuation escort, and critical law enforcement.',
    iconName: 'ShieldAlert'
  },
  {
    id: 'srv-fire',
    name: 'Fire & Rescue Command',
    category: 'FIRE_RESCUE',
    shortCode: '101 / 911',
    fullPhone: 'tel:101',
    status: 'ONLINE',
    averageResponseMinutes: 6,
    description: 'Structural extraction, swiftwater rescue, wildland containment, and chemical hazard triage.',
    iconName: 'Flame'
  },
  {
    id: 'srv-ambulance',
    name: 'Emergency Medical & Trauma EMS',
    category: 'AMBULANCE',
    shortCode: '102 / 911',
    fullPhone: 'tel:102',
    status: 'HIGH_DEMAND',
    averageResponseMinutes: 11,
    description: 'Advanced life support ambulances, field triage units, and direct emergency room hospital intake.',
    iconName: 'HeartPulse'
  },
  {
    id: 'srv-ndrf',
    name: 'Disaster Rapid Response Force (NDRF / SDRF)',
    category: 'DISASTER_FORCE',
    shortCode: '1070 / 1078',
    fullPhone: 'tel:1078',
    status: 'DISPATCH_READY',
    averageResponseMinutes: 18,
    description: 'Specialized heavy urban search & rescue, motorized inflatable flood boats, and helicopter extraction.',
    iconName: 'LifeBuoy'
  },
  {
    id: 'srv-coastguard',
    name: 'Coast Guard & Marine Rescue',
    category: 'COAST_GUARD',
    shortCode: '1554',
    fullPhone: 'tel:1554',
    status: 'ONLINE',
    averageResponseMinutes: 14,
    description: 'Offshore watercraft distress, harbor patrol, coastal levee inspection, and mariner rescue.',
    iconName: 'Anchor'
  },
  {
    id: 'srv-poison',
    name: 'Poison & Hazmat Advisory',
    category: 'POISON_CONTROL',
    shortCode: '1800-222-1222',
    fullPhone: 'tel:18002221222',
    status: 'ONLINE',
    averageResponseMinutes: 2,
    description: 'Chemical contamination, contaminated flood water ingestion, and dangerous toxin immediate guidance.',
    iconName: 'Biohazard'
  },
  {
    id: 'srv-women-child',
    name: 'Women & Child Safety Helpline',
    category: 'WOMEN_CHILD_HELPLINE',
    shortCode: '1091 / 1098',
    fullPhone: 'tel:1098',
    status: 'ONLINE',
    averageResponseMinutes: 5,
    description: 'Dedicated safe transit, child protection, vulnerable family crisis support, and specialized shelter beds.',
    iconName: 'Users'
  }
];

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'fac-1',
    name: 'Civic Center Evacuation Complex',
    type: 'SHELTER',
    address: '420 Harbor Blvd, Sector 3',
    distanceKm: 1.4,
    driveTimeMin: 6,
    walkTimeMin: 18,
    coords: { lat: 18.9280, lng: 72.8390 },
    status: 'OPEN',
    capacityTotal: 650,
    capacityUsed: 390,
    phone: '+1 (555) 432-8801',
    features: {
      backupGenerator: true,
      cleanWater: true,
      medicalStaff: true,
      petFriendly: true,
      wheelchairAccessible: true,
      foodDaysStock: 5
    }
  },
  {
    id: 'fac-2',
    name: 'Metro Memorial Hospital & Trauma Center',
    type: 'HOSPITAL',
    address: '88 Healthcare Parkway, District Medical Hub',
    distanceKm: 2.1,
    driveTimeMin: 8,
    walkTimeMin: 26,
    coords: { lat: 18.9180, lng: 72.8290 },
    status: 'NEAR_CAPACITY',
    capacityTotal: 340,
    capacityUsed: 298,
    phone: '+1 (555) 890-3322',
    features: {
      backupGenerator: true,
      cleanWater: true,
      medicalStaff: true,
      petFriendly: false,
      wheelchairAccessible: true,
      pediatricCare: true,
      traumaCare: true,
      foodDaysStock: 7
    }
  },
  {
    id: 'fac-bb-1',
    name: 'Central Red Cross Blood Bank & Plasma Reserve',
    type: 'BLOOD_BANK',
    address: '102 Medical Enclave, Sector 4',
    distanceKm: 2.4,
    driveTimeMin: 9,
    walkTimeMin: 28,
    coords: { lat: 18.9215, lng: 72.8315 },
    status: 'OPEN',
    capacityTotal: 500,
    capacityUsed: 380,
    phone: '+1 (555) 234-5500',
    bloodStock: {
      'O+': 42,
      'O-': 8,
      'A+': 36,
      'B+': 29,
      'AB+': 14
    },
    features: {
      backupGenerator: true,
      cleanWater: true,
      medicalStaff: true,
      petFriendly: false,
      wheelchairAccessible: true,
      foodDaysStock: 4
    }
  },
  {
    id: 'fac-3',
    name: 'St. Jude Community High School Shelter',
    type: 'SHELTER',
    address: '150 Pinecrest Avenue',
    distanceKm: 3.2,
    driveTimeMin: 12,
    walkTimeMin: 40,
    coords: { lat: 18.9350, lng: 72.8420 },
    status: 'OPEN',
    capacityTotal: 420,
    capacityUsed: 160,
    phone: '+1 (555) 330-1120',
    features: {
      backupGenerator: true,
      cleanWater: true,
      medicalStaff: false,
      petFriendly: true,
      wheelchairAccessible: true,
      foodDaysStock: 4
    }
  },
  {
    id: 'fac-4',
    name: 'Coastline Regional General Hospital',
    type: 'HOSPITAL',
    address: '210 Oceanway Drive',
    distanceKm: 4.6,
    driveTimeMin: 15,
    walkTimeMin: 58,
    coords: { lat: 18.9110, lng: 72.8220 },
    status: 'OPEN',
    capacityTotal: 280,
    capacityUsed: 195,
    phone: '+1 (555) 991-4477',
    features: {
      backupGenerator: true,
      cleanWater: true,
      medicalStaff: true,
      petFriendly: false,
      wheelchairAccessible: true,
      traumaCare: true,
      pediatricCare: true,
      foodDaysStock: 6
    }
  },
  {
    id: 'fac-bb-2',
    name: 'Apollo Lifeline Regional Blood Bank',
    type: 'BLOOD_BANK',
    address: '45 Emergency Cross, Avenue 9',
    distanceKm: 3.8,
    driveTimeMin: 13,
    walkTimeMin: 44,
    coords: { lat: 18.9150, lng: 72.8250 },
    status: 'NEAR_CAPACITY',
    capacityTotal: 300,
    capacityUsed: 275,
    phone: '+1 (555) 980-2211',
    bloodStock: {
      'O+': 18,
      'O-': 2,
      'A+': 22,
      'B+': 16,
      'AB+': 7
    },
    features: {
      backupGenerator: true,
      cleanWater: true,
      medicalStaff: true,
      petFriendly: false,
      wheelchairAccessible: true,
      foodDaysStock: 5
    }
  },
  {
    id: 'fac-5',
    name: 'Red Cross Relief & Clean Water Distribution Hub',
    type: 'RELIEF_STATION',
    address: 'Gate 4, Municipal Logistics Terminal',
    distanceKm: 2.8,
    driveTimeMin: 9,
    walkTimeMin: 34,
    coords: { lat: 18.9240, lng: 72.8480 },
    status: 'OPEN',
    capacityTotal: 1200,
    capacityUsed: 420,
    phone: '+1 (555) 774-2900',
    features: {
      backupGenerator: true,
      cleanWater: true,
      medicalStaff: true,
      petFriendly: true,
      wheelchairAccessible: true,
      foodDaysStock: 10
    }
  }
];

export const INITIAL_INCIDENTS: CommunityIncident[] = [
  {
    id: 'inc-101',
    title: 'Severe Underpass Submersion & Stalled Vehicle',
    category: 'FLOODING',
    severity: 'HIGH',
    locationName: '4th Avenue Railway Underpass, Sector 2',
    coords: { lat: 18.9250, lng: 72.8360 },
    distanceKm: 0.9,
    reportedAt: '14 mins ago',
    reportedBy: 'Civil Defense Volunteer #41',
    isVerified: true,
    upvotes: 28,
    status: 'VERIFIED',
    aiVerificationScore: 94,
    description: 'Water depth exceeds 0.9 meters. A minivan is stranded mid-passage. Municipal pumps arriving; entire road section closed.'
  },
  {
    id: 'inc-102',
    title: 'High-Voltage Power Pole Uprooted & Live Cable',
    category: 'HAZARD',
    severity: 'CRITICAL',
    locationName: 'Corner of Bayview St and 11th Cross',
    coords: { lat: 18.9210, lng: 72.8320 },
    distanceKm: 1.2,
    reportedAt: '28 mins ago',
    reportedBy: 'Resident Council Lead',
    isVerified: true,
    upvotes: 45,
    status: 'RESPONDING',
    aiVerificationScore: 98,
    description: 'Transformer line sparking on asphalt. Traffic blocked both ways. Grid operators informed to de-energize sub-circuit 3B.'
  },
  {
    id: 'inc-103',
    title: 'Hillside Mudslide & Debris Blocking Evacuation Lane',
    category: 'LANDSLIDE',
    severity: 'HIGH',
    locationName: 'Ghat Pass Mile 12, Upper Ridge Highway',
    coords: { lat: 18.9195, lng: 72.8305 },
    distanceKm: 1.8,
    reportedAt: '36 mins ago',
    reportedBy: 'Transport Scout #9',
    isVerified: true,
    upvotes: 31,
    status: 'VERIFIED',
    aiVerificationScore: 92,
    description: 'Roughly 40 tons of wet soil and boulders have collapsed across northbound lane. Bulldozer crew en route. Use South bypass.'
  },
  {
    id: 'inc-104',
    title: 'Fallen Banyan Tree Blocking Ambulance Access',
    category: 'ROAD_BLOCK',
    severity: 'MEDIUM',
    locationName: 'Oak Ridge Lane approaching Metro Hospital',
    coords: { lat: 18.9195, lng: 72.8305 },
    distanceKm: 1.8,
    reportedAt: '42 mins ago',
    reportedBy: 'Paramedic Crew 7',
    isVerified: true,
    upvotes: 19,
    status: 'RESPONDING',
    aiVerificationScore: 89,
    description: 'Chainsaw teams deployed. Detour active through University Boulevard side route.'
  }
];

// Feature 2: AI-Driven Explainable Risk Assessment
export const MOCK_EXPLAINABLE_RISK: ExplainableRiskAssessment = {
  overallScore: 84,
  floodRiskPct: 88,
  landslideRiskPct: 62,
  heatwaveRiskPct: 24,
  factors: [
    {
      name: 'Rainfall Accumulation Rate',
      impact: 'HIGH',
      value: '142 mm / 24h (Peak 45mm/h)',
      description: 'Intense precipitation exceeds the local storm sewer capacity by 240%.'
    },
    {
      name: 'Terrain & Elevation Incline',
      impact: 'HIGH',
      value: '4.2m AMSL (Lowland Basin)',
      description: 'Location sits in a low-lying coastal bowl with limited gravity runoff.'
    },
    {
      name: 'Soil Saturation (IoT Sensor)',
      impact: 'HIGH',
      value: '94% Waterlogged',
      description: 'Soil infiltration has reached zero capacity; 100% of new rainfall becomes surface runoff.'
    },
    {
      name: 'Population Density Exposure',
      impact: 'MEDIUM',
      value: '14,200 people / km²',
      description: 'High human settlement density increases vulnerability and transit bottleneck risks.'
    },
    {
      name: 'Historical Disaster Frequency',
      impact: 'MEDIUM',
      value: '3 Major Floods in 5 Years',
      description: 'Historical records confirm recurrent water accumulation at these coordinates.'
    }
  ],
  explanationText: 'Your risk score is 84/100 (HIGH). This is driven primarily by consecutive heavy rainfall (142mm) combining with low ground elevation (4.2m) and saturated topsoil (94%). Surface water is expected to pond up to 0.7m in low-lying corridors within the next 3 hours.'
};

// Feature 14: Family Safety Group
export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    name: 'Aarav Sharma',
    relation: 'Son',
    status: 'SAFE',
    lastKnownLocation: 'St. Jude High School Shelter (Room 4)',
    batteryPct: 84,
    lastUpdated: '12 mins ago',
    phone: '+91 98201 12345'
  },
  {
    id: 'fam-2',
    name: 'Meera Sharma',
    relation: 'Spouse',
    status: 'EVACUATING',
    lastKnownLocation: 'En route to Metro Hospital via Highland Blvd',
    batteryPct: 58,
    lastUpdated: '8 mins ago',
    phone: '+91 98201 54321'
  },
  {
    id: 'fam-3',
    name: 'Ramesh Sharma',
    relation: 'Elder / Father',
    status: 'SAFE',
    lastKnownLocation: 'Home (2nd Floor Apartment, Dry)',
    batteryPct: 91,
    lastUpdated: '4 mins ago',
    phone: '+91 98201 98765'
  }
];

// Feature 15: Climate -> Health Risk
export const MOCK_CLIMATE_HEALTH_RISKS: ClimateHealthRisk[] = [
  {
    id: 'chr-1',
    hazardSource: 'FLOOD',
    diseaseName: 'Waterborne Pathogens & Leptospirosis Risk',
    riskLevel: 'HIGH',
    transmissionVector: 'Contact of open cuts or mucosal membranes with stagnant flood water contaminated by urban runoff.',
    preventiveIndicators: [
      'Avoid wading through stagnant brown water without gumboots or waterproof footwear.',
      'Boil all municipal/tap water for minimum 3 minutes or use chlorine purification tablets.',
      'Wash feet and hands thoroughly with antiseptic soap immediately after any water contact.'
    ],
    disclaimer: 'Information is for prevention and awareness, not medical diagnosis. If you develop fever, calf pain, or nausea, consult a medical officer at nearest camp.'
  },
  {
    id: 'chr-2',
    hazardSource: 'HEATWAVE',
    diseaseName: 'Heat-Stress, Hyperthermia & Dehydration Advisory',
    riskLevel: 'MODERATE',
    transmissionVector: 'Prolonged exposure to ambient temperatures exceeding 38°C with high humidity inhibiting perspiration.',
    preventiveIndicators: [
      'Consume Oral Rehydration Salts (ORS) or electrolyte water at regular 45-minute intervals.',
      'Avoid direct midday sun exposure (11:00 AM - 3:30 PM); rest in shaded, ventilated zones.',
      'Drape a wet cloth around the back of the neck during high humidity spikes.'
    ],
    disclaimer: 'Information is for prevention and awareness, not medical diagnosis. Seek immediate emergency assistance if confusion or cessation of sweating occurs.'
  }
];

// Feature 3: IoT Sensor Streams
export const MOCK_IOT_SENSORS: IoTSensorStream[] = [
  {
    id: 'iot-1',
    name: 'Hillside Slope Soil-Moisture Gauge #3',
    sensorType: 'SOIL_MOISTURE',
    location: 'Ridge Mile 8 Incline',
    currentReading: '94% Saturation',
    status: 'CRITICAL',
    trend: 'RISING'
  },
  {
    id: 'iot-2',
    name: 'Landslide Acoustic Tilt Inclinometer #7',
    sensorType: 'TERRAIN_TILT',
    location: 'Upper Ghat Rockface Sector B',
    currentReading: '4.8° Deflection',
    status: 'WARNING',
    trend: 'RISING'
  },
  {
    id: 'iot-3',
    name: 'Cedar River Ultrasonic Crest Sensor #2',
    sensorType: 'RIVER_LEVEL',
    location: 'Central Bridge Pier',
    currentReading: '+3.15m Bankfull',
    status: 'CRITICAL',
    trend: 'RISING'
  },
  {
    id: 'iot-4',
    name: 'District Automated Weather Station #1',
    sensorType: 'HEAT_INDEX',
    location: 'Industrial Core Substation',
    currentReading: '39.4°C Apparent',
    status: 'NORMAL',
    trend: 'STABLE'
  }
];

// Feature 17: Actionable Disaster Guidance
export const ACTIONABLE_GUIDANCE = {
  PRE: [
    { title: '72-Hour Survival Go-Bag Verification', detail: 'Ensure water (3L/person), canned food, flashlight, medication, and waterproof documents are packed by your exit.' },
    { title: 'Anchor & Shutter Openings', detail: 'Fasten loose roof sheets, clear rain gutters, and position sandbags along low driveway thresholds.' },
    { title: 'Electrical Circuit Isolation', detail: 'Identify your main fuse board and prepare to cut mains power if water levels breach doorstep height.' }
  ],
  DURING: [
    { title: 'Move to Elevated Structural Levels', detail: 'Move family members to upper storeys. Avoid enclosed attics unless you have roof egress tools.' },
    { title: 'Maintain Radio Standby (104.2 FM / EAS)', detail: 'Cellular towers may load-shed. Battery-powered transceivers maintain emergency broadcast continuity.' },
    { title: 'Turn Around, Don’t Drown', detail: 'Never walk or drive into moving water: 15cm can sweep pedestrians away, 30cm displaces motor vehicles.' }
  ],
  POST: [
    { title: 'Electrical & Gas Leak Inspection', detail: 'Do not flip switches or light candles if you detect a sulfur or gas odor. Air out premises first.' },
    { title: 'Boil-Water Mandate Adherence', detail: 'Municipal pipelines often suffer back-siphonage during floods. Treat all drinking water.' },
    { title: 'Photograph Property Damage for Claims', detail: 'Take clear wide and detail photos of waterline marks and structural cracks before cleanup.' }
  ]
};

// Feature 10: Multi-Organization Network
export const MOCK_MULTI_ORG_RESOURCES: MultiOrgResource[] = [
  {
    id: 'res-1',
    orgName: 'National Disaster Response Force (NDRF)',
    orgType: 'AUTHORITY',
    resourceCategory: 'HEAVY_EQUIPMENT',
    availableQty: '12 Inflatable Zodiac Boats + 4 Excavators',
    assignedToSector: 'Sector 2 Floodplain Core',
    status: 'DEPLOYED'
  },
  {
    id: 'res-2',
    orgName: 'International Red Cross Committee',
    orgType: 'NGO',
    resourceCategory: 'DRINKING_WATER',
    availableQty: '25,000 Liters Potable Water Packs',
    assignedToSector: 'Zone 4 Coastal Basin',
    status: 'EN_ROUTE'
  },
  {
    id: 'res-3',
    orgName: 'Metro Memorial Hospital Blood Center',
    orgType: 'HOSPITAL',
    resourceCategory: 'TRAUMA_KITS',
    availableQty: '140 Advanced Trauma Packs + 80 Blood Units',
    assignedToSector: 'District Trauma Center Hub',
    status: 'AVAILABLE'
  },
  {
    id: 'res-4',
    orgName: 'Goonj Relief Disaster Logistics',
    orgType: 'NGO',
    resourceCategory: 'BLANKETS_COTS',
    availableQty: '1,800 Thermal Blankets & Foldable Cots',
    assignedToSector: 'Civic Center Shelter',
    status: 'DEPLOYED'
  },
  {
    id: 'res-5',
    orgName: 'Apex Food Processing & Wholesale Logistics',
    orgType: 'SUPPLIER',
    resourceCategory: 'FOOD_RATIONS',
    availableQty: '12,000 High-Calorie Dry Meal Kits',
    assignedToSector: 'Central Warehouse Hub',
    status: 'AVAILABLE'
  }
];

export const SURVIVAL_GUIDES = [
  {
    id: 'guide-flood',
    title: 'Flash Flood & Storm Surge Protocols',
    category: 'FLOOD',
    summary: 'Immediate actions when flood waters begin rising inside or around your perimeter.',
    keyPoints: [
      'Disconnect electrical circuit breakers before water reaches outlet heights.',
      'Never drive or walk into moving flood water: 15cm of flowing water can knock you down; 30cm floats passenger cars.',
      'If trapped in a building, climb to the highest level or roof. Avoid enclosed attics unless you have an axe/escape hatch.',
      'Signal for help using bright cloths, flashlights, or phone strobe.'
    ]
  },
  {
    id: 'guide-cyclone',
    title: 'Cyclone & Extreme Gale Survival',
    category: 'CYCLONE',
    summary: 'High-wind and flying debris protection procedures during eye and eye-wall passes.',
    keyPoints: [
      'Take shelter in an interior room (hallway, closet, bathroom) away from external glass windows.',
      'Lie underneath sturdy tables or wrap mattresses overhead if structural creaking occurs.',
      'Do not be fooled by the calm "Eye" of the storm: winds will rapidly return from the reverse direction with equal ferocity.',
      'Keep footwear on at all times in case broken glass or masonry collapses.'
    ]
  },
  {
    id: 'guide-landslide',
    title: 'Landslide & Mountain Slope Incline Egress',
    category: 'LANDSLIDE',
    summary: 'Immediate evacuation maneuvers when hillside soil shifts or waterlogged slopes buckle.',
    keyPoints: [
      'Move perpendicular to the slope slide path—never run straight downhill.',
      'Listen for sudden increases or decreases in creek flow and rumble sounds indicating debris flow.',
      'If escape is impossible, curl into a tight ball and protect your head with arms and heavy cushions.',
      'Stay away from slide areas after initial collapse—secondary slides can trigger for 48 hours.'
    ]
  },
  {
    id: 'guide-firstaid',
    title: 'Emergency First-Aid Essentials',
    category: 'MEDICAL' as any,
    summary: 'Life-saving maneuvers before ambulance medical crews can access remote or flooded sectors.',
    keyPoints: [
      'Severe Bleeding: Apply continuous firm direct pressure with clean cloth. Elevate limb if no fracture is suspected. Do not remove saturated pads; add more on top.',
      'Adult CPR: 30 rapid chest compressions (100–120 bpm, 5cm depth) followed by 2 rescue breaths. Continue uninterrupted.',
      'Shock Management: Keep patient warm with blankets, elevate legs 30cm if conscious and uninjured, speak calmly.',
      'Chemical/Contaminated Water Exposure: Flush eyes and skin with clean bottled water for at least 15 minutes.'
    ]
  }
];

export const EMERGENCY_KIT_ITEMS = [
  { id: 'kit-1', name: 'Potable Drinking Water (3L per person/day for 3 days)', category: 'Supplies', isPacked: true },
  { id: 'kit-2', name: 'Non-perishable canned food & manual can opener', category: 'Supplies', isPacked: true },
  { id: 'kit-3', name: 'Battery / Hand-crank emergency radio & extra batteries', category: 'Communications', isPacked: true },
  { id: 'kit-4', name: 'High-lumen LED flashlight & waterproof matches', category: 'Hardware', isPacked: true },
  { id: 'kit-5', name: 'Comprehensive First Aid Kit & prescription medications', category: 'Medical', isPacked: true },
  { id: 'kit-6', name: 'Emergency whistle & signal mirror', category: 'Signaling', isPacked: false },
  { id: 'kit-7', name: 'Heavy-duty power bank (20,000mAh) + waterproof cables', category: 'Communications', isPacked: true },
  { id: 'kit-8', name: 'Copies of personal IDs, insurance & deeds in ziplock', category: 'Documents', isPacked: false },
  { id: 'kit-9', name: 'N95 dust/smoke masks (minimum 2 per family member)', category: 'Safety', isPacked: true },
  { id: 'kit-10', name: 'Emergency thermal space blankets & rain ponchos', category: 'Warmth', isPacked: false },
];
