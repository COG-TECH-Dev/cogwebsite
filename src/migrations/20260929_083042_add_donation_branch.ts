import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "giving_branches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  ALTER TABLE "donations" ADD COLUMN "branch" varchar NOT NULL;
  ALTER TABLE "giving_branches" ADD CONSTRAINT "giving_branches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."giving"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "giving_branches_order_idx" ON "giving_branches" USING btree ("_order");
  CREATE INDEX "giving_branches_parent_id_idx" ON "giving_branches" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "giving_branches" CASCADE;
  ALTER TABLE "donations" DROP COLUMN "branch";`)
}
