import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { CustomError } from "../utils/Error";
export const errorLogger = (
  err: CustomError,
  _: Request,
  __: Response,
  next: NextFunction
) => {
  console.log(err.status);
  console.log(err.message);
  next(err);
};
export const validationErrorResponder = (
  err: CustomError,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (+err.status === 400) {
    res.status(+err.status).send({
      error: { message: err.message, status: err.status },
    });
  } else {
    next(err);
  }
};
export const generalErrorResponder = (
  err: CustomError,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  res
    .status(err.status)
    .send({ error: { message: err.message, status: err.status } });
};
export const expressValidatorValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new CustomError(JSON.stringify(errors.array()), 400));
  }
  return next();
};
