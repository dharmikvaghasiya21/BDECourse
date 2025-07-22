import { apiResponse, USER_ROLE } from "../../common";
import { categoryModel } from "../../database";
import { responseMessage } from "../../helper";

let ObjectId = require("mongoose").Types.ObjectId;

export const addCategory = async (req, res) => {
    try {
        const body = req.body;
        const user = req.user || req.headers.user;
        body.userId = user._id;

        const category = await new categoryModel(body).save();
        return res.status(201).json(new apiResponse(201, "Category created", category, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const editCategory = async (req, res) => {
    try {
        const { id } = req.body;
        const body = req.body;
        const updated = await categoryModel.findOneAndUpdate({ _id: new ObjectId(id),isDeleted:false }, body, { new: true });

        if (!updated) return res.status(404).json(new apiResponse(404, "Category not found", null, null));

        return res.status(200).json(new apiResponse(200, "Category updated", updated, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await categoryModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!deleted) return res.status(404).json(new apiResponse(404, "Category not found", null, null));

        return res.status(200).json(new apiResponse(200, "Category deleted (soft)", null, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllCategories = async (req, res) => {
    let { user } = req.headers, criteria: any = {}
    try {
        if (user.role === USER_ROLE.USER) {
            criteria.userId = new ObjectId(user._id)
        }
        const categories = await categoryModel.find({ ...criteria, isDeleted: false }).sort({ createdAt: -1 });

        return res.status(200).json(new apiResponse(200, "Categories fetched", categories, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findOne({ _id: new ObjectId(id), isDeleted: false });
        if (!category) return res.status(404).json(new apiResponse(404, "Category not found", null, null));
        return res.status(200).json(new apiResponse(200, "Category fetched", category, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

