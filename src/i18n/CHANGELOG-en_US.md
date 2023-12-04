### [2023-12-05] v1.3.0: Adding Custom Attributes to Daily Notes

> <span style="font-size: 1.2em; font-weight: bold;">Note: <span style="color: red;">Important update</span> for SiYuan daily note functionality!</span>

Starting from version 2.11.1, SiYuan automatically adds the `custom-dailynote-yyyymmdd` attribute to the document when creating a daily note, making it easier to distinguish daily note documents from regular documents.

<span style="font-weight: bold; color: var(--b3-theme-primary)">For more details, please refer to the Github Issue <a href="(https://github.com/siyuan-note/siyuan/issues/9807)">#9807</a></span><span style="font-size: 1.2em; font-weight: bold;">

The plugin has made adjustments primarily for this feature:

1. When the plugin creates a daily note, it also adds the corresponding attribute.
2. The plugin provides a button to **add document attributes to past Daily Notes**.

    - Open the plugin settings - Daily Notes
    - Click the "Add document attribute to past Daily Notes" button

    ![](https://github.com/frostime/siyuan-dailynote-today/asset/OldDNAttr.png)


Afterwards, you can query daily notes using SQL statements similar to the following example. The statement `custom-dailynote-202312%` will match all daily notes from December 2023:

```sql
select distinct B.* from blocks as B join attributes as A
on B.id = A.block_id
where A.name like 'custom-dailynote-202312%'
order by A.value desc;
```