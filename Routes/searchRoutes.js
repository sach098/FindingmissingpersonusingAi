import express from 'express'
import { showSearch, searchUser, upload } from '../controllers/searchController.js'

const router = express.Router()

router.get("/search", showSearch)
// ✅ Yahan .fields() lagao
router.post("/search", upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "extraPhotos", maxCount: 5 }
]), searchUser)

export default router