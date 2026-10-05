import { Hospital, PatientLocation } from '../types';

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Estimates travel time in minutes assuming average urban emergency transit speed (36 km/h)
 */
export function estimateDriveMinutes(distanceKm: number): number {
  const speedKmPerMin = 36 / 60; // 0.6 km per min
  const transitTime = distanceKm / speedKmPerMin;
  const turnaround = 2; // base dispatch & traffic buffer
  return Math.max(2, Math.round(transitTime + turnaround));
}

export interface HospitalRecommendation {
  hospital: Hospital;
  distanceKm: number;
  driveMinutes: number;
  matchScore: number; // 0 - 100
  matchGrade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'UNSUITABLE';
  reasons: string[];
  missingResources: string[];
}

/**
 * Transparent rule-based hospital matching engine.
 * Transparently weights:
 * 1. Physical proximity (Distance)
 * 2. Emergency Department operational status (OPEN > LIMITED > DIVERTING > CLOSED)
 * 3. Required resource availability (ICU, Ventilator, Blood Bank, Ambulance)
 *
 * NOTE: Explicitly rule-based resource matching; does NOT make medical diagnoses.
 */
export function rankHospitalsForEmergency(
  hospitals: Hospital[],
  patientLocation: PatientLocation,
  requiredResources: string[] = []
): HospitalRecommendation[] {
  const results: HospitalRecommendation[] = hospitals.map((hosp) => {
    const dist = calculateDistanceKm(
      patientLocation.lat,
      patientLocation.lng,
      hosp.location.lat,
      hosp.location.lng
    );
    const driveTime = estimateDriveMinutes(dist);

    let score = 100;
    const reasons: string[] = [];
    const missingResources: string[] = [];

    // 1. Proximity penalty: 5 points lost per km
    const distPenalty = Math.min(40, dist * 5);
    score -= distPenalty;
    reasons.push(`${dist} km transit distance (~${driveTime} mins)`);

    // 2. Emergency Dept status
    if (hosp.emergencyDeptStatus === 'OPEN') {
      reasons.push('Emergency Department is fully operational');
    } else if (hosp.emergencyDeptStatus === 'LIMITED') {
      score -= 20;
      reasons.push('Emergency Department on limited capacity intake');
    } else if (hosp.emergencyDeptStatus === 'DIVERTING') {
      score -= 50;
      missingResources.push('Hospital is on diversion status');
    } else if (hosp.emergencyDeptStatus === 'CLOSED') {
      score -= 80;
      missingResources.push('Emergency Department closed');
    }

    // 3. Required resources checks
    const reqLower = requiredResources.map((r) => r.toLowerCase());

    // ICU check
    if (reqLower.some((r) => r.includes('icu'))) {
      if (hosp.resources.icuBeds.available >= 3) {
        score += 15;
        reasons.push(`Strong ICU availability (${hosp.resources.icuBeds.available}/${hosp.resources.icuBeds.total} beds free)`);
      } else if (hosp.resources.icuBeds.available > 0) {
        score += 5;
        reasons.push(`Limited ICU beds (${hosp.resources.icuBeds.available} available)`);
      } else {
        score -= 40;
        missingResources.push('No available ICU beds');
      }
    }

    // Ventilator check
    if (reqLower.some((r) => r.includes('vent'))) {
      if (hosp.resources.ventilators.available >= 2) {
        score += 10;
        reasons.push(`Ventilators available (${hosp.resources.ventilators.available} units)`);
      } else if (hosp.resources.ventilators.available > 0) {
        reasons.push(`1 ventilator remaining`);
      } else {
        score -= 30;
        missingResources.push('Zero mechanical ventilators available');
      }
    }

    // Blood bank check
    if (reqLower.some((r) => r.includes('blood'))) {
      if (hosp.resources.bloodBank === 'AVAILABLE') {
        score += 10;
        reasons.push('Blood bank fully stocked');
      } else if (hosp.resources.bloodBank === 'LIMITED') {
        score -= 10;
        missingResources.push('Blood bank supplies restricted');
      } else {
        score -= 35;
        missingResources.push('Critical blood bank shortage');
      }
    }

    // Ambulance check
    if (reqLower.some((r) => r.includes('ambulance'))) {
      if (hosp.resources.ambulances.available > 0) {
        reasons.push(`${hosp.resources.ambulances.available} ambulance units on standby`);
      } else {
        score -= 15;
        missingResources.push('No on-site ambulance units free');
      }
    }

    // Operating rooms check for trauma
    if (hosp.resources.operatingRooms.available > 0) {
      score += 5;
      reasons.push(`${hosp.resources.operatingRooms.available} operating rooms ready`);
    }

    // Clamp score
    const clampedScore = Math.max(5, Math.min(99, Math.round(score)));

    let matchGrade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'UNSUITABLE' = 'FAIR';
    if (clampedScore >= 80 && missingResources.length === 0) {
      matchGrade = 'EXCELLENT';
    } else if (clampedScore >= 65 && missingResources.length <= 1) {
      matchGrade = 'GOOD';
    } else if (clampedScore >= 45) {
      matchGrade = 'FAIR';
    } else {
      matchGrade = 'UNSUITABLE';
    }

    const hospitalWithDist: Hospital = {
      ...hosp,
      distanceKm: dist,
      estimatedDriveMinutes: driveTime,
    };

    return {
      hospital: hospitalWithDist,
      distanceKm: dist,
      driveMinutes: driveTime,
      matchScore: clampedScore,
      matchGrade,
      reasons,
      missingResources,
    };
  });

  // Sort descending by matchScore
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Format timestamps cleanly with date and 12h clock
 */
export function formatTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return isoString;
  }
}
