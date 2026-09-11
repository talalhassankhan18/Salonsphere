SalonSphere — Where Beauty Meets Excellence

SalonSphere is an AI-enabled salon booking and commerce platform developed as a Final Year Project. It connects customers with salons through discovery, appointment booking, beauty-product shopping, personalized recommendations, and intelligent assistance.

Project: SalonSphere (formerly Glimmer)
Type: Final Year Project
Platform: Web Application
Deployment: Vercel
Primary Stack: Next.js, TypeScript, MongoDB, Tailwind CSS

📌 Overview

SalonSphere provides a unified digital platform for customers, salon vendors, and platform administrators.

Customers can discover salons and services, book appointments, purchase products, manage their profiles, and receive personalized recommendations.

Salon vendors can manage their salons, services, products, appointments, customers, and business analytics.

Super administrators can manage users, vendors, platform operations, and overall system activity.

✨ Key Features

👤 Customer / End User

Salon discovery and browsing

Service discovery

Appointment booking and scheduling

Product browsing and purchasing

Shopping cart and checkout

User profile management

Booking history

AI-powered service recommendations

AI chatbot / customer assistance

Responsive interface across devices

💇 Salon Vendor

Salon registration and onboarding

Salon profile management

Service management

Product and inventory management

Appointment management

Customer management

Business analytics dashboard

Vendor-side operational management

🛡️ Super Admin

Platform administration

Vendor approval and management

User management

Platform analytics

Monitoring of system activity

Role-based access control

🤖 AI Features

SalonSphere incorporates AI to improve the customer experience through:

Personalized service recommendations

Preference-based suggestions

Intelligent customer assistance

Data-driven recommendation workflows

🏗️ System Architecture

## 🏗️ System Architecture

SalonSphere follows a **full-stack, modular architecture** built around Next.js, TypeScript, MongoDB, and a set of supporting external services. The system separates the presentation layer, application/API layer, data layer, and external integrations to keep the platform scalable and maintainable.

```text
                           SALONSPHERE PLATFORM
                     "Where Beauty Meets Excellence"
                                   │
             ┌─────────────────────┴─────────────────────┐
             │                                           │
             ▼                                           ▼
   ┌──────────────────────┐                    ┌──────────────────────┐
   │   CUSTOMER CLIENT    │                    │   ADMIN / VENDOR     │
   │                      │                    │      CLIENTS         │
   │ • Home               │                    │                      │
   │ • Salon Discovery    │                    │ • Vendor Dashboard   │
   │ • Services           │                    │ • Admin Dashboard    │
   │ • Booking            │                    │ • Analytics          │
   │ • Products           │                    │ • Management Panels  │
   │ • Cart & Checkout    │                    │                      │
   │ • Profile            │                    │                      │
   └──────────┬───────────┘                    └──────────┬───────────┘
              │                                           │
              └──────────────────┬────────────────────────┘
                                 │
                                 ▼
                 ┌─────────────────────────────────┐
                 │       PRESENTATION LAYER        │
                 │          Next.js / React        │
                 │                                 │
                 │ • Responsive UI                 │
                 │ • Components                    │
                 │ • Pages / Routes                │
                 │ • Forms & Validation            │
                 │ • Client-side State             │
                 └────────────────┬────────────────┘
                                  │
                                  ▼
                 ┌─────────────────────────────────┐
                 │       APPLICATION LAYER         │
                 │        Next.js / Node.js        │
                 │                                 │
                 │ ┌─────────────────────────────┐ │
                 │ │       API / Backend         │ │
                 │ │                             │ │
                 │ │ • Authentication            │ │
                 │ │ • User Management           │ │
                 │ │ • Salon Management          │ │
                 │ │ • Service Management        │ │
                 │ │ • Product Management        │ │
                 │ │ • Booking Management        │ │
                 │ │ • Cart & Orders             │ │
                 │ │ • Admin Operations          │ │
                 │ └─────────────────────────────┘ │
                 │                                 │
                 │ ┌─────────────────────────────┐ │
                 │ │   Business & AI Services    │ │
                 │ │                             │ │
                 │ │ • Recommendation Engine     │ │
                 │ │ • AI Assistant / Chatbot    │ │
                 │ │ • Business Logic            │ │
                 │ │ • Validation                │ │
                 │ └─────────────────────────────┘ │
                 └────────────────┬────────────────┘
                                  │
                                  ▼
                 ┌─────────────────────────────────┐
                 │          DATA LAYER             │
                 │                                 │
                 │              MongoDB            │
                 │                                 │
                 │ • Users                         │
                 │ • Salons                        │
                 │ • Services                      │
                 │ • Products                      │
                 │ • Bookings                      │
                 │ • Orders                        │
                 │ • Reviews / Preferences         │
                 │ • Application Data              │
                 └─────────────────────────────────┘


                         EXTERNAL SERVICES
                                  │
              ┌───────────────────┼────────────────────┐
              │                   │                    │
              ▼                   ▼                    ▼
       ┌─────────────┐    ┌─────────────┐     ┌──────────────┐
       │  Cloudinary │    │   Stripe    │     │ Gmail / SMTP │
       │             │    │             │     │              │
       │ Images &    │    │ Payments &  │     │ Emails &     │
       │ Media       │    │ Checkout    │     │ Notifications│
       └─────────────┘    └─────────────┘     └──────────────┘

              ┌───────────────────┼────────────────────┐
              │                   │                    │
              ▼                   ▼                    ▼
       ┌─────────────┐    ┌─────────────┐     ┌──────────────┐
       │ Google OAuth│    │ Google      │     │   Vercel     │
       │             │    │ Analytics   │     │              │
       │ Social      │    │             │     │ Deployment & │
       │ Login       │    │ Analytics   │     │ Hosting      │
       └─────────────┘    └─────────────┘     └──────────────┘
```

