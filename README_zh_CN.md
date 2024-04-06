[README English](README_en_US.md)

# 今日笔记

**本插件主要用于辅助在思源中的 Daily Note 笔记工作流**

- 提交 Issue 请访问[Github](https://github.com/frostime/siyuan-dailynote-today)
- **如果使用的过程中有问题，可以先阅读 [常见问题](#常见问题) 一节；如果还有问题，再到 Github 上提 Issue**
- 有问题尽量在 Github 上提，在群里问我不一定看得见

> 文档中「日记」「笔记」「daily note」几个词可能会交替使用，不用在意，他们都表示一个含义.

> 更新日志见: [CHANGELOG.md](CHANGELOG.md)

* 我需要这个插件吗？
* 这个插件可以做什么

  * 1. 启动的时候自动创建笔记

    * 1.1 我有多个笔记本，哪个笔记本会被用来默认创建笔记呢？
    * 1.2 黑名单
  * 2. 左键点击图标，快速创建/打开今天的笔记

    * 2.1 随日期更新
  * 3. 右键点击图标，快速配置插件
  * 4. 预约块

    * 快捷键触发
    * 4.1 查看未来预约
    * 4.2 目前支持的日期模板
    * 4.3 注意
  * 5. 移动块到今天的 Daily Note 中
  * 6. 设置面板
* 兼容性功能 | 为过去的 Daily Note 补充文档属性
* 特殊问题 | 重复的日记
* 常见问题

  * Q: 我不想每次打开笔记的时候就创建日记。
  * Q: 下拉框是选择默认打开的笔记本的吗?
  * Q: 如何用 SQL 查询所有的预约？
  * Q: 什么情况下我需要更新状态？

* CHANGELOG

## 我需要这个插件吗？

- 这个插件**主要面向使用 daily note 工作流**的人，如果你习惯在文档树中做笔记而非在日记中做笔记，那么这个插件也许不适合你
- 你可以单纯把这个插件当成一个**自动创建日记**的工具，就像 logseq 一启动就是今天的日记一样——使用这个插件你也可以一启动打开今天的日记
- 如果你**同时使用多个笔记本**，并且有同时在多个笔记本中编写日记的需求，使用这个插件你可以**快速打开指定笔记本的日记**
    - 注意：能打开的仅限今天的日记（毕竟叫今日笔记）
    - 如果你需要快速打开任意笔记本任意时间的日记，请使用日历插件（还未上架）
- 如果你有在多个笔记本中记日记的需求，又觉得不停打开多个日记很麻烦，你可以使用本插件提供的**移动块**功能，快速的把文档中的块移动到指定笔记本的日记中，避免频繁手动切换笔记本
- 你还可以把这个插件当成一个简单的**日程管理**工具，本插件提供了「预约块」的功能，可以作为管理今日代办事项的工具


## 这个插件可以做什么

### 1. 启动的时候自动创建笔记

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/AutoOpen.png)

- 启动插件时，自动创建/打开今天的笔记，实现类似 logseq 中的效果
- 如果你不需要，可以在设置面板中关闭这一功能
- 在笔记本设置页面中设置的自定义路径以及模板都依然有效

> 如果你开启了多端同步，可能会出现日记重复的情况，详情见 [FAQ: 为什么会出现重复的日记](#q-为什么会出现重复的日记)

#### 1.1 我有多个笔记本，哪个笔记本会被用来默认创建笔记呢？


- **默认情况**下，插件会**自动选择自定义顺序下排位第一**的笔记本，在这个笔记本内创建今天的日记
- 如果你不满意这个设定，请打开插件的「设置面板」中，然后**手动指定默认笔记本的 ID**
    - 操作流程：右键打开笔记本图标，点击「设置」按钮，再点击「复制ID」
    - 注意：只能填写一个笔记本的 ID 作为默认
    - 如果 ID 填写错误，则启动插件的时候会警告
    - 关于如何打开设置面板，请阅读文档后面的内容

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/DefaultNotebook.png)

#### 1.2 黑名单

如果你的笔记本太多, 可以选择将部分笔记本加入黑名单, 这样这些笔记本就不会出现在下拉列表中

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/Blacklist.png)


