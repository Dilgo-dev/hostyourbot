interface ImageMapping {
  [key: string]: string;
}

const languageToDockerImage: ImageMapping = {
  nodejs: 'node',
  python: 'python',
  go: 'golang',
  rust: 'rust',
};

export function getDockerImage(language: string, version: string): string {
  const imageName = languageToDockerImage[language] || language;
  const imageVersion = version.toLowerCase();
  return `${imageName}:${imageVersion}`;
}
