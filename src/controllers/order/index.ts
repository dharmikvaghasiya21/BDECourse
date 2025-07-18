import { Request, Response } from "express";
import { orderModel } from "../../database";
import { responseMessage } from "../../helper";
import { apiResponse } from "../../common";
import { ObjectId } from 'mongodb';



export const createOrder = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, address, paymentMethod, price } = req.body;

        if (!name || !email || !address || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }
        const newOrder = await orderModel.create({ name, email, phone, address, paymentMethod, price });
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess('Order successfully'), newOrder, {}));
    } catch (error) {
        return res.status(500).json({ success: false, message: responseMessage?.internalServerError, error });
    }
};


export const updateOrder = async (req, res) => {
    try {
        const updatedOrder = await orderModel.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json(
            new apiResponse(200, responseMessage.updateDataSuccess("Order updated"), updatedOrder, {})
        );
    } catch (error) {
        return res.status(500).json({ success: false, message: responseMessage?.internalServerError, error });
    }
};



export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const totalOrders = await orderModel.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        const orders = await orderModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.status(200).json({
            success: true, currentPage: page, totalPages, totalOrders, data: orders,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: responseMessage?.internalServerError, error });
    }
};


export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await orderModel.findOne({ _id: id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        return res.status(500).json({ success: false, message: responseMessage?.internalServerError, error });
    }
};


export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // const objectId = new ObjectId(id)
        const deletedOrder = await orderModel.findOneAndDelete({ _id: id });

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.status(200).json({ success: true, message: "Order deleted successfully", data: deletedOrder });
    } catch (error) {
        return res.status(500).json({
            success: false, message: responseMessage?.internalServerError, error
        });
    }
};

