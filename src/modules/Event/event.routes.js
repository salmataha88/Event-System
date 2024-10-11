import { Router } from "express";
import * as Controller from "./event.controllers.js";

import {asyncHanndler} from '../../utils/errorHandling.js'
import { isAuth } from "../../middlewares/auth.js";

const router = Router();


router.get('/userEvents', isAuth(), asyncHanndler(Controller.getUserEvents));
router.get('/RegisteredUsers', isAuth() ,asyncHanndler(Controller.viewRegisteredUsers))

router.get('/organizer', asyncHanndler(Controller.getEventsByOrganizer))

router.get('/',asyncHanndler(Controller.getEvents))
router.get('/name', asyncHanndler(Controller.getEventByName))


router.post('/create', isAuth() ,asyncHanndler(Controller.createEvent))
router.post('/registerEvent', isAuth(),asyncHanndler(Controller.RegisterEvent))

router.put('/update', isAuth() ,asyncHanndler(Controller.updateEvent))
router.put('/cancelEvent', isAuth(),asyncHanndler(Controller.cancelEvent))

router.delete('/delete', isAuth() ,asyncHanndler(Controller.deleteEvent))


 
export default router