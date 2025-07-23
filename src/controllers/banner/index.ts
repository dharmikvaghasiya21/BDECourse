import { Request, Response } from "express";
import { bannerModel } from "../../database";
import { apiResponse } from "../../common";
import { countData, getData, reqInfo, responseMessage } from "../../helper";
import { config } from "../../../config";

let ObjectId = require("mongoose").Types.ObjectId;

export const addBanner = async (req, res) => {
  reqInfo(req)
  try {
    const body = req.body;
    const banner = await bannerModel.create(body);
    return res.status(200).json(new apiResponse(200, "Banner section created", banner, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};


export const getAllBanner = async (req, res) => {
  reqInfo(req);
  try {
    let { type, search, page, limit } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false };
    if (type) criteria.type = type;
    if (search) {
      criteria.title = { $regex: search, $options: 'si' };
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 1;

    if (page && limit) {
      options.skip = (parseInt(page) - 1) * parseInt(limit);
      options.limit = parseInt(limit);
    }

    const response = await getData(bannerModel, criteria, {}, options);
    const totalCount = await countData(bannerModel, criteria);

    const stateObj = {
      page: pageNum,
      limit: limitNum,
      page_limit: Math.ceil(totalCount / limitNum) || 1,
    };

    return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Banners'), { banner_data: response, totalData: totalCount, state: stateObj }, {}));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
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
