# 🚀 快速设置指南

## 问题解决

如果你遇到以下问题：

### 1. 首页一直显示"加载中"
**原因**: 没有配置数据库连接

**解决方案**:
1. 创建 `.env.local` 文件：
```bash
cp env.example .env.local
```

2. 编辑 `.env.local` 文件，添加你的 Supabase 配置：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
ROBOFLOW_API_KEY=your_roboflow_api_key_here
ROBOFLOW_MODEL_URL=https://detect.roboflow.com/your-model/1
```

### 2. 手动添加无法确认
**原因**: 数据库未配置或连接失败

**解决方案**:
1. 确保已创建 `.env.local` 文件
2. 重启开发服务器：
```bash
npm run dev
```

### 3. 查看配置状态
访问 `/config` 页面查看当前配置状态：
- 绿色勾号 = 已配置
- 红色叉号 = 未配置

## 快速测试（无需数据库）

如果你想先测试界面功能，可以：

1. **访问首页**: 会显示示例数据
2. **测试手动添加**: 会提示数据库未配置
3. **查看配置页面**: 了解需要配置什么

## 完整配置步骤

### 1. Supabase 设置
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 获取 Project URL 和 anon key
4. 在 SQL Editor 中运行：
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

### 2. Roboflow 设置
1. 访问 [roboflow.com](https://roboflow.com)
2. 注册账号并创建项目
3. 获取 API Key 和 Model URL

### 3. 更新环境变量
将获取的配置填入 `.env.local` 文件

### 4. 重启服务器
```bash
npm run dev
```

## 故障排除

### 常见错误
1. **"数据库未配置"**: 检查 `.env.local` 文件
2. **"API 请求失败"**: 检查网络连接和 Supabase 配置
3. **"图像识别失败"**: 检查 Roboflow 配置

### 调试技巧
1. 打开浏览器开发者工具查看控制台错误
2. 访问 `/config` 页面检查配置状态
3. 检查 `.env.local` 文件格式是否正确

---

🎉 **完成配置后，你的 HomeInventory AI 就可以正常使用了！** 