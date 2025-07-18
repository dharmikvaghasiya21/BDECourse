import { bannerModel, userModel } from "../../database/models";
import { Request, Response } from "express";
import { createData, responseMessage, updateData } from "../../helper";
import { apiResponse } from "../../common";
import QRCode from "qrcode";
import path from "path";
import fs from 'fs';
import { config } from "../../../config";

let ObjectId = require('mongoose').Types.ObjectId;

export const addBanner = async (req, res) => {
  try {
    const body = req.body;

    const user = await userModel.findOne({ _id: new ObjectId(body.userId), isDeleted: false });
    if (!user) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}));

    if (user && user.link) {
      const qrCodeBase64 = await QRCode.toDataURL(user.link);

      const base64Data = qrCodeBase64.replace(/^data:image\/png;base64,/, "");

      const fileName = `qr_${Date.now()}.png`;
      const uploadDir = path.join(__dirname, "../../../uploads");
      const filePath = path.join(uploadDir, fileName);

      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(filePath, base64Data, "base64");

      const publicUrl = `${config.BACKEND_URL}/uploads/${fileName}`;
      body.qrCode = publicUrl;
    }

    const response = await bannerModel.create(body);
    return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Banner data is successfully'), response, {}));

  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id, userId, QRcode, ...body } = req.body;

    if (!id) {
      return res.status(400).json(new apiResponse(400, "Banner ID is required", {}, {}));
    }

    let isExist = await bannerModel.findOne({ _id: new ObjectId(id), isDeleted: false });
    if (!isExist) {
      return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("Banner"), {}, {}));
    }

    if (userId) {
      let newUser = await userModel.findOne({ _id: new ObjectId(userId), isDeleted: false });
      if (!newUser) {
        return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}));
      }

      let existingUser = await userModel.findOne({ _id: new ObjectId(isExist.userId), isDeleted: false });
      if (!existingUser) {
        return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}));
      }

      if (newUser.link) {
        if (isExist.qrCode && isExist.qrCode.startsWith("data:image")) {
          const oldFileNameMatch = isExist.qrCode.match(/qr_(\d+)\.png/);
          if (oldFileNameMatch) {
            const oldFileName = `qr_${oldFileNameMatch[1]}.png`;
            const oldFilePath = path.join(__dirname, "../../../uploads", oldFileName);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }
          }
        }

        const qrCodeBase64 = await QRCode.toDataURL(newUser.link);
        const base64Data = qrCodeBase64.replace(/^data:image\/png;base64,/, "");

        const fileName = `qr_${Date.now()}.png`;
        const filePath = path.join(__dirname, "../../../uploads", fileName);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, base64Data, "base64");

        body.qrCode = qrCodeBase64;
      }
    }
    const response = await updateData(bannerModel, { _id: new ObjectId(id) }, body, {});
    if (!response) {
      return res.status(404).json(new apiResponse(404, "Banner not found", {}, {}));
    }

    return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("Banner data is updated"), response, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
  }
};



export const getBannerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await bannerModel.findOne({ _id: id });
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found", });
    }
    res.status(200).json({ success: true, message: "Banner fetched successfully", data: banner, });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch banner", error: error.message, });
  }
};

export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const banners = await bannerModel.find({ isDeleted: false })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Optional: sort by newest first

    const total = await bannerModel.countDocuments({ isDeleted: false });

    res.status(200).json({
      success: true, message: "Banners fetched successfully", data: banners, total, currentPage: Number(page), totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch banners", error: error.message, });
  }
};

export const deleteBannerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedBanner = await bannerModel.findOneAndUpdate({ _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }, { new: true }
    );
    if (!deletedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found or already deleted", });
    }
    return res.status(200).json({ success: true, message: "Banner soft deleted successfully", data: deletedBanner, });
  }
  catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to soft delete banner", error: error.message, });
  }
};