# Mini ERP + CRM Operations Portal

A full-stack Enterprise Resource Planning (ERP) & Customer Relationship Management (CRM) portal built for wholesale, distribution, and supply chain businesses.

![Tech Stack](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Express](https://img.shields.io/badge/Express-4.21-lightgrey)
![Prisma](https://img.shields.io/badge/Prisma-5.22-indigo)
![React](https://img.shields.io/badge/React-19.0-cyan)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)

---

## 🌟 Key Features & Modules

### 1. Authentication & Role-Based Access Control (RBAC)
- JWT (JSON Web Tokens) stateless authentication with bearer headers.
- Password encryption using `bcryptjs` (salt rounds = 10).
- Granular Role Matrix:
  - **ADMIN**: Full system access (Users, Customers, Products, Stock Adjustments, Challans).
  - **SALES**: Customer CRM management, creating Sales Challans.
  - **WAREHOUSE**: Product catalog maintenance, stock entry, manual stock IN/OUT adjustments.
  - **ACCOUNTS**: Read-only access to customer ledger, stock history, and financial challans.

### 2. Customer CRM Module
- Manage wholesale, distributor, and retail customer accounts.
- Fields: `customerName`, `mobileNumber`, `email`, `businessName`, `gstNumber`, `customerType` (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), `address`, `status` (`LEAD`, `ACTIVE`, `INACTIVE`), `followUpDate`, `notes`.
- Real-time search, lead status filtering, customer type filtering.
- Follow-up Notes Drawer: Log date-stamped notes and schedule future follow-up dates.

### 3. Product Catalog & Inventory System
- Product catalog: `productName`, `SKU`, `category`, `unitPrice`, `currentStock`, `minimumStockAlert`, `warehouseLocation`.
- Low Stock Alerts: Automatic highlight when `currentStock <= minimumStockAlert`.
- Manual Stock Adjustments: Warehouse staff can add/remove inventory with required audit reasons.

### 4. Stock Movement Ledger (Audit History)
- Automatic tracking of every stock change (Stock IN / Stock OUT).
- Captures `productId`, `quantityChanged`, `movementType` (`IN` / `OUT`), `reason`, `createdById`, `timestamp`.
- Filterable audit history for transparency and warehouse inventory reconciliation.

### 5. Sales Challan Workflow & Stock Deduction Engine
- Generate multi-product sales challans for selected customers.
- Automatic unique challan numbering: `CH-XXXXXX-XXXX`.
- **Business Logic**:
  - Save as **DRAFT** or **CONFIRMED**.
  - When status changes to **CONFIRMED**:
    - Automatically checks stock availability. Returns `400 Bad Request` if requested quantity > current stock (no negative stock allowed).
    - Decrements product inventory (`currentStock -= quantity`).
    - Logs a `StockMovement` OUT record linked to the Challan number.
  - Snapshots product unit prices and product names into `ChallanItem` to protect historical invoice totals against future product price edits.
  - Cancel Challan: Restores stock and creates an `IN` stock movement record.

### 6. Admin Analytics Dashboard
- Live KPIs: Total Customers, Total Products, Low Stock Alerts Count, Recent Sales Challans.
- Quick action links and low inventory warnings.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js (Node.js) with TypeScript
- **Database ORM**: Prisma ORM with PostgreSQL
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, CORS, `helmet`
- **Validation**: Zod schema validation middleware

### Frontend
- **Framework**: React 19 + TypeScript scaffolded with Vite
- **Styling**: Vanilla CSS (Custom tokens, Glassmorphism design system, Outfit typography, dark mode theme)
- **Routing**: React Router v6
- **HTTP Client**: Axios with request/response interceptors

---

## 📁 Repository Structure

```
erp-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definitions
│   │   └── seed.ts              # Seeding demo users, products, and customers
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/         # Express request handlers
│   │   ├── middleware/          # Auth JWT, RBAC, Validation & Error middlewares
│   │   ├── prisma/              # Singleton Prisma client instance
│   │   ├── routes/              # API REST routers
│   │   ├── services/            # Core business logic & database queries
│   │   ├── utils/               # ApiError, ApiResponse, JWT utilities
│   │   ├── validations/         # Zod request validation schemas
│   │   ├── app.ts               # Express application initialization
│   │   └── server.ts            # Server entrypoint
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable Navbar, Sidebar, Modal, ProtectedRoute
│   │   ├── context/             # AuthContext with token state & RBAC helper
│   │   ├── pages/               # Login, Register, Dashboard, Customers, Products, Inventory, Challans
│   │   ├── services/            # Axios API instance
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # React Router setup
│   │   └── index.css            # Custom CSS & design system tokens
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Environment Variables Setup

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erp_crm_db?schema=public"
JWT_SECRET="supersecretkey_erp_crm_2026_jwt_token_auth_secret"
JWT_EXPIRES_IN="1d"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:5000/api"
```

---

## ⚙️ Installation & Running Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database instance running locally or via cloud (Supabase / Neon / Render)

### 2. Backend Setup
```bash
cd backend
npm install

# Generate Prisma Client
npm run prisma:generate

# Push Schema to PostgreSQL Database
npm run prisma:push

# Seed Initial Demo Data (Admin users, Customers, Products)
npm run prisma:seed

# Start Development Server
npm run dev
```
Backend will run at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at: `http://localhost:5173`

---

## 🔑 Demo Access Credentials (Default Seeded Users)

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@erp.com` | `admin123` | Full Access (Users, Customers, Products, Stock, Challans) |
| **SALES** | `sales@erp.com` | `admin123` | Customers CRM, Create Challans, View Inventory |
| **WAREHOUSE** | `warehouse@erp.com` | `admin123` | Product Catalog, Stock Adjustments, View Challans |
| **ACCOUNTS** | `accounts@erp.com` | `admin123` | Customers, Read-only Challans & Stock History |

---

## 📡 REST API Documentation

### 🔐 Auth Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new staff user with role |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current logged-in user profile |

### 👥 Customer CRM Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | ADMIN, SALES, ACCOUNTS | List customers with search, status & type filter |
| `POST` | `/api/customers` | ADMIN, SALES, ACCOUNTS | Create customer record |
| `GET` | `/api/customers/:id` | ADMIN, SALES, ACCOUNTS | Fetch single customer details |
| `PUT` | `/api/customers/:id` | ADMIN, SALES, ACCOUNTS | Update customer details |
| `DELETE` | `/api/customers/:id` | ADMIN, SALES | Delete customer record |
| `POST` | `/api/customers/:id/notes` | ADMIN, SALES, ACCOUNTS | Add date-stamped follow-up note |

### 📦 Product & Stock Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | All Roles | List products with SKU search & low stock filter |
| `POST` | `/api/products` | ADMIN, WAREHOUSE | Add new product to catalog |
| `GET` | `/api/products/:id` | All Roles | Get product details & stock movement history |
| `PUT` | `/api/products/:id` | ADMIN, WAREHOUSE | Update product price, SKU, or location |
| `DELETE` | `/api/products/:id` | ADMIN, WAREHOUSE | Delete product |
| `POST` | `/api/products/:id/adjust-stock` | ADMIN, WAREHOUSE | Manual Stock IN/OUT with audit reason |
| `GET` | `/api/stock-movement` | All Roles | View stock audit ledger history |

### 📄 Sales Challan Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/challans` | All Roles | List sales challans with search & status filter |
| `POST` | `/api/challans` | ADMIN, SALES | Create Sales Challan (DRAFT or CONFIRMED) |
| `GET` | `/api/challans/:id` | All Roles | Get Challan invoice snapshot details |
| `PUT` | `/api/challans/:id/status` | All Roles | Update status (e.g. DRAFT -> CONFIRMED) |

---

## 🧪 Testing with Postman

1. **Login Request**:
   - `POST http://localhost:5000/api/auth/login`
   - Body (JSON): `{"email": "admin@erp.com", "password": "admin123"}`
   - Copy the returned `token` from `data.token`.

2. **Authenticated Request**:
   - Set Header: `Authorization: Bearer <YOUR_JWT_TOKEN>`

3. **Create Sales Challan (Confirm & Deduct Stock)**:
   - `POST http://localhost:5000/api/challans`
   - Body (JSON):
     ```json
     {
       "customerId": "<CUSTOMER_UUID>",
       "status": "CONFIRMED",
       "items": [
         {
           "productId": "<PRODUCT_UUID>",
           "quantity": 2
         }
       ]
     }
     ```

---

## 🌐 Production Deployment Guide

### Database (Supabase PostgreSQL)
1. Create a free project on [Supabase](https://supabase.com/).
2. Copy the Connection String URI from Project Settings -> Database.
3. Paste into `backend/.env` under `DATABASE_URL`.
4. Run `npx prisma db push` to initialize tables.

### Backend (Render / Railway)
1. Push your repository to GitHub.
2. Create a New Web Service on Render/Railway pointing to the `backend/` directory.
3. Build Command: `npm install && npm run build && npx prisma generate`
4. Start Command: `npm run start`
5. Set Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`).

### Frontend (Vercel)
1. Create a project on [Vercel](https://vercel.com/) linked to your repository.
2. Set Root Directory to `frontend`.
3. Framework Preset: `Vite`.
4. Set Environment Variable: `VITE_API_URL=https://your-backend-service.onrender.com/api`.
5. Deploy!
