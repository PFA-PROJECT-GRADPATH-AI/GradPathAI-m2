# GradPath AI — GradPath: Discovery, Eligibility & AI Research Matching Engine

Standalone implementation for **GradPath** of the GradPath AI platform.

## Architecture & Frameworks

- **Backend Framework:** **ASP.NET Core Web API (C# / .NET 8)**
  - **ORM & Database:** Entity Framework Core (EF Core) with SQLite (`gradpath.db`)
  - **Authentication:** ASP.NET Core Identity with Cookie Authentication (`/api/v1/auth/*`)
  - **Structured Logging:** Serilog with Console & Daily Rolling File sinks (`logs/gradpath-log-*.txt`)
- **Frontend Framework:** **React + Vite (JavaScript / JSX)** Single-Page Application (SPA)
  - Plum, coral, and violet theme UI with Lucide icons
  - Reverse proxy to backend API (`http://localhost:5000`)
- **Single implemented use case:**
  1. **M2-UC03 + M2-UC04:** A student signs in, enters eligibility and research criteria, receives explainable professor/program rankings, and approves a ranked lead as an `ApprovedLead v1` contract.
  2. **Strategy Pattern (`IMatchScoringStrategy` / `WeightedResearchFitStrategy`):** Implements the weighted fit formula:
     $$S = 0.40R + 0.25K + 0.15P + 0.10F + 0.10I$$
  3. **Cookie authentication:** Standalone register, login, current-user, and logout endpoints protect the workflow entry point.

The separate catalog crawling/demo use case is intentionally not exposed or registered in this implementation.

---

## Quick Start

### 1. Run the Backend API (.NET 8)
```bash
cd backend/GradPath.Api
dotnet run --urls "http://localhost:5000"
```
- **Swagger / OpenAPI UI:** `http://localhost:5000/swagger`
- **Serilog Logs:** `backend/GradPath.Api/logs/`

### 2. Run the React Frontend (Vite)
```bash
cd frontend
npm run dev
```
- Open `http://localhost:5173` in your browser.

### 3. VS Code F5 Debugging & REST Client
- Open the workspace in **VS Code**.
- Press `F5` to build and launch the API with automatic Swagger launch via `.vscode/launch.json` and `.vscode/tasks.json`.
- Test all API endpoints in VS Code using `backend/GradPath.Api/GradPath.Api.http`.
# GradPathAI-m2
