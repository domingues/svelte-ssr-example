<script>
    import sprite from 'feather-icons/dist/feather-sprite.svg';

    export let name;
    export let title = null;
</script>
<style>
    svg {
        vertical-align: top;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        width: 1em;
        height: 1em;
    }
</style>
<svg viewBox="0 0 24 24">{#if title}<title>{title}</title>{/if}<use xlink:href="{sprite}#{name}"/></svg>