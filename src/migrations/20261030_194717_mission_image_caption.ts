import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_split_feature" ADD COLUMN "image_caption" varchar;
  ALTER TABLE "_pages_v_blocks_split_feature" ADD COLUMN "image_caption" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_split_feature" DROP COLUMN "image_caption";
  ALTER TABLE "_pages_v_blocks_split_feature" DROP COLUMN "image_caption";`)
}
