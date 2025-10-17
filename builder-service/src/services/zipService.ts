import archiver from 'archiver';
import { Readable } from 'stream';
import { GeneratedFile } from './generators/types';

export class ZipService {
  async createZip(files: GeneratedFile[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      const buffers: Buffer[] = [];

      archive.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });

      archive.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      archive.on('error', (err) => {
        reject(err);
      });

      for (const file of files) {
        archive.append(file.content, { name: file.filename });
      }

      archive.finalize();
    });
  }

  createZipStream(files: GeneratedFile[]): Readable {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    for (const file of files) {
      archive.append(file.content, { name: file.filename });
    }

    archive.finalize();

    return archive;
  }
}
