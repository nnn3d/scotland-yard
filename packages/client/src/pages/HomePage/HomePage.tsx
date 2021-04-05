import { DefaultContainer } from 'components/DefaultContainer'
import { LoginForm } from './components/LoginForm'
import React from 'react'
import { Header } from 'pages/HomePage/components/Header'
import { useIsGuestUser } from 'hooks/useIsGuestUser'
import { GameList } from 'pages/HomePage/components/GameList'
import { CreateGame } from 'pages/HomePage/components/CreateGame'
import { Grid } from '@material-ui/core'
import { SBox } from 'components/SBox'

export function HomePage() {
  const isGuest = useIsGuestUser()

  return (
    <>
      <Header />
      <DefaultContainer>
        <SBox my={5}>
          {isGuest && <LoginForm />}
          {!isGuest && (
            <Grid container direction={'column'} spacing={5}>
              <Grid item>
                <GameList />
              </Grid>
              <Grid item>
                <CreateGame />
              </Grid>
            </Grid>
          )}
        </SBox>
      </DefaultContainer>
    </>
  )
}
