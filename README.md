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

### Base URL: `http://localhost:5000`

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
   PORT=5000
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
3. Start the development environment:
   ```bash
   npm run dev
   ```

## Key Capabilities
- **Real-time Product Scanning**: Automated ingredient extraction from product packaging images using Gemini Vision capabilities.
- **Categorized Ingredient Analysis**: Identifying ingredients by health impact (Positive, Neutral, Negative).
- **Context-Aware Nutritionist**: An AI assistant that understands the current analysis results for highly specific advice.
- **Dynamic Scoring**: A 0-100 proprietary health score based on ingredient quality.

---
© 2025 **NutriAI** by **TechHackers**
