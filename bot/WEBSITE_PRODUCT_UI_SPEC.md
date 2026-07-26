# R7 Wellness 中东 AI 报告网站完整产品与 UI 方案

版本：MVP v1  
目标市场：沙特、阿联酋、埃及  
目标用户：20-35 岁城市年轻群体，女性为主，关注情绪内耗、亲密关系、职业迷茫、自我成长，重视隐私与匿名性  
产品形态：纯 AI 自动生成电子报告，无真人咨询、无社群、无直播  
交付形态：网页版报告 + PDF 导出  
商业目标：免费预览拉新，单份报告付费转化，会员订阅提升复购

> 执行原则：以沙特市场最严格宗教与内容底线作为基础标准，覆盖阿联酋与埃及。所有面向用户的文案必须从“确定性结论”改为“心理特质分析、符号学参考、成长决策建议”。  
> 依据：Quran 31:34 对未知之事的界定、Sahih Muslim 2230 对占卜者的警示、Sunan Abi Dawud 3905 对星象学习的警示；UAE 官方数据保护门户、Egypt MCIT AI 门户、mada/Fawry 等支付基础设施资料。参考来源见文末。

---

## 1. 产品总定位

### 1.1 对外定位

中文内部定义：
R7 Wellness 是一款面向中东年轻用户的匿名 AI 自我认知报告工具。用户填写少量信息后，即时生成性格、情绪、关系、职业与成长方向相关的电子报告。报告用于心理特质分析、潜意识投射参考与成长决策辅助，不提供宗教指引、医疗诊断、心理治疗或确定性预测。

English:
Private AI self-insight reports for personality, relationships, emotional load, work strengths, and growth decisions.

Arabic:
تقارير ذكية خاصة لفهم الذات والشخصية والعلاقات والضغط ونقاط القوة المهنية.

### 1.2 核心承诺

- 匿名：不强制真实姓名，不采集照片、证件、人脸。
- 即时：填写基础信息后立即生成报告。
- 合规：不做确定性预测，不做宗教判断，不替代医疗或心理治疗。
- 低门槛：免费生成基础版，完整报告付费解锁。
- 移动优先：适配 Instagram、TikTok、WhatsApp、Telegram 引流来的手机用户。

### 1.3 严禁定位

不得把产品包装成：

- 算命服务
- 占卜服务
- 改运服务
- 宗教咨询服务
- 心理治疗服务
- 婚恋结果判定服务
- 财富或成功承诺工具

---

## 2. 最终视觉风格规范

### 2.1 采用方案

采用混合后的“中东轻奢疗愈风”：以方案 B 的心理专业感为底，加入方案 A 的轻奢氛围。

原因：

- 沙特市场对神秘化视觉更敏感，不能过度使用星象、牌阵、宗教联想。
- 目标用户仍接受轻灵性氛围，需要高级、柔和、私密感。
- 深色背景 + 砂金 CTA 可提升付费感；灰绿/松石色可保留心理疗愈感。

### 2.2 色彩系统

主色：

| 用途 | 色值 | 说明 |
|---|---|---|
| 深夜青黑背景 | `#0C1212` | 全站背景，私密、安静 |
| 莫兰迪灰绿面板 | `#182322` | 卡片、弹窗、报告页 |
| 松石绿主按钮 | `#5EC8B2` | 生成报告、确认、主要 CTA |
| 砂金强调色 | `#D7B56F` | 价格、会员、重点钩子 |
| 暖沙米白文本 | `#F7F2E8` | 主文字 |
| 低饱和灰蓝辅助 | `#8797A5` | 次级说明 |
| 柔和珊瑚提示 | `#D88F7D` | 错误、警示、危机提示 |

禁用色彩组合：

- 高饱和红黑搭配用于关系或情绪页，容易制造恐吓感。
- 大面积纯金 + 宗教纹样，容易被误解为宗教装饰。
- 紫色星空 + 星座符号组合，命理联想过强。

### 2.3 字体

英文：

- 首选：Inter / system-ui
- 字重：标题 760-820，正文 400-500，按钮 720
- 禁止使用过度神秘、哥特、手写字体

阿拉伯语：

