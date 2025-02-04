import { Router } from "express";
import { requestToUserId } from "../user/db";
import { getCustomers, insertCustomer } from "./db";
import { z } from "zod";

export const customerRouter = Router();

customerRouter.get("/", async (req, res) => {
  const userId = await requestToUserId(req);

  const customers = await getCustomers(userId);

  res.json(customers);
});

customerRouter.post("/", async (req, res) => {
  const userId = await requestToUserId(req);

  const data = z
    .object({
      name: z.string(),
      color: z.string().min(7).max(7),
      rename: z.string(),
      categoryId: z.string().uuid().nullable(),
    })
    .parse(req.body);

  await insertCustomer(userId, data);

  res.json({ success: true });
});
