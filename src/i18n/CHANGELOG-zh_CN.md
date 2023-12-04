### [2023-12-05] v1.3.0: 为日记增添自定义属性

> <span style="font-size: 1.2em; font-weight: bold;">注意: 思源 daily note 功能<span style="color: red;">重要更新</span>!</span>

从 2.11.1 开始, 思源在创建日记的时候会自动为文档添加 `custom-dailynote-yyyymmdd` 属性, 以方便将日记文档同普通文档区分。

<span style="font-weight: bold; color: var(--b3-theme-primary)">详情请见 Github Issue <a href="(https://github.com/siyuan-note/siyuan/issues/9807)">#9807</a><span style="font-size: 1.2em; font-weight: bold;">

插件本次的更新主要针对这一特性做出调整:

1. 插件自己创建日记的时候, 同样也会添加对应的属性
2. 提供了**为过去的 Daily Note 补充文档属性**的功能按钮

    - 打开插件设置-日记
    - 点击「为过去的 Daily Note 补充文档属性」按钮

    ![](https://github.com/frostime/siyuan-dailynote-today/asset/OldDNAttr.png)


此后, 你就可以通过类似的 SQL 语句查询 daily note 了, 如下 `custom-dailynote-202312%` 会匹配 2023 年 12 月份的所有日记

```sql
select distinct B.* from blocks as B join attributes as A
on B.id = A.block_id
where A.name like 'custom-dailynote-202312%'
order by A.value desc;
```

