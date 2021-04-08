import { GamePlayerState } from 'common/modules/game/types/GameState'
import {
  useGame,
  useIsDetectivesMap,
} from 'pages/GamePage/components/GameContext'
import React from 'react'
import styled, { keyframes } from 'styled-components'
import mrXLastPositionImg from 'assets/mrXLastPosition.png'
import { STATIONS } from 'common/modules/game/constants/stations'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'
import { animated, useSpring } from 'react-spring'
import { playerImages } from 'pages/GamePage/utils/imageMaps'

export function MapPlayers() {
  const game = useGame()
  const players = game.players.use()

  return (
    <>
      {players
        .slice()
        .reverse()
        .map((player) => (
          <MapPlayer key={player.color} player={player} />
        ))}
    </>
  )
}

function MapPlayer({ player }: { player: GamePlayerState }) {
  const game = useGame()
  const activePlayer = game.activePlayer.use()
  const gameOver = game.gameOver.use()
  const isDetective = useIsDetectivesMap()
  const currentPlayer = game.useCurrentUserPlayer()
  const isPlayerDetective = isDetective || currentPlayer.color !== MR_X_COLOR

  const isActivePLayer = gameOver
    ? player.color === MR_X_COLOR
    : player === activePlayer &&
      (player.color !== MR_X_COLOR || !isPlayerDetective)

  const playerStation =
    player.color === MR_X_COLOR && isPlayerDetective
      ? player.lastStation
      : player.station
  const station = playerStation ? STATIONS[playerStation] : undefined

  const springStyle = useSpring({
    left: `${(station?.left || -1) * 100}%`,
    top: `${(station?.top || -1) * 100}%`,
  })

  let style: typeof springStyle & { opacity?: number } = springStyle

  if (!station) {
    return null
  }

  let image = playerImages[player.color]

  if (player.color === MR_X_COLOR && (isPlayerDetective || gameOver)) {
    image = mrXLastPositionImg

    if (gameOver === 'detectivesWin') {
      style = { ...style, opacity: 0.7 }
    }
  }

  return (
    <SRoot style={style}>
      {isActivePLayer && <SActive />}
      <SPlayer src={image} />
    </SRoot>
  )
}

const SRoot = styled(animated.div)`
  user-select: none;
  pointer-events: none;
  position: absolute;
  width: 1.7em;
  transform: translate(-50%, -80%);
  z-index: 2;
`

const activeAnimation = keyframes`
  from {
    transform:  rotateX(50deg) rotateZ(0);
    box-shadow: 0 0 0.2em 0.1em rgba(255, 255, 255, 0.8),
      inset 0 0 0.1em 0.05em rgba(255, 255, 255, 0.8);
  }
  50% {
    box-shadow: 0.02em 0 0.3em 0.2em rgba(255, 255, 255, 0.8),
      inset -0.02em 0 0.2em 0.1em rgba(255, 255, 255, 0.8);
  }
  to {
    transform:  rotateX(50deg) rotateZ(360deg);
    box-shadow: 0 0 0.2em 0.1em rgba(255, 255, 255, 0.8),
    inset 0 0 0.1em 0.05em rgba(255, 255, 255, 0.8);
  }
`

const SActive = styled.div`
  position: absolute;
  bottom: -0.2em;
  right: -0.2em;
  left: -0.2em;

  height: 2.1em;
  width: 2.1em;
  border-radius: 50%;
  border: solid 0.01em rgba(255, 255, 255, 0.8);
  animation: ${activeAnimation} 1s linear infinite;

  &:after,
  &:before {
    position: absolute;
    content: '';
    display: block;
    width: 0.2em;
    height: 0.2em;
    top: calc(50% - 0.2em);
    border-radius: 50%;
    background: white;
  }

  &:after {
    left: -0.1em;
  }

  &:before {
    right: -0.1em;
  }
`

const SPlayer = styled.img`
  position: relative;
  z-index: 2;
  width: 100%;
  height: auto;
`
