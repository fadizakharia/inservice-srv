import Argon from "argon2";
import { NextFunction, Request, Response } from "express";
import moment from "moment";
import user from "../model/user";
import { CustomError } from "../utils/Error";
import { loginDTO, signupDTO } from "./auth.dto";
export const localLoginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body as loginDTO;
  try {
    const foundUser = await user.findOne({ username });
    if (!foundUser) {
      throw new CustomError("username or password is incorrect!", 400);
    }

    const loginStatus = await Argon.verify(
      foundUser.password,
      String(password)
    );

    if (!loginStatus) {
      throw new CustomError("username or password is incorrect!", 400);
    }
    const loggedUser = {
      ...foundUser.toObject(),
      password: undefined,
      service: undefined,
      id: foundUser.id,
    };

    delete loggedUser.password;
    delete loggedUser.service;
    req.session.user = loggedUser;

    res.send(loggedUser);
  } catch (err) {
    next(err);
  }
};

export const localSignupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    first_name,
    last_name,
    auth_type,
    password,
    username,
    date_of_birth,
  } = req.body as signupDTO;

  try {
    const foundUser = await user.findOne({ username });
    if (foundUser) {
      throw new CustomError("user already exists!", 400);
    }

    const transformed_date_of_birth =
      moment(date_of_birth).format("YYYY-MM-DD");

    const newUser = await user.create({
      first_name,
      last_name,
      auth_type,
      username,
      password,
      date_of_birth: transformed_date_of_birth,
    });

    const sanitisedUser = { ...newUser.toObject(), password: undefined };

    delete sanitisedUser.password;
    res.send(sanitisedUser);
  } catch (err) {
    next(err);
  }
};
export const currentUserHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session && req.session.user) {
    res.send(req.session.user);
  } else {
    const error = new CustomError("user is not logged in!", 405);
    return next(error);
  }
};
export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.session && !req.session.user) {
      throw new CustomError("User is not logged in!", 405);
    }

    req.session.destroy(function (err) {
      if (err) {
        const error = new CustomError("Something went wrong!", 500);
        return next(error);
      }

      return res.send({ status: true });
    });
  } catch (err) {
    return next(err);
  }
};