### 🔄 Request Flow

A typical user interaction follows this flow:

```text
User
 │
 ▼
Next.js / React UI
 │
 │ HTTP Request
 ▼
API Route / Backend
 │
 ├──────────────► Authentication & Authorization
 │
 ├──────────────► Business Logic
 │
 ├──────────────► AI / Recommendation Services
 │
 ▼
MongoDB
 │
 ▼
Backend Response
 │
 ▼
Next.js UI
 │
 ▼
User
```

### 🔐 Authentication Flow

```text
                    User
                     │
                     ▼
             Login / Register
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
       Email/Password     Google OAuth
            │                 │
            └────────┬────────┘
                     ▼
              Authentication
                     │
                     ▼
             JWT / NextAuth
                     │
                     ▼
            Role Verification
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
        User       Vendor     Admin
          │          │          │
          ▼          ▼          ▼
     User APIs   Vendor APIs  Admin APIs
```

### 🤖 AI Recommendation Flow

```text
              User Activity & Preferences
                         │
                         ▼
                  Data Processing
                         │
                         ▼
               Recommendation Model
                         │
                         ▼
                  Service Ranking
                         │
                         ▼
             Personalized Suggestions
                         │
                         ▼
                    User UI
```

### 👥 Role-Based Architecture

SalonSphere implements role-based access control to separate the responsibilities of different platform users.

```text
                         SalonSphere
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
        End User         Salon Vendor      Super Admin
             │                │                │
             ▼                ▼                ▼
       • Discover       • Manage Salon    • Manage Users
       • Book           • Manage Services • Manage Vendors
       • Purchase       • Manage Products • Platform Control
       • Review         • Manage Bookings • Analytics
       • Profile        • View Analytics  • Monitoring
```

### 🧩 Architectural Components

| Layer              | Technologies / Components                | Responsibility                                          |
| ------------------ | ---------------------------------------- | ------------------------------------------------------- |
| **Presentation**   | Next.js, React, TypeScript, Tailwind CSS | UI, pages, forms, dashboards and user interaction       |
| **Application**    | Next.js API Routes, Node.js              | Request handling and backend operations                 |
| **Authentication** | JWT, NextAuth, Google OAuth              | Authentication, sessions and authorization              |
| **Business Logic** | TypeScript services / modules            | Bookings, products, salons, users and business rules    |
| **AI Layer**       | TensorFlow / recommendation logic        | Personalized recommendations and intelligent assistance |
| **Data Layer**     | MongoDB, Mongoose                        | Persistent application data                             |
| **Media Layer**    | Cloudinary                               | Image and media storage                                 |
| **Payment Layer**  | Stripe                                   | Payment processing and checkout                         |
| **Communication**  | Gmail / SMTP                             | Email notifications and account workflows               |
| **Analytics**      | Google Analytics                         | Usage and engagement analytics                          |
| **Deployment**     | Vercel                                   | Application hosting and deployment                      |

### 📦 Architectural Approach

The platform follows a **modular full-stack architecture**, allowing individual system components to evolve independently.

The main architectural principles are:

