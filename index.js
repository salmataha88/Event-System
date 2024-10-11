import express from "express";
import { connectionDB } from "./DB/connection.js";
import {config} from "dotenv";
import path from "path";

import * as allRouter from './src/modules/index.routes.js';

config({ path: path.resolve('./config/config.env') });

const app = express();
const PORT = +process.env.PORT;

app.use(express.json());
connectionDB();

app.use('/user',  allRouter.userRouter);
app.use('/event' , allRouter.eventRouter);
app.use('/admin' , allRouter.adminRouter);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});