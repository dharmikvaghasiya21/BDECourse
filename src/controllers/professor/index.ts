import { apiResponse } from '../../common';
import { ProfessorModel } from '../../database';
import { countData, getData, reqInfo, responseMessage } from '../../helper';
import bcrypt from 'bcryptjs';

let ObjectId = require("mongoose").Types.ObjectId;

export const add_professor = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;
        const existingEmail = await ProfessorModel.findOne({ email: body.email, isDeleted: false });
        if (existingEmail)
            return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("email"), {}, {}));

        const existingPhone = await ProfessorModel.findOne({ phoneNumber: body.phoneNumber, isDeleted: false });
        if (existingPhone)
            return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("phoneNumber"), {}, {}));
        req.body.confirmPassword = req.body.password;
        const saltRounds = 10;
        body.password = await bcrypt.hash(body.password, saltRounds);

        const professor = await new ProfessorModel(body).save();
        if (!professor)
            return res.status(500).json(new apiResponse(500, responseMessage.addDataError, {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("professor"), professor, {}));
    } catch (error) {
        console.error("Add professor Error:", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};




export const edit_professor_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { professorId, email, phoneNumber, password } = req.body;

        const professor = await ProfessorModel.findOne({ _id: new ObjectId(professorId), isDeleted: false });
        if (!professor)
            return res.status(404).json(new apiResponse(404, "professor not found", {}, {}));


        const emailExist = await ProfessorModel.findOne({
            email, isDeleted: false, _id: { $ne: professor._id }
        });
        if (emailExist) return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("email"), {}, {}));

        const phoneExist = await ProfessorModel.findOne({ phoneNumber, isDeleted: false, _id: { $ne: professor._id } });
        if (phoneExist)
            return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("phoneNumber"), {}, {}));

        if (password) {
            const saltRounds = 10;
            req.body.confirmPassword = password;
            req.body.password = await bcrypt.hash(password, saltRounds);
        }
        req.body.confirmPassword = req.body.confirmPassword;

        const updatedprofessor = await ProfessorModel.findOneAndUpdate(
            { _id: new ObjectId(professorId) }, req.body, { new: true }
        );

        if (!updatedprofessor)
            return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("professor"), updatedprofessor, {}));
    } catch (error) {
        console.error("Edit professor Error:", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const get_all_professors = async (req, res) => {
    reqInfo(req)
    let { page, limit, search } = req.query, criteria: any = { isDeleted: false };
    let options: any = { lean: true };

    try {
        if (search) {
            criteria.$or = [
                { question: { $regex: search, $options: 'si' } },
                { answer: { $regex: search, $options: 'si' } }
            ];
        }
        options.sort = { priority: 1 };

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(ProfessorModel, criteria, {}, options);
        const totalCount = await countData(ProfessorModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('professors'), {
            professor_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};



export const get_professor_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        const professor = await ProfessorModel.findOne({ _id: new ObjectId(id), isDeleted: false })
        if (!professor) return res.status(404).json(new apiResponse(404, "professor not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "professor fetched successfully", professor, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};

export const delete_professor_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json(new apiResponse(400, "professor ID required", {}, {}));

        const professor = await ProfessorModel.findOneAndUpdate(
            { _id: new ObjectId(id), isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!professor) return res.status(404).json(new apiResponse(404, "professor not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "professor deleted successfully", professor, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
