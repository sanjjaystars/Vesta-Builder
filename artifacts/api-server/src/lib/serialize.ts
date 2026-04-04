/**
 * Serialize a clothing item so dates become ISO strings,
 * matching the OpenAPI schema which declares them as type: string.
 */
export function serializeItem(item: Record<string, unknown>) {
  return {
    ...item,
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
  };
}

export function serializeItems(items: Record<string, unknown>[]) {
  return items.map(serializeItem);
}

export function serializeFavorite(fav: Record<string, unknown>) {
  return {
    ...fav,
    createdAt: fav.createdAt instanceof Date ? (fav.createdAt as Date).toISOString() : fav.createdAt,
    top: fav.top ? serializeItem(fav.top as Record<string, unknown>) : fav.top,
    bottom: fav.bottom ? serializeItem(fav.bottom as Record<string, unknown>) : fav.bottom,
  };
}
