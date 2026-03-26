# 🎓 InternMatch – Smart Internship Matching Platform

## 📌 Overview
InternMatch is a microservices-based platform that connects Cameroonian students with internship opportunities.  
Students upload CVs, companies post offers, and a smart matching engine uses AI to recommend the best fits based on skills, location, and academic background.  

The platform solves the critical problem of unstructured internship hunting in Cameroon, where opportunities are often found through personal networks rather than merit. By digitizing and automating the matching process, we increase access, transparency, and efficiency for both students and companies.

## 🎯 Goals
- Provide a scalable, resilient platform using microservices.
- Implement skill‑based semantic matching (beyond simple keyword search).
- Support local constraints (low bandwidth, mobile money integration).
- Create a feedback loop for universities to adapt curricula to market needs.

## 🏗️ Architecture (Microservices)
The system is decomposed into the following independent services:

| Service | Responsibility |
|--------|----------------|
| **User Service** | Student & company registration, authentication (JWT), profile management |
| **CV Service** | Upload, storage (S3/MinIO), parsing (text extraction from PDF/DOCX) |
| **Offer Service** | CRUD for internship offers, search, filters |
| **Matching Service** | AI/NLP engine that compares CV skills with offer requirements, returns ranked matches |
| **Application Service** | Manages internship applications (apply, withdraw, status tracking) |
| **Notification Service** | Sends emails/SMS (Twilio) for match alerts, application updates |
| **API Gateway** | Single entry point (Kong / Spring Cloud Gateway) routing requests, authentication |
| **Service Registry** | Eureka / Consul for service discovery |

Each service has its own database (polyglot persistence) and communicates via REST (synchronous) and RabbitMQ (asynchronous).

## 🛠️ Tech Stack
- **Backend**: Java (Spring Boot) / Node.js (Express) – mix to show polyglot capability  
- **Frontend**: React / Next.js (optional but recommended)  
- **Databases**: PostgreSQL (User, Offer), MongoDB (Matching), Redis (caching)  
- **Message Broker**: RabbitMQ / Apache Kafka  
- **Containerization**: Docker + Docker Compose  
- **Orchestration**: Kubernetes (if advanced)  
- **Cloud**: AWS / DigitalOcean (or local MinIO for storage)  
- **CI/CD**: GitHub Actions  

## 🚀 Features
- ✅ Secure authentication (JWT)  
- ✅ CV upload with automatic skill extraction  
- ✅ Company dashboard to post and manage offers  
- ✅ Smart matching using word embeddings (e.g., spaCy)  
- ✅ Real‑time notifications when a new match is found  
- ✅ Mobile money payment integration (MTN/O–Money) for premium listings  
- ✅ Analytics dashboard (optional) showing skill demand trends  

## 📁 Repository Structure
This project is organized as a **monorepo** for simplicity, but each microservice can be deployed independently.
