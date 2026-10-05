import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_event_registrations_role" AS ENUM('attendee', 'volunteer');
  CREATE TYPE "public"."enum_form_submissions_intents" AS ENUM('accept-jesus', 'membership', 'join-department');
  CREATE TYPE "public"."enum_form_submissions_visitor_type" AS ENUM('student', 'working-professional', 'visitor', 'other');
  CREATE TYPE "public"."enum_form_submissions_contact_preference" AS ENUM('yes', 'no', 'other');
  ALTER TYPE "public"."enum_donations_frequency" ADD VALUE 'weekly' BEFORE 'monthly';
  ALTER TYPE "public"."enum_donations_status" ADD VALUE 'scheduled' BEFORE 'completed';
  CREATE TABLE "ministries_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "form_submissions_intents" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_form_submissions_intents",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "ministries" ADD COLUMN "community_link" varchar;
  ALTER TABLE "ministries" ADD COLUMN "community_label" varchar;
  ALTER TABLE "ministries" ADD COLUMN "is_youth_ministry" boolean DEFAULT false;
  ALTER TABLE "events" ADD COLUMN "volunteer_enabled" boolean DEFAULT false;
  ALTER TABLE "_events_v" ADD COLUMN "version_volunteer_enabled" boolean DEFAULT false;
  ALTER TABLE "event_registrations" ADD COLUMN "role" "enum_event_registrations_role" DEFAULT 'attendee';
  ALTER TABLE "event_registrations" ADD COLUMN "notes" varchar;
  ALTER TABLE "donations" ADD COLUMN "start_date" timestamp(3) with time zone;
  ALTER TABLE "form_submissions" ADD COLUMN "visit_date" timestamp(3) with time zone;
  ALTER TABLE "form_submissions" ADD COLUMN "address" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "postcode" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "city" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "country" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "how_heard" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "visitor_type" "enum_form_submissions_visitor_type";
  ALTER TABLE "form_submissions" ADD COLUMN "contact_preference" "enum_form_submissions_contact_preference";
  ALTER TABLE "form_submissions" ADD COLUMN "newsletter_opt_in" boolean;
  ALTER TABLE "settings" ADD COLUMN "form_emails_first_timer" varchar;
  ALTER TABLE "ministries_activities" ADD CONSTRAINT "ministries_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ministries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_intents" ADD CONSTRAINT "form_submissions_intents_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ministries_activities_order_idx" ON "ministries_activities" USING btree ("_order");
  CREATE INDEX "ministries_activities_parent_id_idx" ON "ministries_activities" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_intents_order_idx" ON "form_submissions_intents" USING btree ("order");
  CREATE INDEX "form_submissions_intents_parent_idx" ON "form_submissions_intents" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "ministries_activities" CASCADE;
  DROP TABLE "form_submissions_intents" CASCADE;
  ALTER TABLE "donations" ALTER COLUMN "frequency" SET DATA TYPE text;
  ALTER TABLE "donations" ALTER COLUMN "frequency" SET DEFAULT 'one-time'::text;
  DROP TYPE "public"."enum_donations_frequency";
  CREATE TYPE "public"."enum_donations_frequency" AS ENUM('one-time', 'monthly');
  ALTER TABLE "donations" ALTER COLUMN "frequency" SET DEFAULT 'one-time'::"public"."enum_donations_frequency";
  ALTER TABLE "donations" ALTER COLUMN "frequency" SET DATA TYPE "public"."enum_donations_frequency" USING "frequency"::"public"."enum_donations_frequency";
  ALTER TABLE "donations" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "donations" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
  DROP TYPE "public"."enum_donations_status";
  CREATE TYPE "public"."enum_donations_status" AS ENUM('pending', 'completed', 'failed');
  ALTER TABLE "donations" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."enum_donations_status";
  ALTER TABLE "donations" ALTER COLUMN "status" SET DATA TYPE "public"."enum_donations_status" USING "status"::"public"."enum_donations_status";
  ALTER TABLE "ministries" DROP COLUMN "community_link";
  ALTER TABLE "ministries" DROP COLUMN "community_label";
  ALTER TABLE "ministries" DROP COLUMN "is_youth_ministry";
  ALTER TABLE "events" DROP COLUMN "volunteer_enabled";
  ALTER TABLE "_events_v" DROP COLUMN "version_volunteer_enabled";
  ALTER TABLE "event_registrations" DROP COLUMN "role";
  ALTER TABLE "event_registrations" DROP COLUMN "notes";
  ALTER TABLE "donations" DROP COLUMN "start_date";
  ALTER TABLE "form_submissions" DROP COLUMN "visit_date";
  ALTER TABLE "form_submissions" DROP COLUMN "address";
  ALTER TABLE "form_submissions" DROP COLUMN "postcode";
  ALTER TABLE "form_submissions" DROP COLUMN "city";
  ALTER TABLE "form_submissions" DROP COLUMN "country";
  ALTER TABLE "form_submissions" DROP COLUMN "how_heard";
  ALTER TABLE "form_submissions" DROP COLUMN "visitor_type";
  ALTER TABLE "form_submissions" DROP COLUMN "contact_preference";
  ALTER TABLE "form_submissions" DROP COLUMN "newsletter_opt_in";
  ALTER TABLE "settings" DROP COLUMN "form_emails_first_timer";
  DROP TYPE "public"."enum_event_registrations_role";
  DROP TYPE "public"."enum_form_submissions_intents";
  DROP TYPE "public"."enum_form_submissions_visitor_type";
  DROP TYPE "public"."enum_form_submissions_contact_preference";`)
}
