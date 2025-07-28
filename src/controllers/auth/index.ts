
import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { ADMIN_ROLES, apiResponse } from "../../common";
import { reqInfo, responseMessage, sendEmail } from "../../helper";
import { userModel } from "../../database/models";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_TOKEN_SECRET;

// const TOKEN_EXPIRE = "1d";
import bcrypt from 'bcrypt';

export const signUp = async (req, res) => {
  reqInfo(req)
  try {
    const body = req.body;
    if (body.password !== body.confirmPassword) {
      return res.status(400).json(new apiResponse(400, "Passwords do not match", {}, {}));
    }
    let existingUser = await userModel.findOne({ email: body?.email, isDeleted: false });
    if (existingUser)
      return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail || "Email already exists", {}, {}));

    existingUser = await userModel.findOne({ phoneNumber: body?.phoneNumber, isDeleted: false });
    if (existingUser)
      return res.status(409).json(new apiResponse(409, "Phone number already exists", {}, {}));

    if (!body.password || !body.confirmPassword) {
      return res.status(400).json(new apiResponse(400, "Password and confirm password are required", {}, {}));
    }
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);
    delete body.confirmPassword;

    body.userType = ADMIN_ROLES.ADMIN;

    const savedUser = await new userModel(body).save();
    if (!savedUser)
      return res.status(500).json(new apiResponse(500, responseMessage?.errorMail || "Error saving user", {}, {}));

    return res.status(200).json(new apiResponse(200, "User registered successfully", savedUser, {}));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Internal server error", {}, error));
  }
};

export const login = async (req, res) => {
  reqInfo(req);
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(400).json(new apiResponse(400, "Invalid email", {}, {}));
    }

    if (user.isBlocked) {
      return res.status(403).json(new apiResponse(403, 'Your account is blocked', {}, {}));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
  reqInfo(req);
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json(new apiResponse(400, "Passwords do not match", {}, {}));
    }

    const user = await userModel.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(404).json(new apiResponse(404, "User not found", {}, {}));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    return res.status(200).json(new apiResponse(200, "Password reset successfully", {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    }, {}));

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json(new apiResponse(500, "Internal server error", {}, error));
  }
};




export const change_password = async (req, res) => {
  reqInfo(req);
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();

    return res.status(200).json(new apiResponse(200, "Password changed successfully.", {}, {}));
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError || "Internal Server Error", {}, error));
  }
};
