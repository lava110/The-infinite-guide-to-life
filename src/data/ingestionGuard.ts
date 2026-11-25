import { z } from 'zod';

// 1. 严格拆分两类一级信源域名白名单：
// (A) 政府、司法、高校及法定公共机构域名白名单（严禁任何商业平台混入）
export const GOV_STATUTORY_DOMAIN_REGEX =
  /^https?:\/\/([a-z0-9-]+\.)*(gov\.cn|edu\.cn|81\.cn|youth\.cn|hanban\.org|chinese\.cn|chineseteacher\.org\.cn|cpta\.com\.cn|chinasafety\.ac\.cn|cadc\.net\.cn|msa\.gov\.cn|e-cqs\.cn|mohrss\.gov\.cn|moj\.go\.jp|make-it-in-germany\.com|arbeitsagentur\.de|goethe\.de|diplo\.de|kmk\.org|chsi\.com\.cn|china-railway\.com\.cn|ccccltd\.cn|gov\.au|govt\.nz|universitaly\.it|119\.gov\.cn|irs\.gov)(\/.*)?$/i;

// (B) 商业平台一手规则白名单（仅限明确声明 portal_tier: 'COMMERCIAL_FIRST_PARTY' 的跨境独立承包商平台）
export const COMMERCIAL_PLATFORM_DOMAIN_REGEX =
  /^https?:\/\/([a-z0-9-]+\.)*(outlier\.ai|italki\.com|preply\.com|dataannotation\.tech)(\/.*)?$/i;

export const isPortalUrlValidForTier = (
  url: string,
  tier: 'STATUTORY_GOV' | 'COMMERCIAL_FIRST_PARTY' = 'STATUTORY_GOV'
) =>
  tier === 'COMMERCIAL_FIRST_PARTY'
    ? COMMERCIAL_PLATFORM_DOMAIN_REGEX.test(url) || GOV_STATUTORY_DOMAIN_REGEX.test(url)
    : GOV_STATUTORY_DOMAIN_REGEX.test(url);

// 兼容导出（仅用于总览校验；具体路径须按 portal_tier 严格分轨）
export const OFFICIAL_DOMAIN_REGEX = GOV_STATUTORY_DOMAIN_REGEX;

// 2. 定义禁止出现在轨 A 硬事实中的“模糊猜测词”黑名单
export const FORBIDDEN_VAGUE_WORDS = [
  '好像',
  '大概',
  '听说',
  '左右吧',
  '可能要',
  '据网友说',
];

export const containsVagueWords = (text: string) =>
  FORBIDDEN_VAGUE_WORDS.some((word) => text.includes(word));

// 3. 轨 A（政策硬事实）严格 Schema 守卫
export const TrackAHardFactsSchema = z.object({
  age_min: z.number().int().min(14).max(65),
  age_max: z.number().int().min(17).max(70),
  education_min: z
    .string()
    .min(2)
    .refine((val) => !containsVagueWords(val), {
      message: '学历底线包含模糊猜测词汇，请核实 L1 官方简章原文！',
    }),
  physical_constraints: z
    .array(z.string())
    .min(1, '必须明确列出至少1项身体/语言硬性准入条件'),
  prep_duration_days: z
    .object({
      min: z.number().int().min(0),
      max: z.number().int().min(1),
    })
    .refine((d) => d.max >= d.min, {
      message: '最大准备天数必须 >= 最小准备天数',
    }),

  // 法定零加价硬成本裸价单校验
  official_zero_markup_cost_cny: z.object({
    total_min: z.number().min(0),
    total_max: z.number().min(0),
    breakdown: z
      .array(
        z.object({
          item: z.string().min(2),
          cost_cny: z.string(),
        })
      )
      .min(1, '必须提供至少1项官方规费拆解明细（如报名费、体检费、公办学费）'),
  }),

  // 门户信用分级：默认严格为政府/法定机构；商业独立承包商平台须显式声明 COMMERCIAL_FIRST_PARTY
  portal_tier: z.enum(['STATUTORY_GOV', 'COMMERCIAL_FIRST_PARTY']).optional().default('STATUTORY_GOV'),
  official_portal_url: z.string().url(),
  official_portal_name: z.string().min(4),

  // 核心铁律：交叉验证源必须 >= 2，且至少包含 1 个 L1 法定一手源！
  l1_l2_sources: z
    .array(
      z.object({
        level: z.enum(['L1', 'L2']),
        doc_name: z
          .string()
          .min(5, '必须填写完整的法规、通知或招生简章全称（带书名号或文号）'),
        authority: z.string().min(3, '必须注明发文部委或公办执行机构名称'),
        source_url: z.string().url().optional(),
      })
    )
    .min(2, '🚨 交叉验证失败：轨 A 硬事实必须具备 ≥2 个独立 L1/L2 来源！')
    .refine((sources) => sources.some((s) => s.level === 'L1'), {
      message:
        '🚨 证据等级不足：轨 A 证据链中必须至少包含 1 个 [L1] 级部委/立法级一手源！',
    }),
}).superRefine((data, ctx) => {
  const tier = data.portal_tier ?? 'STATUTORY_GOV';
  if (tier === 'STATUTORY_GOV' && !GOV_STATUTORY_DOMAIN_REGEX.test(data.official_portal_url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['official_portal_url'],
      message:
        '🚨 严重违规：法定准入类路径的 official_portal_url 必须是政府(.gov.cn)、公办高校(.edu.cn)或外国官方机构域名，严禁混入商业网站！',
    });
  }
  if (
    tier === 'COMMERCIAL_FIRST_PARTY' &&
    !COMMERCIAL_PLATFORM_DOMAIN_REGEX.test(data.official_portal_url) &&
    !GOV_STATUTORY_DOMAIN_REGEX.test(data.official_portal_url)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['official_portal_url'],
      message:
        '🚨 商业平台路径的 official_portal_url 必须命中已核验的一手平台白名单，严禁填入第三方中介或引流网站！',
    });
  }
});

