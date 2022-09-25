import { NextFunction, Request, Response } from "express";
import { T } from "../constants/categories";
import service from "../model/service";
import user from "../model/user";
import { CustomError } from "../utils/Error";
import { singleFileUpload } from "../utils/fileUploadS3";
import { addServiceDTO, updateServiceDTO } from "./services.dto";

const getBaseNearbySearchQuery = (
  lat: number,
  lng: number,
  distance: number = 10000,
  page: number = 0,
  limit: number = 10,
  user,
  category?: T
) => {
  if (category) {
    return service.find({
      geometry: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: distance,
        },
      },
      category,
      user: { $ne: user },
    });
  } else {
    return service.find({
      geometry: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: distance,
        },
      },
      user: { $ne: user },
    });
  }
};
export const getNearbyServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    lat,
    lng,
    category,
    distance = "50000",
    page = "0",
    limit = "10",
  } = req.query;
  let sanitisedParams: any = {
    lat: parseFloat(lat as string),
    lng: parseFloat(lng as string),
    distance: parseFloat(distance as string),
    category: category as string,
  };
  Object.keys(sanitisedParams).forEach((key) => {
    if (!sanitisedParams[key] && sanitisedParams[key] !== 0) {
      delete sanitisedParams[key];
    }
  });
  const user = req.session.user;
  console.log(req.session.user);

  try {
    if (!user) {
      throw new CustomError("user is not logged in!", 401);
    }

    const total = await getBaseNearbySearchQuery(
      sanitisedParams.lat,
      sanitisedParams.lng,
      +distance,
      +page,
      +limit,
      user,
      sanitisedParams.category as T
    ).count();
    const foundServices = await getBaseNearbySearchQuery(
      sanitisedParams.lat,
      sanitisedParams.lng,
      +distance,
      +page,
      +limit,
      user,
      sanitisedParams.category as T
    ).skip(+page * +limit);

    res.send({ services: foundServices, pagination: { total, page, limit } });
  } catch (err) {
    return next(err);
  }
};
export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.session.user;
  try {
    if (!currentUser) {
      throw new CustomError("unauthorized access", 401);
    }
    const foundUser = await user.findById(currentUser._id).populate("service");
    if (foundUser) {
      res.send({ services: foundUser.service });
    } else {
      throw new CustomError("you currently have no services!", 404);
    }
  } catch (err) {
    return next(err);
  }
};
export const getService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const foundService = await service.findById(id).populate("user");
    if (foundService) {
      res.send({ service: foundService });
    } else {
      throw new CustomError("could not find requested service!", 404);
    }
  } catch (err) {
    return next(err);
  }
};
export const getMyService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.session.user;

  try {
    if (!user) {
      throw new CustomError("user is not logged in!", 401);
    }

    const foundService = await service.findOne({ user: user.id });

    if (foundService) {
      return res.send({ ...foundService.toObject() });
    } else {
      throw new CustomError("user does not have a service!", 404);
    }
  } catch (err) {
    return next(err);
  }
};
export const addService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { location, ...serviceInput } = req.body as addServiceDTO;

  const currentUser = req.session.user;

  try {
    if (!currentUser) {
      throw new CustomError("user is unauthorized to add a service", 401);
    }
    const foundUser = await user.findById(currentUser._id).populate("service");
    if (foundUser && foundUser.service) {
      throw new CustomError("operation is forbidden", 405);
    }
    const locationSanitised = {
      type: "Point",
      coordinates: [location.longitude, location.latitude],
    };

    const createdService = await service.create({
      ...serviceInput,
      user: currentUser._id,
      geometry: locationSanitised,
      location_name: location.name,
    });
    foundUser!.service = createdService;
    await foundUser!.save();
    res.send({ service: createdService.toObject() });
  } catch (err) {
    return next(err);
  }
};
export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serviceInput = req.body as updateServiceDTO;
  try {
    const currentUser = req.session.user;
    if (!currentUser) {
      throw new CustomError("user is unauthorized to perform this action", 401);
    }
    const foundService = await service.findOne({ user: currentUser._id });

    if (!foundService) {
      throw new CustomError("user does not have a service!", 404);
    }

    const locationSanitised = {
      coordinates: [
        serviceInput.location.longitude,
        serviceInput.location.latitude,
      ],
    };

    if (location) {
      foundService.geometry = locationSanitised;
    }
    let sanitisedData = { ...foundService, ...serviceInput };
    await service.updateOne({ _id: foundService._id }, sanitisedData);

    res.send({ status: true });
  } catch (err) {
    return next(err);
  }
};
export const setServiceImage = async (
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
      await service.updateOne(
        { user: req.session.user._id },
        {
          $set: { cover_url: file.location },
        }
      );
    });
  } catch (err) {
    next(err);
  }
};
export const deactivateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.session.user;
  try {
    if (!currentUser) {
      throw new CustomError("user is unauthorized to perform this action", 401);
    }
    const foundService = await service.findOne({ user: currentUser._id });
    if (!foundService) {
      throw new CustomError("service does not exist!", 404);
    }
    if (currentUser._id !== foundService.user._id) {
      throw new CustomError("user is unauthorized to perform this action", 401);
    }
    await service.updateOne(
      { _id: foundService._id },
      { $set: { status: "inactive" } }
    );
    res.send({ status: true });
  } catch (err) {
    return next(err);
  }
};
export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.session.user;
  try {
    if (!currentUser) {
      throw new CustomError("user is unauthorized to perform this action", 401);
    }
    const foundService = await service.findOne({ user: currentUser._id });
    if (!foundService) {
      throw new CustomError("service does not exist!", 404);
    }
    if (currentUser._id !== foundService.user._id) {
      throw new CustomError("user is unauthorized to perform this action", 401);
    }
    await service.deleteOne({ user: foundService.user._id });
    res.send({ status: true });
  } catch (err) {
    return next(err);
  }
};
