import { createRoute } from 'common/utils/createRoute'

export const homeRoute = createRoute('/')
export const gameRoute = createRoute('/game/:id')
export const gameDetectivesRoute = createRoute('/game/:id/detectives')