* **Separation of concerns** between UI, application logic, and data
* **Role-based access control** for users, vendors, and administrators
* **API-driven communication** between the frontend and backend
* **Reusable UI components** for consistent design
* **Modular business logic** for easier maintenance
* **External service integration** for payments, media, authentication, email, and analytics
* **AI integration** for personalized customer experiences
* **Environment-based configuration** for development and production deployments


🛠️ Technology Stack

Technology

Purpose

Next.js

Full-stack React framework

TypeScript

Type-safe application development

Node.js

Server-side runtime

MongoDB

Database

Mongoose

MongoDB object modeling

Tailwind CSS

UI styling

TensorFlow / AI

Recommendation and intelligent features

NextAuth

Authentication

JWT

Token-based authentication

Google OAuth

Social authentication

Cloudinary

Image/media management

Stripe

Payment integration

SMTP / Gmail

Email services

Google Analytics

Application analytics

Vercel

Deployment

🔐 Authentication & Authorization

SalonSphere uses a role-based authentication architecture.

Supported roles include:

                    ┌─────────────┐
                    │    User     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        End Customer   Salon Vendor  Super Admin

Authentication functionality includes:

JWT-based authentication

Refresh-token support

Password reset workflow

Google OAuth

Protected routes

Role-based access control

Secure session handling

📁 Project Structure

The exact structure can vary depending on the current implementation. A typical SalonSphere structure is:

salonsphere/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── salons/
│   ├── services/
│   ├── products/
│   ├── bookings/
│   └── ...
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── dashboard/
│   └── ...
│
├── lib/
│   ├── db/
│   ├── auth/
│   ├── utils/
│   └── ...
│
├── models/
│   ├── User/
│   ├── Salon/
│   ├── Service/
│   ├── Product/
│   ├── Booking/
│   └── ...
│
├── public/
│   ├── images/
│   └── ...
│
├── styles/
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.*
└── README.md

Update this section if your repository uses a different folder structure.

🚀 Getting Started

Prerequisites

Make sure the following are installed:

Node.js 18+

npm, yarn, or pnpm

MongoDB

Git

Check your Node.js installation:

node --version

Check npm:

npm --version

1. Clone the Repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd salonsphere

2. Install Dependencies

Using npm:

npm install

Or using yarn:

yarn install

Or using pnpm:

pnpm install

3. Configure Environment Variables

Create a .env.local file in the root directory.

Do not commit .env.local to GitHub.

Use environment variables similar to:

# Database
MONGODB_URI=mongodb://localhost:27017/glimmer-db
DB_NAME=glimmer-db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
EMAIL_FROM="SalonSphere"
EMAIL_FROM_NAME="SalonSphere"

# Application URLs
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:3000
BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000

# Application
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
NEXT_PUBLIC_APP_NAME="SalonSphere"

# Security
COOKIE_SECRET=your_cookie_secret
PASSWORD_RESET_EXPIRE=3600000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin
SUPER_ADMIN_EMAIL=your_admin_email
SUPER_ADMIN_PASSWORD=your_admin_password

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGINS=http://localhost:3000

⚠️ Security Notice

Never publish secrets such as:

JWT secrets

NextAuth secrets

Google OAuth client secrets

Cloudinary API secrets

SMTP passwords

Stripe secret keys

Admin passwords

If credentials have previously been committed to a public repository, rotate/revoke them immediately and replace them with new credentials.

4. Start MongoDB

Make sure your local MongoDB server is running.

The default development database is:

mongodb://localhost:27017/glimmer-db

You can use MongoDB Community Server or another compatible MongoDB deployment.

5. Run the Development Server

npm run dev

The application should be available at:

http://localhost:3000

6. Build for Production

Create a production build:

npm run build

Start the production server:

npm start

💳 Payments

SalonSphere includes Stripe integration for payment processing.

For local development, use Stripe test-mode credentials:

NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_test_public_key
STRIPE_SECRET_KEY=your_test_secret_key

Never expose the Stripe secret key to client-side code or commit it to source control.

☁️ Cloudinary

Cloudinary is used for image/media management.

Required variables:

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

The API secret must remain server-side.

📧 Email Service

SalonSphere uses SMTP for email functionality such as account-related notifications and password-reset workflows.

Example:

EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password

For Gmail, use an App Password rather than your normal Gmail account password when applicable.

📊 Analytics

Google Analytics can be integrated to monitor application usage and customer interactions.

Analytics can help measure:

User engagement

Page visits

Customer journeys

Feature usage

Conversion behavior

🌐 Deployment

