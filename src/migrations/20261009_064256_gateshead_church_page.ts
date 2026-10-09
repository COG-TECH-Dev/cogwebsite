import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "settings_gateshead_church_service_times" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"time" varchar NOT NULL
  );
  
  ALTER TABLE "settings" ADD COLUMN "gateshead_church_about" varchar;
  ALTER TABLE "settings" ADD COLUMN "gateshead_church_address" varchar;
  ALTER TABLE "settings" ADD COLUMN "gateshead_church_contact_email" varchar;
  ALTER TABLE "settings" ADD COLUMN "gateshead_church_contact_phone" varchar;
  ALTER TABLE "settings_gateshead_church_service_times" ADD CONSTRAINT "settings_gateshead_church_service_times_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "settings_gateshead_church_service_times_order_idx" ON "settings_gateshead_church_service_times" USING btree ("_order");
  CREATE INDEX "settings_gateshead_church_service_times_parent_id_idx" ON "settings_gateshead_church_service_times" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "settings_gateshead_church_service_times" CASCADE;
  ALTER TABLE "settings" DROP COLUMN "gateshead_church_about";
  ALTER TABLE "settings" DROP COLUMN "gateshead_church_address";
  ALTER TABLE "settings" DROP COLUMN "gateshead_church_contact_email";
  ALTER TABLE "settings" DROP COLUMN "gateshead_church_contact_phone";`)
}
