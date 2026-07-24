/**
 * Minimal logging seam for the app. Nothing sophisticated yet — just a single
 * place error reporting can later be redirected (e.g. to a crash reporter)
 * without touching every call site.
 */
export const logger = {
  error(message: string, meta?: Record<string, unknown>): void {
    if (meta !== undefined) {
      console.error(`[cherry-brain] ${message}`, meta);
    } else {
      console.error(`[cherry-brain] ${message}`);
    }
  },
};
