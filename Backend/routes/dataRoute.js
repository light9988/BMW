import express from "express";
import { uploadData } from "../controller/data.js";

const dataRoute = express.Router();

dataRoute.post('/upload', uploadData);

export default dataRoute;