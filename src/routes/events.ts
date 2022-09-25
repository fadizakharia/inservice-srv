import { Router } from "express";
import {
  getEvents,
  handleServiceEventActions,
  sendEventRequest,
} from "../controller/event";

const eventsRouter = Router();

eventsRouter.get("/", getEvents);

eventsRouter.post("/", sendEventRequest);

eventsRouter.put("/", handleServiceEventActions);

export default eventsRouter;
