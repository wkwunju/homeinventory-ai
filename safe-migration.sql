-- 安全迁移脚本 - 只添加缺失的字段
-- 这个脚本会检查字段是否存在，避免重复创建

-- 1. 检查并添加新字段到 items 表
DO $$ 
BEGIN
    -- 添加 value 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'value') THEN
        ALTER TABLE items ADD COLUMN value DECIMAL(10,2);
    END IF;
    
    -- 添加 brand 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'brand') THEN
        ALTER TABLE items ADD COLUMN brand TEXT;
    END IF;
    
    -- 添加 purchase_date 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'purchase_date') THEN
        ALTER TABLE items ADD COLUMN purchase_date DATE;
    END IF;
    
    -- 添加 purchase_source 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'purchase_source') THEN
        ALTER TABLE items ADD COLUMN purchase_source TEXT;
    END IF;
    
    -- 添加 notes 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'notes') THEN
        ALTER TABLE items ADD COLUMN notes TEXT;
    END IF;
    
    -- 添加 condition 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'condition') THEN
        ALTER TABLE items ADD COLUMN condition TEXT;
    END IF;
    
    -- 添加 priority 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'priority') THEN
        ALTER TABLE items ADD COLUMN priority TEXT DEFAULT 'normal';
    END IF;
    
    -- 添加 photo_url 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'photo_url') THEN
        ALTER TABLE items ADD COLUMN photo_url TEXT;
    END IF;
END $$;

-- 2. 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_items_brand ON items(brand);
CREATE INDEX IF NOT EXISTS idx_items_condition ON items(condition);
CREATE INDEX IF NOT EXISTS idx_items_priority ON items(priority);
CREATE INDEX IF NOT EXISTS idx_items_purchase_date ON items(purchase_date);

-- 3. 检查并创建 spaces 表（如果不存在）
CREATE TABLE IF NOT EXISTS spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES spaces(id),
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. 为 spaces 表创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_spaces_user_id ON spaces(user_id);
CREATE INDEX IF NOT EXISTS idx_spaces_parent_id ON spaces(parent_id);
CREATE INDEX IF NOT EXISTS idx_spaces_level ON spaces(level);

-- 5. 启用 RLS（如果未启用）
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 6. 创建或替换 RLS 策略（使用 DROP IF EXISTS 和 CREATE）
-- Spaces 表策略
DROP POLICY IF EXISTS "Users can view their own spaces" ON spaces;
CREATE POLICY "Users can view their own spaces" ON spaces
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own spaces" ON spaces;
CREATE POLICY "Users can insert their own spaces" ON spaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own spaces" ON spaces;
CREATE POLICY "Users can update their own spaces" ON spaces
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own spaces" ON spaces;
CREATE POLICY "Users can delete their own spaces" ON spaces
  FOR DELETE USING (auth.uid() = user_id);

-- Items 表策略
DROP POLICY IF EXISTS "Users can view their own items" ON items;
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own items" ON items;
CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own items" ON items;
CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own items" ON items;
CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- 7. 创建或替换触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 创建或替换触发器
DROP TRIGGER IF EXISTS update_spaces_updated_at ON spaces;
CREATE TRIGGER update_spaces_updated_at 
    BEFORE UPDATE ON spaces 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 显示迁移结果
SELECT 'Migration completed successfully!' as status; 