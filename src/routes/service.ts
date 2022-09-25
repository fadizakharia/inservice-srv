import { Request, Router } from "express";
import {
  addService,
  deactivateService,
  getMyService,
  getNearbyServices,
  getService,
  setServiceImage,
  updateService,
} from "../controller/service";

const serviceRouter = Router();
serviceRouter.get("/", getNearbyServices);
serviceRouter.get("/sp/:id", getService);
serviceRouter.get("/sp", getMyService);
serviceRouter.post("/sp", addService);
serviceRouter.put("/sp/", updateService);

// serviceRouter.delete("/deactivate"); //soft deletion removal from search
serviceRouter.put("/sp/status/:id", deactivateService);
serviceRouter.put("/sp/image", setServiceImage);
export default serviceRouter;
