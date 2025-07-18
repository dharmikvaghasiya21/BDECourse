
import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { apiResponse } from "../../common";
import { responseMessage,sendEmail } from "../../helper";
import { adminModel } from "../../database/models";
import jwt from "jsonwebtoken";



const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const TOKEN_EXPIRE = "1d";

export const signUp = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    let existingUser = await adminModel.findOne({ email: body?.email, isDeleted: false });

    if (existingUser)
      return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail || "Email already exists", {}, {}));

    existingUser = await adminModel.findOne({ phoneNumber: body?.phoneNumber, isDeleted: false });
    if (existingUser)
      return res.status(409).json(new apiResponse(409, "Phone number already exists", {}, {}));

    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(body.password, salt);
    body.password = hashedPassword;

    const savedUser = await new adminModel(body).save();
    if (!savedUser)
      return res.status(500).json(new apiResponse(500, responseMessage?.errorMail || "Error saving user", {}, {}));

    return res.status(200).json(new apiResponse(200, "User registered successfully", savedUser, {}));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Internal server error", {}, error));
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await adminModel.findOne({ email, isDeleted: false }).lean();

    if (!user) {
      return res.status(400).json(new apiResponse(400, "Invalid email or password", {}, {}));
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(new apiResponse(400, "Invalid email or password", {}, {}));
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRE }
    );

    const responseData = {
      token,
      user: {
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role || "user"
      }
    };

    return res.status(200).json(
      new apiResponse(200, "Login successful", responseData, {})
    );
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json(
      new apiResponse(500, "Internal server error", {}, error)
    );
  }
};



export const forgot_password = async (req: Request, res: Response) => {
  let body = req.body,
    otpFlag = 1,
    otp = 0;

  try {
    body.isActive = true;
    const user = await adminModel.findOne({
      email: body.email,
      isDeleted: false
    });
    if (!user) {
      return res.status(400).json(new apiResponse(400, responseMessage?.invalidEmail || "Invalid email", {}, {}));
    }

    while (otpFlag === 1) {
      otp = Math.floor(100000 + Math.random() * 900000);
      const isUsed = await adminModel.findOne({ otp });
      if (!isUsed) otpFlag = 0;
    }
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await adminModel.findByIdAndUpdate(user._id, { otp, otpExpireTime });

    await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${otp}`);

    return res.status(200).json(new apiResponse(200, "OTP sent to email", {}, {}));
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Server error", {}, error));
  }
};


export const verify_otp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await adminModel.findOne({ email, isDeleted: false });
    if (!user || user.otp !== Number(otp)) {
      return res.status(400).json(new apiResponse(400, responseMessage?.invalidOTP, {}, {}));
    }

    if (user.otpExpireTime && user.otpExpireTime < new Date()) {
      return res.status(400).json(new apiResponse(400, responseMessage?.expireOTP, {}, {}));
    }

    return res.status(200).json(new apiResponse(200, responseMessage?.OTPverified, {}, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
  }
};



export const reset_password = async (req: Request, res: Response) => {
  try {
    const { email, otp, newpassword } = req.body;

    const user = await adminModel.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(400).json(new apiResponse(400, "Email not found", {}, {}));
    }

    if (user.otp !== Number(otp)) {
      return res.status(400).json(new apiResponse(400, "Invalid OTP", {}, {}));
    }

    if (user.otpExpireTime && user.otpExpireTime < new Date()) {
      return res.status(400).json(new apiResponse(400, "OTP has expired", {}, {}));
    }

    const hashedpassword = await bcryptjs.hash(newpassword, 10);

    await adminModel.findByIdAndUpdate(user._id, {
      password: hashedpassword,
      otp: null,
      otpExpireTime: null
    });

    return res.status(200).json(new apiResponse(200, "Password has been reset successfully", {}, {}));
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json(new apiResponse(500, "Server error", {}, error));
  }

};
