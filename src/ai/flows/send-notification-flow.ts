
'use server';

/**
 * @fileOverview A secure backend flow to send notifications via Twilio.
 * 
 * - sendNotification - An async function that sends SMS and initiates a voice call.
 */

import { ai } from '@/ai/genkit';
import { SendNotificationInputSchema, type SendNotificationInput } from '@/lib/types';
import { z } from 'genkit';
import Twilio from 'twilio';

const sendNotificationFlow = ai.defineFlow(
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


export async function sendNotification(input: SendNotificationInput) {
    return await sendNotificationFlow(input);
}
