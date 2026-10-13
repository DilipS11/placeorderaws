# placeorderaws - SvelteKit Order & Points Management System

A standard business portal built with SvelteKit with live AWS Lambda / API Gateway integration.

---

## 1. Project Structure

- `src/lib/server/db.js`: File-based JSON data persistence layer (`data/db.json`).
- `src/routes/api/products/+server.js`: API endpoints for Products (`GET`, `POST`, `PATCH`, `DELETE`).
- `src/routes/api/customers/+server.js`: API endpoints for Customers (`GET`, `POST`, `PATCH`, `DELETE`).
- `src/routes/api/orders/+server.js`: API endpoints for Bulk Orders (`GET`, `POST`).
- `src/routes/api/points/+server.js`: API endpoints for Points (`GET`, `POST`).
- `src/routes/+layout.svelte`: Modern card & Inter UI shell with navigation bar.
- `src/routes/+page.svelte`: Home dashboard with metric totals and API overview.
- `src/routes/products/+page.svelte`: Products UI (Create, Edit, Delete, Filter, View).
- `src/routes/customers/+page.svelte`: Customers UI (Create, Edit, Delete, Search, View).
- `src/routes/orders/+page.svelte`: Bulk Order placement UI with multi-line calculation and Order History.
- `src/routes/points/+page.svelte`: Points Wallet UI (Balance check, Assign points, Deduct points).
- `src/routes/register/+page.svelte`: Customer Registration page connected to live AWS API.
- `src/routes/customer/[id]/+page.svelte`: Customer Dashboard displaying live points and AWS data.

---

## 2. API Endpoints Specification

### AWS API Endpoint
```
https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api
```
- `POST /customers`: Register customer
- `GET /customers/{id}`: Customer details & Available Points
- `GET /products`: Product items catalog

### Internal SvelteKit REST Endpoints (`/api/*`)
| Resource | Methods | Route | Description |
|---|---|---|---|
| Products | `GET`, `POST`, `PATCH`, `DELETE` | `/api/products` | Catalog CRUD with price, reward points & image URL |
| Customers | `GET`, `POST`, `PATCH`, `DELETE` | `/api/customers` | Customer directory with address and points balance |
| Orders | `GET`, `POST` | `/api/orders` | Bulk ordering, header & line items calculations |
| Points | `GET`, `POST` | `/api/points` | Query balance, assign points & deduct points |

---

## 3. Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

Default local server: `http://localhost:5173`
