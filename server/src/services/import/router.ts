import { Router } from "express";

export const importRouter = Router();

importRouter.get("/", (_, res) => res.send("Test 1ha"));
