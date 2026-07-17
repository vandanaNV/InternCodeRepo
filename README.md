Project Completion Report
NV Ledger — Employee Management & Attendance System with Integrated AI Chatbot
1. Project Overview
NV Ledger is a full-stack Employee Management System (EMS) built to digitize and streamline core HR operations — attendance tracking, leave and work-from-home (WFH) approvals, task assignment, daily work updates, performance ratings, and holiday management — for three user roles: Admin, Manager, and Employee. The system exposes a secure REST API backend and a role-based single-page web frontend, and embeds an AI-powered HR assistant chatbot to help employees get instant answers to policy and process questions without raising a ticket.
Alongside the main product, a standalone Chatbot module (Spring AI + Ollama/Groq) was also built and integrated, giving the EMS a conversational assistant capable of handling both text and image-based queries.
2. Objectives
•	Replace manual, spreadsheet-based attendance and leave tracking with a centralized, auditable system.
•	Provide role-specific dashboards and workflows for Admin, Manager, and Employee.
•	Secure the application with token-based authentication and role-based access control.
•	Automate routine HR communication (OTP, notifications) via email integration.
•	Reduce repetitive HR queries by embedding an AI chatbot trained on company policy.
•	Generate attendance/report exports in standard office formats (Excel, PDF).
3. Technology Stack
Layer	Technologies Used
Backend	Java, Spring Boot 3.5, Spring Security, Spring Data JPA, JWT (JJWT), Spring Mail
Database	MySQL (JPA/Hibernate ORM, auto DDL update)
Frontend	React (Vite), React Router, Axios, Tailwind CSS, Context API for auth state
AI / Chatbot	Spring AI framework, Ollama-compatible OpenAI API client, Groq cloud LLM (Llama 3.3 70B / Llama-4 Scout vision model)
Reporting	Apache POI (Excel export), Apache PDFBox (PDF export)
DevOps / Tools	Maven, Git/GitHub, dotenv-based config, CORS-configured deployment (Render-ready)
4. System Architecture & Modules
4.1 Backend (Spring Boot REST API)
•	Authentication & Security: JWT-based login, role-based route protection (Admin / Manager / Employee), OTP-based password reset via email
•	Core Modules: Employee, Attendance, Leave, WFH, Task, Rating, Holiday, and Daily Update entities with dedicated repositories and services
•	API Layer: Separate REST controllers for Admin, Manager, and Employee operations, keeping role responsibilities isolated
•	Reporting: AttendanceReportService generates Excel/PDF attendance summaries for managers and admins
4.2 Frontend (React + Vite)
•	Structure: Role-aware routing (Admin / Manager / Employee dashboards) guarded by AuthContext
•	Pages: Overview, Attendance, Leave, WFH, Tasks, Ratings, Teams, and Holidays pages per role
•	Chat Integration: A floating ChatWidget component embedded across the app for the AI HR assistant
4.3 AI Chatbot Module
Two chatbot implementations exist across the project, both HR-assistant focused:
•	Embedded EMS Chatbot: Built directly into the Ledger backend (ChatController/ChatService) using Groq's OpenAI-compatible chat-completions API. It uses a fixed system prompt containing company HR FAQs (working hours, leave policy, WFH rules, attendance rules, ratings, tasks) so it answers employee questions grounded in actual company policy instead of hallucinating.
•	Standalone Spring AI Chatbot: A standalone Spring AI-based chatbot service (spring-ai-chatbot) with its own frontend, built on Spring AI's ChatClient abstraction over an Ollama-compatible endpoint. It supports multi-turn conversation history and routes image-attached queries to a vision-capable model, enabling employees to ask questions using screenshots or photos in addition to text.
Together, these give the EMS a self-service layer: employees get instant, policy-grounded answers, reducing repetitive queries to HR/Admin staff.
5. Key Features Delivered
•	Secure JWT authentication with role-based dashboards for Admin, Manager, and Employee
•	Daily attendance punch-in/out with automatic half-day detection
•	Leave and WFH request-approval workflows with manager sign-off
•	Task assignment and tracking (Pending / In Progress / Completed)
•	Manager-driven performance ratings visible to employees
•	Company holiday calendar management
•	Excel/PDF attendance report generation
•	Email-based OTP password reset flow
•	AI chatbot for instant HR policy Q&A, including image-based queries
6. Challenges & Learnings
•	Designing a single JWT + role hierarchy that cleanly separated Admin, Manager, and Employee permissions across dozens of REST endpoints
•	Grounding the chatbot's responses in real company policy (via system prompt) to prevent it from fabricating HR answers
•	Handling multi-modal (text + image) chat requests by conditionally routing to a vision model only when an image was attached, to control cost and latency
•	Structuring the React frontend so the same components could adapt across three different role-based views
7. Conclusion & Future Scope
The NV Ledger project successfully delivers a production-style Employee Management System covering the full attendance-to-performance lifecycle, secured with JWT-based auth and backed by a MySQL database, along with an integrated AI chatbot that gives employees instant, policy-grounded support. The modular backend/frontend/chatbot separation makes the system straightforward to extend.
Future scope includes: persisting chatbot conversation history per employee, adding push/email notifications for approvals, biometric/geo-fenced attendance capture, and expanding the chatbot's knowledge base to cover payroll and onboarding queries.
