<script lang="ts">
    import SettingItem from "./setting-item.svelte";

    export let dataname: string;
    export let settingItems: ISettingItem[];

    export let display: boolean = true;
    $: fn__none = display ? "" : "fn__none";

</script>

<div class="config__tab-container {fn__none}" data-name={dataname}>
    {#each settingItems as item (item.key)}
        <SettingItem
            type={item.type}
            content={item.content}
            settingKey={item.key}
            settingValue={item.value}
        />
    {/each}
</div>
