import mongoose from "mongoose";

const signupSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

// 👇 IMPORTANT FIX
const Signup = mongoose.models.signup || mongoose.model("signup", signupSchema);

export default Signup;