import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_testimonials_status" AS ENUM('pending-review', 'approved');
  ALTER TABLE "testimonials" ADD COLUMN "submitter_email" varchar;
  ALTER TABLE "testimonials" ADD COLUMN "status" "enum_testimonials_status" DEFAULT 'approved';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials" DROP COLUMN "submitter_email";
  ALTER TABLE "testimonials" DROP COLUMN "status";
  DROP TYPE "public"."enum_testimonials_status";`)
}
