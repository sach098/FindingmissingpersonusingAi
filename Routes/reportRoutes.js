import express from "express"
import { showreport, reportUser, upload } from "../controllers/reportController.js"

const router = express.Router()

router.get("/report", showreport)
router.post("/report", upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'extraPhotos', maxCount: 5 }
]), reportUser)

export default router