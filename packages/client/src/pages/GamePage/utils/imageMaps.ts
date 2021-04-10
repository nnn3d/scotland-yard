import { PlayerColor } from 'common/modules/game/types/PlayerColor'
import { CommonTicket, MrXTicket } from 'common/modules/game/types/Ticket'
import playerWhitePieceImg from 'assets/playerWhitePiece.png'
import playerBlackPieceImg from 'assets/playerBlackPiece.png'
import playerBluePieceImg from 'assets/playerBluePiece.png'
import playerGreenPieceImg from 'assets/playerGreenPiece.png'
import playerRedPieceImg from 'assets/playerRedPiece.png'
import playerYellowPieceImg from 'assets/playerYellowPiece.png'
import playerPurplePieceImg from 'assets/playerPurplePiece.png'
import playerWhitePointerImg from 'assets/playerWhitePointer.png'
import playerBlackPointerImg from 'assets/playerBlackPointer.png'
import playerBluePointerImg from 'assets/playerBluePointer.png'
import playerGreenPointerImg from 'assets/playerGreenPointer.png'
import playerRedPointerImg from 'assets/playerRedPointer.png'
import playerYellowPointerImg from 'assets/playerYellowPointer.png'
import playerPurplePointerImg from 'assets/playerPurplePointer.png'
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

export const playerPieces: Record<PlayerColor, string> = {
  white: playerWhitePieceImg,
  black: playerBlackPieceImg,
  blue: playerBluePieceImg,
  green: playerGreenPieceImg,
  red: playerRedPieceImg,
  yellow: playerYellowPieceImg,
  purple: playerPurplePieceImg,
}
export const playerPointers: Record<PlayerColor, string> = {
  white: playerWhitePointerImg,
  black: playerBlackPointerImg,
  blue: playerBluePointerImg,
  green: playerGreenPointerImg,
  red: playerRedPointerImg,
  yellow: playerYellowPointerImg,
  purple: playerPurplePointerImg,
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
