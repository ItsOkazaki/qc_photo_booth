import cv2
import time
import qrcode
import os

def save_photo(img, canvas_img):
    final = cv2.addWeighted(img, 1, canvas_img, 1, 0)
    
    h, w, _ = final.shape
    cv2.rectangle(final, (0, h-60), (w, h), (46, 16, 101), -1) # Dark purple
    cv2.putText(final, "Quantum Code Club - Innovating through logic", (50, h-20), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    filename = f"photo_{int(time.time())}.jpg"
    if not os.path.exists("captures"):
        os.makedirs("captures")
    
    path = os.path.join("captures", filename)
    cv2.imwrite(path, final)
    
    qr = qrcode.make(f"https://quantum-code.club/view/{filename}")
    qr.save(path.replace(".jpg", "_qr.png"))
    
    return path

def draw_ui(img, current_filter, gesture_feedback):
    # Club Branding Colors (BGR format for OpenCV)
    purple = (234, 51, 147) # #9333ea
    white = (255, 255, 255)
    
    cv2.putText(img, f"Filter: {current_filter}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, purple, 2)
    cv2.putText(img, f"Gesture: {gesture_feedback}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, white, 2)
    
    cv2.rectangle(img, (500, 10), (630, 60), purple, -1)
    cv2.putText(img, "CLEAR", (510, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, white, 2)
