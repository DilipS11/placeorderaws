<script>
	import { goto } from "$app/navigation";

	const CUSTOMER_ORDER_ENDPOINT = "https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api";

	let form = $state({
		name: "",
		country: "",
		state: "",
		city: "",
		zipCode: "",
		address: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: ""
	});

	let loading = $state(false);
	let error = $state("");
	let success = $state("");

	let toastMessage = $state(""); 
	let toastVisible = $state(false); 
	let toastType = $state("success"); 

	function showToast(message, type = "success") { 
		toastMessage = message; 
		toastType = type; 
		toastVisible = true; 
		setTimeout(() => { 
			toastVisible = false; 
		}, 3000); 
	}

	async function register(e) {
		e.preventDefault();
		error = "";
		success = "";

		if (form.password !== form.confirmPassword) {
			error = "Passwords do not match.";
			showToast(error, "error");
			return;
		}

		if (form.password.length < 8) {
			error = "Password must be at least 8 characters.";
			showToast(error, "error");
			return;
		}

		loading = true;

		try {
			const response = await fetch(CUSTOMER_ORDER_ENDPOINT + "/customers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					name: form.name,
					country: form.country,
					city: form.city,
					state: form.state,
					zipCode: form.zipCode,
					address1: form.address,
					email: form.email,
					phone: form.phone,
					password: form.password,
					availablePoints: 0 
				})
			});

			const result = await response.json();

			if (result.statusCode != 200) {
				throw new Error(result.message || "Registration failed.");
			}

			success = "Registration successful!";
			showToast(success, "success");

			const parsedBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
			const custid = parsedBody.data?.CustomerId || parsedBody.data?.customerId;
			console.log("Registered custid:", custid);
			
			// Save to local DB as well so full system recognizes it
			try {
				await fetch('/api/customers', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						customerId: custid,
						name: form.name,
						country: form.country,
						city: form.city,
						state: form.state,
						zipCode: form.zipCode,
						address1: form.address,
						email: form.email,
						contactPhone: form.phone,
						availablePoints: 0
					})
				});
			} catch (_) {}

			form = {
				name: "",
				country: "",
				city: "",
				state: "",
				zipCode: "",
				address: "",
				email: "",
				phone: "",
				password: "",
				confirmPassword: ""
			};

			if (custid) {
				setTimeout(() => {
					goto("/customer/" + custid);
				}, 1000);
			}

		} catch (err) {
			error = err.message || "Registration failed.";
			showToast(error, "error");
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Customer Registration</title>
	<meta name="description" content="Create your customer account" />
</svelte:head>

<div class="page">
	<div class="card">
		<div class="header">
			<p>Register as a customer</p>
		</div>

		{#if toastVisible}
			<div class="toast {toastType}">{toastMessage}</div>
		{/if}

		{#if error}
			<div class="alert error">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="alert success">
				{success}
			</div>
		{/if}

		<form onsubmit={register}>
			<div class="field">
				<label for="name">Name</label>
				<input
					id="name"
					type="text"
					bind:value={form.name}
					placeholder="Albert Fernandas"
					required
				/>
			</div>

			<div class="row">
				<div class="field">
					<label for="country">Country</label>
					<input
						id="country"
						type="text"
						bind:value={form.country}
						placeholder="India"
						required
					/>
				</div>
				<div class="field">
					<label for="state">State</label>
					<input
						id="state"
						type="text"
						bind:value={form.state}
						placeholder="TamilNadu"
						required
					/>
				</div>
			</div>
			
			<div class="row">
				<div class="field">
					<label for="city">City</label>
					<input
						id="city"
						type="text"
						bind:value={form.city}
						placeholder="Chennai"
						required
					/>
				</div>
				<div class="field">
					<label for="zipCode">ZipCode</label>
					<input
						id="zipCode"
						type="text"
						bind:value={form.zipCode}
						placeholder="600113"
						required
					/>
				</div>
			</div>

			<div class="field">
				<label for="address">Address</label>
				<input
					id="address"
					type="text"
					bind:value={form.address}
					placeholder="1, random st,"
					required
				/>
			</div>

			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={form.email}
					placeholder="john@example.com"
					required
				/>
			</div>

			<div class="field">
				<label for="phone">Phone Number</label>
				<input
					id="phone"
					type="tel"
					bind:value={form.phone}
					placeholder="+91 9876543210"
					required
				/>
			</div>

			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={form.password}
					placeholder="Minimum 8 characters"
					minlength="8"
					required
				/>
			</div>

			<div class="field">
				<label for="confirmPassword">Confirm Password</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={form.confirmPassword}
					placeholder="Re-enter your password"
					required
				/>
			</div>

			<button type="submit" disabled={loading}>
				{loading ? "Creating Account..." : "Create Account"}
			</button>
		</form>

		<div class="login">
			Already have an account?
			<a href="/customers">View Customers</a> or <a href="/">Go to Portal</a>
		</div>
	</div>
</div>

<style>
	.page {
		min-height: calc(100vh - 120px);
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30px 20px;
	}

	.card {
		width: 100%;
		max-width: 500px;
		background: white;
		padding: 40px;
		border-radius: 16px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
		border: 1px solid #e5e7eb;
	}

	.header {
		text-align: center;
		margin-bottom: 25px;
	}

	h1 {
		margin: 0 0 8px;
		font-size: 28px;
		color: #1f2937;
	}

	.header p {
		margin: 0;
		color: #6b7280;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 15px;
	}

	.field {
		margin-bottom: 16px;
	}

	label {
		display: block;
		margin-bottom: 6px;
		font-weight: 600;
		font-size: 14px;
		color: #374151;
	}

	input:not([type="checkbox"]) {
		width: 100%;
		box-sizing: border-box;
		padding: 11px 14px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 14px;
		outline: none;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:not([type="checkbox"]):focus {
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
	}

	button {
		width: 100%;
		padding: 13px;
		border: none;
		border-radius: 8px;
		background: #2563eb;
		color: white;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
		margin-top: 10px;
	}

	button:hover {
		background: #1d4ed8;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.alert {
		padding: 12px;
		border-radius: 8px;
		margin-bottom: 18px;
		font-size: 14px;
	}

	.error {
		background: #fee2e2;
		color: #991b1b;
	}

	.success {
		background: #dcfce7;
		color: #166534;
	}

	.toast {
		padding: 10px 14px;
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 13px;
		text-align: center;
		animation: fadeIn 0.3s ease;
	}

	.toast.success {
		background: #dcfce7;
		color: #166534;
	}

	.toast.error {
		background: #fee2e2;
		color: #991b1b;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-6px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.login {
		margin-top: 22px;
		text-align: center;
		color: #6b7280;
		font-size: 14px;
	}

	.login a {
		color: #2563eb;
		text-decoration: none;
		font-weight: 600;
	}

	@media (max-width: 600px) {
		.card {
			padding: 24px;
		}

		.row {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}
</style>
