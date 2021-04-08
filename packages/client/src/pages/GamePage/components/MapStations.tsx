import React, { useState } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { Station, STATIONS } from 'common/modules/game/constants/stations'
import {
  COMMON_TICKETS,
  CommonTicket,
  DOUBLE_TICKET,
  MR_X_TICKETS,
  MrXTicket,
} from 'common/modules/game/types/Ticket'

import { ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core'
import {
  GamePlayerState,
  GameTurnState,
} from 'common/modules/game/types/GameState'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'
import {
  useGame,
  useIsDetectivesMap,
} from 'pages/GamePage/components/GameContext'
import { ticketImages, typeImages } from 'pages/GamePage/utils/imageMaps'

export const MapStations = React.memo(function MapStations() {
  const game = useGame()
  const activePlayer = game.activePlayer.use()
  const canMoveToStations = game.activePlayerCanMoveToStations.use()
  const turn = game.turn.use()
  const gameOver = game.gameOver.use()
  const isDetectivesMap = useIsDetectivesMap()
  const userPlayer = game.useCurrentUserPlayer()

  return (
    <>
      {STATIONS.map((station) => (
        <MapStation
          {...{
            key: station.index,
            station,
            activePlayer,
            userPlayer,
            turn,
            gameOver,
            canMoveToStations,
            isDetectivesMap,
          }}
        />
      ))}
    </>
  )
})

export const MapStation = React.memo(function MapStation({
  station,
  canMoveToStations,
  gameOver,
  activePlayer,
  userPlayer,
  turn,
  isDetectivesMap,
}: {
  station: Station
  canMoveToStations: Station['routes']
  gameOver: string | undefined
  activePlayer: GamePlayerState
  userPlayer: GamePlayerState
  turn: GameTurnState
  isDetectivesMap: boolean
}) {
  const game = useGame()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const availableTickets = canMoveToStations[station.index]
  const active =
    !gameOver &&
    (isDetectivesMap
      ? activePlayer.color !== MR_X_COLOR
      : activePlayer === userPlayer) &&
    Boolean(availableTickets)

  return (
    <>
      <SStation
        onClick={(event) => {
          active && setAnchorEl(event.currentTarget)
        }}
        active={active}
        type={station.type}
        left={station.left}
        top={station.top}
      >
        <SText>{station.index + 1}</SText>
      </SStation>
      {availableTickets && active && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {(activePlayer.color === MR_X_COLOR
            ? MR_X_TICKETS
            : COMMON_TICKETS
          ).map((ticket: MrXTicket) => (
            <MenuItem
              key={ticket}
              onClick={() => {
                if (ticket === DOUBLE_TICKET) {
                  game.actions.useDoubleTicket()
                } else {
                  game.actions.moveTo({ station: station.index, ticket })
                }
                setAnchorEl(null)
              }}
              disabled={
                ticket === DOUBLE_TICKET
                  ? turn.activatedDouble || !activePlayer.tickets[ticket]
                  : !availableTickets.includes(ticket)
              }
            >
              <ListItemIcon>
                <STicket src={ticketImages[ticket]} />
              </ListItemIcon>
              <ListItemText>{activePlayer.tickets[ticket] || 0}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  )
})

const SText = styled.div`
  font-family: Bebas Neue, monospace;
  font-size: 1.2em;
  position: relative;
  z-index: 5;
`

const activeStation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: .6;
  }
`

const STicket = styled.img`
  width: 26px;
  height: auto;
`

const SStation = styled.div.attrs(
  ({ left, top }: { left: number; top: number }) => ({
    style: {
      left: left * 100 + '%',
      top: top * 100 + '%',
    },
  }),
)<{
  active: boolean
  type: CommonTicket
  left: number
  top: number
}>`
  position: absolute;
  width: 2.5em;
  height: 2.5em;
  transform: translate(-50%, -50%);
  background: url(${({ type }) => typeImages[type].disabled}) no-repeat center;
  background-size: 120% auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding-bottom: 1%;
  text-shadow: 0 0 0.1em black;
  transition: background-image 0.3s ease;
  border-radius: 50%;
  user-select: none;
  color: #ccc;

  ${({ active, type }) =>
    active &&
    css`
      cursor: pointer;
      color: white;
      background-image: url(${typeImages[type].common});

      ${SText} {
        transform: translate3d(0, 0, 0);
      }

      &:after,
      &:before {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        background-image: url(${typeImages[type].active});
        animation: ${activeStation} 0.5s linear infinite alternate-reverse;
      }

      &:after {
        display: none;
        animation: none;
      }

      &:hover:after {
        display: block;
      }
    `}
`
