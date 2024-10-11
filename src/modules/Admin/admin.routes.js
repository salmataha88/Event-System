import { Router } from "express";
import * as Controller from "./admin.controllers.js";

import {asyncHanndler} from '../../utils/errorHandling.js'
import { isAuth } from "../../middlewares/auth.js";

const router = Router();

router.post('/superAdmin', asyncHanndler(Controller.superAdmin))
router.post('/login', asyncHanndler(Controller.SignIn))

router.post('/add',isAuth(), asyncHanndler(Controller.addAdmin))

router.get('/getAllAdmins',isAuth(), asyncHanndler(Controller.getAllAdmins))

router.delete('/',isAuth(), asyncHanndler(Controller.deleteAdmin)) 
 

export default router