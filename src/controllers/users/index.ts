import QRCode from "qrcode";
import { userModel } from "../../database/models/users";
import { apiResponse } from "../../common";
import { Request, Response } from "express";
import { countData, getData, responseMessage } from "../../helper";
import { ADMIN_ROLES } from "../../common";
import mongoose from "mongoose";
import { reqInfo } from "../../helper/winston_logger";

const ObjectId = mongoose.Types.ObjectId;

export const add_user = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const userEmail = await userModel.findOne({ email: body.email, isDeleted: false });
    if (userEmail) {
      return res.status(409).json(
        new apiResponse(409, responseMessage?.alreadyEmail || "Email already registered", {}, {})
      );
    }

    const userPhone = await userModel.findOne({ phoneNumber: body.phoneNumber, isDeleted: false });
    if (userPhone) {
      return res.status(409).json(new apiResponse(409, "Phone number already registered", {}, {}));
    }

    if (!body.role) {
      body.role = ADMIN_ROLES.USER;
    }

    const newUser = new userModel({ ...body });
    const result = await newUser.save();

    const responseData = {
      userType: body.role,
      ...result.toObject(),
    };

    return res.status(200).json(new apiResponse(200, "User added successfully", responseData, {}));
  } catch (error) {
    console.error("Add user error:", error);
    return res.status(500).json(
      new apiResponse(500, responseMessage?.internalServerError || "Internal server error", {}, error)
    );
  }
};



export const update_user = async (req: Request, res: Response) => {
  try {
    const { id, phoneNumber } = req.body;
    const updateData = { ...req.body };

    if (!ObjectId.isValid(id)) {
      return res.status(400).json(new apiResponse(400, "Invalid user ID", {}, {}));
    }

    const existingUser = await userModel.findOne({ _id: new ObjectId(id), isDeleted: false });
    if (!existingUser) {
      return res.status(404).json(new apiResponse(404, "User not found", {}, {}));
    }
    if (phoneNumber) {
      const duplicatePhone = await userModel.findOne({
        _id: { $ne: new ObjectId(id) },
        phoneNumber,
        isDeleted: false,
      });

      if (duplicatePhone) {
        return res.status(409).json(
          new apiResponse(409, "Phone number already in use by another user", {}, {})
        );
      }
    }

    const updatedUser = await userModel.findOneAndUpdate({ _id: new ObjectId(id) },{ $set: updateData },{ new: true });

    return res.status(200).json(
      new apiResponse(200, "User updated successfully", updatedUser, {})
    );

  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json(
      new apiResponse(500, responseMessage?.internalServerError || "Internal Server Error", {}, error)
    );
  }
};




export const delete_user = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findOne({ _id: id, isDeleted: false });
    if (!user) { return res.status(404).json(new apiResponse(404, "User not found", {}, {})); }

    await userModel.findOneAndDelete(id, { $set: { isDeleted: true } });
    return res.status(200).json(new apiResponse(200, "User deleted successfully", {}, {})
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json(
      new apiResponse(500, responseMessage?.internalServerError || "Internal Server Error", {}, error)
    );
  }
};


export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userModel.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return res.status(404).json(new apiResponse(404, "User not found", {}, {}));
    }
    return res.status(200).json(new apiResponse(200, "User fetched successfully", user, {}));
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json(
      new apiResponse(500, responseMessage?.internalServerError || "Internal Server Error", {}, error)
    );
  }
};


export const get_all_users = async (req: Request, res: Response) => {
  reqInfo(req);

  let { page, limit, search } = req.query as any;
  let criteria: any = {};
  let options: any = { lean: true };
  const userHeader = req.headers?.user ? JSON.parse(req.headers.user as string) : null;

  try {

    if (userHeader?.role === ADMIN_ROLES.USER) {
      criteria._id = new ObjectId(userHeader?._id);
    }


    if (search) {
      criteria.$or = [
        { firstName: { $regex: search, $options: "si" } },
        { lastName: { $regex: search, $options: "si" } },
        { email: { $regex: search, $options: "si" } },
        { phoneNumber: { $regex: search, $options: "si" } },
        { type: { $regex: search, $options: "si" } }
      ];
    }

    criteria.role = ADMIN_ROLES.USER;
    criteria.isDeleted = false;

    options.sort = { createdAt: -1 };
    if (page && limit) {
      options.skip = (parseInt(page) - 1) * parseInt(limit);
      options.limit = parseInt(limit);
    }
    const response = await getData(userModel, criteria, {}, options);
    const totalCount = await countData(userModel, criteria);

    // Pagination object
    const stateObj = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || totalCount,
      page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
    };

    return res.status(200).json(
      new apiResponse(200, responseMessage.getDataSuccess("User"), {
        user_data: response,
        totalData: totalCount,
        state: stateObj,
      }, {})
    );
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res
      .status(500)
      .json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
  }
};

export const get_QR_code = async(req, res) => {
  try {

  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
  }
}