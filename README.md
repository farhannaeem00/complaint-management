# Smart Complaint Management System (IssueFlow)

A full-stack complaint management system built with Next.js 16, Prisma ORM, and MySQL. It supports three user roles: **Student**, **Admin**, and **Technician**, each with dedicated dashboards and workflows.

---

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - via [XAMPP](https://www.apachefriends.org/), [WAMP](https://www.wampserver.com/), or [standalone MySQL](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

---

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd IssueFlow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start MySQL

- If using **XAMPP**: Open XAMPP Control Panel and start **Apache** and **MySQL**
- If using **WAMP**: Start WAMP and ensure MySQL is running (green icon)
- If using **standalone MySQL**: Make sure the MySQL service is running

### 4. Create the Database

Open **phpMyAdmin** (http://localhost/phpmyadmin) or any MySQL client and run:

```sql
CREATE DATABASE complaint_management;
```

Or via command line:

```bash
mysql -u root -p -e "CREATE DATABASE complaint_management;"
```

### 5. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
# Format: mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
# If your MySQL has no password (default XAMPP), use:
DATABASE_URL="mysql://root:@localhost:3306/complaint_management"

# If your MySQL has a password, use:
# DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/complaint_management"

# JWT Secret (used for authentication tokens)
JWT_SECRET="k8jH3nM9pL2qR5vT8yU1wX4zB7cD0eF6gI"

# Application Environment
NODE_ENV="development"
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Run Database Migration

This creates all the required tables in your MySQL database:

```bash
npx prisma migrate dev --name init
```

### 8. Seed the Database

This creates default users, categories, and sample data:

```bash
npx prisma db seed
```

### 9. Start the Development Server

```bash
npm run dev
```

The app will be running at **http://localhost:3000**

---

## Default Login Credentials

All seeded accounts use the same password: `haseeb123`

### Admin Account
| Field    | Value                  |
|----------|------------------------|
| Email    | haseeb123@gmail.com    |
| Password | haseeb123              |
| Role     | Admin                  |

### Technician Accounts
| Name             | Email                       | Department  |
|------------------|-----------------------------|-------------|
| John IT          | tech.it@scfms.com           | IT          |
| Sarah Electrical | tech.electrical@scfms.com   | Electrical  |
| Mike Civil       | tech.civil@scfms.com        | Civil       |

### Student Accounts
| Name          | Email                      | Student ID  | Department       |
|---------------|----------------------------|-------------|------------------|
| Alice Student | student1@university.edu    | STU2024001  | Computer Science |
| Bob Student   | student2@university.edu    | STU2024002  | Engineering      |

---

## Project Structure

```
IssueFlow/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              # Login page
│   │   └── register/page.tsx           # Registration page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts          # POST - User login
│   │   │   ├── register/route.ts       # POST - User registration
│   │   │   └── me/route.ts             # GET  - Get current user
│   │   ├── complaints/
│   │   │   ├── route.ts                # GET/POST - List/Create complaints
│   │   │   └── [id]/
│   │   │       ├── route.ts            # GET - Single complaint details
│   │   │       ├── assign/route.ts     # POST - Admin assigns technician
│   │   │       ├── accept/route.ts     # POST - Technician accepts
│   │   │       ├── reject/route.ts     # POST - Technician rejects
│   │   │       ├── complete/route.ts   # POST - Technician marks complete
│   │   │       └── verify/route.ts     # POST - Admin verifies resolution
│   │   ├── categories/route.ts         # GET - List categories
│   │   ├── feedback/route.ts           # GET/POST - Feedback operations
│   │   ├── notifications/
│   │   │   ├── route.ts                # GET - User notifications
│   │   │   └── [id]/read/route.ts      # PATCH - Mark notification read
│   │   ├── technicians/route.ts        # GET - List technicians
│   │   └── dashboard/stats/route.ts    # GET - Dashboard statistics
│   ├── dashboard/
│   │   ├── student/
│   │   │   ├── page.tsx                # Student dashboard
│   │   │   ├── complaint/new/page.tsx  # Submit new complaint
│   │   │   ├── complaints/page.tsx     # View all complaints
│   │   │   ├── complaints/[id]/page.tsx# Complaint detail
│   │   │   └── feedback/page.tsx       # Submit feedback
│   │   ├── admin/
│   │   │   ├── page.tsx                # Admin dashboard
│   │   │   ├── complaints/page.tsx     # Manage all complaints
│   │   │   ├── complaints/[id]/page.tsx# Complaint detail + assign
│   │   │   ├── feedback/page.tsx       # View all feedback
│   │   │   └── users/page.tsx          # Manage users
│   │   └── technician/
│   │       ├── page.tsx                # Technician dashboard
│   │       ├── assigned/page.tsx       # Assigned complaints
│   │       ├── complaints/[id]/page.tsx# Complaint detail + actions
│   │       └── completed/page.tsx      # Completed complaints
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Landing page
├── components/
│   ├── complaint-card.tsx              # Complaint card component
│   ├── dashboard-sidebar.tsx           # Dashboard sidebar navigation
│   ├── navbar.tsx                      # Top navigation bar
│   ├── stat-card.tsx                   # Statistics card
│   ├── status-badge.tsx                # Status badge component
│   ├── timeline.tsx                    # Activity timeline
│   └── ui/                             # shadcn/ui components
├── lib/
│   ├── activity-log.ts                 # Activity logging utility
│   ├── api-response.ts                 # API response helpers
│   ├── auth.ts                         # JWT auth (generate/verify token)
│   ├── context.tsx                     # React context (API integration)
│   ├── cron.ts                         # Escalation cron job
│   ├── db.ts                           # Prisma client instance
│   ├── init.ts                         # App initialization
│   ├── notifications.ts                # Notification helper
│   └── utils.ts                        # Utility functions
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── seed.ts                         # Database seed script
├── .env                                # Environment variables (create this)
├── package.json
└── tsconfig.json
```

---

## Database Schema

The system uses 6 main tables:

| Table         | Description                                      |
|---------------|--------------------------------------------------|
| User          | All users (students, admins, technicians)         |
| Category      | Complaint categories (Network, Power, etc.)       |
| Complaint     | Complaints with status, priority, assignments     |
| Feedback      | Student feedback on resolved complaints           |
| Notification  | In-app notifications for all users                |
| ActivityLog   | Audit trail for all complaint actions              |

---

## User Roles and Permissions

### Student
- Submit new complaints with category, priority, and description
- Track complaint status in real-time
- View complaint history and activity timeline
- Submit feedback on resolved complaints

### Admin
- View dashboard with statistics and charts
- Assign technicians to complaints
- Verify resolved complaints
- View all feedback and manage users

### Technician
- View assigned complaints
- Accept or reject assigned complaints
- Mark complaints as completed with resolution notes
- Track completed work history

---

## Complaint Workflow

```
Student submits complaint
        |
        v
   [PENDING] -----> Admin assigns technician
        |
        v
   [ASSIGNED] ----> Technician accepts or rejects
        |                    |
        v                    v
  [IN_PROGRESS]         [REJECTED]
        |
        v
  Technician completes
        |
        v
   [RESOLVED] ----> Admin verifies
        |
        v
     [CLOSED]
```

---

## Troubleshooting

### "Cannot find module @prisma/client/runtime/..."
```bash
Remove-Item -Recurse -Force node_modules    # PowerShell
rm -rf node_modules                          # Mac/Linux
npm install
npx prisma generate
```

### "Environment variable not found: DATABASE_URL"
Make sure you have a `.env` file in the project root with the `DATABASE_URL` set correctly.

### "Can't reach database server"
1. Ensure MySQL is running (check XAMPP/WAMP control panel)
2. Verify the database `complaint_management` exists
3. Check your MySQL username and password in `.env`

### "prisma db seed" not working
Make sure `tsx` is installed:
```bash
npm install -D tsx
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

---

## Tech Stack

| Technology      | Purpose                    |
|-----------------|----------------------------|
| Next.js 16      | Full-stack React framework |
| TypeScript      | Type safety                |
| Prisma ORM      | Database access layer      |
| MySQL           | Relational database        |
| Tailwind CSS v4 | Styling                    |
| shadcn/ui       | UI component library       |
| JWT             | Authentication tokens      |
| bcryptjs        | Password hashing           |
| Recharts        | Dashboard charts           |
| Lucide React    | Icons                      |

---

## Available Scripts

| Command                          | Description                        |
|----------------------------------|------------------------------------|
| `npm run dev`                    | Start development server           |
| `npm run build`                  | Build for production               |
| `npm start`                      | Start production server            |
| `npx prisma generate`           | Generate Prisma client             |
| `npx prisma migrate dev`        | Run database migrations            |
| `npx prisma db seed`            | Seed the database                  |
| `npx prisma studio`             | Open Prisma Studio (DB GUI)        |
| `npx prisma migrate reset`      | Reset DB and re-run all migrations |
