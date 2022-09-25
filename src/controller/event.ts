import { NextFunction, Request, Response } from "express";
import moment from "moment";
import events, { IEvents } from "../model/event";
import service from "../model/service";
import {
  customerActions,
  providerActions,
  validateAction,
} from "../utils/availableEventActions";
import { CustomError } from "../utils/Error";
export const getEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    type,
    page = "0",
    limit = "10",
    archived = "false",
    pending = "false",
  } = req.query;
  try {
    const sanitisedParams = {
      type,
      page: +page,
      limit: +limit,
      archived: archived === "true",
      pending: pending === "true",
    };

    if (!req.session.user) {
      throw new CustomError("Unauthorized", 401);
    }

    let foundEvents: Array<IEvents> = [];
    let foundCount: number;
    let hasNext: boolean;

    if (type === "customer") {
      foundCount = await events
        .find({
          customer: req.session.user._id,
          archived: sanitisedParams.archived,
        })
        .populate("service")
        .count();
      foundEvents = await events
        .find({
          customer: req.session.user._id,
          archived: sanitisedParams.archived,
        })
        .populate("service")
        .skip(sanitisedParams.page * sanitisedParams.limit);
      sanitisedParams.page++;
      hasNext =
        foundCount / (sanitisedParams.page * sanitisedParams.limit) >= 1;
    } else if (type === "provider") {
      console.log(sanitisedParams);

      foundCount = await events
        .find({
          provider: req.session.user._id,
          archived: sanitisedParams.archived,
          pending,
        })
        .populate("service")
        .count();
      console.log(foundCount);

      foundEvents = await events
        .find({
          provider: req.session.user._id,
          archived: sanitisedParams.archived,
          pending: sanitisedParams.pending,
        })
        .populate("service")
        .skip(sanitisedParams.page * sanitisedParams.limit);
      sanitisedParams.page++;

      hasNext =
        foundCount / (sanitisedParams.page * sanitisedParams.limit) >= 1;
    } else {
      throw new CustomError("Forbidden", 405);
    }
    console.log(foundEvents);

    res.send({ events: foundEvents, hasNext });
  } catch (err) {
    return next(err);
  }
};

export const sendEventRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { serviceId, start_time, end_time, location } = req.body;

  const user = req.session.user;
  try {
    if (!user) {
      throw new CustomError("unauthorized", 401);
    }
    const foundService = await service.findById(serviceId).populate("user");
    if (!foundService) {
      throw new CustomError("service does not exist", 404);
    }

    if (foundService.user._id === user._id) {
      throw new CustomError("Forbidden", 405);
    }
    if (!moment(end_time).isAfter(moment(start_time))) {
      throw new CustomError("start time cannnot be after end time", 400);
    }

    if (moment(end_time).diff(start_time, "hours") > 12) {
      throw new CustomError("service cannot be more than 12 hours!", 400);
    }
    const createdEvent = await events.create({
      customer: user._id,
      provider: foundService.user._id,
      start_time,
      end_time,
      location: {
        coordinates: [location.longitude, location.latitude],
      },

      service: serviceId,
    });
    res.send({ event: createdEvent });
  } catch (err) {
    return next(err);
  }
};

export const handleServiceEventActions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { action, eventId } = req.body;
  try {
    let type: "customer" | "provider" = "customer";
    const user = req.session.user;
    if (!user) {
      throw new CustomError("unauthorized", 401);
    }
    const foundEvent = await events.findById(
      eventId,
      {},
      { populate: ["customer", "provider"] }
    );
    if (!foundEvent) {
      throw new CustomError("event does not exist", 404);
    }

    if (
      foundEvent.customer.id !== user.id &&
      foundEvent.provider.id !== user.id
    ) {
      throw new CustomError("Operation forbidden", 405);
    }
    if (foundEvent.customer.id === user.id) {
      type = "customer";
    } else {
      type = "provider";
    }
    if (action === "fulfill" || action == "unfulfill") {
      if (
        moment(foundEvent?.end_time).isBefore(foundEvent?.start_time) &&
        foundEvent.customer._id === user._id
      ) {
        foundEvent.customer_status =
          action === "fulfill" ? "fulfilled" : "unfulfilled";

        const updatedEvent = await foundEvent.save();
        return { event: updatedEvent };
      } else {
        throw new CustomError("Action forbidden", 405);
      }
    }
    const validAction = validateAction(
      foundEvent.customer_status,
      foundEvent.service_provider_status,
      type,
      action
    );
    if (!validAction) {
      throw new CustomError("Forbidden", 405);
    }

    if (type === "customer") {
      switch (action as customerActions) {
        case "cancel":
          foundEvent.customer_status = "cancel";
          foundEvent.archived = true;
          break;
        case "fulfill":
          foundEvent.customer_status = "fulfilled";
          foundEvent.archived = true;
          break;
        default:
          foundEvent.customer_status = "unfulfilled";
          foundEvent.archived = true;
      }
    } else {
      switch (action as providerActions) {
        case "accept":
          foundEvent.service_provider_status = "accepted";
          break;
        case "cancel":
          if (foundEvent) foundEvent.service_provider_status = "cancel";

          break;
        default:
          foundEvent.service_provider_status = "reject";
          foundEvent.archived = true;
      }
    }
    foundEvent.pending = false;
    await foundEvent.save();
    res.send({ status: true });
  } catch (err) {
    return next(err);
  }
};
