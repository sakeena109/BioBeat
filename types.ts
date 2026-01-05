
export type ViewMode = 'vitals' | 'intelligence' | 'voice' | 'analytics' | 'settings' | 'profile';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: GroundingSource[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface VitalMetric {
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
}

export interface ChartData {
  time: string;
  bpm: number;
  spo2: number;
  temp: number;
  activity?: number;
}

export interface ActivityData {
  steps: number;
  calories: number;
  activeMinutes: number;
}
