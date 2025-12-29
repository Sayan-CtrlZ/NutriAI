# NutriAI

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)


## Overview
NutriAI is a sophisticated nutrition analysis platform designed to provide real-time insights into food product ingredients. Utilizing high-performance Google Gemini Large Language Models (LLMs) and computer vision, the system analyzes ingredient lists and nutritional labels to deliver a comprehensive health assessment, categorized highlights, and an interactive nutritionist chat interface.

## Technical Architecture

### Frontend
- **Framework**: React 19 (Vite-powered Single Page Application)
- **Styling**: Tailwind CSS
- **State Management**: React Context API (NutriContext)
- **Image Handling**: Custom cropping and webcam integration via `react-image-crop` and `react-webcam`.

### Backend
- **Server**: Python Flask
- **AI Engine**: Google Gemini 1.5 Series
  - Integrated multimodal analysis using Gemini 1.5 (Pro/Flash) for unified image recognition, nutritional reasoning, and conversational interaction.
- **Architecture**: Blueprint-based modular structure with service-oriented logic.

## API Documentation

### Production Base URL: `<YOUR_BACKEND_URL>`
### Local Development: `http://localhost:10000`

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | Service status and health monitoring. |
| `/samples` | `GET` | Fetches a list of standardized product samples for testing. |
| `/analyze` | `POST` | Primary analysis engine. Accepts Base64 image data or raw ingredient text. |
| `/chat` | `POST` | Stateful conversational interface for nutritional follow-ups. |

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Google Gemini API Key

### Repository Initialization
```bash
git clone https://github.com/Sayan-CtrlZ/NutriAI.git
cd nutriAI
```

### Backend Configuration
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ALLOWED_ORIGINS=<YOUR_FRONTEND_URL>,http://localhost:5173
   PORT=10000
   ```
5. Execute the server:
   ```bash
   python run.py
   ```

### Frontend Configuration
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   VITE_API_URL=<YOUR_BACKEND_URL>
   ```
4. Start the development environment:
   ```bash
   npm run dev
   ```

- **Dynamic Scoring**: A 0-100 proprietary health score based on ingredient quality.

## Production Deployment

### Backend Deployment
1. Set the following environment variables on your hosting provider:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `ALLOWED_ORIGINS`: Comma-separated list of your frontend URLs (e.g., `https://your-frontend-app.com`).
   - `PORT`: Usually `10000` or as required by your provider.
2. Set the **Health Check Path** to `/health`.

### Frontend Deployment
1. Set the following environment variable on your hosting provider:
   - `VITE_API_URL`: The URL of your deployed backend (e.g., `<YOUR_BACKEND_URL>`).
2. Build the project:
   ```bash
   npm run build
   ```

---
© 2025 **NutriAI** by **TechHackers**
