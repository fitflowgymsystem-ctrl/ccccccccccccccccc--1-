# FitFlow Pro - Intelligent Gym Management System

FitFlow Pro is a state-of-the-art, AI-powered gym management solution designed to revolutionize how fitness facilities operate. From boutique studios to large enterprise chains, FitFlow Pro provides a unified platform to manage members, financials, staff, and equipment with unparalleled ease and intelligence.

Built with performance and scalability in mind, it seamlessly integrates advanced biometrics, detailed analytics, and generative AI to empower gym owners with actionable insights.

---

## 🚀 Key Features & Benefits

### 🧠 AI-Powered Intelligence
*   **Smart Business Insights**: Integrated with **Google Gemini 3 Pro**, the system analyzes complex data points to provide actionable recommendations (e.g., predicting member churn, optimizing staffing during peak hours).
*   **Maintenance Alerts**: AI-driven analysis of equipment usage patterns to predict maintenance needs before breakdowns occur.
*   **Automated Reporting**: Intelligent summaries of daily, weekly, and monthly performance metrics.

### 🏋️‍♂️ Advanced Member Management
*   **360° Member Profiles**: comprehensive records including personal details, subscription history, attendance logs, and medical notes.
*   **InBody Integration**: A dedicated module for tracking body composition changes over time (Weight, Muscle Mass, Body Fat %), complete with interactive progress charts.
*   **Flexible Subscriptions**: Support for diverse membership types—Time-based (Monthly/Yearly), Session-based (Punch cards), and Class-specific packages.
*   **Biometric Access Control**: Ready for integration with turnstiles and gate hardware using QR codes or biometric data.

### 💰 Complete Financial Suite
*   **Real-Time Financial Dashboard**: Instant visibility into Revenue, Expenses, and Net Profit.
*   **Point of Sale (POS)**: fully integrated POS system for selling gymnasium products, supplements, and merchandise.
*   **Expense Management**: Track and categorize operational costs (Rent, Utilities, Maintenance) to ensure accurate profit calculation.
*   **Payroll System**: Automated calculation of staff salaries, commissions, and bonuses based on performance and role.
*   **Invoicing & Receipts**: Professional digital invoicing for all transactions.

### 🏢 SaaS & Multi-Branch Architecture
*   **Multi-Tenant Ready**: Built to support SaaS deployment with tiered pricing plans (Basic, Pro, Elite, Enterprise).
*   **Branch Management**: Centralized Super-Admin dashboard to monitor and manage multiple gym locations from a single interface.
*   **Role-Based Access Control (RBAC)**: Secure, dedicated dashboards for different user roles:
    *   **Super Admin**: Global system configuration and SaaS management.
    *   **Gym Admin**: Full control over a specific branch.
    *   **Trainer**: Client management, workout planning, and schedule views.
    *   **Staff**: Front-desk operations, check-ins, and basic sales.
    *   **Member**: Personal portal for booking classes, viewing progress, and payments.

### 📅 Scheduling & Services
*   **Class Management**: easy scheduling for group classes (Yoga, HIIT, Spinning) with capacity tracking.
*   **Private Sessions**: Booking system for one-on-one personal training sessions.
*   **Resource Allocation**: Prevent double-booking of rooms or equipment.

### 🎨 User Experience & Design
*   **Modern UI/UX**: A sleek, responsive interface built with TailwindCSS, supporting Dark/Light modes.
*   **Multi-Language Support**: Fully localized for English and Arabic (RTL support).
*   **Cross-Platform**: Available as a robust Web Application and a native-like Desktop Application (via Electron).

---

## 🛠️ Technical Stack

FitFlow Pro leverages a modern, cutting-edge technology stack to ensure high performance and maintainability:

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: TailwindCSS, Lucide React (Icons), Recharts (Data Visualization)
*   **Backend & Database**: Firebase (Firestore, Auth, Storage)
*   **AI Engine**: Google Generative AI SDK (Gemini)
*   **Desktop Wrapper**: Electron
*   **Testing**: Vitest, React Testing Library, Playwright

---

## 📥 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v18 or higher)
*   npm (v9 or higher)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/fitflow-pro.git
    cd fitflow-pro
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory and add your credentials:
    ```env
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    API_KEY=your_gemini_api_key
    ```

4.  **Run the Application**

    *   For **Web Development**:
        ```bash
        npm run dev
        ```

    *   For **Desktop (Electron) Development**:
        ```bash
        npm run electron:dev
        ```

5.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 📄 License

This project is proprietary software. All rights reserved.
