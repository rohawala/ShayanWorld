import express from "express";
import { User, userValidationSchema } from "../modal/User.js";
import { Get_dj, GetuserDetails, Request_Dj, login_controller, register,register_dj,verifyUser,Create_song, getAllSongs, getSongById, Request_Song ,getAllreq,updateRequestStatus} from "../controllers/user.controllers.js";

import checkIfUserVerified from "../middlewares/checkIfUserVerifyed.js";
import upload from "../middlewares/upload.js";
import { Verify_Token, extractToken } from "../middlewares/checkToken.js";

const router = express.Router();
// Customer
router.post("/login",login_controller);
router.post("/register",upload.single("profilePicture"),register);
router.get("/disc_jockey",Get_dj);
router.post("/request/:songId",Request_Song)




router.post("/register_dj",upload.single("profilePicture"),register_dj);
router.put("/verify",checkIfUserVerified,verifyUser);
router.get("/get_user_by_id/:userId",GetuserDetails);


router.post("/request",[extractToken,Verify_Token],Request_Dj);
router.get("/allReq",getAllreq)

// Route to update request status
router.patch('/request/:id', updateRequestStatus);

router.post("/post_song", [extractToken, Verify_Token], upload.single('audioFile'), Create_song);

router.get("/get_songs",getAllSongs)
router.get("/get_songs/:id",[extractToken,Verify_Token],getSongById)

export default router;
