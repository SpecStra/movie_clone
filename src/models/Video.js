import * as mongoose from "mongoose";
import User from "../models/User"

const videoSchema = new mongoose.Schema({
    title : {type : String, required : true, trim : true},
    videoFileUrl :{type : String, required : true},
    description : {type : String, required : true, trim : true},
    createdAt : {type : Date, required : true, default: Date.now},
    hashtags : [{type : String, trim : true}],
    meta : {
        views : {type : Number, default : 0},
    },
    comments : [{
        type : mongoose.Schema.Types.ObjectId, ref : "Comment"
    }],
    // 타입을 mongoose의 모델과 직접 연결시켜줍니다. 추가적인 ref를 통해 경로를 명시해줍니다.
    owner : {type : mongoose.Schema.Types.ObjectId, required : true, ref : "User"} ,
})

// 미들웨어. save라는 이벤트가 발생하기 전에 스냅하여 promise를 먼저 처리하고 넘겨줍니다.
videoSchema.pre('save', async function () {
    this.hashtags = this.hashtags[0].split(",").map((word) => (word.startsWith("#") ? word : `#${word}`))
})

// 스태틱은 전역 함수를 만드는 것이라고 생각하면 편합니다. 자동으로 export되며 Video.formatHashtags로 접근하여 사용 가능합니다.
videoSchema.static('formatHashtags', function (hashtags){
    return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`))
})

const Video = mongoose.model("Video", videoSchema)

export default Video