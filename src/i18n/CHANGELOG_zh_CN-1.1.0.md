## 今日笔记 v1.1.0 更新说明

### 新功能: 预约此块

隆重介绍这个版本推出的新功能: **预约日记功能**。你可以把它理解为一个简单的 TODO 功能。

- 预约此块: 选中一个块, 并点击今日笔记的「预约」菜单，如果块中的内容包含有未来的日期，那么这个块就会加入预约列表中

    <!-- ![](https://cdn.jsdelivr.net/gh/frostime/siyuan-dailynote-today@1.1.0-dev3/asset/Reserve1.png) -->
    <!-- ![](asset/Reserve2.png) -->
    ![](https://s3.bmp.ovh/imgs/2023/05/28/69479868c4da8344.png)
    ![](https://s3.bmp.ovh/imgs/2023/05/28/2a30bad068dc534f.png)
    <!-- ![](https://cdn.jsdelivr.net/gh/frostime/siyuan-dailynote-today@1.1.0-dev3/asset/Reserve2.png) -->

- 自动插入: 当对应的日期到来的那一天, 插件会在创建当日的日记的时候, 自动把所有过去的预约块以嵌入块的形式插入到日记中

    <!-- ![](asset/Reserve3.png) -->
    ![](https://s3.bmp.ovh/imgs/2023/05/28/f10c726b06042635.png)
    <!-- ![](https://cdn.jsdelivr.net/gh/frostime/siyuan-dailynote-today@1.1.0-dev3/asset/Reserve3.png) -->

具体用法请阅读最新的插件文档 (README), 相关功能还在完善中。另外此功能**默认关闭，请在手动在设置中开启**。

> 取名废, 如果你觉得这个功能有更好的命名, 欢迎来提 issue.

### 其他更新

- 修复: 更改在找不到默认笔记本时的提醒
    - 原本直接以 error 弹窗的方式发出警报, 由于信息模糊可能会造成用户不必要的恐慌
    - 修复后, 会弹出一个对话框, 提供了完整的错误说明
