import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { MailService } from '../services/mailService';

const PROTO_PATH = path.join(__dirname, '../../proto/mail.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const mailProto = grpc.loadPackageDefinition(packageDefinition).mail as any;

const mailService = new MailService();

interface WelcomeEmailRequest {
  to: string;
  user_name: string;
}

interface PasswordResetEmailRequest {
  to: string;
  reset_link: string;
  user_name: string;
}

interface NotificationEmailRequest {
  to: string;
  subject: string;
  message: string;
}

interface CustomEmailRequest {
  to: string;
  subject: string;
  html_content: string;
  text_content: string;
}

const sendWelcomeEmail = async (
  call: grpc.ServerUnaryCall<WelcomeEmailRequest, any>,
  callback: grpc.sendUnaryData<any>
) => {
  try {
    const { to, user_name } = call.request;
    const result = await mailService.sendWelcomeEmail(to, user_name);

    callback(null, {
      success: result.success,
      message: result.success ? 'Welcome email sent successfully' : result.error || 'Failed to send email',
      message_id: result.messageId || '',
    });
  } catch (error) {
    console.error('[gRPC] Error in sendWelcomeEmail:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: (error as Error).message,
    });
  }
};

const sendPasswordResetEmail = async (
  call: grpc.ServerUnaryCall<PasswordResetEmailRequest, any>,
  callback: grpc.sendUnaryData<any>
) => {
  try {
    const { to, reset_link, user_name } = call.request;
    const result = await mailService.sendPasswordResetEmail(to, reset_link, user_name);

    callback(null, {
      success: result.success,
      message: result.success ? 'Password reset email sent successfully' : result.error || 'Failed to send email',
      message_id: result.messageId || '',
    });
  } catch (error) {
    console.error('[gRPC] Error in sendPasswordResetEmail:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: (error as Error).message,
    });
  }
};

const sendNotificationEmail = async (
  call: grpc.ServerUnaryCall<NotificationEmailRequest, any>,
  callback: grpc.sendUnaryData<any>
) => {
  try {
    const { to, subject, message } = call.request;
    const result = await mailService.sendNotificationEmail(to, subject, message);

    callback(null, {
      success: result.success,
      message: result.success ? 'Notification email sent successfully' : result.error || 'Failed to send email',
      message_id: result.messageId || '',
    });
  } catch (error) {
    console.error('[gRPC] Error in sendNotificationEmail:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: (error as Error).message,
    });
  }
};

const sendCustomEmail = async (
  call: grpc.ServerUnaryCall<CustomEmailRequest, any>,
  callback: grpc.sendUnaryData<any>
) => {
  try {
    const { to, subject, html_content, text_content } = call.request;
    const result = await mailService.sendCustomEmail(to, subject, html_content, text_content);

    callback(null, {
      success: result.success,
      message: result.success ? 'Custom email sent successfully' : result.error || 'Failed to send email',
      message_id: result.messageId || '',
    });
  } catch (error) {
    console.error('[gRPC] Error in sendCustomEmail:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: (error as Error).message,
    });
  }
};

export const startGrpcServer = (port: number): grpc.Server => {
  const server = new grpc.Server();

  server.addService(mailProto.MailService.service, {
    SendWelcomeEmail: sendWelcomeEmail,
    SendPasswordResetEmail: sendPasswordResetEmail,
    SendNotificationEmail: sendNotificationEmail,
    SendCustomEmail: sendCustomEmail,
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('[gRPC] Erreur lors du démarrage du serveur:', error);
        return;
      }
      console.log(`[gRPC] Mail service démarré sur le port ${port}`);
    }
  );

  return server;
};
