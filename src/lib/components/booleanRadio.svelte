<script lang="ts">
	export let label: string;
	export let bindValue: boolean | null = null;
</script>

<div class="field">
	<span class="field-label">{label}</span>
	<div class="option-group">
		<label for={label + '-ja'} class:active={bindValue === true}>
			<input
				id={label + '-ja'}
				type="radio"
				name={label}
				bind:group={bindValue}
				value={true}
			/>
			Ja
		</label>
		<label for={label + '-nein'} class:active={bindValue === false}>
			<input
				id={label + '-nein'}
				type="radio"
				name={label}
				bind:group={bindValue}
				value={false}
			/>
			Nein
		</label>
	</div>
</div>

<style>
	.field {
		/* margin-bottom: var(--spacing-lg); */
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--white);
		border-radius: var(--border-radius-md);
		/* border: 1px solid var(--border-light); */
		transition: all var(--transition-smooth);
	}

	/* .field:hover {
		border-color: var(--border-medium);
		box-shadow: var(--shadow-sm);
	} */

	.field-label {
		display: block;
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		font-size: var(--font-size-base);
		margin-bottom: var(--spacing-md);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.option-group {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
	}

	.option-group label {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-md);
		border-radius: var(--border-radius-sm);
		border: 1px solid var(--border-medium);
		background: var(--white);
		cursor: pointer;
		transition: all var(--transition-smooth);
		min-width: 60px;
		justify-content: center;
		min-height: 36px;
		font-size: var(--font-size-sm);
		position: relative;
		overflow: hidden;
	}

	.option-group label:hover {
		background: var(--bg-light);
		border-color: var(--primary-color);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.option-group label.active {
		background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
		color: var(--white);
		border-color: var(--primary-color);
		font-weight: var(--font-weight-semibold);
	}

	.option-group label.active:hover {
		background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
	}

	input[type='radio'] {
		margin-right: var(--spacing-xs);
		accent-color: var(--primary-color);
		transform: scale(1.1);
	}

	.option-group label.active input[type='radio'] {
		accent-color: var(--white);
	}
</style>
