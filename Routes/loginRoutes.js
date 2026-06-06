import express from "express"

import { showlogin,loginUser } from "../controllers/loginController.js"
const router=express.Router()
router.get("/login", showlogin)
router.post("/login",loginUser)

export default router