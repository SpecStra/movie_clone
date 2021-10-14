import Video from "../models/Video";
import User from "../models/User"
import Comment from "../models/Comment";

export const videoTrending = async (req, res) => {
    try{
        const videos = await Video.find({}).sort({createdAt : "desc"}).populate("owner") // 데이터가 채워지기 전까지 JS가 기다립니다.
        return res.render("home", {pageTitle : "Home", videos: videos})
    } catch (e) {
        return res.render("server-error", {e})
    }
}

export const videoSee = async (req, res) => {
    const {id} = req.params
    // populate는 인자로 받는 ref인 부분을 실제 참조값으로 채워줍니다. 해당 위치에는 객체가 들어옵니다.
    const foundVideo = await Video.findById(id).populate("owner").populate("comments")
    if (foundVideo){
        return res.render("watch", {pageTitle : foundVideo.title, video : foundVideo})
    } else {
        return res.render("404", {pageTitle : "VIDEO NOT FOUND"})
    }
}

export const videoEdit = async(req, res) => {
    const {id} = req.params
    const {user: {_id}} = req.session
    const foundVideo = await Video.findById(id)
    if (!foundVideo) {
        return res.status(404).render("404", {pageTitle : "VIDEO NOT FOUND"})
    }
    if (String(foundVideo.owner) !== String(_id)){
        return res.status(403).redirect("/")
    }
    return res.render("edit", {pageTitle : `Editing ${foundVideo.title}`, video:foundVideo})
}
export const postEdit = async (req, res) => {
    const {id} = req.params
    const {user: {_id}} = req.session
    const {title, description, hashtags} = req.body
    const foundVideo = await Video.exists({_id : id})
    if (!foundVideo) {
        return res.status(404).render("404", {pageTitle : "VIDEO NOT FOUND"})
    }
    if (String(foundVideo.owner) !== String(_id)){
        return res.status(403).redirect("/")
    }
    await Video.findByIdAndUpdate(id, {
        title : title,
        description : description,
        hashtags : Video.formatHashtags(hashtags)
    })
    return res.redirect(`/videos/${id}`)
}

export const getVideoUpload = (req, res) => {
    return res.render("upload", {pageTitle : "Upload Video"})
}
export const postVideoUpload = async (req, res) => {
    const {user : {_id}} = req.session
    const file = req.file
    const {title, description, hashtags} = req.body
    try {
        const newVideo = await Video.create({
            videoFileUrl : file.path,
            title : title,
            description : description,
            hashtags : Video.formatHashtags(hashtags),
            owner : _id
        })
        const user = await User.findById(_id)
        user.videos.push(newVideo._id)
        user.save()
        return res.redirect("/")
    // js오브젝트를 그대로 넘겨서 save해주는 방법이 있고, 형식에 맞는 object를 통해 create해주는 방법이 있습니다.
    // save에서는 잘못된 데이터 형식을 받으면 해당 데이터는 생략하고 만들지만, (required가 없는 경우엔)
    // create는 잘못된 데이터형식이 있으면 에러를 띄우고 저장도 안합니다.
    } catch (e) {
        // console.log(e)
        return res.status(400).render("upload", {pageTitle : "Upload Video", errormessage:e._message})
    }
}
export const videoSearch = async (req, res) => {
    const {keyword} = req.query
    let videos = []
    if (keyword){
        videos = await Video.find({
            title : {
                $regex: new RegExp(`${keyword}*`, "i")
            } // i는 contains를 의미합니다.
        }).populate("owner")
    }
    return res.render("search", {pageTitle : "Search", videos : videos})
}

export const videoDeleteGet = async (req, res) => {
    const {id} = req.params
    const {user: {_id}} = req.session
    const foundVideo = await Video.findById(_id)
    if (!foundVideo) {
        return res.status(404).render("404", {pageTitle : "VIDEO NOT FOUND"})
    }
    if (String(foundVideo.owner) !== String(_id)){
        return res.status(403).redirect("/")
    }
    await Video.findByIdAndDelete(id)
    res.redirect("/")
}

export const registerView = async (req, res) => {
    const {id} = req.params
    const video = await Video.findById(id)
    if(!video){
        return res.sendStatus(404)
    }
    video.meta.views = video.meta.views + 1
    await video.save()
    return res.sendStatus(200)
}

export const createComment = async (req, res) => {
    const {session : {user}, body : {text}, params : {id}} =req
    // 쿠키의 원칙에 의해, fetch를 통해 자동으로 user를 받아옵니다.

    const video = await Video.findById(id)
    if(!video){
        return res.sendStatus(404)
    }
    const comment = await Comment.create({
        text : text,
        video : id,
        owner : user._id,
    })
    // 201 Status : created
    video.comments.push(comment._id)
    video.save()

    return res.status(201).json({newCommentId : comment._id})
}

// 더미데이터
export const videoDeletePost = (req, res) => res.redirect("/")