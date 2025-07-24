import { IdentityStore } from 'aws-sdk';
import { ADMIN_ROLES, USER_ROLE, apiResponse } from '../../common';
import { studentsModel } from '../../database';
import { countData, getData, reqInfo, responseMessage } from '../../helper';
import bcrypt from 'bcryptjs';

let ObjectId = require("mongoose").Types.ObjectId;


export const add_students = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;
        const existingEmail = await studentsModel.findOne({ email: body.email, isDeleted: false });

        if (existingEmail)
            return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("email"), {}, {}));
        const existingPhone = await studentsModel.findOne({ phoneNumber: body.phoneNumber, isDeleted: false });

        if (existingPhone)
            return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("phoneNumber"), {}, {}));
        const hashedPassword = await bcrypt.hash(body.password, 10);

        if (body.password !== body.confirmPassword) {
            return res.status(400).json(new apiResponse(400, "Password and confirm password do not match", {}, {}));
        }

        body.password = hashedPassword;
        body.role = USER_ROLE.USER;

        const students = await new studentsModel(body).save();
        if (!students)
            return res.status(500).json(new apiResponse(500, responseMessage.addDataError, {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("students"), students, {}));
    } catch (error) {
        console.error("Add students Error:", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
export const edit_students_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { studentsId, email, phoneNumber, password, confirmPassword } = req.body;
        const oldPassword = req.body.oldPassword || req.body.oldpassword;

        const students = await studentsModel.findOne({ _id: new ObjectId(studentsId), isDeleted: false });
        if (!students) return res.status(404).json(new apiResponse(404, "students not found", {}, {}));
        if (!oldPassword) return res.status(400).json(new apiResponse(400, "Old password is required", {}, {}));
        if (!await bcrypt.compare(oldPassword, students.password))
            return res.status(401).json(new apiResponse(401, "Old password is incorrect", {}, {}));

        const role = await studentsModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false });
        const roleId = new ObjectId(role?._id);

        const emailExist = await studentsModel.findOne({ email, roleId, isDeleted: false, _id: { $ne: students._id } });
        if (emailExist) return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("email"), {}, {}));

        const phoneExist = await studentsModel.findOne({ phoneNumber, roleId, isDeleted: false, _id: { $ne: students._id } });
        if (phoneExist) return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("phoneNumber"), {}, {}));

        if (password || confirmPassword) {
            if (password !== confirmPassword)
                return res.status(400).json(new apiResponse(400, "Password and confirm password do not match", {}, {}));
            req.body.password = await bcrypt.hash(password, 10);
        }

        req.body.roleId = roleId;

        const updatedstudents = await studentsModel.findOneAndUpdate({ _id: students._id }, req.body, { new: true });
        if (!updatedstudents) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("students"), updatedstudents, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
    }
};


export const get_all_students = async (req, res) => {
    reqInfo(req);
    let { page, limit, search } = req.query, criteria: any = {}, options: any = { lean: true }, { students } = req.headers;

    try {
        if (students?.roleId?.name === ADMIN_ROLES.USER) {
            criteria._id = new ObjectId(students?._id);
        }

        if (search) {
            criteria.$or = [
                { firstName: { $regex: search, $options: 'si' } },
                { lastName: { $regex: search, $options: 'si' } },
                { email: { $regex: search, $options: 'si' } },
                { phoneNumber: { $regex: search, $options: 'si' } }
            ];
        }

        criteria.isDeleted = false;
        options.sort = { createdAt: -1 };

        const role = await studentsModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false }).lean();
        if (role?._id) {
            criteria.roleId = new ObjectId(role._id);
        }

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(studentsModel, criteria, {}, options);
        const totalCount = await countData(studentsModel, criteria);

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('students'), {
            students_data: response,
            totalData: totalCount,
            state: stateObj
        }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
    }
};


export const get_students_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json(new apiResponse(400, "students ID required", {}, {}));

        const students = await studentsModel.findOne({ _id: new ObjectId(id), isDeleted: false }).lean();
        if (!students) return res.status(404).json(new apiResponse(404, "students not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "students fetched successfully", students, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const delete_students_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json(new apiResponse(400, "students ID required", {}, {}));

        const students = await studentsModel.findOneAndUpdate(
            { _id: new ObjectId(id), isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!students) return res.status(404).json(new apiResponse(404, "students not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "students deleted successfully", students, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
