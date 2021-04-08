import { createRoute } from 'common/utils/createRoute'

export const gameListChannel = createRoute('gameList')

export const gameUserChannel = createRoute('game/:id/:userId')
export const gameDetectivesChannel = createRoute('gameDetectives/:id')
