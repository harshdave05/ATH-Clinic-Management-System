# ATH Clinic Management System

A full-stack clinic management application built during a one-month
internship at **ATH Technologies, Pandeypur, Varanasi**. The system
helps a clinic manage patients, doctors, appointments, visits,
prescriptions, medicines, and staff accounts through a role-based
interface.

## Features

-   **Authentication:** Login using email and password, JWT-based
    authentication, and password hashing.
-   **Role-based access:** Separate access and permissions for Admin,
    Doctor, and Receptionist.
-   **Dashboard:** Role-specific overview and clinic information.
-   **Patient management:** Create, view, update, and manage patient
    records.
-   **Doctor management:** Manage doctor details and availability.
-   **Appointment management:** Schedule and manage appointments,
    validate appointment slots, and track appointment status.
-   **Visit management:** Record and update visit details, including
    symptoms, diagnosis, and notes. Each appointment can have one visit.
-   **Prescription management:** Create and update prescriptions and
    their medicine items.
-   **Medicine management:** Manage medicine details and stock
    information.
-   **User management:** Admin can create and update staff accounts and
    deactivate or reactivate users.

## Technology Stack

  Layer                Technologies
  -------------------- ------------------------------------
  Frontend             React.js, JavaScript, HTML, CSS
  Frontend tooling     Vite
  HTTP communication   Axios
  Backend              C#, ASP.NET Core Web API (.NET 10)
  Database             Microsoft SQL Server
  ORM                  Entity Framework Core
  Authentication       JSON Web Tokens (JWT)
  Password security    ASP.NET Core PasswordHasher

## Application Architecture

``` text
React.js Frontend
       |
       | HTTP requests (Axios)
       v
ASP.NET Core Web API
       |
       | Entity Framework Core
       v
Microsoft SQL Server
```

The frontend sends HTTP requests to the backend API. The API validates
requests, applies business rules and authorization, and uses Entity
Framework Core to access SQL Server. The API returns responses to the
frontend, which updates the interface.

## User Roles

  -----------------------------------------------------------------------
  Role                                Main permissions
  ----------------------------------- -----------------------------------
  **Admin**                           Manages the overall system,
                                      including doctors, users,
                                      medicines, patients, appointments,
                                      visits, and prescriptions.

  **Doctor**                          Views their appointments and
                                      manages their visits and
                                      prescriptions, subject to
                                      authorization rules.

  **Receptionist**                    Manages patient records and
                                      appointments.
  -----------------------------------------------------------------------

Access is enforced on the backend. Hiding a frontend menu item is not
treated as a security control.

## Project Structure

``` text
ATH-Clinic-Management-System/
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
├── server/
│   └── ATHClinic.API/
│       ├── Controllers/
│       ├── Data/
│       ├── Models/
│       ├── Program.cs
│       └── ATHClinic.API.csproj
└── README.md
```

## Prerequisites

Install the following before running the application:

-   Windows, macOS, or Linux
-   .NET 10 SDK
-   Node.js and npm
-   Microsoft SQL Server (with a database created and configured for
    this application)

## Run Locally

### 1. Clone the repository

``` bash
git clone https://github.com/harshdave05/ATH-Clinic-Management-System.git
cd ATH-Clinic-Management-System
```

### 2. Configure the backend

Open a terminal in the backend project directory:

``` bash
cd server/ATHClinic.API
dotnet restore
```

Configure the SQL Server connection string and JWT settings using **.NET
User Secrets** or another secure configuration provider. Use the
configuration keys expected by the application's `Program.cs` and
authentication code.

For local development, the API is configured to use:

``` text
http://localhost:5218
```

The SQL Server database must be available and its schema must match the
application's Entity Framework Core models. Do not commit passwords, JWT
signing keys, production connection strings, or other secrets to source
control.

Start the backend:

``` bash
dotnet run
```

### 3. Configure and run the frontend

Open a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open the Vite development URL shown in the terminal. The frontend's
Axios configuration uses:

``` text
http://localhost:5218/api
```

If you change the backend URL or frontend origin, update the API base
URL and backend CORS configuration accordingly.

## Security Notes

-   Passwords are hashed before being stored.
-   JWTs are used to authenticate API requests.
-   Role-based authorization is enforced by backend endpoints.
-   The frontend stores the access token in `sessionStorage` and Axios
    attaches it to API requests.
-   Keep development secrets in .NET User Secrets or environment
    variables.
-   Never publish real user credentials, database passwords, JWT signing
    keys, or private patient information.

## Main Concepts Demonstrated

-   Full-stack application development
-   React components and Hooks (`useState`, `useEffect`)
-   RESTful API design and HTTP methods
-   CRUD operations
-   Entity Framework Core and relational database relationships
-   JWT authentication and role-based authorization
-   Server-side validation and error handling
-   Frontend-to-backend integration using Axios

## Internship

**Organization:** ATH Technologies, Pandeypur, Varanasi\
**Duration:** 4 June 2026 -- 4 July 2026\
**Project:** ATH Clinic Management System

------------------------------------------------------------------------

This project was developed as an internship project for learning and
demonstrating full-stack web application development.
