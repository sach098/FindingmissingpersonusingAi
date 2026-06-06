import express from "express"
import { showSignup,signupUser } from "../controllers/signupController.js"

const router=express.Router()
router.get("/signup",showSignup)
router.post("/signup",signupUser)

export default router