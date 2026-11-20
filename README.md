# ATH Clinic Management System

```{=html}
<p align="center">
```
`<strong>`{=html}A Full-Stack Clinic Operations Management
Application`</strong>`{=html}`<br>`{=html} React.js · ASP.NET Core Web
API · C# · Entity Framework Core · Microsoft SQL Server
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<a href="https://github.com/harshdave05/ATH-Clinic-Management-System">`{=html}GitHub
Repository`</a>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## 1. Project Overview

**ATH Clinic Management System** is a full-stack web application
developed to support the day-to-day administrative and clinical
workflows of a clinic. It provides a centralized interface for managing
patient records, doctors, appointments, consultations, prescriptions,
medicines, and staff accounts.

The application follows a client-server architecture. The React frontend
communicates with an ASP.NET Core Web API through HTTP requests. The
backend applies business rules, validates requests, enforces
authentication and role-based permissions, and accesses Microsoft SQL
Server through Entity Framework Core.

The system has three application roles:

-   **Admin** --- manages clinic operations and staff access.
-   **Doctor** --- accesses assigned appointments and manages relevant
    visits and prescriptions.
-   **Receptionist** --- manages patient information and appointment
    workflows.

The application was built as an internship project at **ATH
Technologies, Pandeypur, Varanasi**, during **4 June 2026 to 4 July
2026**.

## 2. Objectives

The main objectives of the project are to:

-   Organize clinic information in a centralized system.
-   Reduce dependence on manual registers and disconnected records.
-   Make patient and appointment information easier to access.
-   Support the workflow from appointment scheduling to visit recording
    and prescription creation.
-   Provide role-specific access for administrative and clinical staff.
-   Maintain data consistency through validation and relational database
    constraints.
-   Demonstrate practical full-stack application development and
    frontend/backend integration.

## 3. Key Features

### Authentication and Access Control

-   Login using registered email and password.
-   JWT-based authentication for protected API requests.
-   Password hashing using ASP.NET Core's `PasswordHasher`.
-   Role-based authorization for Admin, Doctor, and Receptionist.
-   Active-account checks during login.
-   Protected frontend routes and role-specific navigation, with
    permissions enforced by the backend.

### Dashboard

-   Role-specific dashboard navigation.
-   Summary information and recent appointment data based on the
    signed-in user's access.
-   Separate workflows for administrative, doctor, and receptionist
    users.

### Patient Management

-   Create, view, and update patient records.
-   Store details such as name, gender, date of birth, contact
    information, address, and blood group.
-   Apply role-based restrictions to patient operations.

### Doctor Management

-   Maintain doctor profiles and professional details.
-   Store specialization, qualification, contact information,
    consultation fee, and availability.
-   Associate a doctor profile with a staff user account where
    applicable.

### Appointment Management

-   Schedule and manage patient appointments with doctors.
-   Store appointment date, time, reason, and status.
-   Validate appointment information and doctor availability.
-   Check for conflicting appointment slots.
-   Support appointment status tracking, including Scheduled, Completed,
    and Cancelled.
-   Display appointments in chronological order.

### Visit Management

-   Record symptoms, diagnosis, notes, and visit date.
-   Associate a visit with its appointment.
-   Enforce the rule that an appointment can have only one visit.
-   Allow authorized users to update visit information.

### Prescription Management

-   Create and update prescriptions associated with visits.
-   Add prescription items with medicine, dosage, frequency, duration,
    quantity, and instructions.
-   Retrieve prescription details together with their associated
    medicine information.

### Medicine Management

-   Maintain medicine name, manufacturer, description, unit price, stock
    quantity, and active status.
-   Validate medicine price and stock values.
-   Restrict medicine management operations to authorized staff.
-   Prevent deletion of a medicine that is already referenced by
    prescription items; deactivation can be used instead.

### Staff and Role Management

-   Create and update staff accounts.
-   Assign roles to users.
-   Deactivate and reactivate accounts.
-   Prevent an administrator from deactivating their own currently
    logged-in account or changing their own role through the protected
    workflow.
-   Protect built-in roles and prevent deletion of roles that are still
    assigned to users.

