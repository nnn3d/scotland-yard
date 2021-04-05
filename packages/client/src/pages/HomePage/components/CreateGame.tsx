import { useDispatch, useSelector } from 'react-redux'
import {
  Button,
  Grid,
  Radio,
  Typography,
  FormControlLabel,
  TextFieldProps,
} from '@material-ui/core'
import { gameActions, newGameDataActions } from 'common/modules/game/redux'
import React, { useMemo } from 'react'
import { useUserId } from 'hooks/useUserId'
import { Field, FieldRenderProps, Form, useForm } from 'react-final-form'
import { validateGameName } from 'common/modules/game/validators'
import { MuiField } from 'components/MuiField'
import {
  DETECTIVE_COLORS,
  PLAYER_COLORS,
  PlayerColor,
} from 'common/modules/game/types/PlayerColor'
import Autocomplete from '@material-ui/lab/autocomplete'
import { GAME_CONFIG } from 'common/modules/game/constants/gameConfig'
import { MR_X_COLOR } from 'common/modules/game/types/MrX'

const required = (value: string) => {
  if (!value) return 'Обязательное поле'
}

export function CreateGame() {
  const userId = useUserId()
  const dispatch = useDispatch()

  const initialValues = useMemo(
    () => ({ name: '', mrX: '0', players: { player0: userId } }),
    [userId],
  )

  return (
    <Form
      subscription={{ values: true }}
      initialValues={initialValues}
      onSubmit={async (
        {
          name,
          players,
          mrX,
        }: {
          name: string
          players: Record<string, string>
          mrX: string
        },
        form,
      ) => {
        const playersMap = {} as Record<PlayerColor, string>
        const colors = DETECTIVE_COLORS.slice()
        const mrXIndex = Number(mrX)

        Object.values(players).forEach((userName, index) => {
          if (index === mrXIndex) {
            playersMap[MR_X_COLOR] = userName
          } else {
            const colorIndex = Math.floor(Math.random() * colors.length)
            const [color] = colors.splice(colorIndex, 1)
            playersMap[color] = userName
          }
        })
        await dispatch.sync(
          gameActions.createGame({ name, players: playersMap }),
        )
        form.reset()
        dispatch(newGameDataActions.clear())
      }}
    >
      {({ values, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} direction={'column'}>
            <Grid item>
              <Typography variant={'h3'}>Новая игра</Typography>
            </Grid>
            <Grid item>
              <Field
                name={'name'}
                label={'Название'}
                validate={validateGameName}
                component={MuiField}
              />
            </Grid>
            {PLAYER_COLORS.map((_, index) => (
              <Grid
                key={index}
                item
                container
                wrap={'nowrap'}
                direction={'row'}
                spacing={3}
              >
                <Grid item md={'auto'} style={{ flexGrow: 1 }}>
                  <Field
                    number={index}
                    name={`players.player${index}`}
                    label={`Игрок ${index + 1}`}
                    disabled={!index}
                    validate={
                      GAME_CONFIG.minPlayers > index ? required : undefined
                    }
                    component={index ? PlayerField : MuiField}
                  />
                </Grid>
                <Grid
                  item
                  md={'auto'}
                  style={{ flex: 'none', marginTop: '8px' }}
                >
                  <Field
                    name={`mrX`}
                    value={String(index)}
                    type={'radio'}
                    validate={required}
                    render={({ input, meta }) => (
                      <FormControlLabel
                        disabled={
                          !values.players[`player${index}`] &&
                          index >= GAME_CONFIG.minPlayers
                        }
                        control={<Radio />}
                        label={'mr. X'}
                        {...input}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            ))}
            <Grid item>
              <Button type={'submit'} variant={'contained'} color={'primary'}>
                создать игру
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </Form>
  )
}

function PlayerField({
  number,
  input,
  meta,
  ...rest
}: { number: number } & TextFieldProps & FieldRenderProps<string>) {
  const dispatch = useDispatch()
  const { name = '', completions = [] } =
    useSelector((state) => state.newGameData.players[number]) || {}
  const form = useForm()

  const {
    values: { players },
  } = form.getState()

  const options = completions.filter(
    (userName) => !Object.values(players).includes(userName),
  )

  return (
    <Autocomplete
      options={options}
      onInputChange={(e, value, reason) => {
        if (
          reason !== 'reset' &&
          !value &&
          form.getState().values.mrX === String(number)
        ) {
          if (number >= GAME_CONFIG.minPlayers) {
            form.change('mrX', '0')
          }
          input.onChange('')
        }
        if (name !== value) {
          dispatch.sync(newGameDataActions.change({ number, name: value }))
        }
      }}
      onChange={(e, value, reason) => {
        if (reason === 'select-option') {
          dispatch(newGameDataActions.change({ number, name: value || '' }))
          input.onChange(value)
        }
      }}
      renderInput={(params) => (
        <MuiField
          input={{
            ...input,
            ...params.inputProps,
            value: name,
          }}
          meta={meta}
          {...rest}
          {...params}
        />
      )}
    />
  )
}
