interface CommandInputProps {
  command: string;
  onCommandChange: (command: string) => void;
}

export default function CommandInput({ command, onCommandChange }: CommandInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Commande de démarrage
        </label>
        <p className="text-slate-400 text-sm mb-3">
          Spécifiez la commande pour démarrer votre bot (ex: node index.js, python main.py)
        </p>
        <input
          type="text"
          value={command}
          onChange={(e) => onCommandChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors font-mono"
          placeholder="node index.js"
        />
      </div>
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
        <p className="text-slate-400 text-sm">
          <span className="text-purple-400 font-semibold">Note :</span> Si aucune commande n'est spécifiée,
          le conteneur restera actif sans exécuter de code.
        </p>
      </div>
    </div>
  );
}
