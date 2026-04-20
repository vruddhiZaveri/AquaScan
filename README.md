# 🌊 AquaScan  
### 🚀 AI-Powered Water Pollution Detection & Reporting Platform  

<p align="center">
  <img src="https://img.shields.io/badge/AI-Computer%20Vision-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/YOLOv8-Detection-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Stack-MERN-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
</p>

---

## 📌 Overview  

AquaScan is an **AI-driven environmental platform** that empowers users to detect, report, and track water pollution in real time.  

By combining **computer vision + geolocation + full-stack systems**, AquaScan transforms citizens into active environmental contributors while enabling authorities to take faster, data-driven action.

---

## ⚡ One-Line Pitch  

> **Turning citizens into environmental reporters using AI-powered pollution detection.**

---

## 🎯 Key Features  

### 👤 User Portal  
- 📸 Upload images of polluted water bodies  
- 🤖 AI-powered waste detection (YOLOv8 / YOLOv11)  
- 📍 Automatic geotagging  
- ⚠️ Severity & urgency scoring  
- 📊 Track reports in real-time  
- 💬 Chat with authorities  
- 🏆 Earn Impact Points & badges  

---

### 🏢 Committee Portal  
- 📥 Real-time incoming reports  
- 🗺️ Map-based pollution tracking  
- 🧾 Detailed insights (user, location, AI output)  
- 🔧 Assign cleanup teams  
- ✅ Mark reports as resolved  
- 📊 Analytics dashboard  
- 💬 Communication system  

---

### 🤖 AI Engine  
- YOLOv8 / YOLOv11 object detection  
- Custom-trained aquatic waste dataset  
- Multi-class waste classification  
- Detection confidence scoring  
- Scalable ML inference pipeline  

---

## 🧠 Tech Stack  

| Layer        | Technologies |
|-------------|-------------|
| 🎨 Frontend | React, React Native (Expo), Vite |
| ⚙️ Backend  | Node.js, Express |
| 🗄️ Database | MongoDB |
| ☁️ Storage  | Firebase / AWS S3 |
| 🤖 ML       | Python, YOLOv8/YOLOv11, OpenCV, FastAPI |

---

## ⚙️ Architecture  

```text
User → Upload Image → Backend → ML Model (YOLO)
        ↓                          ↓
   Geotag + Metadata       Detection Output
        ↓                          ↓
     Database ← Severity Engine ←
        ↓
Committee Dashboard → Action → Cleanup
