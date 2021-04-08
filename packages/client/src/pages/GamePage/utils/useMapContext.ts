import React, { useContext } from 'react'
import { TransformComponent } from 'react-zoom-pan-pinch'

export type TransformContext = {
  state: {
    previousScale: number
    scale: number
    positionX: number
    positionY: number
  }
  dispatch: {
    setScale: (newScale: number, speed?: number, type?: string) => void
    setPositionX: (newPosX: number, speed?: number, type?: string) => void
    setPositionY: (newPosY: number, speed?: number, type?: string) => void
    setTransform: (
      newPosX: number | undefined | null,
      newPosY: number | undefined | null,
      newScale: number | undefined | null,
      speed?: number,
      type?: string,
    ) => void
    resetTransform: () => void
    setDefaultState: () => void
  }
}

export function useMapTransformContext() {
  return useContext(
    TransformComponent.contextType as React.Context<
      TransformContext | undefined
    >,
  )
}
