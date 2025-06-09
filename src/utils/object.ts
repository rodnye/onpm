export const sortRecord = (
  object: Record<string, any>,
  sortCallback?: (a: string, b: string) => number
) => {
  const keys = Object.keys(object);

  keys.sort(sortCallback);
  for (const key of keys) {
    const value = object[key];
    delete object[key];
    object[key] = value;
  }
};
