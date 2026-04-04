import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clothingItemsTable } from "./clothing";

export const favoriteOutfitsTable = pgTable("favorite_outfits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  topId: integer("top_id")
    .notNull()
    .references(() => clothingItemsTable.id, { onDelete: "cascade" }),
  bottomId: integer("bottom_id")
    .notNull()
    .references(() => clothingItemsTable.id, { onDelete: "cascade" }),
  name: text("name"),
  score: real("score").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertFavoriteOutfitSchema = createInsertSchema(
  favoriteOutfitsTable,
).omit({
  id: true,
  createdAt: true,
});

export type InsertFavoriteOutfit = z.infer<typeof insertFavoriteOutfitSchema>;
export type FavoriteOutfit = typeof favoriteOutfitsTable.$inferSelect;
