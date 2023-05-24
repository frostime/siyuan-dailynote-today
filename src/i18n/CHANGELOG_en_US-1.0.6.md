## Daily Note Today v1.0.6 Update Notes

### Feature updates

* Templates set in notebooks now also work for diaries created by plugin
* Registered block menu item (only available after version 2.8.9)
    * You can left-click on the block icon and see the "Daily Note Today" menu section below, the original "Move Block" function can now be triggered from this menu
    * The previous alt + right click trigger method remains, but will be officially removed from the plugin in the future (expected after SiYuan release 2.9)
    * This function is turned off by default, you can turn it on in the settings if you need it
* Cross-day updates are now enabled by default
    * The plugin recycling has been improved since 2.8.9, so there is no longer a residual listener problem, so cross-day updates are now enabled by default
    * Related settings will be removed in 2.9
* Changelog dialog
    * You may notice this dialog a new thing.
    * Don't worry, this plugin won't bother you every time it is updated.
    * But if there is a noteworthy update note, then this dialog will still pop up, like this time

### Note: A new bug has been found

> This is a critical note, please avoid triggering this issue, but if you don't use the move block function, then you can ignore this note

* A serious bug has been found in this section, the trigger conditions are as follows
    1. the target of the move needs to be a title block
    2. there is a collapse in the title block or a sub-block of the target
    3. trying to move the target's title block may trigger the bug
* This bug can cause a serious problems in SiYuan, and some blocks may be lost.
* The reason for the bug is the API provided by Siyuan, I can't do anything about it until the bug is fixed, please be careful **not to move the collapsed title block**.
