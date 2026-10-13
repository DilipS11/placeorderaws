import { json } from '@sveltejs/kit';
//import { readDb, writeDb } from '#lib/server/db.js';
const AWS_API_URL =
  'https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api/customers';

export async function GET({ params, fetch }) {
  try {
    // Get optional customer ID from query parameter
	console.log('GET /api/customers reached');

    const customerId = params.id;
    console.log("customerid",params, params.id);

    // Call AWS endpoint with or without customer ID
    const endpoint = customerId
      ? `${AWS_API_URL}/${encodeURIComponent(customerId)}`
      : AWS_API_URL;

	console.log('AWS endpoint get custid:', endpoint);
    const response = await fetch(endpoint);
    const data = await response.text();
	console.log('AWS status:', response.status);
    console.log('AWS response:', data);

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

// PATCH /api/customers - update customer
export async function PUT({ params, request, fetch }) {
  try {
    const customerId = params.id;
    const customerData = await request.json();
	console.log("inside patch", params, params.id);

    if (!customerId) {
      return json(
        { message: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const endpoint =
      `${AWS_API_URL}/${customerId}`;
	console.log('AWS endpoint:', endpoint);

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
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
      { message: 'Unable to update customer' },
      { status: 502 }
    );
  }
}

// DELETE /api/customers - delete customer
export async function DELETE({ params, fetch }) {
  try {
    const CustomerId = params.id;

    if (!CustomerId) {
      return json(
        { message: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${AWS_API_URL}/${encodeURIComponent(CustomerId)}`,
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
      { message: 'Unable to delete customer' },
      { status: 502 }
    );
  }
}