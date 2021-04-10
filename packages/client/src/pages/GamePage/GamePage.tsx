import styled from 'styled-components'
import mapImg from 'assets/map.png'
import React, { useEffect, useMemo, useState } from 'react'
import { MapStations } from 'pages/GamePage/components/MapStations'
import { useSubscription } from '@logux/redux'
import {
  gameDetectivesChannel,
  gameUserChannel,
} from 'common/modules/game/channels'
import { Navigate, useParams } from 'react-router-dom'
import { RouteParams } from 'common/utils/createRoute'
import { gameDetectivesRoute, gameRoute, homeRoute } from 'constants/routes'
import { useUserId } from 'hooks/useUserId'
import { useDispatch, useSelector } from 'react-redux'
import { CircularProgress } from '@material-ui/core'
import { GameRedux } from 'redux/GameRedux'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { GameContext, useGame } from './components/GameContext'
import { MapPlayers } from 'pages/GamePage/components/MapPlayers'
import { MapGUI } from './components/MapGUI'
import { GameOver } from 'pages/GamePage/components/GameOver'
import { useMapPlayersObserver } from 'pages/GamePage/components/MapPlayersObserver'
import { IMAGE_SIZE } from 'pages/GamePage/utils/imageMaps'
import {
  mapContainerRef,
  MapTransformContextUpdater,
} from 'pages/GamePage/utils/map'
import { MAP_Y_PADDING } from 'pages/GamePage/utils/constants'

export function GamePage({ detectivesMap }: { detectivesMap?: boolean }) {
  const userId = useUserId()
  const { id } = useParams() as RouteParams<
    typeof gameRoute | typeof gameDetectivesRoute
  >
  const isSubscribing = useSubscription([
    detectivesMap
      ? gameDetectivesChannel.link({ id })
      : gameUserChannel.link({ id, userId }),
  ])

  const hasGame = useSelector((state) => Boolean(state.game[id]))
  const dispatch = useDispatch()
  const context = useMemo(
    () => ({
      game: new GameRedux(id, dispatch),
      isDetectivesMap: detectivesMap,
    }),
    [detectivesMap, dispatch, id],
  )

  if (isSubscribing) {
    return (
      <SLoader>
        <CircularProgress />
      </SLoader>
    )
  } else if (!hasGame) {
    return <Navigate to={homeRoute.link()} />
  } else {
    return (
      <GameContext.Provider value={context}>
        <GameInner />
      </GameContext.Provider>
    )
  }
}

export function GameInner() {
  const game = useGame()
  const [viewportSize, setViewportSize] = useState(() => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  }))

  useEffect(() => {
    function handleResize() {
      setViewportSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      })
    }

    window.addEventListener('resize', handleResize)

    return function clear() {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const dimension = useMemo(() => {
    const widthDimension = IMAGE_SIZE.width / viewportSize.width
    const heightDimension = IMAGE_SIZE.height / viewportSize.height
    return Math.max(widthDimension, heightDimension)
  }, [viewportSize.height, viewportSize.width])

  const fontSize = 35 / dimension

  useMapPlayersObserver()

  return useMemo(
    () => (
      <>
        <TransformWrapper
          scalePadding={{ disabled: true }}
          pan={{ paddingSize: 0 }}
          options={{ maxScale: dimension }}
          wheel={{ step: 300 }}
          {...game.mapComponentHandlers}
        >
          <MapTransformContextUpdater />
          <MapGUI />
          <GameOver />
          <STransformComponent>
            <TransformComponent>
              <SWrapper ref={mapContainerRef}>
                <SContainer fontSize={fontSize}>
                  <SMapImg src={mapImg} />
                  <MapStations />
                  <MapPlayers />
                </SContainer>
              </SWrapper>
            </TransformComponent>
          </STransformComponent>
        </TransformWrapper>
      </>
    ),
    [dimension, fontSize, game.mapComponentHandlers],
  )
}

const SLoader = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`

const STransformComponent = styled.div`
  width: 100%;
  flex-grow: 1;

  & .react-transform-component,
  & .react-transform-element {
    width: 100% !important;
    justify-content: center;
  }

  & .react-transform-element {
    will-change: opacity;
  }
`

const SWrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${MAP_Y_PADDING}px 0;
`

const SContainer = styled.div<{ fontSize: number }>`
  position: relative;
  display: flex;
  font-size: ${({ fontSize }) => fontSize}px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
`

const SMapImg = styled.img`
  max-width: 100%;
  max-height: calc(100vh - 80px);
  flex: 0;
`
