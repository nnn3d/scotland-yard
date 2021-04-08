import { Navigate, Route, Routes } from 'react-router-dom'
import React from 'react'
import { gameDetectivesRoute, gameRoute, homeRoute } from 'constants/routes'
import { HomePage } from './HomePage/HomePage'
import { GamePage } from 'pages/GamePage/GamePage'

export function Pages() {
  return (
    <Routes>
      <Route path={homeRoute.path} element={<HomePage />} />
      <Route path={gameRoute.path} element={<GamePage />} />
      <Route
        path={gameDetectivesRoute.path}
        element={<GamePage detectivesMap />}
      />
      <Route path={'*'} element={<Navigate to={homeRoute.link()} />} />
    </Routes>
  )
}
