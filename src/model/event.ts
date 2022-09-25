import { model, Schema, SchemaTypes } from "mongoose";
import { T } from "../constants/eventStatus";
import pointSchema, { ILocation } from "./location";
import { IService } from "./service";
import { IUser } from "./user";
export interface IEvents {
  service: IService;
  customer: IUser;
  provider: IUser;
  start_time: Date;
  end_time: Date;
  location: ILocation;
  status: T;
  rated: boolean;
  archived: boolean;
  customer_status: "cancel" | "unfulfilled" | "requested" | "fulfilled";
  service_provider_status:
    | "cancel"
    | "accepted"
    | "fulfilled"
    | "no-action"
    | "reject";
  pending: boolean;
}
const eventSchema = new Schema<IEvents>(
  {
    customer: { type: SchemaTypes.ObjectId, ref: "User" },
    provider: { type: SchemaTypes.ObjectId, ref: "User" },
    start_time: { type: SchemaTypes.Date, required: true },
    end_time: { type: SchemaTypes.Date, required: true },
    location: { type: pointSchema, required: true, index: "2dsphere" },
    customer_status: {
      type: SchemaTypes.String,
      enum: ["cancel", "unfulfilled", "requested", "fulfilled"],
      default: "requested",
    },
    archived: { type: SchemaTypes.Boolean, default: false },
    service_provider_status: {
      type: SchemaTypes.String,
      enum: ["cancel", "accepted", "no-action", "reject"],
      default: "no-action",
    },
    pending: { type: SchemaTypes.Boolean, default: true },
    rated: { type: SchemaTypes.Boolean, default: false },
    service: { type: SchemaTypes.ObjectId, ref: "Service" },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);
eventSchema
  .virtual("status")
  .get(function () {
    if (
      this.customer_status === "cancel" &&
      this.service_provider_status === "accepted"
    ) {
      this.archived = true;
      return "canceled event";
    } else if (
      this.customer_status === "requested" &&
      this.service_provider_status === "no-action"
    ) {
      return "pending approval";
    } else if (
      this.customer_status === "requested" &&
      this.service_provider_status === "reject"
    ) {
      this.archived = true;
      return `request rejected`;
    } else if (
      this.customer_status === "requested" &&
      this.service_provider_status === "accepted"
    ) {
      return `active`;
    } else if (
      this.customer_status === "fulfilled" &&
      this.service_provider_status === "accepted"
    ) {
      this.archived = true;
      return `fulfilled`;
    } else if (
      this.customer_status === "unfulfilled" &&
      this.service_provider_status === "accepted"
    ) {
      this.archived = true;
      return `unfulfilled`;
    } else if (
      this.customer_status === "requested" &&
      this.service_provider_status === "cancel"
    ) {
      this.archived = true;
      return `canceled`;
    } else {
      this.archived = true;
      return `canceled request`;
    }
  })
  .set(function (v) {
    if (
      v === "canceled event" ||
      v === "request rejected" ||
      v === "fulfilled" ||
      v === "unfulfilled"
    ) {
      // console.log(v);

      this.updateOne({ $set: { archived: true } });
    } else {
      this.updateOne({ $set: { archived: false } });
    }
  });

const events = model<IEvents>("Event", eventSchema);
export default events;
