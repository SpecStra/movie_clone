import express from "express"
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import "./db"
import "./models/Video"
import "./models/User"
import session from "express-session"
import MongoStore from "connect-mongo";
import {localsMiddleware} from "./middlewares";
import apiRouter from "./routers/apiRouter";
import cookieParser from "cookie-parser";
import flash from "connect-flash"
import 'regenerator-runtime'

// 미들웨어란, req와 res사이의 기능을 하는 어떤 함수를 말합니다. req, res, next를 인자로 갖습니다.
// next는 다음 함수를 호출할 때 사용합니다. 다만, ware들은 return이 있으면 종료되기에 return은 finalware에만 있어야 합니다.

const app = express()

app.set("view engine", "pug")
app.set("views", process.cwd() + "/src/views")
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// 브라우저가 backend와 상호작용할 때마다 브라우저에 cookie-백엔드가 브라우저에 넘겨주는 정보-를 먹여줍니다.
// 브라우저는 sessionID를 쿠키를 통해 넘겨받고, 백엔드는 이 sessionID를 기억하고 있습니다.
// sessionID는 쿠키에 저장하지만, 나머지 데이터들은 서버에서 저장됩니다.
app.use(session({
    cookie: { maxAge: 60000 },
    secret : process.env.COOKIE_SECRET,
    resave : false,
    saveUninitialized : false,
    // 해당 항목을 false로 할 시, 확인되는 경우에만, 즉 세션에 직접적인 관여가 생기는 경우에만 저장하도록 합니다.
    store : MongoStore.create({ mongoUrl : process.env.DB_URL})
}))

app.use(flash())
app.use(localsMiddleware)
app.use("/", rootRouter)
app.use("/user", userRouter)
app.use("/videos", videoRouter)
// express로 하여금 uploads 디렉토리의 모든 소스는 공개된다고 알려주는 것입니다.
app.use("/uploads", express.static("uploads"))
app.use("/static", express.static("assets"))
app.use("/api", apiRouter)

// 서버로 하여금 동작하는 콜백함수로써, 해당 함수는 서버가 브라우저가 서버로 보낸 req에 응답하는 것입니다.
// req, res는 각각 F12에 들어가면 나오는 장문의 메시지 ( 브라우저 정보, 시간, 서버 등등.. )에서 필요한 것만 꽂아 넣어줍니다.

// 누군가가 <1번인자>로 get 요청을 보낼 경우, <2번인자>콜백함수를 실행시켜라.
// 2번인자는 함수여야만 합니다. 아니면 에러뜹니다.
// 이 get이라는 것 자체는 , 1번인자로 오려고 한다면 2번인자를 실행시킨다. 는 뜻입니다.
// app.get("/", handleHome)
// get 요청이 발생하면, express가 개입하여 <콜백함수>({req}, {res})를 넣어서 실행시킵니다.

export default app