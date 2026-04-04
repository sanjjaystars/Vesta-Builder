import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clothingItemsTable = pgTable("clothing_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // pant, shirt, t-shirt, top wear, jeans, cargo, hoodie, jacket
  color: text("color").notNull(),
  pattern: text("pattern").notNull(), // plain, striped, checked, printed
  fit: text("fit").notNull(), // slim, regular, oversized
  style: text("style").notNull(), // casual, formal, streetwear, party, traditional
  season: text("season").notNull(), // summer, winter, all-season
  notes: text("notes"),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertClothingItemSchema = createInsertSchema(
  clothingItemsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClothingItem = z.infer<typeof insertClothingItemSchema>;
export type ClothingItem = typeof clothingItemsTable.$inferSelect;
