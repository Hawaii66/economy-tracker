import { Router } from "express";
import { requestToUserId } from "../user/db";
import { getSwishRecipients, insertSwishRecipient } from "./db";
import { z } from "zod";
import { getImportedTransactions } from "../transaction/db";

export const swishRouter = Router();

swishRouter.get("/", async (req, res) => {
  const userId = await requestToUserId(req);

  const swishRecipients = await getSwishRecipients(userId);

  res.json(swishRecipients);
});

swishRouter.post("/", async (req, res) => {
  const userId = await requestToUserId(req);

  const { name, swishNumber } = z
    .object({
      name: z.string(),
      swishNumber: z.string(),
    })
    .parse(req.body);

  await insertSwishRecipient(userId, name, swishNumber);

  res.json({ success: true });
});
