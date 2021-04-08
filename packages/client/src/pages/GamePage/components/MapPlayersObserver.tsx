import React, { MutableRefObject, useEffect, useRef } from 'react'
import {
  TransformContext,
  useMapTransformContext,
} from 'pages/GamePage/utils/useMapContext'
import { useStore } from 'react-redux'
import { gameActions } from 'common/modules/game/redux'
import { useGame } from 'pages/GamePage/components/GameContext'
import { STATIONS } from 'common/modules/game/constants/stations'
import { IMAGE_SIZE } from '../utils/imageMaps'

function showStation({
  station,
  contextRef,
  mapRef,
}: {
  station: undefined | number
  contextRef: MutableRefObject<TransformContext | undefined>
  mapRef: MutableRefObject<HTMLElement | null>
}) {
  if (!station || !mapRef.current || !contextRef.current) return

  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight

  const widthDimension = IMAGE_SIZE.width / clientWidth
  const heightDimension = IMAGE_SIZE.height / clientHeight

  const maxDimension = Math.max(widthDimension, heightDimension)

  const rect = mapRef.current.getBoundingClientRect()
  const imageWidth = (rect.width * widthDimension) / maxDimension
  const imageHeight = (rect.height * heightDimension) / maxDimension

  const nextScale = Math.min(4, maxDimension)
  const scaleDiff = nextScale / contextRef.current.state.scale

  console.log({
    imageWidth,
    imageHeight,
    rect,
    widthDimension,
    heightDimension,
  })

  const { left, top } = STATIONS[station]
  const x =
    -imageWidth * left * scaleDiff +
    clientWidth / 2 -
    ((rect.width - imageWidth) * scaleDiff) / 2
  const y =
    -imageHeight * top * scaleDiff +
    clientHeight / 2 -
    ((rect.height - imageHeight) * scaleDiff) / 2

  contextRef.current.dispatch.setTransform(x, y, nextScale)
}

export function MapPlayersObserver({
  mapRef,
}: {
  mapRef: MutableRefObject<HTMLElement | null>
}) {
  const contextRef = useRef<TransformContext | undefined>()
  const animationRef = useRef<number | undefined>()
  const store = useStore()
  const game = useGame()

  useEffect(() => {
    const { station } = game.activePlayer(store.getState())
    setTimeout(() => {
      showStation({ station, mapRef, contextRef })
    }, 500)
  }, [game, mapRef, store])

  useEffect(() => {
    store.client.on('add', (action) => {
      if (action.type === gameActions.moveTo.type && mapRef.current) {
        const { station } = game.activePlayer(store.getState())

        if (station) {
          clearTimeout(animationRef.current)

          animationRef.current = window.setTimeout(() => {
            showStation({ station, mapRef, contextRef })
          }, 600)
        }
      }
    })
  }, [game, mapRef, store])

  return <ContextToRefUpdater contextRef={contextRef} />
}

function ContextToRefUpdater({
  contextRef,
}: {
  contextRef: MutableRefObject<TransformContext | undefined>
}) {
  contextRef.current = useMapTransformContext()

  return null
}
