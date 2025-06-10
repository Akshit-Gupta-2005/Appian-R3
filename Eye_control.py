import cv2
import mediapipe as mp
import pyautogui
import time
import speech_recognition as sr
import threading

eye_control_active = True 

def voice_command_listener():
    global eye_control_active
    recognizer = sr.Recognizer()
    mic = sr.Microphone()  

    with mic as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Calibrated microphone for ambient noise.")

    print("Voice control active. Say 'start' or 'stop'.")

    while True:
        try:
            with mic as source:
                print("Listening for commands...")
                audio = recognizer.listen(source, phrase_time_limit=3)
            command = recognizer.recognize_google(audio).lower()
            print(f"Voice command heard: {command}")

            if "stop" in command:
                eye_control_active = False
                print("Eye control stopped.")
            elif "start" in command:
                eye_control_active = True
                print("Eye control started.")

        except sr.UnknownValueError:
            pass
        except sr.RequestError:
            print("Could not reach Google Speech Recognition service.")
            break

listener_thread = threading.Thread(target=voice_command_listener, daemon=True)
listener_thread.start()

cam = cv2.VideoCapture(0)
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=1)
screen_w, screen_h = pyautogui.size()

smooth_x, smooth_y = 0, 0
blink_threshold = 0.005
blink_cooldown = 1
last_click_time = 0
smoothing_factor = 2

def get_pixel_coordinates(landmark, frame_w, frame_h):
    return int(landmark.x * frame_w), int(landmark.y * frame_h)

def move_cursor(x, y, frame_w, frame_h):
    global smooth_x, smooth_y
    target_x = screen_w / frame_w * x
    target_y = screen_h / frame_h * y

    smooth_x += (target_x - smooth_x) / smoothing_factor
    smooth_y += (target_y - smooth_y) / smoothing_factor

    smooth_x = max(0, min(screen_w, smooth_x))
    smooth_y = max(0, min(screen_h, smooth_y))

    pyautogui.moveTo(smooth_x, smooth_y)

def detect_blink(eye_top, eye_bottom):
    global last_click_time
    vertical_dist = abs(eye_top.y - eye_bottom.y)
    current_time = time.time()
    if vertical_dist < blink_threshold and (current_time - last_click_time) > blink_cooldown:
        print("Blink detected! Clicking...")
        pyautogui.click()
        last_click_time = current_time

while True:
    ret, frame = cam.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    frame_h, frame_w, _ = frame.shape

    if eye_control_active and results.multi_face_landmarks:
        landmarks = results.multi_face_landmarks[0].landmark

        eye_landmark = landmarks[475]
        x, y = get_pixel_coordinates(eye_landmark, frame_w, frame_h)
        cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)
        move_cursor(x, y, frame_w, frame_h)

        left_top = landmarks[159]
        left_bottom = landmarks[145]
        x1, y1 = get_pixel_coordinates(left_top, frame_w, frame_h)
        x2, y2 = get_pixel_coordinates(left_bottom, frame_w, frame_h)
        cv2.circle(frame, (x1, y1), 3, (0, 255, 255), -1)
        cv2.circle(frame, (x2, y2), 3, (0, 255, 255), -1)

        detect_blink(left_top, left_bottom)

    scale = 2
    bigger_frame = cv2.resize(frame, (frame_w * scale, frame_h * scale))
    cv2.imshow("Eye Controlled Mouse", bigger_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cam.release()
cv2.destroyAllWindows()
