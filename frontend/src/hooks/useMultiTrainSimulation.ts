// src/hooks/useMultiTrainSimulation.ts
import { useState, useEffect } from 'react';
import { type Station } from '../data/stationsData';

export interface ActiveTrain {
  id: string;
  code: string;
  stationIndex: number;
  progress: number;
  speed: number;
  direction: 'forward' | 'backward';
  status: 'moving' | 'waiting';
  waitTimer: number;
}

function buildInitialTrains(stations: Station[]): ActiveTrain[] {
  if (!stations || stations.length === 0) return [];

  const maxIndex = stations.length - 1;

  return [
    { id: '1', code: 'HN-01', stationIndex: 0, progress: 0, speed: 3, direction: 'forward', status: 'waiting', waitTimer: 2 },
    { id: '2', code: 'HN-02', stationIndex: Math.floor(maxIndex / 2), progress: 40, speed: 4, direction: 'forward', status: 'moving', waitTimer: 0 },
    { id: '3', code: 'HN-03', stationIndex: maxIndex > 2 ? maxIndex - 1 : maxIndex, progress: 0, speed: 3, direction: 'backward', status: 'waiting', waitTimer: 4 },
  ];
}

export function useMultiTrainSimulation(stations: Station[]) {
  const [trains, setTrains] = useState<ActiveTrain[]>(() => buildInitialTrains(stations));

  useEffect(() => {
    if (!stations || stations.length === 0) return;

    const interval = setInterval(() => {
      setTrains((prevTrains) =>
        prevTrains.map((train) => {
          if (train.status === 'waiting') {
            if (train.waitTimer > 0) return { ...train, waitTimer: train.waitTimer - 1 };
            return { ...train, status: 'moving', progress: 0 };
          }

          const newProgress = train.progress + train.speed;

          if (newProgress >= 100) {
            let newIndex = train.stationIndex;
            let newDir = train.direction;

            if (newDir === 'forward') {
              if (newIndex >= stations.length - 2) {
                newDir = 'backward';
                newIndex = stations.length - 1;
              } else newIndex += 1;
            } else {
              if (newIndex <= 1) {
                newDir = 'forward';
                newIndex = 0;
              } else newIndex -= 1;
            }
            return { ...train, progress: 0, stationIndex: newIndex, direction: newDir, status: 'waiting', waitTimer: 3 };
          }
          return { ...train, progress: newProgress };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [stations]);

  return { trains };
}