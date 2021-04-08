import { createContext, useContext } from 'react'
import { GameRedux } from 'redux/GameRedux'

export const GameContext = createContext<{
  game?: GameRedux
  isDetectivesMap?: boolean
}>({})

export const useGame = () => useContext(GameContext).game as GameRedux
export const useIsDetectivesMap = () =>
  useContext(GameContext).isDetectivesMap as boolean
