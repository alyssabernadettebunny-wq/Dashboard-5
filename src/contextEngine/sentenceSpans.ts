export interface SentenceSpan {
  text: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Splits the original text into sentence-level spans, preserving exact
 * indices into the original string (so `original.slice(start, end) === text`
 * always holds). Trims surrounding whitespace out of the span but never
 * alters the original text itself.
 */
export function splitIntoSentenceSpans(original: string): SentenceSpan[] {
  const spans: SentenceSpan[] = [];
  const len = original.length;
  let start = 0;

  const pushSpan = (rawStart: number, rawEnd: number) => {
    const rawSpan = original.slice(rawStart, rawEnd);
    const trimmed = rawSpan.trim();
    if (trimmed.length === 0) return;
    const leadingWs = rawSpan.length - rawSpan.trimStart().length;
    const spanStart = rawStart + leadingWs;
    const spanEnd = spanStart + trimmed.length;
    spans.push({ text: trimmed, startIndex: spanStart, endIndex: spanEnd });
  };

  for (let i = 0; i < len; i += 1) {
    const ch = original[i];
    const isTerminator = ch === '.' || ch === '!' || ch === '?';
    if (!isTerminator) continue;
    const isLastChar = i === len - 1;
    const nextChar = original[i + 1];
    const nextIsWhitespaceOrEnd = isLastChar || nextChar === undefined || /\s/.test(nextChar);
    if (!nextIsWhitespaceOrEnd) continue;

    pushSpan(start, i + 1);
    start = i + 1;
  }

  if (start < len) {
    pushSpan(start, len);
  }

  return spans;
}
