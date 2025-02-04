import express from "express";
import { importRouter } from "./services/import/router";
import cookieParser from "cookie-parser";
import { authRouter } from "./services/auth/router";
import cors from "cors";

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

server.use("/import", importRouter);
server.use("/auth", authRouter);

server.listen({ port: PORT }, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
