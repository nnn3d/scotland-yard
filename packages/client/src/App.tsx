import React from 'react'
import { CssBaseline } from '@material-ui/core'
import { Pages } from 'pages/Pages'
import { GlobalLoader } from 'components/GlobalLoader'
import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  body {
    //overflow-y: scroll;
  }
`

export function App() {
  return (
    <>
      <GlobalStyles />
      <CssBaseline />
      <GlobalLoader />
      <Pages />
    </>
  )
}
