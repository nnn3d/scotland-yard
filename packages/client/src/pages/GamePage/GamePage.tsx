import styled from 'styled-components'
import mapImg from 'assets/map.png'
import React from 'react'
import taxiStationImg from 'assets/taxiStation.png'
import taxiStationActiveImg from 'assets/taxiStationActive.png'
import { STATIONS } from 'common/modules/game/constants/stations'

export function GamePage() {
  return (
    <SContainer>
      <SMapImg src={mapImg} />
      {STATIONS.map((station) => (
        <SStation key={station.index} left={station.left} top={station.top}>
          {station.index + 1}
        </SStation>
      ))}
    </SContainer>
  )
}

const SContainer = styled.div`
  position: relative;
  display: flex;
  font-size: 1vw;
  overflow: hidden;
`

const SMapImg = styled.img`
  width: 100%;
  height: auto;
  flex: 0;
`
const SStation = styled('div')<{ left: number; top: number }>`
  ${({ theme }) => theme.typography.body1};
  position: absolute;
  left: ${({ left }) => left * 100 + '%'};
  top: ${({ top }) => top * 100 + '%'};
  font-size: 1.2em;
  width: 2.5em;
  height: 2.5em;
  transform: translate(-50%, -50%);
  background: url(${taxiStationImg}) no-repeat center;
  background-size: 120% auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding-bottom: 1%;
  text-shadow: 0 0 0.1em
    ${({ theme }) => theme.palette.getContrastText(theme.palette.text.primary)};
  transition: background-image 0.3s ease;
  font-family: Bebas Neue, monospace;
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    background-image: url(${taxiStationActiveImg});
  }
`
