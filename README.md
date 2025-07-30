# 📦 HomeInventory AI - 智能家庭物品管理

一款基于 AI 图像识别的智能家庭物品管理应用，用户可以通过拍照上传物品架或收纳空间的照片，系统自动识别照片中的物品种类，记录到库存中，并支持分类、保质期提醒、物品位置管理等功能。

## ✨ 核心功能

### 🎯 物品识别与录入
- 用户拍照上传架子照片（如冰箱、书柜、杂物架）
- 系统自动识别图片中包含的物品（基于 AWS Rekognition AI 服务）
- 展示识别结果，支持用户修改名称/数量/保质期
- 一键保存至库存列表

### 📋 库存查看与管理
- 首页展示所有已保存的库存物品
- 支持分类浏览（食品/日用品/书籍等）
- 支持搜索、筛选（如：快过期、低库存）
- 查看/编辑/删除物品详情

### ➕ 手动添加物品
- 用户可以手动添加物品，输入名称、数量、保质期、分类、存储位置等信息

## 🛠️ 技术栈

| 功能模块 | 技术/服务 | 说明 |
|---------|-----------|------|
| 前端开发 | Next.js + Tailwind CSS | 现代化 React 框架，响应式设计 |
| 状态管理 | React useState/useContext | 轻量级状态管理 |
| 图像识别（AI） | AWS Rekognition | 亚马逊云服务，高精度物体和文字识别 |
| 数据存储 & Auth | Supabase Database + Auth | 一体化托管，开箱即用 |
| 后端 API | Next.js API Routes | 简单、无需额外服务器 |
| 文件上传存储 | Supabase Storage | 文件上传 & 图像CDN 托管 |

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd homeinventory-ai
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置

复制环境变量示例文件：
```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，填入你的配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AWS Rekognition 配置
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
```

### 4. 数据库设置

在 Supabase 中创建以下表结构：

```sql
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  category TEXT,
  expire_date DATE,
  location TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📱 页面结构

| 页面路径 | 描述 |
|---------|------|
| `/` | 首页，展示所有库存物品 |
| `/upload` | 上传图片并识别物品 |
| `/add` | 手动添加物品 |
| `/item/[id]` | 查看和编辑单个物品详情 |

## 🔧 第三方服务配置

### 1. Supabase
1. 注册账号：[https://supabase.com](https://supabase.com)
2. 创建新项目，开启：
   - Database（PostgreSQL）
   - Auth（邮箱/匿名登录）
   - Storage（用于上传照片）
3. 获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`

### 2. AWS Rekognition
1. 注册 AWS 账号：[https://aws.amazon.com](https://aws.amazon.com)
2. 创建 IAM 用户并分配 `AmazonRekognitionFullAccess` 权限
3. 获取 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`
4. 设置 `AWS_REGION`（推荐：us-east-1）

**AWS Rekognition 优势：**
- 高精度物体识别（1000+ 类别）
- 文字识别（OCR）功能
- 无需训练，开箱即用
- 按使用量付费，成本可控
- 支持多种图像格式

## 🎨 功能特性

- **响应式设计**：支持手机、平板、桌面端
- **AI 图像识别**：基于 AWS Rekognition 的高精度识别
- **实时搜索**：支持物品名称搜索
- **智能筛选**：按过期状态、分类筛选
- **过期提醒**：自动标识即将过期和已过期物品
- **数据持久化**：基于 Supabase 的可靠数据存储

## 🔮 后续功能规划

| 功能 | 描述 |
|------|------|
| 保质期提醒 | 到期前推送或标红 |
| 条码扫描录入 | 通过摄像头识别条形码 |
| 多人协作 | 家庭共享库存 |
| 本地模型部署 | 使用 ONNX 或 CoreML 自托管识别模型 |

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**HomeInventory AI** - 让家庭物品管理变得简单智能 🏠✨ 