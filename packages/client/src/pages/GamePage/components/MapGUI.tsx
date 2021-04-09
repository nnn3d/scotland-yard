import styled from 'styled-components'
import { useGame } from 'pages/GamePage/components/GameContext'
import React, { useState } from 'react'
import { PlayerColor } from 'common/modules/game/types/PlayerColor'
import { GAME_CONFIG } from 'common/modules/game/constants/gameConfig'
import { ticketImages } from 'pages/GamePage/utils/imageMaps'
import {
  COMMON_TICKETS,
  MR_X_TICKETS,
  MrXTicket,
} from 'common/modules/game/types/Ticket'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Theme,
  useMediaQuery,
} from '@material-ui/core'
import { GamePlayerState } from 'common/modules/game/types/GameState'

const colorMap: Record<PlayerColor, string> = {
  white: '#fff',
  black: '#000',
  yellow: '#ffff00',
  blue: '#0000ff',
  green: '#008000',
  red: '#800000',
  purple: '#800080',
}

export function MapGUI() {
  const game = useGame()
  const players = game.players.use()
  const mrXHistory = game.mrXHistory.use()

  return (
    <SRoot>
      <SPlayers>
        {players.map((player) => (
          <Player key={player.color} player={player} />
        ))}
      </SPlayers>
      <SMrXHistory>
        {[...Array(GAME_CONFIG.numberOfTurns)].map((_, index) => (
          <SHistoryItem
            key={index}
            disclosure={GAME_CONFIG.disclosureMrXTurns.includes(index + 1)}
          >
            {index + 1}
            {mrXHistory[index] && (
              <SHistoryTicket src={ticketImages[mrXHistory[index]]} />
            )}
          </SHistoryItem>
        ))}
      </SMrXHistory>
    </SRoot>
  )
}

function Player({ player }: { player: GamePlayerState }) {
  const game = useGame()
  const activePlayer = game.activePlayer.use()

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const close = () => setAnchorEl(null)

  return (
    <>
      <SPlayer
        key={player.color}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        color={colorMap[player.color]}
        active={activePlayer.color === player.color}
      >
        <SPlayerName>{player.userName}</SPlayerName>
        {!isMobile &&
          (player.color === MR_X_COLOR ? MR_X_TICKETS : COMMON_TICKETS).map(
            (ticket: MrXTicket) => (
              <React.Fragment key={ticket}>
                <STicket src={ticketImages[ticket]} />x{player.tickets[ticket]}
              </React.Fragment>
            ),
          )}
      </SPlayer>
      {isMobile && (
        <Menu
          getContentAnchorEl={null}
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={Boolean(anchorEl)}
          onClose={close}
        >
          {(player.color === MR_X_COLOR ? MR_X_TICKETS : COMMON_TICKETS).map(
            (ticket: MrXTicket) => (
              <ListItem key={ticket} onClick={close}>
                <ListItemIcon>
                  <STicket src={ticketImages[ticket]} />
                </ListItemIcon>
                <ListItemText>{player.tickets[ticket] || 0}</ListItemText>
              </ListItem>
            ),
          )}
        </Menu>
      )}
    </>
  )
}

const SRoot = styled.div`
  position: relative;
  z-index: 100;
`

const STicket = styled.img`
  width: 20px;
  height: 20px;
  margin-left: 6px;
  margin-right: 2px;
`

const SMrXHistory = styled.div`
  position: fixed;
  bottom: 8px;
  gap: 4px;
  left: 8px;
  right: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`

const SHistoryItem = styled.div<{ disclosure: boolean }>`
  width: 28px;
  height: 28px;
  position: relative;
  border-radius: 8px;
  border: 4px solid
    ${({ theme, disclosure }) =>
      theme.palette[disclosure ? 'secondary' : 'primary'].main};
  background: ${({ theme }) => theme.palette.background.default};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.7);
`

const SHistoryTicket = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const SPlayer = styled.div<{ color: string; active: boolean }>`
  padding: 4px 6px;
  background: ${({ color }) => color};
  color: ${({ theme, color }) => theme.palette.getContrastText(color)};
  border-radius: 8px;
  border: 4px solid
    ${({ theme, active }) =>
      theme.palette[active ? 'secondary' : 'primary'].main};
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
`

const SPlayerName = styled.span`
  font-weight: 500;
`

const SPlayers = styled.div`
  position: fixed;
  gap: 8px;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`
