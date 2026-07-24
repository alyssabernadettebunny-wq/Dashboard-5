/**
 * Identifies which extraction logic produced a given result. Bump this when
 * the provider or extraction rules change meaningfully — a new version is
 * allowed to reprocess an entry a previous version already completed;
 * the *same* version never reprocesses a completed entry.
 */
export const CONTEXT_ENGINE_VERSION = 'local-rule-based-v1';
