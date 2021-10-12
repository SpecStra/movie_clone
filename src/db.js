import mongoose from "mongoose"

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true
})
require("./models/User")

const db = mongoose.connection

const handleOpen = () => console.log("Connected to MongoDB")
const handleError = (error) => console.log("DB error", error)
db.on("error", handleError)
db.once("open", handleOpen)