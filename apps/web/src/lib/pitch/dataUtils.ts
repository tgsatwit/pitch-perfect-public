// Utility to ensure data passed to server actions is serializable
export const sanitizeForServer = (value: any): any => {
  if (value == null) return value;
  // Firestore Timestamp objects have toJSON but are not plain. Convert to ISO.
  if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    // @ts-ignore
    const millis = value.seconds * 1000 + value.nanoseconds / 1e6;
    return new Date(millis).toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(sanitizeForServer);
  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    Object.entries(value).forEach(([k, v]) => {
      out[k] = sanitizeForServer(v);
    });
    return out;
  }
  return value;
};