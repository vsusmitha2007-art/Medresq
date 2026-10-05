import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Hospital, Ambulance, PatientLocation } from '../types';
import { calculateDistanceKm, estimateDriveMinutes } from '../utils/emergencyEngine';
import { Crosshair, RefreshCw, Navigation } from 'lucide-react';

interface LeafletMapProps {
  patientLocation?: PatientLocation;
  hospitals: Hospital[];
  ambulances?: Ambulance[];
  selectedHospitalId?: string;
  onSelectHospital?: (hospitalId: string) => void;
  onViewHospital?: (hospitalId: string) => void;
  onLocateMe?: () => void;
  onMapClick?: (lat: number, lng: number) => void;
  heightClass?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  patientLocation,
  hospitals,
  ambulances = [],
  selectedHospitalId,
  onSelectHospital,
  onViewHospital,
  onLocateMe,
  onMapClick,
  heightClass = 'h-[480px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = patientLocation?.lat || 47.6101;
    const initialLng = patientLocation?.lng || -122.3364;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Map click event
    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Patient Marker (Pulsing Red HTML/SVG)
    if (patientLocation) {
      const patientIcon = L.divIcon({
        className: 'custom-patient-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-60 animate-ping"></span>
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white shadow-lg border-2 border-white font-bold text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const pMarker = L.marker([patientLocation.lat, patientLocation.lng], {
        icon: patientIcon,
        zIndexOffset: 1000,
      }).addTo(markersGroup);

      pMarker.bindPopup(`
        <div class="p-1 text-slate-800">
          <div class="flex items-center gap-1.5 mb-1 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            Emergency Patient Location
          </div>
          <p class="font-semibold text-sm mb-1">${patientLocation.address}</p>
          <div class="text-xs text-slate-500 font-mono">
            Lat: ${patientLocation.lat.toFixed(4)}, Lon: ${patientLocation.lng.toFixed(4)}
          </div>
          ${
            patientLocation.accuracyMeters
              ? `<div class="mt-1 text-xs text-slate-500">GPS Accuracy: ±${patientLocation.accuracyMeters}m</div>`
              : ''
          }
        </div>
      `);
    }

    // 2. Hospital Markers (SVG Hospital building with Availability Ring)
    hospitals.forEach((hosp) => {
      const isSelected = hosp.id === selectedHospitalId;
      const dist = patientLocation
        ? calculateDistanceKm(patientLocation.lat, patientLocation.lng, hosp.location.lat, hosp.location.lng)
        : 0;
      const driveMins = estimateDriveMinutes(dist);

      let ringColor = 'border-emerald-500 bg-emerald-50 text-emerald-700';
      let statusBg = 'bg-emerald-500';
      if (hosp.overallStatus === 'LIMITED') {
        ringColor = 'border-amber-500 bg-amber-50 text-amber-700';
        statusBg = 'bg-amber-500';
      } else if (hosp.overallStatus === 'FULL' || hosp.emergencyDeptStatus === 'DIVERTING') {
        ringColor = 'border-rose-500 bg-rose-50 text-rose-700';
        statusBg = 'bg-rose-500';
      }

      const hospIcon = L.divIcon({
        className: 'custom-hosp-marker',
        html: `
          <div class="relative group cursor-pointer">
            ${
              isSelected
                ? `<span class="absolute -inset-1 rounded-xl bg-blue-500/40 animate-pulse"></span>`
                : ''
            }
            <div class="relative flex items-center justify-center w-9 h-9 rounded-lg ${ringColor} border-2 shadow-md transition-transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v4"/>
                <path d="M14 8h-4"/>
                <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2"/>
                <path d="M6 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"/>
              </svg>
              <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusBg} border-2 border-white"></span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const hMarker = L.marker([hosp.location.lat, hosp.location.lng], {
        icon: hospIcon,
        zIndexOffset: isSelected ? 900 : 500,
      }).addTo(markersGroup);

      // Hospital Popup
      const popupDiv = document.createElement('div');
      popupDiv.className = 'w-64 text-slate-800 text-xs';
      popupDiv.innerHTML = `
        <div class="pb-2 border-b border-slate-100">
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <span class="font-bold text-sm text-slate-900 leading-snug">${hosp.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
              hosp.emergencyDeptStatus === 'OPEN'
                ? 'bg-emerald-100 text-emerald-800'
                : hosp.emergencyDeptStatus === 'LIMITED'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }">ED ${hosp.emergencyDeptStatus}</span>
          </div>
          <div class="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>${dist} km away</span>
            <span>·</span>
            <span>~${driveMins} mins</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 my-2.5 py-1 bg-slate-50 rounded p-2">
          <div>
            <span class="text-slate-500 block text-[10px]">ICU Beds</span>
            <span class="font-bold text-slate-900 ${
              hosp.resources.icuBeds.available > 0 ? 'text-emerald-700' : 'text-rose-600'
            }">${hosp.resources.icuBeds.available} / ${hosp.resources.icuBeds.total}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[10px]">Ventilators</span>
            <span class="font-bold text-slate-900 ${
              hosp.resources.ventilators.available > 0 ? 'text-emerald-700' : 'text-rose-600'
            }">${hosp.resources.ventilators.available} / ${hosp.resources.ventilators.total}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[10px]">Ambulances</span>
            <span class="font-bold text-slate-900">${hosp.resources.ambulances.available} / ${hosp.resources.ambulances.total}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[10px]">Blood Bank</span>
            <span class="font-bold text-[11px] ${
              hosp.resources.bloodBank === 'AVAILABLE' ? 'text-emerald-700' : 'text-amber-700'
            }">${hosp.resources.bloodBank}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2 pt-1 border-t border-slate-100">
          <button id="btn-select-${hosp.id}" class="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs text-center transition-colors">
            ${isSelected ? 'Selected ✓' : 'Select Hospital'}
          </button>
          <button id="btn-view-${hosp.id}" class="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs text-center transition-colors">
            Details
          </button>
        </div>
      `;

      hMarker.bindPopup(popupDiv);

      hMarker.on('popupopen', () => {
        const btnSelect = document.getElementById(`btn-select-${hosp.id}`);
        if (btnSelect && onSelectHospital) {
          btnSelect.onclick = () => {
            onSelectHospital(hosp.id);
            hMarker.closePopup();
          };
        }
        const btnView = document.getElementById(`btn-view-${hosp.id}`);
        if (btnView && onViewHospital) {
          btnView.onclick = () => {
            onViewHospital(hosp.id);
            hMarker.closePopup();
          };
        }
      });
    });

    // 3. Ambulance Markers
    ambulances.forEach((amb) => {
      let ambBg = 'bg-blue-500';
      if (amb.status === 'EN_ROUTE') ambBg = 'bg-amber-500';
      if (amb.status === 'MAINTENANCE') ambBg = 'bg-slate-400';

      const ambIcon = L.divIcon({
        className: 'custom-amb-marker',
        html: `
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full ${ambBg} text-white shadow-md border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 17h4"/>
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <path d="M9 17h6"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const aMarker = L.marker([amb.currentLocation.lat, amb.currentLocation.lng], {
        icon: ambIcon,
        zIndexOffset: 600,
      }).addTo(markersGroup);

      aMarker.bindPopup(`
        <div class="p-1 text-slate-800 text-xs">
          <div class="font-bold text-sm text-slate-900">${amb.vehicleNumber} (${amb.id})</div>
          <div class="text-slate-500 mb-1">${amb.hospitalName}</div>
          <div class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 mb-1">
            Status: ${amb.status}
          </div>
          <div class="text-slate-600 text-[11px]">${amb.equipmentLevel}</div>
        </div>
      `);
    });
  }, [patientLocation, hospitals, ambulances, selectedHospitalId, onSelectHospital, onViewHospital]);

  // Center on patient if coordinates change
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !patientLocation) return;
    mapInstanceRef.current.setView([patientLocation.lat, patientLocation.lng], 14, { animate: true });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className={`w-full ${heightClass}`} />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (onLocateMe) onLocateMe();
            handleRecenter();
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur shadow-md hover:bg-white text-slate-700 hover:text-blue-600 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
          title="HTML5 Geolocation Refresh"
        >
          <Crosshair className="w-3.5 h-3.5 text-rose-500" />
          <span>Locate Me</span>
        </button>

        <button
          type="button"
          onClick={handleRecenter}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur shadow-md hover:bg-white text-slate-700 hover:text-blue-600 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
          title="Recenter Map View"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-500" />
          <span>Center</span>
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg text-[11px] text-slate-600 border border-slate-200/80 shadow-sm">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          Patient
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Available Hospital
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          Limited
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          Diverting / Full
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          Ambulance
        </span>
      </div>
    </div>
  );
};
