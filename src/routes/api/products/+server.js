import { json } from '@sveltejs/kit';

const AWS_API_URL =
  'https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api/products';

// GET /api/products - list all products or filter by product id
export async function GET({ url, fetch }) {
  try {
    const ProductId = url.searchParams.get('id') || url.searchParams.get('productId');

    const endpoint = ProductId
      ? `${AWS_API_URL}/${encodeURIComponent(ProductId)}`
      : AWS_API_URL;

    const response = await fetch(endpoint);
    const data = await response.text();

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

    if (!productData.name) {
      return json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    const response = await fetch(AWS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
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
    console.error('Create product error:', error);

    return json(
      { message: 'Unable to create product' },
      { status: 502 }
    );
  }
}

// PUT or PATCH /api/products - update product
export async function PUT({ request, fetch }) {
  return handleUpdate(request, fetch);
}

export async function PATCH({ request, fetch }) {
  return handleUpdate(request, fetch);
}

async function handleUpdate(request, fetch) {
  try {
    const payload = await request.json();
    const ProductId = payload.ProductId || payload.productId;

    if (!ProductId) {
      return json({ error: 'ProductId is required to update' }, { status: 400 });
    }

    const response = await fetch(`${AWS_API_URL}/${encodeURIComponent(ProductId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
  } catch (err) {
    return json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products - delete product (by query or body)
export async function DELETE({ url, request, fetch }) {
  try {
    let ProductId = url.searchParams.get('id') || url.searchParams.get('productId');
    if (!ProductId) {
      try {
        const body = await request.json();
        ProductId = body.ProductId || body.productId;
      } catch (_) {}
    }

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