// 4. 轨 B（体感防坑与照妖镜）严格 Schema 守卫
export const TrackBRealitySliceSchema = z.object({
  // 强制要求包含样本差异免责声明
  mandatory_disclaimer: z.string().startsWith('⚠️', {
    message: "轨 B 必须以 '⚠️' 开头强制声明样本来源与个体差异风险！",
  }),

  // 强制要求拆分为 3 个收入阶段（必须暴露第一阶段的低薪见习/断档期）
  net_income_stages: z
    .array(
      z.object({
        stage: z.string(),
        monthly_cny_range: z.tuple([z.number().min(0), z.number().min(0)]),
        highlight: z.string(),
        duration_months: z.number().optional(),
      })
    )
    .length(
      3,
      '🚨 防忽悠铁律：收入阶梯必须严格拆分为 [1.新手/见习期, 2.转正稳定期, 3.高阶溢价期] 三个阶段，严禁只报最高薪资！'
    ),

  // 强制要求至少 3 条残酷劝退红线
  deal_breakers: z
    .array(
      z
        .string()
        .min(15, '每条劝退红线必须具体描述生理、心理或制度代价（不少于15字）')
    )
    .min(3, '🚨 劝退力度不足：每张卡片必须提供 ≥3 条真实劝退红线！'),

  // 黑中介照妖镜校验
  anti_scam_mirror: z.object({
    typical_agency_quote_cny: z.tuple([z.number().min(0), z.number().min(0)]),
    scam_alert: z
      .string()
      .min(20, '必须明确写出黑中介话术拆解或法定防坑条款'),
  }),
});

// 5. 时效与链路健康度元数据 Schema (freshness_meta)
export const FreshnessMetaSchema = z.object({
  window_months: z
    .array(z.number().int().min(1).max(12))
    .max(12, '窗口月份仅允许 1-12 的整数数组'),
  window_label: z.string().min(2),
  verify_cycle_days: z.number().int().min(15).max(365),
  next_verify_due: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '下次重验日必须为 YYYY-MM-DD 格式'),
  link_health: z
    .object({
      status: z.enum(['HEALTHY', 'REDIRECTED', 'RESTRICTED_BOT', 'UNREACHABLE', 'UNCHECKED']),
      http_status: z.number().int().optional(),
      checked_at: z.string(),
      final_url: z.string().optional(),
      latency_ms: z.number().optional(),
      note: z.string().optional(),
    })
    .optional(),
});

// 6. 决策 PK 与现金流模型 Schema (pk_profile)
export const PKProfileSchema = z.object({
  short_name: z.string().min(3),
  badge: z.string().min(3),
  official_cost_avg: z.number().min(0),
  prep_months: z.number().min(0),
  prep_label: z.string().min(2),
  hard_threshold: z.string().min(4),
  intern_months: z.number().min(0),
  intern_monthly_net: z.number().min(0),
  intern_label: z.string().min(2),
  regular_monthly_net: z.number().min(0),
  regular_range: z.tuple([z.number().min(0), z.number().min(0)]),
  on_job_living_expense: z.number().min(0),
  working_months_per_year: z.number().min(1).max(12),
  family_separation: z.object({
    level: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    text: z.string().min(4),
  }),
  body_toll: z.string().min(4),
  ceiling_3yr: z.string().min(6),
  agency_trap_diff: z.number().min(0),
  verdict_fit: z.array(z.string().min(6)).min(1),
  verdict_avoid: z.array(z.string().min(6)).min(1),
});

