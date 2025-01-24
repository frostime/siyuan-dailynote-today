<!--
 Copyright (c) 2023 by frostime All Rights Reserved.
 Author       : frostime
 Date         : 2023-07-01 19:23:50
 FilePath     : /src/components/libs/Form/form-panel.svelte
 LastEditTime : 2025-01-24 17:33:02
 Description  : 
-->
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import FormWrap from './form-wrap.svelte';
    import FormInput from './form-input.svelte';

    export let group: string;
    export let settingItems: ISettingItem[];
    export let display: boolean = true;

    const dispatch = createEventDispatcher();

    function onClick( {detail}) {
        dispatch("click", { key: detail.key });
    }
    function onChanged( {detail}) {
        dispatch("changed", {group: group, ...detail});
    }

    $: fn__none = display ? "" : "fn__none";

</script>

<div class="config__tab-container {fn__none}" data-name={group}>
    <slot />
    {#each settingItems as item (item.key)}
        <FormWrap
            title={item.title}
            description={item.description}
            direction={item?.direction}
        > 
            <FormInput
                type={item.type}
                key={item.key}
                bind:value={item.value}
                placeholder={item?.placeholder}
                options={item?.options}
                slider={item?.slider}
                button={item?.button}
                on:click={onClick}
                on:changed={onChanged}
            />
        </FormWrap>
    {/each}
</div>