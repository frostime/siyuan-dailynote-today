## V1.5.0 重复日记处理 | Duplicate daily note handling

> **注意: 本次更新对「重复日记自动处理」改动较大，建议去阅读一下插件文档 {## 特殊问题 | 重复的日记}**

优化重复日记处理方案，提供多种处理重复日记的方法。

1. 全部合并（此前的默认行为）：将所有日记合并到最早的那个日记中
2. 删除日记：将除了最早创建的日记以外的日记文档全部删除
3. 智能合并：将非空、经过更改、存在引用的日记合并到最早的那个日记中，删除空白且无引用的日记文档
4. 垃圾箱：将重复的日记移动到 `[daily note root]/trash-bin/` 目录下，并删除 `custom-dailynote-` 属性

---

> **Note: This update has made significant changes to the "automatic handling of duplicate DailyNotes". It is recommended to read the plugin documentation {## Special Issues | Duplicate DailyNotes}.**

Optimizing the solution for handling repeated daily notes, multiple methods are provided to address duplicate entries.

1. Merge All (Default Behavior Before): Merge all the notes into the earliest one.
2. Delete Documents: Delete all the daily note documents except the earliest created one.
3. Smart Merge: Merge non-empty, modified, and referenced notes into the earliest one, and delete blank and non-referenced notes.
4. Trash Bin: Move duplicate daily notes to the `[daily note root]/trash-bin/` directory and remove the `custom-dailynote-` attribute.