// 7. 候选卡片主 Schema（兼容入库前原始 JSON 投稿与前端沙盒校验）
export const PathCardMasterSchema = z.object({
  path_id: z
    .string()
    .regex(/^PATH_\d{3}$/, '编号格式必须为 PATH_001 ~ PATH_999'),
  title: z.string().min(6),
  scenario_tags: z.array(z.string()).min(1),
  category: z.array(z.string()).min(1),
  status_light: z.enum(['GREEN', 'YELLOW', 'RED', 'AMBER']),
  last_verified_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  policy_update_month: z.string().optional(),
  freshness_meta: FreshnessMetaSchema.optional(),
  track_a_hard_facts: TrackAHardFactsSchema,
  track_b_reality_slice: TrackBRealitySliceSchema,
});

// 8. 生产级全量路径 Schema（锁定内容层 + PK 决策层 + 漏斗标签 + 时效元数据）
export const FullVerifiedPathSchema = PathCardMasterSchema.extend({
  batch_id: z.enum(['BATCH_1', 'BATCH_2', 'BATCH_3', 'BATCH_4', 'BATCH_5']).optional(),
  pk_arena: z.enum(['STUDENT_PK', 'ADULT_PK']),
  domain: z.enum([
    'STUDENT_STREAM',
    'CERT_TRADES',
    'OVERSEAS_SHIPPING',
    'SAFE_DESK_GUARD',
    'MEDICAL_CARE',
  ]),
  identity_group: z
    .array(z.enum(['STUDENT_15_18', 'YOUTH_18_35', 'MIDLIFE_35_55', 'SENIOR_50_PLUS']))
    .min(1, '必须至少指定1个人群年龄分组'),
  core_goals: z
    .array(
      z.enum([
        'URGENT_30D_CASH',
        'SAVE_300K_3YR',
        'DAILY_HOME_FAMILY',
        'BIAN_ZHI_STABLE',
        'STUDY_ON_DUTY',
      ])
    )
    .min(1, '必须至少指定1个核心目标标签'),
  includes_free_board_lodging: z.boolean(),
  requires_night_shift: z.boolean(),
  allows_daily_home: z.boolean(),
  requires_heavy_lifting_or_waist: z.boolean(),
  keywords: z.array(z.string().min(1)).min(3, '至少提供3个检索关键词'),
  diy_action_steps: z.array(z.string().min(12)).min(3, '至少提供3步 DIY 零中介行动步骤'),
  pk_profile: PKProfileSchema,
  freshness_meta: FreshnessMetaSchema,
});

export interface ValidationIssueItem {
  path: string;
  message: string;
}

// 自动化入库校验测试函数（兼容原始候选 JSON 投稿）
export function validateCandidateCard(rawJson: unknown): {
  passed: boolean;
  data?: z.infer<typeof PathCardMasterSchema>;
  errors: ValidationIssueItem[];
} {
  const result = PathCardMasterSchema.safeParse(rawJson);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.') || 'root',
      message: issue.message,
    }));
    return { passed: false, errors };
  }
  return { passed: true, data: result.data, errors: [] };
}

// 生产全库严格校验函数（全字段锁死：含 pk_profile、漏斗标签、DIY步骤与 freshness_meta）
export function validateFullVerifiedPath(rawJson: unknown): {
  passed: boolean;
  data?: z.infer<typeof FullVerifiedPathSchema>;
  errors: ValidationIssueItem[];
} {
  const result = FullVerifiedPathSchema.safeParse(rawJson);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.') || 'root',
      message: issue.message,
    }));
    return { passed: false, errors };
  }
  return { passed: true, data: result.data, errors: [] };
}

/**
 * 工位 2 熔断拦截库：《伪考证 / 割韭菜黑名单库 (SCAM_BLACKLIST)》
 * 凡未命中人社部《国家职业资格目录（72项）》且无国家部委法定准入文件，直接熔断拦截
 */
export interface ScamBlacklistItem {
  scam_id: string;
  fake_cert_name: string;
  l5_marketing_hook: string;
  agency_fee_cny: string;
  l1_verification_verdict: string;
  intercept_reason: string;
}

