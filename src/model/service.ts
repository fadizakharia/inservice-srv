import { model, Schema, SchemaTypes } from "mongoose";
import { categories, T } from "../constants/categories";
import { IEvents } from "./event";
import pointSchema, { ILocation } from "./location";

import { IUser } from "./user";

export interface IService {
  title: string;
  slug: string;
  description: string;
  price_type: "hr" | "one-time";
  price: number;
  user: IUser;
  category: T;
  events: IEvents;
  geometry: ILocation;
  radius: number;
  location_name: string;
  rating: number;
  nbOfRatings: number;
  status: "active" | "inactive";
  cover_url: string;
}

const serviceSchema = new Schema<IService, IService>({
  title: { type: SchemaTypes.String, required: true },
  slug: { type: SchemaTypes.String, required: false },
  description: { type: SchemaTypes.String, required: false },
  price_type: {
    type: SchemaTypes.String,
    enum: ["hr", "one-time"],
    required: true,
  },
  price: { type: SchemaTypes.Number, required: true, min: 0.99 },
  user: { type: SchemaTypes.ObjectId, ref: "User" },
  category: { type: SchemaTypes.String, enum: categories },
  events: { type: SchemaTypes.ObjectId, ref: "Event" },
  geometry: { type: pointSchema, index: "2dsphere" },
  location_name: { type: SchemaTypes.String, required: false },
  radius: { type: SchemaTypes.Number, required: true },
  rating: { type: SchemaTypes.Number, required: true, default: 0 },
  nbOfRatings: { type: SchemaTypes.Number, required: true, default: 0 },
  status: { type: SchemaTypes.String, enum: ["active", "inactive"] },
  cover_url: { type: SchemaTypes.String, required: false },
});
serviceSchema.index({
  title: "text",
  description: "text",
  category: "text",
});

const service = model<IService>("Service", serviceSchema);
export default service;
