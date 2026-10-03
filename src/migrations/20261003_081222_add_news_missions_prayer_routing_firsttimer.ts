import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_mission_projects_status" AS ENUM('active', 'completed');
  CREATE TYPE "public"."enum_prayer_requests_visibility" AS ENUM('private', 'ministry-team', 'public');
  ALTER TYPE "public"."enum_form_submissions_form_type" ADD VALUE 'first-timer';
  ALTER TYPE "public"."enum_form_submissions_form_type" ADD VALUE 'mission-trip';
  ALTER TYPE "public"."enum_form_submissions_form_type" ADD VALUE 'campus-connect';
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"published_date" timestamp(3) with time zone,
  	"summary" varchar,
  	"body" jsonb,
  	"image_id" integer,
  	"pinned" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_published_date" timestamp(3) with time zone,
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_image_id" integer,
  	"version_pinned" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "mission_projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "mission_projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"location" varchar,
  	"status" "enum_mission_projects_status" DEFAULT 'active' NOT NULL,
  	"summary" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"video_url" varchar,
  	"prayer_needs" varchar,
  	"giving_fund" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "missionaries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"location" varchar,
  	"bio" varchar,
  	"prayer_needs" varchar,
  	"project_id" integer,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "prayer_requests" ADD COLUMN "visibility" "enum_prayer_requests_visibility" DEFAULT 'private' NOT NULL;
  ALTER TABLE "prayer_requests" ADD COLUMN "approved" boolean DEFAULT false;
  ALTER TABLE "form_submissions" ADD COLUMN "interested_project_id" integer;
  ALTER TABLE "form_submissions" ADD COLUMN "campus" varchar;
  ALTER TABLE "form_submissions" ADD COLUMN "service_attended" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mission_projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "missionaries_id" integer;
  ALTER TABLE "settings" ADD COLUMN "duty_pastor_show" boolean DEFAULT false;
  ALTER TABLE "settings" ADD COLUMN "duty_pastor_name" varchar;
  ALTER TABLE "settings" ADD COLUMN "duty_pastor_phone" varchar;
  ALTER TABLE "settings" ADD COLUMN "duty_pastor_note" varchar;
  ALTER TABLE "news" ADD CONSTRAINT "news_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mission_projects_gallery" ADD CONSTRAINT "mission_projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mission_projects_gallery" ADD CONSTRAINT "mission_projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mission_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mission_projects" ADD CONSTRAINT "mission_projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "missionaries" ADD CONSTRAINT "missionaries_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "missionaries" ADD CONSTRAINT "missionaries_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX "news_image_idx" ON "news" USING btree ("image_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_version_image_idx" ON "_news_v" USING btree ("version_image_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE INDEX "mission_projects_gallery_order_idx" ON "mission_projects_gallery" USING btree ("_order");
  CREATE INDEX "mission_projects_gallery_parent_id_idx" ON "mission_projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "mission_projects_gallery_image_idx" ON "mission_projects_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "mission_projects_slug_idx" ON "mission_projects" USING btree ("slug");
  CREATE INDEX "mission_projects_image_idx" ON "mission_projects" USING btree ("image_id");
  CREATE INDEX "mission_projects_updated_at_idx" ON "mission_projects" USING btree ("updated_at");
  CREATE INDEX "mission_projects_created_at_idx" ON "mission_projects" USING btree ("created_at");
  CREATE INDEX "missionaries_photo_idx" ON "missionaries" USING btree ("photo_id");
  CREATE INDEX "missionaries_project_idx" ON "missionaries" USING btree ("project_id");
  CREATE INDEX "missionaries_updated_at_idx" ON "missionaries" USING btree ("updated_at");
  CREATE INDEX "missionaries_created_at_idx" ON "missionaries" USING btree ("created_at");
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_interested_project_id_mission_projects_id_fk" FOREIGN KEY ("interested_project_id") REFERENCES "public"."mission_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mission_projects_fk" FOREIGN KEY ("mission_projects_id") REFERENCES "public"."mission_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_missionaries_fk" FOREIGN KEY ("missionaries_id") REFERENCES "public"."missionaries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "form_submissions_interested_project_idx" ON "form_submissions" USING btree ("interested_project_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_mission_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("mission_projects_id");
  CREATE INDEX "payload_locked_documents_rels_missionaries_id_idx" ON "payload_locked_documents_rels" USING btree ("missionaries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_projects_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mission_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "missionaries" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "news" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "mission_projects_gallery" CASCADE;
  DROP TABLE "mission_projects" CASCADE;
  DROP TABLE "missionaries" CASCADE;
  ALTER TABLE "form_submissions" DROP CONSTRAINT "form_submissions_interested_project_id_mission_projects_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mission_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_missionaries_fk";
  
  ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_form_submissions_form_type";
  CREATE TYPE "public"."enum_form_submissions_form_type" AS ENUM('contact', 'appointment', 'membership', 'reference-letter', 'welfare', 'step-of-faith', 'homegroup-join');
  ALTER TABLE "form_submissions" ALTER COLUMN "form_type" SET DATA TYPE "public"."enum_form_submissions_form_type" USING "form_type"::"public"."enum_form_submissions_form_type";
  DROP INDEX "form_submissions_interested_project_idx";
  DROP INDEX "payload_locked_documents_rels_news_id_idx";
  DROP INDEX "payload_locked_documents_rels_mission_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_missionaries_id_idx";
  ALTER TABLE "prayer_requests" DROP COLUMN "visibility";
  ALTER TABLE "prayer_requests" DROP COLUMN "approved";
  ALTER TABLE "form_submissions" DROP COLUMN "interested_project_id";
  ALTER TABLE "form_submissions" DROP COLUMN "campus";
  ALTER TABLE "form_submissions" DROP COLUMN "service_attended";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mission_projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "missionaries_id";
  ALTER TABLE "settings" DROP COLUMN "duty_pastor_show";
  ALTER TABLE "settings" DROP COLUMN "duty_pastor_name";
  ALTER TABLE "settings" DROP COLUMN "duty_pastor_phone";
  ALTER TABLE "settings" DROP COLUMN "duty_pastor_note";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum_mission_projects_status";
  DROP TYPE "public"."enum_prayer_requests_visibility";`)
}
