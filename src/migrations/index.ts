import * as migration_20260825_135307_initial from './20260825_135307_initial';
import * as migration_20260826_034002_add_social_links from './20260826_034002_add_social_links';

export const migrations = [
  {
    up: migration_20260825_135307_initial.up,
    down: migration_20260825_135307_initial.down,
    name: '20260825_135307_initial',
  },
  {
    up: migration_20260826_034002_add_social_links.up,
    down: migration_20260826_034002_add_social_links.down,
    name: '20260826_034002_add_social_links'
  },
];