- 首选：Cairo
- 备选：Tajawal, Noto Kufi Arabic, Tahoma
- 正文字号不得低于 15px
- 行高建议 1.65
- 避免装饰性书法字体，尤其不能模拟古兰经经文书写风格

### 2.4 纹理与背景

允许：

- 低透明度阿拉伯几何纹样
- 沙漠微光纹理
- 抽象纸感颗粒
- 柔光渐变
- 非宗教几何线条
- 抽象星空质感，但不得出现星座符号、黄道轮盘、行星解释图

禁止：

- 清真寺剪影
- 经文书法
- 宗教建筑图案
- 十字架、六角星、佛像、道教符
- 塔罗牌面、牌阵、占星盘、护符、魔法阵
- 写实人脸、人物雕像、暴露人物姿态

### 2.5 图标规范

图标风格：

- 线性、圆角、2px stroke
- 使用抽象心理工具类图标：锁、笔记、对话、进度、路径、镜像、呼吸环
- 图标容器 40x40 或 48x48，圆角 8px

禁止图标：

- 星座图标
- 塔罗牌图标
- 眼睛/全视之眼
- 护符/手掌符
- 水晶球
- 宗教符号
- 医疗十字滥用

### 2.6 动效

允许：

- 卡片 hover 上浮 2-4px
- 按钮轻微亮度变化
- 页面淡入 180-240ms
- 生成页进度条缓慢推进
- 抽象几何环缓慢旋转，不能像宗教符号或魔法阵

禁止：

- 剧烈闪烁
- 恐吓式红色警告动画
- 魔法阵发光
- 牌面翻转
- 星座轨道占星动效

---

## 3. 信息架构与导航

### 3.1 顶部导航

英文 LTR：

左侧：R7 Wellness Logo  
中间：Home / Reports / Membership / About  
右侧：Language Toggle / Account

Arabic RTL：

右侧：R7 Wellness Logo  
中间：الرئيسية / جميع التقارير / العضوية / من نحن  
左侧：تبديل اللغة / الحساب

导航交互：

- 移动端折叠为底部或顶部抽屉菜单。
- 语言切换必须一键 EN / AR。
- 切换阿语后，页面方向、卡片顺序、按钮图标方向全部镜像。

### 3.2 路由结构

建议前端路由：

```text
/                         首页
/reports                  全部报告列表
/reports/:reportId/start  信息填写页
/reports/:reportId/loading 生成加载页
/reports/:reportId/preview 免费报告页
/checkout                 支付页
/reports/:reportId/full   完整报告页
/membership               会员页
/account                  个人中心
/privacy                  隐私政策
/terms                    使用条款
```

当前 MVP 可以先用单页 modal 实现，后续上线 SEO 再拆分为路由页。

---

## 4. 全站 6 个核心页面 UI 设计

## 4.1 首页

### 页面目标

3 秒内让用户明白：

1. 这是匿名 AI 自我报告。
2. 能解决情绪、关系、职业、自我探索困惑。
3. 可以免费生成第一份报告。
4. 不涉及宗教指引、医疗诊断或确定性预测。

### 模块 1：首屏 Banner

布局：

- 桌面端：左侧文案 + CTA，右侧或背景为抽象沙漠微光/几何纹理。
- 移动端：文案居上，按钮在屏幕下半区，首屏露出下一模块一点，暗示可继续滑动。

主标题文案：

English:
Understand your patterns in 3 minutes.

Arabic:
افهم أنماطك خلال 3 دقائق.

副标题：

English:
Private AI reports for personality, relationships, emotional load, and work clarity. Anonymous, instant, and designed for culturally respectful self-reflection.

Arabic:
تقارير ذكية خاصة للشخصية والعلاقات والضغط ووضوح العمل. بخصوصية وفورية وبأسلوب يحترم الثقافة.

主 CTA：

English: Generate my free report  
Arabic: إنشاء تقريري المجاني

次 CTA：

English: View all reports  
Arabic: عرض جميع التقارير

信任点：

English:
- Anonymous
- Instant delivery
- Self-reflection only
- Not religious or medical guidance