### 2. 左键点击图标，快速创建/打开今天的笔记

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/IconLeftClick.png)

- 下拉框中按照笔记本顺序排列，列出所有的笔记本
- 点击笔记本，可以快速打开/创建今日的笔记
- 笔记本名称前面带有 **「√」符号** ，表示该笔记本下**已经创建了今天的日记**
    - 「√」标识会自动更新
- 下拉框会忽略「思源笔记用户指南」笔记本
- 在笔记本设置页面中设置的自定义路径以及模板都依然有效

> - **注意：不要理解错了**，这个下拉框不是用来选择默认的笔记本的，而是用来快速打开日记的！详情解释见后面的 [常见问题-下拉框是选择默认打开的笔记本的吗](#q-下拉框是选择默认打开的笔记本的吗)

#### 2.1 随日期更新


每当 0 点钟的时候，插件会自动报时并更新日记的状态，此时你再点击顶栏菜单，打开的就是新一天的日记。但是，并不会自动帮你创建日记。

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/UpToDate.gif)


### 3. 右键点击图标，快速配置插件

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/IconRightClick.png)


- 点击进入插件设置面板
    - 你也可以使用官方的入口进入设置面板，但是官方的操作我觉得太麻烦了，就提供了一个快捷入口
- 点击 “更新 ”更新插件全局状态
    - 细节请阅读[常见问题 - 更新状态](#Q-什么情况下我需要更新状态)

### 4. 预约块

你可以把预约块理解成一个简单的日程管理或任务提醒。我们常常会遇到这种需求：需要在未来的某一天完成一个特定任务。这个时候就可以使用预约块功能：

1. 点击块，选择「预约此块」

    ![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/Reserve1.png)
    <!-- ![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/https://s3.bmp.ovh/imgs/2023/05/28/69479868c4da8344.png) -->

2. 插件会自动匹配块内容中的日期时间，确定后，插件会帮你把这份预约记录下来

    被匹配到的时间会在确认对话框中高亮显示;。如下图所示, 插件匹配到了 `6月01号`, 并解析为 `2023-06-01`。

    ![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/Reserve2.png)
    <!-- ![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/https://s3.bmp.ovh/imgs/2023/05/28/2a30bad068dc534f.png) -->

3. 等到当天的时候，插件在自动创建完日记后，会帮你把相关的预约以嵌入块的形式插入日记中

    ![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/Reserve3.png)
    <!-- ![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/https://s3.bmp.ovh/imgs/2023/05/28/f10c726b06042635.png) -->

4. 如果你发现预约的嵌入块没有自动插入，可以点击图标菜单中的「更新」按钮更新文档

5. 完成预约块后，会自动为块添加一个自定义属性 `custom-reservation` 并填写备注，方便用户快速识别哪些块加入了预约

    ![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/R-memo.png)

    ![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/R-attr.png)

6. 再次点击一个已经预约过的块，你可以选择「取消预约」

7. 默认将所有的预约作为一个嵌入块插入到文档开头，如果你对默认行为不满，可以在设置中自行更改。

你可以自定义 css 样式来展示这些预约块，下面是一个例子，你可以把它加入到代码片段中。

```css
.protyle-wysiwyg div[custom-reservation] {
    border-style: dashed;
    border-width: 1.5px;
    border-radius: 0.5rem;
    border-color: var(--b3-theme-primary);
}
```

有了自定义属性，你可以使用 SQL 来查询所有的预约块，详情见[常见问题](#q-如何查看所有的预约)。

#### 快捷键触发

使用 `Shift+Alt+R` 快捷键可以快速触发预约块功能。

#### 4.1 查看未来预约

在 Dock 栏提供了查看预约的面板。

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/ShowResv.png)

点击日期旁边的数字，可以查看当日所有预约。

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/ShowDateResv.png)

> 注意: 这里只能查看未来的预约，且由于收到思源数据查询的限制，最多查看 32 条。如果希望更加自由地查看预约，可以参考 [常见问题](#q-如何查看所有的预约)。

#### 4.2 目前支持的日期模板

- 标准年月日
    - `2020-04-01`, `2020/04/01`, `2020.04.01`
    - `2020年5月2号`, `2020年5月2日`
    - 日期之间可以有空格: `2020年5月2号` 和 `2020 年 5 月 2 号`都是可以的
    - 月份和日期可以加 0: `6月01日` , `06月01日`, `6月1日` 都是可以的
    - 可以不写年份, 这样默认会认为是同一年: 例如在 23 年的某一天, 写下的 `9月8号` 会被认为是 `2023-09-08`
    - > 很遗憾，本插件不打算为能活到 `3000` 年之后的用户提供更长远的支持，所以你只能使用 `2999` 年之前的年份

- 中文月日
    - 九月十二号
    - 三月六日
    - 不支持中文年份

- 周计时
    - 周二
    - 星期三
    - 礼拜日，礼拜天
    - 下周六

- 相对时间
    - 今天，今日
    - 明天，后天，大后天
    - N天后，如 `10 天后`, `10 days later`；只能用阿拉伯数字

- 大量英文日期

    - Today, Tomorrow, Yesterday
    - 17 August 2023
    - This Friday
    - 2 weeks from now
    - 注意: 英文日期暂时还不支持在确认窗口里高亮匹配的文本项, 且匹配优先级相较于上面的模式更低

#### 4.3 注意

1. 只有在插件自动创建/打开日记的时候, 才会自动插入预约块
2. 你可以使用「更新」按钮来手动在日记中插入预约块
3. 日期匹配规则
    - 不可以写过去
    - 如果有多个符合规范的日期, 那么只有第一个会被匹配
4. 此功能**默认关闭**，请在手动在设置中开启

### 5. 移动块到今天的 Daily Note 中

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/MoveBlock.png)

- 选中块左侧的图标点击，在「今日笔记」菜单下有一个「移动块」项目; 选择笔记本，可以把**当前块**移动到对应笔记本今天的日记下
- 可以移动单个块
- 可以移动列表块
- 移动整个标题块
- 这个功能默认关闭，请在设置中打开

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/MoveBlocks.gif)

### 6. 设置面板

> 具体的设置内容以软件内部为准

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/Setting.png)


## 兼容性功能 | 为过去的 Daily Note 补充文档属性

从 2.11.1 开始, 思源在创建日记的时候会自动为文档添加 `custom-dailynote-yyyymmdd` 属性, 以方便将日记文档同普通文档区分。

<span style="font-weight: bold; color: var(--b3-theme-primary)">详情请见 Github Issue <a href="(https://github.com/siyuan-note/siyuan/issues/9807)">#9807</a><span style="font-size: 1.2em; font-weight: bold;">

2.11.1 后, 你就可以通过类似的 SQL 语句查询 daily note 了, 如下 `custom-dailynote-202312%` 会匹配 2023 年 12 月份的所有日记

```sql
select distinct B.* from blocks as B join attributes as A
on B.id = A.block_id
where A.name like 'custom-dailynote-202312%'
order by A.value desc;
```

但前提是你的日记要设置相应的文档属性。为了方便用户做兼容，本插件提供了为过去的 Daily Note 补充文档属性的功能

- 打开插件设置-日记
- 点击「为过去的 Daily Note 补充文档属性」按钮

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/OldDNAttr.png)


