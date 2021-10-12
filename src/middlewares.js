import multer from "multer";

export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn)
    res.locals.siteName = "Wetube"
    res.locals.loggedInUser = req.session.user || {}
    res.locals.siteURL = req.originalUrl
    next()
}

export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn){
        return next()
    } else {
        return res.redirect("/login")
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn){
        return next()
    } else {
        req.flash("error", "Not authorized")
        return res.redirect("/")
    }
}

export const uploadFiles = multer({
    dest : "uploads/", limits : {fileSize : 300000}
})

export const videoUpload = multer({
    dest : "uploads/videos", limits : {fileSize : 100000000}
})