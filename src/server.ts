import { json } from "body-parser";
import connectMongo from "connect-mongo";
import connectRedis from "connect-redis";
import Cors from "cors";
import { config } from "dotenv";
import express from "express";
import Session from "express-session";
import mongoose from "mongoose";
import {
  errorLogger,
  generalErrorResponder,
  validationErrorResponder,
} from "./controller/error";
import { CurrentUser } from "./model/user";
import authRouter from "./routes/auth";
import eventsRouter from "./routes/events";
import serviceRouter from "./routes/service";
import userRouter from "./routes/user";
config({
  path: `env/${process.env.NODE_ENV}.env`,
});
declare module "express-session" {
  interface Session {
    user: CurrentUser;
  }
}

const app = express();
const RedisStore = connectRedis(Session as any);
console.log(process.env.SESSION_SECRET);

app.use(json());
app.use(Cors({ credentials: true }));

// initialise session based authentication with redis for caching sessions
app.use(
  Session({
    store: new connectMongo({
      mongoUrl: process.env.MONGO_URI!,
    }),
    name: "msh",
    secret: process.env.SESSION_SECRET as any,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);
// api routes
app.use("/auth/", authRouter);
app.use("/user/", userRouter);
app.use("/services/", serviceRouter);
app.use("/event", eventsRouter);

// error handling middlewares
app.use(errorLogger);
app.use(validationErrorResponder);
app.use(generalErrorResponder);

app
  .listen(4000, async () => {
    await mongoose.connect(process.env.MONGO_URI!);
  })
  .addListener("error", (err) => {
    console.log(err);
  });
