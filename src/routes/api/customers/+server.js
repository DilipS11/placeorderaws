import { json } from '@sveltejs/kit';
import { readDb, writeDb } from '#lib/server/db.js';

// GET /api/customers - list all customers or search
export async function GET({ url }) {
	const db = readDb();
	const search = url.searchParams.get('search');
	const customerId = url.searchParams.get('customerId');

	if (customerId) {
		const cust = db.customers.find((c) => c.customerId === customerId);
		if (!cust) return json({ error: 'Customer not found' }, { status: 404 });
		return json(cust);
	}

	let customers = db.customers;
	if (search) {
		const q = search.toLowerCase();
		customers = customers.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.customerId.toLowerCase().includes(q) ||
				c.email.toLowerCase().includes(q)
		);
	}

	return json(customers);
}

// POST /api/customers - create customer
export async function POST({ request }) {
	try {
		const payload = await request.json();
		const db = readDb();

		const customerId = payload.customerId?.trim() || `CUST-${Date.now().toString().slice(-4)}`;

		if (!payload.name) {
			return json({ error: 'Customer name is required' }, { status: 400 });
		}

		if (db.customers.some((c) => c.customerId === customerId)) {
			return json({ error: `Customer with ID ${customerId} already exists` }, { status: 409 });
		}

		const newCustomer = {
			customerId,
			name: String(payload.name).trim(),
			country: payload.country ? String(payload.country).trim() : '',
			address1: payload.address1 ? String(payload.address1).trim() : '',
			address2: payload.address2 ? String(payload.address2).trim() : '',
			city: payload.city ? String(payload.city).trim() : '',
			state: payload.state ? String(payload.state).trim() : '',
			zipCode: payload.zipCode ? String(payload.zipCode).trim() : '',
			email: payload.email ? String(payload.email).trim() : '',
			contactPhone: payload.contactPhone ? String(payload.contactPhone).trim() : '',
			availablePoints: Number(payload.availablePoints) || 0
		};

		db.customers.push(newCustomer);
		writeDb(db);

		return json(newCustomer, { status: 201 });
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}

// PATCH /api/customers - update customer
export async function PATCH({ request }) {
	try {
		const payload = await request.json();
		if (!payload.customerId) {
			return json({ error: 'customerId is required to update' }, { status: 400 });
		}

		const db = readDb();
		const index = db.customers.findIndex((c) => c.customerId === payload.customerId);

		if (index === -1) {
			return json({ error: 'Customer not found' }, { status: 404 });
		}

		const current = db.customers[index];
		const updatedCustomer = {
			...current,
			name: payload.name !== undefined ? String(payload.name).trim() : current.name,
			country: payload.country !== undefined ? String(payload.country).trim() : current.country,
			address1: payload.address1 !== undefined ? String(payload.address1).trim() : current.address1,
			address2: payload.address2 !== undefined ? String(payload.address2).trim() : current.address2,
			city: payload.city !== undefined ? String(payload.city).trim() : current.city,
			state: payload.state !== undefined ? String(payload.state).trim() : current.state,
			zipCode: payload.zipCode !== undefined ? String(payload.zipCode).trim() : current.zipCode,
			email: payload.email !== undefined ? String(payload.email).trim() : current.email,
			contactPhone: payload.contactPhone !== undefined ? String(payload.contactPhone).trim() : current.contactPhone,
			availablePoints:
				payload.availablePoints !== undefined
					? Number(payload.availablePoints)
					: current.availablePoints
		};

		db.customers[index] = updatedCustomer;
		writeDb(db);

		return json(updatedCustomer);
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}

// DELETE /api/customers - delete customer
export async function DELETE({ url, request }) {
	try {
		let customerId = url.searchParams.get('customerId');
		if (!customerId) {
			try {
				const body = await request.json();
				customerId = body.customerId;
			} catch (_) {}
		}

		if (!customerId) {
			return json({ error: 'customerId is required to delete' }, { status: 400 });
		}

		const db = readDb();
		const index = db.customers.findIndex((c) => c.customerId === customerId);

		if (index === -1) {
			return json({ error: 'Customer not found' }, { status: 404 });
		}

		const removed = db.customers.splice(index, 1)[0];
		writeDb(db);

		return json({ message: 'Customer deleted successfully', customer: removed });
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}
