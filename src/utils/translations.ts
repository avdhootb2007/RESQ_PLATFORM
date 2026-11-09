import { SupportedLanguage } from '../types/disaster';

export interface Translations {
  appName: string;
  appSub: string;
  emergencySos: string;
  sosActive: string;
  citizenHub: string;
  authorityOps: string;
  systemAdmin: string;
  activeConsole: string;
  riskStatus: string;
  realTimeAlerts: string;
  weatherInfo: string;
  emergencyServices: string;
  safePlaces: string;
  bloodBanks: string;
  userLocation: string;
  recentIncidents: string;
  familyGroup: string;
  climateHealth: string;
  explainableRisk: string;
  actionableGuidance: string;
  preDisaster: string;
  duringDisaster: string;
  postDisaster: string;
  iotSensors: string;
  multiOrg: string;
  closedLoop: string;
  directions: string;
  reportIncident: string;
  safeRoute: string;
  languageName: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'RESQ OS',
    appSub: 'Connected Communities: Unified Disaster Resilience & Response System',
    emergencySos: 'EMERGENCY SOS',
    sosActive: 'SOS BROADCASTING',
    citizenHub: 'Citizen Safety Hub',
    authorityOps: 'Authority Operations (EOC)',
    systemAdmin: 'Multi-Agency & Admin Grid',
    activeConsole: 'Active Console:',
    riskStatus: 'Disaster Risk Status',
    realTimeAlerts: 'Real-Time Hazard & Civil Alerts',
    weatherInfo: 'Meteorological & Telemetry Monitor',
    emergencyServices: 'Emergency Services & Hotlines',
    safePlaces: 'Nearby Shelters & Hospitals',
    bloodBanks: 'Regional Blood Banks & Plasma',
    userLocation: 'Current User Location',
    recentIncidents: 'Recent Field Incident Reports',
    familyGroup: 'Family Safety Group',
    climateHealth: 'Climate → Health Risk Awareness',
    explainableRisk: 'AI-Driven Explainable Risk Assessment',
    actionableGuidance: 'Actionable Disaster Guidance',
    preDisaster: 'Pre-Disaster Prep',
    duringDisaster: 'During-Disaster Action',
    postDisaster: 'Post-Disaster Recovery',
    iotSensors: 'Real-Time IoT Sensor Streams',
    multiOrg: 'Multi-Organization Resource Network',
    closedLoop: 'Closed-Loop Disaster Lifecycle',
    directions: 'Get Directions & Safe Route',
    reportIncident: 'Report Incident / Hazard',
    safeRoute: 'Lower-Risk Safe Route',
    languageName: 'English'
  },
  hi: {
    appName: 'रेस्क्यू (RESQ OS)',
    appSub: 'आपदा प्रबंधन और त्वरित नागरिक सहायता प्रणाली',
    emergencySos: 'आपातकालीन एसओएस (SOS)',
    sosActive: 'एसओएस प्रसारण सक्रिय',
    citizenHub: 'नागरिक सुरक्षा केंद्र',
    authorityOps: 'आपदा नियंत्रण कक्ष (EOC)',
    systemAdmin: 'प्रशासन एवं संसाधन नेटवर्क',
    activeConsole: 'सक्रिय कंसोल:',
    riskStatus: 'वर्तमान आपदा जोखिम स्तर',
    realTimeAlerts: 'रीयल-टाइम आपदा चेतावनी',
    weatherInfo: 'मौसम एवं वर्षा टेलीमेट्री',
    emergencyServices: 'आपातकालीन हेल्पलाइन नंबर',
    safePlaces: 'निकटतम राहत शिविर व अस्पताल',
    bloodBanks: 'रक्त बैंक एवं प्लाज्मा केंद्र',
    userLocation: 'नागरिक की वर्तमान जीपीएस स्थिति',
    recentIncidents: 'हालिया क्षेत्रीय घटनाएं व अवरोध',
    familyGroup: 'परिवार सुरक्षा समूह',
    climateHealth: 'मौसम → स्वास्थ्य जोखिम सलाह',
    explainableRisk: 'एआई-संचालित व्याख्यात्मक जोखिम स्कोर',
    actionableGuidance: 'कार्रवाई योग्य आपदा दिशानिर्देश',
    preDisaster: 'आपदा-पूर्व तैयारी',
    duringDisaster: 'आपदा के दौरान सुरक्षा',
    postDisaster: 'आपदा-पश्चात बहाली',
    iotSensors: 'आईओटी (IoT) भू-सेंसर स्ट्रीम',
    multiOrg: 'बहु-संगठन संसाधन समन्वय',
    closedLoop: 'बंद-लूप आपदा जीवन चक्र',
    directions: 'सुरक्षित मार्ग निर्देश प्राप्त करें',
    reportIncident: 'घटना / खतरे की सूचना दें',
    safeRoute: 'कम जोखिम वाला सुरक्षित रास्ता',
    languageName: 'हिंदी'
  },
  mr: {
    appName: 'रेस्क्यू (RESQ OS)',
    appSub: 'एकात्मिक आपत्ती निवारण आणि नागरिक सुरक्षा प्रणाली',
    emergencySos: 'तातडीचे एसओएस (SOS)',
    sosActive: 'एसओएस सक्रिय प्रक्षेपण',
    citizenHub: 'नागरिक सुरक्षा कक्ष',
    authorityOps: 'आपत्ती नियंत्रण केंद्र (EOC)',
    systemAdmin: 'प्रशासन व संस्था नेटवर्क',
    activeConsole: 'कार्यरत कंसोल:',
    riskStatus: 'सद्य आपत्ती धोका स्थिती',
    realTimeAlerts: 'थेट आपत्ती इशारे व सूचना',
    weatherInfo: 'हवामान व पर्जन्य टेलीमेट्री',
    emergencyServices: 'तातडीच्या सेवा व हेल्पलाईन',
    safePlaces: 'जवळचे मदत केंद्र व रुग्णालये',
    bloodBanks: 'रक्तपेढी व प्लाझ्मा साठा',
    userLocation: 'सध्याचे जीपीएस स्थान',
    recentIncidents: 'अलीकडील स्थानिक घटना व रस्ते बंद',
    familyGroup: 'कुटुंब सुरक्षा गट',
    climateHealth: 'हवामान → आरोग्य धोका मार्गदर्शन',
    explainableRisk: 'एआय-आधारित स्पष्टीकरणात्मक धोका गुण',
    actionableGuidance: 'प्रत्यक्ष कृतीयोग्य आपत्ती मार्गदर्शक',
    preDisaster: 'आपत्ती-पूर्व सज्जता',
    duringDisaster: 'आपत्ती दरम्यान कृती',
    postDisaster: 'आपत्ती-नंतर पूर्ववत करणे',
    iotSensors: 'थेट आयओटी (IoT) भू-सेंसर नोंदी',
    multiOrg: 'संस्थात्मक मदत समन्वय जाळे',
    closedLoop: 'आपत्ती व्यवस्थापन संपूर्ण चक्र',
    directions: 'सुरक्षित मार्गाचे दिशानिर्देश',
    reportIncident: 'घटनेची / धोक्याची नोंद करा',
    safeRoute: 'कमी धोक्याचा सुरक्षित मार्ग',
    languageName: 'मराठी'
  }
};
