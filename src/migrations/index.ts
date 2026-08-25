import * as migration_20260825_135307_initial from './20260825_135307_initial';

export const migrations = [
  {
    up: migration_20260825_135307_initial.up,
    down: migration_20260825_135307_initial.down,
    name: '20260825_135307_initial'
  },
];
