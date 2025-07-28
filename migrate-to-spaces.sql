-- 数据库迁移脚本：从旧表结构迁移到新表结构
-- 注意：请在执行前备份数据库

-- 1. 创建新的空间表
CREATE TABLE IF NOT EXISTS spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES spaces(id),
  level INTEGER DEFAULT 1, -- 1=房间，2=家具/区域
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. 创建新的物品表（保留旧表作为备份）
CREATE TABLE IF NOT EXISTS items_new (
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

-- 添加新字段到现有的items表
ALTER TABLE items ADD COLUMN IF NOT EXISTS value DECIMAL(10,2);
ALTER TABLE items ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS purchase_source TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- 为新字段创建索引
CREATE INDEX IF NOT EXISTS idx_items_brand ON items(brand);
CREATE INDEX IF NOT EXISTS idx_items_condition ON items(condition);
CREATE INDEX IF NOT EXISTS idx_items_priority ON items(priority);
CREATE INDEX IF NOT EXISTS idx_items_purchase_date ON items(purchase_date);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_spaces_user_id ON spaces(user_id);
CREATE INDEX IF NOT EXISTS idx_spaces_parent_id ON spaces(parent_id);
CREATE INDEX IF NOT EXISTS idx_spaces_level ON spaces(level);
CREATE INDEX IF NOT EXISTS idx_items_new_user_id ON items_new(user_id);
CREATE INDEX IF NOT EXISTS idx_items_new_space_id ON items_new(space_id);
CREATE INDEX IF NOT EXISTS idx_items_new_created_at ON items_new(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_new_expire_date ON items_new(expire_date);
CREATE INDEX IF NOT EXISTS idx_items_new_category ON items_new(category);

-- 4. 启用 RLS
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_new ENABLE ROW LEVEL SECURITY;

-- 5. 创建策略
CREATE POLICY "Users can view their own spaces" ON spaces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spaces" ON spaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spaces" ON spaces
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spaces" ON spaces
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own items" ON items_new
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON items_new
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON items_new
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON items_new
  FOR DELETE USING (auth.uid() = user_id);

-- 6. 创建触发器
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

CREATE TRIGGER update_items_new_updated_at 
    BEFORE UPDATE ON items_new 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 数据迁移（可选）
-- 如果你有现有数据需要迁移，可以执行以下步骤：

-- 步骤1：为每个用户创建默认空间
-- INSERT INTO spaces (name, description, level, user_id)
-- SELECT DISTINCT 
--   '默认空间' as name,
--   '自动创建的默认空间' as description,
--   1 as level,
--   user_id
-- FROM items
-- WHERE user_id NOT IN (SELECT user_id FROM spaces);

-- 步骤2：将现有物品迁移到新表
-- INSERT INTO items_new (id, name, quantity, category, expire_date, space_id, photo_url, created_at, updated_at, user_id)
-- SELECT 
--   i.id,
--   i.name,
--   i.quantity,
--   i.category,
--   i.expire_date,
--   s.id as space_id,
--   i.photo_url,
--   i.created_at,
--   i.updated_at,
--   i.user_id
-- FROM items i
-- LEFT JOIN spaces s ON s.user_id = i.user_id AND s.level = 1
-- WHERE s.id IS NOT NULL;

-- 8. 重命名表（谨慎操作）
-- 只有在确认新表工作正常后，才执行以下操作：

-- 重命名旧表为备份
-- ALTER TABLE items RENAME TO items_backup;

-- 重命名新表为正式表
-- ALTER TABLE items_new RENAME TO items;

-- 9. 清理（可选）
-- 如果确认一切正常，可以删除备份表
-- DROP TABLE items_backup;

-- 注意：执行迁移前请务必备份数据库！ 