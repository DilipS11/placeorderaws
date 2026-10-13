import { json } from '@sveltejs/kit';
// import { readDb, writeDb } from '#lib/server/db.js';

const AWS_API_URL =
  'https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api/products';

// GET /api/products - list all products or filter by category/search
// export async function GET({ url }) {
// 	const db = readDb();
// 	const category = url.searchParams.get('category');
// 	const search = url.searchParams.get('search');

// 	let products = [...db.products];

// 	// Sync products from AWS endpoint if available
// 	try {
// 		const res = await fetch("https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api/products");
// 		if (res.ok) {
// 			const data = await res.json();
// 			const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data;
// 			const awsList = parsed.products || [];
// 			for (const item of awsList) {
// 				const prodId = item.ProductId || item.ProductId;
// 				if (!products.some(p => p.ProductId === prodId)) {
// 					products.push({
// 						ProductId: prodId,
// 						name: item.name,
// 						category: item.category || 'General',
// 						points: Number(item.points) || 0,
// 						amount: Number(item.price ?? item.amount) || 0,
// 						imageUrl: item.imageURL || item.imageUrl || ''
// 					});
// 				}
// 			}
// 		}
// 	} catch (e) {
// 		// fallback to local data silently
// 	}

// 	if (category) {
// 		products = products.filter(
// 			(p) => p.category.toLowerCase() === category.toLowerCase()
// 		);
// 	}
// 	if (search) {
// 		const q = search.toLowerCase();
// 		products = products.filter(
// 			(p) =>
// 				p.name.toLowerCase().includes(q) ||
// 				p.ProductId.toLowerCase().includes(q) ||
// 				p.category.toLowerCase().includes(q)
// 		);
// 	}

// 	return json(products);
// }

export async function GET({ url, fetch }) {
  try {
	// Get optional customer ID from query parameter
	const ProductId = url.searchParams.get('id');

	// Call AWS endpoint with or without customer ID
	const endpoint = ProductId
	  ? `${AWS_API_URL}/${encodeURIComponent(ProductId)}`
	  : AWS_API_URL;

	// console.log('AWS endpoint:', endpoint);
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

// POST /api/products - create product
export async function POST({ request, fetch }) {
  try {
	const productData = await request.json();
console.log('AProduct Data:', productData);
	// Basic validation
	if (!productData.name ) {
	  return json(
		{ message: 'Name is required' },
		{ status: 400 }
	  );
	}

	// Send customer data to AWS API Gateway
	const response = await fetch(AWS_API_URL, {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify(productData)
	});
	

	const responseText = await response.text();
	console.log('AWS status:', response.status);
    console.log('AWS response:', responseText);
	return new Response(responseText, {
	  status: response.status,
	  headers: {
		'Content-Type':
		  response.headers.get('content-type') ??
		  'application/json'
	  }
	});
  } catch (error) {
	console.error('Create product error:', error);

	return json(
	  { message: 'Unable to create product' },
	  { status: 502 }
	);
  }
}

// PATCH /api/products - update product
export async function PATCH({ request }) {
	try {
		const payload = await request.json();
		if (!payload.ProductId) {
			return json({ error: 'ProductId is required to update' }, { status: 400 });
		}

		const db = readDb();
		const index = db.products.findIndex((p) => p.ProductId === payload.ProductId);

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

// DELETE /api/products - delete product (by query ?ProductId=... or json payload)
export async function DELETE({ params, fetch }) {
  try {
    const ProductId = params.id;

    if (!ProductId) {
      return json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${AWS_API_URL}/${encodeURIComponent(ProductId)}`,
      {
        method: 'DELETE'
      }
    );

    const responseText = await response.text();

    return new Response(responseText || null, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') ??
          'application/json'
      }
    });
  } catch (error) {
    console.error('Delete product error:', error);

    return json(
      { message: 'Unable to delete product' },
      { status: 502 }
    );
  }
}
