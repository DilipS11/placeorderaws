import { json } from '@sveltejs/kit';
//import { readDb, writeDb } from '#lib/server/db.js';
const AWS_API_URL =
  'https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api/customers';


// GET /api/customers - list all customers or search
// export async function GET({ url }) {
// 	const db = readDb();
// 	const search = url.searchParams.get('search');
// 	const customerId = url.searchParams.get('customerId');

// 	if (customerId) {
// 		const cust = db.customers.find((c) => c.customerId === customerId);
// 		if (!cust) return json({ error: 'Customer not found' }, { status: 404 });
// 		return json(cust);
// 	}

// 	let customers = db.customers;
// 	if (search) {
// 		const q = search.toLowerCase();
// 		customers = customers.filter(
// 			(c) =>
// 				c.name.toLowerCase().includes(q) ||
// 				c.customerId.toLowerCase().includes(q) ||
// 				c.email.toLowerCase().includes(q)
// 		);
// 	}

// 	return json(customers);
// }

export async function GET({ url, fetch }) {
  try {
    // Get optional customer ID from query parameter

    const customerId = url.searchParams.get('id');

    // Call AWS endpoint with or without customer ID
    const endpoint = customerId
      ? `${AWS_API_URL}/${encodeURIComponent(customerId)}`
      : AWS_API_URL;

	// console.log('AWS endpoint get custid:', endpoint);
    const response = await fetch(endpoint);
    const data = await response.text();
	// console.log('AWS status:', response.status);
    // console.log('AWS response:', data);

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') ??
          'application/json'
      }
    });
  } catch (error) {
    console.error('AWS API error:', error);

    return json(
      { message: 'Unable to connect to AWS API' },
      { status: 502 }
    );
  }
}

// POST /api/customers - create customer
// export async function POST({ request }) {
// 	try {
// 		const payload = await request.json();
// 		const db = readDb();

// 		const customerId = payload.customerId?.trim() || `CUST-${Date.now().toString().slice(-4)}`;

// 		if (!payload.name) {
// 			return json({ error: 'Customer name is required' }, { status: 400 });
// 		}

// 		if (db.customers.some((c) => c.customerId === customerId)) {
// 			return json({ error: `Customer with ID ${customerId} already exists` }, { status: 409 });
// 		}

// 		const newCustomer = {
// 			customerId,
// 			name: String(payload.name).trim(),
// 			country: payload.country ? String(payload.country).trim() : '',
// 			address1: payload.address1 ? String(payload.address1).trim() : '',
// 			address2: payload.address2 ? String(payload.address2).trim() : '',
// 			city: payload.city ? String(payload.city).trim() : '',
// 			state: payload.state ? String(payload.state).trim() : '',
// 			zipCode: payload.zipCode ? String(payload.zipCode).trim() : '',
// 			email: payload.email ? String(payload.email).trim() : '',
// 			contactPhone: payload.contactPhone ? String(payload.contactPhone).trim() : '',
// 			availablePoints: Number(payload.availablePoints) || 0
// 		};

// 		db.customers.push(newCustomer);
// 		writeDb(db);

// 		return json(newCustomer, { status: 201 });
// 	} catch (err) {
// 		return json({ error: err.message }, { status: 500 });
// 	}
// }

export async function POST({ request, fetch }) {
  try {
    const customerData = await request.json();

    // Basic validation
    if (!customerData.name || !customerData.email) {
      return json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Send customer data to AWS API Gateway
    const response = await fetch(AWS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });

    const responseText = await response.text();

    return new Response(responseText, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') ??
          'application/json'
      }
    });
  } catch (error) {
    console.error('Create customer error:', error);

    return json(
      { message: 'Unable to create customer' },
      { status: 502 }
    );
  }
}


