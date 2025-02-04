import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { filterTransactions, parseSEBCSV } from "./csv";
import { importTransactions } from "./db";

export const importRouter = Router();
const upload = multer();

importRouter.post(
  "/upload-transactions",
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
