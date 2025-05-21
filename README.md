# 🧠 Chatbot PDF Analyzer with Supabase & Gemini API

This is a full-stack web application built with **Next.js**, **Supabase**, and **Google’s Gemini AI API**. It allows users to authenticate, upload PDFs, and interact with them using a powerful chatbot interface that understands and responds to questions based on the PDF content.

---

## ✨ Features

- 🔐 User authentication with Supabase Auth
- 📄 PDF upload & storage using Supabase Storage
- 💬 Chat interface powered by Google's Gemini AI
- 🧠 Intelligent responses based on PDF content
- 🗃️ Chat history stored securely in Supabase Database

---

## 🛠️ Tech Stack

| Layer        | Tech Used                        |
|--------------|----------------------------------|
| Frontend     | Next.js, Tailwind CSS            |
| Backend/API  | Supabase (Auth, DB, Storage)     |
| AI           | Google Gemini API                |
| Database     | PostgreSQL (via Supabase)        |

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/chatbot-pdf-analyzer.git
cd chatbot-pdf-analyzer
2. Install dependencies
bash
Copy
Edit
npm install
3. Set up environment variables
Create a .env.local file and add the following:

env
Copy
Edit
DATABASE_URL=your_supabase_database_url
GEMINI_API_KEY=your_google_ai_studio_api_key
📝 Replace your_supabase_database_url and your_google_ai_studio_api_key with your actual credentials.

4. Run the development server
bash
Copy
Edit
npm run dev
Visit http://localhost:3000 in your browser.

📚 How to Get the Keys
🔗 Supabase DATABASE_URL
Go to https://supabase.com/dashboard/projects

Open your project → Click "Connect" (top right)

Under “Connection string” → “Transaction pooler”, copy the postgres://... URL

Replace [YOUR-PASSWORD] in the URL with your actual database password from the project settings

🔐 Gemini API Key
Go to Google AI Studio

Sign in with your Google account

Create or copy your existing API key
