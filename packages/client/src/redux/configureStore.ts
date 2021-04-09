import { getDefaultMiddleware, applyMiddleware } from '@reduxjs/toolkit'
import { createLoguxCreator } from '@logux/redux'
import { rootReducer } from 'common/modules/redux/rootReducer'
import { GUEST_USER, userActions } from 'common/modules/user/redux'
import { homeRoute } from 'constants/routes'
import { LoguxDispatch } from '@logux/redux/create-logux-creator'
import { AnyAction } from '@logux/core'

function logout() {
  localStorage.removeItem('userId')
  localStorage.removeItem('token')
  window.location.href = homeRoute.link()
}

export const configureStore = () => {
  const createStore = createLoguxCreator({
    subprotocol: '1.0.0',
    server:
      process.env.NODE_ENV === 'development'
        ? `ws://${window.location.hostname}:4000`
        : `wss://${window.location.hostname}`,
    allowDangerousProtocol: process.env.NODE_ENV === 'development',
    userId: localStorage.getItem('userId') || GUEST_USER,
    token: localStorage.getItem('token') || '',
  })

  let middleware = applyMiddleware(...getDefaultMiddleware())

  const composeEnhancers = (process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__' as any]) as any

  if (composeEnhancers) {
    middleware = composeEnhancers(middleware)
  }

  const store = createStore(rootReducer, middleware)

  store.client.on('add', (action) => {
    if (action.type === userActions.done.type) {
      const { payload } = action as ReturnType<typeof userActions.done>
      localStorage.setItem('userId', payload.userId)
      localStorage.setItem('token', payload.token)
      window.location.reload()
    } else if (action.type === userActions.logout.type) {
      logout()
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store.client.node.on('error', (error: any) => {
    if (error.type === 'wrong-credentials') {
      logout()
    }
  })

  store.client.start()

  return store
}

export type AppStore = ReturnType<typeof configureStore>

export type AppState = ReturnType<AppStore['getState']>

// type AppDispatch = typeof store.dispatch

// type AppAction = AppDispatch extends (a: infer A) => any ? A : never

// declare module 'redux' {
//   interface Store extends AppStore {}
// }

declare module 'react-redux' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultRootState extends AppState {}

  function useStore(): AppStore
  function useDispatch(): LoguxDispatch<AnyAction>
}

declare module '@logux/core' {
  function parseId(
    id: string,
  ): {
    clientId: string
    nodeId: string
    userId: string
  }
}
