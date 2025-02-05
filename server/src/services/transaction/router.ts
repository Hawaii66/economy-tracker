import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { filterTransactions, parseSEBCSV } from "./csv";
import {
  classifyTransaction,
  getImportedTransactions,
  getTransactions,
  importTransactions,
} from "./db";
import { requestToUserId } from "../user/db";

export const transactionRouter = Router();
const upload = multer();

transactionRouter.get("/upload", async (req, res) => {
  const userId = await requestToUserId(req);

  const importedTransactions = await getImportedTransactions(userId);

  res.json(importedTransactions);
});

transactionRouter.post("/classify", async (req, res) => {
  const data = z
    .object({
      type: z.enum(["Customer", "Swish", "Internal"]),
      transactionId: z.string().uuid(),
      otherId: z.string().uuid(),
      categoryId: z.string().uuid(),
    })
    .parse(req.body);

  const id = await classifyTransaction(data);

  return res.json({ id });
});

transactionRouter.post(
  "/upload",
  upload.single("file"),
  async (request, response) => {
    if (!request.file) {
      response.status(400).send("No file uploaded");
      return;
    }

    const filters = {
      startDate: new Date(request.body["start-date"]),
      endDate: new Date(request.body["end-date"]),
      accountId: request.body["account-id"],
    };
    const verified = z
      .object({
        startDate: z.date(),
        endDate: z.date(),
        accountId: z.string().uuid(),
      })
      .parse(filters);

    const csv = request.file.buffer.toString();
    const transactions = parseSEBCSV(csv);

    const filteredTransactions = filterTransactions(
      transactions,
      verified.startDate,
      verified.endDate
    );

    const result = await importTransactions(
      filteredTransactions,
      verified.accountId
    );
    response.json(result);
  }
);

transactionRouter.get("/", async (req, res) => {
  const userId = await requestToUserId(req);

  const { from, to } = z
    .object({
      from: z.coerce.date(),
      to: z.coerce.date(),
    })
    .parse(req.query);

  const transactions = await getTransactions(from, to, userId);
  res.json(transactions);
});
