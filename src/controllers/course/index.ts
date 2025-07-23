import { Request, Response } from "express";
import { courseModel } from "../../database";
import { apiResponse } from "../../common";
import { countData, getData, reqInfo, responseMessage } from "../../helper";
import mongoose from "mongoose";

export const addCourse = async (req, res) => {
    try {
        const body = req.body;
        
        const user = req.user || req.headers.user;
        body.userId = user._id;
        const Course = await new courseModel(body).save();
        return res.status(201).json(new apiResponse(201, "Course created", Course, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const getAllCourses = async (req, res) => {
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
        const response = await getData(courseModel, criteria, {}, options);
        const totalCount = await countData(courseModel, criteria);

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


export const getCourseById = async (req: Request, res: Response) => {
    try {
        const course = await courseModel.findOne({ _id: req.params.id, isDeleted: false }).populate("categoryType");
        if (!course) return res.status(404).json(new apiResponse(404, "Course not found", null, null));
        return res.status(200).json(new apiResponse(200, "Course fetched", course, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const editCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) { return res.status(400).json(new apiResponse(400, "Invalid course ID", null, null)); }

        const { name, feature, categoryType, action } = req.body;
        const updateData: any = { name, feature, categorytype: categoryType, action, };

        if (req.file) { updateData.image = `/uploads/${req.file.filename}`; }
        const updated = await courseModel.findOneAndUpdate({ _id: id }, updateData, { new: true });

        if (!updated) { return res.status(404).json(new apiResponse(404, "Course not found", null, null)); }

        return res.status(200).json(new apiResponse(200, "Course updated", updated, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const deleted = await courseModel.findOneAndUpdate({ _id: req.params.id }, { isDeleted: true });
        if (!deleted) return res.status(404).json(new apiResponse(404, "Course not found", null, null));
        return res.status(200).json(new apiResponse(200, "Course deleted", null, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
