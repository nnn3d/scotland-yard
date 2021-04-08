import { PlayerColor } from 'common/modules/game/types/PlayerColor'
import { CommonTicket, MrXTicket } from 'common/modules/game/types/Ticket'
import playerWhiteImg from 'assets/playerWhitePiece.png'
import playerBlackImg from 'assets/playerBlackPiece.png'
import playerBlueImg from 'assets/playerBluePiece.png'
import playerGreenImg from 'assets/playerGreenPiece.png'
import playerRedImg from 'assets/playerRedPiece.png'
import playerYellowImg from 'assets/playerYellowPiece.png'
import taxiStationImg from 'assets/taxiStation.png'
import taxiStationActiveImg from 'assets/taxiStationActive.png'
import taxiStationDisabledImg from 'assets/taxiStationDisabled.png'
import busStationImg from 'assets/busStation.png'
import busStationActiveImg from 'assets/busStationActive.png'
import busStationDisabledImg from 'assets/busStationDisabled.png'
import undergroundStationImg from 'assets/undergroundStation.png'
import undergroundStationActiveImg from 'assets/undergroundStationActive.png'
import undergroundStationDisabledImg from 'assets/undergroundStationDisabled.png'
import taxiTicketImg from 'assets/taxiTicket.png'
import busTicketImg from 'assets/busTicket.png'
import undergroundTicketImg from 'assets/undergroundTicket.png'
import blackTicketImg from 'assets/blackTicket.png'
import doubleTicketImg from 'assets/doubleTicket.png'

export const playerImages: Record<PlayerColor, string> = {
  white: playerWhiteImg,
  black: playerBlackImg,
  blue: playerBlueImg,
  green: playerGreenImg,
  red: playerRedImg,
  yellow: playerYellowImg,
}
export const typeImages: Record<
  CommonTicket,
  Record<'disabled' | 'common' | 'active', string>
> = {
  taxi: {
    disabled: taxiStationDisabledImg,
    common: taxiStationImg,
    active: taxiStationActiveImg,
  },
  bus: {
    disabled: busStationDisabledImg,
    common: busStationImg,
    active: busStationActiveImg,
  },
  underground: {
    disabled: undergroundStationDisabledImg,
    common: undergroundStationImg,
    active: undergroundStationActiveImg,
  },
}
export const ticketImages: Record<MrXTicket, string> = {
  taxi: taxiTicketImg,
  bus: busTicketImg,
  underground: undergroundTicketImg,
  black: blackTicketImg,
  double: doubleTicketImg,
}
export const IMAGE_SIZE = { width: 4096, height: 3072 }
