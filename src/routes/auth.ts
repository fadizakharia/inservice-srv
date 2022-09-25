import { Router } from "express";
import { body } from "express-validator";
import {
  currentUserHandler,
  localLoginHandler,
  localSignupHandler,
  logoutHandler,
} from "../controller/auth";
import { expressValidatorValidation } from "../controller/error";
const authRouter = Router();
authRouter.post(
  "/local",
  body("username").isEmail().withMessage("username must be a valid email!"),
  body("password")
    .isLength({ min: 6 })
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .withMessage("password must be atleast 6 characters and alphanumeric!"),

  expressValidatorValidation,
  localLoginHandler
);
authRouter.post(
  "/local/signup",
  body("first_name").isString(),
  body("last_name").isString(),
  body("username").isEmail().withMessage("username must be a valid email!"),
  body("password")
    .isLength({ min: 6 })
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .withMessage("password must be atleast 6 characters and alphanumeric!"),
  body("date_of_birth").isString(),

  body("auth_type").isString().isIn(["local"]),
  expressValidatorValidation,
  localSignupHandler
);
authRouter.get("", currentUserHandler);
authRouter.delete("", logoutHandler);
export default authRouter;
