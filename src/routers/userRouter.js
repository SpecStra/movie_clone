import express from "express"
import {
    userEdit,
    userDelete,
    userSee,
    userLogout,
    startGithubLogin,
    finishGithubLogin, userEditPost, userChangePassword, userChangePasswordPost
} from "../controllers/userController"
import {protectorMiddleware, publicOnlyMiddleware, uploadFiles} from "../middlewares";

const userRouter = express.Router()

userRouter.get("/logout", protectorMiddleware ,userLogout)
// all을 쓰면 get을 하든 post를 하든 해당 컨트롤러도 작동하게 됩니다.
// multar에서 온 uploadfiles에, single메서드의 인자를 줘야하는데 이는 form의 name을 넣어주면 됩니다.
userRouter.route("/edit").all(protectorMiddleware).get(userEdit).post(uploadFiles.single("avatar"), userEditPost)
userRouter.get("/delete", userDelete)
userRouter.route("/change-password").all(protectorMiddleware).get(userChangePassword).post(userChangePasswordPost)

// 이건 직접 만들어준 URL이고, 내부에선 파라미터와 스코프 쿼리를 포함해서 authorize URL로 이동시켜주는 역할을 합니다.
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin)
// 이건 oauth를 만들 때 생성했던 인증용 콜백 URL입니다. start컨트롤러에서 이동되면 finish url에 code라는 쿼리와 함께 갑니다.
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin)
userRouter.get("/:id", userSee)

export default userRouter