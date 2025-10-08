import { FaNodeJs, FaPython } from 'react-icons/fa';
import { SiGo, SiRust } from 'react-icons/si';

interface Language {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  versions: string[];
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  selectedVersion: string;
  onLanguageChange: (language: string) => void;
  onVersionChange: (version: string) => void;
}

const languages: Language[] = [
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: FaNodeJs,
    color: 'green',
    versions: ['18', '20', '22', 'LTS'],
  },
  {
    id: 'python',
    name: 'Python',
    icon: FaPython,
    color: 'blue',
    versions: ['3.9', '3.10', '3.11', '3.12', 'latest'],
  },
  {
    id: 'go',
    name: 'Go',
    icon: SiGo,
    color: 'cyan',
    versions: ['1.20', '1.21', '1.22', 'latest'],
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: SiRust,
    color: 'orange',
    versions: ['1.75', '1.76', '1.77', 'latest'],
  },
];

export default function LanguageSelector({
  selectedLanguage,
  selectedVersion,
  onLanguageChange,
  onVersionChange,
}: LanguageSelectorProps) {
  const currentLanguage = languages.find((lang) => lang.id === selectedLanguage);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white text-sm font-medium mb-3">Langage</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {languages.map((language) => (
            <button
              key={language.id}
              type="button"
              onClick={() => {
                onLanguageChange(language.id);
                onVersionChange(language.versions[language.versions.length - 1]);
              }}
              className={`p-6 border rounded-xl transition-all duration-200 ${
                selectedLanguage === language.id
                  ? `bg-${language.color}-600/20 border-${language.color}-500/50 text-${language.color}-400`
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <language.icon className="text-4xl mx-auto mb-3" />
              <p className="text-sm font-medium">{language.name}</p>
            </button>
          ))}
        </div>
      </div>

      {currentLanguage && (
        <div>
          <label className="block text-white text-sm font-medium mb-3">Version</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentLanguage.versions.map((version) => (
              <button
                key={version}
                type="button"
                onClick={() => onVersionChange(version)}
                className={`px-4 py-3 border rounded-lg transition-all duration-200 font-medium ${
                  selectedVersion === version
                    ? `bg-${currentLanguage.color}-600/20 border-${currentLanguage.color}-500/50 text-${currentLanguage.color}-400`
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {version}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
