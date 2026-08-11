# ERP-CRM System - Project Submission

## 1. GitHub Repository Link
**Repository:** https://github.com/nakulraskar17547/ERP-CRM

## 2. Live Frontend URL
**Application:** https://erp-crm-git-main-nakul8.vercel.app/

**Alternative URLs:**
- https://erp-crm-lilac.vercel.app/

## 3. Live Backend API URL
**API Base URL:** https://erp-crm-yepk.onrender.com/api

**Health Check:** https://erp-crm-yepk.onrender.com/health

**Note:** Backend is hosted on Render's free tier and may experience a 30-60 second cold start delay on first request after 15 minutes of inactivity.

## 4. Test Login Credentials

You can register your own account or use these test credentials:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@erp.com | admin123 | Full access to all features |
| **Sales** | sales@erp.com | sales123 | Customer management, create challans |
| **Warehouse** | warehouse@erp.com | warehouse123 | Product & inventory management |
| **Accounts** | accounts@erp.com | accounts123 | View-only access to customers & challans |

### Quick Login Steps:
1. Visit: https://erp-crm-git-main-nakul8.vercel.app/
2. Click "Login"
3. Use any credentials from the table above
4. Explore the dashboard

## 5. API Documentation

### Postman Collection
**File:** [ERP-CRM.postman_collection.json](./ERP-CRM.postman_collection.json)

**Import Instructions:**
1. Open Postman
2. Click Import → Select file
3. Choose `ERP-CRM.postman_collection.json`
4. Collection includes auto-authentication (token saved after login)

### Complete API Documentation
**File:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Includes:**
- All endpoints with request/response examples
- Authentication flow
- Role-based permissions matrix
- Error handling
- Query parameters

### Quick API Test
```bash
# Health Check
curl https://erp-crm-yepk.onrender.com/health

# Login (get token)
curl -X POST https://erp-crm-yepk.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"admin123"}'

# Get Dashboard Stats (with token)
curl https://erp-crm-yepk.onrender.com/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 6. Setup and Deployment Instructions

### Quick Start Guide
**File:** [README.md](./README.md)

**Covers:**
- Prerequisites
- Local development setup (with/without Docker)
- Environment configuration
- Database setup
- Production deployment

### Docker Setup
**File:** [DOCKER.md](./DOCKER.md)

**Includes:**
- Docker installation
- Development with hot reload
- Production deployment
- Docker commands reference
- Troubleshooting

### Deployment Guide
**File:** [DEPLOYMENT.md](./DEPLOYMENT.md)

**Covers:**
- Vercel deployment (Frontend)
- Render deployment (Backend)
- Environment variables
- Database initialization
- CORS configuration

## 7. Architecture Explanation

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│                                                              │
│  React 18 + TypeScript + Vite                               │
│  - Glass Morphism UI Design                                 │
│  - Context API for Auth State                               │
│  - Axios for HTTP requests                                  │
│  - React Router for navigation                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       │ (JWT Authentication)
┌──────────────────────▼──────────────────────────────────────┐
│                     API Gateway Layer                        │
│                                                              │
│  Vercel CDN (Frontend)                                      │
│  - Global edge network                                      │
│  - Automatic HTTPS                                          │
│  - Environment variables injection                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 Application Server Layer                     │
│                                                              │
│  Node.js 18 + Express.js + TypeScript                       │
│  Deployed on Render (Docker container)                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Middleware Stack                                     │   │
│  │ • Helmet (Security headers)                         │   │
│  │ • CORS (Cross-origin resource sharing)             │   │
│  │ • JWT Authentication                                │   │
│  │ • Role-based Access Control (RBAC)                 │   │
│  │ • Request validation (Zod)                         │   │
│  │ • Error handling                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Routes                                          │   │
│  │ /api/auth      - Authentication                     │   │
│  │ /api/customers - Customer CRM                       │   │
│  │ /api/products  - Inventory management               │   │
│  │ /api/challans  - Delivery notes                     │   │
│  │ /api/stock-movements - Stock history                │   │
│  │ /api/dashboard - Analytics                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Business Logic Layer (Services)                     │   │
│  │ • AuthService - User registration & login           │   │
│  │ • CustomerService - CRM operations                  │   │
│  │ • ProductService - Inventory management             │   │
│  │ • ChallanService - Delivery note generation         │   │
│  │ • StockMovementService - Inventory tracking         │   │
│  │ • DashboardService - Metrics aggregation            │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Prisma ORM
                       │ (Type-safe database queries)
┌──────────────────────▼──────────────────────────────────────┐
│                    Data Persistence Layer                    │
│                                                              │
│  PostgreSQL Database (Supabase)                             │
│  Region: ap-south-1 (Mumbai)                                │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Database Schema                                      │   │
│  │ • User          - Authentication & roles            │   │
│  │ • Customer      - CRM records                       │   │
│  │ • Product       - Inventory catalog                 │   │
│  │ • StockMovement - Inventory transactions            │   │
│  │ • Challan       - Delivery notes                    │   │
│  │ • ChallanItem   - Line items                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Features:                                                   │
│  • Connection pooling (PgBouncer)                           │
│  • Automatic backups                                        │
│  • SSL encryption                                           │
└──────────────────────────────────────────────────────────────┘
```