export const SCAM_BLACKLIST: ScamBlacklistItem[] = [
  {
    scam_id: 'BLACK_01',
    fake_cert_name: '碳排放管理员 / 碳资产管理师（包高薪兼职挂靠）',
    l5_marketing_hook: '“国家双碳风口急缺百万人才，不用去上班，考完证挂靠企业每年躺领3-5万补贴”',
    agency_fee_cny: '¥3,980 - ¥6,800',
    l1_verification_verdict: '❌ 未列入人社部《国家职业资格目录（72项）》，非国家准入类资格',
    intercept_reason:
      '工位2白名单反查失败：生态环境部与人社部从未规定企业必须聘用持该证人员，更无任何合法挂靠市场；市面上均为山寨协会或培训机构自印废纸。',
  },
  {
    scam_id: 'BLACK_02',
    fake_cert_name: '家庭教育指导师 / 心理咨询师（代报名包派单接咨询）',
    l5_marketing_hook: '“宝妈居家副业天花板，考下高级证平台包派单，每小时咨询费300-800元”',
    agency_fee_cny: '¥4,500 - ¥9,800',
    l1_verification_verdict: '❌ 人社部已于2017年正式废止“心理咨询师”二三级国家职业资格统考',
    intercept_reason:
      '工位2白名单反查失败：现行市面上所有“心理咨询师/家庭教育指导师”均为学会或机构内部培训合格证明，不属于国家准入资格，所谓“包派单”实为诱导购买更贵督导课的连环套。',
  },
  {
    scam_id: 'BLACK_03',
    fake_cert_name: '有声书配音师 / 影视后期剪辑师（先学后付·兼职派单贷）',
    l5_marketing_hook: '“一部手机在家读小说就能日赚300元，0元入学，接单赚钱后再还学费”',
    agency_fee_cny: '¥5,800 - ¥12,800（分期信贷）',
    l1_verification_verdict: '❌ 零官方准入文件支撑，高频命中最高法“招转培/培训贷”典型诈骗判例',
    intercept_reason:
      '工位2熔断：诱导失业者在不知情下签署消金公司高息分期贷款，发几百元假单后即以“声音审核不达标”断单，退课需赔付40%高额违约金。',
  },
  {
    scam_id: 'BLACK_04',
    fake_cert_name: '中医康复理疗师 / 小儿推拿师（无医学背景包开店行医）',
    l5_marketing_hook: '“不用读医学院，15天速成拿国字头高级证，合法开中医诊所”',
    agency_fee_cny: '¥4,800 - ¥15,000',
    l1_verification_verdict: '❌ 严重违反《中华人民共和国执业医师法》与《中医药法》',
    intercept_reason:
      '工位2熔断：非医学专业严禁报考执业医师；持所谓“协会康复理疗证”开展针灸、正骨或破皮诊疗属于非法行医，直接面临行政处罚乃至刑事责任。',
  },
];

/**
 * 50 张卡片批次扩张蓝图（Batch 1 ~ Batch 5 排期表）
 */
export interface BatchSeedItem {
  path_id: string;
  title: string;
  status: 'LIVE_VERIFIED' | 'STAGE_2_QUEUED';
  policy_update_month: string;
  authority_tag: string;
}

export interface BatchBlueprintGroup {
  batch_id: string;
  batch_name: string;
  range_label: string;
  focus_theme: string;
  target_persona: string;
  items: BatchSeedItem[];
}

