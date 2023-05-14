<script>
    export let content;
</script>

<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        {content.title}
        <div class="b3-label__text">
            {content.text}
        </div>
    </div>
    <span class="fn__space" />
    <slot />
</label>
