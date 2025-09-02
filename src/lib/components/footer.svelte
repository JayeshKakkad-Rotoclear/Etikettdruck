<script>
	import { APP_VERSION } from '../version.js';
	import { BUILD_DATE } from '../version.js';
</script>

<footer>
	<p>&copy; 2025 Rotoclear GmbH – All rights reserved. {APP_VERSION} {BUILD_DATE}</p>
</footer>

<style>
	footer {
		margin-top: auto;
		padding: 0.5rem 0;
		text-align: center;
		background: linear-gradient(225deg, var(--primary-color) 20%, var(--primary-hover) 100%);
		color: #fff;
		font-size: 0.5rem;
        position: sticky;
		bottom: 0;
	}
</style>
