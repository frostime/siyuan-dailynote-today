## Daoly Note Today v1.1.0 Update Notes

### New Feature: Reserve This Block

Introducing the new feature in this version: the ability to reserve blocks. You can think of it as a simple TODO function.

- Reserve This Block: Select a block and click on "Reserve" menu. If the block's content includes future dates, the block will be added to the reserve list.

    ![](https://cdn.jsdelivr.net/gh/frostime/siyuan-dailynote-today@1.1.0-dev3/asset/Reserve1.png)
    <!-- ![](asset/Reserve2.png) -->
    <!-- ![](https://s3.bmp.ovh/imgs/2023/05/28/69479868c4da8344.png) -->
    ![](https://cdn.jsdelivr.net/gh/frostime/siyuan-dailynote-today@1.1.0-dev3/asset/Reserve2.png)

- Automatic Insertion: On the day corresponding to the reserved date, the plug-in will automatically embed all reserved blocks for that day into the diary when creating today's notes.

    <!-- ![](asset/Reserve3.png) -->
    <!-- ![](https://s3.bmp.ovh/imgs/2023/05/28/f10c726b06042635.png) -->
    ![](https://cdn.jsdelivr.net/gh/frostime/siyuan-dailynote-today@1.1.0-dev3/asset/Reserve3.png)

Read the latest plugin documentation (README) for details of how to use it, which is still being worked on. This feature is disabled by default and should be turned on manually in the settings.


> If you have a better name for this feature, please feel free to open an issue.

### Other Updates

- Bug Fix: Changed the notification when the default notebook cannot be found
    - Previously, an error message would pop up, which could cause unnecessary panic due to unclear information
    - After the update, a dialog box will appear, providing a full description of the error.
