type _WhenUnion<
  MaybeUnion,
  WhenYes,
  WhenNo,
  Clone = MaybeUnion
> = MaybeUnion extends any
  ? [Clone] extends [MaybeUnion]
    ? WhenYes
    : WhenNo
  : never

export type WhenUnion<MaybeUnion, WhenYes, WhenNo> = _WhenUnion<
  MaybeUnion,
  WhenYes,
  WhenNo
>