Arabic:
- بخصوصية
- تسليم فوري
- للتأمل الذاتي فقط
- ليس إرشادًا دينيًا أو طبيًا

合规备注：

- 首屏不得出现 future、destiny、fortune、luck、tarot、zodiac、horoscope、astrology 等词。
- 中文内部说“轻灵性”可以，面向用户不写 spiritual prediction、divine guidance。

### 模块 2：热门报告卡片

展示 4 款优先报告：

1. Hidden Personality Map
2. Relationship Pattern Report
3. Emotional Load Check-in
4. Work Strengths Profile

卡片结构：

```text
[风险标签/免费预览]
痛点型标题
一句利益点
价格或 Free preview
CTA: Start free preview
```

推荐文案：

1. Hidden Personality Map  
   Arabic: خريطة الشخصية الخفية  
   Hook: See the strengths and blind spots you rarely name.  
   Arabic: اكتشف نقاط القوة والنقاط العمياء التي نادرًا ما تسميها.

2. Relationship Pattern Report  
   Arabic: تقرير أنماط العلاقة  
   Hook: Understand why the same emotional pattern keeps repeating.  
   Arabic: افهم لماذا يتكرر نفس النمط العاطفي.

3. Emotional Load Check-in  
   Arabic: فحص العبء العاطفي  
   Hook: Turn overthinking and fatigue into clearer signals.  
   Arabic: حوّل كثرة التفكير والإرهاق إلى إشارات أوضح.

4. Work Strengths Profile  
   Arabic: ملف نقاط القوة المهنية  
   Hook: Find the rhythm that helps your strengths show up.  
   Arabic: اكتشف الإيقاع الذي يساعد نقاط قوتك على الظهور.

交互：

- 点击卡片任意区域进入信息填写页。
- CTA 固定在卡片底部。
- Hover 上浮 2-4px，移动端无 hover，仅按压变亮。

### 模块 3：为什么选择我们

三点信任：

1. Anonymous by design  
   不需要真实姓名或照片。

2. AI report, instant delivery  
   自动生成，完成后立即查看。

3. Clear boundaries  
   仅供自我认知参考，不构成宗教、医疗、法律建议。

### 模块 4：会员转化区

标题：

English:
Unlock every report for the price of a quiet coffee.

Arabic:
افتح جميع التقارير بسعر قهوة هادئة.

权益：

- Unlimited report generation
- PDF export
- New reports first
- No ads

CTA：

English: Explore membership  
Arabic: استكشاف العضوية

合规注意：

- 不使用“改变人生”“找到答案”“唯一机会”。
- 不用倒计时恐吓，不用限时改运类刺激。

### 模块 5：FAQ

必备问题：

1. Is this a medical diagnosis?
2. Is this religious guidance?
3. What data do you collect?
4. Can I get a refund?
5. How is the report generated?

回答模板：

English:
No. This is an AI-generated self-reflection tool. It is not religious guidance, medical diagnosis, therapy, legal advice, or a basis for major life decisions.

Arabic:
لا. هذه أداة تأمل ذاتي منشأة بالذكاء الاصطناعي، وليست إرشادًا دينيًا أو تشخيصًا طبيًا أو علاجًا أو نصيحة قانونية.

---

## 4.2 全部报告列表页

### 页面目标

让用户快速找到“最想点”的报告，并理解哪些免费、哪些付费、哪些适合自己。

### 页面结构

1. 顶部标题区
2. 分类筛选
3. 报告卡片网格
4. 底部会员横幅

### 分类

English:

- Self
- Emotions
- Relationships
- Work
- Reflection

Arabic:

- الذات
- المشاعر
- العلاقات
- العمل
- التأمل

### 6 款报告卡片

#### 1. Hidden Personality Map

中文内部：隐藏人格深度分析  
English subtitle:
See the strengths, blind spots, and action rhythm behind your daily choices.

Arabic subtitle:
اكتشف نقاط القوة والنقاط العمياء وإيقاع العمل خلف اختياراتك اليومية.

CTA:
Start free preview / ابدأ المعاينة المجانية

#### 2. Relationship Pattern Report

中文内部：亲密关系模式拆解  
English subtitle:
Understand your safety needs, communication style, and repeated relationship patterns.

