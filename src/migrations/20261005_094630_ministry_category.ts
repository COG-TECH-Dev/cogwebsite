import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ministries_category" AS ENUM('children-youth', 'worship-arts', 'fellowship-family', 'outreach-missions', 'prayer-care', 'service-teams');
  ALTER TABLE "ministries" ADD COLUMN "category" "enum_ministries_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ministries" DROP COLUMN "category";
  DROP TYPE "public"."enum_ministries_category";`)
}
