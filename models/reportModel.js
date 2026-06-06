import mongoose from "mongoose";

const reportschema = new mongoose.Schema(
    {
        name:        String,
        age:         String,
        gender:      String,
        dob:         String,
        height:      String,
        weight:      String,
        complexion:  String,
        hair:        String,
        eyes:        String,
        marks:       String,
        lastLocation:String,
        lastSeenDate:String,
        clothes:     String,
        description: String,
        reporterName:String,
        phone:       String,
        email:       String,
        photo:       String,
        extraPhotos: String,
        status:      String,
        faceData:    [Number],  // ← AI face descriptor (128 floats)
    }
)

export default mongoose.model("report", reportschema)