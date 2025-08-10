# 系统提示词与数据库结构统一说明

## 概述

为了确保客户手动上传和拍照识别使用相同的参数结构，我们已经将系统的AI识别提示词与数据库`items`表结构完全统一。

## 数据库items表结构

```sql
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- 物品名称（必需）
  quantity INTEGER DEFAULT 1,            -- 数量（必需，默认1）
  category TEXT,                         -- 分类
  expire_date DATE,                      -- 过期日期
  space_id UUID REFERENCES spaces(id),   -- 存储位置ID（必需）
  photo_url TEXT,                        -- 照片URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- 新增字段
  value DECIMAL(10,2),                   -- 价值（元）
  brand TEXT,                            -- 品牌
  purchase_date DATE,                     -- 购入日期
  purchase_source TEXT,                   -- 购入来源
  notes TEXT,                            -- 备注
  condition TEXT,                         -- 物品状态
  priority TEXT DEFAULT 'normal'          -- 优先级
);
```

## AI识别提示词统一

### 更新前的问题
- AI识别返回的字段与数据库字段不完全匹配
- 手动添加表单包含了所有数据库字段，但AI识别没有充分利用这些字段
- 字段命名不一致（如`description` vs `notes`）

### 更新后的统一结构

#### 必需字段（与数据库items表一致）
- `name`: 物品名称（必需）
- `confidence`: 识别置信度 (0-1)
- `type`: 类型 ('label' 或 'text')

#### 可选字段（与数据库items表完全一致）
- `quantity`: 数量（正整数，1-999，如果无法确定则设为1）
- `category`: 分类（食品/日用品/电子产品/服装/书籍/其他）
- `expire_date`: 过期日期（YYYY-MM-DD格式，如果无法确定则设为undefined）
- `value`: 价值（元，数字格式）
- `brand`: 品牌名称
- `purchase_date`: 购入日期（YYYY-MM-DD格式，如果无法确定则设为undefined）
- `purchase_source`: 购入来源（如：淘宝、实体店、朋友赠送等）
- `notes`: 备注信息
- `condition`: 物品状态（new/like-new/good/fair/poor）
- `priority`: 优先级（low/normal/high/urgent，默认为normal）

#### 额外识别信息（用于智能建议，不保存到数据库）
- `suggestedLocation`: 建议存储位置
- `needsExpiryDate`: 是否需要过期日期 (true/false)
- `expiryDateHint`: 过期日期提示
- `unit`: 单位（个/瓶/包/盒/片/支等）
- `size`: 尺寸/规格
- `color`: 颜色

## 已更新的文件

### 1. `lib/openai-vision.ts`
- 更新了AI识别提示词，使其返回与数据库完全一致的字段
- 修改了`RecognizedItem`接口定义
- 更新了示例输出格式

### 2. `app/api/recognize/route.ts`
- 更新了模拟数据，使用新的字段结构
- 确保模拟数据与真实AI识别结果格式一致

### 3. `app/upload/page.tsx`
- 更新了`RecognizedItem`接口定义
- 修改了保存逻辑，使用完整的数据库字段
- 更新了模拟数据格式

## 智能识别规则

AI识别系统现在遵循以下规则：

1. **食品类物品**：通常需要过期日期，condition通常为"new"
2. **数量提取**：仔细查看包装上的数字和数量信息
3. **品牌识别**：从包装文字中提取品牌信息
4. **价值估算**：根据物品类型和品牌进行合理估算
5. **状态判断**：根据物品外观判断condition状态
6. **分类建议**：根据物品特征自动分类

## 使用方式

### 手动添加物品
用户可以通过`/add`页面手动输入所有字段，包括：
- 基本信息：名称、数量、分类、过期日期
- 详细信息：价值、品牌、购入日期、来源、备注、状态、优先级
- 存储位置：选择具体的空间位置

### 拍照识别
用户可以通过拍照或上传图片，AI自动识别并填充：
- 所有可识别的数据库字段
- 智能建议（如建议存储位置、过期提醒等）
- 用户确认后保存到数据库

## 优势

1. **数据一致性**：手动添加和AI识别使用完全相同的字段结构
2. **用户体验**：无论使用哪种方式，都能获得完整的物品信息
3. **数据完整性**：AI识别充分利用所有可用字段，提供更丰富的物品信息
4. **维护性**：统一的字段结构便于后续功能扩展和维护

## 注意事项

1. **存储位置选择**：AI识别后，用户仍需要选择具体的存储位置（space_id）
2. **字段验证**：所有字段都经过类型验证和长度限制
3. **默认值处理**：无法识别的字段设置为undefined，不会保存到数据库
4. **向后兼容**：现有的手动添加功能完全不受影响
