import { IdentityStore } from 'aws-sdk';
import { ADMIN_ROLES, USER_ROLE, apiResponse } from '../../common';
import { userModel } from '../../database';
import { countData, getData, reqInfo, responseMessage } from '../../helper';
import bcrypt from 'bcryptjs';

let ObjectId = require("mongoose").Types.ObjectId;


export const add_user = async (req, res) => {
    reqInfo(req);
    try {
        const body = req.body;
        const existingEmail = await userModel.findOne({ email: body.email, isDeleted: false });

        if (existingEmail)
            return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("email"), {}, {}));
        const existingPhone = await userModel.findOne({ phoneNumber: body.phoneNumber, isDeleted: false });

        if (existingPhone)
            return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("phoneNumber"), {}, {}));
        const hashedPassword = await bcrypt.hash(body.password, 10);

        if (body.password !== body.confirmPassword) {
            return res.status(400).json(new apiResponse(400, "Password and confirm password do not match", {}, {}));
        }

        body.password = hashedPassword;
        body.role = USER_ROLE.USER;

        const user = await new userModel(body).save();
        if (!user)
            return res.status(500).json(new apiResponse(500, responseMessage.addDataError, {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("user"), user, {}));
    } catch (error) {
        console.error("Add User Error:", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
export const edit_user_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { userId, email, phoneNumber, password, confirmPassword } = req.body;
        const oldPassword = req.body.oldPassword || req.body.oldpassword;

        const user = await userModel.findOne({ _id: new ObjectId(userId), isDeleted: false });
        if (!user) return res.status(404).json(new apiResponse(404, "User not found", {}, {}));
        if (!oldPassword) return res.status(400).json(new apiResponse(400, "Old password is required", {}, {}));
        if (!await bcrypt.compare(oldPassword, user.password))
            return res.status(401).json(new apiResponse(401, "Old password is incorrect", {}, {}));

        const role = await userModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false });
        const roleId = new ObjectId(role?._id);

        const emailExist = await userModel.findOne({ email, roleId, isDeleted: false, _id: { $ne: user._id } });
        if (emailExist) return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("email"), {}, {}));

        const phoneExist = await userModel.findOne({ phoneNumber, roleId, isDeleted: false, _id: { $ne: user._id } });
        if (phoneExist) return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("phoneNumber"), {}, {}));

        if (password || confirmPassword) {
            if (password !== confirmPassword)
                return res.status(400).json(new apiResponse(400, "Password and confirm password do not match", {}, {}));
            req.body.password = await bcrypt.hash(password, 10);
        }

        req.body.roleId = roleId;

        const updatedUser = await userModel.findOneAndUpdate({ _id: user._id }, req.body, { new: true });
        if (!updatedUser) return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("user"), updatedUser, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
    }
};


export const get_all_users = async (req, res) => {
    reqInfo(req);
    let { page, limit, search } = req.query, criteria: any = {}, options: any = { lean: true }, { user } = req.headers;

    try {
        if (user?.roleId?.name === ADMIN_ROLES.USER) {
            criteria._id = new ObjectId(user?._id);
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

        const role = await userModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false }).lean();
        if (role?._id) {
            criteria.roleId = new ObjectId(role._id);
        }

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const response = await getData(userModel, criteria, {}, options);
        const totalCount = await countData(userModel, criteria);

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
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
    }
};


export const get_user_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json(new apiResponse(400, "User ID required", {}, {}));

        const user = await userModel.findOne({ _id: new ObjectId(id), isDeleted: false }).lean();
        if (!user) return res.status(404).json(new apiResponse(404, "User not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "User fetched successfully", user, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const delete_user_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json(new apiResponse(400, "User ID required", {}, {}));

        const user = await userModel.findOneAndUpdate(
            { _id: new ObjectId(id), isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!user) return res.status(404).json(new apiResponse(404, "User not found", {}, {}));

        return res.status(200).json(new apiResponse(200, "User deleted successfully", user, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};
