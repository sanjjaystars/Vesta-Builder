/**
 * Seed demo clothing data for a test user.
 * Call with: SEED_USER_ID=<userId> pnpm --filter @workspace/api-server run seed
 */
import { db, clothingItemsTable, favoriteOutfitsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const SEED_USER_ID = process.env.SEED_USER_ID;
if (!SEED_USER_ID) {
  throw new Error("SEED_USER_ID env var required");
}

const items = [
  {
    name: "Classic White Shirt",
    category: "shirt",
    color: "white",
    pattern: "plain",
    fit: "regular",
    style: "formal",
    season: "all-season",
    notes: "Oxford button-down",
    imageUrl: null,
    isAvailable: true,
  },
  {
    name: "Navy Slim Trousers",
    category: "pant",
    color: "navy",
    pattern: "plain",
    fit: "slim",
    style: "formal",
    season: "all-season",
    notes: null,
    imageUrl: null,
    isAvailable: true,
  },
  {
    name: "Black Skinny Jeans",
    category: "jeans",
    color: "black",
    pattern: "plain",
    fit: "slim",
    style: "casual",
    season: "all-season",
    notes: null,
    imageUrl: null,
    isAvailable: true,
  },
  {
    name: "Oversized Grey Hoodie",
    category: "hoodie",
    color: "grey",
    pattern: "plain",
    fit: "oversized",
    style: "streetwear",
    season: "winter",
    notes: "Favourite cosy piece",
    imageUrl: null,
    isAvailable: true,
  },
  {
    name: "Olive Cargo Pants",
    category: "cargo",
    color: "olive",
    pattern: "plain",
    fit: "regular",
    style: "streetwear",
    season: "summer",
    notes: null,
    imageUrl: null,
    isAvailable: true,
  },
  {
    name: "White Graphic Tee",
    category: "t-shirt",
    color: "white",
    pattern: "printed",
    fit: "regular",
    style: "casual",
    season: "summer",
    notes: null,
    imageUrl: null,
    isAvailable: true,
  },
  {
    name: "Beige Linen Shirt",
    category: "shirt",
    color: "beige",
    pattern: "plain",
    fit: "regular",
    style: "casual",
    season: "summer",
    notes: "Great for beach days",
    imageUrl: null,
    isAvailable: true,
  },
  {
    name: "Blue Denim Jacket",
    category: "jacket",
    color: "blue",
    pattern: "plain",
    fit: "regular",
    style: "casual",
    season: "all-season",
    notes: null,
    imageUrl: null,
    isAvailable: false, // In laundry
  },
];

async function seed() {
  // Clear existing seed data for user
  await db.delete(clothingItemsTable).where(eq(clothingItemsTable.userId, SEED_USER_ID!));

  const inserted = await db
    .insert(clothingItemsTable)
    .values(items.map((i) => ({ ...i, userId: SEED_USER_ID! })))
    .returning();

  console.log(`Seeded ${inserted.length} clothing items for user ${SEED_USER_ID}`);
}

seed().catch(console.error);