## 4. Technology Stack

  -----------------------------------------------------------------------
  Layer / Purpose         Technology              Usage
  ----------------------- ----------------------- -----------------------
  Frontend                React.js                Builds the interactive
                                                  user interface and
                                                  reusable components.

  Frontend language       JavaScript              Implements client-side
                                                  logic and interactions.

  UI structure and        HTML and CSS            Defines page structure,
  styling                                         layout, and responsive
                                                  styling.

  Frontend development    Vite                    Runs the development
  and build tool                                  server and builds the
                                                  frontend.

  HTTP client             Axios                   Sends requests from the
                                                  frontend to the backend
                                                  API.

  Backend language        C#                      Implements server-side
                                                  logic, validation, and
                                                  controllers.

  Backend framework       ASP.NET Core Web API    Exposes REST API
                          (.NET 10)               endpoints and handles
                                                  HTTP requests.

  ORM                     Entity Framework Core   Maps application models
                                                  to relational database
                                                  records.

  Database                Microsoft SQL Server    Stores clinic,
                                                  appointment,
                                                  prescription, and user
                                                  data.

  Authentication          JSON Web Token (JWT)    Authenticates users on
                                                  protected API requests.

  Password security       ASP.NET Core            Hashes and verifies
                          PasswordHasher          user passwords.

  API communication       HTTP / JSON             Transfers data between
                                                  the frontend and
                                                  backend.
  -----------------------------------------------------------------------

## 5. System Architecture

The application uses a layered client-server architecture:

``` text
+--------------------------------------------------+
|                 React.js Frontend                |
|  Login | Dashboard | Patients | Appointments     |
|  Doctors | Visits | Prescriptions | Medicines    |
|  Users                                             |
+-------------------------+------------------------+
                          |
                          | HTTP requests / JSON
                          | Axios + JWT Bearer token
                          v
+--------------------------------------------------+
|             ASP.NET Core Web API                 |
|                                                  |
|  Controllers | Validation | Business Rules       |
|  Authentication | Role-Based Authorization      |
+-------------------------+------------------------+
                          |
                          | Entity Framework Core
                          v
+--------------------------------------------------+
|                SQL Server Database               |
|                                                  |
| Patients | Doctors | Appointments | Visits       |
| Prescriptions | PrescriptionItems | Medicines   |
| Users | Roles                                      |
+--------------------------------------------------+
```

### Request and Response Flow

1.  A user performs an action in the React application, such as opening
    the patient list or submitting a new appointment.
2.  The frontend uses Axios to send an HTTP request to the corresponding
    API endpoint.
3.  For protected requests, the Axios request interceptor attaches the
    access token in the `Authorization: Bearer <token>` header.
4.  ASP.NET Core middleware validates the token and the endpoint's
    authorization requirements.
5.  The controller validates the request and applies the relevant
    business rules.
6.  Entity Framework Core performs the required database operation
    against SQL Server.
7.  The API returns an HTTP status code and, where applicable, JSON
    data.
8.  React updates the displayed interface based on the response.

## 6. User Roles and Permissions

The system uses role-based authorization to control access to
application features.

  ---------------------------------------------------------------------------
  Feature                Admin              Doctor           Receptionist
  --------------- ------------------- ------------------- -------------------
  Dashboard               Yes                 Yes                 Yes

  Patient records       Manage         Authorized access        Manage
                                        to own patients   

  Doctor records        Manage           No management            No
                                            access        

  Appointments          Manage           Access to own          Manage
                                         appointments     

  Visits                Manage         Manage authorized          No
                                            visits        

  Prescriptions         Manage         Manage authorized          No
                                         prescriptions    

  Medicines             Manage               View                 No

  Staff users           Manage                No                  No

  Roles                 Manage                No                  No
  ---------------------------------------------------------------------------

> Permissions are enforced by backend authorization policies and
> controller/action attributes. The frontend also adjusts navigation and
> available actions according to the signed-in user's role.

## 7. Main Application Modules

  -----------------------------------------------------------------------
  Module                              Responsibility
  ----------------------------------- -----------------------------------
  `AuthController`                    Handles login and JWT token
                                      generation.

  `PatientsController`                Handles patient record operations.

  `DoctorsController`                 Handles doctor record operations.

  `AppointmentsController`            Handles appointment operations and
                                      scheduling validations.

  `VisitsController`                  Handles visit records associated
                                      with appointments.

  `PrescriptionsController`           Handles prescription records.

  `PrescriptionItemsController`       Handles individual medicine items
                                      in prescriptions.

  `MedicinesController`               Handles medicine information and
                                      stock-related data.

  `UsersController`                   Handles staff account management.

  `RolesController`                   Handles role management.
  -----------------------------------------------------------------------

## 8. Database Design

The application uses Microsoft SQL Server as its relational database.
Entity Framework Core provides the object-relational mapping between C#
models and database tables.

