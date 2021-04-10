import React, { useCallback, useEffect, useState } from 'react'
import { useGame } from 'pages/GamePage/components/GameContext'
import { throttle } from 'lodash'
import { MapEventNames } from 'redux/GameRedux'
import { getMapDimensions, showStation, mapTransformRef } from '../utils/map'
import { STATIONS } from 'common/modules/game/constants/stations'
import styled from 'styled-components'
import { playerPointers, ticketImages } from 'pages/GamePage/utils/imageMaps'
import { PlayerColor } from 'common/modules/game/types/PlayerColor'
import { GamePlayerState } from 'common/modules/game/types/GameState'
import { useWindowSize } from 'react-use'
import { useRect } from 'react-use-rect'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'

type Positions = Partial<Record<PlayerColor | number, { x: number; y: number }>>

const THROTTLE_WAIT = 100

const POINTER_SIZE = 24

export function MapPointers() {
  const game = useGame()
  const isUserActivePlayer = game.useIsCurrentUserActivePlayer()
  const stations = game.activePlayerCanMoveToStationsList.use()
  const players = game.players.use()
  const isUserMrX = game.useIsCurrentUserMrX()
  const [positions, setPositions] = useState<Positions>({})

  const { height: pageHeight } = useWindowSize()
  const [pointersRef, rect] = useRect()

  const getPlayerStation = useCallback(
    (player: GamePlayerState) => {
      return player.color !== MR_X_COLOR || isUserMrX
        ? player.station
        : player.lastStation
    },
    [isUserMrX],
  )

  useEffect(() => {
    const updatePointers = throttle(function handlePan() {
      setPositions(
        getMapStationRelativeViewportPosition(
          [...(isUserActivePlayer ? stations : []), ...players],
          rect,
          getPlayerStation,
        ),
      )
    }, THROTTLE_WAIT)

    updatePointers()

    const eventNames: MapEventNames[] = ['panning', 'panningStop', 'zoomChange']

    eventNames.forEach((event) => game.map.on(event, updatePointers))

    return function clear() {
      eventNames.forEach((event) => game.map.off(event, updatePointers))
    }
  }, [game.map, getPlayerStation, isUserActivePlayer, players, rect, stations])

  return (
    <SRoot>
      <SContainer ref={pointersRef}>
        {!!pageHeight &&
          stations.map((station) => {
            const position = positions[station]

            const type = STATIONS[station].type
            return (
              position && (
                <SPointer
                  onClick={() => showStation({ station, duration: 350 })}
                  key={station}
                  {...position}
                  src={ticketImages[type]}
                />
              )
            )
          })}
        {players.map((player) => {
          const position = positions[player.color]
          const station = getPlayerStation(player)
          return (
            position && (
              <SPlayer
                onClick={() => showStation({ station, duration: 350 })}
                key={player.color}
                {...position}
                src={playerPointers[player.color]}
              />
            )
          )
        })}
      </SContainer>
    </SRoot>
  )
}

const SRoot = styled.div`
  position: relative;
  height: 100%;
  padding: 20px 10px;
`

const SContainer = styled.div`
  position: relative;
  height: 100%;
`

const SPointer = styled.img.attrs(({ x, y }: { x: number; y: number }) => ({
  style: {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
  },
}))`
  transform: translate(-50%, -50%);
  cursor: pointer;
  position: absolute;
  width: ${POINTER_SIZE}px;
  height: auto;
  pointer-events: all;
  transition-property: left, top;
  transition-duration: ${THROTTLE_WAIT}ms;
  transition-timing-function: linear;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.7);
`

const SPlayer = styled(SPointer)`
  border-radius: 50%;
`

function getMapStationRelativeViewportPosition(
  items: (number | GamePlayerState)[],
  rect: ClientRect,
  getPlayerStation: (player: GamePlayerState) => number | undefined,
): Positions {
  if (!mapTransformRef.current) {
    return {}
  }

  type GroupItem = { x: number; y: number }
  type GroupName = 'top' | 'left' | 'right' | 'bottom'
  type Group = GroupItem[]

  const {
    clientWidth,
    clientHeight,
    imageWidth,
    imageHeight,
    imageXOffset,
    imageYOffset,
  } = getMapDimensions()
  const { positionX, positionY } = mapTransformRef.current.state

  const result: Positions = {}

  const groups: Record<GroupName, Group> = {
    top: [],
    left: [],
    right: [],
    bottom: [],
  }

  function getKeyByGroup(group: GroupName) {
    return group === 'top' || group === 'bottom' ? 'x' : 'y'
  }

  items.forEach((item) => {
    const stationNumber =
      typeof item === 'number' ? item : getPlayerStation(item)
    if (typeof stationNumber !== 'number') {
      return
    }
    const station = STATIONS[stationNumber]

    const xFromCenter =
      imageXOffset +
      imageWidth * station.left -
      rect.left +
      positionX -
      rect.width / 2
    const yFromCenter =
      imageYOffset +
      imageHeight * station.top -
      rect.top +
      positionY -
      rect.height / 2

    const xRelativeViewport = xFromCenter / (rect.width / 2)
    const yRelativeViewport = yFromCenter / (rect.height / 2)

    const max = Math.max(
      Math.abs(xRelativeViewport),
      Math.abs(yRelativeViewport),
    )

    if (max <= (clientWidth > 700 ? 1.1 : 1)) {
      return
    }

    const x = (1 + xRelativeViewport / max) / 2
    const y = (1 + yRelativeViewport / max) / 2

    const group = !x
      ? 'left'
      : !y
      ? 'top'
      : x === 1
      ? 'right'
      : y === 1
      ? 'bottom'
      : false

    if (!group) {
      console.error('cant find group for item', { x, y })
      return
    }

    const position = { x, y }
    const key = typeof item === 'number' ? item : item.color

    result[key] = position
    groups[group].push(position)
  })
  ;(Object.keys(groups) as GroupName[]).forEach((groupName) => {
    const key = getKeyByGroup(groupName)
    groups[groupName].sort((a, b) => a[key] - b[key])

    fixCrossingAndSave(groups[groupName], key)
  })

  return result

  function fixCrossingAndSave(group: Group, key: 'x' | 'y') {
    if (!group.length) return

    const clientSize = key === 'x' ? clientWidth : clientHeight
    const pointerSize = Math.min(
      (POINTER_SIZE * 2) / clientSize,
      clientSize / group.length,
    )
    const lastPosMod = key === 'x' ? 0 : pointerSize

    let retries = 3
    let isUp = true
    let lastPos: number

    do {
      if (isUp) {
        lastPos = lastPosMod
        // eslint-disable-next-line no-loop-func
        group.forEach((position) => {
          position[key] = Math.max(lastPos, position[key])
          lastPos = position[key] + pointerSize
        })
      } else {
        lastPos = 1 - lastPosMod
        group
          .slice()
          .reverse()
          // eslint-disable-next-line no-loop-func
          .forEach((position) => {
            position[key] = Math.min(lastPos, position[key])
            lastPos = position[key] - pointerSize
          })
      }

      isUp = !isUp
    } while (
      retries-- > 0 &&
      (group[0][key] < 0 || group[group.length - 1][key] > 1)
    )
  }
}
