import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
} from '@material-ui/core'
import { useUserId } from 'hooks/useUserId'
import { useSubscription } from '@logux/redux'
import { gameListChannel } from 'common/modules/game/channels'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { gameDetectivesRoute, gameRoute } from 'constants/routes'
import { gameActions } from 'common/modules/game/redux'

export function GameList() {
  const userId = useUserId()
  const isSubscribing = useSubscription([gameListChannel.link()])
  const gameList = useSelector((state) => state.gameList)
  const dispatch = useDispatch()

  return (
    <Grid container direction={'column'} spacing={3}>
      <Grid item>
        <Typography variant={'h3'}>Ваши игры</Typography>
      </Grid>
      {isSubscribing && (
        <Grid item>
          <LinearProgress />
        </Grid>
      )}
      {!isSubscribing &&
        (gameList?.length ? (
          gameList.map((item) => (
            <Grid item key={item.id}>
              <Card>
                <CardContent>
                  <Grid container direction={'column'} spacing={1}>
                    <Grid item>
                      <Typography variant={'h4'}>{item.name}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant={'body1'}>
                        Создана {item.ownerName} (
                        {new Date(item.createdAt).toLocaleDateString()})
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Grid container item spacing={2}>
                        {item.players.map((player) => (
                          <Grid item>
                            <Chip label={player} size={'small'} />
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    to={gameRoute.link({ id: item.id })}
                    size={'small'}
                  >
                    играть
                  </Button>
                  {item.ownerName === userId && (
                    <>
                      <Button
                        component={Link}
                        to={gameDetectivesRoute.link({ id: item.id })}
                        size={'small'}
                        color={'secondary'}
                      >
                        карта детективов
                      </Button>
                      <Button
                        style={{ marginLeft: 'auto' }}
                        size={'small'}
                        color={'secondary'}
                        onClick={() => {
                          if (window.confirm('Точно удалить?')) {
                            dispatch.sync(gameActions.delete({ _id: item.id }))
                          }
                        }}
                      >
                        удалить
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item>
            <Typography variant={'body1'}>Пока игр нет :(</Typography>
          </Grid>
        ))}
    </Grid>
  )
}
