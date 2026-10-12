<script>
	import { onMount } from 'svelte';

	let customers = $state([]);
	let products = $state([]);
	let orders = $state([]);
	let loading = $state(false);
	let message = $state('');
	let error = $state('');

	// Order form state
	let selectedCustomerId = $state('');
	let orderLines = $state([
		{ productId: '', quantity: 1 }
	]);

	// Filter state for orders list
	let filterCustomerId = $state('');

	async function loadInitialData() {
		loading = true;
		error = '';
		try {
			const [cRes, pRes, oRes] = await Promise.all([
				fetch('/api/customers'),
				fetch('/api/products'),
				fetch('/api/orders')
			]);
			customers = await cRes.json();
			products = await pRes.json();
			orders = await oRes.json();

			if (customers.length > 0 && !selectedCustomerId) {
				selectedCustomerId = customers[0].customerId;
			}
			if (products.length > 0 && orderLines[0].productId === '') {
				orderLines[0].productId = products[0].productId;
			}
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	async function fetchOrders() {
		try {
			const url = filterCustomerId
				? `/api/orders?customerId=${encodeURIComponent(filterCustomerId)}`
				: '/api/orders';
			const res = await fetch(url);
			if (!res.ok) throw new Error('Failed to load orders');
			orders = await res.json();
		} catch (e) {
			error = e.message;
		}
	}

	function addOrderLine() {
		const defaultProdId = products.length > 0 ? products[0].productId : '';
		orderLines = [...orderLines, { productId: defaultProdId, quantity: 1 }];
	}

	function removeOrderLine(index) {
		if (orderLines.length === 1) return;
		orderLines = orderLines.filter((_, i) => i !== index);
	}

	function getLineCalculation(line) {
		const prod = products.find((p) => (p.productId === line.productId || p.ProductId === line.productId));
		const qty = Number(line.quantity) || 0;
		if (!prod) return { unitPrice: 0, unitPoints: 0, totalPrice: '0.00', totalPoints: 0 };
		const price = Number(prod.amount ?? prod.price ?? 0);
		const points = Number(prod.points ?? 0);
		return {
			unitPrice: price,
			unitPoints: points,
			totalPrice: (price * qty).toFixed(2),
			totalPoints: points * qty
		};
	}

	let orderTotals = $derived.by(() => {
		let totalAmount = 0;
		let totalPoints = 0;
		for (const line of orderLines) {
			const calc = getLineCalculation(line);
			totalAmount += Number(calc.totalPrice);
			totalPoints += calc.totalPoints;
		}
		return {
			amount: totalAmount.toFixed(2),
			points: totalPoints
		};
	});

	async function handleCreateOrder(e) {
		e.preventDefault();
		error = '';
		message = '';

		if (!selectedCustomerId) {
			error = 'Please select a customer';
			return;
		}

		if (orderLines.length === 0) {
			error = 'Please add at least one product item';
			return;
		}

		try {
			const payload = {
				customerId: selectedCustomerId,
				items: orderLines.map((l) => ({
					productId: l.productId,
					quantity: Number(l.quantity)
				}))
			};

			const res = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Failed to place order');

			message = `Order placed successfully! Order ID: ${data.order.orderId}. Customer earned ${data.order.totalPoints} points (New Points Balance: ${data.customerNewBalance}).`;

			// Reset line items
			orderLines = [{ productId: products[0]?.productId || products[0]?.ProductId || '', quantity: 1 }];
			
			// Refresh orders & customers list
			await loadInitialData();
		} catch (e) {
			error = e.message;
		}
	}

	onMount(() => {
		loadInitialData();
	});
</script>

<svelte:head>
	<title>Bulk Orders &bull; Portal</title>
</svelte:head>

<div class="card">
	<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
		<div>
			<h1 style="margin: 0 0 4px 0; font-size: 24px; color: #111827;">Bulk Orders Management</h1>
			<p style="color: #6b7280; margin: 0; font-size: 14px;">
				Supported API Methods: <code>GET</code>, <code>POST</code> &bull; Creates Order Header and Order Details line items
			</p>
		</div>
		<div>
			<button class="btn-secondary" onclick={loadInitialData}>↻ Refresh All</button>
		</div>
	</div>

	{#if message}
		<div class="alert alert-success" style="margin-top: 16px;">{message}</div>
	{/if}
	{#if error}
		<div class="alert alert-error" style="margin-top: 16px;">{error}</div>
	{/if}
</div>

<!-- Bulk Order Placement Form -->
<div class="card">
	<div style="margin-bottom: 20px;">
		<h2 style="margin: 0; font-size: 18px;">Place New Bulk Order (POST /api/orders)</h2>
		<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Add line items with quantities. Points and total amounts calculate automatically.</p>
	</div>

	<form onsubmit={handleCreateOrder}>
		<div style="margin-bottom: 22px; max-width: 480px;">
			<label for="orderCustomer">Select Customer *</label>
			<select id="orderCustomer" bind:value={selectedCustomerId}>
				{#each customers as c}
					<option value={c.customerId}>
						{c.name} ({c.customerId}) &bull; Current Balance: {c.availablePoints} pts
					</option>
				{/each}
			</select>
		</div>

		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
			<h3 style="margin: 0; font-size: 15px; color: #374151;">Order Line Items (Bulk Order Details)</h3>
			<button type="button" class="btn-secondary" onclick={addOrderLine}>
				+ Add Product Line
			</button>
		</div>

		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th style="width: 45px;">#</th>
						<th>Product Item</th>
						<th style="width: 120px;">Quantity</th>
						<th style="width: 110px; text-align: right;">Unit Price</th>
						<th style="width: 110px; text-align: right;">Unit Points</th>
						<th style="width: 120px; text-align: right;">Line Total</th>
						<th style="width: 120px; text-align: right;">Line Points</th>
						<th style="width: 90px; text-align: center;">Action</th>
					</tr>
				</thead>
				<tbody>
					{#each orderLines as line, idx}
						{@const calc = getLineCalculation(line)}
						<tr>
							<td style="color: #9ca3af; font-weight: 600;">{idx + 1}</td>
							<td>
								<select bind:value={line.productId}>
									{#each products as p}
										<option value={p.productId || p.ProductId}>
											{p.name} ({p.productId || p.ProductId}) - ${p.amount ?? p.price} / {p.points} pts
										</option>
									{/each}
								</select>
							</td>
							<td>
								<input
									type="number"
									min="1"
									step="1"
									bind:value={line.quantity}
								/>
							</td>
							<td style="text-align: right; color: #6b7280;">${calc.unitPrice}</td>
							<td style="text-align: right; color: #6b7280;">{calc.unitPoints} pts</td>
							<td style="text-align: right; font-weight: 600; color: #059669;">${calc.totalPrice}</td>
							<td style="text-align: right; font-weight: 600; color: #2563eb;">{calc.totalPoints} pts</td>
							<td style="text-align: center;">
								{#if orderLines.length > 1}
									<button
										type="button"
										class="btn-danger"
										onclick={() => removeOrderLine(idx)}
										style="padding: 4px 10px; font-size: 12px;"
									>
										Remove
									</button>
								{:else}
									<span style="color: #9ca3af; font-size: 12px;">Min 1</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr style="background: #f9fafb; font-weight: bold;">
						<td colspan="5" style="text-align: right; font-size: 14px;">Total Order Summary:</td>
						<td style="text-align: right; color: #059669; font-size: 16px;">
							${orderTotals.amount}
						</td>
						<td style="text-align: right; color: #2563eb; font-size: 16px;">
							{orderTotals.points} pts
						</td>
						<td></td>
					</tr>
				</tfoot>
			</table>
		</div>

		<div style="margin-top: 20px; display: flex; gap: 12px;">
			<button type="submit" class="btn-primary" style="padding: 12px 24px;">
				Submit Bulk Order (POST)
			</button>
		</div>
	</form>
</div>

<!-- Orders List -->
<div class="card">
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
		<h2 style="margin: 0; font-size: 18px;">Orders History &bull; Header &amp; Lines (GET /api/orders)</h2>
		<div style="display: flex; gap: 8px; align-items: center;">
			<span style="font-size: 13px; color: #4b5563; font-weight: 500;">Filter Customer:</span>
			<select bind:value={filterCustomerId} onchange={fetchOrders} style="max-width: 220px;">
				<option value="">All Customers</option>
				{#each customers as c}
					<option value={c.customerId}>{c.name} ({c.customerId})</option>
				{/each}
			</select>
			{#if filterCustomerId}
				<button class="btn-secondary" onclick={() => { filterCustomerId = ''; fetchOrders(); }}>Reset</button>
			{/if}
		</div>
	</div>

	{#if orders.length === 0}
		<p style="padding: 20px; color: #6b7280; text-align: center;">No orders found.</p>
	{:else}
		{#each orders as o (o.orderId)}
			{@const cust = customers.find((c) => c.customerId === o.customerId)}
			<div class="order-box">
				<div class="order-header-bar">
					<div style="display: flex; align-items: center; gap: 12px;">
						<strong style="color: #111827; font-size: 15px;">Order #{o.orderId}</strong>
						<span style="color: #6b7280; font-size: 13px;">{new Date(o.orderDate).toLocaleString()}</span>
					</div>
					<div>
						<span>Customer: <strong style="color: #2563eb;">{cust ? cust.name : o.customerId}</strong></span>
					</div>
				</div>

				<div style="padding: 16px 20px;">
					<h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280;">Order Details Lines</h4>
					
					<div style="overflow-x: auto;">
						<table>
							<thead>
								<tr>
									<th style="width: 50px;">Line</th>
									<th>Product Id / Item</th>
									<th style="width: 90px; text-align: right;">Quantity</th>
									<th style="width: 100px; text-align: right;">Unit Price</th>
									<th style="width: 100px; text-align: right;">Unit Points</th>
									<th style="width: 110px; text-align: right;">Line Total</th>
									<th style="width: 110px; text-align: right;">Line Points</th>
								</tr>
							</thead>
							<tbody>
								{#each o.items || [] as item}
									{@const p = products.find((x) => (x.productId === item.productId || x.ProductId === item.productId))}
									<tr>
										<td>#{item.orderLineId}</td>
										<td>
											<strong>{item.productId}</strong>
											{#if p} <span style="color: #6b7280; font-size: 13px;">({p.name})</span>{/if}
										</td>
										<td style="text-align: right;">{item.quantity}</td>
										<td style="text-align: right; color: #6b7280;">${Number(item.unitPrice).toFixed(2)}</td>
										<td style="text-align: right; color: #6b7280;">{item.unitPoints} pts</td>
										<td style="text-align: right; font-weight: 600; color: #059669;">${Number(item.totalPrice).toFixed(2)}</td>
										<td style="text-align: right; font-weight: 600; color: #2563eb;">{item.totalPoints} pts</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<div class="order-summary-footer">
						<div>Order Amount: <span style="color: #059669; font-size: 16px; font-weight: 700;">${Number(o.orderAmount).toFixed(2)}</span></div>
						<div>Points Earned: <span style="color: #2563eb; font-size: 16px; font-weight: 700;">{o.totalPoints} pts</span></div>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.order-box {
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		margin-bottom: 20px;
		background: #ffffff;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0,0,0,0.02);
	}
	.order-header-bar {
		background: #f9fafb;
		padding: 12px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #e5e7eb;
	}
	.order-summary-footer {
		display: flex;
		justify-content: flex-end;
		gap: 28px;
		padding-top: 14px;
		margin-top: 14px;
		border-top: 1px dashed #e5e7eb;
		font-weight: 600;
	}
</style>
