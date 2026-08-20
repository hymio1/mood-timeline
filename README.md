# 心迹 · Mood Timeline

浏览器端生活情绪记录工具，帮助你追踪日常情绪变化，发现生活规律。

## 功能特性

- **每日记录** — 记录心情等级（1-5级）、睡眠时长、精力、压力、标签和活动
- **时间线浏览** — 按日期查看历史情绪记录，支持编辑和删除
- **情绪日历** — 月视图热力图，直观感受整月情绪分布
- **数据图表** — 近30天情绪趋势折线图、情绪分布饼图、睡眠柱状图
- **情绪洞察** — 基于数据分析生成趋势、稳定性、活动关联、睡眠关联等建议
- **年度热力图** — 全年情绪/睡眠/压力/精力四维热力图
- **回忆回顾** — 展示一年前的今天和首次记录的回忆
- **成就系统** — 记录里程碑成就，激励持续使用
- **数据导出** — 支持 JSON 和 CSV 格式导出备份
- **本地存储** — 所有数据保存在浏览器 localStorage，隐私安全
- **搜索筛选** — 支持按关键词、情绪、标签搜索记录

## 技术栈

- **框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **样式**：Tailwind CSS v4 + 自定义 CSS
- **图表**：Recharts
- **路由**：React Router DOM
- **日期处理**：dayjs

## 快速开始

### 环境要求

- Node.js 18+
- npm / pnpm / yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

浏览器访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
mood-timeline/
├── src/
│   ├── components/          # 通用组件
│   │   ├── DayPicker.tsx    # 日期选择器
│   │   ├── MoodSelector.tsx # 心情选择器
│   │   ├── SleepInput.tsx   # 睡眠时长选择
│   │   ├── TagInput.tsx     # 标签输入
│   │   ├── EmptyState.tsx   # 空状态提示
│   │   ├── Modal.tsx        # 弹窗组件
│   │   └── Toast.tsx        # 消息提示
│   ├── hooks/
│   │   ├── useRecords.tsx   # 情绪记录状态管理（Context）
│   │   ├── useRecordForm.ts # 记录表单逻辑
│   │   └── useSearch.ts     # 搜索筛选逻辑
│   ├── pages/
│   │   ├── AppLayout.tsx    # 主布局（侧边栏导航）
│   │   ├── TodayPage.tsx    # 今日概览
│   │   ├── LogPage.tsx      # 记录页面
│   │   ├── TimelinePage.tsx # 时间线
│   │   ├── CalendarPage.tsx # 情绪日历
│   │   ├── StatsPage.tsx    # 统计图表
│   │   ├── AIInsightPage.tsx# 情绪洞察
│   │   ├── MemoryPage.tsx   # 回忆回顾
│   │   ├── AchievementsPage.tsx # 成就系统
│   │   ├── BackupPage.tsx   # 数据导入导出
│   │   └── SettingsPage.tsx # 设置页面
│   ├── types/
│   │   └── index.ts         # 类型定义
│   ├── utils/
│   │   └── helpers.ts       # 工具函数
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── public/
│   └── vite.svg             # 网站图标
├── index.html               # HTML 模板
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 数据结构

每条情绪记录包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| date | string | 日期（YYYY-MM-DD） |
| mood | number | 心情等级 1-5 |
| sleepHours | number\|null | 睡眠时长（小时） |
| energy | number\|null | 精力值 1-10 |
| stress | number\|null | 压力值 1-10 |
| tags | string[] | 标签列表 |
| activities | string[] | 活动标签 |
| content | string | 随笔内容（最多2000字） |
| photo | string\|null | 照片 base64（可选） |

### 心情等级

| 等级 | 标签 | emoji |
|------|------|-------|
| 1 | 很差 | 😞 |
| 2 | 低落 | 😟 |
| 3 | 普通 | 😐 |
| 4 | 开心 | 😊 |
| 5 | 很棒 | 😍 |

## 情绪洞察说明

洞察功能基于本地数据分析，生成以下类型的建议：

- **趋势分析** — 对比近一周与前一周的情绪变化
- **稳定性** — 检测近几日情绪是否波动较大
- **活动关联** — 分析特定活动与情绪的相关性
- **睡眠关联** — 评估睡眠时长对情绪的影响
- **周末模式** — 对比工作日与周末的情绪差异
- **连续打卡** — 鼓励持续记录的习惯

## 隐私说明

- 所有数据仅存储在浏览器本地 localStorage
- 不上传任何数据到服务器
- 定期导出备份以防止数据丢失
- 清除浏览器数据会导致记录丢失

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热更新）
npm run dev

# 类型检查
npx tsc --noEmit

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## License

MIT

