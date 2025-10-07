import { createLogViaGrpc, CreateLogRequest } from '../grpc/logsGrpcClient';

const SERVICE_NAME = 'auth-service';

export const logInfo = async (message: string, metadata?: Record<string, string>): Promise<void> => {
  try {
    const request: CreateLogRequest = {
      service_name: SERVICE_NAME,
      level: 'info',
      message,
      metadata,
    };

    await createLogViaGrpc(request);
  } catch (error) {
    console.error('[Logger] Failed to send info log:', error);
  }
};

export const logWarn = async (message: string, metadata?: Record<string, string>): Promise<void> => {
  try {
    const request: CreateLogRequest = {
      service_name: SERVICE_NAME,
      level: 'warn',
      message,
      metadata,
    };

    await createLogViaGrpc(request);
  } catch (error) {
    console.error('[Logger] Failed to send warn log:', error);
  }
};

export const logError = async (message: string, metadata?: Record<string, string>): Promise<void> => {
  try {
    const request: CreateLogRequest = {
      service_name: SERVICE_NAME,
      level: 'error',
      message,
      metadata,
    };

    await createLogViaGrpc(request);
  } catch (error) {
    console.error('[Logger] Failed to send error log:', error);
  }
};

export const logDebug = async (message: string, metadata?: Record<string, string>): Promise<void> => {
  try {
    const request: CreateLogRequest = {
      service_name: SERVICE_NAME,
      level: 'debug',
      message,
      metadata,
    };

    await createLogViaGrpc(request);
  } catch (error) {
    console.error('[Logger] Failed to send debug log:', error);
  }
};
