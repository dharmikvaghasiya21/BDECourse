import { Request, Response } from "express";

export const downloadContact = async (req: Request, res: Response) => {
    const contactName = "duo fusion";
    const phoneNumber = "+91 9876543210";
    const email = "duofusion@gmail.com";

    const vCardData = `
            BEGIN:VCARD
            VERSION:3.0
            FN:${contactName}
            TEL;TYPE=CELL:${phoneNumber}
            EMAIL:${email}
            END:VCARD`.trim();

    res.setHeader("Content-Type", "text/vcard");
    res.setHeader("Content-Disposition", `attachment; filename=${contactName.replace(/ /g, "_")}.vcf`);
    res.send(vCardData);
};
