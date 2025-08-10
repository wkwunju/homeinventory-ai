import OpenAI from 'openai'

export interface RecognizedItem {
  name: string
  confidence: number // 0..1
  bbox?: [number, number, number, number]
  type: 'label' | 'text'
  // 与数据库items表完全一致的字段
  quantity?: number
  category?: string
  expire_date?: string
  value?: number
  brand?: string
  purchase_date?: string
  purchase_source?: string
  notes?: string
  condition?: string
  priority?: string
  // 额外识别信息（用于智能建议）
  suggestedLocation?: string
  needsExpiryDate?: boolean
  expiryDateHint?: string
  unit?: string
  size?: string
  color?: string
}

function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 未配置')
  }
  return new OpenAI({ apiKey })
}

export async function recognizeImageWithOpenAI(
  imageBuffer: Buffer,
  mimeType: string = 'image/jpeg',
  options?: { model?: string }
): Promise<RecognizedItem[]> {
  const client = createOpenAIClient()
  const model = options?.model || process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini'

  const base64 = imageBuffer.toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64}`

  const prompt = `你是一个专业的家庭物品管理助手。请仔细分析图片中的物品，提取尽可能多的有用信息，返回的字段必须与数据库结构完全一致。

分析要求：
1. 识别所有可见的物品
2. 提取每个物品的详细信息
3. 推断物品的属性和特征
4. 提供智能建议

**特别注意数量提取**：
- 仔细查看包装上的数字和数量信息
- 从文字标签中提取数量（如"6个装"、"250ml"、"12片"等）
- 观察图片中物品的实际数量
- 如果看到多个相同物品，计算总数
- 数量应该是正整数，范围1-999

请返回 JSON 格式，包含 items 数组，每个 item 包含以下字段：

**必需字段（与数据库items表一致）**：
- name: 物品名称（必需）
- confidence: 识别置信度 (0-1)
- type: 类型 ('label' 或 'text')

**可选字段（与数据库items表完全一致）**：
- quantity: 数量（正整数，1-999，如果无法确定则设为1）
- category: 分类（食品/日用品/电子产品/服装/书籍/其他）
- expire_date: 过期日期（YYYY-MM-DD格式，如果无法确定则设为null）
- value: 价值（元，数字格式）
- brand: 品牌名称
- purchase_date: 购入日期（YYYY-MM-DD格式，如果无法确定则设为null）
- purchase_source: 购入来源（如：淘宝、实体店、朋友赠送等）
- notes: 备注信息
- condition: 物品状态（new/like-new/good/fair/poor）
- priority: 优先级（low/normal/high/urgent，默认为normal）

**额外识别信息（用于智能建议，不保存到数据库）**：
- suggestedLocation: 建议存储位置
- needsExpiryDate: 是否需要过期日期 (true/false)
- expiryDateHint: 过期日期提示（如"建议设置7天"）
- unit: 单位（个/瓶/包/盒/片/支等）
- size: 尺寸/规格
- color: 颜色

**智能识别规则**：
- 食品类物品通常需要过期日期，condition通常为"new"
- 从包装文字中提取品牌、数量、规格等信息
- 根据物品类型推荐存储位置
- 识别物品状态和特殊注意事项
- 价值字段根据物品类型和品牌进行合理估算

示例输出：
{
  "items": [
    {
      "name": "蒙牛纯牛奶",
      "confidence": 0.95,
      "type": "label",
      "quantity": 6,
      "category": "食品",
      "expire_date": null,
      "value": 15.00,
      "brand": "蒙牛",
      "purchase_date": null,
      "purchase_source": null,
      "notes": "250ml 纯牛奶，纸盒包装，6盒装，需要冷藏保存",
      "condition": "new",
      "priority": "normal",
      "suggestedLocation": "冰箱冷藏室",
      "needsExpiryDate": true,
      "expiryDateHint": "牛奶通常保质期7-14天",
      "unit": "盒",
      "size": "250ml",
      "color": "白色"
    },
    {
      "name": "苹果",
      "confidence": 0.92,
      "type": "label",
      "quantity": 8,
      "category": "食品",
      "expire_date": null,
      "value": 24.00,
      "brand": "农夫山泉",
      "purchase_date": null,
      "purchase_source": null,
      "notes": "红富士苹果，8个装，中号，红色",
      "condition": "new",
      "priority": "normal",
      "suggestedLocation": "冰箱冷藏室",
      "needsExpiryDate": true,
      "expiryDateHint": "苹果通常可保存7-14天",
      "unit": "个",
      "size": "中号",
      "color": "红色"
    }
  ]
}

请确保输出是有效的 JSON 格式，不要包含任何解释文字。所有字段值必须与数据库items表结构完全一致。`

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.1, // 降低随机性，提高一致性
      messages: [
        {
          role: 'system',
          content: '你是一个专业的物品识别助手。只输出 JSON 格式的结果，不要包含任何解释、注释或其他文字。确保 JSON 格式完全正确，返回的字段必须与数据库items表结构完全一致。'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 2000 // 增加 token 限制以容纳更详细的输出
    })

    const content = response.choices?.[0]?.message?.content || ''

    try {
      const parsed = JSON.parse(content)
      const items = Array.isArray(parsed?.items) ? parsed.items : []
      return items
        .map((it: any) => ({
          name: String(it.name ?? '').slice(0, 100),
          confidence: typeof it.confidence === 'number' ? Math.max(0, Math.min(1, it.confidence)) : 0.5,
          type: it.type === 'text' ? 'text' : 'label',
          // 与数据库items表完全一致的字段
          quantity: typeof it.quantity === 'number' ? Math.max(1, Math.min(999, it.quantity)) : 1,
          category: it.category ? String(it.category).slice(0, 50) : undefined,
          expire_date: it.expire_date ? String(it.expire_date).slice(0, 10) : undefined,
          value: typeof it.value === 'number' ? Math.max(0, it.value) : undefined,
          brand: it.brand ? String(it.brand).slice(0, 50) : undefined,
          purchase_date: it.purchase_date ? String(it.purchase_date).slice(0, 10) : undefined,
          purchase_source: it.purchase_source ? String(it.purchase_source).slice(0, 100) : undefined,
          notes: it.notes ? String(it.notes).slice(0, 200) : undefined,
          condition: it.condition ? String(it.condition).slice(0, 30) : undefined,
          priority: it.priority ? String(it.priority).slice(0, 20) : undefined,
          // 额外识别信息
          suggestedLocation: it.suggestedLocation ? String(it.suggestedLocation).slice(0, 100) : undefined,
          needsExpiryDate: typeof it.needsExpiryDate === 'boolean' ? it.needsExpiryDate : undefined,
          expiryDateHint: it.expiryDateHint ? String(it.expiryDateHint).slice(0, 100) : undefined,
          unit: it.unit ? String(it.unit).slice(0, 20) : undefined,
          size: it.size ? String(it.size).slice(0, 50) : undefined,
          color: it.color ? String(it.color).slice(0, 30) : undefined,
        }))
        .filter((it: RecognizedItem) => it.name)
        .slice(0, 20)
    } catch (e) {
      // 如果解析失败，返回空数组（或可返回一个兜底项）
      console.error('解析 OpenAI 结果失败:', e, content)
      return []
    }
  } catch (error) {
    console.error('OpenAI API 调用失败:', error)
    throw error
  }
}


