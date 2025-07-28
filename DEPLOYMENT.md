# 🚀 部署指南

## 本地开发

### 1. 环境准备
```bash
# 安装依赖
npm install

# 复制环境变量
cp env.example .env.local
```

### 2. 配置环境变量
编辑 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Roboflow 配置
ROBOFLOW_API_KEY=your_roboflow_api_key
ROBOFLOW_MODEL_URL=your_roboflow_model_url
```

### 3. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 生产部署

### 选项 1: Vercel 部署（推荐）

1. **准备项目**
   ```bash
   # 确保所有文件已提交到 Git
   git add .
   git commit -m "Initial commit"
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 选择你的仓库

3. **配置环境变量**
   - 在 Vercel 项目设置中添加环境变量
   - 复制 `.env.local` 中的所有变量

4. **部署**
   - Vercel 会自动检测 Next.js 项目
   - 点击 "Deploy" 开始部署

### 选项 2: Supabase Edge Functions

1. **安装 Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **初始化 Supabase 项目**
   ```bash
   supabase init
   ```

3. **部署**
   ```bash
   supabase functions deploy
   ```

## 数据库设置

### 新版本表结构（推荐）

在 Supabase SQL Editor 中运行 `database-setup.sql` 文件中的内容，或者直接运行以下 SQL：

```sql
-- 创建空间表（支持层级结构）
CREATE TABLE IF NOT EXISTS spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES spaces(id),
  level INTEGER DEFAULT 1, -- 1=房间，2=家具/区域
  icon TEXT DEFAULT '📦', -- 空间图标
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 创建物品表（关联到空间）
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  category TEXT,
  expire_date DATE,
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_spaces_user_id ON spaces(user_id);
CREATE INDEX IF NOT EXISTS idx_spaces_parent_id ON spaces(parent_id);
CREATE INDEX IF NOT EXISTS idx_spaces_level ON spaces(level);
CREATE INDEX IF NOT EXISTS idx_spaces_icon ON spaces(icon);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_space_id ON items(space_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_expire_date ON items(expire_date);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- 启用 RLS（行级安全）
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 空间表策略
CREATE POLICY "Users can view their own spaces" ON spaces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spaces" ON spaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spaces" ON spaces
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spaces" ON spaces
  FOR DELETE USING (auth.uid() = user_id);

-- 物品表策略
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_spaces_updated_at 
    BEFORE UPDATE ON spaces 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 从旧版本迁移

如果你有现有的旧版本数据，请使用 `migrate-to-spaces.sql` 脚本进行迁移：

1. **备份现有数据**
2. **运行迁移脚本**
3. **测试新功能**
4. **确认无误后清理旧表**

## 新功能特性

### 🏠 空间管理
- **层级结构**：房间 → 家具/区域
- **空间分类**：支持房间和具体位置
- **图标系统**：100个常用图标，支持自定义选择
- **可视化展示**：树形结构显示

### 📦 物品管理
- **位置关联**：每个物品必须关联到具体空间
- **分类管理**：支持多种物品分类
- **搜索功能**：支持按空间和物品名称搜索
- **详细信息**：支持价值、品牌、购入信息、状态、优先级等
- **备注功能**：支持添加详细备注信息

### 🔍 智能搜索
- **全局搜索**：同时搜索空间和物品
- **空间筛选**：按特定空间筛选物品
- **分类筛选**：按物品分类筛选

### 📱 用户界面
- **双Tab布局**：管理空间 + 管理物品
- **响应式设计**：支持移动端和桌面端
- **直观操作**：拖拽、点击等交互

## 第三方服务配置

### 1. Supabase 设置

1. **创建项目**
   - 访问 [supabase.com](https://supabase.com)
   - 创建新项目
   - 等待项目初始化完成

2. **获取配置**
   - 进入项目设置
   - 复制 `Project URL` 和 `anon public` key
   - 填入环境变量

3. **启用服务**
   - Database: 自动启用
   - Auth: 在 Authentication > Settings 中配置
   - Storage: 在 Storage 中创建 bucket

4. **配置 Storage**
   - 进入 Storage 页面
   - 创建名为 `item-photos` 的 bucket
   - 设置 RLS 策略：
     ```sql
     -- 允许用户查看自己的图片
     CREATE POLICY "Users can view their own photos" ON storage.objects
       FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
     
     -- 允许用户上传自己的图片
     CREATE POLICY "Users can upload their own photos" ON storage.objects
       FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
     
     -- 允许用户删除自己的图片
     CREATE POLICY "Users can delete their own photos" ON storage.objects
       FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
     ```

### 2. Roboflow 设置

1. **注册账号**
   - 访问 [roboflow.com](https://roboflow.com)
   - 注册免费账号

2. **选择预训练模型**
   - 访问 Roboflow Universe
   - 搜索 "object detection" 或 "household items"
   - 选择合适的预训练模型

3. **获取 API 配置**
   - 在模型页面点击 "Deploy" → "REST API"
   - 复制 API Key 和 Model URL
   - 填入环境变量

## 故障排除

### 常见问题

1. **环境变量未生效**
   - 确保变量名正确
   - 重启开发服务器
   - 检查 `.env.local` 文件格式

2. **数据库连接失败**
   - 检查 Supabase URL 和 Key
   - 确认网络连接
   - 验证数据库表是否创建

3. **图像识别失败**
   - 检查 Roboflow API Key
   - 确认图片格式支持
   - 查看浏览器控制台错误

4. **构建失败**
   - 检查 TypeScript 错误
   - 确认所有依赖已安装
   - 查看构建日志

### 调试技巧

1. **本地调试**
   ```bash
   # 查看详细错误
   npm run dev -- --verbose
   
   # 检查类型错误
   npx tsc --noEmit
   ```

2. **生产调试**
   - 查看 Vercel 部署日志
   - 检查浏览器控制台
   - 验证环境变量设置

## 性能优化

1. **图片优化**
   - 使用 Next.js Image 组件
   - 压缩上传图片
   - 设置合适的图片尺寸

2. **数据库优化**
   - 添加适当的索引
   - 使用分页查询
   - 缓存常用数据

3. **API 优化**
   - 实现请求缓存
   - 添加错误重试
   - 优化响应时间

---

🎉 **部署完成！** 你的 HomeInventory AI 应用现在支持完整的空间和物品管理系统。 