import { NextFunction, Request, Response } from "express";
import user from "../model/user";
import { CustomError } from "../utils/Error";
import { singleFileUpload } from "../utils/fileUploadS3";
export const setProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.session.user) {
      throw new CustomError("user is not logged in!", 401);
    }

    const multer = singleFileUpload();
    const singleUpload = multer.single("image");
    singleUpload(req, res, async (err) => {
      if (err) {
        return next(err);
      }
      let file: any = req.file;

      await user.updateOne(
        { _id: req.session.user._id },
        {
          $set: { profilePicture: file?.location },
        }
      );
    });
  } catch (err) {
    next(err);
  }
};
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  try {
    const foundUser = await user.findById(userId);
    if (!foundUser) {
      throw new CustomError("User does not exist!", 404);
    }
    res.send({ user: foundUser });
  } catch (err) {
    return next(err);
  }
};
