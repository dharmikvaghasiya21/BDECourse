import { Request, Response } from "express";
import { courseModel } from "../../database";
import { apiResponse } from "../../common";
import { countData, getData, reqInfo, responseMessage } from "../../helper";
import mongoose from "mongoose";

let ObjectId = require("mongoose").Types.ObjectId;

export const addCourse = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;

        const user = req.user || req.headers.user;
        body.userId = user._id;

        let isExist = await courseModel.findOne({ type: body.type, priority: body.priority, isDeleted: false });
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage.dataAlreadyExist('priority'), {}, {}));

        const Course = await new courseModel(body).save();
        return res.status(200).json(new apiResponse(200, "Course created", Course, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllCourses = async (req, res) => {
    reqInfo(req);
    try {
        let { type, search, page, limit, featureFilter, actionFilter, userId } = req.query,
            options: any = { lean: true },
            criteria: any = { isDeleted: false };

        if (type) criteria.type = type;
        if (featureFilter) criteria.feature = featureFilter;
        if (actionFilter) criteria.action = actionFilter;

        // 🟢 User wise lock filter logic
        if (userId) {
            // જો user select કર્યો હોય → એ user ના courses locked=true
            criteria.$or = [
                { userIds: new mongoose.Types.ObjectId(userId) }, // selected user courses
                { locked: true } // other locked courses
            ];
        }

        if (search) {
            criteria.name = { $regex: search, $options: "si" };
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        if (page && limit) {
            options.skip = (pageNum - 1) * limitNum;
            options.limit = limitNum;
            options.sort = { createdAt: -1 };
        }

        const response = await getData(courseModel, criteria, {}, options);
        const totalCount = await countData(courseModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(
            new apiResponse(
                200,
                responseMessage.getDataSuccess("courses fetched"),
                { course_data: response, totalData: totalCount, state: stateObj },
                {}
            )
        );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};



export const getCourseById = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const course = await courseModel.findOne({ _id: new ObjectId(id), isDeleted: false });
        if (!course) return res.status(404).json(new apiResponse(404, "Course not found", {}, {}));
        return res.status(200).json(new apiResponse(200, "Course fetched", course, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const editCourse = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.body;
        const body = req.body;

        let isExist = await courseModel.findOne({ type: body.type, priority: body.priority, isDeleted: false, _id: { $ne: new ObjectId(body.id) } });
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage.dataAlreadyExist('priority'), {}, {}));

        const updated = await courseModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, body, { new: true });
        if (!updated) { return res.status(404).json(new apiResponse(404, "Course not found", {}, {})); }
        return res.status(200).json(new apiResponse(200, "Course updated", updated, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const deleteCourse = async (req, res) => {
    reqInfo(req);
    try {
        const deleted = await courseModel.findOneAndUpdate({ _id: req.params.id }, { isDeleted: true });
        if (!deleted) return res.status(404).json(new apiResponse(404, "Course not found", {}, {}));
        return res.status(200).json(new apiResponse(200, "Course deleted (soft delete)", deleted, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
