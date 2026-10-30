import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_form_submissions_form_type" ADD VALUE 'book-order';
  ALTER TABLE "bookstore_items" ALTER COLUMN "external_purchase_link" DROP NOT NULL;
  ALTER TABLE "bookstore_items" ADD COLUMN "description" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "book_title" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "quantity" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_form_submissions_form_type";
  CREATE TYPE "public"."enum_form_submissions_form_type" AS ENUM('contact', 'appointment', 'membership', 'reference-letter', 'welfare', 'step-of-faith', 'homegroup-join', 'first-timer', 'mission-trip', 'campus-connect', 'ministry-message');
  ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE "public"."enum_form_submissions_form_type" USING "form_type"::"public"."enum_form_submissions_form_type";
  ALTER TABLE "bookstore_items" ALTER COLUMN "external_purchase_link" SET NOT NULL;
  ALTER TABLE "bookstore_items" DROP COLUMN "description";
  ALTER TABLE "form_submissions" DROP COLUMN "book_title";
  ALTER TABLE "form_submissions" DROP COLUMN "quantity";`)
}
