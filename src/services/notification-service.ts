
'use server';

import type { Caregiver, FallSeverity } from "@/lib/types";

// This is a mock service. In a real application, you would integrate
// with a service like Twilio to send SMS and make calls.
export async function sendNotification(caregiver: Caregiver, severity: FallSeverity): Promise<void> {
  console.log(`--- Notification Service ---`);
  
  const message = `URGENT: A '${severity}' severity fall has been detected. Please respond immediately.`;

  if (caregiver.contactMethods.sms && caregiver.phoneNumber) {
    console.log(`Simulating SMS to ${caregiver.name} at ${caregiver.phoneNumber}`);
    // In a real app, you'd have your SMS API call here.
    // e.g., twilio.messages.create({ to: caregiver.phoneNumber, from: 'your_twilio_number', body: message });
    console.log(`SMS Body: ${message}`);
  }

  if (caregiver.contactMethods.call && caregiver.phoneNumber) {
    console.log(`Simulating phone call to ${caregiver.name} at ${caregiver.phoneNumber}`);
    // In a real app, you'd have your Voice API call here.
    // e.g., twilio.calls.create({ to: caregiver.phoneNumber, from: 'your_twilio_number', twiml: '<Response><Say>${message}</Say></Response>' });
  }

  if (caregiver.contactMethods.app) {
    console.log(`Simulating in-app notification to ${caregiver.name}`);
  }

  console.log(`--- End Notification ---`);
  // This is a promise to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
}
