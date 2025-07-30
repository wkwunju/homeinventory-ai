# 🚀 AWS Rekognition 配置指南

本指南将帮助你设置 AWS Rekognition 服务，用于 HomeInventory AI 应用的图像识别功能。

## 📋 前置要求

1. AWS 账号（如果没有，请先注册：[https://aws.amazon.com](https://aws.amazon.com)）
2. 基本的 AWS 服务了解

## 🔧 步骤 1：创建 IAM 用户

### 1.1 登录 AWS 控制台
访问 [AWS IAM 控制台](https://console.aws.amazon.com/iam/)

### 1.2 创建新用户
1. 点击左侧菜单的 "Users"
2. 点击 "Create user"
3. 输入用户名：`homeinventory-rekognition`
4. 勾选 "Access key - Programmatic access"
5. 点击 "Next: Permissions"

### 1.3 分配权限
1. 选择 "Attach existing policies directly"
2. 搜索并选择 `AmazonRekognitionFullAccess`
3. 点击 "Next: Tags"（可选添加标签）
4. 点击 "Next: Review"
5. 点击 "Create user"

### 1.4 保存凭据
**重要：** 创建用户后，立即下载 CSV 文件，包含：
- Access Key ID
- Secret Access Key

⚠️ **安全提醒：**
- 这些凭据只能显示一次
- 请妥善保存，不要分享给他人
- 如果泄露，请立即删除并重新创建

## 🔧 步骤 2：配置环境变量

### 2.1 本地开发环境
在项目根目录创建 `.env.local` 文件：

```env
# AWS Rekognition 配置
AWS_ACCESS_KEY_ID=你的Access_Key_ID
AWS_SECRET_ACCESS_KEY=你的Secret_Access_Key
AWS_REGION=us-east-1
```

### 2.2 生产环境（Vercel）
在 Vercel 项目设置中添加环境变量：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 "Settings" → "Environment Variables"
4. 添加以下变量：
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`（设置为 `us-east-1`）

## 🔧 步骤 3：测试配置

### 3.1 启动开发服务器
```bash
npm run dev
```

### 3.2 测试图像识别
1. 访问 `http://localhost:3000/upload`
2. 上传一张包含物品的图片
3. 检查控制台是否有错误信息

## 💰 成本说明

AWS Rekognition 采用按使用量付费模式：

| 服务 | 价格（每 1000 次请求） |
|------|----------------------|
| 物体识别 | $1.00 |
| 文字识别 | $1.50 |

**预估成本：**
- 个人使用：每月约 $1-5
- 家庭使用：每月约 $5-15
- 小型团队：每月约 $15-50

## 🔒 安全最佳实践

### 1. IAM 权限最小化
如果只需要 Rekognition 服务，可以创建自定义策略：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "rekognition:DetectLabels",
                "rekognition:DetectText"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. 环境变量安全
- 不要在代码中硬编码 AWS 凭据
- 使用环境变量或 AWS Secrets Manager
- 定期轮换 Access Key

### 3. 监控使用量
- 设置 AWS CloudWatch 告警
- 监控 API 调用次数和成本
- 设置月度预算限制

## 🐛 常见问题

### Q: 收到 "Access Denied" 错误
A: 检查 IAM 用户权限是否正确分配了 `AmazonRekognitionFullAccess`

### Q: 识别结果不准确
A: 
- 确保图片清晰，光线充足
- 尝试不同角度的照片
- 检查图片格式（支持 JPEG, PNG, GIF, BMP）

### Q: API 调用失败
A:
- 检查网络连接
- 验证 AWS 区域设置
- 确认 Access Key 和 Secret Key 正确

### Q: 成本过高
A:
- 设置 CloudWatch 告警监控使用量
- 考虑图片预处理（压缩、裁剪）
- 实现客户端缓存减少重复请求

## 📞 获取帮助

- **AWS 文档：** [AWS Rekognition 文档](https://docs.aws.amazon.com/rekognition/)
- **AWS 支持：** 如果遇到技术问题，可以联系 AWS 支持
- **项目 Issues：** 在 GitHub 仓库提交 Issue

## 🎯 下一步

配置完成后，你可以：

1. **测试图像识别功能**
2. **自定义识别逻辑**（编辑 `lib/aws-rekognition.ts`）
3. **优化识别精度**（调整置信度阈值）
4. **添加更多识别功能**（如人脸识别、自定义标签）

---

**提示：** 如果遇到任何问题，请检查 AWS 控制台的 CloudTrail 日志，它会记录所有 API 调用和错误信息。 