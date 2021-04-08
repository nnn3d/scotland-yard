/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const positionsRaw = require('./positionsRaw.json')
const routes = require('./routes.json')

const startX = -1190 // -1138
const endX = 2710 // 2671
const startY = -2350 // -2269
const endY = 580 // 535

const width = endX - startX
const height = endY - startY

const positions = positionsRaw.map(({ x, y }, index) => {
  const left = (x - startX) / width
  const top = 1 - (y - startY) / height

  if (left < 0) throw new Error(`left < 0: ${left}, index ${index}`)
  if (left > 1) throw new Error(`left > 1: ${left}, index ${index}`)
  if (top < 0) throw new Error(`top < 0: ${top}, index ${index}`)
  if (top > 1) throw new Error(`top > 1: ${top}, index ${index}`)

  return { left, top }
})

const ticketTypes = ['taxi', 'bus', 'underground']

const stations = positions.map((position, index) => {
  const stationIndex = index + 1
  let typeIndex = 0

  const connections = routes
    .filter((route) => route.includes(stationIndex))
    .map(([indexA, indexB, ticket]) => {
      const destination = (stationIndex === indexA ? indexB : indexA) - 1
      typeIndex = Math.max(ticketTypes.indexOf(ticket) || 0, typeIndex)
      return { destination, ticket }
    })
    .reduce((obj, { destination, ticket }) => {
      obj[destination] = obj[destination] || []
      obj[destination].push(ticket)
      return obj
    }, {})

  return {
    ...position,
    index: index,
    routes: connections,
    type: ticketTypes[typeIndex],
  }
})

fs.writeFileSync('./stations.json', JSON.stringify(stations, null, 2))