SalonSphere can be deployed using Vercel.

General deployment workflow:

GitHub Repository
       │
       ▼
    Vercel
       │
       ▼
Environment Variables
       │
       ▼
Production Application

Before deploying:

Push the project to GitHub.

Import the repository into Vercel.

Configure all production environment variables.

Configure the production MongoDB database.

Configure OAuth redirect URLs.

Configure Stripe production/test settings as required.

Configure Cloudinary.

Deploy the application.

Never place private credentials directly in source code. Use Vercel's Environment Variables for production secrets.

🧪 Development Workflow

Recommended workflow:

Requirement
    ↓
Research
    ↓
UI/UX Design
    ↓
Development
    ↓
API Integration
    ↓
Database Integration
    ↓
Testing
    ↓
Deployment
    ↓
Monitoring

The project follows a modular development approach to keep frontend, backend, database, authentication, and AI functionality maintainable.

🧠 AI Recommendation System

The AI component is designed to improve personalization by considering user preferences and relevant service information.

A simplified workflow:

User Preferences
       │
       ▼
Feature Processing
       │
       ▼
Recommendation Model
       │
       ▼
Ranked Services
       │
       ▼
Personalized Recommendations

This approach can help users discover services that better match their interests and requirements.

🔌 API Overview

SalonSphere follows an API-driven architecture for application functionality.

Typical API domains include:

/api/auth
/api/users
/api/salons
/api/services
/api/products
/api/bookings
/api/cart
/api/orders
/api/admin
/api/recommendations

Update the endpoint list according to the final API implementation in the repository.

👥 User Roles

Role

Main Responsibilities

End User

Discover salons, book services, purchase products, manage profile

Salon Vendor

Manage salon, services, products, appointments, customers

Super Admin

Manage platform, users, vendors, and analytics

🎨 UI/UX Design

SalonSphere was designed with a focus on:

Modern user interfaces

Responsive layouts

Clear information architecture

Simple appointment workflows

Consistent design patterns

Role-specific dashboards

Accessible interaction flows

Mobile-friendly experiences

Design and prototyping were developed using Figma before implementation.

📸 Screenshots

Add screenshots of the main application screens here.

Customer Home

Add screenshot here

Salon Discovery

Add screenshot here

Service Booking

Add screenshot here

Product Store

Add screenshot here

Vendor Dashboard

Add screenshot here

Super Admin Dashboard

Add screenshot here

🗺️ Roadmap

Potential future improvements include:

Advanced AI personalization

Improved recommendation models

Real-time appointment availability

Advanced vendor analytics

Customer reviews and ratings

Loyalty and rewards system

Push notifications

Mobile application

Expanded payment gateway support

Advanced search and filtering

AI-powered conversational booking

🔒 Security Considerations

SalonSphere uses several security mechanisms, including:

JWT authentication

Refresh-token mechanism

Role-based authorization

Protected API routes

Password-reset expiration

Rate limiting

CORS configuration

Environment-based secrets

Server-side handling of private API credentials

For production deployments, credentials should always be stored in a secure secrets manager or deployment platform environment configuration.

🤝 Contributing

Contributions are welcome.

Fork the repository

git fork <YOUR_GITHUB_REPOSITORY_URL>

Create a feature branch

git checkout -b feature/your-feature

Commit your changes

git add .
git commit -m "feat: add your feature"

Push the branch

git push origin feature/your-feature

Then open a Pull Request.

📄 License

This project was developed as a Final Year Project.

If you intend to release SalonSphere as an open-source project, add an appropriate license such as MIT, Apache-2.0, or another license that matches the project's ownership and usage requirements.

👨‍💻 Development Team

Talal Hassan Khan

BS Software Engineering — COMSATS University Islamabad

Roles and contributions included:

UI/UX Design

Frontend Development

Product Design

System Design

User Experience Research

Application Development

Hifza Akhter

BS Software Engineering — COMSATS University Islamabad

Project development and research contribution.

Supervisor

Dr. Tassawwar Iqbal

🔗 Project Links

Live Application: https://salonsphere.vercel.app
GitHub Repository: talalhassankhan18/Salonsphere


📬 Contact

Talal Hassan Khan

Email: talalhassankhan2003@gmail.com

LinkedIn: https://linkedin.com/in/talalhassankhan/

Behance: https://behance.net/talalhassankhan

⭐ Support

If you find SalonSphere interesting, consider giving the repository a ⭐ on GitHub.

SalonSphere — Where Beauty Meets Excellence.