Arabic subtitle:
افهم احتياجات الأمان وطريقة التواصل والأنماط المتكررة في العلاقات.

#### 3. Emotional Load Check-in

中文内部：情绪负荷检查  
English subtitle:
Name what has been draining you and find a calmer next step.

Arabic subtitle:
سمّ ما يستنزفك مؤخرًا واعثر على خطوة أهدأ.

#### 4. Work Strengths Profile

中文内部：职业天赋优势分析  
English subtitle:
Find your work rhythm, focus style, and strengths under pressure.

Arabic subtitle:
اكتشف إيقاع العمل وأسلوب التركيز ونقاط القوة تحت الضغط.

#### 5. Body-Mind Balance Review

中文内部：阶段性身心状态与行动建议  
English subtitle:
Understand fatigue, boundaries, and your recovery rhythm.

Arabic subtitle:
افهم الإرهاق والحدود وإيقاع التعافي لديك.

#### 6. Dream Journal Reflection

中文内部：梦境心理映射解读  
English subtitle:
Reflect on emotional themes and recent stress signals from your dream notes.

Arabic subtitle:
تأمل في الموضوعات العاطفية وإشارات الضغط الحديثة من ملاحظات الأحلام.

### 合规排序

默认排序：

1. Hidden Personality Map
2. Relationship Pattern Report
3. Emotional Load Check-in
4. Work Strengths Profile
5. Body-Mind Balance Review
6. Dream Journal Reflection

说明：

- 星盘/塔罗底层产品不得以上述词汇对外展示。
- “灵性投射类”只能放在 Reflection 分类下，使用心理投射、符号学参考、成长建议表达。

---

## 4.3 信息填写页

### 页面目标

最少字段，最强隐私感，降低填写阻力。

### 页面布局

顶部：

```text
Step 1 of 3
Create your private preview
Anonymous input only. We do not ask for your real name or photo.
```

表单字段：

| 字段 | 必填 | 说明 |
|---|---:|---|
| 昵称 | 是 | 可填化名，不要真实姓名 |
| 出生日期 | 是 | 用于报告结构化输入，不做确定性结论 |
| 出生地点 | 是 | 城市/国家级别，不要精确地址 |
| 性别 | 是 | Female / Male / Prefer not to say |
| 当前关注点 | 是 | 下拉 + 自由输入 |

禁止字段：

- 真实姓名
- 身份证号
- 人脸照片
- 宗教派别
- 详细医疗诊断
- 精确住址

隐私提示：

English:
Use a nickname. Your input is used only to generate this report.

Arabic:
استخدم اسمًا مستعارًا. تُستخدم مدخلاتك فقط لإنشاء هذا التقرير.

底部 CTA：

English: Generate my free preview  
Arabic: إنشاء المعاينة المجانية

### 报告类型差异字段

关系报告额外字段：

- Relationship context
- What do you want to understand better?

梦境报告额外字段：

- Dream note
- Strongest feeling

职业报告额外字段：

- Current work pressure
- Desired clarity

---

## 4.4 免费报告页

### 页面目标

让用户先获得“真的懂我”的第一段价值，然后自然付费解锁完整报告。

### 页面布局

1. 顶部状态条
   - Report generated
   - Private preview
   - 30% unlocked

2. 免费内容区
   - 展示第 1 个核心洞察模块
   - 字数 120-180 词
   - 高共鸣但不下确定性结论

3. 截断钩子区

示例：

English:
This preview shows your first pattern. The full report continues with your core blind spot, practical next steps, and a private action plan.

Arabic:
تعرض هذه المعاينة أول نمط لديك. يتابع التقرير الكامل بنقطتك العمياء الأساسية وخطوات عملية وخطة خاصة.

4. 付费价值锚点

完整版包含：

- Full pattern map
- Core blind spot
- Relationship or work implications
- 3 practical next steps
- PDF export
- Private save link

5. 支付 CTA

English:
Unlock full report - $12.90

Arabic:
فتح التقرير الكامل - 12.90$

6. 信任提示

English:
Anonymous generation · Instant delivery · 7-day refund support

