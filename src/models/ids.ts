let counter = 0;

/** Generates a stable, sortable-enough unique id without relying on native crypto. */
export function generateId(prefix: string): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${random}`;
}