## 特殊问题 | 重复的日记

有时候你会发现插件突然弹出窗口，告诉你日记的内容出现了重复:

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/DupDN-ZH.png)


这种问题出现的前提条件是：

1. 开启了插件自动创建日记的功能
2. 使用了多端同步

问题的原因是在思源的架构中，**插件的启动运行在开机数据同步之前**，且二者完全是异步执行的。假如你此前在 A 设备上创建了日记，然后在打开 B 设备的时候，插件会自动给你创建一份日记；然后思源才会同步数据，这样依赖之前在 A 上创建的日记和现在在 B 上创建的日记就重复了。

> 此前开发者尝试过添加「同步后再创建日记」的功能，但是实际测试没有什么用，目前这个设置仍然保留在插件中，但是可能会在某个未来版本移除

目前并没有很好的方案来避免这一问题发生，所以插件只能另辟蹊径提供了多种自动处理方案来帮助用户快速处理重复的文档（当然为了保险你也可以手动处理）

首先，自动处理的**原则是：将最早创建的日记视为主日记，其他所有日记都是重复日记**。基于这一原则，提供了四种自动处理方式：

1. 🤲 全部合并：将其他全部的重复文档合并到主日记文档内（安全）
2. ❌ 直接删除：直接删除其他的重复日记（存在风险）
3. 🗑️ 移动到回收站：在「daily note」根路径下，创建了一个 `trash-bin` 文档，所有重复的日记都会移动到这个文档下并删除 `custom-dailynote-yymmdd` 属性（安全）
4. 🤔 智能合并: 按照一定的规则将文档或者删除或者合并到主日记（存在风险）
    - 内容为空、没有引用或链接的文档，被直接删除
    - 内容不为空，但是更新时间不超过创建时间三秒钟的文档（例如日记使用了模板），被直接删除
    - 其他文档，被合并到主日记文档内


