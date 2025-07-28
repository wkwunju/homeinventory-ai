-- 添加 preset_id 字段到 spaces 表
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS preset_id TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_spaces_preset_id ON spaces(preset_id);

-- 更新现有数据的图标（可选，用于修复现有数据）
-- 这里可以根据需要添加更新语句 