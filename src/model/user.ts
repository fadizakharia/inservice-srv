import argon2, { argon2id } from "argon2";
import { model, Schema, SchemaTypes, Types } from "mongoose";
import { ILocation } from "./location";
import { IService } from "./service";
export interface IUser {
  id: string;
  _id: Types.ObjectId;
  first_name: string;
  last_name: string;
  password: string;
  service: IService;
  auth_type: string;
  username: string;
  date_of_birth: Date;
  profilePicture: string;
  location: ILocation;
}
export interface CurrentUser {
  id: string;
  _id: Types.ObjectId;
  first_name: string;
  last_name: string;
  auth_type: string;
  location: ILocation;
  username: string;
  date_of_birth: Date;
  profilePicture: string;
}
const userSchema = new Schema<IUser>({
  first_name: { type: SchemaTypes.String, required: true },
  last_name: { type: SchemaTypes.String, required: true },
  password: { type: SchemaTypes.String, required: false },
  auth_type: { type: SchemaTypes.String, required: true },
  service: { type: SchemaTypes.ObjectId, ref: "Service" },
  username: { type: SchemaTypes.String, required: true, unique: true },
  date_of_birth: { type: SchemaTypes.Date, required: true },
  profilePicture: { type: SchemaTypes.String, required: false },
  location: { type: SchemaTypes.ObjectId, ref: "location" },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password") || user.auth_type !== "local") return next();
  try {
    user.password = await argon2.hash(user.password, { type: argon2id });
    next();
  } catch (err) {
    next(err as Error);
  }
});

const user = model<IUser>("User", userSchema);

export default user;
