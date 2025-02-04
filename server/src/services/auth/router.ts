import { Router } from "express";

export const authRouter = Router();

authRouter.get("/", (req, res) => {
  const cookies: Record<string, string> = req.cookies;

  const token = cookies.token;
  if (!token) {
    return res.sendStatus(401);
  }

  return res.sendStatus(200);
});
