# Surge 订阅流量信息面板

这是一个适用于 Surge 的订阅流量信息面板脚本，用于显示订阅的流量使用情况、流量重置日期、套餐到期日期以及面板更新时间。

本项目基于 [mieqq](https://github.com/mieqq/mieqq) 的原始脚本和 [Rabbit-Spec/Surge](https://github.com/Rabbit-Spec/Surge) 的修改版本进行调整。

## 功能

- 显示已使用流量和总流量
- 显示距离流量重置日的剩余天数
- 显示订阅套餐到期日期
- 在面板标题中显示最后更新时间
- 支持自定义面板标题、图标和图标颜色
- 支持直接填写未经过 URL Encode 的订阅地址
- 兼容旧版经过 URL Encode 的参数格式

面板标题示例：

```text
订阅链接1 | 07-26 21:43
订阅链接2 | 07-26 21:43
```

## 远程模块安装（新版）

适用于 Surge iOS 5.11.0 或更新版本。在 **Modules → Install New Module…** 中填写：

```text
https://raw.githubusercontent.com/Eightean/Surge/main/Sub-info.sgmodule
```

安装后点击 **Edit Arguments**，按需填写，最多五组订阅，每个订阅一个独立面板：

| 参数 | 填写说明 |
| --- | --- |
| 订阅 1 名称 | 自定义面板标题 |
| 订阅 1 链接 | 原始订阅链接，无需编码；不用的位置保留 `-`，不启用对应面板 |
| 订阅 1 重置日 | 填 `1–31` 显示「重置时间：剩余N天」；填「长期」或「长期有效」显示「重置时间：长期有效」；`-` 不显示 |

订阅 2 至 5 同理。重置当天直接倒计时到下个月，当月没有对应日期时按月末计算。到期日期显示为 `到期时间：2026 年 08 月 09 日`；到期字段为空或为零时显示「到期时间：长期有效」，字段缺失或无效时分别显示「未提供」或「未知」，实际有效期请以机场套餐说明为准。

🔒 **本模块不会将订阅链接上传到 GitHub 或其他地方。** 链接由 Surge 保存在本地；查询流量时会请求填写的订阅地址。Surge 自身的 iCloud 同步、导出或系统备份不受本模块控制，请勿分享含私人链接的截图、配置或备份。

模块使用 `Sub-info-panel.js`，旧 `Sub-info.js` 保留不变。新版暂未开放图标和颜色参数。名称与链接不要包含英文逗号、英文单双引号或换行，名称不要包含 `&`。

更新时先更新模块，再刷新面板；若仍运行旧脚本，请在 **外部资源** 中更新 `Sub-info-panel.js`。模块里的脚本地址已附加版本号。以下原有说明和双订阅示例针对旧版 `Sub-info.js`。

## 文件

### `Sub-info.js`

负责请求订阅地址、读取响应头中的 `subscription-userinfo`，并生成 Surge 信息面板内容。

脚本 Raw 地址：

```text
https://raw.githubusercontent.com/Eightean/Surge/main/Sub-info.js
```

## 相对原版的修改

1. 在面板标题中增加 `MM-DD HH:mm` 格式的更新时间。
2. 支持直接使用未经 URL Encode 的订阅地址。
3. 保留对旧版 URL Encode 参数格式的兼容。
4. 将 `sizes` 声明为函数内局部变量，避免创建全局变量。

## 免 URL Encode 的使用规则

订阅地址不再需要进行 URL Encode，但必须满足以下要求：

- `url=` 必须是 `argument` 中的最后一个参数。
- 订阅地址后面不能继续添加其他模块参数。

正确示例：

```ini
argument=title=订阅链接1&reset_day=11&icon=externaldrive.fill.badge.icloud&color=#007aff&url=https://example.com/get?token=123&type=surge
```

错误示例：

```ini
argument=url=https://example.com/get?token=123&type=surge&title=订阅链接1
```

## 完整双订阅模块示例（旧版，仍可使用）

将 `订阅地址1` 和 `订阅地址2` 替换成对应的原始订阅链接即可。

```ini
#!name=机场流量信息
#!desc=显示订阅流量、套餐到期日期及更新时间
#!system=ios

# 更新日期：2026.07.26
# 版本：3.4
#
# 订阅地址不需要进行 URL Encode。
# 必须将 &url=订阅地址放在 argument 的最后。
#
# 第一个面板标题：订阅链接1
# 第二个面板标题：订阅链接2

[Panel]

订阅链接1 = script-name=订阅链接1,update-interval=86400
订阅链接2 = script-name=订阅链接2,update-interval=86400

[Script]

订阅链接1 = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/Eightean/Surge/main/Sub-info.js,script-update-interval=86400,argument=title=订阅链接1&reset_day=11&icon=externaldrive.fill.badge.icloud&color=#007aff&url=订阅地址1

订阅链接2 = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/Eightean/Surge/main/Sub-info.js,script-update-interval=86400,argument=title=订阅链接2&reset_day=99&expire=1970-01-01&icon=externaldrive.fill.badge.icloud&color=#007aff&url=订阅地址2
```

## 参数说明

| 参数 | 是否必需 | 说明 |
| --- | --- | --- |
| `url` | 是 | 订阅地址。使用原始地址时必须放在 `argument` 最后 |
| `title` | 建议填写 | 信息面板显示的标题 |
| `reset_day` | 否 | 每月流量重置日期，例如 `11` |
| `expire` | 否 | 手动指定到期日期，格式为 `yyyy-MM-dd`；设置为 `false` 时不显示 |
| `icon` | 否 | 有效的 SF Symbol 名称 |
| `color` | 否 | 图标颜色，例如 `#007aff` |
| `method` | 否 | 请求方法，默认使用 `head` |

## 内部标识与显示标题

以下配置中的 `订阅链接1` 只是 Surge 内部标识：

```ini
[Panel]
订阅链接1 = script-name=订阅链接1

[Script]
订阅链接1 = type=generic,...,argument=title=订阅链接1&url=订阅地址
```

信息面板实际显示的是 `title=` 后面的内容，而不是内部标识。

## 更新频率

示例模块使用：

```ini
update-interval=86400
script-update-interval=86400
```

面板与脚本的更新间隔均为一天，实际检查时机由 Surge 决定。点击面板刷新会重新运行脚本，但不一定重新下载远程 JS；更新脚本请使用外部资源页面。

## 注意事项

- 订阅地址通常包含访问令牌，请勿提交到公开仓库或分享给他人。
- 本仓库的示例配置不包含真实订阅地址。
- 面板依赖订阅服务器返回 `subscription-userinfo` 响应头；如果服务商不提供该响应头，脚本无法读取流量信息。
- 使用未经编码的订阅地址时，请始终将 `url=` 放在参数列表最后。

## 致谢

- [mieqq/mieqq](https://github.com/mieqq/mieqq)
- [Rabbit-Spec/Surge](https://github.com/Rabbit-Spec/Surge)
