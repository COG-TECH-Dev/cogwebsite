import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "event_registrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"guests" numeric DEFAULT 1 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "events" ADD COLUMN "registration_enabled" boolean DEFAULT false;
  ALTER TABLE "events" ADD COLUMN "capacity" numeric;
  ALTER TABLE "_events_v" ADD COLUMN "version_registration_enabled" boolean DEFAULT false;
  ALTER TABLE "_events_v" ADD COLUMN "version_capacity" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_registrations_id" integer;
  ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "event_registrations_event_idx" ON "event_registrations" USING btree ("event_id");
  CREATE INDEX "event_registrations_updated_at_idx" ON "event_registrations" USING btree ("updated_at");
  CREATE INDEX "event_registrations_created_at_idx" ON "event_registrations" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_registrations_fk" FOREIGN KEY ("event_registrations_id") REFERENCES "public"."event_registrations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_event_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("event_registrations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_registrations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "event_registrations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_registrations_fk";
  
  DROP INDEX "payload_locked_documents_rels_event_registrations_id_idx";
  ALTER TABLE "events" DROP COLUMN "registration_enabled";
  ALTER TABLE "events" DROP COLUMN "capacity";
  ALTER TABLE "_events_v" DROP COLUMN "version_registration_enabled";
  ALTER TABLE "_events_v" DROP COLUMN "version_capacity";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_registrations_id";`)
}