export const BATCH_BLUEPRINT_50: BatchBlueprintGroup[] = [
  {
    batch_id: 'BATCH_1',
    batch_name: 'Batch 1 · 零资产保底现金流与基础准入技工',
    range_label: 'PATH_001 ~ PATH_010',
    focus_theme: '零资产保底现金流与国家准入硬技能',
    target_persona: '存款见底、35+被裁、大专/初高中蓝领、负债急需现金流重启',
    items: [
      {
        path_id: 'PATH_001',
        title: '无限航区远洋船员（值班水手 II/4 · 值班机工 III/4）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年稳定（行政许可框架，3-5年微调考纲）',
        authority_tag: '交通运输部海事局 (csp.msa.gov.cn)',
      },
      {
        path_id: 'PATH_002',
        title: '特种设备场内专用机动车辆：叉车司机（代号 N1）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年稳定（TSG Z6001 考核规则）',
        authority_tag: '市场监管总局 / 特检院 (cnse.e-cqs.cn)',
      },
      {
        path_id: 'PATH_007',
        title: '准入类建（构）筑物消防员：中级消防设施操作员（四级·监控/维保）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每月批次考核（全年开放排队）',
        authority_tag: '国家消防救援局 (xfhyjd.119.gov.cn)',
      },
      {
        path_id: 'PATH_008',
        title: '特种设备起重机指挥（Q1）与起重机司机（Q2·桥门式/流动式）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年稳定（TSG Z6001 考核规则）',
        authority_tag: '市场监管总局 / 特检院 (cnse.e-cqs.cn)',
      },
      {
        path_id: 'PATH_009',
        title: '应急管理部特种作业：低压/高压电工证（物业工程 · 产线配电）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年稳定（3年复审、6年换证）',
        authority_tag: '应急管理部 (cx.mem.gov.cn)',
      },
      {
        path_id: 'PATH_010',
        title: '三甲医院免陪照护病房：医疗护理员/母婴护理（人社补贴通道）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 2-3 月（各省人社补贴目录更新）',
        authority_tag: '国家卫健委 / 人社部 (osta.mohrss.gov.cn)',
      },
    ],
  },
  {
    batch_id: 'BATCH_2',
    batch_name: 'Batch 2 · 15-22岁升学分流与低分高走暗道',
    range_label: 'PATH_003~004 / PATH_011~020',
    focus_theme: '15-22岁中考/高考提前批分流与低分高走央国企/带编暗道',
    target_persona: '15岁中考普高线边缘、18岁高考二本线下、无力承担25万民办高中学费家庭',
    items: [
      {
        path_id: 'PATH_003',
        title: '公办中本贯通（3年中职免学费 + 4年公办应用型本科）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 4-5 月（各省市中考提前批简章发布）',
        authority_tag: '教育部 / 各省教育考试院 (chsi.com.cn)',
      },
      {
        path_id: 'PATH_004',
        title: '国家公费定向医学生 / 基层农技生（免学费倒贴补助 + 毕业直接入编）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 5-6 月（高考提前批志愿填报期）',
        authority_tag: '教育部 / 国家卫健委 (gaokao.chsi.com.cn)',
      },
      {
        path_id: 'PATH_011',
        title: '定向培养军士（高考专科提前批 · 2.5年公办高校 + 直接入伍授下士军衔）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 5-6 月（全国征兵网与高考专科提前批）',
        authority_tag: '中央军委政治工作部 / 教育部 (gfbzb.gov.cn)',
      },
      {
        path_id: 'PATH_012',
        title: '原铁道部直属高职专科：机车/供电（国铁18个铁路局校招直入）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 6 月招生 & 10-12 月铁路局校招',
        authority_tag: '国家铁路局 / 国铁集团 (rczp.china-railway.com.cn)',
      },
      {
        path_id: 'PATH_013',
        title: '重点高校招收农村和脱贫地区学生专项计划（国家专项 / 地方专项 / 高校专项）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 3-4 月（高校专项4月25日前阳光高考网申报）',
        authority_tag: '教育部阳光高考平台 (gaokao.chsi.com.cn)',
      },
      {
        path_id: 'PATH_015',
        title: '军队院校面向士兵招生（部队考军校 / 优秀大学生士兵提干）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 1-3 月部队基层报名 & 6 月全军文化统考',
        authority_tag: '中央军委训练管理部 / 全国征兵网 (gfbzb.gov.cn)',
      },
      {
        path_id: 'PATH_014',
        title: '华侨港澳台联考 / 香港 DSE 合规划线升学通道',
        status: 'STAGE_2_QUEUED',
        policy_update_month: '每年 3 月（联考报名确权期）',
        authority_tag: '广东省教育考试院 / 香港考评局',
      },
    ],
  },
  {
    batch_id: 'BATCH_3',
    batch_name: 'Batch 3 · 22-30岁青年体制内降维与近亲岗',
    range_label: 'PATH_006 / PATH_021~030',
    focus_theme: '22-30岁青年体制内降维上岸、定向考公跳板与准军事化高保障岗',
    target_persona: '二本失业、考研失利、省考100:1落榜、急需体制身份缓冲与五险一金',
    items: [
      {
        path_id: 'PATH_006',
        title: '国家基层服务专项：特岗教师 / 高校毕业生“三支一扶”',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 4-6 月（各省招募公告集中发布期）',
        authority_tag: '人社部 / 教育部 (mohrss.gov.cn)',
      },
      {
        path_id: 'PATH_023',
        title: '国家综合性消防救援队伍消防员招录（高中/大专可报 · 体制内准军事化高保障）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 7-8 月（国家消防员招录平台集中开启）',
        authority_tag: '应急管理部 / 国家消防救援局 (xfyzl.119.gov.cn)',
      },
      {
        path_id: 'PATH_021',
        title: '大学生志愿服务西部计划（考研初试加10分 + 定向考公 + 学费代偿）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 3-5 月（全国项目办与高校团委报名）',
        authority_tag: '共青团中央 / 教育部 / 人社部 (xibu.youth.cn)',
      },
      {
        path_id: 'PATH_022',
        title: '法院 / 检察院聘用制书记员（法检系统合同制跳板 · 在岗备考法考/公考）',
        status: 'STAGE_2_QUEUED',
        policy_update_month: '各省高院/市院按季度招录',
        authority_tag: '各省高级人民法院 / 人事考试网',
      },
      {
        path_id: 'PATH_024',
        title: '中国人民解放军文职人员公开招考（管理/专技/专业技能岗）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 10-11 月（军队人才网全军统考公告）',
        authority_tag: '中央军委政治工作部 / 军队人才网 (81rc.81.cn)',
      },
      {
        path_id: 'PATH_067',
        title: '退役大学生士兵专项硕士研究生招生计划（先服役2年 → 降分考取全日制名校硕士）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 9-10 月（研招网退役大学生士兵专项计划网报）',
        authority_tag: '教育部研招网 / 全国征兵网 (yz.chsi.com.cn)',
      },
    ],
  },
  {
    batch_id: 'BATCH_4',
    batch_name: 'Batch 4 · 18-35岁个人全球化低成本出海',
    range_label: 'PATH_005 / PATH_031~040',
    focus_theme: '18-35岁低成本合规出海、带薪学手艺与打工度假攒第一桶金',
    target_persona: '厌倦国内35岁年龄歧视与内卷、手头仅有1-3万启动金但愿意攻克外语的青年',
    items: [
      {
        path_id: 'PATH_005',
        title: '德国双元制带薪职业教育（Ausbildung · 护理/机电/酒店）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 8-9 月主入学季 & 2-3 月春季班',
        authority_tag: '德国联邦劳工局 (make-it-in-germany.com)',
      },
      {
        path_id: 'PATH_031',
        title: '澳洲 462 打工度假签证（WHV 移民局官网 DIY 抽签 · 高储蓄攒第一桶金）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 7-10 月（澳洲新财年 EOI 预注册抽签季）',
        authority_tag: '澳大利亚内政部移民局 (immi.homeaffairs.gov.au)',
      },
      {
        path_id: 'PATH_032',
        title: '新西兰打工度假签证（NZ Working Holiday Visa · 中国大陆1000名额）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 5-7 月（新西兰移民局年度名额开放日）',
        authority_tag: '新西兰移民局 (immigration.govt.nz)',
      },
      {
        path_id: 'PATH_034',
        title: '意大利公立大学免学费 + DSU大区政府助学金留学（本科/硕士）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 4-8 月（Universitaly 国际生预注册与DSU申请季）',
        authority_tag: '意大利大学与研究部 (universitaly.it)',
      },
      {
        path_id: 'PATH_033',
        title: '日本特定技能 1 号直考通道（餐饮/宿泊/工业制造 · 绕开黑劳务研修生）',
        status: 'STAGE_2_QUEUED',
        policy_update_month: '常年按月排考（日本出入国在留管理厅）',
        authority_tag: '日本法务省出入国在留管理厅 (moj.go.jp)',
      },
      {
        path_id: 'PATH_035',
        title: '教育部语合中心国际中文教育志愿者（国家公派海外任教）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 10-11 月 & 3-4 月（语合中心分批招募）',
        authority_tag: '教育部语合中心 (pmplatform.chinese.cn)',
      },
      {
        path_id: 'PATH_036',
        title: '德国机会卡（Chancenkarte · §20a AufenthG 积分制找工作签证）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年在线开放申请（德国外交部 digital.diplo.de 全年在线预审）',
        authority_tag: '德国联邦内政部 / 外交部 (make-it-in-germany.com)',
      },
      {
        path_id: 'PATH_066',
        title: '国际豪华邮轮海乘直招（皇家加勒比 / MSC地中海 / 维京邮轮）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年按月滚动面试（海事局持牌海员外派机构）',
        authority_tag: '中国海事局 / 国际劳工组织 MLC (csp.msa.gov.cn)',
      },
    ],
  },
  {
    batch_id: 'BATCH_5',
    batch_name: 'Batch 5 · 35-50岁中年转型、债务重组、跨境远程赚美元与轻资产托底',
    range_label: 'PATH_041 ~ PATH_065',
    focus_theme: '35-50岁法定债务重整免责、特种硬手艺、跨境远程赚美元与文科中层合规转型',
    target_persona: '背负创业连带债务、35+文科/管理层被裁、宝妈居家/数字游民与手艺型高日薪突围者',
    items: [
      {
        path_id: 'PATH_041',
        title: '深圳个人破产条例 / 浙江个人债务集中清理（诚实而不幸债务人法定免责重整）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年法定受理（深圳个人破产案件信息网 / 浙江移动微法院）',
        authority_tag: '深圳市中级人民法院 / 深圳破产署 (birp.szcourt.gov.cn)',
      },
      {
        path_id: 'PATH_046',
        title: '特种设备承压焊工：氩弧焊 / 氩电联焊（代号 GTAW / SMAW · 拍片高日薪）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年稳定（TSG Z6002-2026 特种设备焊接考核细则，2026年8月起施行）',
        authority_tag: '市场监管总局 / 特检院 (cnse.e-cqs.cn)',
      },
      {
        path_id: 'PATH_054',
        title: '海外 AI 大模型数据标注与 RLHF 专家（Outlier / DataAnnotation / Mercor）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年开放注册（随大模型训练批次动态更新任务池）',
        authority_tag: 'IRS W-8BEN / Outlier AI (outlier.ai)',
      },
      {
        path_id: 'PATH_056',
        title: '国际中文在线独立教师（Preply / iTalki 独立教师通道）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每周动态开放申请（iTalki每周一更新开放语种状态）',
        authority_tag: 'iTalki / Preply / 语合中心 CTCSOL (teach.italki.com)',
      },
      {
        path_id: 'PATH_063',
        title: '中级注册安全工程师（应急管理部全国统考 · 企业EHS护身符）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 8 月网报 & 10 月末全国统考',
        authority_tag: '中国人事考试网 / 应急管理部 (cpta.com.cn)',
      },
      {
        path_id: 'PATH_065',
        title: '中资央企海外项目部直招（非洲 / 中东 / 东南亚基建能源 · 合同制）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年按工程节点公开社招（国资委央企招聘专栏）',
        authority_tag: '国务院国资委 / 央企工程局 (sasac.gov.cn)',
      },
      {
        path_id: 'PATH_058',
        title: '植保无人机飞手（CAAC民航局操控员执照 + 农机购置补贴跨区作业）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '常年报考（春耕3-5月 / 夏秋7-10月飞防旺季，2024-2026农机补贴期）',
        authority_tag: '中国民航局 UOM / 农业农村部 (uom.caac.gov.cn)',
      },
      {
        path_id: 'PATH_060',
        title: '执业兽医资格证（农业农村部全国统考 · 宠物医疗与现代牧场双栖）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 1-3 月网报 & 7 月全国机考（中国兽医网）',
        authority_tag: '农业农村部 / 中国兽医网 (cadc.net.cn)',
      },
      {
        path_id: 'PATH_071',
        title: '同等学力人员申请硕士学位（在职免试入学 · 国家单证硕士）',
        status: 'LIVE_VERIFIED',
        policy_update_month: '每年 3 月网报 & 5 月全国同等学力统考',
        authority_tag: '教育部 / 学信网全国同等学力平台 (tdxl.chsi.com.cn)',
      },
      {
        path_id: 'PATH_042',
        title: '企业政府采购招投标标书工程师 / 合规内审员（考公落榜与文科中层转型）',
        status: 'STAGE_2_QUEUED',
        policy_update_month: '常年开放（中国政府采购网法规库）',
        authority_tag: '财政部中国政府采购网 (ccgp.gov.cn)',
      },
      {
        path_id: 'PATH_043',
        title: '民政补贴型社区长者食堂 / 日间照料站微利运营承接',
        status: 'STAGE_2_QUEUED',
        policy_update_month: '每年 3-5 月各市民政局社区养老招标季',
        authority_tag: '民政部 / 地方民政局公开招标平台',
      },
      {
        path_id: 'PATH_044',
        title: '国家执业药师 / 一级注册消防工程师（大龄文理科法定准入刚需坐班岗）',
        status: 'STAGE_2_QUEUED',
        policy_update_month: '每年 8 月报名、10-11 月全国统考',
        authority_tag: '中国人事考试网 (cpta.com.cn)',
      },
    ],
  },
];

