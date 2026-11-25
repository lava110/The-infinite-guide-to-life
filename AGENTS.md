# AGENTS.md — 《人生无限》工程与数据铁律

本项目（《人生无限：地球漫游指南》破局沙盘）是面向普通人（升学分流、失业瓶颈、35+/40+转型、负债重启、返乡破局）的**高准确度、强时效性人生路径决策沙盘**。所有 AI 编程助手（Codex / Cursor / Claude Code / AI Studio）在阅读与修改代码前必须严格遵守以下规则。

---

## 1. 数据不可篡改铁律（最高优先级）

- `src/data/` 目录下的路径事实数据（`verifiedPaths.ts`、`freshnessRegistry.ts`、`schema.ts`、`linkHealthReport.json`）属于**已核验事实库（L1–L5 / M1–M3）**。
- 在进行 UI 样式调整、交互优化、性能优化或 Bug 修复时，**严禁擅自修改、编造、增删任何路径中的金额、年龄/学历/体检门槛、政策条文、官方网址（`official_portal_url`）及免责声明（`mandatory_disclaimer`）**。
- 严禁在前端组件中硬编码虚构的“示例路径”替代真实核验数据。
- 任何新增路径或结构性字段变更，必须同步满足以下闭环：
  1. 同步更新 `src/data/schema.ts` 与 `src/data/ingestionGuard.ts` 中的 Zod 门禁（`PathCardMasterSchema` 及生产全量 `FullVerifiedPathSchema`），且官方门户域名必须通过白名单（区分 `STATUTORY_GOV` 与 `COMMERCIAL_FIRST_PARTY`）。
  2. 在 `src/data/freshnessRegistry.ts` 中为每条路径登记 `window_months`（招生/网报/作业窗口月份）与 `verify_cycle_days`（商业平台 60 天、配额签证 90 天、年度招考/法定许可 180 天）。
  3. 必须通过 `npm run audit:paths` 零报错验收；涉及新增或修改官方链接时，必须同步运行 `npm run check:links` 更新链路健康快照。

---

## 2. 双轨展示、时效降级与防坑红线

- 前端展示任何路径详情时，必须保持视觉与结构上的**双轨隔离**：
  - **轨 A（硬事实）**：年龄/学历/体检硬门槛、官方零加价裸价明细、L1/L2 法定溯源、门户信任分级与官方直达外链。
  - **轨 B（体感与防坑）**：必须置顶显示 `mandatory_disclaimer` 分轨声明、三阶梯真实净收入（**严禁隐藏新手低薪期或见习断档期**）、完整劝退红线（`deal_breakers`）及黑中介“照妖镜”成本对比。
- **时效状态灯与超期自动降级红线**：
  - 所有卡片展示必须通过 `getEffectiveStatusLight()` 计算有效状态灯：一旦超过 `freshness_meta.next_verify_due`，原本为 `GREEN` 的路径**必须自动降级为 `AMBER`** 并在卡片顶部展示醒目重验告警，杜绝“过期政策仍挂绿灯”。
  - 状态灯为 `YELLOW` / `AMBER` 时，UI 必须醒目提示“政策/链接待复核，请以官方门户最新公告为准”；若后续引入 `RED` 失效状态，**严禁作为推荐路径展示**。

---

## 3. 架构、运行时与 AI 安全规范

### 3.1 技术栈与运行边界
- **前端**：保持现有的 **Vite + React 19 + TypeScript + Tailwind CSS v4** 架构，禁止无故推倒重写框架或引入冗余状态库。
- **全栈服务端**：采用 Express + Vite Middleware（入口 `server.ts`，AI 核心服务 `server/advisorService.ts`），开发环境 `npm run dev`（`tsx server.ts`），生产环境 `npm start`（`node server.ts`，搭配 `npm run build` 产出的 `dist/`）。
- **Node 22 原生 ESM 硬规范**（防止部署崩溃）：
  - 所有被 `server.ts` 直接或传递导入的模块（`server/*`、`src/data/*`、`src/types/*`），相对路径导入**必须保留 `.ts` 扩展名**，纯类型导入**必须标注 `import type` / `type`**，JSON 导入**必须携带 `with { type: 'json' }`**。
  - 开发模式（`NODE_ENV=development`）必须固定绑定 **3000 端口**（避免与反向代理占用的 `PORT=8080` 冲突）；生产模式遵循 `process.env.PORT || 3000`。

### 3.2 受控 AI 诊断安全铁律
- **服务端收敛与密钥保护**：所有大模型 API 调用（`@google/genai`）**必须完全收敛在服务端接口**（`/api/advisor/diagnose`、`/api/advisor/diagnose-stream`、`/api/advisor/followup`），严禁在浏览器端导入 `@google/genai` 或暴露/硬编码任何 API Key，严禁提供前端 API Key 输入框，严禁提交 `.env` / `.env.local` 等真实密钥文件（仅保留 `.env.example` 占位）。
- **零幻觉强挂载机制**：
  - System Prompt 必须严格限定在“仅基于当前已核验 `VERIFIED_PATHS` 路径库进行门槛校对、断粮测算与对比推演”，**严禁自由编造库外政策、网址、补贴或包就业承诺**。
  - 服务端在返回结果前，必须对模型输出执行**二次强校验**：剔除任何不存在于 `VERIFIED_PATHS` 的 `path_id`，且所有官方裸价、官方网址、窗口期、超期降级告警均由服务端从标准台账直接挂载，绝不信任模型自行生成的 URL 或费用数字。
- **抗代理超时与错误透明**：
  - 长耗时诊断接口优先走 SSE 流式通道（`X-Accel-Buffering: no` + 定时心跳保活，断开检测须监听 `res.on('close')` 而非 `req.on('close')`）。
  - 服务端 JSON 报错避免直接透出易被反向代理劫持为 HTML 的 `403/502/503`；上游异常或缺失密钥时必须向用户如实报错，严禁伪造模拟诊断结果。

---

## 4. 代码修改与提交前必检纪律

- 每次改动保持最小影响面：修改 UI 或筛选逻辑前，先确认不破坏现有的四维漏斗筛选器、双滑块断粮账联动（`maxBudget` × `monthlyFamilyBurn`）、学生升学 8 年 PK 矩阵、成人转行 PK 矩阵及 12 个月逐月现金流推演表。
- 修改完成后、提交或推送前，**必须依次通过以下校验**：
  1. `npm run lint`（`tsc --noEmit` 零类型错误）
  2. `npm run build`（生产前端包零报错构建）
  3. `npm run audit:paths`（涉及数据、Schema 或时效表改动时必跑，确保 100% 通过 `FullVerifiedPathSchema`）
  4. 若改动 `server.ts` 或服务端引用链，必须额外实测 `NODE_ENV=production node server.ts` 可正常启动并响应 `/api/health`。
