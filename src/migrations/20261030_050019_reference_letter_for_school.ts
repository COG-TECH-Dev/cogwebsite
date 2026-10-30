import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_form_submissions_letter_type" ADD VALUE 'school' BEFORE 'other';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "form_submissions" ALTER COLUMN "letter_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_form_submissions_letter_type";
  CREATE TYPE "public"."enum_form_submissions_letter_type" AS ENUM('character', 'membership-confirmation', 'financial', 'other');
  ALTER TABLE "form_submissions" ALTER COLUMN "letter_type" SET DATA TYPE "public"."enum_form_submissions_letter_type" USING "letter_type"::"public"."enum_form_submissions_letter_type";`)
}
