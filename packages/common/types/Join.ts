export type Join<
  Arr extends string[],
  Separator extends string = ','
> = Arr extends [string, ...infer Rest]
  ? Rest extends []
    ? Arr[0]
    : Rest extends string[]
    ? `${Arr[0]}${Separator}${Join<Rest>}`
    : never
  : never
