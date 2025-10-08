export enum BotType {
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
  SLACK = 'slack',
  CUSTOM = 'custom',
}

export enum BotStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error',
  UNKNOWN = 'unknown',
}

export interface EnvVar {
  key: string;
  value: string;
}

export interface BotConfig {
  name: string;
  language: string;
  version: string;
  image: string;
  startCommand?: string;
  zipFileBase64?: string;
  env?: EnvVar[];
  port?: number;
}

export interface Bot {
  id: string;
  name: string;
  language: string;
  version: string;
  status: BotStatus;
  namespace: string;
  image: string;
  replicas: number;
  createdAt: string;
  updatedAt?: string;
  podInfo?: {
    ready: number;
    total: number;
    phase?: string;
  };
}

export interface BotDeploymentRequest {
  name: string;
  language: string;
  version: string;
  envVars: string;
}

export interface BotScaleRequest {
  replicas: number;
}
