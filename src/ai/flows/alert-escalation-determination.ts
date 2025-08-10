'use server';

/**
 * @fileOverview Determines the escalation path and timing for caregiver alerts based on caregiver proximity, availability, and historical response times.
 *
 * - determineAlertEscalation - A function that determines the escalation path.
 * - DetermineAlertEscalationInput - The input type for the determineAlertEscalation function.
 * - DetermineAlertEscalationOutput - The return type for the determineAlertEscalation function.
 */

import {z} from 'genkit';

const LocationSchema = z.object({
    lat: z.number(),
    lng: z.number(),
  });
  
const DetermineAlertEscalationInputSchema = z.object({
  caregiverAvailability: z
    .array(z.boolean())
    .describe('An array representing the availability of each caregiver (true if available, false otherwise).'),
  caregiverLocations: z.array(LocationSchema).describe('An array of caregiver locations.'),
  historicalResponseTimes: z
    .array(z.number())
    .describe('An array of historical response times (in seconds) for each caregiver.'),
  fallLocation: LocationSchema.describe('The location where the fall occurred.'),
  fallSeverity: z.enum(['low', 'medium', 'high']).describe('The severity of the detected fall.'),
  escalationTimeout: z
    .number()
    .default(9)
    .describe(
      'The number of seconds to wait for a response from a caregiver before escalating to the next one.'
    ),
});
export type DetermineAlertEscalationInput = z.infer<typeof DetermineAlertEscalationInputSchema>;

const DetermineAlertEscalationOutputSchema = z.object({
  escalationPath: z
    .array(z.number())
    .describe(
      'An array representing the order in which caregivers should be alerted, with each number representing the index in the caregiverAvailability array.'
    ),
});
export type DetermineAlertEscalationOutput = z.infer<typeof DetermineAlertEscalationOutputSchema>;

// Haversine formula to calculate distance between two lat/lng points
const getDistance = (loc1: {lat: number, lng: number}, loc2: {lat: number, lng: number}) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc1.lat * (Math.PI / 180)) *
        Math.cos(loc2.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

export async function determineAlertEscalation(
  input: DetermineAlertEscalationInput
): Promise<DetermineAlertEscalationOutput> {
  const caregiversWithDetails = input.caregiverAvailability
    .map((isAvailable, index) => ({
      index,
      isAvailable,
      location: input.caregiverLocations[index],
      responseTime: input.historicalResponseTimes[index],
      distance: getDistance(input.fallLocation, input.caregiverLocations[index])
    }));

  const availableCaregivers = caregiversWithDetails.filter(c => c.isAvailable);

  // Sort by distance (primary) and response time (secondary)
  availableCaregivers.sort((a, b) => {
    if (a.distance < b.distance) return -1;
    if (a.distance > b.distance) return 1;
    return a.responseTime - b.responseTime;
  });

  const escalationPath = availableCaregivers.map(c => c.index);

  return { escalationPath };
}
