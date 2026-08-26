import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" ADD COLUMN "homepage_hero_declaration_line" varchar;
  ALTER TABLE "settings" ADD COLUMN "homepage_hero_background_video_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP COLUMN "homepage_hero_declaration_line";
  ALTER TABLE "settings" DROP COLUMN "homepage_hero_background_video_url";`)
}
