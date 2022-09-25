import { Router } from "express";

import { setProfilePicture } from "../controller/user";

const userRouter = Router();

userRouter.put("/profile-picture", setProfilePicture);
export default userRouter;
