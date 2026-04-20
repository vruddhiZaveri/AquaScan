# 🌊 AquaScan

> AI-assisted aquatic waste reporting and cleanup coordination platform.

<p align="center">
  <img src="https://img.shields.io/badge/Project-AquaScan-0ea5e9?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Focus-Water%20Pollution%20Reporting-22c55e?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-f59e0b?style=for-the-badge" />
  <img src="https://img.shields.io/badge/ML-Python%20%2B%20YOLO-8b5cf6?style=for-the-badge" />
</p>

---

## Overview

AquaScan is a project focused on helping users report aquatic waste and water pollution through an image-based workflow.

The idea is simple:

- a user uploads an image of a polluted water body,
- the system sends it for AI-based analysis,
- the report is stored with location and metadata,
- and the dashboard helps track report status and cleanup flow.

This project was built as an end-to-end applied AI + full-stack system, combining frontend development, backend APIs, database integration, and a separate machine learning inference service.

---

## One-Line Pitch

**AquaScan helps turn pollution sightings into structured environmental reports using computer vision and a reporting workflow.**

---

## Architecture Diagram

<p align="center">
  <img src="./architecture-diagram.jpg" alt="AquaScan architecture diagram" width="700" />
</p>

> **Note:** This diagram represents the broader system architecture and product direction of AquaScan.  
> The current repository may contain only the parts implemented so far.

---

## What is actually used in this project

To keep this README honest and interview-safe, here is the stack separated into **currently used** and **planned / optional** parts.

### Currently used
- **Frontend:** React
- **Frontend tooling:** Vite
- **Backend:** Node.js + Express
- **ML service:** Python service for model inference
- **Modeling approach:** YOLO-based waste detection pipeline
- **Database:** MongoDB
- **API communication:** REST APIs between frontend, backend, and ML service

### Used in some parts / depending on setup
- **FastAPI** for the ML inference layer, if configured in your current implementation
- **React Native / Expo** as a planned or parallel mobile app direction
- **Cloud image storage** only if you have explicitly connected Firebase or AWS S3 in your project

### Do not claim unless fully configured in your repo
- Firebase
- AWS S3
- React Native mobile deployment
- Real-time sockets
- Production cloud deployment
- Full committee automation
- Fully reliable multi-model switching

If an interviewer asks, the safest phrasing is:

> “The current working implementation is a React + Vite frontend, Node/Express backend, MongoDB database, and a separate Python ML inference service using a YOLO-based model. The larger mobile-first and cloud-scaled architecture is part of the intended product direction.”

---

## Core Features

### User-side workflow
- Upload an image of a polluted water body
- Attach location / geotag information
- Send the image for AI-based waste analysis
- View generated report details
- Track report progress and status

### Admin / committee-side workflow
- View submitted reports
- Inspect report details
- Update report status
- Manage cleanup-related actions

### AI workflow
- Receive uploaded image
- Run detection through a YOLO-based model
- Return model output to the backend
- Convert raw model output into user-facing report fields

---

## Current Project Scope

AquaScan is currently best described as a **working prototype / academic project** rather than a fully production-ready public platform.

That means the project demonstrates:
- full-stack integration,
- model inference flow,
- report creation and storage,
- and dashboard-driven tracking concepts.

It should **not** be presented as a deployed government-grade platform unless you have actually deployed and validated those features.

---

## Tech Stack

| Layer | Current / Likely Used |
|------|------------------------|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | MongoDB |
| ML Service | Python |
| Computer Vision | YOLO-based detection |
| Image Processing | OpenCV / model preprocessing utilities |
| Mobile Direction | React Native / Expo (planned or partial) |
| Cloud Storage | Firebase or AWS S3 (only if configured) |

---

## High-Level Flow

```text
User uploads image
        ↓
Frontend sends report request
        ↓
Backend receives file + metadata
        ↓
ML service analyzes image
        ↓
Backend stores result in MongoDB
        ↓
Dashboard shows report status and details
```

---

## Repository Honesty Statement

This repository reflects a project that is being actively built and improved.

Some parts are stronger than others, and interviewers should understand the difference between:

- **implemented features**
- **prototype features**
- **planned product features**

### Implemented / partially implemented
- frontend reporting flow
- backend API structure
- database-backed report handling
- ML inference integration
- dashboard/report status concepts

### May still be under improvement
- model accuracy and calibration
- real-time synchronization between user and committee views
- chat reliability
- cleanup workflow automation
- production deployment quality
- storage pipeline hardening

This is intentional to state clearly, because the goal of the project is to show **practical systems thinking and integration ability**, not to falsely claim a finished commercial platform.

---

## Why this project matters

AquaScan demonstrates skills across multiple areas:

- applied machine learning
- computer vision integration
- API design
- full-stack development
- database-backed workflows
- product architecture thinking
- environmental problem-solving

For interviews, this makes it a strong project to discuss because it is not just a model notebook — it is a systems project.

---

## Best way to describe AquaScan in an interview

You can say:

> “AquaScan is an AI-assisted aquatic waste reporting system I built as a full-stack prototype. The project combines a React frontend, a Node/Express backend, MongoDB for report storage, and a separate Python YOLO-based inference service to analyze uploaded pollution images. The larger vision also includes committee workflows, cleanup management, and mobile-first reporting.”

That is honest, precise, and strong.

---

## Suggested interview-safe highlights

- Built a multi-service architecture connecting frontend, backend, database, and ML inference
- Integrated a YOLO-based computer vision pipeline into a user reporting workflow
- Designed the system around real-world reporting, tracking, and actionability
- Worked on bridging raw model outputs into structured application-level insights
- Explored how AI can support environmental monitoring through usable product workflows

---

## Future Improvements

- improve model accuracy on real aquatic waste scenes
- strengthen committee-side operations and report routing
- add robust real-time updates
- improve storage and deployment architecture
- ship a complete React Native mobile app
- harden analytics and cleanup coordination flows

---

## Final Note

This project is best presented as:

**“an ambitious, working full-stack AI prototype with clear real-world intent and scope for production improvement.”**

That framing is accurate and creates trust.
