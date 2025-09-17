import { IdentityStore } from 'aws-sdk';
import { ADMIN_ROLES, USER_ROLE, apiResponse } from '../../common';
import { chatModel, courseModel, userModel } from '../../database';
import { countData, findAllWithPopulate, getData, reqInfo, responseMessage } from '../../helper';
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

        req.body.confirmPassword = req.body.password;
        const saltRounds = 10;
        body.password = await bcrypt.hash(body.password, saltRounds);

        // Ensure confirmPassword matches password

        body.role = USER_ROLE.USER;

        const user = await new userModel(body).save();
        if (!user)
            return res.status(500).json(new apiResponse(500, responseMessage.addDataError, {}, {}));


        if (body.courseIds && body.courseIds.length > 0) {
            await courseModel.updateMany(
                { _id: { $in: body.courseIds } },
                { $push: { userIds: user._id } }
            );
        }

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("user"), user, {}));
    } catch (error) {
        console.error("Add User Error:", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const edit_user_by_id = async (req, res) => {
    reqInfo(req);
    console.log("Editing user with body:", req.body);

    try {
        const { id, email, phoneNumber, password } = req.body;

        const user = await userModel.findOne({ _id: new ObjectId(id), isDeleted: false });
        if (!user)
            return res.status(404).json(new apiResponse(404, "User not found", {}, {}));

        const role = await userModel.findOne({ name: ADMIN_ROLES.USER, isDeleted: false });
        const roleId = new ObjectId(role?._id);

        const emailExist = await userModel.findOne({
            email,
            roleId,
            isDeleted: false,
            _id: { $ne: user._id }
        });
        if (emailExist) return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("email"), {}, {}));

        const phoneExist = await userModel.findOne({
            phoneNumber,
            roleId,
            isDeleted: false,
            _id: { $ne: user._id }
        });
        if (phoneExist)
            return res.status(409).json(new apiResponse(409, responseMessage.dataAlreadyExist("phoneNumber"), {}, {}));

        req.body.roleId = roleId;
        if (password) {
            const saltRounds = 10;
            req.body.confirmPassword = password;
            req.body.password = await bcrypt.hash(password, saltRounds);
        }
        req.body.confirmPassword = req.body.confirmPassword;

        const updatedUser = await userModel.findOneAndUpdate(
            { _id: new ObjectId(id) },
            req.body,
            { new: true }
        );

        if (!updatedUser)
            return res.status(404).json(new apiResponse(404, responseMessage.addDataError, {}, {}));

        return res.status(200).json(new apiResponse(200, responseMessage.updateDataSuccess("user"), updatedUser, {}));
    } catch (error) {
        console.error("Edit User Error:", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
};


export const get_all_users = async (req, res) => {
    reqInfo(req);
    let { page, limit, search, blockFilter, role } = req.query;
    let criteria: any = { isDeleted: false };
    let options: any = { lean: true, sort: { createdAt: -1 } };
    let loggedInUser: any = req.headers?.user;

    try {

        let isBlocked = blockFilter === "block" ? true : false
        if (blockFilter) criteria.isBlocked = isBlocked;

        if (role === 'user') {
            criteria.role = USER_ROLE.USER;
        } else {
            criteria.role = { $in: [USER_ROLE.ADMIN, USER_ROLE.USER] };
        }

        if (search) {
            criteria.$or = [
                { firstName: { $regex: search, $options: 'si' } },
                { lastName: { $regex: search, $options: 'si' } },
                { email: { $regex: search, $options: 'si' } },
                { phoneNumber: { $regex: search, $options: 'si' } },
            ];
        }

        if (page && limit) {
            options.skip = (parseInt(page) - 1) * parseInt(limit);
            options.limit = parseInt(limit);
        }

        const User = await findAllWithPopulate(
            userModel,
            criteria,
            {},
            options,
            { path: "courseIds", select: "name image priority feature action locked" }
        ); const totalCount = await userModel.countDocuments(criteria);

        const usersWithUnread = await Promise.all(User.map(async user => {
            const unreadCount = await chatModel.countDocuments({
                senderId: user._id,
                receiverId: loggedInUser?._id,
                seen: false,
                isDeleted: false
            });
            return { ...user, unreadCount };
        }));

        const stateObj = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || totalCount,
            page_limit: Math.ceil(totalCount / (parseInt(limit) || totalCount)) || 1,
        };

        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess('User'), {
            user_data: usersWithUnread,
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

        const user = await userModel.findOne({ _id: new ObjectId(id), isDeleted: false })
        .populate('courseIds', 'name image priority feature action locked');
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
