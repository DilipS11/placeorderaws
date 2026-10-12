# SvelteKit Order & Points Management System

A standard, clean demo business application created with SvelteKit. All frontend modules interact directly with the backend endpoints via standard HTTP REST API methods.

---

## 1. Project Structure

- `src/lib/server/db.js`: File-based JSON data persistence layer (`data/db.json`).
- `src/routes/api/products/+server.js`: API endpoints for Products (`GET`, `POST`, `PATCH`, `DELETE`).
- `src/routes/api/customers/+server.js`: API endpoints for Customers (`GET`, `POST`, `PATCH`, `DELETE`).
- `src/routes/api/orders/+server.js`: API endpoints for Bulk Orders (`GET`, `POST`).
- `src/routes/api/points/+server.js`: API endpoints for Points (`GET`, `POST`).
- `src/routes/+layout.svelte`: App shell with navigation bar and clean business styling.
- `src/routes/+page.svelte`: Home dashboard with metric totals and API overview.
- `src/routes/products/+page.svelte`: Products UI (Create, Edit, Delete, Filter, View).
- `src/routes/customers/+page.svelte`: Customers UI (Create, Edit, Delete, Search, View).
- `src/routes/orders/+page.svelte`: Bulk Order placement UI with multi-line calculation and Order History.
- `src/routes/points/+page.svelte`: Points Wallet UI (Balance check, Assign points, Deduct points).

---

## 2. API Endpoints Specification

### 1. Products API (`/api/products`)
| Method | Query / Body | Description |
|---|---|---|
| `GET` | `?search=...&category=...` | List all products or filter by query |
| `POST` | `{ productId, name, category, points, amount, imageUrl }` | Create new product |
| `PATCH` | `{ productId, name, category, points, amount, imageUrl }` | Update existing product |
| `DELETE` | `?productId=...` or `{ productId: "..." }` | Delete a product |

### 2. Customers API (`/api/customers`)
| Method | Query / Body | Description |
|---|---|---|
| `GET` | `?customerId=...` or `?search=...` | List all customers or get single customer |
| `POST` | `{ customerId, name, country, address1, address2, city, state, zipCode, email, contactPhone, availablePoints }` | Create customer |
| `PATCH` | `{ customerId, ...fieldsToUpdate }` | Update customer record |
| `DELETE` | `?customerId=...` | Delete a customer |

### 3. Orders API (`/api/orders`)
| Method | Query / Body | Description |
|---|---|---|
| `GET` | `?customerId=...` or `?orderId=...` | Fetch orders history with line items |
| `POST` | `{ customerId, items: [ { productId, quantity } ] }` | Place Bulk Order. Generates `OrderId`, `OrderLineId` items, computes `OrderAmount` & `TotalPoints`, and credits points to customer balance. |

### 4. Points API (`/api/points`)
| Method | Query / Body | Description |
|---|---|---|
| `GET` | `?customerId=...` | Fetch customer points balance |
| `POST` | `{ customerId, action: 'ASSIGN' \| 'DEDUCT', points: number, reason?: string }` | Assign or deduct points with balance checks |

---

## 3. Running the Project

```bash
# Start development server
npm run dev

# Or build and preview
npm run build
npm run preview
```

Server runs by default at `http://localhost:5173`.
