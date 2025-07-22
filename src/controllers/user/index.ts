import { USER_ROLE, apiResponse } from '../../common';
import { userModel } from '../../database';
import { reqInfo, responseMessage } from '../../helper';
import bcrypt from 'bcryptjs';

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