### Main Entities

  -----------------------------------------------------------------------
  Entity                              Purpose
  ----------------------------------- -----------------------------------
  `Patients`                          Stores patient details and contact
                                      information.

  `Doctors`                           Stores doctor profiles and
                                      availability.

  `Appointments`                      Stores scheduled appointments and
                                      their status.

  `Visits`                            Stores symptoms, diagnosis, notes,
                                      and visit information.

  `Prescriptions`                     Stores prescription-level
                                      information for a visit.

  `PrescriptionItems`                 Stores medicines and their
                                      prescribed dosage details.

  `Medicines`                         Stores medicine details, price, and
                                      stock quantity.

  `Users`                             Stores staff account information
                                      and password hashes.

  `Roles`                             Stores application roles and their
                                      descriptions.
  -----------------------------------------------------------------------

### Important Relationships

-   An appointment is associated with a patient and a doctor.
-   A visit is associated with an appointment; the application enforces
    one visit per appointment.
-   A prescription is associated with a visit.
-   A prescription can contain multiple prescription items.
-   Each prescription item references a medicine.
-   A user is associated with a role.
-   A doctor profile can optionally be linked to a user account.

Primary keys and foreign keys are used to represent and maintain these
relationships.

## 9. Security Implementation

Security is handled by the backend as well as the frontend request flow.

### JWT Authentication

1.  The user submits login credentials.
2.  The backend checks the account and verifies the submitted password
    against the stored password hash.
3.  If the credentials are valid and the account is active, the backend
    generates a JWT.
4.  The frontend stores the access token in `sessionStorage`.
5.  Axios attaches the token to subsequent API requests.
6.  ASP.NET Core JWT bearer authentication validates the token before
    protected endpoints are accessed.

### Password Hashing

Passwords are not stored as plain text. ASP.NET Core's `PasswordHasher`
is used to hash passwords and verify login attempts.

### Authorization

-   `[Authorize]` protects endpoints that require an authenticated user.
-   Role restrictions limit access to particular roles.
-   Additional ownership checks restrict doctors to records they are
    permitted to access.
-   Sensitive account-management operations are restricted to Admin
    users.

### Configuration and Secrets

Database connection strings and JWT signing keys are
environment-specific configuration values. For local development, use
.NET User Secrets or environment variables. Do not commit passwords,
signing keys, production connection strings, real patient information,
or private credentials to the repository.

## 10. Validation and Business Rules

The backend applies validation and business rules to help preserve data
integrity. Examples include:

-   Appointment dates cannot be in the past.
-   A doctor must be available for an appointment.
-   Conflicting appointment slots are checked.
-   Appointment status is tracked.
-   An appointment cannot receive duplicate visit records.
-   Medicine price and stock quantity cannot be negative.
-   A medicine referenced by a prescription item cannot be deleted.
-   User email addresses must be unique.
-   New user passwords must satisfy the application's minimum length
    requirement.
-   Inactive accounts cannot log in.
-   Built-in roles and roles assigned to users are protected from
    invalid deletion.
-   An administrator cannot deactivate their own currently logged-in
    account or change their own role through the protected workflow.

## 11. Project Directory Structure

The repository is organized into separate frontend and backend
applications:

``` text
ATH-Clinic-Management-System/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   └── ATHClinic.API/
│       ├── Controllers/
│       ├── Data/
│       ├── Models/
│       ├── Properties/
│       ├── Program.cs
│       └── ATHClinic.API.csproj
│
├── .gitignore
└── README.md
```

*Note: Generated folders such as `node_modules`, `bin`, and `obj` are
excluded from source control.*

## 12. Prerequisites

Install the following software before running the application:

-   **.NET 10 SDK**
-   **Node.js** and **npm**
-   **Microsoft SQL Server**
-   A SQL Server management tool, such as SQL Server Management Studio
    (SSMS), is recommended.
-   **Git**, to clone the repository.

## 13. Installation and Local Setup

### Step 1: Clone the repository

``` bash
git clone https://github.com/harshdave05/ATH-Clinic-Management-System.git
cd ATH-Clinic-Management-System
```

### Step 2: Configure the database

1.  Start your SQL Server instance.
2.  Create or restore the project database.
3.  Make sure the database schema contains the tables and relationships
    required by the application.
4.  Configure the connection string for your local SQL Server instance.

The backend uses the connection string key `DefaultConnection`.

For local development, you can configure it with .NET User Secrets from
the backend project directory:

``` powershell
cd server/ATHClinic.API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_LOCAL_SQL_SERVER_CONNECTION_STRING"
```

Replace the placeholder with a connection string appropriate for your
SQL Server setup. Do not put real credentials in this README or commit
them to Git.

### Step 3: Configure JWT settings

Configure the JWT issuer, audience, and signing key using .NET User
Secrets or environment variables, matching the configuration key names
read by the application's authentication setup in `Program.cs`.

Use a strong, private signing key. Never publish the key in source
control.

