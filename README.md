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
MESL | 07-26 21:43
Cherry Network | 07-26 21:43
```

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
argument=title=MESL&reset_day=11&icon=externaldrive.fill.badge.icloud&color=#007aff&url=https://example.com/get?token=123&type=surge
```

错误示例：

```ini
argument=url=https://example.com/get?token=123&type=surge&title=MESL
```

## 完整双订阅模块示例

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
# 订阅链接1：MESL
# 订阅链接2：Cherry Network

[Panel]

订阅链接1 = script-name=订阅链接1,update-interval=86400
订阅链接2 = script-name=订阅链接2,update-interval=86400

[Script]

订阅链接1 = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/Eightean/Surge/main/Sub-info.js,script-update-interval=86400,argument=title=MESL&reset_day=11&icon=externaldrive.fill.badge.icloud&color=#007aff&url=订阅地址1

订阅链接2 = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/Eightean/Surge/main/Sub-info.js,script-update-interval=86400,argument=title=Cherry Network&reset_day=99&expire=1970-01-01&icon=externaldrive.fill.badge.icloud&color=#007aff&url=订阅地址2
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
订阅链接1 = type=generic,...,argument=title=MESL&url=订阅地址
```

信息面板实际显示的是 `title=` 后面的内容，而不是内部标识。

## 更新频率

示例模块使用：

```ini
update-interval=86400
script-update-interval=86400
```

表示面板数据和远程脚本每天自动检查一次。点击 Surge 面板右侧的刷新按钮可以立即更新。

## 注意事项

- 订阅地址通常包含访问令牌，请勿提交到公开仓库或分享给他人。
- 本仓库的示例配置不包含真实订阅地址。
- 面板依赖订阅服务器返回 `subscription-userinfo` 响应头；如果服务商不提供该响应头，脚本无法读取流量信息。
- 使用未经编码的订阅地址时，请始终将 `url=` 放在参数列表最后。

## 致谢

- [mieqq/mieqq](https://github.com/mieqq/mieqq)
- [Rabbit-Spec/Surge](https://github.com/Rabbit-Spec/Surge)
