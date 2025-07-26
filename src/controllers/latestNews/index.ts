import { apiResponse } from '../../common';
import { latestNewsModel } from '../../database/models/latestNews';
import { reqInfo, responseMessage, countData } from '../../helper';

let ObjectId = require("mongoose").Types.ObjectId;

export const addLatestNews = async (req, res) => {
    reqInfo(req)
    let body = req.body;
    try {
        let isExist = await latestNewsModel.findOne({ type: body.type, priority: body.priority, isDeleted: false });
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage.dataAlreadyExist('priority'), {}, {}));
        const latestNews = await new latestNewsModel(req.body).save();
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('latestNews'), latestNews, {}));
    } catch (error) {
        console.log(error);
        return res.status(400).json(new apiResponse(400, responseMessage.internalServerError, {}, error));
    }
};

export const updateLatestNews = async (req, res) => {
    reqInfo(req)
    let body = req.body
    try {
        let isExist = await latestNewsModel.findOne({ type: body.type, priority: body.priority, isDeleted: false, _id: { $ne: new ObjectId(body.id) } });
        if (isExist) return res.status(400).json(new apiResponse(400, responseMessage.dataAlreadyExist('priority'), {}, {}));
        const latestNews = await latestNewsModel.findOneAndUpdate({ _id: new ObjectId(body.id) }, body, { new: true })
        if (!latestNews) return res.status(404).json(new apiResponse(404, responseMessage.updateDataError('latestNews'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess('latestNews'), latestNews, {}));
    } catch (error) {
        console.log(error);
        return res.status(400).json(new apiResponse(400, responseMessage.internalServerError, {}, error));
    }
};

export const deleteLatestNews = async (req, res) => {
    reqInfo(req)
    try {
        const latestNews = await latestNewsModel.findOneAndUpdate({ _id: new ObjectId(req.params.id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!latestNews) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('latestNews'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.deleteDataSuccess('latestNews'), latestNews, {}));
    } catch (error) {
        console.log(error);
        return res.status(400).json(new apiResponse(400, responseMessage.internalServerError, {}, error));
    }
};

export const listLatestNews = async (req, res) => {
    reqInfo(req)
    try {
        const { search, page, limit } = req.query;
        const criteria: any = { isDeleted: false };

        if (search) {
            const regex = { $regex: search, $options: 'si' };
            criteria.$or = [
                { title: regex },
                { subtitle: regex }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const options = {
            skip: (pageNum - 1) * limitNum,
            limit: limitNum,
            sort: { createdAt: -1 }
        };

        const latestNews = await latestNewsModel.find(criteria, null, options);
        const totalCount = await countData(latestNewsModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('latestNews'), { latestNews_data: latestNews, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const listUserLatestNews = async (req, res) => {
    reqInfo(req)
    try {
        const { search, page, limit } = req.query;
        const criteria: any = { isDeleted: false };

        if (search) {
            const regex = { $regex: search, $options: 'si' };
            criteria.$or = [
                { title: regex },
                { subtitle: regex }
            ];
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const options = {
            skip: (pageNum - 1) * limitNum,
            limit: limitNum,
            sort: { createdAt: -1 }
        };

        const latestNews = await latestNewsModel.find(criteria, null, options);
        const totalCount = await countData(latestNewsModel, criteria);

        const stateObj = {
            page: pageNum,
            limit: limitNum,
            page_limit: Math.ceil(totalCount / limitNum) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('latestNews'), { latestNews_data: latestNews, totalData: totalCount, state: stateObj }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const getLatestNews = async (req, res) => {
    reqInfo(req)
    try {
        const latestNews = await latestNewsModel.findOne({ _id: new ObjectId(req.params.id), isDeleted: false });
        if (!latestNews) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound('latestNews'), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('latestNews'), latestNews, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};