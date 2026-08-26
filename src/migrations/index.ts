import * as migration_20260825_135307_initial from './20260825_135307_initial';
import * as migration_20260826_034002_add_social_links from './20260826_034002_add_social_links';
import * as migration_20260826_051159_add_hero_video_and_declaration from './20260826_051159_add_hero_video_and_declaration';

export const migrations = [
  {
    up: migration_20260825_135307_initial.up,
    down: migration_20260825_135307_initial.down,
    name: '20260825_135307_initial',
  },
  {
    up: migration_20260826_034002_add_social_links.up,
    down: migration_20260826_034002_add_social_links.down,
    name: '20260826_034002_add_social_links',
  },
  {
    up: migration_20260826_051159_add_hero_video_and_declaration.up,
    down: migration_20260826_051159_add_hero_video_and_declaration.down,
    name: '20260826_051159_add_hero_video_and_declaration'
  },
];
