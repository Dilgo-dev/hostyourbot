import { MailService } from './mailService';
import nodemailer from 'nodemailer';
import fs from 'fs';

const sendMailMock = jest.fn();
const verifyMock = jest.fn();

jest.mock('nodemailer', () => {
  const createTransportMock = jest.fn(() => ({
    sendMail: sendMailMock,
    verify: verifyMock
  }));
  return {
    __esModule: true,
    default: {
      createTransport: createTransportMock
    },
    createTransport: createTransportMock
  };
});

const nodemailerModule = nodemailer as unknown as {
  createTransport: jest.Mock;
};

jest.mock('fs', () => ({
  readFileSync: jest.fn()
}));

jest.mock('../config/env', () => ({
  config: {
    environment: 'test',
    grpcPort: 50053,
    smtp: {
      host: 'smtp.test',
      port: 587,
      secure: false,
      user: 'user',
      password: 'pass',
      from: 'no-reply@test.app'
    }
  }
}));

const readFileSyncMock = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;

describe('MailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendMailMock.mockReset();
    verifyMock.mockReset();
    nodemailerModule.createTransport.mockClear();
    readFileSyncMock.mockReset();
    verifyMock.mockResolvedValue(undefined);
  });

  it('envoie un email de bienvenue avec un template rendu', async () => {
    readFileSyncMock.mockReturnValue('Bonjour {{userName}} sur {{appUrl}}');
    sendMailMock.mockResolvedValue({ messageId: 'message-1' });
    const service = new MailService();
    const result = await service.sendWelcomeEmail('user@test.app', 'Alice');
    expect(nodemailerModule.createTransport).toHaveBeenCalledWith({
      host: 'smtp.test',
      port: 587,
      secure: false,
      auth: {
        user: 'user',
        pass: 'pass'
      }
    });
    expect(readFileSyncMock).toHaveBeenCalledWith(expect.stringContaining('welcome.html'), 'utf-8');
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'no-reply@test.app',
      to: 'user@test.app',
      subject: 'Bienvenue sur HostYourBot',
      html: 'Bonjour Alice sur https://hostyourbot.app'
    });
    expect(result).toEqual({ success: true, messageId: 'message-1' });
  });

  it('envoie un email de réinitialisation avec les données injectées', async () => {
    readFileSyncMock.mockReturnValue('Bonjour {{userName}}, lien {{resetLink}}');
    sendMailMock.mockResolvedValue({ messageId: 'message-2' });
    const service = new MailService();
    const result = await service.sendPasswordResetEmail('user@test.app', 'https://reset', 'Bob');
    expect(readFileSyncMock).toHaveBeenCalledWith(expect.stringContaining('password-reset.html'), 'utf-8');
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'no-reply@test.app',
      to: 'user@test.app',
      subject: 'Réinitialisation de votre mot de passe',
      html: 'Bonjour Bob, lien https://reset'
    });
    expect(result).toEqual({ success: true, messageId: 'message-2' });
  });

  it('retourne une erreur lorsque nodemailer échoue pour un email personnalisé', async () => {
    sendMailMock.mockRejectedValue(new Error('smtp down'));
    const service = new MailService();
    const result = await service.sendCustomEmail('user@test.app', 'Sujet', '<p>Bonjour</p>', 'Bonjour');
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'no-reply@test.app',
      to: 'user@test.app',
      subject: 'Sujet',
      text: 'Bonjour',
      html: '<p>Bonjour</p>'
    });
    expect(result).toEqual({ success: false, error: 'smtp down' });
  });
});
