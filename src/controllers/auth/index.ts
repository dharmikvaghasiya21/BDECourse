
import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { ADMIN_ROLES, apiResponse } from "../../common";
import { reqInfo, responseMessage, sendEmail } from "../../helper";
import { userModel } from "../../database/models";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_TOKEN_SECRET;

// const TOKEN_EXPIRE = "1d";

export const signUp = async (req: Request, res: Response) => {
  reqInfo(req)
  try {
    const body = req.body;
    let existingUser = await userModel.findOne({ email: body?.email, isDeleted: false });

    if (existingUser)
      return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail || "Email already exists", {}, {}));

    existingUser = await userModel.findOne({ phoneNumber: body?.phoneNumber, isDeleted: false });
    if (existingUser)
      return res.status(409).json(new apiResponse(409, "Phone number already exists", {}, {}));

    body.userType = ADMIN_ROLES.ADMIN

    const savedUser = await new userModel(body).save();
    if (!savedUser)
      return res.status(500).json(new apiResponse(500, responseMessage?.errorMail || "Error saving user", {}, {}));

    return res.status(200).json(new apiResponse(200, "User registered successfully", savedUser, {}));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Internal server error", {}, error));
  }
};


export const login = async (req: Request, res: Response) => {
  reqInfo(req)
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email, isDeleted: false }).lean();
    if (!user) {
      return res.status(400).json(new apiResponse(400, "Invalid email", {}, {}));
    }
    console.log("user===", user)

    const isMatch = await bcryptjs.compare(user.password, password);
    console.log("isMatch===", password)
    console.log("isMatc", user.password)
    if (!isMatch) {
      return res.status(400).json(new apiResponse(400, "Invalid password", {}, {}));
    }
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role

      },
      JWT_SECRET,
      {}
    );

    const responseData = {
      token,
      user: {
        _id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role || "user"
      }
    };
    console.log("responce===", responseData)
    return res.status(200).json(new apiResponse(200, "Login successful", responseData, {}));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Internal server error", {}, error));
  }
};



export const forgot_password = async (req, res) => {
  let body = req.body,
    otpFlag = 1,
    otp = 0;
  reqInfo(req)
  try {
    body.isActive = true;
    const user = await userModel.findOne({
      email: body.email,
      isDeleted: false
    });

    if (!user) {
      return res.status(400).json(new apiResponse(400, responseMessage?.invalidEmail || "Invalid email", {}, {}));
    }

    while (otpFlag === 1) {
      otp = Math.floor(100000 + Math.random() * 900000);
      const isUsed = await userModel.findOne({ otp });
      if (!isUsed) otpFlag = 0;
    }

    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await userModel.findOneAndUpdate(user._id, { otp, otpExpireTime });

    await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${otp}`);

    return res.status(200).json(new apiResponse(200, "OTP sent to email", {}, {}));
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Server error", {}, error));
  }
};


export const verify_otp = async (req, res) => {
  reqInfo(req)
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email, isDeleted: false });
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

export const reset_password = async (req, res) => {
  reqInfo(req)
  try {
    const { email, newPassword } = req.body;

    const user = await userModel.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(400).json(new apiResponse(400, "Email not found", {}, {}));
    }

    if (user.otpExpireTime && user.otpExpireTime < new Date()) {
      return res.status(400).json(new apiResponse(400, "OTP has expired", {}, {}));
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      confirmPassword: newPassword,
      otp: null,
      otpExpireTime: null
    });

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const userData = {
      _id: user._id,
      email: user.email,
      role: user.role
    };

    return res.status(200).json(
      new apiResponse(200, "Password has been reset successfully", { token, user: userData }, {})
    );

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json(
      new apiResponse(500, responseMessage?.internalServerError || "Internal Server Error", {}, error)
    );
  }
};

export const change_password = async (req, res) => {
  reqInfo(req)
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found." });
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect." });
    }

    // user.confirmPassword = confirmPassword;
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json(new apiResponse(200, "password changed successfully.", {}, {}));
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "internal Server Error", {}, error));
  }
};