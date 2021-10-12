import * as mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    email : {type : String, required : true},
    avatarURL : {type : String},
    socialOnly : {type : Boolean, default : false},
    username : {type : String, required : true, unique : true},
    password : {type : String},
    nickname : {type : String, required : true},
    location : String,
    videos : [{
        type : mongoose.Schema.Types.ObjectId, ref : "Video"
    }],
    comments : [{
        type : mongoose.Schema.Types.ObjectId, ref : "Comment"
    }],
})

userSchema.pre("save", async function () {
    // console.log("User's password = ",this.password)
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5)
    }
    // console.log("hashed password =", this.password)
})

const User = mongoose.model("User", userSchema)

export default User