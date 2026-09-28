import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_form_submissions_letter_type" AS ENUM('character', 'membership-confirmation', 'financial', 'other');
  ALTER TYPE "public"."enum_resources_type" ADD VALUE 'start-here' BEFORE 'devotional';
  ALTER TYPE "public"."enum_form_submissions_form_type" ADD VALUE 'reference-letter';
  ALTER TABLE "form_submissions" ADD COLUMN "interested_ministry_id" integer;
  ALTER TABLE "form_submissions" ADD COLUMN "letter_type" "enum_form_submissions_letter_type";
  ALTER TABLE "form_submissions" ADD COLUMN "purpose" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "required_by_date" timestamp(3) with time zone;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_interested_ministry_id_ministries_id_fk" FOREIGN KEY ("interested_ministry_id") REFERENCES "public"."ministries"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "form_submissions_interested_ministry_idx" ON "form_submissions" USING btree ("interested_ministry_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "form_submissions" DROP CONSTRAINT "form_submissions_interested_ministry_id_ministries_id_fk";
  
  ALTER TABLE "resources" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_resources_type";
  CREATE TYPE "public"."enum_resources_type" AS ENUM('devotional', 'reading-plan', 'topical-guide');
  ALTER TABLE "resources" ALTER COLUMN "type" SET DATA TYPE "public"."enum_resources_type" USING "type"::"public"."enum_resources_type";
  ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_form_submissions_form_type";
  CREATE TYPE "public"."enum_form_submissions_form_type" AS ENUM('contact', 'appointment', 'membership');
  ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE "public"."enum_form_submissions_form_type" USING "form_type"::"public"."enum_form_submissions_form_type";
  DROP INDEX "form_submissions_interested_ministry_idx";
  ALTER TABLE "form_submissions" DROP COLUMN "interested_ministry_id";
  ALTER TABLE "form_submissions" DROP COLUMN "letter_type";
  ALTER TABLE "form_submissions" DROP COLUMN "purpose";
  ALTER TABLE "form_submissions" DROP COLUMN "required_by_date";
  DROP TYPE "public"."enum_form_submissions_letter_type";`)
}