### Technology Stack Justification

**Frontend: React + TypeScript + Vite**
- **React 18:** Modern component-based UI, excellent ecosystem
- **TypeScript:** Type safety, better developer experience, fewer runtime errors
- **Vite:** Lightning-fast dev server, optimized production builds

**Backend: Node.js + Express + TypeScript**
- **Node.js:** JavaScript everywhere, large ecosystem, excellent for I/O operations
- **Express:** Minimal, flexible, battle-tested web framework
- **TypeScript:** Shared types with frontend, catch errors at compile time

**Database: PostgreSQL (Supabase)**
- **PostgreSQL:** ACID compliance, relational data integrity, advanced features
- **Supabase:** Managed PostgreSQL, connection pooling, automatic backups, generous free tier

**ORM: Prisma**
- Type-safe database queries
- Automatic migrations
- Excellent TypeScript integration
- Database-agnostic (easy to switch providers)

**Authentication: JWT**
- Stateless authentication
- Scalable (no server-side sessions)
- Works across distributed systems

**Deployment:**
- **Vercel (Frontend):** Zero-config, global CDN, automatic HTTPS, git-based deployments
- **Render (Backend):** Docker support, automatic deployments, free tier, easy scaling

### Data Flow Example: Creating a Challan

```
1. User clicks "Create Challan" (Frontend)
   ↓
2. React form collects: customer, products, quantities
   ↓
3. POST /api/challans with JWT token
   ↓
4. Express receives request
   ↓
5. Middleware chain:
   - JWT verification (auth.middleware.ts)
   - Role check (rbac.middleware.ts - must be ADMIN or SALES)
   - Request validation (Zod schema)
   ↓
6. ChallanController.create() called
   ↓
7. ChallanService.createChallan():
   - Generate challan number (CH-001, CH-002, etc.)
   - Calculate totals
   - Database transaction:
     a. Create challan record
     b. Create challan items
     c. Update product stock (subtract quantities)
     d. Create stock movement records
   ↓
8. Return created challan with items
   ↓
9. Frontend receives response, updates UI, shows success
```

### Security Measures

**Authentication & Authorization:**
- JWT tokens with expiration (1 day)
- Password hashing with bcrypt (salt rounds: 10)
- Role-based access control (4 roles)
- Protected routes (both frontend & backend)

**API Security:**
- Helmet.js for security headers
- CORS configured for specific origins
- Input validation with Zod
- SQL injection prevention (Prisma parameterized queries)
- XSS protection (React escapes by default)

**Database Security:**
- Connection pooling (prevents exhaustion)
- SSL/TLS encryption (Supabase default)
- Environment variables for credentials
- No sensitive data in version control

**Deployment Security:**
- HTTPS everywhere (Vercel & Render automatic)
- Environment secrets in platform dashboards
- Docker isolation
- Regular dependency updates

## 8. Known Limitations & Incomplete Parts

### Current Limitations

**1. Render Free Tier Cold Starts**
- **Issue:** Backend spins down after 15 minutes of inactivity
- **Impact:** First request takes 30-60 seconds
- **Solution:** Upgrade to paid tier ($7/month) or use UptimeRobot to keep warm
- **Status:** Working as intended for free tier

**2. No Real-time Updates**
- **Issue:** Changes made by one user don't automatically appear for other users
- **Impact:** Users must manually refresh to see updates
- **Potential Solution:** WebSocket implementation or polling
- **Status:** Not implemented

**3. Limited File Upload**
- **Issue:** No document/image upload for customers or products
- **Impact:** Cannot attach invoices, product images, etc.
- **Potential Solution:** AWS S3 or Cloudinary integration
- **Status:** Not implemented

**4. No Email Notifications**
- **Issue:** System doesn't send email alerts (low stock, follow-ups, etc.)
- **Impact:** Users must check manually
- **Potential Solution:** SendGrid or AWS SES integration
- **Status:** Not implemented

