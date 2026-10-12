import { json } from '@sveltejs/kit';
import { readDb, writeDb } from '#lib/server/db.js';

// GET /api/orders - list all orders or filter by customerId
export async function GET({ url }) {
	const db = readDb();
	const customerId = url.searchParams.get('customerId');
	const orderId = url.searchParams.get('orderId');

	if (orderId) {
		const order = db.orders.find((o) => o.orderId === orderId);
		if (!order) {
			return json({ error: 'Order not found' }, { status: 404 });
		}
		return json(order);
	}

	let orders = db.orders;
	if (customerId) {
		orders = orders.filter((o) => o.customerId === customerId);
	}

	return json(orders);
}

// POST /api/orders - Bulk Order creation
// Payload:
// {
//   customerId: string,
//   items: [
//     { productId: string, quantity: number }
//   ],
//   usePointsForDiscount?: boolean (optional demo flag)
// }
export async function POST({ request }) {
	try {
		const payload = await request.json();
		const { customerId, items } = payload;

		if (!customerId) {
			return json({ error: 'customerId is required' }, { status: 400 });
		}

		if (!Array.isArray(items) || items.length === 0) {
			return json({ error: 'items array is required and must contain at least 1 item' }, { status: 400 });
		}

		const db = readDb();
		const customer = db.customers.find((c) => c.customerId === customerId);
		if (!customer) {
			return json({ error: `Customer ${customerId} not found` }, { status: 404 });
		}

		const orderId = `ORD-${Date.now().toString().slice(-6)}`;
		let orderAmount = 0;
		let totalPoints = 0;
		const orderDetails = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const prodId = item.productId;
			const qty = Number(item.quantity);

			if (!prodId) {
				return json({ error: `Item at index ${i} is missing productId` }, { status: 400 });
			}
			if (isNaN(qty) || qty <= 0) {
				return json({ error: `Item at index ${i} has invalid quantity (${qty})` }, { status: 400 });
			}

			const product = db.products.find((p) => p.productId === prodId);
			if (!product) {
				return json({ error: `Product ${prodId} not found` }, { status: 404 });
			}

			const unitPrice = Number(product.amount) || 0;
			const unitPoints = Number(product.points) || 0;
			const totalPrice = Number((unitPrice * qty).toFixed(2));
			const linePoints = unitPoints * qty;

			orderAmount += totalPrice;
			totalPoints += linePoints;

			orderDetails.push({
				orderId,
				orderLineId: String(i + 1),
				productId: product.productId,
				quantity: qty,
				unitPrice,
				unitPoints,
				totalPrice,
				totalPoints: linePoints
			});
		}

		orderAmount = Number(orderAmount.toFixed(2));

		// Award points earned on the order to customer
		customer.availablePoints = (customer.availablePoints || 0) + totalPoints;

		const orderHeader = {
			orderId,
			orderDate: new Date().toISOString(),
			customerId,
			orderAmount,
			totalPoints,
			items: orderDetails
		};

		db.orders.unshift(orderHeader);
		writeDb(db);

		return json(
			{
				message: 'Order created successfully',
				order: orderHeader,
				customerNewBalance: customer.availablePoints
			},
			{ status: 201 }
		);
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}
