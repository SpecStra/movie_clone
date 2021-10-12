// 서버가 새로이 가동될 경우, 초기화시켜줍니다.
import "dotenv/config"
import 'regenerator-runtime'
import "./db"
import "./models/Video"
import "./models/User"
import "./models/Comment"
import app from "./server"
import "regenerator-runtime"

const PORT = 4500

const handleListening = () => console.log(`Server listening on port http://localhost:${PORT}`)

app.listen(PORT, handleListening)