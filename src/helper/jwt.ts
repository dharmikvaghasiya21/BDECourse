import jwt from 'jsonwebtoken'
import { apiResponse } from '../common'
import { Request, Response } from 'express'
import { config } from '../../config'
import { userModel } from '../database'
import { responseMessage } from './responce'

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.JWT_TOKEN_SECRET;

export const adminJWT = async (req, res, next) => {
    let { authorization } = req.headers,
        result: any
    if (authorization) {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            result = await userModel.findOne({ _id: new ObjectId(isVerifyToken._id), isDeleted: false }).lean()

            if (result?.isBlocked == true) return res.status(410).json(new apiResponse(410, responseMessage?.accountBlock, {}, {}));
            if (result?.isDeleted == false) {
                req.headers.user = result
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, responseMessage?.invalidToken, {}, {}))
            }
        } catch (err) {
            console.log(err)
            if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, responseMessage?.differentToken, {}, {}))
            return res.status(401).json(new apiResponse(401, responseMessage.invalidToken, {}, {}))
        }
    } else {
        return res.status(401).json(new apiResponse(401, responseMessage?.tokenNotFound, {}, {}))
    }
}

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json(new apiResponse(401, "Access denied. No token provided.", {}, {}));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user || user.isDeleted) {
            return res.status(401).json(new apiResponse(401, "Invalid token.", {}, {}));
        }

        if (user.isBlocked) {
            return res.status(403).json(new apiResponse(403, "Your account has been blocked.", {}, {}));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json(new apiResponse(500, "Something went wrong", {}, {}));
    }
};