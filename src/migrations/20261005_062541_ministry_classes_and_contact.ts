import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ministries_age_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"age_range" varchar,
  	"description" varchar
  );
  
  ALTER TABLE "ministries" ADD COLUMN "contact_email" varchar;
  ALTER TABLE "ministries" ADD COLUMN "contact_phone" varchar;
  ALTER TABLE "ministries_age_groups" ADD CONSTRAINT "ministries_age_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ministries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ministries_age_groups_order_idx" ON "ministries_age_groups" USING btree ("_order");
  CREATE INDEX "ministries_age_groups_parent_id_idx" ON "ministries_age_groups" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "ministries_age_groups" CASCADE;
  ALTER TABLE "ministries" DROP COLUMN "contact_email";
  ALTER TABLE "ministries" DROP COLUMN "contact_phone";`)
}
