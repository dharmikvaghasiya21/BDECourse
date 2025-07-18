import { Request, Response } from 'express';
import { productModel } from '../../database/models';
import { ADMIN_ROLES, apiResponse } from '../../common';
import { countData, createData, getData, responseMessage } from '../../helper';
import mongoose from 'mongoose';
import { reqInfo } from '../../helper/winston_logger';

let ObjectId = require('mongoose').Types.ObjectId;

export const addProduct = async (req: Request, res: Response) => {
  try {
    const response = await createData(productModel, req.body);
    return res.status(200).json(
      new apiResponse(200, responseMessage.addDataSuccess('Product added successfully!'), response, {})
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      new apiResponse(500, responseMessage.internalServerError, {}, error)
    );
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productModel.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({ success: false, message: "product is not found", });
    }
    res.status(200).json({ success: true, message: "product fetched successfully", data: product, });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch product", error: error.message, });
  }
};

export const updateProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const updateData = req.body;
    const updatedProduct = await productModel.findOneAndUpdate({ _id: id }, updateData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct, });

  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to update product", error: error.message, });
  }
};


export const deleteProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedProduct = await productModel.findOneAndDelete({ _id: id }); 
    if (!deletedProduct) {
      return res.status(404).json(new apiResponse(404, "Product not found", {}, {}));
    }
    return res.status(200).json(
      new apiResponse(200, responseMessage.deleteDataSuccess('Product deleted successfully!'), deletedProduct, {})
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      new apiResponse(500, responseMessage.internalServerError, {}, error)
    );
  }
};


export const  get_all_users = async (req, res) => {
    reqInfo(req)
    let { page, limit, search } = req.query, criteria: any = {}, options: any = { lean: true }, { user } = req.headers
    try {

        if (user?.roleId?.name === ADMIN_ROLES.USER) {
            criteria._id = new ObjectId(user?._id)
        }
        if (search) {
            criteria.$or = [
                { name: { $regex: search, $options: 'si' } },
                { lastName: { $regex: search, $options: 'si' } },
                { price: { $regex: search, $options: 'si' } },
                { category: { $regex: search, $options: 'si' } }
            ];
        }

        options.sort = { createdAt: -1 };
        criteria.isDeleted = false

        let role = await productModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false }).lean()
        criteria.roleId = new ObjectId(role?._id)

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(productModel, criteria, {}, options);
        const totalCount = await countData(productModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('User'), {
            user_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}
