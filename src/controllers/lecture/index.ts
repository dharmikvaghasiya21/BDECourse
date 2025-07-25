import { apiResponse } from "../../common";
import { lectureModel } from "../../database";
import { countData, getData, reqInfo, responseMessage } from "../../helper";

let ObjectId = require("mongoose").Types.ObjectId;

export const addLecture = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;
        
        const user = req.user || req.headers.user;
        body.userId = user._id;

        const lecture = await new lectureModel(body).save();
        return res.status(200).json(new apiResponse(200, "Lecture created", lecture, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const editLecture = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.body;
        const body = req.body;
        const updated = await lectureModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, body, { new: true });

        if (!updated) return res.status(404).json(new apiResponse(404, "Lecture not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "Lecture updated", updated, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const deleteLecture = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const deleted = await lectureModel.findOneAndUpdate({ _id: new ObjectId(id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!deleted) return res.status(404).json(new apiResponse(404, "Lecture not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "Lecture deleted (soft)", {}, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const getAllLectures = async (req, res) => {
    reqInfo(req);
    try {
        let { type, search, page, limit } = req.query, options: any = { lean: true }, criteria: any = { isDeleted: false };
        if (type) criteria.type = type;
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
        const response = await getData(lectureModel, criteria, {}, options);
        const totalCount = await countData(lectureModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('lectures fetched'),
            { lecture_data: response, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const getLectureById = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const lecture = await lectureModel.findOne({ _id: new ObjectId(id), isDeleted: false });
        if (!lecture) return res.status(404).json(new apiResponse(404, "Lecture not found", {}, {}));
        return res.status(200).json(new apiResponse(200, "Lecture fetched", lecture, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

