import Signup from "../models/signupModel.js"
import bcrypt from "bcryptjs"

export const showlogin = (req, res) => {
    res.render("login")
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await Signup.findOne({ email })
        if (!user) {
            return res.render("login", { error: "Email not found!" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.render("login", { error: "Wrong password!" })
        }

        console.log("✅ User logged in:", email)
        res.redirect("/")

    } catch (err) {
        console.log("Login error:", err.message)
        res.status(500).send(err.message)
    }
}