export const CHIEF_DATA_AUDITOR_PROMPT = `# Role: 《人生无限》L1-L5 分轨数据审计官 (Chief Data Auditor)

你是一个极度冷酷、对未经证实的信息抱有绝对洁癖的政策与职业路径审计员。你的任务是将输入的候选路径线索（Candidate Lead），转化为符合 \`PathCardMasterSchema\` 的结构化 JSON 数据。

## 绝对不可违背的三条铁律（违反任意一条直接中止生成并输出 RED_ALERT）：

1. 【先查准入白名单，伪路子直接熔断】
   - 若候选路径为国内考证类，首先核查其是否属于人社部《国家职业资格目录（72项）》或具备国家部委法定准入文件。
   - 若发现该路径无任何 L1 级政府法定文件支撑，纯属培训机构捏造概念卖课（如“碳排放管理员包就业”、“有声书配音兼职贷”、“心理咨询师挂靠”），立刻停止生成常规卡片，直接输出 \`{"status": "REJECTED_AS_SCAM", "reason": "..."}\`。

2. 【轨 A 政策硬事实：双源交叉 + 零加价裸价】
   - \`l1_l2_sources\` 必须包含至少 2 个独立来源，且至少 1 个为 L1 级（部委规章、法律法规、教育考试院/海事局/市场监管总局/外国移民局官方公报），必须写出带书名号的准确文件全称或文号。
   - \`official_portal_url\` 必须是政府（.gov.cn）、公办高校（.edu.cn）或外国官方机构的一手门户网址。
   - \`official_zero_markup_cost_cny\` 只允许计算个人直接向官方机构缴纳的行政规费、公办院校学费与法定体检公证费，严禁混入任何商业中介服务费。

3. 【轨 B 体感切片：强制暴露低薪过渡期与三大劝退红线】
   - \`mandatory_disclaimer\` 必须以 \`⚠️\` 开头声明样本来源与个体差异。
   - \`net_income_stages\` 必须严格拆分为 3 个阶段。第 1 阶段必须是【见习期/学徒期/新手找工作断档期】的真实底薪（哪怕是 0 元或 1500 元也必须如实写出，严禁把熟手期高薪当成起薪）。
   - \`deal_breakers\` 必须从一线从业者退坑帖中提炼出至少 3 条极其具体的生理、心理、合同锁定期或淘汰率代价（每条不少于15字）。`;

