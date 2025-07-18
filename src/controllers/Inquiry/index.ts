import { Request, Response } from "express";
import { InquiriesModel } from "../../database";


export const addInquiry = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "Name, Email, and Message are required." });
        }

        const newInquiry = await InquiriesModel.create({ name, email, phone, message });

        return res.status(201).json({ success: true, message: "Inquiry submitted successfully", data: newInquiry });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error });
    }
};


export const getInquiryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const inquiry = await InquiriesModel.findOne({ _id: id });
        if (!inquiry) { return res.status(404).json({ success: false, message: "Inquiry not found", }); }

        return res.status(200).json({ success: true, message: "Inquiry fetched successfully", data: inquiry, });
    }
    catch (error) {
        return res.status(500).json({
            success: false, message: "Server Error", error,
        });
    }
};


export const getAllInquiries = async (_req: Request, res: Response) => {
    try {
        const inquiries = await InquiriesModel.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: inquiries });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error });
    }
};


export const deleteInquiry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const inquiry = await InquiriesModel.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });

        if (!inquiry) {
            return res.status(404).json({ success: false, message: "Inquiry not found or already deleted" });
        }
        return res.status(200).json({ success: true, message: "Inquiry soft deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error });
    }
};
