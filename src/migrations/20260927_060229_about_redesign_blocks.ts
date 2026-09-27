import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_split_feature_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_background" AS ENUM('light', 'tinted');
  CREATE TYPE "public"."enum_pages_blocks_card_grid_items_icon" AS ENUM('cross', 'book', 'flame', 'heart', 'users', 'prayer', 'globe', 'church', 'sparkles', 'water', 'sun', 'music', 'home', 'compass', 'crown', 'scroll', 'lightbulb', 'star', 'dove', 'shield', 'eye', 'target', 'pin', 'handshake');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_background" AS ENUM('light', 'tinted');
  CREATE TYPE "public"."enum__pages_v_blocks_card_grid_items_icon" AS ENUM('cross', 'book', 'flame', 'heart', 'users', 'prayer', 'globe', 'church', 'sparkles', 'water', 'sun', 'music', 'home', 'compass', 'crown', 'scroll', 'lightbulb', 'star', 'dove', 'shield', 'eye', 'target', 'pin', 'handshake');
  CREATE TABLE "pages_blocks_split_feature_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_split_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"image_position" "enum_pages_blocks_split_feature_image_position" DEFAULT 'right',
  	"background" "enum_pages_blocks_split_feature_background" DEFAULT 'light',
  	"button_label" varchar,
  	"button_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_feature_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"image_position" "enum__pages_v_blocks_split_feature_image_position" DEFAULT 'right',
  	"background" "enum__pages_v_blocks_split_feature_background" DEFAULT 'light',
  	"button_label" varchar,
  	"button_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_card_grid_items" ADD COLUMN "icon" "enum_pages_blocks_card_grid_items_icon";
  ALTER TABLE "pages_blocks_card_grid_items" ADD COLUMN "footnote" varchar;
  ALTER TABLE "pages_blocks_card_grid_items" ADD COLUMN "href" varchar;
  ALTER TABLE "pages_blocks_card_grid" ADD COLUMN "intro" varchar;
  ALTER TABLE "pages_blocks_team_grid" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_team_grid" ADD COLUMN "feature_first" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD COLUMN "icon" "enum__pages_v_blocks_card_grid_items_icon";
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD COLUMN "footnote" varchar;
  ALTER TABLE "_pages_v_blocks_card_grid_items" ADD COLUMN "href" varchar;
  ALTER TABLE "_pages_v_blocks_card_grid" ADD COLUMN "intro" varchar;
  ALTER TABLE "_pages_v_blocks_team_grid" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_team_grid" ADD COLUMN "feature_first" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_subtitle" varchar;
  ALTER TABLE "pages_blocks_split_feature_bullets" ADD CONSTRAINT "pages_blocks_split_feature_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_feature"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_feature" ADD CONSTRAINT "pages_blocks_split_feature_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_feature" ADD CONSTRAINT "pages_blocks_split_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_feature_bullets" ADD CONSTRAINT "_pages_v_blocks_split_feature_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split_feature"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_feature" ADD CONSTRAINT "_pages_v_blocks_split_feature_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_feature" ADD CONSTRAINT "_pages_v_blocks_split_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_split_feature_bullets_order_idx" ON "pages_blocks_split_feature_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_feature_bullets_parent_id_idx" ON "pages_blocks_split_feature_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_split_feature_order_idx" ON "pages_blocks_split_feature" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_feature_parent_id_idx" ON "pages_blocks_split_feature" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_split_feature_path_idx" ON "pages_blocks_split_feature" USING btree ("_path");
  CREATE INDEX "pages_blocks_split_feature_image_idx" ON "pages_blocks_split_feature" USING btree ("image_id");
  CREATE INDEX "pages_blocks_timeline_items_order_idx" ON "pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_items_parent_id_idx" ON "pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_split_feature_bullets_order_idx" ON "_pages_v_blocks_split_feature_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_feature_bullets_parent_id_idx" ON "_pages_v_blocks_split_feature_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_split_feature_order_idx" ON "_pages_v_blocks_split_feature" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_feature_parent_id_idx" ON "_pages_v_blocks_split_feature" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_split_feature_path_idx" ON "_pages_v_blocks_split_feature" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_split_feature_image_idx" ON "_pages_v_blocks_split_feature" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_timeline_items_order_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_items_parent_id_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_split_feature_bullets" CASCADE;
  DROP TABLE "pages_blocks_split_feature" CASCADE;
  DROP TABLE "pages_blocks_timeline_items" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_split_feature_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_split_feature" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  ALTER TABLE "pages_blocks_card_grid_items" DROP COLUMN "icon";
  ALTER TABLE "pages_blocks_card_grid_items" DROP COLUMN "footnote";
  ALTER TABLE "pages_blocks_card_grid_items" DROP COLUMN "href";
  ALTER TABLE "pages_blocks_card_grid" DROP COLUMN "intro";
  ALTER TABLE "pages_blocks_team_grid" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_team_grid" DROP COLUMN "feature_first";
  ALTER TABLE "pages" DROP COLUMN "subtitle";
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP COLUMN "icon";
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP COLUMN "footnote";
  ALTER TABLE "_pages_v_blocks_card_grid_items" DROP COLUMN "href";
  ALTER TABLE "_pages_v_blocks_card_grid" DROP COLUMN "intro";
  ALTER TABLE "_pages_v_blocks_team_grid" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_team_grid" DROP COLUMN "feature_first";
  ALTER TABLE "_pages_v" DROP COLUMN "version_subtitle";
  DROP TYPE "public"."enum_pages_blocks_split_feature_image_position";
  DROP TYPE "public"."enum_pages_blocks_split_feature_background";
  DROP TYPE "public"."enum_pages_blocks_card_grid_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_background";
  DROP TYPE "public"."enum__pages_v_blocks_card_grid_items_icon";`)
}
