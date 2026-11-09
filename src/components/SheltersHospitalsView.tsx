import React, { useState } from 'react';
import { 
  Building2, 
  Navigation, 
  Phone, 
  Zap, 
  Droplet, 
  Dog, 
  Accessibility, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  HeartPulse
} from 'lucide-react';
import { Facility } from '../types/disaster';

interface SheltersHospitalsViewProps {
  facilities: Facility[];
  onSelectFacilityForDirections: (facility: Facility) => void;
}

export const SheltersHospitalsView: React.FC<SheltersHospitalsViewProps> = ({
  facilities,
  onSelectFacilityForDirections,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenerator, setFilterGenerator] = useState(false);
  const [filterPets, setFilterPets] = useState(false);
  const [filterAccessible, setFilterAccessible] = useState(false);

  const filtered = facilities.filter((f) => {
    if (filterType !== 'ALL' && f.type !== filterType) return false;
    if (filterGenerator && !f.features.backupGenerator) return false;
    if (filterPets && !f.features.petFriendly) return false;
    if (filterAccessible && !f.features.wheelchairAccessible) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.address.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: Facility['status']) => {
    switch (status) {
      case 'FULL':
        return { text: 'Full', class: 'text-red-700 bg-red-50 border-red-200' };
      case 'NEAR_CAPACITY':
        return { text: 'Near Capacity', class: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'OPEN':
      default:
        return { text: 'Available', class: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Header and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Nearby Shelters, Hospitals & Blood Banks
            </h3>
            <p className="text-xs text-slate-500">
              Live capacity monitoring, blood plasma stock & lower-risk route navigation
            </p>
          </div>
        </div>

        {/* Search input & Category buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search facility or road..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 w-48 sm:w-60"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {[
              { id: 'ALL', label: 'All Places' },
              { id: 'SHELTER', label: 'Shelters' },
              { id: 'HOSPITAL', label: 'Hospitals' },
              { id: 'BLOOD_BANK', label: 'Blood Banks' },
              { id: 'RELIEF_STATION', label: 'Relief Hubs' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                  filterType === t.id
                    ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature quick filters */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        <button
          onClick={() => setFilterGenerator(!filterGenerator)}
          className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            filterGenerator ? 'bg-slate-900 border-slate-900 text-white font-medium' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Generator Backup</span>
        </button>
        <button
          onClick={() => setFilterPets(!filterPets)}
          className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            filterPets ? 'bg-slate-900 border-slate-900 text-white font-medium' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Dog className="w-3 h-3" />
          <span>Pet Friendly</span>
        </button>
        <button
          onClick={() => setFilterAccessible(!filterAccessible)}
          className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            filterAccessible ? 'bg-slate-900 border-slate-900 text-white font-medium' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Accessibility className="w-3 h-3" />
          <span>Wheelchair Accessible</span>
        </button>
      </div>

      {/* Facility cards list */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
          No facilities match the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((fac) => {
            const statusInfo = getStatusBadge(fac.status);
            const occupancyPct = Math.round((fac.capacityUsed / fac.capacityTotal) * 100);
            const bedsLeft = fac.capacityTotal - fac.capacityUsed;

            return (
              <div
                key={fac.id}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-all flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-1">
                        <span className="font-mono uppercase font-semibold text-slate-500">
                          {fac.type === 'BLOOD_BANK' ? 'Blood & Plasma Bank' :
                           fac.type === 'SHELTER' ? 'Emergency Shelter' :
                           fac.type === 'HOSPITAL' ? 'Trauma Hospital' : 'Relief Supply Hub'}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-mono text-slate-900 font-semibold tabular-nums">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {fac.distanceKm} km away
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-500 font-mono">
                          <Clock className="w-3 h-3 opacity-70" />
                          {fac.driveTimeMin}m drive / {fac.walkTimeMin}m walk
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {fac.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fac.address}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded border uppercase shrink-0 ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </div>

                  {/* Blood stock cards if Blood Bank */}
                  {fac.bloodStock && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-red-600" />
                        <span>Verified Blood Inventory (Units in Stock):</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-center font-mono text-[11px] pt-1">
                        <div className="bg-slate-50 p-1 rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">O+</div>
                          <div className="font-bold text-slate-900">{fac.bloodStock['O+']}u</div>
                        </div>
                        <div className="bg-red-50 p-1 rounded border border-red-200">
                          <div className="text-[10px] text-red-700 font-bold">O-</div>
                          <div className="font-bold text-red-700">{fac.bloodStock['O-']}u</div>
                        </div>
                        <div className="bg-slate-50 p-1 rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">A+</div>
                          <div className="font-bold text-slate-900">{fac.bloodStock['A+']}u</div>
                        </div>
                        <div className="bg-slate-50 p-1 rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">B+</div>
                          <div className="font-bold text-slate-900">{fac.bloodStock['B+']}u</div>
                        </div>
                        <div className="bg-slate-50 p-1 rounded border border-slate-200">
                          <div className="text-[10px] text-slate-500">AB+</div>
                          <div className="font-bold text-slate-900">{fac.bloodStock['AB+']}u</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Capacity Bar if Shelter or Hospital */}
                  {fac.type !== 'BLOOD_BANK' && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-600">
                          Occupancy: <strong className="text-slate-900 tabular-nums">{fac.capacityUsed} / {fac.capacityTotal}</strong>
                        </span>
                        <span className={`font-semibold tabular-nums ${
                          occupancyPct > 85 ? 'text-red-600' : 'text-slate-900'
                        }`}>
                          {bedsLeft > 0 ? `${bedsLeft} spots left` : 'No spots left'} ({occupancyPct}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyPct > 85 ? 'bg-red-500' : 'bg-slate-700'
                          }`}
                          style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600 pt-1">
                    {fac.features.backupGenerator && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 text-slate-700 shadow-xs">
                        <Zap className="w-3 h-3 text-slate-500" /> Gen-Power
                      </span>
                    )}
                    {fac.features.cleanWater && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 text-slate-700 shadow-xs">
                        <Droplet className="w-3 h-3 text-slate-500" /> Clean Water
                      </span>
                    )}
                    {fac.features.medicalStaff && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 text-slate-700 shadow-xs">
                        <HeartPulse className="w-3 h-3 text-slate-500" /> Medical Staff
                      </span>
                    )}
                    {fac.features.petFriendly && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 text-slate-700 shadow-xs">
                        <Dog className="w-3 h-3 text-slate-500" /> Pet Friendly
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Navigation & Direct Call */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => onSelectFacilityForDirections(fac)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 text-slate-300" />
                    <span>Get Directions & Lower-Risk Route</span>
                  </button>

                  <a
                    href={`tel:${fac.phone}`}
                    className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title={`Call ${fac.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Call Hub</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
