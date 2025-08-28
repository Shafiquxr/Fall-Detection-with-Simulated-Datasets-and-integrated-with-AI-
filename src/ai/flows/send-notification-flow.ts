'use server';

/**
 * @fileOverview A secure backend flow to send notifications via Twilio.
 * 
 * - sendNotificationFlow - A function that sends SMS and initiates a voice call.
 * - SendNotificationInput - The input type for the sendNotificationFlow function.
 */

import { ai } from '@/ai/genkit';
import type { Flow } from 'genkit';
import { z } from 'genkit';
import Twilio from 'twilio';

export const SendNotificationInputSchema = z.object({
  phoneNumber: z.string().describe("The recipient's phone number in E.164 format."),
  message: z.string().describe('The text message to be sent.'),
  name: z.string().describe("The recipient's name."),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

export const sendNotificationFlow: Flow<SendNotificationInput> = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async (input) => {
    const { phoneNumber, message, name } = input;
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
        const errorMessage = "Twilio credentials are not configured in the environment variables.";
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }

    const client = new Twilio.Twilio(accountSid, authToken);
    const callMessage = `<Response><Say>Hello ${name}. This is an urgent message from Fall Wise. ${message}</Say></Response>`;

    try {
        // Send SMS
        await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber,
        });
        console.log(`Successfully sent SMS to ${phoneNumber}`);

        // Make Call
        await client.calls.create({
            twiml: callMessage,
            from: twilioPhoneNumber,
            to: phoneNumber,
        });
        console.log(`Successfully initiated call to ${phoneNumber}`);

        return { success: true, message: 'SMS and call initiated successfully.' };

    } catch (error: any) {
        console.error(`Failed to send notifications to ${phoneNumber}:`, error);
        return { success: false, message: `Twilio API Error: ${error.message}` };
    }
  }
);