## 常见问题

### Q: 我不想每次打开笔记的时候就创建日记。

请在插件设置里关闭「自动打开 Daily Note」。


### Q: 下拉框是选择默认打开的笔记本的吗?

> - **注意：不要理解错了**，这个下拉框不是用来选择默认的笔记本的，而是用来快速打开日记的！
> - 你完全可以把这个功能理解为把思源自带的「创建日记」的菜单移到最顶层，并添加了日记状态的显示。
> - 想要指定默认的笔记本，请到设置里面。

- 举个例子，当前我有四个笔记本，如果我点击下拉框中的按钮，会在打开对应笔记本下今天的日记。
- Life 、 work、 Hobby 这三个笔记本前面有「√」，表示这三个笔记本下已经创建了日记。

![](https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main/asset/IconMenu.png)

此时，如果我再点击「Academic Learn」，那么就会在这个笔记本下新创建一个日记，然后你再打开下拉框，就会发现这个笔记本前面也出现了一个「√」符号。

### Q: 如何用 SQL 查询所有的预约？

如果插件版本在 1.1.1 以上，那么所有插入块都会设置 `custom-reservation` 属性，所以可以使用 SQL 来查询，这里给出模板。

```sql
select B.*
from blocks as B
inner join attributes as A
on(
  A.block_id = B.id and 
  A.name = 'custom-reservation'
  and A.value >= strftime('%Y%m%d', datetime('now')) 
) order by A.value;
```

注意 `and A.value >= strftime('%Y%m%d', datetime('now'))` 这一段过滤了所以已经过期的预约，如果您无论如何都想查看已经过去的预约，可以把这一段删除。

如果你安装了 Query 挂件，这里还提供了一个表格版 SQL:

```sql
select
A.value||'000000' as __10____date__预约日期,
'['
||substr(B.created,1,4)
|| '-' || substr(B.created,5,2)
|| '-' || substr(B.created,7,2)
|| '](siyuan://blocks/' || B.id|| ')' as __11____pre__创建时间,
substr(B.content,1,30) as __22____pre__内容
from blocks as B
inner join attributes as A
on(
  A.block_id = B.id and 
  A.name = 'custom-reservation'
  and A.value >= strftime('%Y%m%d', datetime('now')) 
) order by A.value;
```

### Q: 什么情况下我需要更新状态？

- 当打开、关闭、创建、移动笔记本的时候，请按更新状态
    - 插件可自动追踪笔记的创建情况，但是不会追踪笔记本的状态
- 手动更新当日的预约块