Arabic:
إنشاء بخصوصية · تسليم فوري · دعم استرداد خلال 7 أيام

### 禁止转化话术

不得使用：

- Unlock your future
- See your destiny
- Only chance
- Change your path
- Fix your relationship forever

---

## 4.5 完整报告页

### 页面目标

交付足够价值，制造复购入口，同时保护隐私。

### 页面结构

1. 顶部工具栏
   - Report title
   - Hide content
   - Export PDF
   - Save link

2. 报告摘要
   - 3 条 key insights
   - 不写确定性结论

3. 完整模块

根据报告类型展示 6 大模块：

#### Hidden Personality Map

1. Core Pattern
2. Hidden Strength
3. Blind Spot
4. Relationship Expression
5. Work Expression
6. 7-Day Growth Plan

#### Relationship Pattern Report

1. Safety Need
2. Communication Style
3. Attachment Pattern
4. Friction Trigger
5. Repair Strategy
6. Gentle Conversation Prompts

#### Emotional Load Check-in

1. Current Emotional Load
2. Hidden Pressure Source
3. Body-Mind Signal
4. Boundary Reminder
5. Recovery Rhythm
6. 24-Hour Reset Plan

4. 底部推荐

推荐逻辑：

- 完成性格报告 → 推荐 Work Strengths 或 Relationship Pattern
- 完成情绪报告 → 推荐 Body-Mind Balance
- 完成关系报告 → 推荐 Hidden Personality Map
- 完成职业报告 → 推荐 Emotional Load Check-in

推荐文案：

English:
This report matches your current theme.

Arabic:
يتوافق هذا التقرير مع موضوعك الحالي.

5. 会员入口

English:
Generate unlimited reports with membership.

Arabic:
أنشئ تقارير غير محدودة مع العضوية.

---

## 4.6 会员页

### 页面目标

将单次报告用户升级为订阅用户，提高复购和现金流。

### 页面结构

1. Hero

English:
One membership. Every private report.

Arabic:
عضوية واحدة. كل التقارير الخاصة.

2. 价格卡

Monthly:

- $19.90 / month
- Unlimited reports
- Unlimited PDF export
- New reports first

Yearly:

- $199 / year
- Best value
- Equivalent to 10 single reports

3. 对比表

| 功能 | Free | Single Report | Membership |
|---|---|---|---|
| Free preview | Yes | Yes | Yes |
| Full report | No | One report | Unlimited |
| PDF export | No | One PDF | Unlimited |
| New reports | No | No | First access |
| Ads | Maybe | No | No |

4. 会员 CTA

English:
Start membership

Arabic:
ابدأ العضوية

### 合规注意

- 不使用诱导性过度消费。
- 不做强制连续扣费隐藏。
- 明确退款和取消规则。

---

## 5. 全链路转化钩子落地位置

### 5.1 首屏钩子

位置：首页 Hero H1

English:
Understand your patterns in 3 minutes.

Arabic:
افهم أنماطك خلال 3 دقائق.

安全边界：

- 可以戳“困惑、内耗、疲惫、关系重复、职业迷茫”
- 不可以戳“厄运、灾难、被诅咒、错过命运”

### 5.2 产品卡片钩子

位置：报告列表卡片标题 + 副标题 + Hook line

English:
Why do I keep reacting this way?

Arabic:
لماذا أتفاعل بهذه الطريقة مرارًا؟

### 5.3 加载页钩子

位置：生成报告时

English:
Mapping your patterns, not judging your choices.

Arabic:
نرتب أنماطك دون الحكم على اختياراتك.

进度文案：

- Reading your input
- Organizing patterns
- Preparing your preview

Arabic:

- قراءة مدخلاتك
- تنظيم الأنماط
- إعداد المعاينة

### 5.4 免费转付费钩子

位置：免费报告截断区

English:
Your preview shows the first layer. Unlock the full report to see the blind spot, practical next steps, and private action plan.

Arabic:
تعرض المعاينة الطبقة الأولى. افتح التقرير الكامل لمعرفة النقطة العمياء والخطوات العملية والخطة الخاصة.

### 5.5 会员钩子

位置：完整报告页顶部和底部

