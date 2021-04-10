import { useEffect, useRef } from 'react'
import { useStore } from 'react-redux'
import { gameActions } from 'common/modules/game/redux'
import { useGame } from 'pages/GamePage/components/GameContext'
import {
  getMapDimensions,
  mapContainerRef,
  showStation,
  mapTransformRef,
} from 'pages/GamePage/utils/map'

function showStationWithScale(
  { station }: { station: undefined | number },
  bringCloser?: boolean,
) {
  if (!station || !mapContainerRef.current || !mapTransformRef.current) return

  const mapDimensions = getMapDimensions()

  const scale = bringCloser ? Math.min(3, mapDimensions.maxRatio) : undefined

  showStation({
    station,
    mapDimensions,
    scale,
  })
}

export function useMapPlayersObserver() {
  const animationRef = useRef<number | undefined>()
  const store = useStore()
  const game = useGame()

  useEffect(() => {
    const { station } = game.activePlayer(store.getState())
    setTimeout(() => {
      showStationWithScale({ station }, true)
    }, 1000)
  }, [game, store])

  useEffect(() => {
    store.client.on('add', (action) => {
      if (action.type === gameActions.moveTo.type) {
        const { station } = game.activePlayer(store.getState())

        if (station) {
          clearTimeout(animationRef.current)

          animationRef.current = window.setTimeout(() => {
            showStationWithScale({ station })
          }, 600)
        }
      }
    })
  }, [game, store])
}
