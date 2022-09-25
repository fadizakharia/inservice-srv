import { Router } from "express";
const eventRouter = Router();
eventRouter.get("/");
eventRouter.post("/");
eventRouter.delete("/:id");
eventRouter.put("/");
export default eventRouter;