English:
One full report costs $12.90. Membership unlocks every report for $19.90/month.

Arabic:
يكلف التقرير الكامل 12.90$. تفتح العضوية كل التقارير مقابل 19.90$ شهريًا.

---

## 6. 定价与支付路径

### 6.1 免费层

包括：

- 每款报告 30% 预览
- 每日情绪状态卡
- 1 题快速性格测试

目的：

- 降低门槛
- 收集偏好标签
- 引导单次报告或会员

### 6.2 单次付费层

| 报告品类 | 建议定价 | 核心转化钩子 |
|---|---:|---|
| 性格天赋类 | $12.90 | 隐藏优势、行为盲区、职业适配方向 |
| 亲密关系类 | $15.90 | 依恋模式、关系需求、沟通避坑 |
| 灵性投射类 | $18.90 | 心理投射、符号学参考、当下行动建议 |
| 综合成长类 | $24.90 | 多维整合分析、定制成长行动清单 |

注意：

- “灵性投射类”对外不使用 tarot、astrology、fortune 等词。
- 沙特版优先使用 Reflection / Symbolic / Pattern 语言。

### 6.3 会员层

月度：$19.90  
年度：$199

权益：

- 全站报告无限生成
- 无限 PDF 导出
- 新报告优先体验
- 无广告

### 6.4 支付方式优先级

MVP 阶段：

1. PayPal Payment Links / PayPal.Me
2. Visa / Mastercard

增长阶段：

1. 沙特：mada、Apple Pay、Visa/Mastercard
2. 阿联酋：Apple Pay、Visa/Mastercard、当地钱包/网关
3. 埃及：Fawry、Meeza、Visa/Mastercard

依据：

- mada 官网说明其为沙特国家支付网络，支持 POS、ATM、电子商务等渠道。
- Fawry 官网定位为埃及电子支付与数字金融方案提供商。
- Apple Pay 在中东支付场景常见，可作为阿联酋/沙特增长阶段补充。

---

## 7. RTL 阿拉伯语适配规范

### 7.1 页面方向

阿语页面必须：

```css
html[lang="ar"] {
  direction: rtl;
}
```

需要镜像：

- 顶部导航顺序
- 卡片内价格与标签位置
- 表单 label 对齐
- 返回箭头方向
- 进度条方向
- 面包屑方向
- FAQ 展开图标位置

不镜像：

- 数字价格 `$12.90`
- 英文品牌名 `R7 Wellness`
- URL
- 邮箱

### 7.2 字号与行高

阿语正文：

- font-size: 16px
- line-height: 1.65

阿语 H1：

- 移动端 36-44px
- 桌面端 56-72px
- 不使用负字距

### 7.3 表单

阿语表单顺序：

```text
الاسم المستعار
تاريخ الميلاد
مكان الميلاد
الجنس
موضوع التركيز
```

Placeholder 不得太长，移动端避免被截断。

### 7.4 图标

需要 RTL 镜像：

- 下一步箭头
- 返回箭头
- 流程方向图

不需要镜像：

- 锁
- 文档
- 下载
- 语言

---

## 8. 宗教合规自查清单

### 8.1 页面类

| 检查项 | 是否必须 |
|---|---:|
| 首页不出现预测、命运、改运类词汇 | 必须 |
| 报告卡片不使用星盘、塔罗、运势作为公开产品名 | 必须 |
| 支付页明确说明数字报告内容 | 必须 |
| FAQ 明确非宗教、非医疗、非法律建议 | 必须 |
| 会员页不使用过度消费诱导 | 必须 |
| 页脚包含隐私政策、使用条款、免责声明 | 必须 |

### 8.2 内容类

| 检查项 | 是否必须 |
|---|---:|
| 所有结论使用 may / tend to / patterns | 必须 |
| 不提供确定性结果 | 必须 |
| 不指导婚外关系或违背伊斯兰伦理 | 必须 |
| 不涉及酒精、赌博、猪肉推荐 | 必须 |
| 不诊断心理疾病 | 必须 |
| 危机内容提示联系当地紧急服务或持牌人士 | 必须 |
| 不评论教法、不挑战宗教权威 | 必须 |

