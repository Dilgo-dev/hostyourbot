import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../../proto/logs.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const logsProto = grpc.loadPackageDefinition(packageDefinition).logs as any;

let client: any = null;

export const initLogsGrpcClient = () => {
  const grpcUrl = process.env.LOGS_GRPC_URL || 'localhost:50052';

  client = new logsProto.LogsService(
    grpcUrl,
    grpc.credentials.createInsecure()
  );

  console.log(`[gRPC] Logs client connected to ${grpcUrl}`);
  return client;
};

export const getLogsClient = () => {
  if (!client) {
    throw new Error('Logs gRPC client not initialized');
  }
  return client;
};

export interface CreateLogRequest {
  service_name: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, string>;
}

export const createLogViaGrpc = (request: CreateLogRequest): Promise<any> => {
  return new Promise((resolve, reject) => {
    const client = getLogsClient();

    client.CreateLog(request, (error: any, response: any) => {
      if (error) {
        console.error('[gRPC] Error creating log:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};
