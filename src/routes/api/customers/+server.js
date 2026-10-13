import { json } from '@sveltejs/kit';

const AWS_API_URL =
  'https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api/customers';

// GET /api/customers - fetch all customers or customer by id from AWS
export async function GET({ url, fetch }) {
  try {
    const customerId = url.searchParams.get('id') || url.searchParams.get('customerId');
    const endpoint = customerId
      ? `${AWS_API_URL}/${encodeURIComponent(customerId)}`
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

// POST /api/customers - create customer in AWS
export async function POST({ request, fetch }) {
  try {
    const customerData = await request.json();

    if (!customerData.name) {
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

// PATCH /api/customers - update customer
export async function PATCH({ request, fetch }) {
  try {
    const customerData = await request.json();
    const customerId = customerData.CustomerId || customerData.customerId;

    if (!customerId) {
      return json(
        { message: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${AWS_API_URL}/${encodeURIComponent(customerId)}`, {
      method: 'PUT',
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
    console.error('Update customer error:', error);

    return json(
      { message: 'Unable to update customer' },
      { status: 502 }
    );
  }
}

// DELETE /api/customers - delete customer
export async function DELETE({ url, request, fetch }) {
  try {
    let customerId = url.searchParams.get('id') || url.searchParams.get('customerId');
    if (!customerId) {
      try {
        const body = await request.json();
        customerId = body.CustomerId || body.customerId;
      } catch (_) {}
    }

    if (!customerId) {
      return json(
        { message: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${AWS_API_URL}/${encodeURIComponent(customerId)}`, {
      method: 'DELETE'
    });

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
    console.error('Delete customer error:', error);

    return json(
      { message: 'Unable to delete customer' },
      { status: 502 }
    );
  }
}
