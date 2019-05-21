<script>
	export let pageTitle = 'TEMPLATE';
</script>

<style>
	:global(body){
		margin: 10px;
	}
	:global(h1){
		color: red;
	}
	.header {
		margin-bottom: 30px;
		padding-bottom: 10px;
		border-bottom-style: solid;
		border-bottom-width: 1px;
	}
	.footer {
		margin-top: 30px;
		padding-top: 10px;
		border-top-style: solid;
		border-top-width: 1px;
	}
</style>

<svelte:head>
	<title>{pageTitle} :: Ferando's Website</title>
</svelte:head>

<div class=header>
	<a href='/'>Home</a> | <a href='/contacts'>Contacts</a>
</div>
<slot />
<div class=footer>
	<span>
		Build with <a href='https://v3.svelte.technology/'>svelte</a>,
		<a href='https://github.com/rollup/rollup'>rollup</a> and
		<a href='https://github.com/domingues/rollup-plugin-css-chunks'>rollup-plugin-css-chunks</a>.
	</span>
</div>
