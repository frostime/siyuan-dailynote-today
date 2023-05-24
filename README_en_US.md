# Today's Note


**This plugin is mainly used for enhancement for daily note workflow in SiYuan.**

> The words "diary", "notes" and "daily note" may be used interchangeably in the document, so don't worry, they all mean the same thing. \
> If not specified, "notes" means "today's diary".

## Do I need this plugin?

- This plugin** is mainly for people who use daily note workflow**, so if you're used to making notes in the document tree rather than in your daily notes, then this plugin may not be for you
- You can use this plugin simply as a tool to **automatically create a diary**, just like logseq who create today's diary on start up.
- If you **use multiple notebooks** and have the need to write multiple diaries in those notebooks at the same time, you can use this plugin to **quickly open the diary** of a specific notebook
    - Note: you can only open today's diary (after all, it's called "Daily Note Today")
    - If you need to quickly open the diary of any notebook at any time, please use the calendar plugin (not yet available, but will in future)
- If you have the need to take notes in more than one notebook, and feel that it is troublesome to frequently open multiple diaries, you can use the **Move Blocks** feature provided by this plugin to quickly move the blocks in a document to the diary in the specified notebook, avoiding frequent manual switching of notebooks


## What can this plugin to

### 1. Auto-create daily note for today

![](asset/AutoOpen.png)

- When you start the plugin, it automatically creates/opens today's daily note, achieving a similar effect as in logseq
- If you don't need it, you can turn off this feature in the settings panel
- The custom paths and templates set in the notebook settings page are still valid

#### 1.1 I have multiple notebooks, which notebook will be used to create notes by default?


- By **default**, the plugin will **automatically select the notebook that is sorted first** and create today's diary in this notebook
- If you are not satisfied with thie default setting, open the plugin in the "Settings Panel" and then **manually specify the default notebook ID**
    - Procedure: Right-click to open the notebook icon, click the "Settings" button, and then click "Copy ID".
    - Note: Only one notebook ID can be filled in as the default.
    - If the ID is incorrectly filled in, a warning will be given when the plugin is launched
    - For more information on how to open the settings panel, please read the later part of the document

![](asset/DefaultNotebook.png)

### 2. Left lick the icon, quickly creating/opening today's note.

![](asset/IconLeftClick.png)

- The dropdown menu lists all notebooks in order.
- Click on a notebook to open/create today's note.
- If there is a "√" flag before a notebook option, it means that diary has already been created for that notebook.
- Ignore "SiYuan User Guide" notebook by default.
- The custom paths and templates set in the notebook settings page are still valid

> - **Note: Don't misunderstand**, this drop-down box is not for selecting the default notebook, but for opening the diary quickly!
> - You can totally interpret this as moving the "Create Diary" menu that comes with Siyuan to the top level and adding a diary status display.
> - To specify the default notebook, please go to Settings Panel.

#### 2.1 Example

For example, I currently have four notebooks. If I click the button in the drop-down box, it will open the diary for today in the corresponding notebook.
Life, work, and Hobby have a "√" in front of them, which means that they have already created diaries.

![](asset/IconMenu.png)

At this point, if I click on "Academic Learn", then a new diary will be created under this notebook, and then you can open the drop-down box again and you will see that a √ symbol also appears in front of this notebook.

#### 2.2 Update with date

At 0 o'clock the plug-in will automatically chime in and update the status of your diary, at which point you can click on the top bar menu to open the diary for the new day. However, it does not automatically create a diary for you.

![](asset/UpToDate.gif)

This feature can be turned off in the settings, but this setting is scheduled to be removed with the SiS update version 2.9.

![](asset/SetUpToDate.png)




### 3. Right click the icon, quickly configuration.

![](asset/IconRightClick.png)


- Click to enter the plugin settings panel
    - You can also use the official portal to enter the settings panel, but the official operation I think is too much trouble, so here provides a shortcut portal
- Click "Update" to update the global status
    - Read[FAQ](#q-when-do-i-need-to-update-status) for details

### 4. Setting pannel

![](asset/Setting.png)

### 5. Move blocks into today's daily note

![](asset/MoveBlock.png)

- Select the icon leftside of a block and press "Alt + Right Click" to bring up a moving block panel.
- Choose a notebook to move the current block to the diary of the corresponding notebook for today.
- Supports moving the entire nested structure
    - If you move a list block, it will move the entire list structure over
    - But it is not possible to move individual list items (It's a Siyuan's bug)
- Support moving all content below the heading block

#### 5.1 Demonstration of the Move Block feature

- Move the document under the diary in the "Work" notebook to the diary in the "Hobby" notebook
- Since the heading block is selected, all the content underneath is also moved over

![](https://gitcode.net/frostime/siyuan-plugin-daily-note/-/raw/main/asset/MoveBlocks.gif)
<!-- ![](asset/MoveBlocks.gif) -->


## FAQ


### Q: I don't want to create a diary automatically.

Please toggle off "Open Today's Diary Automatically" in the plugin settings.

### Q: When do I need to "Update" status

- When there is an update to a notebook (such as opening/closing/creating/moving a notebook), press the keyboard shortcut "ctrl+alt+u" to update the status.
    - The plugin can automatically track the creation status of the note, but it will not track the status of the notebooks.
- When "Alt + right click" can note bring up moving menu, try updating.

### Q: Why is it so slow when moving header blocks?

It's not slow, it's just that there is a process when moving blocks.

In SiYuan, header blocks are not container blocks, so it is not possible to move them all at once. It requires recognition of which blocks belong to the current header, so it takes some time.


## CHANGELOG

[CHANGELOG](CHANGELOG.md)
