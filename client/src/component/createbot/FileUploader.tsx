import { useState, useRef } from 'react';
import { FaUpload, FaFileArchive, FaTimes } from 'react-icons/fa';

interface FileUploaderProps {
  zipFile: File | null;
  onFileChange: (file: File | null) => void;
}

export default function FileUploader({ zipFile, onFileChange }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Veuillez sélectionner un fichier ZIP (.zip)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 100 MB)');
      return;
    }

    onFileChange(file);
  };

  const removeFile = () => {
    onFileChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-slate-700 bg-slate-900 hover:border-slate-600'
        }`}
      >
        <FaUpload className="text-4xl text-slate-500 mx-auto mb-4" />
        <p className="text-white font-medium mb-2">
          Glissez votre fichier ZIP ici ou cliquez pour sélectionner
        </p>
        <p className="text-slate-400 text-sm mb-4">
          Compressez votre projet en archive ZIP avant l'import
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          <FaFileArchive className="inline mr-2" />
          Sélectionner un fichier ZIP
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {zipFile && !error && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-medium">Fichier sélectionné</p>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              Supprimer
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FaFileArchive className="text-purple-400 text-xl flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm truncate">{zipFile.name}</p>
                <p className="text-slate-500 text-xs">{formatFileSize(zipFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-2 text-slate-400 hover:text-red-400 rounded-lg transition-colors flex-shrink-0"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          💡 Compressez tous les fichiers de votre projet en une archive ZIP. La structure des dossiers sera préservée.
        </p>
      </div>
    </div>
  );
}
