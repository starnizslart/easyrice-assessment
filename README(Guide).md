Easy Rice - Full Stack Developer (Intern) Assessment by Punyaphat Dangngoen
  Tech Stack
Frontend: React (Vite) + TypeScript + Tailwind CSS + React Router
Backend: Node.js + Express + TypeScript
Database: MySQL (Running inside Docker)
 Key Features Implemented
Fully functional UI matching the provided design.
Strict compliance with the provided Swagger API documentation (Input/Output payloads, camelCase variables).
Real-time calculation logic for Rice Composition and Defects based on standards.json. and raw.json
Automated Real-time date/time updates on form submission and editing.
Functional search and date-range filters on the History page.
Migrated the database to MySQL via Docker for an enterprise-ready environment.
How to Run the Project Locally
Prerequisites
Please ensure you have the following installed on your machine:
Node.js (v16 or higher)
Docker Desktop (Must be running)

Step 1: Start the MySQL Database (Docker)
Open your terminal in the root folder of the project (rice-inspection-app) and run:

docker compose up -d       <<<<<<

Note: This will pull the MySQL 8.0 image and start a container mapped to port 3306. The database easyrice_db and tables will be auto-initialized by the backend.


Step 2: Start the Backend Server
Open a new terminal window, navigate to the backend folder, install dependencies, and start the server:

cd backend

npm install

npx ts-node src/index.ts

The backend server will run at http://localhost:3000

Step 3: Start the Frontend Application
Open another new terminal window, navigate to the frontend folder, install dependencies, and start the dev server:

cd frontend

npm install

npm run dev

The frontend application will be accessible at http://localhost:5173
Important Note for Testing
Please ensure the Backend server is running and Docker is active before testing the Frontend UI, as the APIs rely on the MySQL database connection.

