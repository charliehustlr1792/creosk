import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision"

let poseLandmarker: PoseLandmarker | null = null

export async function loadPoseLandmarker() {
  if (poseLandmarker) return poseLandmarker

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  )

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  })

  return poseLandmarker
}

export function getShoulderPoints(landmarks: any[]) {
  // landmarks[11] = left shoulder, landmarks[12] = right shoulder
  // landmarks[23] = left hip, landmarks[24] = right hip
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftHip = landmarks[23]
  const rightHip = landmarks[24]

  return { leftShoulder, rightShoulder, leftHip, rightHip }
}