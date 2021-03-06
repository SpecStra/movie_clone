import express, {application} from "express"
import User from "../models/User"
import bcrypt from "bcrypt"
import fetch from "node-fetch"
import e from "express";
import Video from "../models/Video";

// rootRouter
export const userJoin = (req, res) => {
    res.render("join", {pageTitle : "join"})
}
export const userJoinPost = async (req, res) => {
    const {nickname, email, username, password, password2 , location} = req.body
    const pageTitle = "Join"
    if(password !== password2){
        return res.status(400).render("join", {pageTitle : pageTitle, errormessage : "Password Confirm does not match."})
    }
    const exists = await User.exists({$or : [{username : username}, {email : email}]})
    if (exists) {
        return res.status(400).render("join", {pageTitle : pageTitle, errormessage : "Some info is already taken."})
    }
    try{
        await User.create({
            nickname : nickname,
            email : email,
            username : username,
            password : password,
            location : location
        })
    } catch (e) {
        return res.status(400).render("join", {pageTitle : "join", errormessage:e._message})
    }
    res.redirect("/login")
}
export const userLogin = (req, res) => {
    return res.render("login", {pageTitle : "login"})
}
export const userLoginPost = async (req, res) => {
    const {username, password} = req.body
    const pageTitle = "login"
    const user = await User.findOne({username : username})
    if(!user){
        return res.status(400).render("login", {pageTitle : pageTitle, errormessage : "account does not exist"})
    }
    const ok = await bcrypt.compare(password, user.password)
    if(!ok){
        return res.status(400).render("login", {pageTitle : pageTitle, errormessage : "wrong password"})
    }
    req.session.loggedIn = true;
    req.session.user = user
    return res.redirect("/")
}

export const startGithubLogin = (req, res) => {
    const baseURL = `https://github.com/login/oauth/authorize`
    const config = {
        client_id : process.env.CLIENT_ID,
        allow_signup : false,
        scope : "read:user user:email"
    }
    const params = new URLSearchParams(config).toString()
    const finalURL = `${baseURL}?${params}`
    return res.redirect(finalURL)
}

export const finishGithubLogin = async (req, res) => {
    const baseURL = `https://github.com/login/oauth/access_token`
    const config = {
        client_id: process.env.CLIENT_ID,
        client_secret : process.env.GIT_SECRET,
        code : req.query.code
    }
    const params = new URLSearchParams(config).toString()
    const finalURL = `${baseURL}?${params}`
    const tokenRequest = await (await fetch(finalURL, {
        method : "POST",
        headers : {
            Accept : "application/json"
        }
    })).json()
    if ("access_token" in tokenRequest){
        const {access_token} = tokenRequest
        const apiUrl = "https://api.github.com"
        const userData = await (await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization : `token ${access_token}`
            }
        })).json()
        // console.log(userData)
        const emailData = await (await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization : `token ${access_token}`
            }
        })).json()
        const emailObj = emailData.find(email => email.primary === true && email.verified === true)
        // console.log(emailObj)
        if(!emailObj) {
            return res.redirect("/login")
        }
        const existingUser = await User.findOne({email : emailObj.email})
        if(existingUser !== null){
            req.session.loggedIn = true;
            req.session.user = existingUser
            console.log(existingUser)
            return res.redirect("/")
        } else {
            // create an account
            try {
                const newUser = await User.create({
                    nickname : userData.name,
                    email : emailObj.email,
                    avatarURL : userData.avatar_url,
                    username : userData.login,
                    password : "",
                    location : userData.location,
                    socialOnly : true
                })
                req.session.loggedIn = true;
                req.session.user = newUser
                return res.redirect("/")
            } catch (e) {
                console.log(e)
            }
        }
    } else {
        return res.redirect("/login")
    }
}

// userRouter
export const userEdit = (req, res) => {
    return res.render("editUser", {pageTitle : "Edit Profile"})
}
export const userEditPost = async (req, res) => {
    // ??????????????? : ????????? form??? ????????? ????????? ??????, ???????????? ??????????????????.
    const {session : { user : {_id, avatarUrl}}, file} = req
    const {nickname, email, username, location} = req.body
    // new ????????? ?????? ????????? ???????????? ??? ?????? return??????, new??? ????????? ???????????? return?????????.
    const updatedUser = await User.findByIdAndUpdate(_id, {
        avatarURL : file ? file.path : avatarUrl,
        email : email,
        username : username,
        nickname : nickname,
        location : location
    }, {new : true})
    // DB??? ???????????? ?????????.. ???????????? ?????? ??? ????????? ???????????? ????????????. ????????? ???????????? ??????????
    /*
    new ????????? ??? ??? ??????, ????????? ?????? ?????????..
    req.session.user = {
        ...req.session.user,
        email : email,
        username : username,
        nickname : nickname,
        location : location
    }
     */
    req.session.user = updatedUser
    return res.redirect("/")
}
export const userChangePassword = (req, res) => {
    return res.render("user/change-password", {pageTitle : "change Password"})
}
export const userChangePasswordPost = async (req, res) => {
    // ??????????????? ?????????????????????. ????????? ?????????
    const {session : { user : {_id}}, body:{oldPassword, newPassword, newPassword2 }} = req
    const ok = await bcrypt.compare(oldPassword, req.session.user.password)
    if(!ok){
        return res.status(400).render("user/change-password", {pageTitle : "change Password", errorMessage : "old password does not match"})
    }
    if(newPassword !== newPassword2){
        return res.status(400).render("user/change-password", {pageTitle : "change Password", errorMessage : "dupl password"})
    }
    const user = await User.findById({_id})
    user.password = newPassword
    await user.save()
    req.session.user.password = user.password
    return res.redirect("/user/logout")
}

export const userDelete = (req, res) => res.send("delete")
export const userLogout = (req, res) => {
    req.session.destroy()
    return res.redirect("/")
}
export const userSee = async (req, res) => {
    const {id} = req.params
    const user = await User.findById(id).populate("videos")
    // console.log(user)
    if(!user){
        return res.status(404).render("404", {pageTitle : "User Not Founded"})
    }
    return res.render("user/profile", {pageTitle : `${user.nickname}'s Profile`, user:user})

}