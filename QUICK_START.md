# 🚀 快速启动指南

## 5分钟快速搭建

### 1. 启动应用
```bash
npm run dev
```
访问 http://localhost:3000

### 2. 配置 Supabase（必需）

#### 步骤 1：创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 等待项目初始化完成

#### 步骤 2：获取配置信息
1. 进入项目设置 → API
2. 复制以下信息：
   - **Project URL**：`https://xxxxx.supabase.co`
   - **anon public**：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 步骤 3：配置环境变量
编辑 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 步骤 4：创建数据库表
1. 进入 Supabase SQL Editor
2. 运行以下 SQL：

```sql
-- 创建物品表
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  category TEXT,
  expire_date DATE,
  location TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);

-- 启用 RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- 创建触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. 测试功能

#### 注册和登录
1. 访问 http://localhost:3000
2. 点击"注册"创建账号
3. 登录进入应用

#### 添加物品
1. 点击"添加物品"手动添加
2. 或使用"拍照识别"功能

#### 拍照识别（快速测试模式）
1. 点击"拍照识别物品"
2. 选择"快速测试模式"
3. 上传任意图片
4. 系统会返回模拟的识别结果
5. 点击"保存"添加到库存

## 🎯 功能特性

### ✅ 已实现功能
- [x] 用户注册/登录
- [x] 多用户数据隔离
- [x] 手动添加物品
- [x] 物品列表管理
- [x] 快速测试模式（模拟识别）
- [x] 响应式设计

### 🔄 可选功能
- [ ] 真实图像识别（需要配置 Roboflow）
- [ ] 物品编辑/删除
- [ ] 分类管理
- [ ] 过期提醒

## 🛠️ 故障排除

### 常见问题

1. **登录失败**
   - 检查 Supabase 项目设置
   - 确认环境变量正确配置

2. **无法添加物品**
   - 确保已登录
   - 检查数据库表是否创建

3. **识别功能不工作**
   - 快速测试模式无需额外配置
   - 真实识别需要配置 Roboflow

## 📱 使用流程

1. **注册账号** → 创建个人账户
2. **登录系统** → 进入个人库存
3. **添加物品** → 手动输入或拍照识别
4. **管理库存** → 查看、编辑物品列表

## 🎉 完成！

现在你有了一个完整的家庭库存管理系统，支持：
- 多用户隔离
- 手动添加物品
- 模拟图像识别
- 响应式界面

**下一步**：如果需要真实的图像识别功能，可以配置 Roboflow 预训练模型。

---

💡 **提示**：快速测试模式让你可以立即体验完整的识别流程，无需任何额外配置！ 