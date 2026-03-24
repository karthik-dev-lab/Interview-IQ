# 🚀 InterviewIQ — AI-Powered Interview Intelligence Platform

InterviewIQ is a full-stack AI-powered platform that helps candidates prepare for interviews and generate optimized resumes tailored to job descriptions.

---

## 🌟 Features

* 🔐 **Authentication System**

  * JWT-based login & registration
  * Secure logout with token blacklisting

* 🤖 **AI Interview Report Generator**

  * Generates:

    * Technical Questions
    * Behavioral Questions
    * Skill Gaps
    * Preparation Plan
  * Prompt-engineered for structured and reliable output

* 📄 **AI Resume Generator**

  * Generates ATS-friendly resumes
  * Converts HTML → PDF using Puppeteer

* ⚙️ **Robust AI Handling**

  * Prompt-controlled responses
  * Retry mechanism for failed outputs
  * JSON cleaning & validation

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Vite
* Axios
* Context API

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

### AI Integration

* Google Gemini API

### Other Tools

* Puppeteer (PDF generation)
* Multer (file uploads)

---

## 🧠 System Architecture

User → Frontend (React) → Backend (Node/Express) → AI (Gemini) → Database (MongoDB)

---

## 🔐 Authentication Flow

1. User logs in → JWT stored in cookies
2. Middleware verifies token on each request
3. Token blacklist prevents reuse after logout

---

## ⚡ Key Challenges Solved

* ❌ Inconsistent AI responses
  → ✅ Solved using prompt engineering + retry + validation

* ❌ Stateless JWT logout issue
  → ✅ Implemented token blacklisting

* ❌ AI JSON formatting errors
  → ✅ Cleaned & parsed responses safely

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-username/interview-iq.git
cd interview-iq
```

---

### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

---

### 3. Environment Variables

Create a `.env` file in backend:

```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_GENAI_API_KEY=your_api_key
```

---

### 4. Run the Project

#### Backend

```bash
npm run dev
```

#### Frontend

```bash
npm run dev
```

---

## 🌍 Deployment

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---

## 📌 Future Improvements

* Dashboard for tracking reports
* Resume templates & themes
* AI feedback scoring system
* Real-time mock interviews

---

## 👨‍💻 Author

**Karthik K**
Full Stack Developer

---

## 💡 Project Vision

InterviewIQ is designed to go beyond basic tools and act as an **AI career assistant**, helping candidates understand their gaps, prepare effectively, and improve their chances of getting hired.

---
