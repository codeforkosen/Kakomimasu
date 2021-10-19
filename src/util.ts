export function flat<T>(arr: T[][]) {
  return ([] as T[]).concat(...arr);
}
