import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" ADD COLUMN "social_links_tiktok" varchar;
  ALTER TABLE "settings" ADD COLUMN "social_links_radio_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP COLUMN "social_links_tiktok";
  ALTER TABLE "settings" DROP COLUMN "social_links_radio_url";`)
}
