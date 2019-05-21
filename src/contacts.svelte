<script>
    import Template from './components/Template.svelte';
    import Icon from './components/Icon.svelte';
    import portrait from './img/fernando-pessoa.png';
</script>

<style>
    img {
        height: 100px;
    }
</style>

<Template pageTitle='Contacts'>
    <h1>Contacts:</h1>
    <img src="{portrait}" alt="portrait"/>
    <ul>
        <li><b>Home <Icon name="phone" title="phone icon" />:</b> +132 456 789 789</li>
    </ul>
</Template>
