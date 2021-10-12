import express from "express"
import {
    postEdit,
    videoDeleteGet,
    videoEdit,
    videoSee,
    getVideoUpload,
    postVideoUpload, videoDeletePost
} from "../controllers/videoController";
import {protectorMiddleware, uploadFiles, videoUpload} from "../middlewares";

const videoRouter = express.Router()

// DB에서 정규표현식을 지원한다면 아래와 같은 표현이 더욱 유용하겠죠..
// videoRouter.get("/:id(\\d+)", videoSee)
videoRouter.get("/:id([0-9a-f]{24})", videoSee)
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(videoEdit).post(postEdit)
videoRouter.route("/:id([0-9a-f]{24})/delete").all(protectorMiddleware).get(videoDeleteGet).post(videoDeletePost)
videoRouter.route("/upload").all(protectorMiddleware).get(getVideoUpload).post(videoUpload.single("video"),postVideoUpload)

export default videoRouter