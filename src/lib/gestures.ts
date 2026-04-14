import { Hands, Results } from '@mediapipe/hands';

export const GESTURES = {
  CLEAR: 'CLEAR',
  FILTER: 'FILTER',
  PHOTO: 'PHOTO',
  NONE: 'NONE',
  PINCH: 'PINCH'
} as const;

export type GestureType = keyof typeof GESTURES;

export function detectGesture(landmarks: any): GestureType {
  if (!landmarks || landmarks.length === 0) return 'NONE';

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const indexPip = landmarks[6];
  const middlePip = landmarks[10];
  const ringPip = landmarks[14];
  const pinkyPip = landmarks[18];

  // Fingers up detection
  const isIndexUp = indexTip.y < indexPip.y;
  const isMiddleUp = middleTip.y < middlePip.y;
  const isRingUp = ringTip.y < ringPip.y;
  const isPinkyUp = pinkyTip.y < pinkyPip.y;
  
  // Thumb up detection
  const isThumbUp = thumbTip.y < landmarks[2].y - 0.05;

  // Grab/Fist Detection (All fingers folded)
  const isFist = !isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp;

  // Open Hand (All fingers up)
  if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp) {
    return 'CLEAR';
  }

  // Grab (Fist) - Used for moving objects
  if (isFist) {
    return 'PINCH'; // Reusing PINCH as GRAB for logic consistency
  }

  // V-Sign (Index and Middle up)
  if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) {
    return 'FILTER';
  }

  // Thumbs Up (Only thumb is up, others are folded)
  if (isThumbUp && !isIndexUp && !isMiddleUp) {
    return 'PHOTO';
  }

  // Pinch (Index and Thumb tips close)
  const dist = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) + 
    Math.pow(thumbTip.y - indexTip.y, 2)
  );
  if (dist < 0.05) {
    return 'PINCH';
  }

  return 'NONE';
}
