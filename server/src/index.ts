import express from "express";
import { transactionRouter } from "./services/transaction/router";
import cookieParser from "cookie-parser";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { swishRouter } from "./services/swish/router";
import { customerRouter } from "./services/customers/router";
import { accountRouter } from "./services/account/router";
import { categoryRouter } from "./services/category/router";

const server = express();

const PORT = 8000;

server.get("/", (_, response) =>
  response.send(`Server listening at port ${PORT}`)
);

server.use(cookieParser());
server.use(express.json());
server.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);
server.use(clerkMiddleware());
server.use(requireAuth());

server.use("/transaction", transactionRouter);
server.use("/swish", swishRouter);
server.use("/customer", customerRouter);
server.use("/account", accountRouter);
server.use("/category", categoryRouter);

server.listen({ port: PORT }, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
