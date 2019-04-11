<script>
	import Template from './components/Template.svelte';
	export let size = 32;
	function increase() {
		size += 8;
		if (size > 100) {
			size = 10;
		}
	}
	function decrease() {
		size -= 8;
		if (size < 10) {
			size = 10;
		}
	}
</script>

<style>
	h1 {
		color: blue;
	}
</style>

<Template pageTitle='Home'>
	<h1 style='font-size: {size}px'>Wellcome!</h1>
	<div>
		<button on:click={decrease}>- font size</button>
		<button on:click={increase}>+ font size</button>
		<a href='?props={JSON.stringify({size: size})}' target=_blank>Reopen this page with {size}px font size!</a>
	</div>
</Template>
