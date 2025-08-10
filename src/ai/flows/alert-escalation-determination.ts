'use server';

/**
 * @fileOverview Determines the escalation path and timing for caregiver alerts based on caregiver availability, historical response times, and the severity of the detected fall.
 *
 * - determineAlertEscalation - A function that determines the escalation path.
 * - DetermineAlertEscalationInput - The input type for the determineAlertEscalation function.
 * - DetermineAlertEscalationOutput - The return type for the determineAlertEscalation function.
 */

import {z} from 'genkit';

const DetermineAlertEscalationInputSchema = z.object({
  caregiverAvailability: z
    .array(z.boolean())
    .describe('An array representing the availability of each caregiver (true if available, false otherwise).'),
  historicalResponseTimes: z
    .array(z.number())
    .describe('An array of historical response times (in seconds) for each caregiver.'),
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

export async function determineAlertEscalation(
  input: DetermineAlertEscalationInput
): Promise<DetermineAlertEscalationOutput> {
  const caregiversWithDetails = input.caregiverAvailability
    .map((isAvailable, index) => ({
      index,
      isAvailable,
      responseTime: input.historicalResponseTimes[index],
    }));

  const availableCaregivers = caregiversWithDetails.filter(c => c.isAvailable);

  availableCaregivers.sort((a, b) => a.responseTime - b.responseTime);

  const escalationPath = availableCaregivers.map(c => c.index);

  return { escalationPath };
}
