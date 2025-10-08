import { useState, useRef } from 'react';
import { FaUpload, FaFile, FaTimes, FaFolder } from 'react-icons/fa';

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export default function FileUploader({ files, onFilesChange }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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
    onFilesChange([...files, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onFilesChange([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
          Glissez vos fichiers ici ou cliquez pour sélectionner
        </p>
        <p className="text-slate-400 text-sm mb-4">
          Vous pouvez importer plusieurs fichiers ou un dossier complet
        </p>

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <FaFile className="inline mr-2" />
            Sélectionner fichiers
          </button>

          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            <FaFolder className="inline mr-2" />
            Sélectionner dossier
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <input
          ref={folderInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-medium">
              {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => onFilesChange([])}
              className="text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              Tout supprimer
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FaFile className="text-slate-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm truncate">{file.name}</p>
                    <p className="text-slate-500 text-xs">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg transition-colors flex-shrink-0"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
