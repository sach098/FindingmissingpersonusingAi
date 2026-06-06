import report from '../models/reportModel.js'
import multer from 'multer'
import path from 'path'
import { getFaceDescriptor } from '../utils/faceRecognition.js'

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})

export const upload = multer({ storage })

export const showreport = (req, res) => {
    res.render("report")
}

export const reportUser = async (req, res) => {
    try {
        const photoFile     = req.files['photo'] ? req.files['photo'][0] : null
        const photoFilename = photoFile ? photoFile.filename : ''

        // Face descriptor nikalo aur save karo
        let faceData = null
        if (photoFile) {
            try {
                const descriptor = await getFaceDescriptor(photoFile.path)
                if (descriptor) {
                    faceData = Array.from(descriptor)
                    console.log("✅ Face descriptor saved:", faceData.length, "values")
                } else {
                    console.log("⚠️ Face not detected in photo")
                }
            } catch (faceErr) {
                console.log("⚠️ Face error:", faceErr.message)
            }
        }

        const data = {
            ...req.body,
            photo:       photoFilename,
            extraPhotos: req.files['extraPhotos']
                ? req.files['extraPhotos'].map(f => f.filename).join(',')
                : '',
            faceData: faceData,
        }

        const user = new report(data)
        await user.save()
        console.log("✅ Report saved, faceData:", !!faceData)
        res.redirect("/")

    } catch (err) {
        console.log("Report error:", err.message)
        res.status(500).send(err.message)
    }
}