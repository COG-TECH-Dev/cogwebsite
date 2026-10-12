import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_settings_form_emails_first_timer_branches_branch" AS ENUM('Newcastle Church', 'Sunderland Church', 'London Church', 'Middlesbrough Church', 'Gateshead Church');
  CREATE TABLE "settings_form_emails_first_timer_branches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"branch" "enum_settings_form_emails_first_timer_branches_branch" NOT NULL,
  	"email" varchar NOT NULL
  );
  
  ALTER TABLE "settings_form_emails_first_timer_branches" ADD CONSTRAINT "settings_form_emails_first_timer_branches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "settings_form_emails_first_timer_branches_order_idx" ON "settings_form_emails_first_timer_branches" USING btree ("_order");
  CREATE INDEX "settings_form_emails_first_timer_branches_parent_id_idx" ON "settings_form_emails_first_timer_branches" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "settings_form_emails_first_timer_branches" CASCADE;
  DROP TYPE "public"."enum_settings_form_emails_first_timer_branches_branch";`)
}
