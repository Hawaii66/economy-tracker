import { Router } from "express";
import { requestToUserId } from "../user/db";
import { getAccounts, insertAccount } from "./db";
import { z } from "zod";

export const accountRouter = Router();

accountRouter.get("/", async (req, res) => {
  const userId = await requestToUserId(req);

  const accounts = await getAccounts(userId);

  res.json(accounts);
});

accountRouter.post("/", async (req, res) => {
  const userId = await requestToUserId(req);

  const { name } = z
    .object({
      name: z.string(),
    })
    .parse(req.body);

  await insertAccount(userId, name);

  res.json({ success: true });
});
