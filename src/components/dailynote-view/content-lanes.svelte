<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { eventBus } from "@/event-bus";
    import { dailyNoteViewLaneMinWidth } from "@/func/dailynote-view/settings";
    import DailyNoteLane from "./daily-note-lane.svelte";

    export let app: any;
    export let lanes: DailyNoteLane[] = [];

    let laneMinWidth = dailyNoteViewLaneMinWidth();

    function updateLaneMinWidth() {
        laneMinWidth = dailyNoteViewLaneMinWidth();
    }

    function onSettingChanged(data: { key: SettingKey }) {
        if (data.key === 'DailyNoteViewLaneMinWidth') {
            updateLaneMinWidth();
        }
    }

    onMount(() => {
        eventBus.subscribe(eventBus.EventSetting, onSettingChanged);
        updateLaneMinWidth();
    });

    onDestroy(() => {
        eventBus.unSubscribe(eventBus.EventSetting, onSettingChanged);
    });
</script>

<section class="dnt-view__lanes" style="--dnt-view-lane-count: {Math.max(lanes.length, 1)}; --dnt-view-lane-min-width: {laneMinWidth};">
    {#each lanes as lane (lane.key)}
        <DailyNoteLane {app} {lane} />
    {/each}
</section>
