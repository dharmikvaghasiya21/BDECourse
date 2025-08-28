import { apiResponse, USER_ROLE } from "../../common";
import { categoryModel } from "../../database";
import { countData, getData, reqInfo, responseMessage } from "../../helper";

let ObjectId = require("mongoose").Types.ObjectId;

export const addCategory = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;
        let isExist = await categoryModel.findOne({ type: body.type, priority: body.priority, isDeleted: false });
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage.dataAlreadyExist('priority'), {}, {}));

        const category = await new categoryModel(body).save();
        return res.status(200).json(new apiResponse(200, "Category created", category, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const editCategory = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.body;
        const body = req.body;

        let isExist = await categoryModel.findOne({ type: body.type, priority: body.priority, isDeleted: false, _id: { $ne: new ObjectId(body.id) } });
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage.dataAlreadyExist('priority'), {}, {}));

        const updated = await categoryModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, body, { new: true });

        if (!updated) return res.status(404).json(new apiResponse(404, "Category not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "Category updated", updated, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteCategory = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const deleted = await categoryModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!deleted) return res.status(404).json(new apiResponse(404, "Category not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "Category deleted (soft)", deleted, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllCategories = async (req, res) => {
    reqInfo(req);
    try {
        let { type, search, page, limit, featureFilter, actionFilter } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false };
        if (type) criteria.type = type;

        if (featureFilter) criteria.feature = featureFilter;
        if (actionFilter) criteria.action = actionFilter;

        if (search) {
            criteria.title = { $regex: search, $options: 'si' };
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 1;
        options.sort = { createdAt: -1 };;

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }
        const response = await getData(categoryModel, criteria, {}, options);
        const totalCount = await countData(categoryModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('Categories fetched'),
            { category_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};



export const getCategoryById = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const category = await categoryModel.findOne({ _id: new ObjectId(id), isDeleted: false });
        if (!category) return res.status(404).json(new apiResponse(404, "Category not found", {}, {}));
        return res.status(200).json(new apiResponse(200, "Category fetched", category, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

