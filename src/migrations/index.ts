import * as migration_20260825_135307_initial from './20260825_135307_initial';
import * as migration_20260826_034002_add_social_links from './20260826_034002_add_social_links';
import * as migration_20260826_051159_add_hero_video_and_declaration from './20260826_051159_add_hero_video_and_declaration';
import * as migration_20260826_053847_add_card_grid_block from './20260826_053847_add_card_grid_block';
import * as migration_20260927_060229_about_redesign_blocks from './20260927_060229_about_redesign_blocks';
import * as migration_20260927_072329_ministries_icon_field from './20260927_072329_ministries_icon_field';
import * as migration_20260927_082258_add_giving_global from './20260927_082258_add_giving_global';
import * as migration_20260928_060444_add_youtube_channel_id from './20260928_060444_add_youtube_channel_id';
import * as migration_20260928_062931_add_reference_letter_and_start_here from './20260928_062931_add_reference_letter_and_start_here';
import * as migration_20260928_082256_add_event_registrations from './20260928_082256_add_event_registrations';
import * as migration_20260928_083012_add_testimonial_status from './20260928_083012_add_testimonial_status';
import * as migration_20260929_041122_add_donations_and_funds from './20260929_041122_add_donations_and_funds';
import * as migration_20260929_083042_add_donation_branch from './20260929_083042_add_donation_branch';
import * as migration_20260930_230943_add_homegroups_welfare_stepoffaith_childsafeguarding from './20260930_230943_add_homegroups_welfare_stepoffaith_childsafeguarding';
import * as migration_20261003_072828_add_homegroup_join from './20261003_072828_add_homegroup_join';
import * as migration_20261003_081222_add_news_missions_prayer_routing_firsttimer from './20261003_081222_add_news_missions_prayer_routing_firsttimer';
import * as migration_20261003_190037_media_item_multiple_pages from './20261003_190037_media_item_multiple_pages';
import * as migration_20261004_070759_safeguarding_page_and_concerns from './20261004_070759_safeguarding_page_and_concerns';
import * as migration_20261005_060443_event_time_label from './20261005_060443_event_time_label';
import * as migration_20261005_061445_resource_ebook_and_form_types from './20261005_061445_resource_ebook_and_form_types';
import * as migration_20261005_062541_ministry_classes_and_contact from './20261005_062541_ministry_classes_and_contact';
import * as migration_20261005_065146_first_timer_youth_volunteer_weekly from './20261005_065146_first_timer_youth_volunteer_weekly';

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
    name: '20260826_051159_add_hero_video_and_declaration',
  },
  {
    up: migration_20260826_053847_add_card_grid_block.up,
    down: migration_20260826_053847_add_card_grid_block.down,
    name: '20260826_053847_add_card_grid_block',
  },
  {
    up: migration_20260927_060229_about_redesign_blocks.up,
    down: migration_20260927_060229_about_redesign_blocks.down,
    name: '20260927_060229_about_redesign_blocks',
  },
  {
    up: migration_20260927_072329_ministries_icon_field.up,
    down: migration_20260927_072329_ministries_icon_field.down,
    name: '20260927_072329_ministries_icon_field',
  },
  {
    up: migration_20260927_082258_add_giving_global.up,
    down: migration_20260927_082258_add_giving_global.down,
    name: '20260927_082258_add_giving_global',
  },
  {
    up: migration_20260928_060444_add_youtube_channel_id.up,
    down: migration_20260928_060444_add_youtube_channel_id.down,
    name: '20260928_060444_add_youtube_channel_id',
  },
  {
    up: migration_20260928_062931_add_reference_letter_and_start_here.up,
    down: migration_20260928_062931_add_reference_letter_and_start_here.down,
    name: '20260928_062931_add_reference_letter_and_start_here',
  },
  {
    up: migration_20260928_082256_add_event_registrations.up,
    down: migration_20260928_082256_add_event_registrations.down,
    name: '20260928_082256_add_event_registrations',
  },
  {
    up: migration_20260928_083012_add_testimonial_status.up,
    down: migration_20260928_083012_add_testimonial_status.down,
    name: '20260928_083012_add_testimonial_status',
  },
  {
    up: migration_20260929_041122_add_donations_and_funds.up,
    down: migration_20260929_041122_add_donations_and_funds.down,
    name: '20260929_041122_add_donations_and_funds',
  },
  {
    up: migration_20260929_083042_add_donation_branch.up,
    down: migration_20260929_083042_add_donation_branch.down,
    name: '20260929_083042_add_donation_branch',
  },
  {
    up: migration_20260930_230943_add_homegroups_welfare_stepoffaith_childsafeguarding.up,
    down: migration_20260930_230943_add_homegroups_welfare_stepoffaith_childsafeguarding.down,
    name: '20260930_230943_add_homegroups_welfare_stepoffaith_childsafeguarding',
  },
  {
    up: migration_20261003_072828_add_homegroup_join.up,
    down: migration_20261003_072828_add_homegroup_join.down,
    name: '20261003_072828_add_homegroup_join',
  },
  {
    up: migration_20261003_081222_add_news_missions_prayer_routing_firsttimer.up,
    down: migration_20261003_081222_add_news_missions_prayer_routing_firsttimer.down,
    name: '20261003_081222_add_news_missions_prayer_routing_firsttimer',
  },
  {
    up: migration_20261003_190037_media_item_multiple_pages.up,
    down: migration_20261003_190037_media_item_multiple_pages.down,
    name: '20261003_190037_media_item_multiple_pages',
  },
  {
    up: migration_20261004_070759_safeguarding_page_and_concerns.up,
    down: migration_20261004_070759_safeguarding_page_and_concerns.down,
    name: '20261004_070759_safeguarding_page_and_concerns',
  },
  {
    up: migration_20261005_060443_event_time_label.up,
    down: migration_20261005_060443_event_time_label.down,
    name: '20261005_060443_event_time_label',
  },
  {
    up: migration_20261005_061445_resource_ebook_and_form_types.up,
    down: migration_20261005_061445_resource_ebook_and_form_types.down,
    name: '20261005_061445_resource_ebook_and_form_types',
  },
  {
    up: migration_20261005_062541_ministry_classes_and_contact.up,
    down: migration_20261005_062541_ministry_classes_and_contact.down,
    name: '20261005_062541_ministry_classes_and_contact',
  },
  {
    up: migration_20261005_065146_first_timer_youth_volunteer_weekly.up,
    down: migration_20261005_065146_first_timer_youth_volunteer_weekly.down,
    name: '20261005_065146_first_timer_youth_volunteer_weekly'
  },
];
