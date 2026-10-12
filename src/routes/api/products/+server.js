import { json } from '@sveltejs/kit';
import { readDb, writeDb } from '#lib/server/db.js';

// GET /api/products - list all products or filter by category/search
export async function GET({ url }) {
	const db = readDb();
	const category = url.searchParams.get('category');
	const search = url.searchParams.get('search');

	let products = [...db.products];

	// Sync products from AWS endpoint if available
	try {
		const res = await fetch("https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api/products");
		if (res.ok) {
			const data = await res.json();
			const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data;
			const awsList = parsed.products || [];
			for (const item of awsList) {
				const prodId = item.ProductId || item.productId;
				if (!products.some(p => p.productId === prodId)) {
					products.push({
						productId: prodId,
						name: item.name,
						category: item.category || 'General',
						points: Number(item.points) || 0,
						amount: Number(item.price ?? item.amount) || 0,
						imageUrl: item.imageURL || item.imageUrl || ''
					});
				}
			}
		}
	} catch (e) {
		// fallback to local data silently
	}

	if (category) {
		products = products.filter(
			(p) => p.category.toLowerCase() === category.toLowerCase()
		);
	}
	if (search) {
		const q = search.toLowerCase();
		products = products.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.productId.toLowerCase().includes(q) ||
				p.category.toLowerCase().includes(q)
		);
	}

	return json(products);
}

// POST /api/products - create product
export async function POST({ request }) {
	try {
		const payload = await request.json();
		const db = readDb();

		const productId = payload.productId?.trim() || `PROD-${Date.now().toString().slice(-4)}`;
		
		if (!payload.name) {
			return json({ error: 'Product name is required' }, { status: 400 });
		}

		if (db.products.some((p) => p.productId === productId)) {
			return json({ error: `Product with ID ${productId} already exists` }, { status: 409 });
		}

		const newProduct = {
			productId,
			name: String(payload.name).trim(),
			category: payload.category ? String(payload.category).trim() : 'General',
			points: Number(payload.points) || 0,
			amount: Number(payload.amount) || 0,
			imageUrl: payload.imageUrl ? String(payload.imageUrl).trim() : ''
		};

		db.products.push(newProduct);
		writeDb(db);

		return json(newProduct, { status: 201 });
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}

// PATCH /api/products - update product
export async function PATCH({ request }) {
	try {
		const payload = await request.json();
		if (!payload.productId) {
			return json({ error: 'productId is required to update' }, { status: 400 });
		}

		const db = readDb();
		const index = db.products.findIndex((p) => p.productId === payload.productId);

		if (index === -1) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		const current = db.products[index];
		const updatedProduct = {
			...current,
			name: payload.name !== undefined ? String(payload.name).trim() : current.name,
			category: payload.category !== undefined ? String(payload.category).trim() : current.category,
			points: payload.points !== undefined ? Number(payload.points) : current.points,
			amount: payload.amount !== undefined ? Number(payload.amount) : current.amount,
			imageUrl: payload.imageUrl !== undefined ? String(payload.imageUrl).trim() : current.imageUrl
		};

		db.products[index] = updatedProduct;
		writeDb(db);

		return json(updatedProduct);
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}

// DELETE /api/products - delete product (by query ?productId=... or json payload)
export async function DELETE({ url, request }) {
	try {
		let productId = url.searchParams.get('productId');
		if (!productId) {
			try {
				const body = await request.json();
				productId = body.productId;
			} catch (_) {}
		}

		if (!productId) {
			return json({ error: 'productId is required to delete' }, { status: 400 });
		}

		const db = readDb();
		const index = db.products.findIndex((p) => p.productId === productId);

		if (index === -1) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		const removed = db.products.splice(index, 1)[0];
		writeDb(db);

		return json({ message: 'Product deleted successfully', product: removed });
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}