/**
 * 供前端“Zod 入库闸门实时拦截沙盒”一键测试的违规样本
 */
export const SAMPLE_INVALID_CANDIDATES = [
  {
    label: '❌ 违规样本 A：商业中介网址混入轨 A + 含模糊猜测词',
    description: '模拟大模型把商业培训机构网址当成官方门户，且学历要求使用了“听说大概”等模糊词',
    json: {
      path_id: 'PATH_099',
      title: '某机构包装的高薪无人机飞手速成班',
      scenario_tags: ['二本失业'],
      category: ['商业培训包装'],
      status_light: 'GREEN',
      last_verified_date: '2026-11-12',
      track_a_hard_facts: {
        age_min: 18,
        age_max: 55,
        education_min: '听说大概初中左右吧',
        physical_constraints: ['身体健康'],
        prep_duration_days: { min: 15, max: 30 },
        official_zero_markup_cost_cny: {
          total_min: 12800,
          total_max: 19800,
          breakdown: [{ item: '商业机构VIP包过班学费', cost_cny: '12,800' }],
        },
        official_portal_url: 'https://www.mou-peixun-agency.com/apply',
        official_portal_name: '某商业无人机培训招商网',
        l1_l2_sources: [
          {
            level: 'L2',
            doc_name: '某公众号推文介绍',
            authority: '自媒体小编',
          },
        ],
      },
      track_b_reality_slice: {
        mandatory_disclaimer: '⚠️ 样本来自机构宣传册',
        net_income_stages: [
          { stage: '新手期', monthly_cny_range: [3000, 4500], highlight: '打杂' },
          { stage: '熟手期', monthly_cny_range: [6000, 8000], highlight: '植保作业' },
          { stage: '高阶期', monthly_cny_range: [9000, 12000], highlight: '航拍测绘' },
        ],
        deal_breakers: [
          '农业植保受季节限制极强，冬季长达4个月无活可干',
          '炸机维修成本高昂，新手操作失误常需自己赔付设备折损',
          '长期在烈日与农药喷洒环境下流动作业，体力消耗极大',
        ],
        anti_scam_mirror: {
          typical_agency_quote_cny: [15800, 25800],
          scam_alert: '民航局UOM系统可直接查询合规考点，切勿轻信所谓包分配高薪电网巡检的贷款班。',
        },
      },
    },
  },
  {
    label: '❌ 违规样本 B：隐瞒新手0收入断档期 + 劝退红线敷衍',
    description: '模拟软文只报熟手高薪（仅1个收入阶段）、漏掉 ⚠️ 免责声明，且劝退红线不足3条',
    json: {
      path_id: 'PATH_088',
      title: '被软文美化的海外高薪劳务派遣项目',
      scenario_tags: ['负债重启'],
      category: ['蓝领出海'],
      status_light: 'GREEN',
      last_verified_date: '2026-11-12',
      track_a_hard_facts: {
        age_min: 20,
        age_max: 45,
        education_min: '高中及以上',
        physical_constraints: ['无传染病'],
        prep_duration_days: { min: 60, max: 120 },
        official_zero_markup_cost_cny: {
          total_min: 2500,
          total_max: 4500,
          breakdown: [{ item: '签证规费与体检费', cost_cny: '2,500' }],
        },
        official_portal_url: 'https://www.moj.go.jp/isa',
        official_portal_name: '日本出入国在留管理厅',
        l1_l2_sources: [
          {
            level: 'L1',
            doc_name: '《出入国管理及难民认定法》（特定技能1号创设法案）',
            authority: '日本国法务省',
          },
          {
            level: 'L2',
            doc_name: '外务省特定技能考试报名规程公示',
            authority: '日本外务省',
          },
        ],
      },
      track_b_reality_slice: {
        mandatory_disclaimer: '这是一份没有警告符号开头的声明，会被Zod直接拦截',
        net_income_stages: [
          { stage: '出国即拿高薪', monthly_cny_range: [18000, 25000], highlight: '只报最高薪资' },
        ],
        deal_breakers: ['有点想家', '平时稍微有点累'],
        anti_scam_mirror: {
          typical_agency_quote_cny: [35000, 50000],
          scam_alert: '短于二十字的敷衍防坑提醒',
        },
      },
    },
  },
];
