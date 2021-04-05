import { combineReducers } from '@reduxjs/toolkit'
import { gameListReducer, gameReducer, newGameDataReducer } from '../game/redux'
import { userReducer } from '../user/redux'

export const rootReducer = combineReducers({
  user: userReducer,
  game: gameReducer,
  gameList: gameListReducer,
  newGameData: newGameDataReducer,
})
