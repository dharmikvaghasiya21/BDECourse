import { Request, Response } from "express";
import { bannerModel } from "../../database";
import { apiResponse } from "../../common";
import { reqInfo, responseMessage } from "../../helper";
import { config } from "../../../config";

let ObjectId = require("mongoose").Types.ObjectId;

export const addBanner = async (req, res) => {
  reqInfo(req)
  try {
    const body = req.body;
    const banner = await bannerModel.create(body);
    return res.status(201).json(new apiResponse(201, "Banner section created", banner, null));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};


export const getAllBanner = async (req, res) => {
  reqInfo(req)
  try {
    const search = req.query.search as string || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = { isDeleted: false };  
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      bannerModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      bannerModel.countDocuments(query)
    ]);

    return res.status(200).json(new apiResponse(200, "bannerModels fetched", {
      banners,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    }, null));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
  }
};


export const getBannerById = async (req, res) => {
  reqInfo(req)
  try {
    const { id } = req.params;
    const banner = await bannerModel.findOne({ _id: new ObjectId(id), isDeleted: false });
    if (!banner) return res.status(404).json(new apiResponse(404, "Banner not found", null, null));
    return res.status(200).json(new apiResponse(200, "Banner found", banner, null));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
  }
};

export const editBanner = async (req, res) => {
  reqInfo(req)
  try {
    const body = req.body;
    const { id } = req.body;
    const updated = await bannerModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, body, { new: true });
    if (!updated) {
      return res.status(404).json(new apiResponse(404, "Banner not found", null, null));
    }
    return res.status(200).json(new apiResponse(200, "Banner updated", updated, null));
  } catch (error) {
    return res.status(500).json(
      new apiResponse(500, responseMessage?.internalServerError, {}, error)
    );
  }
};

export const deleteBanner = async (req, res) => {
  reqInfo(req)
  try {
    const { id } = req.params;
    const deleted = await bannerModel.findOneAndUpdate({ _id: new ObjectId(id) }, { isDeleted: true }, { new: true });
    if (!deleted) {
      return res.status(404).json(new apiResponse(404, "Banner not found", null, null));
    }

    return res.status(200).json(new apiResponse(200, "Banner soft-deleted", deleted, null));
  } catch (error) {
    return res.status(500).json(
      new apiResponse(500, responseMessage?.internalServerError, {}, error)
    );
  }
};
