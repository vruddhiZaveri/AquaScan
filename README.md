# 🌊 AquaScan  
### 🚀 AI-Assisted Water Pollution Reporting System  

<p align="center">
  <img src="https://img.shields.io/badge/AI-Computer%20Vision-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/YOLO-Detection-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-Node.js-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Prototype-important?style=for-the-badge" />
</p>

---

## 🧠 Overview  

AquaScan is a **full-stack AI-powered prototype** designed to detect and report water pollution using computer vision.

The system allows users to:
- upload images of polluted water bodies  
- analyze them using a YOLO-based model  
- generate structured reports  
- track pollution cases through a dashboard  

This project demonstrates **end-to-end integration of AI + backend + frontend systems**, focusing on real-world environmental impact.

---

## ⚡ One-Line Pitch  

> **Turning pollution sightings into structured, actionable reports using AI.**

---

## 🏗️ Architecture  

<p align="center">
  <img src="./architecture-diagram.jpg" width="700"/>
</p>

> ⚠️ The diagram represents the **complete system vision**.  
> The current implementation includes core working components (frontend + backend + ML service + DB), while some advanced features are still in progress.

---

## 🚀 Core Features  

### 👤 User Side  
- 📸 Upload pollution images  
- 📍 Add location (manual / geotag)  
- 🤖 AI-based waste detection (YOLO)  
- ⚠️ Severity & urgency estimation  
- 📊 View report status  

---

### 🏢 Committee / Admin Side  
- 📥 View incoming reports  
- 🗺️ Track pollution locations  
- 🔧 Update report status  
- 📊 Basic monitoring dashboard  

---

### 🤖 AI Pipeline  
- YOLO-based object detection  
- Custom aquatic waste dataset (training in progress)  
- Detection → structured output conversion  
- Confidence-based scoring  

---

## ⚙️ Tech Stack  

| Layer        | Technology |
|-------------|-----------|
| 🎨 Frontend | React (Vite) |
| ⚙️ Backend  | Node.js + Express |
| 🗄️ Database | MongoDB |
| 🤖 ML       | Python + YOLO |
| 🔗 API      | REST APIs |

---

## 🔄 System Flow  

```text
User uploads image
        ↓
Frontend sends request
        ↓
Backend processes request
        ↓
ML Service (YOLO) analyzes image
        ↓
Results sent back to backend
        ↓
Stored in MongoDB
        ↓
Displayed on dashboard
