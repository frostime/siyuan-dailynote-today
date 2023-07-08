<!--
 Copyright (c) 2023 by frostime (Yp Z), All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-01 19:23:50
 FilePath     : /src/components/settings/setting-panel.svelte
 LastEditTime : 2023-07-08 17:10:25
 Description  : 
-->
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import SettingItem from "./setting-item.svelte";

    export let dataname: string;
    export let settingItems: ISettingItem[];

    export let display: boolean = true;

    const dispatch = createEventDispatcher();

    function onClick( {detail}) {
        dispatch("click", { key: detail.key, dataname: dataname });
    }

    $: fn__none = display ? "" : "fn__none";

</script>

<div class="config__tab-container {fn__none}" data-name={dataname}>
    {#each settingItems as item (item.key)}
        <SettingItem
            type={item.type}
            content={item.content}
            settingKey={item.key}
            settingValue={item.value}
            on:click={onClick}
        />
    {/each}
</div>
