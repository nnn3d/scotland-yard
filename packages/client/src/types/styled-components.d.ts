/* eslint-disable @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any */
import { Theme } from '@material-ui/core'
import * as React from 'react'
import {
  CSSObject,
  Interpolation,
  InterpolationFunction,
  StyledComponent,
  StyledComponentPropsWithRef,
  ThemedStyledProps,
} from 'styled-components'
import { CSSProperties } from '@material-ui/core/styles/withStyles'

type MuiInterpolation<P> =
  | CSSProperties
  | ((props: P) => MuiInterpolation<P>)
  | ReadonlyArray<MuiInterpolation<P>>

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
  export interface ThemedStyledFunctionBase<
    C extends keyof JSX.IntrinsicElements | React.ComponentType<any>,
    T extends object,
    O extends object = {},
    A extends keyof any = never
  > {
    (first: TemplateStringsArray): StyledComponent<C, T, O, A>
    (
      first:
        | TemplateStringsArray
        | CSSObject
        | InterpolationFunction<
            ThemedStyledProps<StyledComponentPropsWithRef<C> & O, T>
          >,
      ...rest: Array<
        | Interpolation<
            ThemedStyledProps<StyledComponentPropsWithRef<C> & O, T>
          >
        | MuiInterpolation<
            ThemedStyledProps<StyledComponentPropsWithRef<C> & O, T>
          >
      >
    ): StyledComponent<C, T, O, A>
    <U extends object>(
      first:
        | TemplateStringsArray
        | CSSObject
        | InterpolationFunction<
            ThemedStyledProps<StyledComponentPropsWithRef<C> & O & U, T>
          >,
      ...rest: Array<
        | Interpolation<
            ThemedStyledProps<StyledComponentPropsWithRef<C> & O & U, T>
          >
        | MuiInterpolation<
            ThemedStyledProps<StyledComponentPropsWithRef<C> & O & U, T>
          >
      >
    ): StyledComponent<C, T, O & U, A>
  }
}
