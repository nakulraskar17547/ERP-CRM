# ERP-CRM System API Documentation

**Base URL:** `http://localhost:5000/api`

**Authentication:** Most endpoints require JWT token in Authorization header: `Bearer <token>`

---

## Authentication

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "SALES"
}
```

**Roles:** `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "SALES"
    },
    "token": "jwt_token_here"
  }
}
```

---

### Login
**POST** `/auth/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "SALES"
    },
    "token": "jwt_token_here"
  }
}
```

---

### Get Current User
**GET** `/auth/me`

Get logged-in user details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "SALES"
  }
}
```

---

## Dashboard

### Get Dashboard Stats
**GET** `/dashboard/stats`

Get overview metrics for dashboard.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 50,
    "totalProducts": 120,
    "lowStockCount": 5,
    "lowStockProducts": [
      {
        "id": "uuid",
        "productName": "Product Name",
        "SKU": "SKU123",
        "currentStock": 5,
        "minimumStockAlert": 10
      }
    ],
    "recentChallans": [
      {
        "id": "uuid",
        "challanNumber": "CH-001",
        "totalAmount": 5000,
        "status": "DELIVERED",
        "customer": {
          "id": "uuid",
          "customerName": "Customer Name",
          "businessName": "Business Name"
        }
      }
    ]
  }
}
```

---

## Customers

### Get All Customers
**GET** `/customers`

Get list of all customers with optional filters.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, ACCOUNTS

**Query Parameters:**
- `status` (optional): Filter by status (LEAD, ACTIVE, INACTIVE)
- `customerType` (optional): Filter by type (WHOLESALE, RETAIL)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "customerName": "John Doe",
      "mobileNumber": "1234567890",
      "email": "customer@example.com",
      "businessName": "Business Name",
      "gstNumber": "GST123",
      "customerType": "WHOLESALE",
      "address": "Address",
      "status": "ACTIVE",
      "followUpDate": "2026-08-15T00:00:00.000Z",
      "notes": "Customer notes"
    }
  ]
}
```

---

### Create Customer
**POST** `/customers`

Create a new customer.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, ACCOUNTS

**Request Body:**
```json
{
  "customerName": "John Doe",
  "mobileNumber": "1234567890",
  "email": "customer@example.com",
  "businessName": "Business Name",
  "gstNumber": "GST123",
  "customerType": "WHOLESALE",
  "address": "Full Address",
  "status": "LEAD",
  "followUpDate": "2026-08-15",
  "notes": "Initial notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerName": "John Doe",
    ...
  }
}
```

---

### Get Customer by ID
**GET** `/customers/:id`

Get single customer details.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, ACCOUNTS

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerName": "John Doe",
    ...
  }
}
```

---

### Update Customer
**PUT** `/customers/:id`

Update customer details.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, ACCOUNTS

**Request Body:** (All fields optional)
```json
{
  "customerName": "Updated Name",
  "status": "ACTIVE",
  "notes": "Updated notes"
}
```

---

### Delete Customer
**DELETE** `/customers/:id`

Delete a customer.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

### Add Note to Customer
**POST** `/customers/:id/notes`

Add a note to customer record.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, ACCOUNTS

**Request Body:**
```json
{
  "note": "Follow-up completed. Customer interested in bulk order."
}
```

---

## Products

### Get All Products
**GET** `/products`

Get list of all products.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, WAREHOUSE, ACCOUNTS

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "productName": "Product Name",
      "SKU": "SKU123",
      "category": "Electronics",
      "unitPrice": 1000,
      "currentStock": 50,
      "minimumStockAlert": 10,
      "warehouseLocation": "A-101"
    }
  ]
}
```

---

### Create Product
**POST** `/products`

Create a new product.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, WAREHOUSE

**Request Body:**
```json
{
  "productName": "Product Name",
  "SKU": "SKU123",
  "category": "Electronics",
  "unitPrice": 1000,
  "currentStock": 50,
  "minimumStockAlert": 10,
  "warehouseLocation": "A-101"
}
```

