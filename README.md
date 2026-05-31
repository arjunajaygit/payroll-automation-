# PayrollPro: Automated Payroll & Document Distribution System

PayrollPro is a full-stack Next.js application designed to streamline the monthly payroll process. It allows administrators to upload bulk employee data via CSV, automatically generates encrypted, password-protected PDF payslips, and securely dispatches them to employees via email.

## 🚀 Features
- **Bulk CSV Processing**: Drag-and-drop CSV uploads with instant client-side validation.
- **Secure PDF Generation**: Generates pixel-perfect PDF payslips using `pdfkit`. Each PDF is 128-bit encrypted and password-protected using the employee's personal details.
- **Automated Email Dispatch**: Seamlessly distributes the generated PDFs to employees using `nodemailer`.
- **Custom Authentication**: Fully implemented JWT-based authentication system with secure HttpOnly cookies, password hashing (Bcrypt), and protected API routes.
- **Real-time Logging**: Tracks the success or failure of every dispatched email directly in the Supabase PostgreSQL database.

## 🏗️ Architecture & Engineering Decisions

### The Message Queue (Redis + BullMQ)
The application was originally architected with a decoupled **Background Worker Queue** using **Upstash Redis** and **BullMQ**. 
- In an enterprise environment, generating hundreds of PDFs and sending concurrent emails is a heavily I/O bound process. 
- To prevent HTTP timeouts, the original architecture utilized a dedicated Node.js worker container that continuously polled Redis to process payroll jobs in the background, while the frontend utilized short-polling to update the UI progress bar.

### Serverless Adaptation (Current Deployment)
To accommodate the constraints of free-tier cloud hosting (Vercel's serverless timeouts and Render's outbound SMTP firewalls), the architecture was intelligently adapted:
- The PDF generation and Email dispatch logic was migrated directly into the Next.js API route.
- By leveraging `Promise.all` for high-concurrency execution, the application can securely process and dispatch small batches of employees synchronously within Vercel's 10-second serverless execution limit.
- This demonstrates an understanding of both **Enterprise Queue Architectures** and **Serverless Constraints**.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, React Hot Toast
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (hosted on Supabase), Prisma ORM
- **Authentication**: JWT (jose), Bcrypt
- **Utilities**: pdfkit (PDF generation), nodemailer (SMTP distribution), PapaParse (CSV parsing)

## 💻 Running Locally

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file with your credentials:
```env
DATABASE_URL="your_supabase_url"
DIRECT_URL="your_supabase_direct_url"
JWT_SECRET="your_jwt_secret"
GMAIL_USER="your_email@gmail.com"
GMAIL_APP_PASSWORD="your_google_app_password"
```

3. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
