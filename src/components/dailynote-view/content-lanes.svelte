<script lang="ts">
    import DailyNoteLane from "./daily-note-lane.svelte";

    export let app: any;
    export let lanes: DailyNoteLane[] = [];
</script>

<section class="dnt-view__lanes" style="--dnt-view-lane-count: {Math.max(lanes.length, 1)};">
    {#each lanes as lane (lane.key)}
        <DailyNoteLane {app} {lane} />
    {/each}
</section>
