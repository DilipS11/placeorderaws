<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/customer/b2535d22-4788-41bb-be01-9e8b2360d61e');
	});
</script>

<div style="padding: 30px; text-align: center;">
	Redirecting to customer dashboard...
</div>
