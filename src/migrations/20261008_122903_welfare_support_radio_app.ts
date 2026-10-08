import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_settings_welfare_support_services_type" AS ENUM('financial', 'counselling', 'food', 'other');
  ALTER TYPE "public"."enum_users_role" ADD VALUE 'welfare-team' BEFORE 'volunteer';
  CREATE TABLE "settings_welfare_support_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_settings_welfare_support_services_type" DEFAULT 'financial' NOT NULL,
  	"description" varchar,
  	"who_for" varchar,
  	"how_to_access" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"link" varchar
  );
  
  ALTER TABLE "settings" ADD COLUMN "form_emails_welfare" varchar;
  ALTER TABLE "settings" ADD COLUMN "welfare_support_reply_time" varchar;
  ALTER TABLE "settings" ADD COLUMN "social_links_radio_app_url" varchar;
  ALTER TABLE "settings_welfare_support_services" ADD CONSTRAINT "settings_welfare_support_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "settings_welfare_support_services_order_idx" ON "settings_welfare_support_services" USING btree ("_order");
  CREATE INDEX "settings_welfare_support_services_parent_id_idx" ON "settings_welfare_support_services" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "settings_welfare_support_services" CASCADE;
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'admin', 'content-editor', 'ministry-leader', 'volunteer');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  ALTER TABLE "settings" DROP COLUMN "form_emails_welfare";
  ALTER TABLE "settings" DROP COLUMN "welfare_support_reply_time";
  ALTER TABLE "settings" DROP COLUMN "social_links_radio_app_url";
  DROP TYPE "public"."enum_settings_welfare_support_services_type";`)
}
