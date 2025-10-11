import { FaSave, FaTrash, FaUndo, FaRedo, FaHome, FaRocket, FaChevronDown, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

interface BuilderToolbarProps {
  onClear: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onGenerate?: () => void;
  onGenerateDownload?: () => void;
  saving?: boolean;
  generating?: boolean;
  isAdmin?: boolean;
}

export default function BuilderToolbar({
  onClear,
  onUndo,
  onRedo,
  onSave,
  onGenerate,
  onGenerateDownload,
  saving = false,
  generating = false,
  isAdmin = false,
}: BuilderToolbarProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerateClick = () => {
    if (onGenerate) {
      onGenerate();
      setIsDropdownOpen(false);
    }
  };

  const handleGenerateDownloadClick = () => {
    if (onGenerateDownload) {
      onGenerateDownload();
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <FaHome className="text-lg" />
          <span className="font-medium">Retour</span>
        </button>

        <div className="w-px h-8 bg-slate-700" />

        <h1 className="text-white text-xl font-bold">Builder Discord</h1>
      </div>

      <div className="flex items-center gap-2">
        {onUndo && (
          <button
            onClick={onUndo}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Annuler"
          >
            <FaUndo className="text-lg" />
          </button>
        )}

        {onRedo && (
          <button
            onClick={onRedo}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Rétablir"
          >
            <FaRedo className="text-lg" />
          </button>
        )}

        <div className="w-px h-8 bg-slate-700 mx-2" />

        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <FaTrash className="text-lg" />
          <span className="font-medium">Effacer</span>
        </button>

        {onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="text-lg" />
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        )}

        {onGenerate && !isAdmin && (
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRocket className="text-lg" />
            <span>{generating ? 'Génération...' : 'Générer & Déployer'}</span>
          </button>
        )}

        {onGenerate && isAdmin && (
          <div className="relative" ref={dropdownRef}>
            <div className="flex">
              <button
                onClick={handleGenerateClick}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-l-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaRocket className="text-lg" />
                <span>{generating ? 'Génération...' : 'Générer & Déployer'}</span>
              </button>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={generating}
                className="px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-r-lg border-l border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronDown className={`text-sm transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleGenerateClick}
                  disabled={generating}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaRocket className="text-lg text-purple-400" />
                  <div>
                    <div className="font-semibold">Générer & Déployer</div>
                    <div className="text-xs text-slate-400">Rediriger vers la page de création</div>
                  </div>
                </button>
                <div className="h-px bg-slate-700"></div>
                <button
                  onClick={handleGenerateDownloadClick}
                  disabled={generating}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaDownload className="text-lg text-purple-400" />
                  <div>
                    <div className="font-semibold">Générer le code et Télécharger</div>
                    <div className="text-xs text-slate-400">Télécharger directement le ZIP</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
