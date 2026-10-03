import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_gallery_items_category" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_media_gallery_items_category",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_media_gallery_items_v_version_category" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__media_gallery_items_v_version_category",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "media_gallery_items_category" ADD CONSTRAINT "media_gallery_items_category_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_gallery_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_gallery_items_v_version_category" ADD CONSTRAINT "_media_gallery_items_v_version_category_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_media_gallery_items_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_gallery_items_category_order_idx" ON "media_gallery_items_category" USING btree ("order");
  CREATE INDEX "media_gallery_items_category_parent_idx" ON "media_gallery_items_category" USING btree ("parent_id");
  CREATE INDEX "_media_gallery_items_v_version_category_order_idx" ON "_media_gallery_items_v_version_category" USING btree ("order");
  CREATE INDEX "_media_gallery_items_v_version_category_parent_idx" ON "_media_gallery_items_v_version_category" USING btree ("parent_id");

  -- Hand-written (Payload only generates the structure): carry every item's
  -- existing page over to the new "Show on" list BEFORE the old column goes,
  -- otherwise all existing gallery / COG TV / radio items would lose their page.
  INSERT INTO "media_gallery_items_category" ("order", "parent_id", "value")
    SELECT 1, "id", "category" FROM "media_gallery_items" WHERE "category" IS NOT NULL;
  INSERT INTO "_media_gallery_items_v_version_category" ("order", "parent_id", "value")
    SELECT 1, "id", "version_category" FROM "_media_gallery_items_v" WHERE "version_category" IS NOT NULL;

  ALTER TABLE "media_gallery_items" DROP COLUMN "category";
  ALTER TABLE "_media_gallery_items_v" DROP COLUMN "version_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_gallery_items" ADD COLUMN "category" "enum_media_gallery_items_category" DEFAULT 'gallery';
  ALTER TABLE "_media_gallery_items_v" ADD COLUMN "version_category" "enum__media_gallery_items_v_version_category" DEFAULT 'gallery';

  -- Hand-written: a single column can only hold one page, so keep each item's first one.
  UPDATE "media_gallery_items" m SET "category" = c."value"
    FROM (SELECT DISTINCT ON ("parent_id") "parent_id", "value" FROM "media_gallery_items_category" ORDER BY "parent_id", "order") c
    WHERE c."parent_id" = m."id";
  UPDATE "_media_gallery_items_v" v SET "version_category" = c."value"
    FROM (SELECT DISTINCT ON ("parent_id") "parent_id", "value" FROM "_media_gallery_items_v_version_category" ORDER BY "parent_id", "order") c
    WHERE c."parent_id" = v."id";

  DROP TABLE "media_gallery_items_category" CASCADE;
  DROP TABLE "_media_gallery_items_v_version_category" CASCADE;`)
}
