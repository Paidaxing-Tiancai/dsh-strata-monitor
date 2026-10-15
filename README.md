# dsh-strata-monitor

在 DeepSeek Harness 里嵌入 Strata 模型服务器的状态监控面板。
A model-server monitor panel for DeepSeek Harness, mirroring the Strata server's Monitor tab.

## 功能 / Features

- **监控页 / Monitor page**：侧边栏新增图标，展示模型状态（空闲 / 读取提示词 / 生成中 / 排队）、解码与预填充速度、GPU 负载、显存、温度、功耗、PCIe、CPU、磁盘读取（均带历史曲线）、会话缓存（KV cache 驻留/复用统计）、最近请求表与累计统计。
- **悬浮小窗 / Floating window**：悬浮于所有页面之上的迷你状态窗，可拖动、右下角缩放，可在设置中开关。
- **输入框状态条 / Composer status line**：对话输入框下方的单行迷你状态，可在设置中开关。
- **会话门控 / Session gate**：小窗与状态条只在当前对话使用的模型与 Strata 报告的模型一致时出现；切换到其他模型时自动隐藏。监控页始终可用。
- **面板内配置 / In-panel settings**：服务器地址与 API key 都可在面板右上角「设置」里修改，保存后立即生效，无需重启。

## 前置条件 / Requirements

- DeepSeek Harness（桌面版或 Web 版均可）。
- 一个正在运行的 Strata 服务器（提供 `GET /health` 与 `GET /metrics`，后者需要 Bearer API key）。

## 安装 / Install

### 方式一：插件市场（推荐）/ Via the plugin market (recommended)

在 Harness 的插件市场里添加自定义目录来源（catalog source），manifest URL 填：

```
https://raw.githubusercontent.com/Paidaxing-Tiancai/dsh-strata-monitor/main/catalog-source.json
```

添加后在市场中搜索 `dsh-strata-monitor`，点击安装即可。

Add this custom catalog source in the Harness plugin market, then search for `dsh-strata-monitor` and install:

```
https://raw.githubusercontent.com/Paidaxing-Tiancai/dsh-strata-monitor/main/catalog-source.json
```

### 方式二：手动 / Manually

在 Harness 的插件管理中安装本 bundle（clone 本仓库后选择该目录），或在对话里让代理执行：

```
plugin_manager install_bundle → 本仓库 clone 后的绝对路径
```

安装后刷新页面（Ctrl+R），侧边栏会出现「模型监控」图标。

## 配置 / Configuration

推荐直接在监控页右上角「设置」中填写：

- **服务器地址**：例如 `http://192.168.10.117:8080`（保存后立即生效）。
- **API key**：Strata 的访问密钥。

也可以写在 profile 的 `cordis.patch.yml` 里（`strata-monitor` 行的 `config.baseUrl` / `config.apiKey`）。面板内保存的值写入
`~/.dsh/profiles/<profile>/strata-monitor.json`，优先级高于 yml 配置。

### 服务器地址与密钥在哪里 / Where to find the server URL and key

Strata 的地址与密钥写在它自己的启动配置文件里，通用路径为 `~/Strata/<配置名>.json`
（例如 `/home/<用户名>/Strata/strata-iq3_s.json`）。文件里能看到监听地址/端口与 API key；
Strata 的网页本身不显示密钥，请从该文件复制。

The Strata server keeps its bind address and API key in its own launch config file, typically at
`~/Strata/<profile>.json` (e.g. `/home/<user>/Strata/strata-iq3_s.json`). The Strata web UI never
shows the key — copy it from that file.

## 安全 / Security

- API key 只保存在 Host 端本机的状态文件里，**永远不会回传到浏览器**。
- 浏览器只访问 Harness 自身的同源代理路由 `/strata-monitor/health|metrics`，由 Host 侧转发到 Strata，因此没有 CORS 问题，key 也不经过前端。

## 故障排查 / Troubleshooting

- 显示「未配置」/提示需要 API key：在「设置」里填入 key。
- 显示「无法连接 Strata 服务器」：检查服务器地址、Strata 是否在运行、防火墙。
- 更新插件后界面没变化：按 Ctrl+R 刷新页面（客户端模块在页面启动时加载）。

## 许可 / License

MIT，见 [LICENSE](./LICENSE)。
