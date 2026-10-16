// Job registry. Every file named "NNNN-*.ts" in this folder that default-exports
// a job is picked up automatically — adding a job means adding one file.
import type { JobDef } from './types';

const modules = import.meta.glob<{ default: JobDef }>('./[0-9][0-9][0-9][0-9]-*.ts', { eager: true });

export const jobs: JobDef[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.no.localeCompare(b.no));

export const jobByNo = (no: string) => jobs.find((j) => j.no === no);

/** Neighbours for ‹ › navigation, wrapping around. */
export function neighbours(no: string) {
  const i = jobs.findIndex((j) => j.no === no);
  const n = jobs.length;
  return { prev: jobs[(i - 1 + n) % n]!, next: jobs[(i + 1) % n]! };
}

export * from './types';
