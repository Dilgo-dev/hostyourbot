export function parseCpu(value: string): number {
  if (!value) return 0;

  if (value.endsWith('m')) {
    return parseInt(value.slice(0, -1)) / 1000;
  }

  if (value.endsWith('n')) {
    return parseInt(value.slice(0, -1)) / 1000000000;
  }

  return parseFloat(value);
}

export function parseMemory(value: string): number {
  if (!value) return 0;

  const units: Record<string, number> = {
    'Ki': 1024,
    'Mi': 1024 * 1024,
    'Gi': 1024 * 1024 * 1024,
    'Ti': 1024 * 1024 * 1024 * 1024,
    'K': 1000,
    'M': 1000 * 1000,
    'G': 1000 * 1000 * 1000,
    'T': 1000 * 1000 * 1000 * 1000,
  };

  for (const [suffix, multiplier] of Object.entries(units)) {
    if (value.endsWith(suffix)) {
      return parseInt(value.slice(0, -suffix.length)) * multiplier;
    }
  }

  return parseInt(value);
}

export function parseStorage(value: string): number {
  return parseMemory(value);
}

export function bytesToGiB(bytes: number): number {
  return bytes / (1024 * 1024 * 1024);
}

export function bytesToMiB(bytes: number): number {
  return bytes / (1024 * 1024);
}
