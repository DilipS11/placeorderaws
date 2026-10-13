<script>
	import { onMount } from 'svelte';

	let stats = $state({
		productsCount: 0,
		customersCount: 0,
		ordersCount: 0,
		totalRevenue: 0
	});

	async function loadDashboard() {
		try {
			const [pRes, cRes, oRes] = await Promise.all([
				fetch('/api/products'),
				fetch('/api/customers'),
				fetch('/api/orders')
			]);
			const products = await pRes.json();
			const customers = await cRes.json();
			const orders = await oRes.json();

			const totalRevenue = orders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);

			stats = {
				productsCount: products.length || 0,
				customersCount: customers.length || 0,
				ordersCount: orders.length || 0,
				totalRevenue: totalRevenue.toFixed(2)
			};
		} catch (err) {
			console.error('Failed to load dashboard data', err);
		}
	}

	onMount(() => {
		loadDashboard();
	});
</script>

<svelte:head>
	<title>Overview &bull; Order &amp; Points Portal</title>
</svelte:head>

<div class="card" style="margin-bottom: 24px;">
	<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
		<div>
			<h1 style="margin: 0 0 6px 0; font-size: 26px; color: #111827;">Business Operations Portal</h1>
			<p style="color: #6b7280; margin: 0; font-size: 15px;">
				Integrated Customer Accounts, Product Catalogs, Bulk Orders, and Loyalty Points.
			</p>
		</div>
		<div style="display: flex; gap: 10px;">
			<a href="/register" class="btn-cta">+ Register Customer</a>
			<a href="/orders" class="btn-cta secondary">+ Place Bulk Order</a>
		</div>
	</div>

	<div class="metrics-grid">
		<div class="metric-card">
			<div class="metric-header">
				<span class="icon-bubble blue">📦</span>
				<span class="metric-title">Products Catalog</span>
			</div>
			<div class="metric-val">{stats.productsCount}</div>
			<a href="/products" class="metric-link">Manage Products &rarr;</a>
		</div>

		<div class="metric-card">
			<div class="metric-header">
				<span class="icon-bubble green">👥</span>
				<span class="metric-title">Active Customers</span>
			</div>
			<div class="metric-val">{stats.customersCount}</div>
			<a href="/customers" class="metric-link">Customer Directory &rarr;</a>
		</div>

		<div class="metric-card">
			<div class="metric-header">
				<span class="icon-bubble purple">📑</span>
				<span class="metric-title">Total Orders</span>
			</div>
			<div class="metric-val">{stats.ordersCount}</div>
			<a href="/orders" class="metric-link">View Bulk Orders &rarr;</a>
		</div>

		<div class="metric-card">
			<div class="metric-header">
				<span class="icon-bubble amber">🪙</span>
				<span class="metric-title">Total Sales Volume</span>
			</div>
			<div class="metric-val">${stats.totalRevenue}</div>
			<a href="/points" class="metric-link">Manage Points Wallet &rarr;</a>
		</div>
	</div>
</div>

<div class="card">
	<div style="margin-bottom: 16px;">
		<h2 style="font-size: 18px; margin: 0 0 6px 0;">Available API Endpoints &amp; Cloud Integration</h2>
		<p style="color: #6b7280; margin: 0; font-size: 13px;">Full HTTP REST operations connected across local storage and AWS API Gateway.</p>
	</div>

	<table>
		<thead>
			<tr>
				<th>Module</th>
				<th>HTTP Methods</th>
				<th>Target Endpoint</th>
				<th>Functionality</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><strong>Customers (AWS &amp; Local)</strong></td>
				<td><code>GET</code>, <code>POST</code>, <code>PATCH</code>, <code>DELETE</code></td>
				<td><code>/customers</code> &bull; <code>/api/customers</code></td>
				<td>AWS Lambda customer register, details &amp; local customer management</td>
			</tr>
			<tr>
				<td><strong>Products Catalog</strong></td>
				<td><code>GET</code>, <code>POST</code>, <code>PATCH</code>, <code>DELETE</code></td>
				<td><code>/api/products</code></td>
				<td>Catalog CRUD with price, reward points &amp; image URL support</td>
			</tr>
			<tr>
				<td><strong>Bulk Orders</strong></td>
				<td><code>GET</code>, <code>POST</code></td>
				<td><code>/api/orders</code></td>
				<td>Multi-item bulk purchasing, order header &amp; order lines calculation</td>
			</tr>
			<tr>
				<td><strong>Points Wallet</strong></td>
				<td><code>GET</code>, <code>POST</code></td>
				<td><code>/api/points</code></td>
				<td>Check customer points balance, assign points &amp; deduct points</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	.btn-cta {
		display: inline-flex;
		align-items: center;
		padding: 10px 18px;
		background: #2563eb;
		color: #ffffff;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		font-size: 14px;
		transition: background-color 0.2s;
	}
	.btn-cta:hover {
		background: #1d4ed8;
	}
	.btn-cta.secondary {
		background: #ffffff;
		color: #374151;
		border: 1px solid #d1d5db;
	}
	.btn-cta.secondary:hover {
		background: #f9fafb;
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 20px;
		margin-top: 24px;
	}

	.metric-card {
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 20px;
		background: #ffffff;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
	}

	.metric-header {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.icon-bubble {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
	}
	.icon-bubble.blue { background: #eff6ff; }
	.icon-bubble.green { background: #f0fdf4; }
	.icon-bubble.purple { background: #faf5ff; }
	.icon-bubble.amber { background: #fffbeb; }

	.metric-title {
		font-size: 13px;
		color: #6b7280;
		font-weight: 600;
	}

	.metric-val {
		font-size: 30px;
		font-weight: 700;
		margin: 12px 0 6px 0;
		color: #111827;
	}

	.metric-link {
		color: #2563eb;
		text-decoration: none;
		font-size: 13px;
		font-weight: 500;
	}
	.metric-link:hover {
		text-decoration: underline;
	}
</style>