**5. Basic Reporting**
- **Issue:** No PDF/Excel export, limited analytics
- **Impact:** Cannot generate formal reports
- **Potential Solution:** PDF library (jsPDF) or reporting service
- **Status:** Dashboard shows basic metrics only

**6. No Invoice Generation**
- **Issue:** Challans exist but not full invoices with tax calculations
- **Impact:** Cannot generate tax invoices
- **Potential Solution:** Invoice generator with GST calculations
- **Status:** Not implemented

**7. Single Currency**
- **Issue:** Only supports one currency (INR assumed)
- **Impact:** Cannot handle international transactions
- **Potential Solution:** Multi-currency support with exchange rates
- **Status:** Not implemented

**8. No Bulk Operations**
- **Issue:** Cannot bulk import/export customers or products
- **Impact:** Manual data entry for large datasets
- **Potential Solution:** CSV import/export functionality
- **Status:** Not implemented

**9. Limited Search**
- **Issue:** Basic text search, no advanced filters
- **Impact:** Harder to find records in large datasets
- **Potential Solution:** Elasticsearch or advanced SQL queries
- **Status:** Basic search implemented

**10. No Audit Trail**
- **Issue:** Cannot track who changed what and when
- **Impact:** No compliance audit capability
- **Potential Solution:** Audit log table with user actions
- **Status:** Not implemented

### Edge Cases & Known Issues

**1. Stock Adjustment Race Conditions**
- Multiple simultaneous stock adjustments may cause inconsistencies
- Mitigation: Database transactions help, but optimistic locking not implemented

**2. Challan Deletion**
- Deleting a challan doesn't restore product stock
- Workaround: Update challan status to "CANCELLED" instead of deleting

**3. Mobile Responsiveness**
- UI is functional on mobile but not optimized
- Tables may overflow on small screens

**4. Password Reset**
- No "forgot password" functionality
- Users cannot self-service password resets
- Admin must manually update passwords

**5. Session Management**
- JWT tokens remain valid until expiration even after logout
- No token revocation mechanism
- Workaround: Short expiration times (1 day)

### Testing Coverage

**✅ Manually Tested:**
- User registration and login
- Role-based access control
- Customer CRUD operations
- Product inventory management
- Challan creation and management
- Dashboard metrics
- API endpoints via Postman

**❌ Not Implemented:**
- Unit tests
- Integration tests
- End-to-end tests
- Load testing
- Security testing (penetration)

### Browser Compatibility

**✅ Tested & Working:**
- Chrome 120+
- Edge 120+
- Firefox 120+

**⚠️ Limited Testing:**
- Safari (assumed working but not extensively tested)
- Mobile browsers (functional but not optimized)

**❌ Not Supported:**
- Internet Explorer (obsolete, not supported)

### Performance Notes

**Frontend:**
- Initial load: ~2-3 seconds (including assets)
- Route changes: Instant (client-side routing)
- Bundle size: ~500KB gzipped

**Backend:**
- Cold start (Render free tier): 30-60 seconds
- Warm response time: 200-500ms
- Database queries: 50-200ms (Supabase ap-south-1)

### Future Improvements Priority

**High Priority:**
1. Email notifications
2. PDF/Excel export
3. Password reset flow
4. Comprehensive unit tests
5. Mobile-optimized UI

**Medium Priority:**
6. Real-time updates (WebSockets)
7. Audit trail logging
8. Bulk import/export
9. Advanced search & filters
10. File upload support

**Low Priority:**
11. Multi-currency support
12. Dark mode
13. Mobile app (React Native)
14. Multi-language support
15. Advanced analytics

---

## Summary

This ERP-CRM system is a **fully functional MVP** suitable for small to medium businesses. It demonstrates:

✅ Full-stack development skills
✅ RESTful API design
✅ Authentication & authorization
✅ Database design & relationships
✅ Docker containerization
✅ Cloud deployment
✅ Modern frontend development
✅ TypeScript expertise
✅ Production-ready code structure

**Production Readiness: 80%**
- Core features complete and working
- Known limitations documented
- Scalable architecture
- Security best practices implemented
- Missing: Advanced features, comprehensive testing, and some polish

**Ideal For:**
- Small businesses needing basic ERP/CRM
- Portfolio/demonstration project
- Foundation for larger enterprise system
- Learning modern web development practices

---

## Contact & Support

**Developer:** Nakul Raskar
**GitHub:** https://github.com/nakulraskar17547
**Repository:** https://github.com/nakulraskar17547/ERP-CRM

For questions, issues, or contributions, please open an issue on GitHub.

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** Deployed & Live ✅
