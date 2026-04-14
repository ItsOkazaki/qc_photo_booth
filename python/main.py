import cv2
from hand_tracking import HandDetector
from gestures import detect_gesture
from drawing import Canvas
from filters import FilterManager
from ui import draw_ui, save_photo
import time

def main():
    cap = cv2.VideoCapture(0)
    detector = HandDetector(detection_con=0.8)
    filter_manager = FilterManager()
    
    success, img = cap.read()
    if not success: return
    h, w, _ = img.shape
    canvas = Canvas(w, h)
    
    p_time = 0
    gesture_feedback = "None"
    last_filter_change = 0
    last_photo_time = 0

    while True:
        success, img = cap.read()
        if not success: break
        img = cv2.flip(img, 1)
        
        img = detector.find_hands(img)
        lm_list = detector.find_position(img, draw=False)
        
        if len(lm_list) != 0:
            fingers = detector.fingers_up()
            gesture = detect_gesture(fingers, lm_list)
            gesture_feedback = gesture
            
            if gesture == "CLEAR":
                canvas.clear()
            elif gesture == "FILTER":
                if time.time() - last_filter_change > 1:
                    filter_manager.next_filter()
                    last_filter_change = time.time()
            elif gesture == "PHOTO":
                if time.time() - last_photo_time > 5:
                    save_photo(img, canvas.img_canvas)
                    last_photo_time = time.time()
            
            canvas.draw(img, lm_list, fingers)

        img = filter_manager.apply(img)
        img = canvas.get_combined(img)
        draw_ui(img, filter_manager.filters[filter_manager.current_index], gesture_feedback)
        
        c_time = time.time()
        fps = 1 / (c_time - p_time)
        p_time = c_time
        cv2.putText(img, f"FPS: {int(fps)}", (w-100, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (147, 51, 234), 2)

        cv2.imshow("Quantum Code Photo Booth", img)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
