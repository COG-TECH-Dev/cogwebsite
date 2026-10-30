import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_team_grid_members" ADD COLUMN "message" varchar;
  ALTER TABLE "_pages_v_blocks_team_grid_members" ADD COLUMN "message" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_team_grid_members" DROP COLUMN "message";
  ALTER TABLE "_pages_v_blocks_team_grid_members" DROP COLUMN "message";`)
}
