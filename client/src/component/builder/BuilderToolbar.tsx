import { FaSave, FaTrash, FaUndo, FaRedo, FaHome, FaRocket } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface BuilderToolbarProps {
  onClear: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onGenerate?: () => void;
  saving?: boolean;
  generating?: boolean;
}

export default function BuilderToolbar({
  onClear,
  onUndo,
  onRedo,
  onSave,
  onGenerate,
  saving = false,
  generating = false,
}: BuilderToolbarProps) {
  const navigate = useNavigate();

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

        {onGenerate && (
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRocket className="text-lg" />
            <span>{generating ? 'Génération...' : 'Générer & Déployer'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
