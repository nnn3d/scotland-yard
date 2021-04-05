import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from 'redux/configureStore'
import { Provider as ReduxProvider } from 'react-redux'
import {
  ThemeProvider as MuiThemeProvider,
  StylesProvider as MuiStylesProvider,
} from '@material-ui/core'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { badge, badgeRu, log } from '@logux/client'
import { badgeStyles } from '@logux/client/badge/styles'
import theme from './theme'
import { App } from './App'

const store = configureStore()

badge(store.client, { messages: badgeRu, styles: badgeStyles })

declare global {
  interface Window {
    store: unknown
  }
}

if (process.env.NODE_ENV === 'development') {
  window.store = store
  log(store.client)
}

ReactDOM.render(
  <BrowserRouter>
    <ReduxProvider store={store}>
      <MuiStylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <StyledThemeProvider theme={theme}>
            <App />
          </StyledThemeProvider>
        </MuiThemeProvider>
      </MuiStylesProvider>
    </ReduxProvider>
  </BrowserRouter>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register()
