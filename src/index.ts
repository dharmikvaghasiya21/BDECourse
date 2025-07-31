import * as bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import cors from 'cors'
import { mongooseConnection } from './database'
import * as packageInfo from '../package.json'
import { router } from './Routes'
import path from "path"
import multer from "multer"
import fs from 'fs';
import { initializeSocket } from './helper/socket';
const app = express();



app.use("/pdf", express.static(path.join(__dirname, "..", "..", "pdf")));
app.use("/uploads", express.static(path.join(__dirname, "..", "..", "uploads")));

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}_${sanitizedOriginalName}`);
  },
});

app.use(cors())
app.use(mongooseConnection)
app.use(bodyParser.json({ limit: '200mb' }))
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
app.use(express.static(path.join(__dirname, "public")));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).fields([{ name: "image", maxCount: 1 }, { name: "pdf", maxCount: 1 }]));

const health = (req, res) => {
  return res.status(200).json({
    message: `landing Server is Running, Server health is green`,
    app: packageInfo.name,
    version: packageInfo.version,
    description: packageInfo.description
  })
}

const bad_gateway = (req, res) => { return res.status(502).json({ status: 502, message: "landing Backend API Bad Gateway" }) }
app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => {
  res.send('Server is running ');
});
app.use(router)

app.use('*', bad_gateway);

const server = new http.Server(app);
initializeSocket(server);

export default server;
