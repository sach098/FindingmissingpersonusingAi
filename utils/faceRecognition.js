import * as faceapi from "face-api.js"
// import canvas from 'canvas'

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

let modelsLoaded = false

export const loadModels = async () => {
  if (modelsLoaded) return
  await faceapi.nets.ssdMobilenetv1.loadFromDisk("./models")
  await faceapi.nets.faceLandmark68Net.loadFromDisk("./models")
  await faceapi.nets.faceRecognitionNet.loadFromDisk("./models")
  modelsLoaded = true
  console.log("✅ AI Models ready!")
}

export const getFaceDescriptor = async (imagePath) => {
  if (!modelsLoaded) await loadModels()
  const img = await canvas.loadImage(imagePath)
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor()
  return detection ? detection.descriptor : null
}