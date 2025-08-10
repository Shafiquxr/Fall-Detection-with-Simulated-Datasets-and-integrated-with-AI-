'use server';

/**
 * @fileOverview Determines the escalation path and timing for caregiver alerts based on caregiver availability, historical response times, and the severity of the detected fall.
 *
 * - determineAlertEscalation - A function that determines the escalation path.
 * - DetermineAlertEscalationInput - The input type for the determineAlertEscalation function.
 * - DetermineAlertEscalationOutput - The return type for the determineAlertEscalation function.
 */

import {ai} from '@/ai/genkit';
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
  return determineAlertEscalationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'determineAlertEscalationPrompt',
  input: {schema: DetermineAlertEscalationInputSchema},
  output: {schema: DetermineAlertEscalationOutputSchema},
  prompt: `You are an AI assistant that determines the optimal escalation path for caregiver alerts in a fall detection system.

  Given the following information:
  - Caregiver Availability: {{{caregiverAvailability}}}
  - Historical Response Times: {{{historicalResponseTimes}}}
  - Fall Severity: {{{fallSeverity}}}
  - Escalation Timeout: {{{escalationTimeout}}} seconds

  Determine the best order in which to alert the caregivers. Prioritize available caregivers with faster historical response times, and don't alert those unavailable.  The escalationPath should be an array containing the indices of the caregivers, starting with the first caregiver to alert.

  Considerations:
  - Higher severity falls may warrant a broader alert strategy, where more caregivers are notified sooner.
  - Unavailable caregivers should not be included in the escalation path.
  - Aim to minimize the time it takes for someone to respond to the alert, while avoiding unnecessary alerts.

  Output the escalation path as a JSON array.  For example, if caregiver 1 and 3 should be alerted in that order, the output should be [1, 3].`,
});

const determineAlertEscalationFlow = ai.defineFlow(
  {
    name: 'determineAlertEscalationFlow',
    inputSchema: DetermineAlertEscalationInputSchema,
    outputSchema: DetermineAlertEscalationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
