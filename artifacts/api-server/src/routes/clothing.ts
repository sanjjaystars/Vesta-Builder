import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, ilike } from "drizzle-orm";
import { db, clothingItemsTable } from "@workspace/db";
import {
  CreateClothingItemBody,
  UpdateClothingItemBody,
  ToggleClothingAvailabilityBody,
  ListClothingItemsResponse,
  GetClothingItemResponse,
  UpdateClothingItemResponse,
  ToggleClothingAvailabilityResponse,
} from "@workspace/api-zod";
import { serializeItem, serializeItems } from "../lib/serialize";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

// GET /clothing
router.get("/clothing", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const { category, style, season, color, search, isAvailable } = req.query;

  let query = db
    .select()
    .from(clothingItemsTable)
    .where(eq(clothingItemsTable.userId, userId))
    .$dynamic();

  const conditions = [eq(clothingItemsTable.userId, userId)];

  if (category) {
    conditions.push(eq(clothingItemsTable.category, String(category)));
  }
  if (style) {
    conditions.push(eq(clothingItemsTable.style, String(style)));
  }
  if (season) {
    conditions.push(eq(clothingItemsTable.season, String(season)));
  }
  if (color) {
    conditions.push(eq(clothingItemsTable.color, String(color)));
  }
  if (search) {
    conditions.push(ilike(clothingItemsTable.name, `%${String(search)}%`));
  }
  if (isAvailable !== undefined) {
    const available = isAvailable === "true";
    conditions.push(eq(clothingItemsTable.isAvailable, available));
  }

  const items = await db
    .select()
    .from(clothingItemsTable)
    .where(and(...conditions))
    .orderBy(clothingItemsTable.createdAt);

  res.json(ListClothingItemsResponse.parse(serializeItems(items as any[])));
});

// POST /clothing
router.post("/clothing", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const parsed = CreateClothingItemBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid clothing item body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(clothingItemsTable)
    .values({ ...parsed.data, userId })
    .returning();

  res.status(201).json(serializeItem(item as any));
});

// GET /clothing/:id
router.get("/clothing/:id", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [item] = await db
    .select()
    .from(clothingItemsTable)
    .where(and(eq(clothingItemsTable.id, id), eq(clothingItemsTable.userId, userId)));

  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(GetClothingItemResponse.parse(serializeItem(item as any)));
});

// PATCH /clothing/:id
router.patch("/clothing/:id", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateClothingItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(clothingItemsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(clothingItemsTable.id, id), eq(clothingItemsTable.userId, userId)))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(UpdateClothingItemResponse.parse(serializeItem(item as any)));
});

// DELETE /clothing/:id
router.delete("/clothing/:id", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [item] = await db
    .delete(clothingItemsTable)
    .where(and(eq(clothingItemsTable.id, id), eq(clothingItemsTable.userId, userId)))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.status(204).send();
});

// PATCH /clothing/:id/availability
router.patch("/clothing/:id/availability", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = ToggleClothingAvailabilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(clothingItemsTable)
    .set({ isAvailable: parsed.data.isAvailable, updatedAt: new Date() })
    .where(and(eq(clothingItemsTable.id, id), eq(clothingItemsTable.userId, userId)))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(ToggleClothingAvailabilityResponse.parse(serializeItem(item as any)));
});

export default router;
