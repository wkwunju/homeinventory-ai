# Supabase 认证设置指南

## 1. 项目设置

### 1.1 进入 Supabase 项目
- 访问 [supabase.com](https://supabase.com)
- 登录并选择你的项目

### 1.2 认证设置
1. 进入 **Authentication** > **Settings**
2. 确保以下设置：
   - **Enable email confirmations**: 暂时关闭（用于测试）
   - **Enable email change**: 开启
   - **Enable phone confirmations**: 关闭

### 1.3 URL 配置
在 **Authentication** > **URL Configuration** 中设置：

**Site URL**: `http://localhost:3000`
**Redirect URLs**: 
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/login`
- `http://localhost:3000/auth/register`

### 1.4 Cookie 设置
在 **Authentication** > **Settings** > **Advanced** 中：

**Cookie Settings**:
- **Secure**: 关闭（开发环境）
- **SameSite**: `lax`
- **Domain**: 留空（使用默认）

## 2. 环境变量检查

确保 `.env.local` 文件包含：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. 测试步骤

1. 清除浏览器缓存和 Cookie
2. 重启开发服务器
3. 访问 http://localhost:3000
4. 注册新用户或登录
5. 检查浏览器 Cookie（F12 > Application > Cookies）
6. 访问 http://localhost:3000/debug 查看认证状态

## 4. 常见问题

### 问题：Cookie 不设置
**解决方案**：
- 检查 Supabase URL 配置
- 确保 Site URL 正确
- 清除浏览器缓存

### 问题：登录后立即失效
**解决方案**：
- 检查环境变量是否正确
- 确保 Supabase 项目设置正确
- 检查网络连接

### 问题：服务端无法读取 Cookie
**解决方案**：
- 确保中间件正确配置
- 检查 Cookie 域名设置
- 验证服务端客户端创建方式 