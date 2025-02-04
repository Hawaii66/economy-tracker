import { Router } from "express";
import { requestToUserId } from "../user/db";
import { getCategories, insertCategory } from "./db";
import { z } from "zod";

export const categoryRouter = Router();

categoryRouter.get("/", async (req, res) => {
  const userId = await requestToUserId(req);

  const categories = await getCategories(userId);

  res.json(categories);
});

categoryRouter.post("/", async (req, res) => {
  const userId = await requestToUserId(req);

  const { name, color, target } = z
    .object({
      name: z.string(),
      color: z.string().min(7).max(7),
      target: z.number().int(),
    })
    .parse(req.body);

  await insertCategory(userId, name, color, target);

  res.json({ success: true });
});
