import express from "express"
import path from "path"
import mongoose from "mongoose"
import { fileURLToPath } from "url"
import { loadModels } from "./utils/faceRecognition.js"

import signupRoute from "./Routes/signupRoutes.js"
import loginRoute  from "./Routes/loginRoutes.js"
import reportRoute from "./Routes/reportRoutes.js"
import searchRoute from "./Routes/searchRoutes.js"
import aiRoute     from "./Routes/aiRoutes.js"

const app  = express()
const port = 3000

const fn        = fileURLToPath(import.meta.url)
const __dirname = path.dirname(fn)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static(path.join(__dirname, "public")))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// ✅ mongoose + loadModels dono saath
mongoose.connect("mongodb://127.0.0.1:27017/mvcproject")
  .then(async () => {
    console.log("✅ DB connected successfully")
    await loadModels()               // ← yahi fix hai
    console.log("✅ AI Models ready!")
  })
  .catch(err => console.log("❌ DB connection error:", err))


  // Person detail page
app.get("/person/:id", async (req, res) => {
    try {
        const person = await (await import("./models/reportModel.js")).default.findById(req.params.id)
        if (!person) return res.status(404).send("Person not found")
        res.render("personDetail", { person })
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Routes
app.get("/", (req, res) => res.render("home"))

app.use("/", signupRoute)
app.use("/", loginRoute)
app.use("/", reportRoute)
app.use("/", searchRoute)
app.use("/api", aiRoute)

app.get("/search", (req, res) => res.render("search"))
app.get("/help",   (req, res) => res.render("help"))

// Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
})
