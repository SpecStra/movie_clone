import express from "express"
import {userJoin, userJoinPost, userLogin, userLoginPost} from "../controllers/userController"
import {videoSearch, videoTrending} from "../controllers/videoController";
import {publicOnlyMiddleware} from "../middlewares";

const rootRouter = express.Router()


rootRouter.get("/", videoTrending)
rootRouter.route("/join").all(publicOnlyMiddleware).get(userJoin).post(userJoinPost)
rootRouter.route("/login").all(publicOnlyMiddleware).get(userLogin).post(userLoginPost)
rootRouter.get("/search", videoSearch)

export default rootRouter