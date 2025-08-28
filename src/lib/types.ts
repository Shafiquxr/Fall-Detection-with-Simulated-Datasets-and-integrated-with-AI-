import { z } from 'zod';

export type Caregiver = {
  id: string;
  name: string;
  isAvailable: boolean;
  contactMethods: {
    sms: boolean;
    call: boolean;
    app: boolean;
  };
  historicalResponseTime: number; // in seconds
  phoneNumber?: string;
  location: Location;
};

export type FallSeverity = "low" | "medium" | "high";

export type AlertStatus = "idle" | "pending" | "active" | "acknowledged" | "error";

export type Escalation = {
  path: number[];
  currentIndex: number;
  timer: number;
};

export type Location = {
  lat: number;
  lng: number;
};

export type CommunicationStatus = "idle" | "calling" | "active" | "ended";

export const SendNotificationInputSchema = z.object({
  phoneNumber: z.string().describe("The recipient's phone number in E.164 format."),
  message: z.string().describe('The text message to be sent.'),
  name: z.string().describe("The recipient's name."),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;
