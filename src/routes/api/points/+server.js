import { json } from '@sveltejs/kit';
import { readDb, writeDb } from '#lib/server/db.js';

// GET /api/points?customerId=...
// Returns customer points balance and details
export async function GET({ url }) {
	const customerId = url.searchParams.get('customerId');
	if (!customerId) {
		return json({ error: 'customerId is required' }, { status: 400 });
	}

	const db = readDb();
	const customer = db.customers.find((c) => c.customerId === customerId);

	if (!customer) {
		return json({ error: 'Customer not found' }, { status: 404 });
	}

	return json({
		customerId: customer.customerId,
		name: customer.name,
		availablePoints: customer.availablePoints
	});
}

// POST /api/points
// Action: 'ASSIGN' (add points) or 'DEDUCT' (spend points)
// Body: { customerId, action: 'ASSIGN' | 'DEDUCT', points: number, reason?: string }
export async function POST({ request }) {
	try {
		const payload = await request.json();
		const { customerId, action, points, reason } = payload;

		if (!customerId) {
			return json({ error: 'customerId is required' }, { status: 400 });
		}

		const pointsNum = Number(points);
		if (isNaN(pointsNum) || pointsNum <= 0) {
			return json({ error: 'points must be a positive number' }, { status: 400 });
		}

		const actionUpper = String(action).toUpperCase();
		if (actionUpper !== 'ASSIGN' && actionUpper !== 'DEDUCT') {
			return json(
				{ error: 'action must be either "ASSIGN" (to add) or "DEDUCT" (to deduct)' },
				{ status: 400 }
			);
		}

		const db = readDb();
		const customer = db.customers.find((c) => c.customerId === customerId);

		if (!customer) {
			return json({ error: 'Customer not found' }, { status: 404 });
		}

		const previousPoints = customer.availablePoints;

		if (actionUpper === 'ASSIGN') {
			customer.availablePoints += pointsNum;
		} else if (actionUpper === 'DEDUCT') {
			if (customer.availablePoints < pointsNum) {
				return json(
					{
						error: `Insufficient points balance. Current: ${customer.availablePoints}, Requested deduction: ${pointsNum}`
					},
					{ status: 400 }
				);
			}
			customer.availablePoints -= pointsNum;
		}

		writeDb(db);

		return json({
			customerId: customer.customerId,
			name: customer.name,
			action: actionUpper,
			pointsProcessed: pointsNum,
			previousPoints,
			newBalance: customer.availablePoints,
			reason: reason || ''
		});
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}
