import express from "express";
import { uploadData } from "../controller/data.js";
import multer from "multer";
import path from 'path';

const port = 8000;
const dataRoute = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});
  
  const upload = multer({ storage: storage });
  
  dataRoute.post('/upload', upload.single('file'), uploadData);

export default dataRoute;