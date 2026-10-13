import { json } from '@sveltejs/kit';
// import { readDb, writeDb } from '#lib/server/db.js';

const AWS_API_URL =
  'https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api/products';

export async function PUT({ params, request, fetch }) {
  try {
    const ProductId = params.id;
    const ProductData = await request.json();
    console.log("inside patch", params, params.id);

    if (!ProductId) {
      return json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const endpoint =
      `${AWS_API_URL}/${ProductId}`;
    console.log('AWS endpoint:', endpoint);

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ProductData)
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
    console.error('Update customer error:', error);

    return json(
      { message: 'Unable to update product' },
      { status: 502 }
    );
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
