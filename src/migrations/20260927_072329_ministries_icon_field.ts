import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ministries_icon" AS ENUM('cross', 'book', 'flame', 'heart', 'users', 'prayer', 'globe', 'church', 'sparkles', 'water', 'sun', 'music', 'home', 'compass', 'crown', 'scroll', 'lightbulb', 'star', 'dove', 'shield', 'eye', 'target', 'pin', 'handshake');
  ALTER TABLE "ministries" ADD COLUMN "icon" "enum_ministries_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ministries" DROP COLUMN "icon";
  DROP TYPE "public"."enum_ministries_icon";`)
}
