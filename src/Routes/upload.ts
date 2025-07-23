import { Router } from 'express';
import { reqInfo, responseMessage } from '../helper';
import { config } from '../../config';
import { apiResponse } from '../common';
import fs from 'fs';
import path from 'path';
import url from 'url';
// import { uploadPdf } from '..';


const router = Router();
router.post('', async (req: any, res: any) => {
    reqInfo(req);
    try {
        if (!req.files || (!req.files.image && !req.files.pdf)) {
            return res.status(400).json({ message: "No file uploaded or invalid file type." });
        }

        let fileUrl;
        if (req.files.image) {
            const file = req.files.image[0]; // First image file
            fileUrl = config.BACKEND_URL + `/uploads/${file.filename}`;
        } else if (req.files.pdf) {
            const file = req.files.pdf[0]; // First PDF file
            const pdfDir = path.join(__dirname, '../../../pdf')

            if (!fs.existsSync(pdfDir)) {
                fs.mkdirSync(pdfDir, { recursive: true });
            }

            const filePath = path.join(pdfDir, file.filename);
            fs.renameSync(file.path, filePath);

            fileUrl = config.BACKEND_URL + `/pdf/${file.filename}`;
        }

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("File"), fileUrl, {}));
    } catch (error) {
        console.log("error =>", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
    }
});

router.delete("/", (req: any, res: any) => {
    reqInfo(req)
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json(new apiResponse(400, "Image URL is required", {}, {}));

        const parsedUrl = url.parse(imageUrl);
        const filename = path.basename(parsedUrl.pathname || "");

        if (!filename) return res.status(400).json(new apiResponse(400, "Invalid image URL", {}, {}));

        const imagePath = path.join(process.cwd(), "uploads", filename);

        if (!fs.existsSync(imagePath)) return res.status(404).json(new apiResponse(404, "Image not found", {}, {}));
        fs.unlinkSync(imagePath);

        return res.status(200).json(new apiResponse(200, "Image deleted successfully", {}, {}));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
});

// router.post("/upload-pdf", (req, res) => {
//     reqInfo(req);
//     try {
//         const file = req.file;
//         console.log("file => ",file)
//         if (!file) {
//             return res.status(400).json(new apiResponse(400, "PDF file is missing", {}, {}));
//         }

//         const pdfUrl = config.BACKEND_URL + `/pdf/${file.filename}`;
//         return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("PDF"), pdfUrl, {}));
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
//     }
// });

// router.delete("/delete-pdf", (req: any, res: any) => {
//     reqInfo(req)
//     try {
//         const { pdfUrl } = req.body;
//         if (!pdfUrl) return res.status(400).json(new apiResponse(400, "PDF URL is required", {}, {}));

//         const parsedUrl = url.parse(pdfUrl);
//         const filename = path.basename(parsedUrl.pathname || "");

//         if (!filename) return res.status(400).json(new apiResponse(400, "Invalid PDF URL", {}, {}));

//         const pdfPath = path.join(process.cwd(), "uploads", "pdf", filename);

//         if (!fs.existsSync(pdfPath)) return res.status(404).json(new apiResponse(404, "PDF not found", {}, {}));
//         fs.unlinkSync(pdfPath);

//         return res.status(200).json(new apiResponse(200, "PDF deleted successfully", {}, {}));
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
//     }
// });



export const uploadRoutes = router