### Notes Today v1.1.2 Update Notes

This minor update mainly optimizes some feature details, see [Milestone V1.1.2](https://github.com/frostime/siyuan-dailynote-today/milestone/13)

#### Feature

- Cancelling reservation: When tapping on the menu of a block that is already booked, the button that says 'Reserve this block' will now say 'Cancel reservation'
- Expand the feature menu to show by default: The new version of SiYuan now organises all of the plugin's menus under a secondary menu. The plugin now expands all function menus by default under the secondary menu of 'Plugins' instead of the tertiary menu of 'Plugins - Daily Note Today'. This is a configurable option that you can change in the settings.
- Block menu related settings take effect directly. All three of the existing block-related menus take effect directly after the change is made, without the need to restart the plugin.

#### Fix

- The bug with duplicate reservation no longer occurs
- Multi-device sync conflict issue [Issue #87](https://github.com/frostime/siyuan-dailynote-today/issues/87)

    As the SiYuan plugin loads before the synced data, if you have the "Open Today's Diary Automatically" feature enabled, you may have a situation where you create a diary and then sync the diary created in another device.

    This problem was caused by SiYuan's own import mechanism and there was nothing the plugin itself could do about it. However, with this update, the plugin will check for conflicting diaries after the first data sync is completed after startup, and if there are any, a dialog box will pop up to alert the user.

    > **NOTE**: This feature **has not been rigorously tested** so there may be some issues, if you find that the plugin is not popping up the conflict alert popup correctly, feel free to come back with feedback.

- The menu does not pop up correctly when the icon is clicked on mobile
