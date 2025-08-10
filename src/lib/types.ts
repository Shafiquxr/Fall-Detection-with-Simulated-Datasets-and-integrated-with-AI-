export type Caregiver = {
  id: string;
  name: string;
  avatarUrl: string;
  dataAiHint: string;
  isAvailable: boolean;
  contactMethods: {
    sms: boolean;
    call: boolean;
    app: boolean;
  };
  historicalResponseTime: number; // in seconds
};

export type FallSeverity = "low" | "medium" | "high";

export type AlertStatus = "idle" | "pending" | "active" | "acknowledged" | "error";

export type Escalation = {
  path: number[];
  currentIndex: number;
  timer: number;
};
