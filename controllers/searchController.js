import report from '../models/reportModel.js'
import multer from 'multer'
import path from 'path'
import { getFaceDescriptor } from '../utils/faceRecognition.js'

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})

export const upload = multer({ storage })

export const showSearch = (req, res) => {
    res.render("search", { results: [], aiResults: [], query: {} })
}

// Euclidean distance
function euclideanDistance(a, b) {
    let sum = 0
    for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2
    return Math.sqrt(sum)
}

export const searchUser = async (req, res) => {
    try {
        const { name, age, gender, height, complexion,
                marks, lastLocation, lastSeenDate,
                city, state, status, category } = req.body

        let results   = []
        let aiResults = []

        // ── AI Face Search ──────────────────────────────────────────────
        const photoFile = req.files?.['photo']?.[0]
        if (photoFile) {
            try {
                const searchDescriptor = await getFaceDescriptor(photoFile.path)

                if (searchDescriptor) {
                    // Saare persons fetch karo jinka faceData hai
                    const allPersons = await report.find({
                        faceData: { $exists: true, $ne: null }
                    })

                    const THRESHOLD = 0.6
                    aiResults = allPersons
                        .map(person => ({
                            person,
                            distance: euclideanDistance(
                                searchDescriptor,
                                new Float32Array(person.faceData)
                            )
                        }))
                        .filter(r => r.distance < THRESHOLD)
                        .sort((a, b) => a.distance - b.distance)
                        .slice(0, 5)
                        .map(({ person, distance }) => ({
                            ...person.toObject(),
                            confidence: ((1 - distance / THRESHOLD) * 100).toFixed(1),
                            distance:   distance.toFixed(4)
                        }))

                    console.log(`✅ AI search: ${aiResults.length} matches found`)
                } else {
                    console.log("⚠️ Face not detected in search photo")
                }
            } catch (faceErr) {
                console.log("⚠️ AI search error:", faceErr.message)
            }
        }

        // ── Text Search ─────────────────────────────────────────────────
        const hasTextFilter = name || age || gender || lastLocation ||
                              city || status || complexion || marks

        if (hasTextFilter) {
            const filter = {}
            if (name)         filter.name         = new RegExp(name, 'i')
            if (age)          filter.age           = age
            if (gender)       filter.gender        = gender
            if (height)       filter.height        = new RegExp(height, 'i')
            if (complexion)   filter.complexion    = new RegExp(complexion, 'i')
            if (marks)        filter.marks         = new RegExp(marks, 'i')
            if (lastLocation) filter.lastLocation  = new RegExp(lastLocation, 'i')
            if (lastSeenDate) filter.lastSeenDate  = lastSeenDate
            if (status)       filter.status        = status

            results = await report.find(filter).limit(20)
            console.log(`✅ Text search: ${results.length} results found`)
        }

        res.render("search", { results, aiResults, query: req.body })

    } catch (err) {
        console.log("Search error:", err.message)
        res.status(500).send(err.message)
    }
}