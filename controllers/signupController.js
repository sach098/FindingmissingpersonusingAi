import Signup from "../models/signupModel.js"
import bcrypt from "bcryptjs"

export const showSignup = (req, res) => {
    res.render("signup")
}

export const signupUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const existing = await Signup.findOne({ email })
        if (existing) {
            return res.render("signup", { error: "Email already registered!" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new Signup({ name, email, password: hashedPassword })
        await user.save()
        console.log("✅ User registered:", email)
        res.redirect("/login")

    } catch (err) {
        console.log("Signup error:", err.message)
        res.status(500).send(err.message)
    }
}