<script lang="ts">
    import SettingItem from "./setting-item.svelte";

    export let dataname: string;
    export let settingItems: ISettingItem[];
</script>

<div class="config__tab-container" data-name={dataname}>
    {#each settingItems as item (item.key)}
        <SettingItem
            type={item.type}
            content={item.content}
            settingKey={item.key}
            settingValue={item.value}
        />
    {/each}
</div>
