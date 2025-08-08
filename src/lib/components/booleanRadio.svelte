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
		margin-bottom: 1rem;
	}
	.field-label {
		display: block;
		font-weight: bold;
		margin-bottom: 10px;
        font-size: large;
	}
	.option-group {
		display: flex;
		gap: 1rem;
        flex-wrap: wrap;
	}
	.option-group label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid #ddd;
		background-color: #f9f9ff;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}
    .option-group label:hover {
        background-color: #e0e0f0;
    }
	.option-group label.active {
		font-weight: 500;
	}
	input[type='radio'] {
        margin-right: 0.5rem;
		accent-color: #123345;
	}
</style>
