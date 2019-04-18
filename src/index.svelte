<script>
	import Template from './components/Template.svelte';
	export let size = 32;
	const step = 8;
	let nextDown, nextUp;
	function update() {
		nextDown = size - step;
		if (nextDown < 10) {
			nextDown = 10;
		}
		nextUp = size + step;
		if (nextUp > 100) {
			nextUp = 100;
		}
	}
	update();
	function decrease() {
		size = nextDown;
		update();
	}
	function increase() {
		size = nextUp;
		update();
	}
</script>

<style>
	h1 {
		color: blue;
	}
</style>

<Template pageTitle='Home'>
	<div>
		<a href='?props={JSON.stringify({size: nextDown})}'
			on:click|preventDefault={decrease}>Decrease font size to {nextDown}</a>	|
		<a href='?props={JSON.stringify({size: nextUp})}'
			on:click|preventDefault={increase}>Increase font size to {nextUp}</a>
	</div>
	<h1 style='font-size: {size}px'>Wellcome!</h1>
</Template>
