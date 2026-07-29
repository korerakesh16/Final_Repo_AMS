# Production Deployment Roadmap & Requirements

This document outlines the step-by-step integration changes and infrastructure requirements needed to transition the **IT Asset Management System** from its current browser-only simulation (Vite Frontend + LocalStorage, FastAPI backend stub) to a secure, reliable, and scalable production deployment.

---

## 1. Project Current State vs. Production Requirements

The following matrix highlights what exists today versus what must be implemented before deploying the project to a live server:

| Feature / Layer | Current Development State (Local Mock) | Required Production State (Enterprise Deploy) |
| :--- | :--- | :--- |
| **Data Persistence** | Browser `LocalStorage` (resides in individual browsers, limit ~5MB). | Relational Database (**PostgreSQL**) hosted on a persistent server. |
| **Data Sync** | None. Actions by one administrator are invisible to other administrators. | Multi-user sync via real-time database transactions and REST APIs. |
| **Backend Integration**| FastAPI directories exist as stubs/blueprints. | Active REST API endpoints querying a live database. |
| **Authentication** | Plain text password checking on local mock state. | Secure JWT (JSON Web Tokens) with hashed password checking (bcrypt). |
| **Security** | None. Admin pages accessible without server authorization. | Role-Based Access Control (RBAC) validated on the backend. |

---

## 2. Phase 1: API Integration Requirements (Swapping LocalStorage)

To connect the React frontend with the FastAPI backend, we must write active API routes and replace local mocks.

### A. Backend Code Tasks (FastAPI)
1. **Database Models (`backend/app/models/`):**
   - Create SQLAlchemy models for `Asset`, `Employee`, `Category`, `RepairTicket`, and `ActivityLog`.
2. **API Endpoint Routers (`backend/app/routers/`):**
   - Implement HTTP routes for asset assignments (`/api/assets`), returns (`/api/returns`), repairs (`/api/repairs`), category hierarchies (`/api/categories`), and log filters.
3. **Schemas (`backend/app/schemas/`):**
   - Define Pydantic request/response structures to ensure strict data parsing and validation.

### B. Frontend Code Tasks (React)
1. **HTTP Client setup:**
   - Install `axios` or configure native `fetch`.
2. **Replace Local Hook Actions in `useAssetManager.jsx`:**
   - Change local array mutations to dynamic backend API calls:
   ```javascript
   // Example Change: Swapping Local Add Asset with Server Post Request
   const addAsset = async (newAsset) => {
     try {
       const response = await axios.post(`${API_BASE_URL}/assets`, newAsset);
       setAssets(prev => [...prev, response.data]);
       showToast("Asset added successfully", "success");
     } catch (err) {
       showToast("Failed to add asset", "error");
     }
   };
   ```

---

## 3. Phase 2: Security & Authentication Requirements

Production environments must guard database access and protect API endpoints from unauthorized execution.

1. **CORS Configuration (Cross-Origin Resource Sharing):**
   - In `backend/main.py`, configure FastAPI `CORSMiddleware` to allow requests strictly from your production frontend URL (e.g. `https://assets.yourcompany.com`).
2. **JWT Authentication:**
   - Establish token verification. Every administrative API request must carry a Bearer JWT Token (`Authorization: Bearer <token>`) in the header.
3. **Password Security:**
   - Hash administrator passwords using **bcrypt** before writing them to the database. Never store raw admin credentials in database records.

---

## 4. Phase 3: Infrastructure & Server Requirements

For deployment, you will need a cloud platform (AWS, GCP, Azure, DigitalOcean, or Render).

```mermaid
graph TD
    User[Admin Web Browser] -->|HTTPS| WebServer[Frontend Host: Vercel / Nginx]
    User -->|API Requests| API_Gateway[Nginx Reverse Proxy / Load Balancer]
    API_Gateway -->|Port 8000| BackendServer[FastAPI App Server / Docker]
    BackendServer -->|Port 5432| DB[(PostgreSQL Database Server)]
```

### A. Server Instances (Compute)
- **Minimum Specs (for small to medium enterprise):**
  - Frontend: Can be deployed on static hosts like **Vercel**, **Netlify**, or **AWS S3 + CloudFront**.
  - Backend: 1 vCPU, 2GB RAM server instance (e.g. AWS EC2 t3.small or DigitalOcean droplet).
- **Production Standard:**
  - Run the FastAPI application inside Docker containers behind an **Nginx** reverse proxy to handle SSL termination.

### B. Database Instance (Storage)
- **Database Engine:** PostgreSQL 15+.
- **Recommended Setup:** Managed database service (e.g. AWS RDS PostgreSQL or Supabase) to handle automated daily backups, encryption-at-rest, and system maintenance.

---

## 5. Step-by-Step Deployment Instructions

Below is the standard checklist to deploy both applications:

### Step 1: Containerize the Backend (Dockerfile)
Create a `Dockerfile` in the `/backend` folder:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 2: Build the Frontend Production Bundle
Run the production build command inside the `/frontend` directory:
```bash
npm run build
```
This generates a highly optimized `/dist` folder containing `index.html` and assets. Copy the contents of this folder to your web server (e.g., Vercel, AWS S3, or Nginx directory `/var/www/html`).

### Step 3: Run the Services
1. **Spin up your Database Server (PostgreSQL)** and configure environment variables on your server:
   - `DATABASE_URL=postgresql://user:password@localhost:5432/asset_db`
   - `JWT_SECRET=your_super_secret_key`
2. **Start the FastAPI container** on the host server:
   ```bash
   docker build -t asset-backend ./backend
   docker run -d -p 8000:8000 --env-file .env asset-backend
   ```
3. **Configure SSL / HTTPS Certificate** on your Nginx server or reverse proxy using Let's Encrypt / Certbot to ensure all client data is fully encrypted.
