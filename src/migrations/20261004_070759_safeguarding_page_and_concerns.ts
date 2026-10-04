import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_safeguarding_concerns_lead_referred_to" AS ENUM('social-care', 'police', 'lado', 'adviser', 'charity-commission', 'other', 'none');
  CREATE TYPE "public"."enum_safeguarding_concerns_status" AS ENUM('new', 'reviewing', 'referred', 'closed');
  CREATE TYPE "public"."enum_safeguarding_concerns_reporter_relationship" AS ENUM('member', 'parent', 'volunteer', 'visitor', 'child', 'other');
  CREATE TABLE "safeguarding_concerns_lead_referred_to" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_safeguarding_concerns_lead_referred_to",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "safeguarding_concerns" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"status" "enum_safeguarding_concerns_status" DEFAULT 'new' NOT NULL,
  	"immediate_danger" boolean,
  	"involves_staff_or_volunteer" boolean,
  	"concern" varchar NOT NULL,
  	"when_and_where" varchar,
  	"child_name" varchar,
  	"child_age_or_dob" varchar,
  	"others_told" varchar,
  	"reporter_name" varchar,
  	"reporter_relationship" "enum_safeguarding_concerns_reporter_relationship",
  	"reporter_phone" varchar,
  	"reporter_email" varchar,
  	"reporter_wants_contact" boolean,
  	"lead_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "child_safeguarding_forms" ADD COLUMN "additional_needs" varchar;
  ALTER TABLE "child_safeguarding_forms" ADD COLUMN "authorised_collectors" varchar;
  ALTER TABLE "child_safeguarding_forms" ADD COLUMN "medical_treatment_consent" boolean;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "safeguarding_concerns_id" integer;
  ALTER TABLE "settings" ADD COLUMN "safeguarding_enabled" boolean DEFAULT false;
  ALTER TABLE "settings" ADD COLUMN "safeguarding_lead_name" varchar;
  ALTER TABLE "settings" ADD COLUMN "safeguarding_lead_phone" varchar;
  ALTER TABLE "settings" ADD COLUMN "safeguarding_lead_email" varchar;
  ALTER TABLE "settings" ADD COLUMN "safeguarding_deputy_name" varchar;
  ALTER TABLE "settings" ADD COLUMN "safeguarding_deputy_phone" varchar;
  ALTER TABLE "settings" ADD COLUMN "safeguarding_alert_email" varchar;
  ALTER TABLE "settings" ADD COLUMN "safeguarding_reviewed_on" varchar;
  ALTER TABLE "safeguarding_concerns_lead_referred_to" ADD CONSTRAINT "safeguarding_concerns_lead_referred_to_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."safeguarding_concerns"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "safeguarding_concerns_lead_referred_to_order_idx" ON "safeguarding_concerns_lead_referred_to" USING btree ("order");
  CREATE INDEX "safeguarding_concerns_lead_referred_to_parent_idx" ON "safeguarding_concerns_lead_referred_to" USING btree ("parent_id");
  CREATE UNIQUE INDEX "safeguarding_concerns_reference_idx" ON "safeguarding_concerns" USING btree ("reference");
  CREATE INDEX "safeguarding_concerns_updated_at_idx" ON "safeguarding_concerns" USING btree ("updated_at");
  CREATE INDEX "safeguarding_concerns_created_at_idx" ON "safeguarding_concerns" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_safeguarding_concerns_fk" FOREIGN KEY ("safeguarding_concerns_id") REFERENCES "public"."safeguarding_concerns"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_safeguarding_concerns_id_idx" ON "payload_locked_documents_rels" USING btree ("safeguarding_concerns_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "safeguarding_concerns_lead_referred_to" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "safeguarding_concerns" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "safeguarding_concerns_lead_referred_to" CASCADE;
  DROP TABLE "safeguarding_concerns" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_safeguarding_concerns_fk";
  
  DROP INDEX "payload_locked_documents_rels_safeguarding_concerns_id_idx";
  ALTER TABLE "child_safeguarding_forms" DROP COLUMN "additional_needs";
  ALTER TABLE "child_safeguarding_forms" DROP COLUMN "authorised_collectors";
  ALTER TABLE "child_safeguarding_forms" DROP COLUMN "medical_treatment_consent";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "safeguarding_concerns_id";
  ALTER TABLE "settings" DROP COLUMN "safeguarding_enabled";
  ALTER TABLE "settings" DROP COLUMN "safeguarding_lead_name";
  ALTER TABLE "settings" DROP COLUMN "safeguarding_lead_phone";
  ALTER TABLE "settings" DROP COLUMN "safeguarding_lead_email";
  ALTER TABLE "settings" DROP COLUMN "safeguarding_deputy_name";
  ALTER TABLE "settings" DROP COLUMN "safeguarding_deputy_phone";
  ALTER TABLE "settings" DROP COLUMN "safeguarding_alert_email";
  ALTER TABLE "settings" DROP COLUMN "safeguarding_reviewed_on";
  DROP TYPE "public"."enum_safeguarding_concerns_lead_referred_to";
  DROP TYPE "public"."enum_safeguarding_concerns_status";
  DROP TYPE "public"."enum_safeguarding_concerns_reporter_relationship";`)
}
