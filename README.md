# PayrollPro: Automated Payroll & Document Distribution System

**[View Live Deployment](https://payrolpro-iota.vercel.app/)** 
PayrollPro is a modern, full-stack Next.js web application designed to streamline the monthly payroll process. It empowers administrators to upload employee compensation data in bulk, automatically generates encrypted PDF payslips, and securely distributes them via email.

> ⚠️ **Important Note on Email Delivery:** Because the system sends automated emails with PDF attachments, some strict email providers may flag them. **Please advise employees to check their spam/junk folders** if they do not see their payslip in their primary inbox.

---

## Key Features

- **Bulk CSV Processing:** Drag-and-drop CSV upload with instant client-side validation for seamless employee onboarding.
- **Secure PDF Generation:** Automatically creates pixel-perfect PDF payslips using `pdfkit`. Every PDF is heavily encrypted and uniquely password-protected using employee-specific data.
- **Automated Email Dispatch:** Integrates with SMTP (`nodemailer`) to reliably deliver generated payslips to hundreds of employees simultaneously.
- **Responsive UI & Accessibility:** A highly premium interface featuring dynamic data charts, accessible high-contrast modes, and a fully mobile-responsive collapsible layout.
- **Robust Authentication:** Secure custom JWT-based authentication system utilizing HttpOnly cookies and Bcrypt password hashing.
- **Real-Time Auditing:** Tracks the success and failure states of all dispatched emails within the PostgreSQL database for total observability.
- **One-Click Retries:** Failed email deliveries can be retried individually or in bulk directly from the dashboard.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Recharts
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL (via Supabase), Prisma ORM
- **Authentication:** Custom JWT (`jose` library), Bcrypt
- **Utilities:** `pdfkit` (PDFs), `nodemailer` (SMTP), `papaparse` (CSV)

---

## 💻 Running Locally (Step-by-Step)

Follow these steps to set up and run the project locally on your machine.

### Prerequisites
- **Node.js** (v18 or higher)
- A **PostgreSQL** database (e.g., Supabase, Neon, or local Docker)
- A **Gmail account** with an App Password (for SMTP email dispatch)

### 1. Clone the repository
```bash
git clone https://github.com/arjunajaygit/Payroll-Automation-.git
cd Payroll-Automation-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your secret keys:
```env
# Database Connections
DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
DIRECT_URL="postgresql://user:password@host:port/db?schema=public"

# Authentication
JWT_SECRET="generate_a_random_secure_string_here"

# Email Configuration
GMAIL_USER="your_email@gmail.com"
GMAIL_APP_PASSWORD="your_google_app_password"
```

### 4. Set up the Prisma Database
Push the Prisma schema to your PostgreSQL database to create the necessary tables:
```bash
npx prisma db push
```
*(Optional)* You can view and manipulate your database using Prisma Studio:
```bash
npx prisma studio
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 📸 Screenshots

### Dashboard
![Dashboard](public/screenshots/1.png)

### Run Payroll
![Run Payroll](public/screenshots/2.png)

### Employee Database
![Employee Database](public/screenshots/3.png)

### Salary Records
![Salary Records](public/screenshots/4.png)

### Email Logs
![Email Logs](public/screenshots/5.png)

### Export Reports
![Export Reports](public/screenshots/6.png)

### Accessibility Settings
![Accessibility Settings](public/screenshots/7.png)

### Secure Payslip Preview
![Secure Payslip Preview](public/screenshots/8.png)

### Payslip Verification & Email Delivery

<p align="center">
  <img src="public/screenshots/9.jpeg" width="45%" alt="Verified Payroll Authenticity" />
  &nbsp; &nbsp; &nbsp;
  <img src="public/screenshots/10.jpeg" width="45%" alt="Automated Email Delivery" />
</p>

### Mobile Responsive UI

<p align="center">
  <img src="public/screenshots/mobile/1.jpeg" width="32%" />
  &nbsp;
  <img src="public/screenshots/mobile/2.jpeg" width="32%" />
  &nbsp;
  <img src="public/screenshots/mobile/3.jpeg" width="32%" />
</p>

<p align="center">
  <img src="public/screenshots/mobile/4.jpeg" width="32%" />
  &nbsp;
  <img src="public/screenshots/mobile/5.jpeg" width="32%" />
  &nbsp;
  <img src="public/screenshots/mobile/6.jpeg" width="32%" />
</p>

<p align="center">
  <img src="public/screenshots/mobile/7.jpeg" width="32%" />
  &nbsp;
  <img src="public/screenshots/mobile/8.jpeg" width="32%" />
</p>

---

## 🏗️ Architecture Note
The application was originally designed with a dedicated background worker queue (Redis + BullMQ) for processing hundreds of I/O bound PDF generation jobs. To support free-tier serverless environments (like Vercel) and bypass their strict execution timeouts, the architecture was cleverly adapted to leverage high-concurrency `Promise.all` directly inside Next.js API routes—demonstrating strong understanding of both queue systems and serverless constraints.
