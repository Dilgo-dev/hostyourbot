import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../../../proto/mail.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const mailProto = grpc.loadPackageDefinition(packageDefinition).mail as any;

let client: any = null;

export const initMailGrpcClient = () => {
  const grpcUrl = process.env.MAIL_GRPC_URL || 'localhost:50053';

  client = new mailProto.MailService(
    grpcUrl,
    grpc.credentials.createInsecure()
  );

  console.log(`[gRPC] Mail client connecté à ${grpcUrl}`);
  return client;
};

export const getMailClient = () => {
  if (!client) {
    throw new Error('Mail gRPC client not initialized');
  }
  return client;
};

export interface WelcomeEmailRequest {
  to: string;
  user_name: string;
}

export interface PasswordResetEmailRequest {
  to: string;
  reset_link: string;
  user_name: string;
}

export interface NotificationEmailRequest {
  to: string;
  subject: string;
  message: string;
}

export interface CustomEmailRequest {
  to: string;
  subject: string;
  html_content: string;
  text_content: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  message_id: string;
}

export const sendWelcomeEmail = (request: WelcomeEmailRequest): Promise<EmailResponse> => {
  return new Promise((resolve, reject) => {
    const client = getMailClient();

    client.SendWelcomeEmail(request, (error: any, response: EmailResponse) => {
      if (error) {
        console.error('[gRPC] Erreur envoi email bienvenue:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

export const sendPasswordResetEmail = (request: PasswordResetEmailRequest): Promise<EmailResponse> => {
  return new Promise((resolve, reject) => {
    const client = getMailClient();

    client.SendPasswordResetEmail(request, (error: any, response: EmailResponse) => {
      if (error) {
        console.error('[gRPC] Erreur envoi email réinitialisation:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

export const sendNotificationEmail = (request: NotificationEmailRequest): Promise<EmailResponse> => {
  return new Promise((resolve, reject) => {
    const client = getMailClient();

    client.SendNotificationEmail(request, (error: any, response: EmailResponse) => {
      if (error) {
        console.error('[gRPC] Erreur envoi email notification:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

export const sendCustomEmail = (request: CustomEmailRequest): Promise<EmailResponse> => {
  return new Promise((resolve, reject) => {
    const client = getMailClient();

    client.SendCustomEmail(request, (error: any, response: EmailResponse) => {
      if (error) {
        console.error('[gRPC] Erreur envoi email personnalisé:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};
