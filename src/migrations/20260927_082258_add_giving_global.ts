import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "giving" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bank_transfer_account_name" varchar,
  	"bank_transfer_sort_code" varchar,
  	"bank_transfer_account_number" varchar,
  	"bank_transfer_reference_note" varchar,
  	"online_giving_url" varchar,
  	"online_giving_label" varchar DEFAULT 'Give Online',
  	"charity_number" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "giving" CASCADE;`)
}
