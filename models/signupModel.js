import mongoose from "mongoose"

const signupSchema=new mongoose.Schema(
    {
        name:String,
        email:String,
        password:String,
        Confirm:String
    }

)

export default mongoose.model("signup", signupSchema)