### 8.3 视觉类

| 检查项 | 是否必须 |
|---|---:|
| 无宗教符号 | 必须 |
| 无清真寺剪影和经文书法 | 必须 |
| 无塔罗牌面、占星盘、星座符号 | 必须 |
| 无写实人脸和人物雕像 | 必须 |
| 若有人物插画，必须无清晰面部、着装保守 | 必须 |
| 无酒精、猪肉、赌博视觉 | 必须 |
| 阿语 RTL 检查通过 | 必须 |

---

## 9. 前端开发结构标注

### 9.1 推荐组件拆分

```text
components/
  Header.tsx
  LanguageToggle.tsx
  HeroSection.tsx
  ReportCard.tsx
  TrustSection.tsx
  MembershipBanner.tsx
  FAQ.tsx
  ReportForm.tsx
  LoadingReport.tsx
  FreePreview.tsx
  PaywallPanel.tsx
  FullReport.tsx
  PDFExportButton.tsx
  PrivacyNotice.tsx
```

### 9.2 数据结构

```ts
type ReportProduct = {
  id: string;
  category: "self" | "emotion" | "relationship" | "work" | "reflection";
  title: { en: string; ar: string };
  subtitle: { en: string; ar: string };
  hook: { en: string; ar: string };
  price: number;
  riskLevel: "low" | "medium";
  fields: ReportField[];
  modules: ReportModule[];
};
```

### 9.3 核心 API

```text
POST /api/report
body:
{
  reportType,
  nickname,
  birthDate,
  birthPlace,
  gender,
  focus,
  context
}

POST /api/payment-link
body:
{
  reportType,
  priceId
}

GET /api/report/:id
GET /api/report/:id/pdf
```

### 9.4 状态流

```text
idle
→ form_started
→ generating
→ preview_ready
→ checkout_started
→ paid
→ full_report_ready
→ pdf_exported
```

### 9.5 埋点事件

```text
hero_cta_click
report_card_click
form_start
form_submit
preview_generated
paywall_view
checkout_click
payment_success
full_report_view
pdf_export_click
membership_click
language_switch
```

### 9.6 PDF 导出

PDF 必须包含：

- 报告标题
- 生成日期
- 用户昵称
- 免责声明
- 完整模块
- 页脚：R7 Wellness

PDF 不应包含：

- 原始敏感输入明细
- 内部 prompt
- 用户支付信息

---

## 10. 上线 MVP 范围

### v1 必做

- 首页
- 全部报告列表
- 信息填写 modal 或独立页
- 生成加载状态
- 免费报告页
- PayPal 解锁
- 完整报告页
- 阿英切换
- 隐私/免责声明

### v1 可后置

- 真实账号系统
- 年付会员
- PDF 精排
- 本土支付网关
- WhatsApp Bot
- Telegram Bot
- 复杂用户画像数据库

### 首发推荐产品

1. Hidden Personality Map
2. Relationship Pattern Report
3. Emotional Load Check-in
4. Work Strengths Profile

后置产品：

1. Body-Mind Balance Review
2. Dream Journal Reflection

---

## 11. 参考来源

宗教边界：

- Quran 31:34: https://quran.com/31/34
- Sahih Muslim 2230: https://sunnah.com/muslim:2230
- Sunan Abi Dawud 3905: https://sunnah.com/abudawud:3905

数据与 AI：

- UAE data protection laws portal: https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws
- Egypt MCIT Artificial Intelligence portal: https://mcit.gov.eg/en/Artificial_Intelligence
- Saudi SDAIA portal: https://sdaia.gov.sa/

支付：

- mada official site: https://www.mada.com.sa/
- Fawry official site: https://www.fawry.com/
- Apple Pay official site: https://www.apple.com/apple-pay/

本土/区域案例：

- Labayh: https://labayh.net/en/
- Takalam: https://takalamhere.com/
- Shezlong: https://www.shezlong.com/
- Nafsi Health: https://www.nafsihealth.com/

平台：

- Telegram Bot platform: https://core.telegram.org/bots/features
- WhatsApp Business Platform: https://business.whatsapp.com/products/business-platform