---

### Get Product by ID
**GET** `/products/:id`

Get single product details.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, WAREHOUSE, ACCOUNTS

---

### Update Product
**PUT** `/products/:id`

Update product details.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, WAREHOUSE

**Request Body:** (All fields optional)
```json
{
  "productName": "Updated Product Name",
  "unitPrice": 1200,
  "minimumStockAlert": 15
}
```

---

### Delete Product
**DELETE** `/products/:id`

Delete a product.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, WAREHOUSE

---

### Adjust Stock
**POST** `/products/:id/adjust-stock`

Manually adjust product stock.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, WAREHOUSE

**Request Body:**
```json
{
  "quantityChanged": 10,
  "movementType": "IN",
  "reason": "New stock received from supplier"
}
```

**Movement Types:** `IN`, `OUT`, `ADJUSTMENT`

---

## Stock Movements

### Get All Stock Movements
**GET** `/stock-movements`

Get history of all stock movements.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, WAREHOUSE, ACCOUNTS

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "quantityChanged": 10,
      "movementType": "IN",
      "reason": "Stock received",
      "timestamp": "2026-08-11T19:00:00.000Z",
      "product": {
        "id": "uuid",
        "productName": "Product Name",
        "SKU": "SKU123"
      },
      "createdBy": {
        "id": "uuid",
        "fullName": "John Doe"
      }
    }
  ]
}
```

---

## Challans (Delivery Notes)

### Get All Challans
**GET** `/challans`

Get list of all challans.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, WAREHOUSE, ACCOUNTS

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "challanNumber": "CH-001",
      "totalQuantity": 100,
      "totalAmount": 5000,
      "status": "DELIVERED",
      "createdAt": "2026-08-11T19:00:00.000Z",
      "customer": {
        "id": "uuid",
        "customerName": "Customer Name",
        "businessName": "Business Name"
      }
    }
  ]
}
```

---

### Create Challan
**POST** `/challans`

Create a new delivery challan.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES

**Request Body:**
```json
{
  "customerId": "customer_uuid",
  "items": [
    {
      "productId": "product_uuid",
      "quantity": 10
    },
    {
      "productId": "product_uuid_2",
      "quantity": 5
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "challanNumber": "CH-001",
    "totalQuantity": 15,
    "totalAmount": 5000,
    "status": "DRAFT",
    "items": [...]
  }
}
```

---

### Get Challan by ID
**GET** `/challans/:id`

Get single challan details with items.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, WAREHOUSE, ACCOUNTS

---

### Update Challan Status
**PUT** `/challans/:id/status`

Update challan status.

**Headers:** `Authorization: Bearer <token>`

**Access:** ADMIN, SALES, WAREHOUSE, ACCOUNTS

**Request Body:**
```json
{
  "status": "DELIVERED"
}
```

**Status Values:** `DRAFT`, `APPROVED`, `DISPATCHED`, `DELIVERED`, `CANCELLED`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Optional validation errors
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Role-Based Access Control

| Endpoint | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|----------|-------|-------|-----------|----------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Customer (View) | ✓ | ✓ | - | ✓ |
| Customer (Create/Edit) | ✓ | ✓ | - | ✓ |
| Customer (Delete) | ✓ | ✓ | - | - |
| Product (View) | ✓ | ✓ | ✓ | ✓ |
| Product (Create/Edit) | ✓ | - | ✓ | - |
| Stock Movements | ✓ | ✓ | ✓ | ✓ |
| Challan (View) | ✓ | ✓ | ✓ | ✓ |
| Challan (Create) | ✓ | ✓ | - | - |
| Challan (Update Status) | ✓ | ✓ | ✓ | ✓ |

---

## Testing with Postman

1. **Import this collection** or create requests manually
2. **Register a user** using `/auth/register`
3. **Login** to get JWT token
4. **Set Authorization** header: `Bearer <your_token>`
5. **Test other endpoints**

For local testing: `http://localhost:5000/api`
