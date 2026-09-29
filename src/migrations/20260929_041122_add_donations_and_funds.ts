import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_donations_frequency" AS ENUM('one-time', 'monthly');
  CREATE TYPE "public"."enum_donations_status" AS ENUM('pending', 'completed', 'failed');
  CREATE TABLE "donations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"donor_name" varchar NOT NULL,
  	"donor_email" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"fund" varchar NOT NULL,
  	"frequency" "enum_donations_frequency" DEFAULT 'one-time' NOT NULL,
  	"gift_aid_declared" boolean DEFAULT false,
  	"gift_aid_full_name" varchar,
  	"gift_aid_address" varchar,
  	"gift_aid_postcode" varchar,
  	"status" "enum_donations_status" DEFAULT 'pending',
  	"paid_at" timestamp(3) with time zone,
  	"stripe_checkout_session_id" varchar,
  	"stripe_customer_id" varchar,
  	"stripe_subscription_id" varchar,
  	"stripe_invoice_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "giving_funds" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "donations_id" integer;
  ALTER TABLE "giving_funds" ADD CONSTRAINT "giving_funds_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."giving"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "donations_stripe_checkout_session_id_idx" ON "donations" USING btree ("stripe_checkout_session_id");
  CREATE INDEX "donations_stripe_customer_id_idx" ON "donations" USING btree ("stripe_customer_id");
  CREATE INDEX "donations_stripe_subscription_id_idx" ON "donations" USING btree ("stripe_subscription_id");
  CREATE INDEX "donations_stripe_invoice_id_idx" ON "donations" USING btree ("stripe_invoice_id");
  CREATE INDEX "donations_updated_at_idx" ON "donations" USING btree ("updated_at");
  CREATE INDEX "donations_created_at_idx" ON "donations" USING btree ("created_at");
  CREATE INDEX "giving_funds_order_idx" ON "giving_funds" USING btree ("_order");
  CREATE INDEX "giving_funds_parent_id_idx" ON "giving_funds" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donations_fk" FOREIGN KEY ("donations_id") REFERENCES "public"."donations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_donations_id_idx" ON "payload_locked_documents_rels" USING btree ("donations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "donations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "giving_funds" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "donations" CASCADE;
  DROP TABLE "giving_funds" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_donations_fk";
  
  DROP INDEX "payload_locked_documents_rels_donations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "donations_id";
  DROP TYPE "public"."enum_donations_frequency";
  DROP TYPE "public"."enum_donations_status";`)
}
