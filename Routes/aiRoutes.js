import express from "express"
import multer from "multer"
import Report from "../models/reportModel.js"
import { getFaceDescriptor } from "../utils/faceRecognition.js"

const router = express.Router()

// Multer setup
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})
const upload = multer({ storage })

// Euclidean distance
function euclideanDistance(a, b) {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2
  return Math.sqrt(sum)
}

// POST /api/check-face
router.post("/check-face", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ status: "error", message: "Photo nahi mili" })
    }

    const searchFace = await getFaceDescriptor(req.file.path)

    if (!searchFace) {
      return res.json({ status: "error", message: "Face not detected" })
    }

    const persons = await Report.find({
      faceData: { $exists: true, $ne: null }
    })

    if (persons.length === 0) {
      return res.json({ status: "no-match", message: "Database mein koi face saved nahi hai. Pehle report submit karo." })
    }

    let bestMatch   = null
    let minDistance = Infinity

    for (const person of persons) {
      const dbFace   = new Float32Array(person.faceData)
      const distance = euclideanDistance(searchFace, dbFace)
      if (distance < minDistance) {
        minDistance = distance
        bestMatch   = person
      }
    }

    if (minDistance < 0.6) {
      return res.json({
        status:   "match",
        _id:      bestMatch._id,
        name:     bestMatch.name,
        age:      bestMatch.age    || null,
        gender:   bestMatch.gender || null,
        city:     bestMatch.lastLocation || null,
        image:    bestMatch.photo  || null,
        accuracy: ((1 - minDistance) * 100).toFixed(2),
      })
    } else {
      return res.json({ status: "no-match" })
    }

  } catch (error) {
    console.error("AI Error:", error.message)
    return res.status(500).json({ status: "error", message: error.message })
  }
})

export default router