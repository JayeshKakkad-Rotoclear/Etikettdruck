<script lang="ts">
  import RouteGuard from '$lib/components/RouteGuard.svelte';
</script>

<RouteGuard requiredRole="PRUEFER_A">
  <slot />
</RouteGuard>
