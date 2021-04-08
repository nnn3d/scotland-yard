import { useGame } from 'pages/GamePage/components/GameContext'
import { Button, Dialog, DialogActions, DialogTitle } from '@material-ui/core'
import { useState } from 'react'
import { homeRoute } from 'constants/routes'
import { Link } from 'react-router-dom'
import React from 'react'

export function GameOver() {
  const [isClosed, setIsClosed] = useState(false)
  const game = useGame()
  const gameOver = game.gameOver.use()

  return (
    <Dialog open={!!gameOver && !isClosed}>
      <DialogTitle>
        {gameOver === 'mrXWin' ? 'Мистер X победил!' : 'Детективы победили!'}
      </DialogTitle>
      <DialogActions>
        <Button color={'secondary'} component={Link} to={homeRoute.link()}>
          На главную
        </Button>
        <Button onClick={() => setIsClosed(true)}>Смотреть карту</Button>
      </DialogActions>
    </Dialog>
  )
}
