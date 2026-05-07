/** Compare list: max venues and cookie name. Shared by server and client. */
export const COMPARE_COOKIE_NAME = 'compare_venue_ids';
export const COMPARE_MAX_VENUES = 4;

export function parseCompareIds(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, COMPARE_MAX_VENUES);
}

export function serializeCompareIds(ids: string[]): string {
  return ids.slice(0, COMPARE_MAX_VENUES).join(',');
}
