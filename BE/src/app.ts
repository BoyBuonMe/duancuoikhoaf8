import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import routes from "@/routes";
import { notFoundHandler, errorHandler } from "@/middlewares/error.middleware";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin:
      corsOrigin === "*" || !corsOrigin
        ? true
        : corsOrigin.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);

app.use(helmet());
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
