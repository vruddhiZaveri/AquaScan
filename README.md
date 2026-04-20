# 🌊 AquaScan  
### AI-Assisted Water Pollution Reporting System  

<p align="center">
  <img src="https://img.shields.io/badge/AI-Computer%20Vision-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/YOLO-Detection-green?style=flat-square" />
  <img src="https://img.shields.io/badge/FullStack-React%20%2B%20Node.js-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=flat-square" />
</p>

---

## 🧠 Overview  

AquaScan is a **full-stack AI prototype** that enables users to report water pollution through images.  

It combines:
- a **React frontend** for user interaction  
- a **Node.js backend** for processing and APIs  
- a **Python-based ML service (YOLO)** for detection  
- a **MongoDB database** for storing reports  

The goal is to convert raw pollution images into **structured, trackable reports**.

---

## ⚡ Core Idea  

> **Upload → Detect → Store → Track**

A simple pipeline where users upload images and the system transforms them into meaningful environmental reports.

---

## 🏗️ Architecture  

<p align="center">
  <img src="./architecture-diagram.jpg" width="650"/>
</p>

---

## 🔗 How It Works  

```text
Frontend (React)
      ↓
Backend (Node.js API)
      ↓
ML Service (YOLO - Python)
      ↓
Database (MongoDB)
      ↓
Back to Frontend (Dashboard)
