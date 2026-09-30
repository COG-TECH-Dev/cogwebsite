import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_child_safeguarding_forms_form_type" AS ENUM('photo-consent', 'volunteer-interest', 'pre-registration');
  CREATE TYPE "public"."enum_child_safeguarding_forms_photo_consent" AS ENUM('consent', 'decline');
  CREATE TYPE "public"."enum_child_safeguarding_forms_status" AS ENUM('new', 'in-progress', 'resolved');
  CREATE TYPE "public"."enum_form_submissions_support_type" AS ENUM('financial', 'counselling', 'food', 'other');
  CREATE TYPE "public"."enum_form_submissions_decision_type" AS ENUM('first-time', 'recommitting', 'learn-more');
  ALTER TYPE "public"."enum_form_submissions_form_type" ADD VALUE 'welfare';
  ALTER TYPE "public"."enum_form_submissions_form_type" ADD VALUE 'step-of-faith';
  CREATE TABLE "homegroups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"area" varchar NOT NULL,
  	"leader_name" varchar,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"meeting_day" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "child_safeguarding_forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_type" "enum_child_safeguarding_forms_form_type" NOT NULL,
  	"parent_name" varchar NOT NULL,
  	"parent_email" varchar NOT NULL,
  	"parent_phone" varchar,
  	"child_name" varchar,
  	"child_d_o_b" timestamp(3) with time zone,
  	"photo_consent" "enum_child_safeguarding_forms_photo_consent",
  	"allergies_or_medical_notes" varchar,
  	"emergency_contact_name" varchar,
  	"emergency_contact_phone" varchar,
  	"availability" varchar,
  	"vetting_acknowledged" boolean,
  	"message" varchar,
  	"status" "enum_child_safeguarding_forms_status" DEFAULT 'new',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "form_submissions" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "form_submissions" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "ministries" ADD COLUMN "is_childrens_ministry" boolean DEFAULT false;
  ALTER TABLE "form_submissions" ADD COLUMN "support_type" "enum_form_submissions_support_type";
  ALTER TABLE "form_submissions" ADD COLUMN "decision_type" "enum_form_submissions_decision_type";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "homegroups_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "child_safeguarding_forms_id" integer;
  CREATE INDEX "homegroups_updated_at_idx" ON "homegroups" USING btree ("updated_at");
  CREATE INDEX "homegroups_created_at_idx" ON "homegroups" USING btree ("created_at");
  CREATE INDEX "child_safeguarding_forms_updated_at_idx" ON "child_safeguarding_forms" USING btree ("updated_at");
  CREATE INDEX "child_safeguarding_forms_created_at_idx" ON "child_safeguarding_forms" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_homegroups_fk" FOREIGN KEY ("homegroups_id") REFERENCES "public"."homegroups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_child_safeguarding_forms_fk" FOREIGN KEY ("child_safeguarding_forms_id") REFERENCES "public"."child_safeguarding_forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_homegroups_id_idx" ON "payload_locked_documents_rels" USING btree ("homegroups_id");
  CREATE INDEX "payload_locked_documents_rels_child_safeguarding_forms_i_idx" ON "payload_locked_documents_rels" USING btree ("child_safeguarding_forms_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homegroups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "child_safeguarding_forms" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "homegroups" CASCADE;
  DROP TABLE "child_safeguarding_forms" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_homegroups_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_child_safeguarding_forms_fk";
  
  ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_form_submissions_form_type";
  CREATE TYPE "public"."enum_form_submissions_form_type" AS ENUM('contact', 'appointment', 'membership', 'reference-letter');
  ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE "public"."enum_form_submissions_form_type" USING "form_type"::"public"."enum_form_submissions_form_type";
  DROP INDEX "payload_locked_documents_rels_homegroups_id_idx";
  DROP INDEX "payload_locked_documents_rels_child_safeguarding_forms_i_idx";
  ALTER TABLE "form_submissions" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "form_submissions" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "ministries" DROP COLUMN "is_childrens_ministry";
  ALTER TABLE "form_submissions" DROP COLUMN "support_type";
  ALTER TABLE "form_submissions" DROP COLUMN "decision_type";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "homegroups_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "child_safeguarding_forms_id";
  DROP TYPE "public"."enum_child_safeguarding_forms_form_type";
  DROP TYPE "public"."enum_child_safeguarding_forms_photo_consent";
  DROP TYPE "public"."enum_child_safeguarding_forms_status";
  DROP TYPE "public"."enum_form_submissions_support_type";
  DROP TYPE "public"."enum_form_submissions_decision_type";`)
}
