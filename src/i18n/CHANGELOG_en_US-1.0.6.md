## Daily Note Today v1.0.6 Update Notes

### Feature updates

1. Templates set in notebooks now also work for diaries created by plugin
2. Registered block menu item (only available after version 2.8.9), You can left-click on the block icon and see the "Daily Note Today" menu section below. (Turned off by default, you can turn it on in the settings if you need it)
    * The previous alt + right click trigger method remains, but will be officially removed from the plugin in the future (expected after SiYuan release 2.9)
    * The plugin-provided menu item may cause the disappreance of some theme-provided menu item, no solution at present
3. Mobile Block Functionality Updates
    * Support for moving a single list item (previously not allowed)
    * To move the entire header block and its contents, please first collapse it and then move. See remarks below.
4. Cross-day updates are now enabled by default, related settings will be removed in 2.9
5. Removed the option to set the 'Notebook sorting scheme', made it all the same as the document tree display
6. Changelog dialog (won't bother you every time it is updated)
7. Fixed an issue where the plugin previously couldn't be used in other environments such as Docker.

### Additional Remarks on Block Movement

In previous versions, you could click on a title block and directly move all the contents below it. However, in recent testing, we discovered that this feature had a very serious bug, as seen in [#8354](https://github.com/siyuan-note/siyuan/issues/8354).

After careful consideration, we changed the behavior of the plugin, and now moving a title block will only move its own contents by default. If you want to move all the subordinate content like before, please first collapse the title block and then move it.
