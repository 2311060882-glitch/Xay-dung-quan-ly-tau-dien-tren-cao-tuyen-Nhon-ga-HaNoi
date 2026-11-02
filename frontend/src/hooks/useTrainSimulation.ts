// src/hooks/useMultiTrainSimulation.ts
import { useState, useEffect } from 'react';
import { type Station } from '../data/stationsData';

export interface ActiveTrain {
  id: string;
  code: string;
  stationIndex: number;
  progress: number; // 0% - 100% giữa 2 ga
  speed: number;
  direction: 'forward' | 'backward';
}

export function useMultiTrainSimulation(stations: Station[]) {
  const [trains, setTrains] = useState<ActiveTrain[]>([
    { id: '1', code: 'HN-01', stationIndex: 0, progress: 20, speed: 3, direction: 'forward' },
    { id: '2', code: 'HN-02', stationIndex: 3, progress: 60, speed: 4, direction: 'forward' },
    { id: '3', code: 'HN-03', stationIndex: 6, progress: 10, speed: 3, direction: 'backward' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrains((prevTrains) =>
        prevTrains.map((train) => {
          let newProgress = train.progress + train.speed;
          let newIndex = train.stationIndex;
          let newDir = train.direction;

          if (newProgress >= 100) {
            newProgress = 0;
            if (newDir === 'forward') {
              if (newIndex >= stations.length - 2) {
                newDir = 'backward';
                newIndex = stations.length - 1;
              } else {
                newIndex += 1;
              }
            } else {
              if (newIndex <= 1) {
                newDir = 'forward';
                newIndex = 0;
              } else {
                newIndex -= 1;
              }
            }
          }

          return { ...train, progress: newProgress, stationIndex: newIndex, direction: newDir };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [stations.length]);

  return { trains };
}