### Step 4: Restore and run the backend

From `server/ATHClinic.API`:

``` powershell
dotnet restore
dotnet build
dotnet run
```

The local backend is configured to run at:

``` text
http://localhost:5218
```

If the application reports a database connection error, check that SQL
Server is running and that `DefaultConnection` points to the correct
server and database.

### Step 5: Install and run the frontend

Open a second terminal from the repository root:

``` powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal. The frontend's Axios
API base URL is configured as:

``` text
http://localhost:5218/api
```

### Step 6: Check frontend/backend connectivity

-   Confirm the backend is running.
-   Confirm the frontend is using the correct API base URL.
-   Confirm the backend CORS policy allows the frontend development
    origin, currently `http://localhost:5173`.
-   Sign in with an account configured in your local database.

> The repository does not publish real login credentials. Use locally
> configured test accounts or create accounts through the authorized
> user-management workflow.

## 14. API Design

The backend exposes REST-style endpoints through ASP.NET Core
controllers. The exact routes and request/response models are defined in
the controller source files.

Common HTTP methods used by the application:

  Method     Typical purpose
  ---------- ---------------------------------------------------------
  `GET`      Retrieve records.
  `POST`     Create a new record or perform an action such as login.
  `PUT`      Update an existing record.
  `DELETE`   Delete a record where deletion is permitted.

Common HTTP response codes:

  -----------------------------------------------------------------------
  Status code                         Meaning
  ----------------------------------- -----------------------------------
  `200 OK`                            Request completed successfully.

  `201 Created`                       A resource was created.

  `400 Bad Request`                   Request data is invalid.

  `401 Unauthorized`                  Authentication is missing or
                                      invalid.

  `403 Forbidden`                     The authenticated user does not
                                      have permission.

  `404 Not Found`                     The requested resource does not
                                      exist.

  `409 Conflict`                      The operation conflicts with
                                      existing data or business rules.
  -----------------------------------------------------------------------

## 15. Frontend Implementation Notes

-   React components are used to organize the interface into manageable
    sections.
-   `useState` manages component state, including form values and loaded
    records.
-   `useEffect` performs side effects such as loading data from APIs.
-   Axios is configured through a reusable API client in
    `src/services/api.js`.
-   An Axios request interceptor attaches the access token when one is
    available.
-   The token and signed-in user information are stored in browser
    `sessionStorage` for the active tab session.
-   Role-specific navigation and action availability provide a more
    focused interface for each user type.

## 16. Testing and Verification

During development, the main workflows and access restrictions were
manually checked, including:

-   Login for Admin, Doctor, and Receptionist accounts.
-   Role-restricted access to protected API endpoints.
-   Patient and doctor management.
-   Appointment creation, editing, status handling, and chronological
    ordering.
-   Appointment slot validation.
-   Visit creation and update, including prevention of duplicate visits
    for an appointment.
-   Prescription creation and update with medicine items.
-   Medicine management and deletion restrictions.
-   User creation, editing, deactivation, and reactivation.
-   Protection against an administrator deactivating their own active
    account.
-   API responses for successful, unauthorized, forbidden, and
    conflicting operations.

## 17. Known Configuration Considerations

-   The backend uses a local development API URL. Update the frontend
    API base URL when deploying or changing environments.
-   The backend CORS policy must allow the frontend's actual origin.
-   A compatible SQL Server database and schema are required before the
    application can run successfully.
-   JWT settings and database credentials must be configured separately
    for each environment.
-   This repository documents the application source and local setup; it
    does not imply that a production deployment is available.

## 18. Future Enhancements

Possible future improvements include:

-   Automated unit and integration tests.
-   Production deployment with HTTPS and environment-specific
    configuration.
-   Audit logs for important administrative actions.
-   Pagination and advanced filtering for large record sets.
-   Appointment reminders and notification integration.
-   More detailed reporting and analytics.
-   Automated database backup and recovery procedures.

## 19. Internship Information

  Detail                Information
  --------------------- ------------------------------
  Organization          ATH Technologies
  Location              Pandeypur, Varanasi
  Internship duration   4 June 2026 -- 4 July 2026
  Project title         ATH Clinic Management System
  Project type          Full-stack web application

## 20. Author and Repository

**GitHub:** [harshdave05](https://github.com/harshdave05)

**Repository:**
[ATH-Clinic-Management-System](https://github.com/harshdave05/ATH-Clinic-Management-System)

------------------------------------------------------------------------

```{=html}
<p align="center">
```
`<strong>`{=html}ATH Clinic Management
System`</strong>`{=html}`<br>`{=html} Developed as a full-stack
internship project at ATH Technologies.
```{=html}
</p>
```
