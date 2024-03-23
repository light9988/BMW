import request from "supertest";
import express from "express";
import healthzRoute from "../routes/healthzRoute.js";

const app = express();
app.use(healthzRoute);

test('/healthz endpoint should return 200', async () => {
    const response = await request(app).get('/healthz');
    expect(response.statusCode).toBe(200);
});
