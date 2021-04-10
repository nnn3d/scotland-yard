import { IMAGE_SIZE } from 'pages/GamePage/utils/imageMaps'
import React, { createRef, MutableRefObject, useContext } from 'react'
import { MapState } from 'redux/GameRedux'
import { PropsList as MapProps } from 'react-zoom-pan-pinch/dist/store/interfaces/propsInterface'
import { TransformComponent } from 'react-zoom-pan-pinch'
import { STATIONS } from 'common/modules/game/constants/stations'
import { MAP_Y_PADDING } from 'pages/GamePage/utils/constants'

export const mapContainerRef = createRef<HTMLDivElement>()

export type MapDimensions = ReturnType<typeof getMapDimensions>

export function getMapDimensions() {
  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight

  const widthRatio = IMAGE_SIZE.width / clientWidth
  const heightRatio = IMAGE_SIZE.height / clientHeight

  let maxRatio = Math.max(widthRatio, heightRatio)

  if (maxRatio === heightRatio) {
    maxRatio = (IMAGE_SIZE.height + MAP_Y_PADDING * 2) / clientHeight
  }

  const { width: containerWidth = 0, height: containerHeight = 0 } =
    mapContainerRef.current?.getBoundingClientRect() || {}

  const imageWidth = (containerWidth * widthRatio) / maxRatio
  const imageHeight = (containerHeight * heightRatio) / maxRatio

  const imageXOffset = (containerWidth - imageWidth) / 2
  const imageYOffset = (containerHeight - imageHeight) / 2

  return {
    clientWidth,
    clientHeight,
    containerWidth,
    containerHeight,
    imageWidth,
    imageHeight,
    imageXOffset,
    imageYOffset,
    widthRatio,
    heightRatio,
    maxRatio,
  }
}

// need change scale to call onZoomChange callback
let defaultScaleDiff = 0.001

export function showStation({
  station,
  scale,
  mapDimensions = getMapDimensions(),
  duration,
}: {
  station: number | undefined
  scale?: number
  mapDimensions?: MapDimensions
  duration?: number
}) {
  if (!station || !mapContainerRef.current || !mapTransformRef.current) return

  const {
    containerWidth,
    containerHeight,
    clientWidth,
    clientHeight,
    imageXOffset,
    imageYOffset,
    imageWidth,
    imageHeight,
  } = mapDimensions

  const currentScale = mapTransformRef.current.state.scale
  const scaleDiff = scale ? scale / currentScale : 1

  const { left, top } = STATIONS[station]
  const x = (imageXOffset + imageWidth * left) * scaleDiff - clientWidth / 2
  const y = (imageYOffset + imageHeight * top) * scaleDiff - clientHeight / 2

  const maxX = containerWidth * scaleDiff - clientWidth
  const maxY = containerHeight * scaleDiff - clientHeight

  console.log({
    scaleDiff,
    scale,
    currentScale,
    left,
    top,
    x,
    y,
    maxX,
    maxY,
    ...mapDimensions,
  })

  mapTransformRef.current.dispatch.setTransform(
    Math.max(0, Math.min(maxX, x)) * -1,
    Math.max(0, Math.min(maxY, y)) * -1,
    scale ?? currentScale + defaultScaleDiff,
    duration,
  )

  defaultScaleDiff = defaultScaleDiff * -1
}

export const mapTransformRef = createRef<TransformContext>()

export type TransformContext = {
  state: MapState
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
} & MapProps

export function MapTransformContextUpdater() {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(mapTransformRef as MutableRefObject<TransformContext>).current = useContext(
    TransformComponent.contextType as React.Context<TransformContext>,
  )

  return null
}
