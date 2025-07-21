import { Request, Response } from "express";
import { courseModel } from "../../database";
import { apiResponse } from "../../common";
import { responseMessage } from "../../helper";
import mongoose from "mongoose";


export const addCourse = async (req: Request, res: Response) => {
    try {
        const { name, feature, categoryType, action } = req.body;
        const image = req.file?.filename;
        if (!image) return res.status(400).json(new apiResponse(400, "Image required", {}, null));

        const newCourse = await courseModel.create({
            name,
            feature,
            categoryType,
            action,
            image: `/uploads/${image}`
        });

        return res.status(201).json(new apiResponse(201, "Course created", newCourse, null));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const { page = "1", limit = "20", search = "" } = req.query as {
            page?: string; limit?: string; search?: string;
        };

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const query: any = { isDeleted: false };

        if (search) {
            query.name = { $regex: search, $options: "i" }; // case-insensitive search
        }

        const courses = await courseModel
            .find(query)
            .populate("categoryType")
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        const totalCourses = await courseModel.countDocuments(query);

        return res.status(200).json(
            new apiResponse(200, "Courses fetched", {
                total: totalCourses,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalCourses / limitNumber),
                courses,
            }, null)
        );
    } catch (error) {
        return res.status(500).json(
            new apiResponse(500, responseMessage.internalServerError, {}, error)
        );
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
