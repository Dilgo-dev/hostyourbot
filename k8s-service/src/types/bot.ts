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
  userId?: string;
  workflowId?: string;
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
  userId?: string;
  workflowId?: string;
  createdAt: string;
  updatedAt?: string;
  uptime?: number;
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

export type UpdateStage = 'validation' | 'upload' | 'config' | 'restart' | 'complete' | 'error';

export interface BotDetailedStatus {
  stage: UpdateStage;
  deployment: {
    ready: boolean;
    replicas: {
      ready: number;
      total: number;
    };
    conditions: any[];
    generation?: number;
    observedGeneration?: number;
  };
  pods: Array<{
    name: string;
    phase: string;
    ready: boolean;
    restartCount: number;
    age?: number;
    containerState?: any;
  }>;
  configMap: {
    updated: boolean;
    lastModified: string;
  } | null;
}
