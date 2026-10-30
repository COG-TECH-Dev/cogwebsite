import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" ADD COLUMN "lead_pastor_photo_id" integer;
  ALTER TABLE "settings" ADD COLUMN "lead_pastor_welcome" varchar;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_lead_pastor_photo_id_media_id_fk" FOREIGN KEY ("lead_pastor_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "settings_lead_pastor_lead_pastor_photo_idx" ON "settings" USING btree ("lead_pastor_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP CONSTRAINT "settings_lead_pastor_photo_id_media_id_fk";
  
  DROP INDEX "settings_lead_pastor_lead_pastor_photo_idx";
  ALTER TABLE "settings" DROP COLUMN "lead_pastor_photo_id";
  ALTER TABLE "settings" DROP COLUMN "lead_pastor_welcome";`)
}
