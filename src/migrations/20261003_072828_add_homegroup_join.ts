import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_form_submissions_form_type" ADD VALUE 'homegroup-join';
  ALTER TABLE "form_submissions" ADD COLUMN "interested_homegroup_id" integer;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_interested_homegroup_id_homegroups_id_fk" FOREIGN KEY ("interested_homegroup_id") REFERENCES "public"."homegroups"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "form_submissions_interested_homegroup_idx" ON "form_submissions" USING btree ("interested_homegroup_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "form_submissions" DROP CONSTRAINT "form_submissions_interested_homegroup_id_homegroups_id_fk";
  
  ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_form_submissions_form_type";
  CREATE TYPE "public"."enum_form_submissions_form_type" AS ENUM('contact', 'appointment', 'membership', 'reference-letter', 'welfare', 'step-of-faith');
  ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE "public"."enum_form_submissions_form_type" USING "form_type"::"public"."enum_form_submissions_form_type";
  DROP INDEX "form_submissions_interested_homegroup_idx";
  ALTER TABLE "form_submissions" DROP COLUMN "interested_homegroup_id";`)
}
