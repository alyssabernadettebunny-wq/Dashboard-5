import { z } from 'zod';

/**
 * Deviation from the spec's literal snippet: `resolvedTime` uses
 * `z.string().datetime({ offset: true })` rather than bare `z.string().datetime()`.
 * The spec's own worked example ("2026-07-23T15:00:00-07:00") carries a numeric
 * UTC offset, which zod's plain `.datetime()` rejects (it only accepts a "Z"
 * suffix unless `offset: true` is set). This is documented in the completion
 * report as a deliberate, necessary correction to match the spec's own example.
 */
export const extractedEventSchema = z.object({
  summary: z.string().min(1),
  statedTime: z.string().nullable(),
  resolvedTime: z.string().datetime({ offset: true }).nullable(),
  timePrecision: z.enum(['exact', 'approximate', 'relative', 'unknown']),
  participants: z.array(z.string()),
  sequenceIndex: z.number().int().nonnegative(),
  source: z.object({
    text: z.string().min(1),
    startIndex: z.number().int().nonnegative(),
    endIndex: z.number().int().nonnegative(),
  }),
  needsClarification: z.boolean(),
});

export const clarificationQuestionSchema = z.object({
  eventSequenceIndex: z.number().int().nonnegative(),
  question: z.string().min(1),
  reason: z.string().min(1),
});

export const contextExtractionProviderResultSchema = z.object({
  events: z.array(extractedEventSchema),
  clarificationQuestions: z.array(clarificationQuestionSchema),
});

export type ContextExtractionProviderResult = z.infer<typeof contextExtractionProviderResultSchema>;
