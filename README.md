# AI Placement Preparation Agent

A full-stack, AI-powered placement preparation platform. The platform serves as a multi-agent career prep dashboard, optimizing student workflows by consolidating resume reviews, learning roadmap tracking, competitive programming recommendations, and simulated mock interviews into a single, cohesive glassmorphic web dashboard.

---

## System Architecture

The application is structured as a decoupled full-stack system:

- **Frontend**: Single Page Application built on React 18, utilizing Tailwind CSS for glassmorphic styling design, Lucide Icons, Zustand for global auth management, Recharts for statistics dashboards, and Framer Motion for UI entrance transitions.
- **Backend**: Spring Boot 3.2.0 REST API powered by Hibernate/Spring Data JPA connecting to a MySQL 8 database. Integrates JWT validation filters, Apache PDFBox text extraction utilities, and native WebClient HTTP integration with the Google Gemini API.
- **Database**: MySQL 8.0 schema storing structured records for users, resumes, skills list, mock interview transcripts, learning roadmap weekly tasks, and chat conversations.

---

## Features

1. **Resume Review Agent**: Parses uploaded PDFs, rates ATS score compatibility, flags missing keywords, and displays recommendations.
2. **Skill Gap Agent**: Analyzes current inventory competencies and lists missing ones alongside custom learning roadmap timelines.
3. **Mock Interview Agent**: Simulates technical/behavioral chat interviews (Java, SQL, Spring Boot, HR) and rates answer responses on a scale from 1 to 10 with written feedback.
4. **Coding Mentor Agent**: Recommends next algorithmic problems and customizes daily practice planners.
5. **Multi-Agent Chat**: Connects users to specialized AI bots for interactive career tutoring.

---

## Local Setup Instructions

### Prerequisites
- JDK 17
- Node.js 18+
- MySQL 8.0 or Docker

### Run with Docker Compose
1. Ensure your Gemini API Key is set in your environment:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key-here"
   ```
2. Launch the full-stack container services:
   ```bash
   docker-compose up --build
   ```
3. Open `http://localhost:5173` to access the application.

### Manual Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Configure database credentials inside `src/main/resources/application.properties` or set them as environment variables.
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Manual Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web dashboard via `http://localhost:5173`.
