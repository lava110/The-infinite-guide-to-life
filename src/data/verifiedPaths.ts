export * from './schema.ts';
import type { VerifiedPath } from './schema.ts';
import { hydratePathWithFreshness } from './freshnessRegistry.ts';

const RAW_VERIFIED_PATHS: VerifiedPath[] = [
  {
    path_id: "PATH_001",
    title: "无限航区远洋船员（值班水手 II/4 · 值班机工 III/4）",
    batch_id: 'BATCH_1',
    policy_update_month: "常年稳定（行政许可框架，3-5年微调考纲）",
    pk_arena: 'ADULT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55'],
    core_goals: ['SAVE_300K_3YR'],
    scenario_tags: ["二本失业", "大专蓝领", "负债重启"],
    category: ["蓝领出海", "国家准入技能", "零资产储蓄"],
    status_light: "GREEN",
    last_verified_date: "2026-11-11",
    includes_free_board_lodging: true,
    requires_night_shift: true,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["跑船", "海员", "水手", "机工", "出海", "远洋", "强制攒钱", "负债", "包吃住"],
    diy_action_steps: [
      "第一步：登录中国海事综合服务平台 (csp.msa.gov.cn) 查询全国核准海船船员培训机构名录（优先选集美大学、武汉理工大学、大连海事大学继续教育学院等公办院校）。",
      "第二步：前往海事局指定医院完成《海船船员健康证明》体检（费用约350-500元，重点查辨色力与听力），切勿先交学费再体检。",
      "第三步：直接在公办院校报名‘基本安全+保安意识(Z01/Z07)’与‘值班水手(II/4)或值班机工(III/4)’适任培训，脱产约3-4个月，考过拿白皮适任考试合格证明。",
      "第四步：在海事平台核验持《海员外派机构资质证书》的甲级船东或央企航运直属劳务公司投递实习简历，严拒任何超过2000元服装押金的黑中介。"
    ],
    pk_profile: {
      short_name: "001 远洋船员 (水手/机工)",
      badge: "3年攒30万硬通货 · 极度孤独",
      official_cost_avg: 8000,
      prep_months: 4,
      prep_label: "3-4个月全脱产培训+统考",
      hard_threshold: "18-60岁 · 初中起 · 无色盲色弱",
      intern_months: 6,
      intern_monthly_net: 2200,
      intern_label: "前6个月在船见习换白皮证（仅发微薄津贴）",
      regular_monthly_net: 10500,
      regular_range: [8800, 15000],
      on_job_living_expense: 300,
      working_months_per_year: 9.5,
      family_separation: {
        level: 'HIGH',
        text: "极高：单次出海 8±1 个月，跨洋期常有10-20天无手机信号，家里有急事无法立刻赶回"
      },
      body_toll: "机舱 40℃+ 高温与引擎高噪音（机工） / 甲板高空作业与昼夜时差颠倒（水手）",
      ceiling_3yr: "攒下 25-35 万本金上岸做小生意，或自考晋升三副/三管轮（月薪跃升至 2.2万-3万）",
      agency_trap_diff: 24000,
      verdict_fit: [
        "背负10-30万外债，急需一个“强制零消费+纯攒钱”物理隔离环境的人",
        "单身或家庭后方极稳固，能忍受半年以上弱网孤独",
        "手头有至少 1.5万-2.5万 备用金能熬过前10个月（4个月培训+6个月低薪见习）"
      ],
      verdict_avoid: [
        "下个月就要交房租、手头连 5000 块都没有的断粮救急者",
        "家里有临产孕妇、重病老人或需要每日盯看的年幼子女",
        "有幽闭恐惧症、严重晕船或高空恐惧症"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 60,
      education_min: "初中及以下",
      physical_constraints: ["无色盲色弱", "听力正常", "无传染性及精神类疾病"],
      prep_duration_days: { min: 90, max: 120 },
      official_zero_markup_cost_cny: {
        total_min: 6500,
        total_max: 9500,
        breakdown: [
          { item: "公办航海院校脱产培训学费", cost_cny: "5,000 - 7,500" },
          { item: "海事局适任理论与实操统考费", cost_cny: "450" },
          { item: "指定医院海船船员健康体检", cost_cny: "350 - 500" }
        ]
      },
      official_portal_url: "https://csp.msa.gov.cn",
      official_portal_name: "中国海事综合服务平台",
      l1_l2_sources: [
        { level: "L1", doc_name: "《中华人民共和国船员适任考试和发证规则》（交运部令2020年第11号）", authority: "交通运输部 / 海事局" },
        { level: "L1", doc_name: "《中华人民共和国海员外派管理规定》第30条（严禁收中介费）", authority: "交通运输部" },
        { level: "L2", doc_name: "公办航海类高校继续教育学院社会船员培训收费公示", authority: "集美大学 / 武汉理工等核准机构" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 一线船员劳务合同与 L4 中国船员薪酬指数交叉采集，受船型与航运周期波动影响。",
      net_income_stages: [
        { stage: "前6个月见习换证期", monthly_cny_range: [1500, 3000], highlight: "贴时间换白皮证，几乎不攒钱", duration_months: 6 },
        { stage: "正式水手/机工（散货/集装箱）", monthly_cny_range: [8800, 11800], highlight: "在船包吃住，年净存8-10万", duration_months: 6 },
        { stage: "持特殊合格证（远洋油化/LNG）", monthly_cny_range: [12000, 15000], highlight: "高危高溢价特种船型", duration_months: 12 }
      ],
      deal_breakers: [
        "单次合同期长达8个月，跨洋期间常有10-20天无手机信号，孤独感极强",
        "机工需忍受40℃+高温与高分贝机舱噪音；水手需适应高空作业与倒时差",
        "前6个月见习期津贴极低（仅1500-3000元），需自备半年家庭开销缓冲"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [25000, 38000],
        scam_alert: "《海员外派管理规定》第30条铁律：合法外派机构严禁向海员收取中介费或押金！凡收2-4万所谓‘包上船安置费’均属违规转包或仅办四小证骗局。"
      }
    }
  },
  {
    path_id: "PATH_002",
    title: "特种设备场内专用机动车辆：叉车司机（代号 N1）",
    batch_id: 'BATCH_1',
    policy_update_month: "常年稳定（TSG Z6001 考核规则）",
    pk_arena: 'ADULT_PK',
    domain: 'CERT_TRADES',
    identity_group: ['MIDLIFE_35_55', 'YOUTH_18_35'],
    core_goals: ['URGENT_30D_CASH', 'DAILY_HOME_FAMILY'],
    scenario_tags: ["35+被裁", "大专蓝领", "负债重启"],
    category: ["中年托底", "国家准入技能", "本地稳定就业"],
    status_light: "GREEN",
    last_verified_date: "2026-11-11",
    includes_free_board_lodging: false,
    requires_night_shift: true,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: true,
    keywords: ["叉车", "N1", "物流", "仓库", "高位叉车", "极速拿证", "每天回家"],
    diy_action_steps: [
      "第一步：登录当地市级市场监督管理局官网或特种设备检验研究院（特检院）网站，查询本市备案的特种设备作业人员考试机构名单。",
      "第二步：直接联系特检院核准备案考点报名 N1（叉车司机）初审，缴纳省级财政核定考试费（100-230元）及实操场地练车费（700-1300元）。",
      "第三步：完成70分及格的机考理论与桩考/叉货实操，拿绿皮《中华人民共和国特种设备作业人员证》（代号N1，全国特设平台可查）。",
      "第四步：先去中小型制造厂或建材仓做1-2个月平叉兼理货攒真车手感，切勿轻信招聘平台上‘零经验月薪9000招叉车学徒’的贷款培训套路。"
    ],
    pk_profile: {
      short_name: "002 特种叉车司机 (N1)",
      badge: "30天极速救急 · 每天回家",
      official_cost_avg: 1200,
      prep_months: 0.8,
      prep_label: "15-25天练车+市场监管局统考",
      hard_threshold: "18-60岁 · 初中起 · 四肢健全无眩晕",
      intern_months: 2,
      intern_monthly_net: 4800,
      intern_label: "前2个月小厂平叉练窄通道真车手感",
      regular_monthly_net: 8200,
      regular_range: [6000, 10000],
      on_job_living_expense: 2200,
      working_months_per_year: 11.5,
      family_separation: {
        level: 'LOW',
        text: "极低：本地就业每天下班回家，可随时照看家庭老人与孩子"
      },
      body_toll: "8-12米高位叉车长期仰头易患颈椎病；冷链仓需耐受 -18℃ 低温；物流大仓多为两班倒",
      ceiling_3yr: "熟练高叉工/冷链叉车工（月入稳定8k-1w），或转物流仓储班组长，但难实现大额暴富储蓄",
      agency_trap_diff: 3500,
      verdict_fit: [
        "存款见底（低于5000元），必须在 30 天内见到回头钱养家糊口的人",
        "35-50岁厌倦外卖/网约车风吹日晒与算法罚款，想进正规大仓交五险一金",
        "死守“绝不离开家人身边”底线的家庭顶梁柱"
      ],
      verdict_avoid: [
        "希望在 2-3 年内快速攒出 30 万以上现金一次性还清巨额债务的人",
        "患有严重颈椎间盘突出或无法接受物流园夜班倒班的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 60,
      education_min: "初中及以上",
      physical_constraints: ["无色盲色弱", "四肢健全", "无眩晕症及器质性心脏病"],
      prep_duration_days: { min: 15, max: 30 },
      official_zero_markup_cost_cny: {
        total_min: 800,
        total_max: 1600,
        breakdown: [
          { item: "省级财政/发改委核定特种设备考试费", cost_cny: "100 - 230" },
          { item: "备案培训点实操练车与教材费", cost_cny: "700 - 1,300" }
        ]
      },
      official_portal_url: "http://cnse.e-cqs.cn",
      official_portal_name: "全国特种设备公示信息查询平台",
      l1_l2_sources: [
        { level: "L1", doc_name: "《特种设备作业人员考核规则》（TSG Z6001-2019）", authority: "国家市场监督管理总局", source_url: "https://www.samr.gov.cn" },
        { level: "L1", doc_name: "《国家职业资格目录（2021年版）》技能人员职业资格第12项（特种设备安全管理和作业人员）", authority: "人力资源和社会保障部", source_url: "https://www.mohrss.gov.cn" },
        { level: "L2", doc_name: "各省市特种设备检验研究院（特检院）考核公示与收费标准", authority: "地方市场监管局 / 特检院", source_url: "http://cnse.e-cqs.cn" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 头部物流枢纽仓招聘薪资单与 L4 蓝领平台抽样，受城市级别与车型（平叉/高叉）影响显著。",
      net_income_stages: [
        { stage: "新手过渡期（前1-3个月）", monthly_cny_range: [4500, 5500], highlight: "小厂普工兼平叉，攒真车手感", duration_months: 3 },
        { stage: "熟练平叉工（制造业/普通仓）", monthly_cny_range: [5500, 7500], highlight: "常规白班或两班倒", duration_months: 6 },
        { stage: "熟练高位叉车工（电商大仓/冷链）", monthly_cny_range: [7500, 10000], highlight: "8-12米高空精准对位，计件高薪", duration_months: 12 }
      ],
      deal_breakers: [
        "考场拿证后缺乏窄通道经验，大仓普遍拒招纯新手，存在1-3个月低薪练手断档期",
        "高薪高位叉车（8-12米）长期仰头作业易引发颈椎病；冷链仓需耐受-18℃低温",
        "顺丰/京东等干线物流枢纽普遍执行两班倒或常夜班制度"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [3800, 5800],
        scam_alert: "唯一合法发证机关为‘市场监督管理局’且代号为N1。凡宣称‘免考包过’发协会证均为假证；凡以‘高薪招学徒’名义诱导办数千元培训分期贷款均为招转培骗局。"
      }
    }
  },
  {
    path_id: "PATH_003",
    title: "公办中本贯通（3年中职免学费 + 4年公办应用型本科）",
    batch_id: 'BATCH_2',
    policy_update_month: "每年 4-5 月（各省市中考提前批简章发布期）",
    pk_arena: 'STUDENT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['STUDENT_15_18'],
    core_goals: ['BIAN_ZHI_STABLE', 'DAILY_HOME_FAMILY'],
    scenario_tags: ["15岁中考分流", "普高线边缘", "高性价比本科"],
    category: ["学生升学暗道", "公办全日制本科", "省下25万民办学费"],
    status_light: "GREEN",
    last_verified_date: "2026-11-11",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["中考", "初三", "15岁", "中本贯通", "3+4", "普高线", "本科", "民办高中"],
    diy_action_steps: [
      "第一步：中考前查阅本省市教育考试院发布的《中等职业学校与本科高校“3+4”中本贯通培养试点招生计划》（京沪苏浙鲁粤川等省市均在提前批或第一批设志愿）。",
      "第二步：认准公办国家级重点中职与对口公办应用型本科高校（优先选轨道交通、机电一体化、护理、智能制造等硬工科专业）。",
      "第三步：凭中考成绩在当地考试院官网提前批填报（严禁相信任何宣称收8万元买‘中本贯通内部扩招名额’的招生贩子）。",
      "第四步：前3年在中职阶段紧盯语数英+专业技能‘转段统考’（通过率通常在90%以上），转段成功后直接升入对口公办本科读大一至大四。"
    ],
    pk_profile: {
      short_name: "003 中本贯通 (7年本科)",
      badge: "避开高考肉搏 · 省下25万民办学费",
      official_cost_avg: 6000,
      prep_months: 36,
      prep_label: "前3年中职免学费+转段升公办本科",
      hard_threshold: "14-16岁 · 试点省市户籍 · 中考普高线上下",
      intern_months: 6,
      intern_monthly_net: 4800,
      intern_label: "大四校企合作带薪顶岗实习",
      regular_monthly_net: 6800,
      regular_range: [5500, 9000],
      on_job_living_expense: 1800,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "极低：省内或本市公办院校就读，周末及寒暑假正常回家"
      },
      body_toll: "无高危体力损耗，但前3年中职学风参差不齐，需家长严抓自制力防沉迷手机",
      ceiling_3yr: "获全日制普通本科文凭+学士学位，可正常考公、考研或进入轨交/三甲医院/国企技术岗",
      agency_trap_diff: 80000,
      verdict_fit: [
        "拥有京沪苏浙鲁等试点地户籍，中考预估在普高线边缘（差10-20分或刚过线）",
        "孩子动手能力尚可、不排斥工科/护理/轨交，但应试刷题能力拼不过重点高中卷王",
        "家庭不想掏25-35万去读民办高中+民办三本，追求极高教育ROI"
      ],
      verdict_avoid: [
        "孩子在15岁时对所报具体专业（如护理、学前教育）有强烈生理厌恶",
        "有极深的“名校第一学历情结”，未来非顶尖央企总部或顶级投行不进的家庭"
      ]
    },
    track_a_hard_facts: {
      age_min: 14,
      age_max: 17,
      education_min: "应届初中毕业生（中考成绩达标）",
      physical_constraints: ["按所报工科/医护专业执行《普通高等学校招生体检工作指导意见》"],
      prep_duration_days: { min: 30, max: 60 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 6000,
        breakdown: [
          { item: "前3年公办中职阶段国家免学费政策", cost_cny: "0 (全免学费)" },
          { item: "后4年公办应用型本科阶段学年学费", cost_cny: "4,500 - 6,000 / 年" },
          { item: "公办学校住宿费及教材杂费", cost_cny: "1,200 - 1,800 / 年" }
        ]
      },
      official_portal_url: "https://www.chsi.com.cn",
      official_portal_name: "阳光高考 / 各省市教育考试院官网",
      l1_l2_sources: [
        { level: "L1", doc_name: "《教育部关于推进中等和高等职业教育协调发展的指导意见》", authority: "中华人民共和国教育部" },
        { level: "L1", doc_name: "《中华人民共和国职业教育法》（2022年修订·打通职教本科贯通通道）", authority: "全国人大常委会" },
        { level: "L2", doc_name: "各省市教委年度《中本贯通培养模式招生计划与转段考核办法》", authority: "省级教育考试院" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 上海/江苏/山东等地中本贯通毕业生就业质量报告与家长追踪采集，省下民办高昂学费是最大确定性红利。",
      net_income_stages: [
        { stage: "大四校招顶岗实习期", monthly_cny_range: [4000, 5200], highlight: "对口国企/轨交/医院实习津贴", duration_months: 6 },
        { stage: "本科毕业1-2年（应用工科/护理）", monthly_cny_range: [6000, 8000], highlight: "持全日制本科双证+高级工证上岗", duration_months: 12 },
        { stage: "毕业3-5年技术骨干或考公上岸", monthly_cny_range: [8000, 12000], highlight: "与普通二本同享考公考研法定资格", duration_months: 12 }
      ],
      deal_breakers: [
        "15岁中考填志愿时即锁死未来7年本科专业，升入本科后严禁跨专业转系",
        "第3年末必须通过省级‘转段统考’（文化课+技能），存在约5%-10%未过线被淘汰仅拿中专文凭的风险",
        "本科毕业证内页会注明‘中职与本科贯通培养’或‘3+4贯通’字样，极少数唯名校论外企会卡简历"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [50000, 120000],
        scam_alert: "中本贯通100%走省市教育考试院中考统招提前批投档，分数线公开透明！凡宣称花5-12万可办‘计划外中本贯通点招指标、低分保录’全是伪造学籍或五年制非统招假班骗局。"
      }
    }
  },
  {
    path_id: "PATH_004",
    title: "国家公费定向医学生 / 基层农技生（免学费倒贴补助 + 毕业直接入编）",
    batch_id: 'BATCH_2',
    policy_update_month: "每年 5-6 月（高考提前批志愿填报期）",
    pk_arena: 'STUDENT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['STUDENT_15_18', 'YOUTH_18_35'],
    core_goals: ['BIAN_ZHI_STABLE', 'DAILY_HOME_FAMILY'],
    scenario_tags: ["18岁高考分流", "二本线下托底", "毕业直入事业编"],
    category: ["学生升学暗道", "国家公费带编", "零学费倒贴补助"],
    status_light: "GREEN",
    last_verified_date: "2026-11-11",
    includes_free_board_lodging: true,
    requires_night_shift: false,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["高考", "高三", "18岁", "公费医学生", "定向生", "事业编", "免学费", "农技生"],
    diy_action_steps: [
      "第一步：高考出分后，立即在省教育考试院官网查阅《农村订单定向免费医学生 / 基层农技推广人才定向培养计划》（分5年制本科与3年制公办专科提前批）。",
      "第二步：确认考生本人及父母户籍符合定向县（区）户籍要求，在高考志愿【提前批】第一志愿填报对口公办医学院校或农业院校。",
      "第三步：投档录取后，直接与定向县卫健局/农业农村局、人社局及高校签署《定向就业培养三方协议书》（在校全免学费住宿费，且按月发放生活补助）。",
      "第四步：毕业后直接回生源县由人社局与编办落实乡镇卫生院/农技站事业编制，严守6年基层服务契约，在岗期间考取执业（助理）医师证。"
    ],
    pk_profile: {
      short_name: "004 公费定向生 (0学费+直接入编)",
      badge: "大学倒贴补助 · 毕业直入乡镇事业编",
      official_cost_avg: 0,
      prep_months: 36,
      prep_label: "3年公办专科/5年本科全免费+发补贴",
      hard_threshold: "17-20岁 · 定向县户籍 · 高考提前批签6年服务协议",
      intern_months: 6,
      intern_monthly_net: 3500,
      intern_label: "毕业入编首年乡镇卫生院/农技站见习期",
      regular_monthly_net: 4800,
      regular_range: [4200, 6500],
      on_job_living_expense: 800,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "极低：直接分配回生源地本县乡镇事业编，离父母家极近"
      },
      body_toll: "基层乡镇卫生院需承担大量公共卫生下乡随访、慢病建档填表及值班任务，精神较枯燥",
      ceiling_3yr: "服务满6年（含规培）且考取执业医师后，可流动至县级医院或报考全科医学研究生，终身铁饭碗",
      agency_trap_diff: 15000,
      verdict_fit: [
        "高考分数卡在二本线下、公办大专线上，家里经济拮据、急需“毕业即有铁饭碗”托底",
        "孩子性格沉稳恋家，愿意留在老家县城/乡镇过安稳日子，不向往北上广深漂泊",
        "看重“公办事业编制+五险一金”的终身确定性，胜过看重高昂账面月薪"
      ],
      verdict_avoid: [
        "孩子心气极高、渴望去一二线大城市闯荡或毕业后立刻脱产考全日制研究生",
        "晕血、极度排斥基层医疗护理或农业下乡工作"
      ]
    },
    track_a_hard_facts: {
      age_min: 16,
      age_max: 22,
      education_min: "应届高中毕业生（参加普通高考提前批）",
      physical_constraints: ["无色盲色弱", "符合医学/农学类高校高考体检标准"],
      prep_duration_days: { min: 15, max: 30 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 600,
        breakdown: [
          { item: "公办高校在校期间学费与住宿费", cost_cny: "0 (国家财政全额免除)" },
          { item: "财政每年倒贴发放定额生活费补助", cost_cny: "倒贴 +3,000 至 +6,000 / 年" },
          { item: "高考提前批定向体检及协议公证杂费", cost_cny: "100 - 500" }
        ]
      },
      official_portal_url: "https://gaokao.chsi.com.cn",
      official_portal_name: "教育部阳光高考平台 / 各省考试院提前批",
      l1_l2_sources: [
        { level: "L1", doc_name: "《关于进一步做好农村订单定向医学生免费培养工作的意见》（教高〔2015〕6号）", authority: "教育部 / 国家卫健委 / 财政部 / 人社部 / 中编办" },
        { level: "L1", doc_name: "《关于加强基层专业技术人才队伍建设的意见》（落实定向生直接入编）", authority: "人力资源和社会保障部" },
        { level: "L2", doc_name: "各省卫健委、农业农村厅年度基层定向委培生招生计划及编制落实公告", authority: "省级卫健委 / 省人社厅" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 中西部及山东/江苏/四川乡镇卫生院在编定向生工资单核验，五险一金齐全但现金账面工资不高。",
      net_income_stages: [
        { stage: "在校3-5年读书期（零学费+领补助）", monthly_cny_range: [400, 600], highlight: "免除全部学杂住宿费，国家每月发生活补贴", duration_months: 6 },
        { stage: "毕业入编前1-2年（乡镇卫生院/农技站）", monthly_cny_range: [3800, 4800], highlight: "正式事业编制，足额五险一金+乡镇津贴", duration_months: 12 },
        { stage: "考取执业医师/中级职称后（满6年服务期）", monthly_cny_range: [5500, 8000], highlight: "含公卫绩效与年终考核奖，县域高地位", duration_months: 12 }
      ],
      deal_breakers: [
        "人事档案与编制强制锁死在定向乡镇满6年，期间严禁辞职、严禁脱产考全日制研究生，违约须退还全部培养费+50%违约金并记入全国医务人员失信黑名单",
        "定向医学生入编后若在规定年限内连续考不出《执业（助理）医师资格证》，将被依法解除聘用合同并退编",
        "乡镇卫生院工作以老年慢病管理、下村体检建档为主，向往大三甲医院高精尖外科手术者会有强烈心理落差"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [9800, 39800],
        scam_alert: "公费定向生计划直接刊登在各省教育考试院发给每位考生的《高考志愿填报指南》提前批目录第1-5页，查分即可免费填报！切勿花1-3万元找所谓‘高价志愿规划大师’购买公开信息。"
      }
    }
  },
  {
    path_id: "PATH_005",
    title: "德国双元制带薪职业教育（Ausbildung · 护理/机电/酒店）",
    batch_id: 'BATCH_4',
    policy_update_month: "每年 8-9 月主入学季 & 2-3 月春季班",
    pk_arena: 'ADULT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35'],
    core_goals: ['SAVE_300K_3YR'],
    scenario_tags: ["二本失业", "考研失利", "30岁重启"],
    category: ["低成本出海", "带薪学手艺", "欧洲工签永居"],
    status_light: "GREEN",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: false,
    requires_night_shift: true,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: true,
    keywords: ["德国", "双元制", "Ausbildung", "出国", "海外", "欧洲", "德语", "护理", "机电", "考研失利", "30岁重启"],
    diy_action_steps: [
      "第一步：在国内用6-8个月通过网课或自学考出歌德学院/Telc德语 B1 或 B2 证书（考试费约1800-2400元），这是DIY省下5万中介费的唯一核心。",
      "第二步：将高中/大专/本科毕业证做公证及外交部海牙认证（Apostille）并附德文翻译件（总成本约800-1500元）。",
      "第三步：直接登录德国联邦劳工局官方职位库 (arbeitsagentur.de) 或 Make it in Germany 门户，筛选带‘Ausbildung’标识的养老护理(Pflegefachmann)、机电或酒店学徒岗，直投德文简历与动机信。",
      "第四步：视频面试拿到德国雇主签署的《双元制培训合同》(Ausbildungsvertrag，月津贴通常≥1050欧元免冻结保证金)，直接赴德国驻华使领馆递交§16a职业培训签证（规费75欧元）。"
    ],
    pk_profile: {
      short_name: "005 德国双元制 (Ausbildung)",
      badge: "免学费带薪学徒 · 毕业留欧拿永居",
      official_cost_avg: 10500,
      prep_months: 7,
      prep_label: "6-8个月国内脱产死磕德语B1/B2+直投签证",
      hard_threshold: "18-35岁 · 高中/中专起(可倒读) · 德语B1/B2",
      intern_months: 6,
      intern_monthly_net: 7200,
      intern_label: "赴德首年带薪学徒试用期(税后约900-1100欧)",
      regular_monthly_net: 8500,
      regular_range: [6500, 9500],
      on_job_living_expense: 5200,
      working_months_per_year: 12,
      family_separation: {
        level: 'HIGH',
        text: "极高：需远赴德国连续生活学习 3 年，每年带薪年假 24-30 天可回国探亲一次"
      },
      body_toll: "前6个月德语全天候听说高压极易焦虑失眠；若选护理方向需承担替老人翻身、洗浴、换尿布等体力与心理挑战",
      ceiling_3yr: "3年毕业转正全职德国注册护士/机电技师，税后月薪跃升至 ¥17,000 - ¥21,000（约2300-2800欧），再工作2年即可申德国永居",
      agency_trap_diff: 45000,
      verdict_fit: [
        "20-34岁二本/大专失业或考研失利，厌倦国内35岁职场年龄歧视与无偿加班内卷的人",
        "有极强的语言学习毅力，能坐得住冷板凳花半年把德语磕到 B1/B2 水平的人",
        "手头仅有 1.5万-3万 启动金（不够30万传统留学担保金），想靠带薪学徒津贴在欧洲自给自足的人"
      ],
      verdict_avoid: [
        "连每天背3小时德语单词都坚持不下来，妄想“零德语直接去德国拿高薪”的人",
        "对老年临床生活护理有生理排斥，却又因为文科背景只能强报护理岗的人",
        "希望头1-2年就能往国内家里寄回大笔人民币还债的人（学徒期津贴基本刚够在德租房吃饭自给自足，第4年转正后才开始大额结余）"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 35,
      education_min: "高中或中专及以上（允许本专科倒读）",
      physical_constraints: ["身体健康无传染病", "德语达到 B1 或 B2 水平"],
      prep_duration_days: { min: 180, max: 270 },
      official_zero_markup_cost_cny: {
        total_min: 7500,
        total_max: 13500,
        breakdown: [
          { item: "歌德学院德语 B1/B2 官方考级费", cost_cny: "1,800 - 2,400" },
          { item: "毕业证公证 + 外交部海牙认证(Apostille) + 德文翻译", cost_cny: "800 - 1,500" },
          { item: "德国驻华使馆职业培训签证规费 (75欧元)", cost_cny: "580" },
          { item: "赴德单程机票及首月落脚过渡金", cost_cny: "4,500 - 8,500" }
        ]
      },
      official_portal_url: "https://www.make-it-in-germany.com",
      official_portal_name: "德国联邦政府官方人才门户 / 联邦劳工局职位库",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "德国《居留法》(AufenthG) §16a 职业培训居留许可及新《技术移民法》",
          authority: "德国联邦内政部 / 联邦劳工局 (BA)"
        },
        {
          level: "L1",
          doc_name: "德国驻华大使馆《职业培训签证申请须知与免冻结金月津贴标准》",
          authority: "德意志联邦共和国驻华大使馆"
        },
        {
          level: "L2",
          doc_name: "德国联邦职业教育研究所 (BIBB) 年度各行业法定学徒津贴公报",
          authority: "Bundesinstitut für Berufsbildung (BIBB)"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 在德双元制学徒合同与税后工资单及 L4 BIBB 官方统计中位数，受所选行业（护理远高于酒店）与联邦州差异影响。",
      net_income_stages: [
        { stage: "国内脱产死磕德语期 (前6-8个月)", monthly_cny_range: [0, 0], highlight: "国内全职备考德语B1/B2，纯消耗期", duration_months: 7 },
        { stage: "在德3年带薪学徒期 (税后到手津贴)", monthly_cny_range: [6500, 9500], highlight: "覆盖德国房租伙食自给自足，微有结余", duration_months: 36 },
        { stage: "3年毕业转正全职技师/护士 (税后到手)", monthly_cny_range: [17000, 21000], highlight: "每周38-40小时，享30天带薪年假与工签", duration_months: 24 }
      ],
      deal_breakers: [
        "前6个月为法定试用期(Probezeit)，若德语听说太差听不懂排班指令，雇主有权无理由解约导致签证作废",
        "文科生最易申到的护理岗需亲自为老人翻身、洗浴、换尿布，抗拒身体护理者极易崩溃",
        "出国前需经历6-9个月枯燥的全日制德语学习至B1/B2，半途而废率极高"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [40000, 70000],
        scam_alert: "德国联邦劳工局官网(arbeitsagentur.de)所有双元制职位100%免费向全球个人开放直投！中介收4-7万只是代发邮件。警惕黑中介将你塞进偏远小镇血汗中餐馆或私人黑诊所充当廉价杂工。"
      }
    }
  },
  {
    path_id: "PATH_006",
    title: "国家基层服务专项：特岗教师 / 高校毕业生“三支一扶”",
    batch_id: 'BATCH_3',
    policy_update_month: "每年 4-6 月（各省招募公告集中发布期）",
    pk_arena: 'STUDENT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['YOUTH_18_35'],
    core_goals: ['BIAN_ZHI_STABLE', 'STUDY_ON_DUTY'],
    scenario_tags: ["二本失业", "考研失利", "考公落榜"],
    category: ["体制降维上岸", "期满转编/定向考公", "考研加10分"],
    status_light: "GREEN",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: true,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["三支一扶", "特岗教师", "考公落榜", "考研失利", "二本失业", "应届生", "事业编", "学费代偿", "考研加分"],
    diy_action_steps: [
      "第一步：每年3-5月盯紧本省人事考试网或教育厅官网发布的《高校毕业生“三支一扶”计划招募公告》与《特岗教师招聘公告》（认准应届生或择业期未就业资格）。",
      "第二步：网购80元《职业能力倾向测验+综合应用能力/公共基础知识》教材自刷真题1-2个月，直接在省人事考试网报名（报名费0-100元，切勿报3万元天价协议班）。",
      "第三步：上岸到岗后申领 ¥3,000 元一次性安家费补贴，并向学校/县资助中心递交《基层就业学费补偿国家助学贷款代偿申请表》（分年退还大学学费最高2.4万-3.6万）。",
      "第四步：特岗教师3年服务期满考核合格直接办理正式教师事业编制；三支一扶2年期满按本省政策直接考核入编，或以‘四项目人员定向岗（1:1至1:3极低竞争比）’降维考公，考研初试总分直接加10分！"
    ],
    pk_profile: {
      short_name: "006 特岗教师 / 三支一扶",
      badge: "0成本体制缓冲 · 代偿学费+期满入编",
      official_cost_avg: 100,
      prep_months: 2,
      prep_label: "1-3个月自刷公基/职测+省人事网招考",
      hard_threshold: "18-30岁 · 全日制大专/本科 · 严卡应届/择业期",
      intern_months: 24,
      intern_monthly_net: 3600,
      intern_label: "2-3年乡镇基层服务期(包住+发安家费+退还大学学费)",
      regular_monthly_net: 5800,
      regular_range: [4800, 8000],
      on_job_living_expense: 900,
      working_months_per_year: 12,
      family_separation: {
        level: 'MEDIUM',
        text: "中等：通常报考本省或本市下辖乡镇岗位，住乡镇周转宿舍，周末可回县城/市区父母家"
      },
      body_toll: "无重体力损耗，但基层乡镇政府迎检台账、乡村振兴文书表格繁杂；农村特岗需适应留守儿童教学管理",
      ceiling_3yr: "特岗3年直接转为在编教师；三支一扶期满转乡镇事业编、考公走‘定向招录岗’（避开千人独木桥）或考研初试总分+10分逆袭名校",
      agency_trap_diff: 29800,
      verdict_fit: [
        "21-26岁刚毕业或处于2-3年择业期内，考研失利、省考100:1落榜的普通二本/大专毕业生",
        "大学背有助学贷款（服务满期国家直接代偿最高3.6万学费），急需体制内身份过渡与考公定向特权的人",
        "手头几乎0存款，需要包住且立刻有财政津贴与五险一金托底的年轻人"
      ],
      verdict_avoid: [
        "毕业已满3年以上且交过多年企业社保的往届社会人（大多省份三支一扶直接卡死报名资格）",
        "无法忍受乡镇基层生活环境、幻想一进乡镇就能月薪过万的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 30,
      education_min: "全日制普通高校大专/本科及以上（严卡应届或择业期）",
      physical_constraints: ["符合公务员录用或教师资格体检标准"],
      prep_duration_days: { min: 30, max: 90 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 150,
        breakdown: [
          { item: "省级人事考试网笔试报名费 (多数省份免收)", cost_cny: "0 - 100" },
          { item: "录用后国家发放一次性安家费补贴", cost_cny: "倒贴 +3,000" },
          { item: "基层服务满3年大学学费补偿/助学贷款代偿", cost_cny: "倒贴 +24,000 ~ 36,000" }
        ]
      },
      official_portal_url: "https://www.mohrss.gov.cn",
      official_portal_name: "人社部高校毕业生三支一扶专栏 / 各省人事考试网",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "人社部、中组部等十部门《关于实施第五轮高校毕业生“三支一扶”计划的通知》（人社部发〔2026〕46号 · 2026-2030年周期）",
          authority: "人力资源和社会保障部 / 中央组织部",
          source_url: "https://www.mohrss.gov.cn"
        },
        {
          level: "L1",
          doc_name: "教育部、财政部、人社部、中央编办《农村义务教育阶段学校教师特设岗位计划通知》",
          authority: "中华人民共和国教育部",
          source_url: "https://www.moe.gov.cn"
        },
        {
          level: "L1",
          doc_name: "《高等学校毕业生赴基层单位就业学费补偿国家助学贷款代偿办法》",
          authority: "财政部 / 教育部"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 各省在岗三支一扶/特岗教师津贴流水与期满安置公示，三支一扶能否直接入编高度取决于服务地县区当年是否有空编。",
      net_income_stages: [
        { stage: "备考与招录公示期 (1-3个月)", monthly_cny_range: [0, 0], highlight: "省人事考试网报名笔试面试，几乎零成本", duration_months: 2 },
        { stage: "2-3年乡镇基层服务期 (财政补贴)", monthly_cny_range: [2800, 5000], highlight: "享五险一金+乡镇周转房+代偿大学学费", duration_months: 24 },
        { stage: "期满转正入编/考取定向公务员后", monthly_cny_range: [4800, 8000], highlight: "正式编制工资+年终绩效+乡镇工作补贴", duration_months: 12 }
      ],
      deal_breakers: [
        "【致命硬门槛】三支一扶严卡“应届生或毕业2-3年择业期内未就业毕业生”，已工作多年的大龄往届生无报名资格",
        "部分编制满额的县区，三支一扶2年期满不能直接给事业编，仍需参加定向公务员/事业编招考（特岗教师3年留任转编更稳）",
        "乡镇政府基层台账、迎检文书极多，且22-25岁黄金期驻扎偏远乡镇，社交与择偶圈极窄"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [19800, 49800],
        scam_alert: "公考机构常忽悠焦虑家长签3-5万‘不过退费协议班’（实则套取培训贷或资金池利息，退费扣高额杂费）。基层专项考题远比省考简单，全套教材网购仅需80元！"
      }
    }
  },
  {
    path_id: "PATH_007",
    title: "消防设施操作员（中级/四级 · 消防控制室监控方向）",
    batch_id: 'BATCH_1',
    policy_update_month: "每月批次考核（全年开放排队）",
    pk_arena: 'ADULT_PK',
    domain: 'SAFE_DESK_GUARD',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55', 'SENIOR_50_PLUS'],
    core_goals: ['STUDY_ON_DUTY', 'DAILY_HOME_FAMILY', 'BIAN_ZHI_STABLE'],
    scenario_tags: ["35+被裁", "全职妈妈重返", "低体力托底", "大专蓝领"],
    category: ["国家准入资格", "室内轻体力", "法定强制配岗"],
    status_light: "GREEN",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: false,
    requires_night_shift: true,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["消防", "消控室", "中级消防", "四级", "监控", "坐班", "看书", "备考", "全职妈妈", "宝妈", "低体力", "腰突友好"],
    diy_action_steps: [
      "第一步：直接登录国家消防救援局唯一报名门户‘消防职业技能鉴定考试网’ (xfhyjd.119.gov.cn) 免费注册排号（切勿交4980元让中介代报，务必选【中级/四级·消防控制室监控方向】，不要报初级五级）。",
      "第二步：无需脱产辞职！边干原工作或带娃，边花150-300元用线上3D虚拟仿真实操系统练习火灾报警控制器判读、联动主机切换与防排烟系统操作。",
      "第三步：收到鉴定站短信通知后，直接向本省消防救援总队指定账户缴纳核定考试费（190-350元），参加机考理论与现场/仿真机考实操。",
      "第四步：拿中级（四级）证后，入职大型商业综合体、三甲医院或甲级写字楼消控室（入职首日务必检查主机是否正常、是否严格执行法定双人持证值班），参保满期后在人社App申领 +1,500 元国家技能提升补贴！"
    ],
    pk_profile: {
      short_name: "007 消防设施操作员 (四级监控)",
      badge: "室内轻体力吹空调 · 考过倒贴1500补贴",
      official_cost_avg: 450,
      prep_months: 1.5,
      prep_label: "1-2个月不脱产刷3D仿真+官网排号",
      hard_threshold: "18-58岁 · 高中/中专起 · 无色盲听力嗅觉正常",
      intern_months: 1,
      intern_monthly_net: 4300,
      intern_label: "首月物业/工厂消控室熟悉本单位报警主机点位",
      regular_monthly_net: 6000,
      regular_range: [4000, 7800],
      on_job_living_expense: 1800,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "极低：本地商场/医院/写字楼室内坐班，12h两班倒或24h上一休二，白天空闲多可顾家"
      },
      body_toll: "室内吹空调零重体力消耗；但消控室有高清监控直连抽查，夜间值班严禁打瞌睡与离岗，且背负法定消防安全责任",
      ceiling_3yr: "一线写字楼/三甲医院消控领班或增考低压电工双证合流（月入5500-7800元），或在岗备考上岸",
      agency_trap_diff: 4800,
      verdict_fit: [
        "35+被裁白领、全职妈妈重返职场或腰椎不好人群，需要一份“室内轻体力、吹空调坐班、不搬重物”的法定刚需岗",
        "无需脱产即可备考，考费仅200多元且考过还能领人社局 1,500 元国家补贴的零成本突围者"
      ],
      verdict_avoid: [
        "遇到“消防主机常年故障屏蔽、水泵无水、只派1人单岗顶班”的黑心物业却不敢立刻辞职的人（极易火灾背锅坐牢）",
        "轻信黑中介“考完证不用上班，每年光挂靠费躺赚4万”幻觉的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 58,
      education_min: "高中毕业（或中专、职高、技校同等学力）及以上",
      physical_constraints: ["无色盲色弱", "听力与嗅觉正常", "四肢及手指操作灵活"],
      prep_duration_days: { min: 30, max: 75 },
      official_zero_markup_cost_cny: {
        total_min: 190,
        total_max: 1200,
        breakdown: [
          { item: "各省发改委核定消防职业技能鉴定考试费(四级)", cost_cny: "190 - 350" },
          { item: "线上3D虚拟仿真实操练习系统与题库(自选)", cost_cny: "150 - 300" },
          { item: "考取中级证后人社局发放国家技能提升补贴", cost_cny: "倒贴 +1,500" }
        ]
      },
      official_portal_url: "https://xfhyjd.119.gov.cn",
      official_portal_name: "消防职业技能鉴定考试网（国家消防救援局唯一报名门户）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "《国家职业资格目录（2021年版）》技能人员职业资格第4项准入类：消防设施操作员",
          authority: "人力资源和社会保障部 / 应急管理部",
          source_url: "https://www.mohrss.gov.cn"
        },
        {
          level: "L1",
          doc_name: "国家标准《消防控制室通用技术要求》(GB 25506) 与《消防设施操作员国家职业技能标准》",
          authority: "国家市场监督管理总局 / 应急管理部"
        },
        {
          level: "L2",
          doc_name: "各省消防救援总队职业技能鉴定站月度考核公告与收费公示",
          authority: "消防行业职业技能鉴定指导中心",
          source_url: "https://xfhyjd.119.gov.cn"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 一二线城市商业综合体、医院及产业园物业消控员真实排班工资条采集，受城市等级与排班制（12h/24h）影响。",
      net_income_stages: [
        { stage: "官网个人报名排队与备考期 (1-2个月)", monthly_cny_range: [0, 0], highlight: "无需脱产，可边干原工作边刷3D仿真软件", duration_months: 2 },
        { stage: "二三线城市物业/工厂消控值班员", monthly_cny_range: [4000, 5200], highlight: "室内坐班吹空调，交五险，工作强度极低", duration_months: 6 },
        { stage: "一线城市写字楼/三甲医院消控员(或兼低压电工)", monthly_cny_range: [5500, 7800], highlight: "大型甲级写字楼与医院合规要求极严，待遇稳定", duration_months: 12 }
      ],
      deal_breakers: [
        "【严防背锅坐牢红线】若入职发现单位消防主机常年故障屏蔽、水泵无水，或违反法定双人值班只让你1人顶岗，必须立刻辞职！否则发生火灾当班消控员会被直接行政拘留甚至判刑",
        "普遍实行12小时两班倒或24小时上一休二，消控室有高清监控直连抽查，夜间值班严禁打瞌睡与擅自离岗",
        "切勿报考五级/初级证（联网消控室法定要求中级/四级起），且如今全国严查人证合一打卡，不存在任何‘躺赚挂靠费’可能"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [3500, 6800],
        scam_alert: "培训机构常欺骗求职者‘个人无法报名、必须交4980元由机构代报’。实则国家消防鉴定网(xfhyjd.119.gov.cn)100%向个人开放免费注册排号，考试费仅200余元，考过还能去人社App领1500元国家补贴！"
      }
    }
  },
  {
    path_id: "PATH_008",
    title: "特种设备起重机指挥（Q1）与起重机司机（Q2·桥门式/流动式）",
    batch_id: 'BATCH_1',
    policy_update_month: "常年稳定（TSG Z6001 考核规则）",
    pk_arena: 'ADULT_PK',
    domain: 'CERT_TRADES',
    identity_group: ['MIDLIFE_35_55', 'YOUTH_18_35'],
    core_goals: ['URGENT_30D_CASH', 'DAILY_HOME_FAMILY'],
    scenario_tags: ["35+被裁", "大专蓝领", "中年托底", "全职妈妈重返"],
    category: ["国家准入资格", "港口重工高薪", "Q1指挥男女皆宜"],
    status_light: "GREEN",
    last_verified_date: "2026-11-13",
    includes_free_board_lodging: false,
    requires_night_shift: true,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["行车", "天车", "龙门吊", "起重机指挥", "司索信号工", "Q1", "Q2", "坐班", "不搬重物", "女工友好", "全职妈妈重返"],
    diy_action_steps: [
      "第一步：明确报考代号——2019年《特种设备作业人员考核规则》(TSG Z6001)实施后，原Q3-Q8已统一合并为‘Q1 起重机指挥（地面哨音/对讲机信号，无需爬高，男女皆宜）’与‘Q2 起重机司机（分桥式/门式/塔式/流动式等限项）’。",
      "第二步：登录当地市场监督管理局政务网或省级特种设备检验研究院（特检院）报名系统，选择正规备案实操基地（官方考务费+练机费合计约1,000-1,800元）。",
      "第三步：完成15-25天定点稳钩、消除吊物摇摆（Q2）或吊索具安全检查与指挥手势/旗语/音响信号（Q1）考核，取得全国特种设备公示平台 (cnse.e-cqs.cn) 可查的作业人员证。",
      "第四步：应聘本地重工机械车间（无线手柄遥控天车/Q1地面指挥）、钢贸物流园或大型港口集装箱码头（龙门吊/场桥/岸桥Q2主操）。"
    ],
    pk_profile: {
      short_name: "008 起重机指挥与司机 (Q1/Q2)",
      badge: "Q1地面指挥男女皆宜 · Q2港口高薪",
      official_cost_avg: 1400,
      prep_months: 0.7,
      prep_label: "15-25天特检院理论+实操统考",
      hard_threshold: "18-60岁 · 初中起 · 无色盲色弱/视力≥4.9",
      intern_months: 2.5,
      intern_monthly_net: 6200,
      intern_label: "新手过渡期(小厂地面Q1指挥或小吨位车间行车，前2-3个月)",
      regular_monthly_net: 9000,
      regular_range: [7500, 15000],
      on_job_living_expense: 2000,
      working_months_per_year: 11.5,
      family_separation: {
        level: 'LOW',
        text: "极低：本地重工制造厂或沿海港口上下班，Q1指挥不登高、男女皆可考，适合35-52岁平稳切入"
      },
      body_toll: "港口岸桥驾驶室悬空30-45米全程低头90度对位锁孔（易发颈腰椎劳损且如厕不便）；港口普遍24小时三班倒",
      ceiling_3yr: "沿海大型集装箱港口龙门吊/轮胎吊/岸桥司机 Q2（按集装箱自然箱计件算薪，旺季月综合可达1.5万+）",
      agency_trap_diff: 3600,
      verdict_fit: [
        "35-52岁中年被裁或全职妈妈重返职场，想考Q1地面指挥（不登高、男女皆可考）或车间小吨位行车平稳切入的人",
        "瞄准造船厂/风电塔筒厂/钢铁厂双机抬吊或沿海集装箱港口高薪计件（月入7,500-15,000元）的大专蓝领"
      ],
      verdict_avoid: [
        "极度粗心毛躁者严禁入行（吊物下方站人或钢丝绳捆绑失误导致重物坠落，直接触发《刑法》第134条重大责任事故罪）",
        "有色盲色弱、矫正视力低于4.9(0.8)或患有癫痫、高血压、眩晕症等妨碍安全作业疾病者"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 60,
      education_min: "初中及以上文化程度",
      physical_constraints: ["严禁色盲、色弱", "双目裸眼或矫正视力均在4.9(0.8)及以上", "无癫痫、高血压、眩晕症等妨碍安全作业疾病"],
      prep_duration_days: { min: 15, max: 25 },
      official_zero_markup_cost_cny: {
        total_min: 1000,
        total_max: 1800,
        breakdown: [
          { item: "省级发改委核定特种设备理论+实操考试规费", cost_cny: "130 - 260" },
          { item: "特检院或备案实操基地租机练车/指挥手势培训费", cost_cny: "850 - 1,500" }
        ]
      },
      official_portal_url: "http://cnse.e-cqs.cn",
      official_portal_name: "全国特种设备公示信息查询平台（国家市场监督管理总局）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "《国家职业资格目录（2021年版）》技能人员职业资格第12项（特种设备安全管理和作业人员）及《特种设备作业人员考核规则》（TSG Z6001-2019）附件H",
          authority: "人力资源和社会保障部 / 国家市场监督管理总局",
          source_url: "https://www.mohrss.gov.cn"
        },
        {
          level: "L1",
          doc_name: "《特种设备作业人员资格认定分类与项目》（市场监管总局2019年第3号公告）",
          authority: "国家市场监督管理总局",
          source_url: "https://www.samr.gov.cn"
        },
        {
          level: "L2",
          doc_name: "各省市特种设备检验研究院（特检院）月度考试计划及收费公示表",
          authority: "地方市场监督管理局 / 特检院",
          source_url: "http://cnse.e-cqs.cn"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 沿海集装箱港口堆场及风电/造船重工车间一线司索指挥与行车司机工资条采集，港口按吊箱量计件收入显著高于普通内陆工厂。",
      net_income_stages: [
        { stage: "新手过渡期 (小厂地面Q1指挥或小吨位车间行车，前2-3个月)", monthly_cny_range: [5500, 7000], highlight: "Q1指挥不登高、男女皆可考，适合35-52岁中年平稳切入", duration_months: 3 },
        { stage: "重工制造大厂熟手期 (造船厂/风电塔筒厂/钢铁厂双机抬吊)", monthly_cny_range: [7500, 10500], highlight: "交五险一金，重工业基地对熟练大吨位行车工需求极稳", duration_months: 6 },
        { stage: "沿海大型集装箱港口高薪期 (龙门吊/轮胎吊/岸桥司机 Q2)", monthly_cny_range: [10000, 15000], highlight: "按集装箱自然箱计件算薪，旺季赶船期月综合可达1.5万+", duration_months: 12 }
      ],
      deal_breakers: [
        "【安全责任零容错高压】吊物下方站人或钢丝绳捆绑失误导致几十吨重物坠落，直接触发《刑法》第134条重大责任事故罪，极度粗心者严禁入行",
        "【港口岸桥高空俯视颈椎病】集装箱岸桥驾驶室悬空30-45米，全程低头90度透过玻璃地板对位锁孔，极易引发严重颈椎与腰椎劳损，且班中如厕极不便",
        "【港口24小时三班倒】远洋货轮靠港不分昼夜，港口堆场普遍执行四班三运转或两班倒，生物钟紊乱"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [3500, 6500],
        scam_alert: "1. 务必认准发证机关为【市场监督管理局】且代号为 Q1/Q2 的证书（工厂和港口只认此证），切勿与住建厅建筑工地塔吊证混淆！2. 警惕收数万元吹嘘‘包进港口集团本部正式编制’的中介，社招港口司机多为与港务外包公司直签合同（同样高薪交五险一金）。"
      }
    }
  },
  {
    path_id: "PATH_009",
    title: "应急管理部特种作业：低压/高压电工证（物业工程 · 产线配电维保）",
    batch_id: 'BATCH_1',
    policy_update_month: "常年稳定（3年复审、6年换证）",
    pk_arena: 'ADULT_PK',
    domain: 'CERT_TRADES',
    identity_group: ['MIDLIFE_35_55', 'YOUTH_18_35', 'SENIOR_50_PLUS'],
    core_goals: ['URGENT_30D_CASH', 'DAILY_HOME_FAMILY', 'BIAN_ZHI_STABLE'],
    scenario_tags: ["35+被裁", "中年托底", "大专蓝领"],
    category: ["中年托底", "国家准入技能", "本地稳定就业"],
    status_light: "GREEN",
    last_verified_date: "2026-11-11",
    includes_free_board_lodging: false,
    requires_night_shift: true,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["电工", "低压电工", "高压电工", "物业", "配电房", "维修", "五险一金", "养老"],
    diy_action_steps: [
      "第一步：访问应急管理部‘特种作业操作证及安全生产知识和管理能力考核合格信息查询平台’ (cx.mem.gov.cn)，点击‘机构查询’获取本省市正规备案考试点与培训机构。",
      "第二步：先考取‘低压电工作业’操作证（应急管理部核发，3年一审、6年换证），直接去备案技校交培训及考试费（总计约600-1200元，符合失业社保条件还可申领人社技能补贴）。",
      "第三步：实操重点攻克万用表/兆欧表使用、三相异步电动机正反转控制接线及触电急救，拿证后先应聘商业综合体、医院或甲级写字楼物业工程部综合维修岗。",
      "第四步：入行满1年后增考‘高压电工作业’证（值班配电室必备），从跑腿换灯管升级为高压配电房双人值守或工厂PLC电气维保。"
    ],
    pk_profile: {
      short_name: "009 高低压电工 (物业/配电)",
      badge: "越老越稳 · 五险一金托底",
      official_cost_avg: 1000,
      prep_months: 1,
      prep_label: "20-35天备案考点实操+统考",
      hard_threshold: "18-60岁 · 初中起 · 无色盲无手抖",
      intern_months: 3,
      intern_monthly_net: 4800,
      intern_label: "前3个月写字楼/商场物业万能维修工",
      regular_monthly_net: 7400,
      regular_range: [6000, 12000],
      on_job_living_expense: 2000,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "极低：本地商场/医院/写字楼坐班，做一休一或正常轮班，顾家属性极强"
      },
      body_toll: "初级物业岗需兼顾通下水/修马桶等杂活；高压配电房需24小时双人轮值夜班；严守断电验电规程防触电",
      ceiling_3yr: "考取高压证+掌握变频器/PLC基础后跳槽工业园区设备维保主管（月入9k-1.2w），60岁前极难失业",
      agency_trap_diff: 4200,
      verdict_fit: [
        "35-55岁追求本地长期五险一金稳定工作、不想再干纯重体力搬运的人",
        "动手能力尚可，愿意从物业工程部基础杂活干起攒现场排障经验的人",
        "手头仅有几千元预算，需要1个月内低成本拿国家准入硬证的人"
      ],
      verdict_avoid: [
        "有红绿色盲（无法分辨火线零线地线颜色，直接一票否决）",
        "放不下身段，抗拒在物业工程部初期兼顾修锁、换灯管、通管道的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 60,
      education_min: "初中及以上",
      physical_constraints: ["无色盲色弱", "双手无震颤", "无器质性心脏病、癫痫及眩晕症"],
      prep_duration_days: { min: 20, max: 35 },
      official_zero_markup_cost_cny: {
        total_min: 650,
        total_max: 1350,
        breakdown: [
          { item: "省级应急管理厅核定理论+实操考试费", cost_cny: "110 - 180" },
          { item: "备案安全生产培训点实操耗材与学时费", cost_cny: "500 - 1,100" },
          { item: "社区/二级医院特种作业常规体检", cost_cny: "40 - 70" }
        ]
      },
      official_portal_url: "https://cx.mem.gov.cn",
      official_portal_name: "应急管理部特种作业信息查询平台",
      l1_l2_sources: [
        { level: "L1", doc_name: "《特种作业人员安全技术培训考核管理规定》（原安监总局令第30号）", authority: "应急管理部", source_url: "https://www.mem.gov.cn" },
        { level: "L1", doc_name: "《国家职业资格目录（2021年版）》技能人员职业资格第10项（特种作业人员准入）", authority: "人力资源和社会保障部 / 应急管理部", source_url: "https://www.mohrss.gov.cn" },
        { level: "L2", doc_name: "各省应急管理厅安全生产考试中心收费标准及备案培训点名录", authority: "省级应急管理厅", source_url: "https://cx.mem.gov.cn" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 一二线城市商业物业工程部薪资单与工业园驻场维保合同采集，物业岗重稳定、工厂岗重加班。",
      net_income_stages: [
        { stage: "初级物业万能工（仅持低压证）", monthly_cny_range: [4500, 6000], highlight: "兼顾水暖/换灯/疏通，缴纳五险", duration_months: 3 },
        { stage: "高低压双证配电值班/商超工程", monthly_cny_range: [6000, 8200], highlight: "做一休一或做二休二，工作强度低", duration_months: 6 },
        { stage: "工业设备电气维保/弱电自控熟手", monthly_cny_range: [8500, 12000], highlight: "懂变频器/PLC排障，制造业刚需", duration_months: 12 }
      ],
      deal_breakers: [
        "初级物业电工本质是‘工程杂工’，除查线路外常需兼顾修马桶、通下水、搬重物等杂活",
        "仅靠考场背题接线远远不够，零经验进小厂若无人带教，面临带电误操作触电或烧毁设备的高安全风险",
        "高压配电值班普遍要求24小时驻场轮班（夜班不可避免），且节假日需留守值班"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [3500, 6800],
        scam_alert: "上岗法定准入唯一认‘应急管理部特种作业操作证’！黑机构常把人社‘电工职业技能等级证’包装成上岗证高价兜售，或捆绑7980元所谓‘PLC大师速成班’诱骗分期贷款。"
      }
    }
  },
  {
    path_id: "PATH_010",
    title: "三甲医院免陪照护病房：规范化医疗护理员 / 康复养老照护师",
    batch_id: 'BATCH_1',
    policy_update_month: "每年 2-3 月（各省人社补贴目录更新）",
    pk_arena: 'ADULT_PK',
    domain: 'MEDICAL_CARE',
    identity_group: ['MIDLIFE_35_55', 'SENIOR_50_PLUS'],
    core_goals: ['URGENT_30D_CASH', 'SAVE_300K_3YR'],
    scenario_tags: ["35+被裁", "负债重启", "零资产储蓄"],
    category: ["零资产储蓄", "包吃住攒钱", "本地稳定就业"],
    status_light: "GREEN",
    last_verified_date: "2026-11-11",
    includes_free_board_lodging: true,
    requires_night_shift: true,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: true,
    keywords: ["护工", "护理员", "医院", "养老", "免陪病房", "包吃住", "色盲可报", "零房租"],
    diy_action_steps: [
      "第一步：查询本省卫健委、人社厅公示的‘医疗护理员培训基地’（通常设在公办卫生职业技术学院、省人民医院或市级红十字会），报名免费或低费用的政补培训班。",
      "第二步：完成健康证体检（肝功能、胸透等，约100-150元）及120-150学时临床生活照护实操考核（翻身拍背、鼻饲护理、造口清洁、轮椅转运）。",
      "第三步：优先切入三甲医院驻院正规第三方陪护公司（如泰心康护、善Care等医院中标服务商）的‘一对多无陪护病房’小组，或公建民营示范养老院。",
      "第四步：熬过前2周病房适应期后，转向骨科术后康复、心胸外科或ICU转出病房一对一专护，包住且医院食堂就餐极便宜，月净存率可达85%以上。"
    ],
    pk_profile: {
      short_name: "010 三甲医院医疗护理员",
      badge: "零房租高储蓄 · 极速回血",
      official_cost_avg: 500,
      prep_months: 0.6,
      prep_label: "15-20天卫校/红十字会政补培训",
      hard_threshold: "22-58岁 · 不限学历 · 持甲类健康证",
      intern_months: 1,
      intern_monthly_net: 5500,
      intern_label: "首月无陪护病房小组老带新轮班",
      regular_monthly_net: 8600,
      regular_range: [7200, 13000],
      on_job_living_expense: 700,
      working_months_per_year: 11,
      family_separation: {
        level: 'MEDIUM',
        text: "中等：虽在同城三甲医院，但一对一专护期间需24小时驻守病房陪护床，每单结束间隙才能回家休息"
      },
      body_toll: "直面排泄物清洁与术后翻身移位，极其考验腰背力量与心理抗恶心承受力；夜间需起夜2-4次查看患者，睡眠碎片化",
      ceiling_3yr: "重症术后/神经康复金牌专护或高端康养中心照护组长（月净入1万-1.3万，且几乎零房租开销）",
      agency_trap_diff: 5800,
      verdict_fit: [
        "手头存款不足 3000 元、急需包住且按单/按周快速结算现金流的中年破局者",
        "能彻底放下体面焦虑、不怕脏不怕累，希望在岸上实现接近船员级高储蓄率的人"
      ],
      verdict_avoid: [
        "有严重洁癖、闻到医院消毒水或排泄物气味即生理性反胃的人",
        "患有严重腰肌劳损或腰椎间盘突出（无法协助卧床患者翻身过床）"
      ]
    },
    track_a_hard_facts: {
      age_min: 22,
      age_max: 58,
      education_min: "初中及以下",
      physical_constraints: ["无传染性疾病（需持甲类健康证）", "腰背力量正常可协助患者翻身移位", "情绪稳定有耐心"],
      prep_duration_days: { min: 15, max: 30 },
      official_zero_markup_cost_cny: {
        total_min: 150,
        total_max: 1200,
        breakdown: [
          { item: "餐饮/医疗从业人员预防性健康体检", cost_cny: "100 - 160" },
          { item: "公办卫校/人社补贴目录医疗护理员培训考评费（失业人员常免学费）", cost_cny: "0 - 1,000" }
        ]
      },
      official_portal_url: "http://osta.mohrss.gov.cn",
      official_portal_name: "技能人才评价工作网（人社部）",
      l1_l2_sources: [
        { level: "L1", doc_name: "《关于加强医疗护理员培训和规范管理工作的通知》（国卫医发〔2019〕49号）", authority: "国家卫生健康委 / 财政部 / 人社部" },
        { level: "L1", doc_name: "《医院免陪照护服务试点工作方案》（2025-2026年全国深化推广）", authority: "国家卫生健康委医政司" },
        { level: "L2", doc_name: "各省市人社厅政府补贴性职业技能培训（医疗护理员/养老护理员）目录公示", authority: "地方人社局 / 卫健委" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 一二线三甲医院驻点护工管理中心结算单采集，扣除医院管理抽成（约12%-18%）后的实际到手净额。",
      net_income_stages: [
        { stage: "无陪护病房班组制新员工", monthly_cny_range: [5000, 6500], highlight: "12小时轮班制，老带新固定底薪+绩效", duration_months: 2 },
        { stage: "三甲医院科室一对一专护熟手", monthly_cny_range: [7200, 9500], highlight: "日结260-350元/天，住病房陪护床零房租", duration_months: 6 },
        { stage: "重症术后/神经康复金牌专护", monthly_cny_range: [9500, 13000], highlight: "懂气管切开吸痰辅助与术后康复，档期排满", duration_months: 12 }
      ],
      deal_breakers: [
        "必须直面屎尿屁、呕吐物、褥疮护理及术后引流袋倾倒，有生理洁癖或放不下面子者第一天即崩溃",
        "一对一24小时专护期间睡在病房折叠陪护床上，夜间需起夜2-4次协助翻身或查看输液，深度睡眠严重碎片化",
        "个别非正规‘黑护工头’垄断病房私收高额管理费，务必通过医院官方招标公示的驻院护理中心入职"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [3800, 8800],
        scam_alert: "国家卫健委明确规定医疗护理员严禁从事护士医疗操作，且各地人社局均有免费或几百元补贴培训！凡收取5000-8800元办所谓‘国际高级康复理疗师/金牌医护证’包进三甲编制者全是骗局。"
      }
    }
  },
  {
    path_id: "PATH_011",
    title: "定向培养军士（高考专科提前批 · 2.5年公办高校 + 入伍直接授下士军衔）",
    batch_id: 'BATCH_2',
    policy_update_month: "每年 5-6 月（全国征兵网与高考专科提前批）",
    pk_arena: 'STUDENT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['STUDENT_15_18', 'YOUTH_18_35'],
    core_goals: ['BIAN_ZHI_STABLE', 'SAVE_300K_3YR'],
    scenario_tags: ["18岁高考分流", "二本线下托底", "全免学费高储蓄"],
    category: ["学生升学暗道", "部队技术军士", "退还学费+月入7k"],
    status_light: "GREEN",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: true,
    requires_night_shift: true,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: true,
    keywords: ["高考", "18岁", "定向培养军士", "定向士官", "当兵", "入伍", "专科提前批", "退学费"],
    diy_action_steps: [
      "第一步：高考出分后，在省教育考试院官网【专科提前批】填报《招收定向培养军士院校专业目录》（多为公办优质高职院校的通信、机电、航海、航空维修专业）。",
      "第二步：通过县（区）人民武装部组织的体格检查与政治考核（与征兵标准一致，零费用）。",
      "第三步：前2.5年在公办高职院校就读，大三下半年直接进入对口部队实习；入伍后国家直接按每年最高 ¥16,000 标准全额代偿/退还大学3年学费！",
      "第四步：毕业当年7月由部队直接下达下士军衔命令（起薪约6500-7500元/月，全包吃住穿医），服役满12年（含高校3年折算）符合条件可由政府安排工作（转业安置事业编/央国企）。"
    ],
    pk_profile: {
      short_name: "011 定向培养军士 (专科提前批)",
      badge: "国家退还大学学费 · 毕业直接授下士",
      official_cost_avg: 0,
      prep_months: 30,
      prep_label: "2.5年公办高校+入伍退还全部学费",
      hard_threshold: "17-20岁未婚 · 高考专科提前批 · 征兵体检政审合格",
      intern_months: 6,
      intern_monthly_net: 1500,
      intern_label: "大三下学期进部队基地集中入伍实习",
      regular_monthly_net: 7200,
      regular_range: [6500, 9500],
      on_job_living_expense: 300,
      working_months_per_year: 12,
      family_separation: {
        level: 'HIGH',
        text: "较高：入伍后驻扎部队营区（含边海防或技术场站），按军士年休假规定每年集中探亲休假"
      },
      body_toll: "严格执行部队条令条例与3000米体能考核，野外驻训、战备值班强度高，手机使用受保密严格管制",
      ceiling_3yr: "晋升中士/上士（月净入8500-1.1万+高额退役金），干满规定年限可走政府转业安置进体制或领数十万退役金",
      agency_trap_diff: 60000,
      verdict_fit: [
        "高考分数在二本线下、专科高分段，身体素质过硬、向往军营且家庭希望零成本翻身的青年",
        "希望毕业即跳过2年义务兵阶段、直接拿技术下士工资并在部队攒下三四十万现金的人"
      ],
      verdict_avoid: [
        "体能极差、近视度数过高未做手术或无法忍受军事化严格纪律约束的人",
        "有文身、直系亲属政审有刑事案底或抗拒长期驻扎外地营区的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 17,
      age_max: 20,
      education_min: "应届普通高中毕业生（高考专科提前批录取）",
      physical_constraints: ["符合《应征公民体格检查标准》", "任何一眼裸眼视力≥4.5（或屈光手术半年以上无并发症）", "政治考核合格"],
      prep_duration_days: { min: 15, max: 45 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 800,
        breakdown: [
          { item: "高校前2.5年学费（入伍后国家全额学费补偿代偿）", cost_cny: "0 (入伍后全额退还最高16,000/年)" },
          { item: "征兵体检与政治考核行政规费", cost_cny: "0 (武装部全免)" },
          { item: "高校住宿及个人生活被装杂费", cost_cny: "500 - 800" }
        ]
      },
      official_portal_url: "https://www.gfbzb.gov.cn",
      official_portal_name: "全国征兵网 / 各省教育考试院专科提前批",
      l1_l2_sources: [
        { level: "L1", doc_name: "《招收定向培养军士工作规定》（军委政治工作部、教育部联合印发）", authority: "中央军委政治工作部 / 教育部" },
        { level: "L1", doc_name: "《军人抚恤优待条例》及高校学生应征入伍服兵役国家教育资助办法", authority: "国务院 / 中央军委 / 财政部" },
        { level: "L2", doc_name: "各省教育考试院年度《招收定向培养军士专科提前批投档分数线及体格检查通知》", authority: "省征兵办公室 / 省教育考试院" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 现役定向培养下士/中士工资津贴标准与退役安置政策，在队期间食宿医疗全免，净储蓄率接近90%。",
      net_income_stages: [
        { stage: "前2.5年高校就读+0.5年部队入伍实习", monthly_cny_range: [1000, 1500], highlight: "入伍即一次性退还大学学费约2.4-4万", duration_months: 6 },
        { stage: "毕业授下士军衔（服役第1-3年）", monthly_cny_range: [6500, 7800], highlight: "部队包吃住穿医，每月几乎纯存", duration_months: 36 },
        { stage: "晋升中士/上士或驻边海防补贴岗", monthly_cny_range: [8200, 11000], highlight: "另享高额退役养老保险与职业年金累加", duration_months: 36 }
      ],
      deal_breakers: [
        "最低服役年限硬性约束：毕业授衔后须至少服满下士至中士规定年限，中途不得随意辞职退伍",
        "如果在校前2.5年挂科严重或入伍前二次体检不合格，将被淘汰退回普通专科生身份自谋职业",
        "部队实行24小时准军事化管理，日常外出请假、智能机使用时间及婚恋异地均受严格规范"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [50000, 150000],
        scam_alert: "定向培养军士100%走各省高考专科提前批官方投档+县武装部征兵体检！凡社会机构宣称收6-15万办理‘计划外定向士官委培班、免高考直接进部队拿军衔’100%是冒充军人的刑事诈骗！"
      }
    }
  },
  {
    path_id: "PATH_012",
    title: "原铁道部直属高职专科：铁道机车运用与维护 / 供电（国铁18个铁路局校招直入）",
    batch_id: 'BATCH_2',
    policy_update_month: "每年 6 月招生 & 10-12 月铁路局校招",
    pk_arena: 'STUDENT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['STUDENT_15_18', 'YOUTH_18_35'],
    core_goals: ['BIAN_ZHI_STABLE'],
    scenario_tags: ["18岁高考分流", "二本线下托底", "央企正式合同"],
    category: ["学生升学暗道", "央企直招订单班", "六险二金铁饭碗"],
    status_light: "GREEN",
    last_verified_date: "2026-11-11",
    includes_free_board_lodging: true,
    requires_night_shift: true,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["铁路", "高铁", "火车司机", "铁路局", "国铁", "高职", "大专", "六险二金"],
    diy_action_steps: [
      "第一步：高考专科批或高职分类单招中，锁死原铁道部直属划转的公办铁道职业技术学院（如南京铁道、武汉铁道、石家庄铁道职院、郑州铁路职院等）。",
      "第二步：专业严格锁定‘铁道机车运用与维护、铁道供电技术、铁道信号自动控制、铁道车辆’四大机务/供电核心工科（切勿报错非铁路主业的旅游/商贸专业）。",
      "第三步：大二下至大三上学期参加中国国家铁路集团（18个地方铁路局）进校举办的‘2+1定向订单班’双选会，网申统一走中国铁路人才招聘网 (rczp.china-railway.com.cn)。",
      "第四步：毕业直签铁路局正式劳动合同（享受顶格六险二金与企业年金），机务段学员跟车见习满后考取国家铁路局《铁路机车车辆驾驶证》（J5/J6副司机至司机）。"
    ],
    pk_profile: {
      short_name: "012 公办铁道高职订单班",
      badge: "二本分进国铁央企 · 顶格六险二金",
      official_cost_avg: 6000,
      prep_months: 30,
      prep_label: "3年公办铁道高职+大三铁路局校招",
      hard_threshold: "18-22岁 · 压二本线/高分专科 · 严禁色盲色弱",
      intern_months: 6,
      intern_monthly_net: 4200,
      intern_label: "入局前6个月机务段/供电段跟班实训期",
      regular_monthly_net: 7800,
      regular_range: [6500, 11000],
      on_job_living_expense: 1000,
      working_months_per_year: 12,
      family_separation: {
        level: 'MEDIUM',
        text: "中等：跑乘务或驻沿线工区多为‘跑几休几’或集中轮休，休班回本市家，出乘住公寓"
      },
      body_toll: "火车副司机/司机严禁携带个人手机值乘，夜间行车高度集中精神，生物钟不规律；供电接触网需夜间天窗期高空检修",
      ceiling_3yr: "考下火车大司机证后月净到手9000-1.2万（另加双边近3000元公积金+企业年金），终身央企兜底",
      agency_trap_diff: 95000,
      verdict_fit: [
        "高考分数在二本线上下（400-460分段），与其去读高价民办三本毕业失业，不如读公办铁道王牌高职进国铁央企",
        "男生、辨色力与身体素质极佳，家庭追求“堪比公务员的六险二金福利保障”"
      ],
      verdict_avoid: [
        "有任何程度色盲或色弱（铁路行车安全红线，体检100%一票否决）",
        "无法接受半军事化标准化呼唤应答作业规程与熬夜跟车的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 17,
      age_max: 23,
      education_min: "应届高职（专科）统招毕业生",
      physical_constraints: ["绝对无色盲色弱", "双眼矫正视力5.0以上", "听力正常无高血压心脏病"],
      prep_duration_days: { min: 30, max: 60 },
      official_zero_markup_cost_cny: {
        total_min: 5000,
        total_max: 6800,
        breakdown: [
          { item: "公办铁道职业技术学院学年学费", cost_cny: "4,800 - 5,500 / 年" },
          { item: "公办院校住宿费与教材费", cost_cny: "800 - 1,200 / 年" }
        ]
      },
      official_portal_url: "https://rczp.china-railway.com.cn",
      official_portal_name: "中国铁路人才招聘网（国铁集团唯一官方校招门户）",
      l1_l2_sources: [
        { level: "L1", doc_name: "《铁路机车车辆驾驶人员资格许可办法》（交通运输部令2019年第43号）", authority: "国家铁路局" },
        { level: "L2", doc_name: "中国国家铁路集团有限公司所属18个铁路局年度高校毕业生招聘公告", authority: "中国国家铁路集团" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 国铁集团各铁路局机务段/供电段实发工资条与六险二金缴存单核验，福利含金量远超账面现金。",
      net_income_stages: [
        { stage: "入职第1年（定职前实训学徒期）", monthly_cny_range: [3800, 4800], highlight: "足额缴纳六险二金，住单位单身公寓", duration_months: 12 },
        { stage: "定职副司机 / 接触网工（第2-3年）", monthly_cny_range: [6500, 8500], highlight: "含夜班费与乘务公里补贴，公积金双边2000+", duration_months: 12 },
        { stage: "考取国铁大司机证（第4年起）", monthly_cny_range: [9000, 12500], highlight: "客运/货运主力司机，综合年包13-16万", duration_months: 12 }
      ],
      deal_breakers: [
        "铁路机务行车实行极其严苛的标准化半军事管理，出乘期间手机强制锁入保密柜，漏看一个信号灯即面临撤职处分",
        "生物钟长期颠倒，货运机车常在凌晨零点至五点间跨局值乘，熬夜损耗大",
        "部分供电/工务车间设在偏远县镇沿线站点，新员工前2-3年需耐受基层站点寂寞"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [80000, 180000],
        scam_alert: "国铁集团18个铁路局正式工100%只招统招对口应届毕业生且全部在‘中国铁路人才招聘网’公示名单！凡社会中介宣称收10-18万‘安置非对口往届生进高铁编制’100%是劳务派遣临时工诈骗！"
      }
    }
  },
  {
    path_id: "PATH_013",
    title: "重点高校招收农村和脱贫地区学生专项计划（国家专项 / 地方专项 / 高校专项）",
    batch_id: 'BATCH_2',
    policy_update_month: "每年 3-4 月（高校专项4月25日前阳光高考网申报）",
    pk_arena: 'STUDENT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['STUDENT_15_18', 'YOUTH_18_35'],
    core_goals: ['BIAN_ZHI_STABLE'],
    scenario_tags: ["农村/县城青年", "高考冲刺", "低分进名校"],
    category: ["高考降分15-50分", "农村户籍专属", "985/211公办统招"],
    status_light: "GREEN",
    last_verified_date: "2026-11-13",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["国家专项", "地方专项", "高校专项", "农村专项", "高考降分", "985", "211", "农村户籍", "县中", "低分进名校"],
    diy_action_steps: [
      "第一步：核查是否满足‘户籍+学籍+实际就读’三统一硬红线（本人及父母或法定监护人户籍在实施区域农村且连续满3年，本人具有户籍所在县高中连续3年学籍并实际就读，严禁省城借读空挂学籍）。",
      "第二步：每年3月底至4月25日前（关键窗口！错过6月无法补报），登录教育部阳光高考特殊类型招生报名平台 (https://gaokao.chsi.com.cn/gxzxbm) 免费完成【高校专项计划】网上申报并上传加盖县招办与中学公章的申请表。",
      "第三步：配合当地县级教育招生考试机构完成国家专项、地方专项与高校专项的户籍学籍资格联审及三级实名公示（全程0元）。",
      "第四步：6月高考出分后，在省教育考试院志愿填报系统的‘国家专项批 / 高校专项批 / 地方专项批’单独批次填报志愿，享受低于普通统招线15-50分录取公办985/211及省属重点一本。"
    ],
    pk_profile: {
      short_name: "013 农村三大专项 (降15-50分进985/211)",
      badge: "0元申报 · 降15-50分录985/211公办统招",
      official_cost_avg: 0,
      prep_months: 2,
      prep_label: "每年3-4月阳光高考网与县招办0元资格审核",
      hard_threshold: "16-22岁 · 农村户籍满3年+县中连续3年学籍并实际就读",
      intern_months: 0,
      intern_monthly_net: 0,
      intern_label: "高考单独批次投档，毕业证与统招生100%相同",
      regular_monthly_net: 10500,
      regular_range: [7500, 14000],
      on_job_living_expense: 2500,
      working_months_per_year: 12,
      family_separation: {
        level: 'MEDIUM',
        text: "中等：赴部属985/211或省属重点一本公办高校异地求学4年，享全套国家助学政策"
      },
      body_toll: "无体力损耗；但降30-50分进顶尖985理工科后，大一高数与全英文教材学业压力大，须暑假提前预习防挂科",
      ceiling_3yr: "获公办985/211全日制统招本科学位（无任何专项标注），直接跨过名校简历门槛、保研或选调生考公",
      agency_trap_diff: 38000,
      verdict_fit: [
        "16-22岁真正在县城/农村高中实际就读满3年、且本人与父母农村户籍满3年的高三应往届考生",
        "高考分数在一本线上下或211边缘，希望免去民办本科10万+高昂学费、降分15-50分冲刺公办985/211或省属一本的寒门学子"
      ],
      verdict_avoid: [
        "初中毕业后去省城私立高中借读、仅把学籍空挂在老家农村县中的‘人籍分离’考生（大数据核查一票否决直接取消资格）",
        "到了6月高考出分后才想起来报高校专项的人（高校专项网报每年4月25日即彻底关闭系统！）"
      ]
    },
    track_a_hard_facts: {
      age_min: 16,
      age_max: 22,
      education_min: "符合当年普通高考报名条件的应往届高中毕业生",
      physical_constraints: ["严格执行‘户籍+学籍+实际就读’三统一：本人及父母户籍在实施区域农村且连续满3年，本人须具户籍所在县高中连续3年学籍并实际就读（严禁空挂学籍）"],
      prep_duration_days: { min: 30, max: 90 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 0,
        breakdown: [
          { item: "教育部阳光高考网高校专项计划网上报名及高校初审费", cost_cny: "0 (国家全额免费)" },
          { item: "县招办户籍学籍资格公示与国家/地方专项志愿填报费", cost_cny: "0 (纳入正常高考流程)" },
          { item: "录取后公办重点大学学费标准", cost_cny: "与普通统招生完全一致(享受全套国家助学政策)" }
        ]
      },
      official_portal_url: "https://gaokao.chsi.com.cn/gxzxbm",
      official_portal_name: "教育部阳光高考特殊类型招生报名平台 / 各省教育考试院官网",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "教育部《关于做好年度重点高校招生专项计划工作的通知》",
          authority: "中华人民共和国教育部"
        },
        {
          level: "L1",
          doc_name: "《重点高校招收农村和脱贫地区学生专项计划报考指南》（国家/地方/高校专项三统一审核规定）",
          authority: "教育部阳光高考信息平台 (gaokao.chsi.com.cn)"
        },
        {
          level: "L2",
          doc_name: "各省教育厅年度《重点高校招生专项计划实施区域县区名单及资格审核通知》",
          authority: "各省教育厅 / 省教育考试院"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 多所部属 985/211 高校专项计划投档线与普通统招线对比复盘，具体降分幅度因省份高考竞争烈度与当年报考人数而异。",
      net_income_stages: [
        { stage: "每年3-4月高考前资格网报期 (关键窗口)", monthly_cny_range: [0, 0], highlight: "高校专项须在4月25日前在阳光高考网完成申报，错过6月无法补报", duration_months: 1 },
        { stage: "6月高考出分单独批次录取期 (降分15-50分)", monthly_cny_range: [0, 0], highlight: "毕业证、学位证及保研资格与统招生100%完全相同，无任何特殊标注", duration_months: 2 },
        { stage: "公办985/211本科毕业起薪期 (对比民办三本)", monthly_cny_range: [7500, 14000], highlight: "免去民办本科10万+高昂学费，并直接跨过名校简历筛选门槛", duration_months: 12 }
      ],
      deal_breakers: [
        "【人籍分离一票否决】初中毕业后去省城私立高中借读、学籍挂在农村县中的‘空挂学籍’考生，大数据核查会直接取消专项资格，切勿抱侥幸心理",
        "【冷门基础学科集中】高校投放到专项计划中的专业大量集中在哲学、历史、农林、地质、采矿、环境工程等统招冷门大类，且部分高校限制转出专项专业",
        "【大一数理英学业震荡】以低出统招线30-50分进入顶尖985理工科，大一高数与全英文教材挂科风险高，须在高考后暑假提前预习补短板"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [28000, 58000],
        scam_alert: "【防诈铁律】三大专项所有实施区域与审核名单全部在省考试院与阳光高考网实名公示！符合户籍学籍硬条件的考生4月自己上网填表0元即可申报；不符合硬条件的，任何中介收几万块所谓‘内部操作农村专项名额’100%是诈骗！"
      }
    }
  },
  {
    path_id: "PATH_015",
    title: "军队院校面向士兵招生（部队考军校 / 优秀大学生士兵提干）",
    batch_id: 'BATCH_2',
    policy_update_month: "每年 1-3 月部队基层报名 & 6 月全军文化统考",
    pk_arena: 'STUDENT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['STUDENT_15_18', 'YOUTH_18_35'],
    core_goals: ['BIAN_ZHI_STABLE', 'SAVE_300K_3YR'],
    scenario_tags: ["高考滑档", "二本失业", "大专蓝领", "18-22岁青年"],
    category: ["部队考军校", "授少尉军官衔", "带薪上大学"],
    status_light: "GREEN",
    last_verified_date: "2026-11-14",
    includes_free_board_lodging: true,
    requires_night_shift: true,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: true,
    keywords: ["考军校", "部队考学", "士兵考军校", "大学生提干", "少尉", "军官", "义务兵", "高考滑档", "带薪上大学"],
    diy_action_steps: [
      "第一步：每年上半年（12月-2月）或下半年（6月-8月）登录唯一官方门户‘全国征兵网’ (https://www.gfbzb.gov.cn) 免费完成应征报名（高中毕业、大学在读或大专/本科毕业均可，报名费与体检费全免）。",
      "第二步：入伍服役满1年（截至报考当年6月30日；优秀本科毕业生士兵提干须服役满1年半），在基层连队保持军事训练全优并主动向连队党支部递交考学申请。",
      "第三步：每年4-5月通过旅团级组织的【军事共同科目考核】（队列、轻武器射击、战术基础、3000米跑/引体向上等体能考核，一票否决制）。",
      "第四步：每年6月7-8日参加全军统一组织的【军队院校招收士兵学员文化科目统考】（高中/在校生考语数英政+物化史，大专生考专升本科目），录取后带薪免费读军校，毕业直接授少尉军官衔！"
    ],
    pk_profile: {
      short_name: "015 部队士兵考军校 / 大学生提干",
      badge: "0学费带薪读军校 · 毕业授少尉军官衔",
      official_cost_avg: 0,
      prep_months: 10,
      prep_label: "入伍满1年+全军5月军事考核+6月文化统考",
      hard_threshold: "17-22岁(大专放宽至24岁) · 高中/大学生士兵 · 军事体能全优",
      intern_months: 12,
      intern_monthly_net: 1300,
      intern_label: "入伍第1年义务兵备考期(食宿衣医全包，津贴纯存)",
      regular_monthly_net: 10500,
      regular_range: [9000, 12500],
      on_job_living_expense: 300,
      working_months_per_year: 12,
      family_separation: {
        level: 'HIGH',
        text: "极高：部队服役与军校4年全封闭管理，毕业授衔军官后须服从全国（含边海防）调动分配"
      },
      body_toll: "白天高强度军事体能与战术拉练，全靠熄灯后熬夜刷文化题；军事共同科目任何一项挂科即取消文化统考资格",
      ceiling_3yr: "军校毕业直接授少尉军官军衔（排长/技术军官，月净入9000-12500元+高额住房公积金+免费医疗），实现彻底阶层跨越",
      agency_trap_diff: 110000,
      verdict_fit: [
        "17-22岁高考滑档但高中数理化基础扎实、身体素质好，或24岁以内全日制大专/本科入伍想搏一把‘军官阶层跨越’的热血青年",
        "家庭无力承担民办大学高昂学费，希望能0学费、每月领津贴带薪读本科军校的人"
      ],
      verdict_avoid: [
        "截至报考当年1月1日高中/在校生已超22周岁（大专毕业士兵已超24周岁）的超龄人员（军网系统死卡年龄，一天不放宽）",
        "体能极差或缺乏极致自律（白天连队训练已经筋疲力尽，晚上无法坚持每天自习刷题3小时以上）的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 17,
      age_max: 24,
      education_min: "高中毕业、大学在读或全日制大专/本科毕业后参军入伍，且服现役满1年（提干须满1年半）",
      physical_constraints: ["符合征兵体检及军队院校招收学员体格检查标准", "通过全军军事共同科目考核（体能、队列、射击合格）"],
      prep_duration_days: { min: 270, max: 365 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 0,
        breakdown: [
          { item: "应征入伍体检政审及部队内部考学统考报名费", cost_cny: "0 (国家全额免费)" },
          { item: "录取后4年军校学费、食宿、被装与医疗费", cost_cny: "0 (国家全包且每月发放学员津贴)" }
        ]
      },
      official_portal_url: "https://www.gfbzb.gov.cn",
      official_portal_name: "全国征兵网（国防部征兵办公室官方门户）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "中央军委训练管理部、政治工作部《军队院校招收士兵学员工作办法》",
          authority: "中央军事委员会训练管理部 / 政治工作部"
        },
        {
          level: "L1",
          doc_name: "《中华人民共和国兵役法》及《现役军官管理暂行条例》",
          authority: "全国人大常委会 / 中央军事委员会"
        },
        {
          level: "L2",
          doc_name: "军委训练管理部年度《军队院校招收士兵学员文化科目统考大纲》",
          authority: "中央军委训练管理部"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 基层连队考学上岸军校学员复习强度与毕业授少尉军官薪资单整理，不同部队单位的考前集训支持力度存在差异。",
      net_income_stages: [
        { stage: "入伍第1年义务兵备考期 (包吃住衣医)", monthly_cny_range: [1100, 1500], highlight: "边训练边挤时间备考，边疆驻地津贴可达2000+元", duration_months: 12 },
        { stage: "考入军校4年学员期 (带薪上学)", monthly_cny_range: [1300, 1600], highlight: "学费全免、寒暑假报销探亲路费，毕业直接授少尉军官衔", duration_months: 24 },
        { stage: "军校毕业授少尉军官后 (排长/技术军官)", monthly_cny_range: [9000, 12500], highlight: "实发到手外加高额住房公积金与免费医疗，实现彻底阶层跨越", duration_months: 12 }
      ],
      deal_breakers: [
        "【年龄死线极严】高中/在校生士兵截至当年1月1日不得超过22周岁（大专毕业士兵不超过24周岁），超龄即彻底关门",
        "【极致自律考验与军事一票否决】白天需完成高强度体能与战术训练，全靠晚上熄灯后自主刷题；且5月军事共同科目考核有任何一项挂科即取消文化考试资格",
        "军官服役需严格服从组织调动分配（含边疆、海岛、深山阵地），长期与家人聚少离多"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [80000, 150000],
        scam_alert: "【防诈生死线】全军士兵考学实行全军统一机读阅卷、军事考核全程录像、指标全旅公开张榜公示，没有任何个人能操纵录取！凡在地方收取8-15万吹嘘‘走关系送进部队保证考上军校/直接提干’100%是刑事诈骗！"
      }
    }
  },
  {
    path_id: "PATH_021",
    title: "大学生志愿服务西部计划（考研初试加10分 + 定向考公 + 学费代偿）",
    batch_id: 'BATCH_3',
    policy_update_month: "每年 3-5 月（全国项目办与高校团委报名）",
    pk_arena: 'STUDENT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['YOUTH_18_35'],
    core_goals: ['BIAN_ZHI_STABLE', 'STUDY_ON_DUTY'],
    scenario_tags: ["二本失业", "考研失利", "考公落榜"],
    category: ["应届生缓冲带", "考研初试加10分", "公务员定向特招"],
    status_light: "GREEN",
    last_verified_date: "2026-11-13",
    includes_free_board_lodging: true,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["西部计划", "大学生志愿服务", "考研加10分", "四项目人员", "定向考公", "学费代偿", "助学贷款代偿", "应届生", "西藏新疆留任"],
    diy_action_steps: [
      "第一步：每年3月至5月（毕业离校前），登录唯一官方网站‘大学生志愿服务西部计划信息系统’ (https://xibu.youth.cn) 或‘西部志愿汇’微信公众号在线填写报名表（全程0元）。",
      "第二步：下载打印《报名登记表》，由所在高校辅导员及院系团委签字盖章后，交由本校项目办（校团委）审核并参加笔试面试与免费集中体检。",
      "第三步：如有助学贷款或需学费补偿，同步向本校学生资助管理中心递交《高校毕业生到中西部地区和艰苦边远地区基层单位就业学费补偿国家助学贷款代偿申请表》（本专科最高代偿16,000元/年）。",
      "第四步：签署服务协议（强烈建议签满2年，因考研初试加10分与公务员‘四项目人员’定向招录均以服务满2年且考核合格为硬前提），7月下旬集中培训后奔赴服务岗位。"
    ],
    pk_profile: {
      short_name: "021 大学生西部计划 (考研+10分/定向考公)",
      badge: "0元报名 · 考研总分+10分 · 学费代偿",
      official_cost_avg: 0,
      prep_months: 2,
      prep_label: "每年3-5月校团委报名选拔(不考行测申论)",
      hard_threshold: "18-28岁 · 100%锁死当年统招本专科应届生或研一",
      intern_months: 12,
      intern_monthly_net: 2700,
      intern_label: "内地中西部省份服务期(包住宿，买五险及意外险)",
      regular_monthly_net: 4600,
      regular_range: [2200, 5500],
      on_job_living_expense: 600,
      working_months_per_year: 12,
      family_separation: {
        level: 'MEDIUM',
        text: "中等：分配在西部县乡政府办或乡村学校服务1-3年（官方全额报销往返交通费）"
      },
      body_toll: "无重体力劳动；但乡镇文书台账繁杂、生活条件清苦，缺乏自制力者在乡镇易放弃备考",
      ceiling_3yr: "服务满2年解锁‘考研初试加10分’+‘公务员定向特招岗位’+‘最高1.6万-4.8万学费补偿/助学贷款代偿’，新疆兵团期满留任考编上岸率极高",
      agency_trap_diff: 9800,
      verdict_fit: [
        "18-28岁当年普通高校应届毕业生（含全日制大专、本科），想避开行测申论内卷、用2年基层服务换取‘考研初试总分+10分’与‘公务员定向特招池’的人",
        "需要大学学费补偿/国家助学贷款代偿（服务满2-3年倒贴+16,000~48,000元）或瞄准新疆兵团/西藏专项留任考编的应届生"
      ],
      verdict_avoid: [
        "已经6月毕业离校或往届毕业超过1年者（系统100%锁死当年应届毕业生身份，仅在每年3月中旬至5月中旬开放网报）",
        "只打算干满1年就退出回城的人（一年一签，若只干1年将彻底失去‘考研初试加10分’和‘公务员定向特招岗位’两项核心资格！）"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 28,
      education_min: "当年普通高等学校应届毕业生（含全日制大专、本科）或在读研究生",
      physical_constraints: ["100%锁死当年应届毕业生身份（往届毕业超过1年无法报常规项目）", "通过省级项目办统一组织的体检"],
      prep_duration_days: { min: 30, max: 60 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 0,
        breakdown: [
          { item: "西部计划官方系统报名、校团委面试及统一体检费", cost_cny: "0 (国家财政全额承担)" },
          { item: "派遣赴西部服务地往返交通费", cost_cny: "0 (官方全额报销)" },
          { item: "服务满2-3年大学学费补偿/助学贷款代偿", cost_cny: "倒贴 +16,000 ~ 48,000" }
        ]
      },
      official_portal_url: "https://xibu.youth.cn",
      official_portal_name: "大学生志愿服务西部计划信息系统（共青团中央全国项目办唯一门户）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "共青团中央、教育部、财政部、人力资源和社会保障部《年度大学生志愿服务西部计划实施方案》",
          authority: "共青团中央 / 教育部 / 财政部 / 人社部"
        },
        {
          level: "L1",
          doc_name: "教育部《全国硕士研究生招生工作管理规定》（服务基层项目初试总分加10分条款）",
          authority: "中华人民共和国教育部"
        },
        {
          level: "L1",
          doc_name: "《高等学校毕业生赴基层单位就业学费补偿国家助学贷款代偿暂行办法》",
          authority: "财政部 / 教育部"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 新疆兵团、西藏及川黔陕等地在岗西部计划志愿者生活补贴流水与期满去向复盘，边疆专项补贴显著高于内地省份。",
      net_income_stages: [
        { stage: "每年3-5月校内报名选拔期 (不考行测申论)", monthly_cny_range: [0, 0], highlight: "由所在高校校团委组织基础审核与面试，双非学生录取率高", duration_months: 2 },
        { stage: "内地中西部省份服务期 (1-3年，包住宿)", monthly_cny_range: [2200, 3200], highlight: "买五险及意外险，基本无消费，核心收益是攒满2年政策筹码", duration_months: 12 },
        { stage: "新疆兵团/西藏专项服务期 (含艰苦边远津贴，包住)", monthly_cny_range: [3800, 5500], highlight: "2年可攒5-8万现金+学费代偿，且新疆兵团期满留任考编上岸率极高", duration_months: 24 }
      ],
      deal_breakers: [
        "【必须干满2年才解锁核心红利】西部计划一年一签，若只干满1年就退出回城，将彻底失去‘考研初试加10分’和‘公务员定向特招岗位’两项核心资格！",
        "【报名窗口极短且严卡应届生】每年仅在3月中旬至5月中旬开放网报，一旦6月毕业离开学校才想起报名即彻底丧失资格",
        "大量岗位分配在偏远乡镇政府办公室或乡村中小学，文书台账繁杂、生活条件清苦，缺乏自制力者在乡镇易放弃备考"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [6800, 12800],
        scam_alert: "【防诈铁律】西部计划全程0元费用，由各高校校团委直接初审选拔，没有任何第三方机构拥有所谓‘内部推荐指标’。有疑问直接走进本校行政楼找校团委老师咨询！"
      }
    }
  },
  {
    path_id: "PATH_023",
    title: "国家综合性消防救援队伍消防员招录（高中/大专可报 · 体制内准军事化高保障）",
    batch_id: 'BATCH_3',
    policy_update_month: "每年 7-8 月（国家消防员招录平台集中开启）",
    pk_arena: 'ADULT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['YOUTH_18_35'],
    core_goals: ['BIAN_ZHI_STABLE', 'SAVE_300K_3YR'],
    scenario_tags: ["大专蓝领", "二本失业", "考公落榜"],
    category: ["体制内高保障", "包吃住全储蓄", "满12年政府安置"],
    status_light: "GREEN",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: true,
    requires_night_shift: true,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: true,
    keywords: ["国家消防员", "消防救援", "体制内", "高中可报", "大专", "退伍军人", "安置"],
    diy_action_steps: [
      "第一步：每年7-8月登录唯一官方门户‘国家综合性消防救援队伍消防员招录平台’ (xfyzl.119.gov.cn) 在线注册报名（分高校应届生、退役军人、社会青年三类通道，报名费0元）。",
      "第二步：重点拉练四大体能考核科目（1000米跑、原地跳远、引体向上/俯卧撑、10米×4往返跑），体能达标即赢下80%竞争对手。",
      "第三步：通过省级消防招录办组织的免费体格检查、政治审核、心理测试与面试（无复杂行测申论死卷）。",
      "第四步：录用后进入1年新训期，授衔四级消防士后全包食宿被装，工作满5年可退（领高额退出补助），工作满12年由政府安排工作（安置事业编/央国企）。"
    ],
    pk_profile: {
      short_name: "023 国家队消防员 (119招录)",
      badge: "高中/大专进体制 · 满12年政府安置",
      official_cost_avg: 0,
      prep_months: 2,
      prep_label: "1-2个月体能拉练+官网免费招考",
      hard_threshold: "18-22岁(大学/退役放宽至24岁) · 高中起 · 体能达标",
      intern_months: 12,
      intern_monthly_net: 4800,
      intern_label: "第1年入职集中培训期(预备消防士津贴)",
      regular_monthly_net: 8200,
      regular_range: [7000, 11500],
      on_job_living_expense: 300,
      working_months_per_year: 12,
      family_separation: {
        level: 'HIGH',
        text: "较高：执行24小时驻勤备战制（驻队住宿舍），按规定享受轮休假与每年带薪探亲假"
      },
      body_toll: "高强度负重体能训练与灭火抢险救援实战风险；警铃一响45秒内必须着装登车出动",
      ceiling_3yr: "晋升三级/二级消防士（月到手8k-1.1w+高额公积金），优秀大学毕业生可考取中国消防救援学院提干转指挥员（行政干部编）",
      agency_trap_diff: 50000,
      verdict_fit: [
        "18-24岁体能充沛、不擅长笔试刷题但渴望进入国家正规体制、享受财政全额兜底的青年",
        "退役军人或大专/二本体育、理工科毕业生，希望吃住全免3年净存25万以上的人"
      ],
      verdict_avoid: [
        "体能严重不达标、恐高、有腰膝旧伤或抗拒24小时准军事化驻队管理的人",
        "分不清“国家综合性消防救援队伍正式消防员”与“劳务派遣合同制政府专职消防员”的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 24,
      education_min: "高中（含中专、职高、技校）及以上",
      physical_constraints: ["符合《应征公民体格检查标准》（军队陆勤人员标准）", "通过4项基础体能测试与心理测试"],
      prep_duration_days: { min: 30, max: 60 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 200,
        breakdown: [
          { item: "国家消防员招录平台报名、体测、面试及招录体检费", cost_cny: "0 (国家财政全额承担)" },
          { item: "个人考前交通及基础运动装备", cost_cny: "0 - 200" }
        ]
      },
      official_portal_url: "https://xfyzl.119.gov.cn",
      official_portal_name: "国家综合性消防救援队伍消防员招录平台",
      l1_l2_sources: [
        { level: "L1", doc_name: "中共中央办公厅、国务院办公厅《组建国家综合性消防救援队伍框架方案》", authority: "中共中央办公厅 / 国务院办公厅" },
        { level: "L1", doc_name: "《中华人民共和国消防救援衔条例》及《国家综合性消防救援队伍消防员招录办法》", authority: "全国人大常委会 / 应急管理部 / 人社部" },
        { level: "L2", doc_name: "应急管理部年度《国家综合性消防救援队伍消防员招录公告》", authority: "应急管理部消防员招录工作办公室" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 一二线及省会城市在职四级/三级消防士实发工资与高危补贴核验，务必区分‘国家队正式消防员’与‘地方合同制专职队’。",
      net_income_stages: [
        { stage: "入职第1年（新训与预备消防士期）", monthly_cny_range: [4200, 5200], highlight: "全包食宿被装医疗，无日常开销", duration_months: 12 },
        { stage: "转正授四级消防士衔（第2-5年）", monthly_cny_range: [7000, 9500], highlight: "含执勤津贴与高危补贴，公积金双边高额缴存", duration_months: 36 },
        { stage: "晋升三级/二级消防士或提干后", monthly_cny_range: [9000, 12500], highlight: "满12年享政府转业安置工作或领数十万退出费", duration_months: 36 }
      ],
      deal_breakers: [
        "24小时驻队执勤战备制度，夜间遇火警或抢险救援须45秒内惊醒出警，存在真实火场与救援作业风险",
        "新训期1年封闭式高强度体能训练极苦，若新训不合格或擅自离队将被辞退并记入诚信档案",
        "婚恋与日常自由度受限，节假日往往是防火执勤最严密的留守期"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [38000, 88000],
        scam_alert: "国家队消防员唯一报名官网是 xfyzl.119.gov.cn 且全程零收费！黑中介常收5-8万运作费，结果把受害者塞进第三方劳务派遣的‘地方合同制专职消防员或企业保安队’，毫无国家队消防救援衔与12年政府安置待遇！"
      }
    }
  },
  {
    path_id: "PATH_024",
    title: "中国人民解放军文职人员公开招考（管理/专技/专业技能岗）",
    batch_id: 'BATCH_3',
    policy_update_month: "每年 10-11 月（军队人才网全军统考公告）",
    pk_arena: 'ADULT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55'],
    core_goals: ['BIAN_ZHI_STABLE', 'DAILY_HOME_FAMILY'],
    scenario_tags: ["二本失业", "考研失利", "考公落榜", "35+被裁"],
    category: ["军队非现役体制", "不考申论", "六险二金高薪"],
    status_light: "GREEN",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: true,
    requires_night_shift: false,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["军队文职", "文职", "81rc", "部队医院", "干休所", "不考申论", "六险二金", "考公落榜", "考研失利", "护理", "大专文职"],
    diy_action_steps: [
      "第一步：每年10-11月直接登录中央军委政治工作部唯一官方招考平台‘军队人才网’ (81rc.81.cn) 下载当年《全军面向社会公开招考文职人员岗位计划表》（Excel表）。",
      "第二步：精准筛选标注‘普通高等学校全日制本科’（或护理/技能岗‘全日制大专’）且不限双一流的部队医院、院校教务、干休所、仓库后勤岗位在线报名（官方免收报名考务费 0 元！）。",
      "第三步：下载官网免费公开的《公共科目+专业科目考试大纲》，网购80-150元大纲教材与历年真题册自刷（全部为客观题为主，不考公务员申论大作文！）。",
      "第四步：笔试入围后参加指定军队医院体检（300-450元）、征兵级政治考核与结构化面试，录用后直接享受全国统一标准的六险二金、伙食补助与13薪待遇。"
    ],
    pk_profile: {
      short_name: "024 解放军文职人员 (全军统考)",
      badge: "0报名费不考申论 · 转正到手8.5k-1.1w+",
      official_cost_avg: 250,
      prep_months: 3,
      prep_label: "2-3个月刷公共+专业科目(不考申论)",
      hard_threshold: "18-35岁 · 全日制本科(护理/技能放宽大专) · 严审政审",
      intern_months: 6,
      intern_monthly_net: 6800,
      intern_label: "前6个月试用期(按转正标准80%计发+全额六险二金)",
      regular_monthly_net: 9500,
      regular_range: [6500, 11500],
      on_job_living_expense: 1200,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "较低：报考本市或本省驻军医院、院校、干休所岗位可正常上下班回家，享部队食堂伙食补助"
      },
      body_toll: "无重体力损耗，但营区工作期间严禁使用个人智能手机，部队办文留痕标准极严且需配合值班备勤",
      ceiling_3yr: "转正九级/七级文员或专技岗实发 ¥8,500 - ¥11,500（另加双边2000-2600/月公积金与年底13薪），在二三线城市堪称降维打击",
      agency_trap_diff: 35000,
      verdict_fit: [
        "18-35岁考公死在“申论写不出、行测卷不过千人独木桥”的普通二本/硕士或大专护理/技能生",
        "在二三线城市渴望拿一线水准高薪（本科转正到手8500+且有双边高额公积金与六险二金）的人",
        "社会关系清白、能适应部队严谨作风与保密纪律的求稳人群"
      ],
      verdict_avoid: [
        "热爱每年出国自由行旅游、无法接受护照统一上交保管及营区禁用智能手机的人",
        "轻信骗子“花12万找部队内部领导直接特招进文职编制”的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 35,
      education_min: "全日制本科及以上（护理、艺术、体育及专业技能岗放宽至大专）",
      physical_constraints: ["符合军队选拔文职人员体检标准（矫正视力达标即可）", "本人及直系亲属通过征兵级政审"],
      prep_duration_days: { min: 45, max: 120 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 500,
        breakdown: [
          { item: "军队人才网全国统考报名考务费", cost_cny: "0 (官方免收报名费)" },
          { item: "官方大纲配套教材与历年真题册", cost_cny: "80 - 150" },
          { item: "入围面试后指定军队医院体检费", cost_cny: "300 - 450" }
        ]
      },
      official_portal_url: "http://81rc.81.cn",
      official_portal_name: "军队人才网（中央军委政治工作部唯一官方招考平台）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "国务院、中央军委《中国人民解放军文职人员条例》（2023年修订版）",
          authority: "中华人民共和国国务院 / 中央军事委员会"
        },
        {
          level: "L1",
          doc_name: "《军队文职人员公开招考工作规定》及年度全军公开招考公告",
          authority: "中央军委政治工作部"
        },
        {
          level: "L2",
          doc_name: "军队人才网公开招考岗位计划表与笔试考试大纲",
          authority: "解放军新闻传播中心 (81rc.81.cn)"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 部队医院、院校、干休所及后勤单位在岗文职人员真实工资条，全国执行统一薪资标准（驻地艰苦边远地区另有高额津贴）。",
      net_income_stages: [
        { stage: "前6个月试用期 (按转正标准约80%计发)", monthly_cny_range: [6000, 7800], highlight: "入职即全额缴纳六险二金，含伙食补助", duration_months: 6 },
        { stage: "全日制大专转正期 (护理岗 / 专业技能岗)", monthly_cny_range: [6500, 8200], highlight: "在二三线城市远超地方同类合同制护士与技工", duration_months: 12 },
        { stage: "全日制本科/硕士转正期 (九级/七级文员或专技岗)", monthly_cny_range: [8500, 11500], highlight: "实发到手不含双边公积金(另有2000-2600/月)，年底享13薪", duration_months: 24 }
      ],
      deal_breakers: [
        "【保密与出国铁律】在营工作期间禁用个人智能手机；护照须集中上交保管，因私出国（境）旅游审批极严（涉密岗在职期间基本告别出国自由行）",
        "虽待遇对标现役军官，但多数岗位为3-5年一签的聘用合同制，且部队办文留痕标准极严、需配合值班备勤，绝非清闲养老岗",
        "热门城市机关岗常限制‘双一流’高校，双非本科生必须精准筛选岗位表中注明‘普通高等学校全日制本科’的医院、院校教务、干休所或冷门技术岗"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [25800, 49800],
        scam_alert: "1. 凡声称‘花10-15万找部队关系内部特招安置文职编制’100%属刑事诈骗！2. 警惕公考机构动辄3-5万的‘文职封闭保过班’，军队人才网免费公开全套考试大纲，网购教材自己刷题成本不足200元。"
      }
    }
  },
  {
    path_id: "PATH_031",
    title: "澳洲 462 打工度假签证（WHV 移民局官网 DIY 抽签 · 高储蓄攒第一桶金）",
    batch_id: 'BATCH_4',
    policy_update_month: "每年 7-10 月（澳洲新财年 EOI 预注册抽签季）",
    pk_arena: 'ADULT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35'],
    core_goals: ['SAVE_300K_3YR'],
    scenario_tags: ["二本失业", "考研失利", "负债重启"],
    category: ["低成本出海", "高时薪蓝领", "攒30万第一桶金"],
    status_light: "GREEN",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: true,
    keywords: ["澳洲", "WHV", "462签证", "打工度假", "出国", "海外", "攒钱", "PTE", "英语"],
    diy_action_steps: [
      "第一步：考取合格英语成绩（PTE 总分 30 分或雅思 4.5 分即可，极易自考过线）并准备大专/本科毕业证公证及 5,000 澳元（约2.4万人民币）存款证明。",
      "第二步：每年澳洲新财年开启时，直接登录澳大利亚内政部移民局官网 (immi.homeaffairs.gov.au) 创建 ImmiAccount，提交 462 WHV 预注册意向（EOI 抽签规费仅 25 澳元，约 120 元人民币，彻底终结黄牛代抢时代！）。",
      "第三步：收到移民局中签邀请邮件后，在线递交签证申请（签证规费 650 澳元，约 3100 元人民币）并去指定医院完成出国体检。",
      "第四步：落地澳洲后办税号（TFN）、考白卡（White Card），优先前往偏远地区大型正规肉厂、矿区后勤营地（FIFO）或果园包装厂集二签/三签，最长可合法全职工作 3 年。"
    ],
    pk_profile: {
      short_name: "031 澳洲 462 打工度假 (WHV)",
      badge: "法定最低时薪24澳元+ · 3年攒30-45万",
      official_cost_avg: 9500,
      prep_months: 3,
      prep_label: "1个月考PTE30分+官网25澳元抽签",
      hard_threshold: "18-30岁(未满31岁) · 大专/本科起 · PTE30分+抽中EOI",
      intern_months: 1,
      intern_monthly_net: 8000,
      intern_label: "落地首月办税号/买二手车/找工作过渡期",
      regular_monthly_net: 17500,
      regular_range: [14000, 26000],
      on_job_living_expense: 5500,
      working_months_per_year: 11,
      family_separation: {
        level: 'HIGH',
        text: "较高：在澳洲偏远地区或矿区小镇生活 1-3 年，但网络畅通且可随时买机票回国休假"
      },
      body_toll: "从事农场采摘、牛羊肉厂流水线或矿区清洁等高强度体力劳动；需适应阳光暴晒与小镇单调生活",
      ceiling_3yr: "打满3年WHV可净攒 30万-45万人民币回国创业/还清债务，或用攒下的学费在澳转护理/幼教/技工留学移民",
      agency_trap_diff: 25000,
      verdict_fit: [
        "18-30岁拥有大专或本科学历、急需在 1-3 年内靠高汇率差快速赚取 30 万以上净存款的年轻人",
        "动手能力强、会开车，不排斥在澳洲偏远小镇干蓝领体力活攒第一桶金的人"
      ],
      verdict_avoid: [
        "年龄已满 31 周岁（澳洲462签证法定硬性年龄红线，超1天都无法递交）",
        "轻信黑中介“不抽签、免英语、花8万走旅游签去澳洲打黑工”的人（打黑工面临时薪腰斩与遣返拉黑）"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 30,
      education_min: "大专或本科及以上（或已完成至少2年大学本科学业）",
      physical_constraints: ["胸透体检无活动性肺结核", "雅思总分≥4.5 或 PTE总分≥30"],
      prep_duration_days: { min: 45, max: 120 },
      official_zero_markup_cost_cny: {
        total_min: 7500,
        total_max: 11500,
        breakdown: [
          { item: "移民局官网 EOI 抽签注册费(25澳元) + 中签后签证费(650澳元)", cost_cny: "3,250" },
          { item: "PTE / 雅思英语官方考试费 + 体检公证费", cost_cny: "2,200 - 2,800" },
          { item: "赴澳单程廉航机票及落地首周青旅缓冲", cost_cny: "2,100 - 5,400" }
        ]
      },
      official_portal_url: "https://immi.homeaffairs.gov.au",
      official_portal_name: "澳大利亚内政部移民局官方门户 (ImmiAccount)",
      l1_l2_sources: [
        { level: "L1", doc_name: "澳大利亚《移民条例》Subclass 462 Work and Holiday Visa 法定条款及中澳自贸协定附件", authority: "澳大利亚内政部 (Department of Home Affairs)", source_url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462" },
        { level: "L1", doc_name: "澳大利亚公平工作委员会 (Fair Work Ombudsman) 2026年7月1日起法定全国最低时薪标准（26.44澳元/小时；临时工含25%加成33.05澳元/小时）", authority: "Fair Work Ombudsman", source_url: "https://www.fairwork.gov.au/pay-and-wages/minimum-wages" },
        { level: "L2", doc_name: "澳洲内政部 ImmiAccount 462 Visa Ballot (EOI随机抽签) 官方操作指南", authority: "澳大利亚驻华大使馆 / 内政部", source_url: "https://immi.homeaffairs.gov.au" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 在澳持462签证白工周薪税单（2026年7月起 Fair Work 法定 Casual 最低时薪33.05澳元）核验，受排班工时与肉厂/农场淡旺季影响。",
      net_income_stages: [
        { stage: "落地首月找工与集签过渡期", monthly_cny_range: [4000, 8000], highlight: "办税号、买二手代步车、适应英语环境", duration_months: 1 },
        { stage: "常规白工（果园包装/连锁商超/酒店客房）", monthly_cny_range: [14000, 18000], highlight: "税后周薪约850-1100澳元，扣除房租月存1万+", duration_months: 11 },
        { stage: "高薪白工（正规牛羊肉厂早晚班/FIFO矿区后勤）", monthly_cny_range: [19000, 26000], highlight: "工时稳定含加班费，一年可净存15-18万人民币", duration_months: 12 }
      ],
      deal_breakers: [
        "采用移民局电脑随机抽签制（Ballot），存在当年未中签的概率，严禁在未中签前辞职脱产（抽中后再辞职完全来得及）",
        "集二签、三签须前往澳洲偏远地区从事农业、肉类加工或北领地旅游餐饮满3个月/6个月，户外暴晒或流水线重复劳动强度大",
        "澳洲大城市房租昂贵（悉尼/墨尔本单间周租300+澳元），想要高额攒钱必须去偏远小镇或包食宿矿区营地"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [18000, 85000],
        scam_alert: "自澳洲改为官网25澳元随机抽签后，任何中介宣称收1.8万‘VIP包抢名额’都是骗局（随机抽签无人能暗箱操作）！更要严防收6-8万诱骗办理‘600旅游签转假难民签打黑工’的跨国黑劳务！"
      }
    }
  },
  {
    path_id: "PATH_032",
    title: "新西兰打工度假签证（NZ Working Holiday Visa · 中国大陆1000名额）",
    batch_id: 'BATCH_4',
    policy_update_month: "每年 5-7 月（新西兰移民局年度名额开放日）",
    pk_arena: 'ADULT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35'],
    core_goals: ['SAVE_300K_3YR'],
    scenario_tags: ["二本失业", "大专蓝领", "考研失利", "30岁重启"],
    category: ["个人全球化", "高中学历可报", "合法海外全职工作"],
    status_light: "YELLOW",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: true,
    keywords: ["新西兰", "WHV", "打工度假", "出国", "海外", "高中学历可报", "纽币", "30岁重启", "奇异果"],
    diy_action_steps: [
      "第一步：提前考出 PTE 总分≥42分 或 雅思总分≥5.5分（2年内有效），并备好3年全日制高中学历学信网认证或公证书（新西兰WHV最大优势是高中毕业即可报，不卡大专/本科！）。",
      "第二步：每年开放日前在新西兰移民局官网 (immigration.govt.nz) 注册 RealMe 账号，提前练熟全英文表单快捷键填写与双币信用卡在线支付流程（抢中名额才需扣付签证规费）。",
      "第三步：抢中名额后15-30天内，前往移民局指定国内体检医院完成胸片(X-ray)无肺结核体检，并递交4,200纽币存款证明与学历认证件。",
      "第四步：下签后1年内入境激活，落地第一时间办IRD税号、考换国际驾照翻译件买二手代步车，紧盯南岛牛羊肉厂或北岛奇异果包装厂旺季（注意同一雇主法定限干6个月）。"
    ],
    pk_profile: {
      short_name: "032 新西兰打工度假 (NZ WHV)",
      badge: "高中学历可报 · 年度1000名额拼手速",
      official_cost_avg: 9500,
      prep_months: 3,
      prep_label: "考PTE42分/雅思5.5+移民局官网抢名额",
      hard_threshold: "18-30岁 · 高中毕业可报 · 仅1000名额秒光(YELLOW)",
      intern_months: 1,
      intern_monthly_net: 0,
      intern_label: "落地前2-5周买车办卡与找工空窗消耗期",
      regular_monthly_net: 15500,
      regular_range: [13500, 23000],
      on_job_living_expense: 5500,
      working_months_per_year: 11,
      family_separation: {
        level: 'HIGH',
        text: "较高：远赴南半球新西兰12-15个月，每6个月须强制更换一次雇主，常需随农业季节跨镇搬家"
      },
      body_toll: "果园采摘看天吃饭（下雨即停工零收入），肉厂/海鲜厂流水线高强度重复作业；小镇无公共交通必须会开车",
      ceiling_3yr: "1年旺季极限可净攒 10万-14万人民币，或找认证雇主担保转新西兰 AEWV 工作签证留纽",
      agency_trap_diff: 18000,
      verdict_fit: [
        "18-30岁仅有高中学历（被澳洲462大专学历门槛卡死），但渴望合法出国全职工作攒下人生第一桶金的青年",
        "英语尚可（雅思5.5/PTE42）、有驾照会开车，且做了“抢不到名额也不耽误国内工作”二手准备的人"
      ],
      verdict_avoid: [
        "没有驾照不敢在海外开右舵车，又抗拒去肉厂/奇异果包装厂干体力活的人",
        "轻信黑中介“交2.5万包抢名额+包分配农场工作”或落地打低于23.15纽币法定最低时薪华人黑工的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 30,
      education_min: "高中毕业学历（至少完成3年全日制高中教育，需学信网或公证认证）",
      physical_constraints: ["雅思总分≥5.5或PTE≥42分（2年内有效）", "通过指定医院胸片(X-ray)无肺结核体检", "持有4,200纽币存款证明"],
      prep_duration_days: { min: 60, max: 180 },
      official_zero_markup_cost_cny: {
        total_min: 7800,
        total_max: 11500,
        breakdown: [
          { item: "新西兰移民局(INZ)在线签证申请规费(抢中才付)", cost_cny: "2,900 - 3,400" },
          { item: "PTE / 雅思英语官方考位费", cost_cny: "2,000 - 2,170" },
          { item: "指定出国体检中心胸片检查与高中学历认证费", cost_cny: "800 - 1,300" },
          { item: "赴新西兰单程经济舱机票", cost_cny: "2,500 - 4,500" }
        ]
      },
      official_portal_url: "https://www.immigration.govt.nz",
      official_portal_name: "新西兰移民局官方网站（Immigration New Zealand - RealMe在线抢号系统）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "《中华人民共和国政府和新西兰政府自由贸易协定》工作假期安排议定书（年度1000配额条款）",
          authority: "中国商务部 / 新西兰外交贸易部"
        },
        {
          level: "L1",
          doc_name: "Immigration New Zealand Operational Manual: China Working Holiday Scheme (WI2.20)",
          authority: "新西兰商业、创新和就业部 (MBIE / INZ)"
        },
        {
          level: "L2",
          doc_name: "新西兰移民局认可语言成绩对标表 (Acceptable English Language Test Results)",
          authority: "Immigration New Zealand"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 近两年在纽中国 WHVer 税局(IRD)工资单与 L4 新西兰统计局最低时薪(23.15纽币/h)标准，受农业季节气候与找工空窗期影响显著。",
      net_income_stages: [
        { stage: "落地买车办卡与找工空窗期 (前2-5周)", monthly_cny_range: [0, 0], highlight: "未上工期间每周需倒贴房租伙食约1300-2000元人民币", duration_months: 1 },
        { stage: "常规最低时薪白工期 (果园/酒店/咖啡馆 40h/周)", monthly_cny_range: [13500, 15500], highlight: "扣除当地高房租与饮食后，每月约可净存7000-9000元", duration_months: 6 },
        { stage: "旺季高强度厂工期 (牛羊肉厂/奇异果晚班/海鲜厂)", monthly_cny_range: [18000, 23000], highlight: "含加班费与8%法定Holiday Pay结算，一年极限可净攒10-14万", duration_months: 5 }
      ],
      deal_breakers: [
        "【年度1000名额秒光】不同于澳洲抽签制，新西兰每年开放日当天拼网速抢号，个人纯手动极难抢过脚本，需做好抢不到名额的二手准备",
        "【6个月强制换雇主+看天吃饭】法律规定为同一雇主工作不得超过6个月（被迫频繁搬家找工）；且果园受下雨停工影响极大，无驾照不会开右舵车者在小镇寸步难行",
        "当前新西兰本地基础服务业岗位竞争激烈，若英语口语极差且不愿下厂干体力活，落地后可能面临超过1个月的失业消耗"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [12000, 28000],
        scam_alert: "1. 警惕淘宝/小红书收1.5万-2.5万的‘包抢名额+包安排农场工作’黑中介（常出现抢不到拖延退费或用违规信用卡代付导致拒签）。2. 落地严禁接受当地黑心华人老板低于法定最低时薪(23.15纽币)的现金黑工或无薪试工！"
      }
    }
  },
  {
    path_id: "PATH_034",
    title: "意大利公立大学免学费 + DSU大区政府助学金留学（本科/硕士）",
    batch_id: 'BATCH_4',
    policy_update_month: "每年 4-8 月（Universitaly 国际生预注册与DSU申请季）",
    pk_arena: 'STUDENT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35', 'STUDENT_15_18'],
    core_goals: ['SAVE_300K_3YR', 'BIAN_ZHI_STABLE'],
    scenario_tags: ["二本失业", "考研失利", "高考滑档", "低预算留学"],
    category: ["公立免学费", "政府发6000欧助学金", "英语/意语双通道"],
    status_light: "GREEN",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: true,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["意大利", "留学", "免学费", "DSU", "助学金", "米兰理工", "博洛尼亚", "考研失利", "高考滑档", "英语授课"],
    diy_action_steps: [
      "第一步：直接走【国际生通道(International Students)】（彻底绕开烧钱的马可波罗/图兰朵语言预科！），考出雅思 5.5-6.5 分申请意大利公立大学全英文授课硕士/本科（如米兰理工、博洛尼亚、都灵理工、帕多瓦大学）。",
      "第二步：在学校官网网申拿到录取 Offer 后，每年 4-7 月登录意大利大学与研究部唯一官方门户 (universitaly.it) 免费提交国际生预注册，并办理学信网+外交部海牙认证(Apostille)。",
      "第三步：同步准备家庭亲属关系、房产与低收入公证及海牙认证，在所录大学所在大区福利机构（如伦巴第大区 DSU、皮埃蒙特 EDISU、艾米利亚 ER.GO）官网在线提交 ISEE 助学金网申。",
      "第四步：凭近6个月真实稳定的家庭银行流水（余额约5万人民币，切忌临时大额存入）递交学签；入学后每年修满规定学分（20-30 CFU），即可稳拿每年 6,000-8,000 欧元政府现金补贴+免注册费+免费食堂！"
    ],
    pk_profile: {
      short_name: "034 意大利公立免学费+DSU助学金",
      badge: "0学费+领6000欧政府助学金 · 拿海归硕博",
      official_cost_avg: 8800,
      prep_months: 6,
      prep_label: "4-8个月考雅思+官网网申+DSU公证认证",
      hard_threshold: "18-32岁 · 本科申硕不卡双非/高考≥400分 · 雅思6.0",
      intern_months: 4,
      intern_monthly_net: 0,
      intern_label: "首学期9-12月落地垫付期(等12月底DSU助学金发放到账)",
      regular_monthly_net: 5200,
      regular_range: [4500, 6000],
      on_job_living_expense: 4500,
      working_months_per_year: 12,
      family_separation: {
        level: 'HIGH',
        text: "较高：赴意大利公立大学就读 2年(硕士) 或 3年(本科)，寒暑假可回国"
      },
      body_toll: "无体力损耗，但期末多为教授1对1口试(Esame Orale)，且第一年若修不够学分会被政府追讨已发助学金，学业精神压力大",
      ceiling_3yr: "极低成本获QS前150名校全日制硕士文凭，留欧起薪 ¥1.2万-1.8万/月，或回国留服认证后走海归选调/人才引进考公落户",
      agency_trap_diff: 45000,
      verdict_fit: [
        "普通双非二本考研失利，家里掏不起英美澳港30-50万留学学费，但想用3-4万启动垫付金拿下世界名校全日制硕士的人",
        "学习自制力强，能保证每年按时考过 25-30 个学分（CFU）以稳保 6,000-8,000 欧元大区政府助学金的人"
      ],
      verdict_avoid: [
        "想靠混日子水文凭的人（意大利公立宽进严出，修不够学分不仅停发次年助学金，还会被政府依法追回首年已发补贴！）",
        "父母银行卡近6个月无正常流水、试图在签证前几天突然存入5万块假流水的拒签高危人群"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 32,
      education_min: "申本科须高中毕业且高考≥400分（艺术类图兰朵折算≥400分）；申硕士须持有全日制本科学位证（不卡双非，无需高考分）",
      physical_constraints: ["申全英文授课须雅思5.5-6.5分；申意语授课须B1/B2证书", "递签须提供近6个月稳定家庭银行流水及约5万人民币活期余额"],
      prep_duration_days: { min: 120, max: 270 },
      official_zero_markup_cost_cny: {
        total_min: 6500,
        total_max: 11500,
        breakdown: [
          { item: "意大利公立大学学费 (国家财政拨款)", cost_cny: "0 (免学费，仅收156欧起注册印花税)" },
          { item: "学信网认证 + 外交部海牙认证(Apostille) + 使馆价值声明(应届免费)", cost_cny: "800 - 2,000" },
          { item: "亲属关系/低收入房产公证与海牙认证 (用于申领DSU助学金)", cost_cny: "1,200 - 2,000" },
          { item: "意大利留学签证费 + 赴意单程机票", cost_cny: "4,200 - 6,500" }
        ]
      },
      official_portal_url: "https://www.universitaly.it",
      official_portal_name: "意大利大学与研究部官方预注册门户 (Universitaly) / 意大利教育中心",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "《中意关于相互承认高等教育学位的协议》及意大利大学与研究部(MUR)年度国际生招生法令",
          authority: "中华人民共和国教育部 / 意大利大学与研究部 (MUR)"
        },
        {
          level: "L1",
          doc_name: "意大利教育部《大学学习权利助学金(DSU)最低标准与ISEE经济上限法令》",
          authority: "Ministero dell'Università e della Ricerca (MUR)"
        },
        {
          level: "L2",
          doc_name: "意大利驻华大使馆文化处(Uni-Italia)学习签证材料清单与免收应届生认证费公告",
          authority: "意大利驻华大使馆 / 各大区助学金机构 (EDISU / DSU)"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 米兰理工、博洛尼亚大学、都灵大学中国留学生 DSU 助学金到账单及 L4 AlmaLaurea 官方毕业率报告，助学金金额取决于家庭房产收入公证折算的 ISEE 值。",
      net_income_stages: [
        { stage: "第一学期落地垫付期 (9月-12月，等助学金发放)", monthly_cny_range: [0, 0], highlight: "前4个月需自备约3-4万元人民币支付机票、房租押金与初期生活费", duration_months: 4 },
        { stage: "成功申领DSU全额助学金期 (每年6000-8000欧元)", monthly_cny_range: [4500, 6000], highlight: "政府发放现金补贴+免注册费+食堂免费餐，在二线城市基本覆盖全年吃住", duration_months: 20 },
        { stage: "毕业留欧找工作居留期 (或回国认证享受海归落户/考公待遇)", monthly_cny_range: [12000, 18000], highlight: "理工/设计类在欧起薪约1600-2200欧/月，回国等同全日制统招硕博", duration_months: 12 }
      ],
      deal_breakers: [
        "【修不够学分要退钱！】首年拿DSU助学金极易（只看家庭低收入证明），但若第一学年结束未考够规定学分(通常20-30个CFU)，大区政府不仅停发次年补助，还会依法追讨已发给你的几千欧元现金！",
        "【宽进严出与一对一口试】公立大学期末多为教授1对1口试(Esame Orale)，无平时分放水，语言不好极易挂科延毕（本科3年按时毕业率不足45%）",
        "【签证严打假流水】使馆极其严查父母近6个月银行流水，若平时无进账、递签前突然存入几万块大额资金，会被直接拒签！"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [25000, 80000],
        scam_alert: "1. 申请全英文授课硕士直接走【国际生通道】即可0语言学费直录，切勿被黑中介忽悠去走‘马可波罗计划’白交5-8万国内外私立语言学校预科费！2. DSU助学金完全按公证书ISEE公式由政府系统自动核定，凡收1.5万所谓‘助学金公关包过费’纯属骗钱！"
      }
    }
  },
  {
    path_id: "PATH_035",
    title: "教育部语合中心国际中文教育志愿者（国家公派海外任教）",
    batch_id: 'BATCH_4',
    policy_update_month: "每年 10-11 月 & 3-4 月（语合中心分批招募）",
    pk_arena: 'STUDENT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35'],
    core_goals: ['SAVE_300K_3YR', 'BIAN_ZHI_STABLE'],
    scenario_tags: ["二本失业", "考研失利", "文科/外语突围", "低成本出海"],
    category: ["国家部委公派", "免税美元津贴", "包住宿报销机票"],
    status_light: "GREEN",
    last_verified_date: "2026-11-13",
    includes_free_board_lodging: true,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["语合中心", "国际中文教育", "汉办", "对外汉语", "公派海外", "志愿者", "文科突围", "免税美元津贴", "泰国任教"],
    diy_action_steps: [
      "第一步：在大四应届毕业前（每年10-11月第一批或次年3-4月第二批，切记不可等到6月毕业离校后！），登录教育部中外语言交流合作中心项目管理平台 (https://pmplatform.chinese.cn) 注册并在线填报中英文申请表。",
      "第二步：下载打印申请表，交由所在高校教务处/国际合作处或研究生院审核盖章，由学校统一推荐报送省级教育厅或语合中心（全程0元报名费）。",
      "第三步：参加语合中心组织的综合能力视频面试（重点考察中华才艺、跨文化交际、汉语教学实操与外语口语）与心理测试。",
      "第四步：面试通过后参加4-6周国家全额免费岗前集中培训，办理出入境体检与公证（约300-1000元），由语合中心统一办理公派签证并全额购买国际往返机票赴海外任教。"
    ],
    pk_profile: {
      short_name: "035 教育部公派国际中文志愿者",
      badge: "国家公派 · 免税美元津贴+包住+报销机票",
      official_cost_avg: 750,
      prep_months: 4,
      prep_label: "校内盖章推荐+视频面试+免费岗前培训",
      hard_threshold: "20-32岁 · 本科应届或在读研(不卡二本) · 四级≥425/普话二乙",
      intern_months: 1.5,
      intern_monthly_net: 0,
      intern_label: "4-6周教育部语合中心全免费脱产岗前培训",
      regular_monthly_net: 6200,
      regular_range: [5600, 15000],
      on_job_living_expense: 1200,
      working_months_per_year: 11,
      family_separation: {
        level: 'HIGH',
        text: "较高：公派赴东南亚、中东、拉美或欧洲中小学/大学任教1-3年（包住宿且报销国际往返机票）"
      },
      body_toll: "无体力损耗；但海外学校往往仅1名中国老师，每周18-24节课加文化展演活动较繁重",
      ceiling_3yr: "东南亚任教1年净攒5-6万免税津贴，期满留任海外国际学校或中资出海企业（月薪1.2万-1.8万），或回国算基层工龄考特岗/教招",
      agency_trap_diff: 34000,
      verdict_fit: [
        "大四即将毕业或研一研二在读的文科/外语/教育类学生（含普通二本与民办本科），想用不到1000元极低成本公派合法出海攒下第一桶金并积累海外履历的人",
        "英语四级≥425分、普通话达标，喜欢跨文化教学且希望包住宿、国家全额报销往返国际机票的人"
      ],
      verdict_avoid: [
        "已经毕业离校变成社会往届生的人（系统严格要求通过就读高校盖章推荐，毕业离校后无高校推荐通道）",
        "误以为语合中心志愿者也享受‘考研初试加10分’的人（注意：仅PATH_021西部计划/三支一扶等享全国统考+10分，语合中心不享受全国统一考研加10分）"
      ]
    },
    track_a_hard_facts: {
      age_min: 20,
      age_max: 32,
      education_min: "国内普通高校本科及以上应届毕业生或在读研究生（含二本/民办本科，不卡双一流）",
      physical_constraints: ["须在大四应届期或研究生在读期间报名（社会往届生无高校推荐通道）", "大学英语四级≥425分，普通话二级乙等（中文相关专业须二级甲等）及以上"],
      prep_duration_days: { min: 90, max: 150 },
      official_zero_markup_cost_cny: {
        total_min: 300,
        total_max: 1200,
        breakdown: [
          { item: "教育部语合中心报名、选拔面试、4-6周岗前培训及签证费", cost_cny: "0 (国家全额承担)" },
          { item: "赴任国国际往返机票与海外医疗意外保险", cost_cny: "0 (国家全额报销购买)" },
          { item: "出入境体检与无犯罪记录公证费", cost_cny: "300 - 1,000" }
        ]
      },
      official_portal_url: "https://pmplatform.chinese.cn",
      official_portal_name: "中外语言交流合作中心项目管理平台（教育部语合中心官方唯一报名门户）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "教育部中外语言交流合作中心《国际中文教育志愿者管理办法》及《生活待遇管理规定》",
          authority: "中华人民共和国教育部中外语言交流合作中心 (CLEC)",
          source_url: "https://www.chinese.cn"
        },
        {
          level: "L1",
          doc_name: "教育部语合中心年度《国际中文教育志愿者报名通知》（上/下半年招募公告）",
          authority: "教育部中外语言交流合作中心 (pmplatform.chinese.cn)",
          source_url: "https://pmplatform.chinese.cn"
        },
        {
          level: "L2",
          doc_name: "各省教育厅国际合作与交流处及各高校国际学院国际中文教育志愿者遴选通知",
          authority: "省级教育厅 / 各招募高校"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 赴泰国、印尼、阿联酋、匈牙利及拉美国家在任志愿者津贴流水与教学排班复盘，东南亚岗位因当地物价低攒钱最多，欧美岗位津贴基本刚好覆盖当地食宿。",
      net_income_stages: [
        { stage: "国内网报、视频面试与4-6周岗前培训期", monthly_cny_range: [0, 0], highlight: "培训免费，考核合格即与语合中心签订正式派出协议", duration_months: 4 },
        { stage: "东南亚国家海外任教期 (泰国/印尼/老挝等，包住宿)", monthly_cny_range: [5600, 6200], highlight: "每月领800美元免税津贴+1000美元安家费，当地物价极低，一年纯攒5-6万", duration_months: 12 },
        { stage: "中东/拉美/非洲/部分欧美岗位 (或期满留任国际学校)", monthly_cny_range: [6500, 15000], highlight: "公派津贴900-1000美元/月；期满留任当地国际学校或中资出海企业月薪可达1.2-1.8万", duration_months: 12 }
      ],
      deal_breakers: [
        "【严卡大四应届黄金窗口】每年10-11月及3-4月招募，一旦6月毕业拿到毕业证离开学校，即丧失应届生身份无法报名，必须提前半年卡点网报",
        "【教学与文化活动任务繁重】海外中小学往往全校只有你1名中国老师，每周需上18-24节中文课并组织各类春节/端午文化展演，绝非公费旅游",
        "【注意区分政策差异】志愿者服务期算工龄且部分省份考公/特岗有倾斜，但不同于‘西部计划’，语合中心志愿者并不享受全国统一考研初试加10分政策"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [25000, 45000],
        scam_alert: "【防诈铁律】社会劳务中介常收3-4万把文科生送去泰国私立学校当廉价外教（月薪仅4000元还要自己租房买机票）。走教育部语合中心官方通道(pmplatform.chinese.cn)0元中介费，国家倒贴每月800-1000美元、包住宿且全额报销往返国际机票！"
      }
    }
  },
  {
    path_id: "PATH_041",
    title: "深圳个人破产条例 / 浙江个人债务集中清理（诚实而不幸债务人法定免责重整）",
    batch_id: 'BATCH_5',
    policy_update_month: "常年法定受理（深圳破产事务管理署 / 浙江移动微法院）",
    pk_arena: 'ADULT_PK',
    domain: 'SAFE_DESK_GUARD',
    identity_group: ['MIDLIFE_35_55', 'YOUTH_18_35'],
    core_goals: ['URGENT_30D_CASH', 'DAILY_HOME_FAMILY'],
    scenario_tags: ["负债重启", "35+被裁", "中年托底"],
    category: ["法定债务止损", "停止催收计息", "保留基本生活费"],
    status_light: "GREEN",
    last_verified_date: "2026-11-12",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["负债", "欠债", "破产", "个人破产", "债务重组", "催收", "停息", "强制执行"],
    diy_action_steps: [
      "第一步：核查自身户籍/社保所在地是否属于法定试点区域（1. 深圳连续参保满3年可走《深圳经济特区个人破产条例》；2. 浙江、江苏、山东等地户籍被执行人可向当地基层人民法院申请《个人债务集中清理》）。",
      "第二步：深圳居民直接通过‘深破茧’小程序、深圳个人破产案件信息网 (https://birp.szcourt.gov.cn) 或全国企业破产重整案件信息网 (https://pccz.court.gov.cn) 查询法定程序并预约深圳市破产事务管理署免费公职辅导，切勿轻信网上收2万元定金的‘反催收法务公司’。",
      "第三步：如实向法院申报过去3年全部财产流水、债权人名单及创业失败/重病失业证据（核心红线：严禁隐匿转移财产或赌博挥霍，必须属于‘诚实而不幸’）。",
      "第四步：法院裁定受理后，法定立即【停止全部债务计息、中止强制执行与催收】，每月依法保留债务人及抚养家属基本生活必需费用（深圳标准约每月4500-6500元），履行3-5年重整/考察期后依法免除剩余未清偿债务！"
    ],
    pk_profile: {
      short_name: "041 法定个人破产/债务清理",
      badge: "法院裁定停息止催 · 保留基本生活费",
      official_cost_avg: 0,
      prep_months: 2,
      prep_label: "1-2个月破产署/法院免费辅导与财产申报",
      hard_threshold: "深圳参保满3年或浙苏鲁试点地 · 诚实而不幸无赌博欺诈",
      intern_months: 3,
      intern_monthly_net: 4800,
      intern_label: "法院受理审查期(依法停止计息与执行)",
      regular_monthly_net: 5500,
      regular_range: [4500, 7500],
      on_job_living_expense: 4500,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "极低：在本地正常打工工作，法院依法豁免保留本人及未成年子女基本生活费与租房费"
      },
      body_toll: "无体力损耗，但3年免责考察期内受严格限制高消费约束（禁乘飞机头等舱/高铁一等座、禁买房买车），心理需承受财务全面公开透明",
      ceiling_3yr: "度过3年免责考察期或按重整计划清偿10%-30%本金后，法院裁定彻底免除百万级连带担保/创业债务，信用与人生合法清零重启",
      agency_trap_diff: 35000,
      verdict_fit: [
        "因创业失败、企业连带担保、重大疾病或失业导致资不抵债（负债30万-500万+），靠普通打工一辈子连利息都还不清的人",
        "符合深圳3年社保或浙江/江苏/山东法院个人债务集中清理试点条件，且无赌博、无恶意转移资产的诚实债务人"
      ],
      verdict_avoid: [
        "因网络赌博、炒币投机、挥霍消费致债，或企图把房产转移给亲戚后‘假破产逃废债’的人（一经查实直接移送公安追究虚假破产罪）",
        "轻信短视频广告“全国不限户籍交1.5万代理费包办停息挂账/债务托管”的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 65,
      education_min: "不限学历（具备完全民事行为能力自然人）",
      physical_constraints: ["属于‘诚实而不幸’债务人（无赌博、挥霍、欺诈转移财产行为）"],
      prep_duration_days: { min: 30, max: 90 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 500,
        breakdown: [
          { item: "深圳市破产事务管理署申请前债务辅导与面谈费", cost_cny: "0 (政府公共服务全免)" },
          { item: "人民法院个人破产/个人债务集中清理立案受理费", cost_cny: "0 (依法免交或从破产财产中优先拨付)" },
          { item: "个人征信、银行流水及产权查册打印工本费", cost_cny: "100 - 500" }
        ]
      },
      official_portal_url: "https://birp.szcourt.gov.cn",
      official_portal_name: "深圳个人破产案件信息网 / 全国破产重整案件信息网 (pccz.court.gov.cn)",
      l1_l2_sources: [
        { level: "L1", doc_name: "《深圳经济特区个人破产条例》（深圳市六届人大常委会公告第208号 · 全国首部个人破产地方性法规）", authority: "深圳市人大常委会 / 深圳市中级人民法院", source_url: "https://birp.szcourt.gov.cn" },
        { level: "L1", doc_name: "最高人民法院《关于深化执行改革健全解决执行难长效机制的意见》及浙江高院《浙江法院个人债务集中清理（类个人破产）工作指引》", authority: "最高人民法院 / 浙江省高级人民法院", source_url: "https://pccz.court.gov.cn" },
        { level: "L2", doc_name: "深圳市破产事务管理署《个人破产申请前辅导工作规程与豁免财产清单标准》", authority: "深圳市破产事务管理署", source_url: "https://birp.szcourt.gov.cn" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 深圳中院个人破产重整/破产清算裁定书及浙江法院个人债务清理典型案例核验，每月豁免生活费按当地最低生活保障与抚养人数核定。",
      net_income_stages: [
        { stage: "申请前债务辅导与立案审查期", monthly_cny_range: [3500, 5000], highlight: "法院裁定受理即刻停止全网催收与罚息滚动", duration_months: 3 },
        { stage: "3-5年重整执行 / 免责考察期（保留生活费）", monthly_cny_range: [4500, 6800], highlight: "合法保留租房+基本生活+子女抚养费，超额部分按比例还债", duration_months: 36 },
        { stage: "期满法院裁定免除剩余债务后", monthly_cny_range: [6500, 15000], highlight: "剩余本息法定一笔勾销，恢复正常储蓄与经营", duration_months: 12 }
      ],
      deal_breakers: [
        "【区域硬限制】目前仅深圳（参保满3年）及浙江、江苏、山东、福建等高院辖区开展类个人破产/债务清理，非试点地区需直接与银行官方客服协商个性化分期（《商业银行信用卡监督管理办法》第70条）",
        "考察期内个人微信、支付宝、银行卡每一笔收支均须按月向破产管理人申报公示，毫无财务隐私可言",
        "一旦被管理人查出曾向亲友隐瞒转移过哪怕数万元资产，不仅立刻撤销免责，还会直接移送公安机关追究刑责"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [15000, 60000],
        scam_alert: "头号血泪坑：短视频上所有叫嚣‘交5%-10%债务金额给法务公司，全国包办停息挂账、反催收、债务打一折清零’100%是诈骗！他们只是收你几万块钱然后帮你换张电话卡或伪造贫困证明（涉刑）！协商分期请直接打银行信用卡背面官方客服电话（0成本），法定重整请直接去法院或深圳破产署！"
      }
    }
  },
  {
    path_id: "PATH_046",
    title: "特种设备承压焊工：氩弧焊 / 氩电联焊（特种设备代号 GTAW / SMAW）",
    batch_id: 'BATCH_5',
    policy_update_month: "现行有效（TSG Z6002-2026，2026年8月1日起施行）",
    pk_arena: 'ADULT_PK',
    domain: 'CERT_TRADES',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55'],
    core_goals: ['SAVE_300K_3YR'],
    scenario_tags: ["大专蓝领", "负债重启", "二本失业"],
    category: ["国家准入技能", "零资产储蓄", "蓝领出海"],
    status_light: "GREEN",
    last_verified_date: "2026-11-11",
    includes_free_board_lodging: true,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: true,
    keywords: ["焊工", "氩弧焊", "高压焊", "特设焊工", "管道焊", "白班", "高薪手艺"],
    diy_action_steps: [
      "第一步：先在应急管理部备案考点考取基础《熔化焊接与热切割作业》特种作业操作证（底线入场券，费用约700-1100元）。",
      "第二步：选择公办技师学院、船厂附属焊培中心或特检院合作实训基地，专攻手工钨极氩弧焊（GTAW/TIG）不锈钢薄板与管道单面焊双面成型（切勿报只给几块废铁练平焊的野鸡速成班）。",
      "第三步：实操练稳后，在当地特种设备检验研究院报考《特种设备作业人员证·承压焊工》，通过X光射线无损探伤拍片合格（核心高薪分水岭）。",
      "第四步：进入船厂、半导体洁净管道工程、核电/火电安装项目部或石化压力容器厂，按日薪（400-550元/天）或拍片合格率拿高薪。"
    ],
    pk_profile: {
      short_name: "046 特种承压氩弧焊工",
      badge: "日薪450+硬手艺 · 探伤拍片说话",
      official_cost_avg: 4500,
      prep_months: 2,
      prep_label: "45-60天管材实训+特检院拍片考",
      hard_threshold: "18-55岁 · 初中起 · 视力好手极稳",
      intern_months: 3,
      intern_monthly_net: 6200,
      intern_label: "前3个月制造业不锈钢薄板/小管径跟师焊",
      regular_monthly_net: 11500,
      regular_range: [8500, 16500],
      on_job_living_expense: 900,
      working_months_per_year: 10.5,
      family_separation: {
        level: 'MEDIUM',
        text: "中等：进本地机械厂可每天回家；若跟石化/电建/半导体洁净管安装工程队驻场则需外地住宿舍"
      },
      body_toll: "电弧强紫外线辐射易伤眼脱皮，夏季穿厚重阻燃服极其闷热；必须严格戴防尘面罩防金属焊烟",
      ceiling_3yr: "考下6G高压管道全位置焊证，日薪达500-650元/天，或申请澳洲/日本/新加坡合规技术工签出海",
      agency_trap_diff: 12000,
      verdict_fit: [
        "手部控制极稳、能静下心钻研手艺，希望掌握一门“不看人脸色、凭探伤拍片合格率拿日薪过万”硬技术的人",
        "手头有 1万-1.5万 启动缓冲，能承担2个月脱产实训耗材成本的人"
      ],
      verdict_avoid: [
        "手部有轻微震颤、高度近视散光无法看清高温熔池铁水走向的人",
        "怕热、怕火花飞溅烫伤皮肤或抗拒穿戴全套防护劳保用品的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 55,
      education_min: "初中及以上",
      physical_constraints: ["裸眼或矫正视力良好（需看清熔池）", "手部极度稳定无手抖", "无尘肺及慢性呼吸系统疾病"],
      prep_duration_days: { min: 45, max: 75 },
      official_zero_markup_cost_cny: {
        total_min: 3200,
        total_max: 5800,
        breakdown: [
          { item: "应急管理部熔化焊接与热切割操作证考试培训", cost_cny: "700 - 1,100" },
          { item: "公办技校/船厂实训中心30-45天氩弧焊管材与氩气实操耗材费", cost_cny: "1,800 - 3,500" },
          { item: "市场监管局（特检院）特种设备承压焊工探伤考核费", cost_cny: "700 - 1,200" }
        ]
      },
      official_portal_url: "http://cnse.e-cqs.cn",
      official_portal_name: "全国特种设备公示信息查询平台",
      l1_l2_sources: [
        { level: "L1", doc_name: "《特种设备焊接操作人员考核细则》（TSG Z6002-2026，2026年8月1日起施行，已替代废止2010版）", authority: "国家市场监督管理总局", source_url: "https://www.samr.gov.cn" },
        { level: "L1", doc_name: "《特种作业人员安全技术培训考核管理规定》（熔化焊接与热切割）", authority: "应急管理部", source_url: "https://www.mem.gov.cn" },
        { level: "L2", doc_name: "各省特种设备检验研究院焊接操作人员考试中心收费及拍片探伤标准", authority: "省级特检院", source_url: "http://cnse.e-cqs.cn" }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 长三角造船厂、洁净厂房管道工程及压力容器厂劳务工单核验，焊工收入完全取决于‘探伤拍片一次合格率’。",
      net_income_stages: [
        { stage: "二保焊/普通结构件平焊新手", monthly_cny_range: [5500, 7200], highlight: "制造业工厂计件，烟尘大、练基本功", duration_months: 3 },
        { stage: "熟练不锈钢氩弧焊工（洁净管/食品机械）", monthly_cny_range: [8500, 11500], highlight: "烟尘极少，日薪350-420元包住", duration_months: 6 },
        { stage: "持6G高压管焊/特设承压证（拍片包过）", monthly_cny_range: [12000, 16500], highlight: "日薪480-600元，石化/电建/船厂抢手", duration_months: 12 }
      ],
      deal_breakers: [
        "电弧紫外线辐射极强，防护不当易得‘电光性眼炎’（打眼）及皮肤脱皮；夏季穿厚重阻燃焊工服作业汗如雨下",
        "普通碳钢二保焊烟尘与锰化合物粉尘大，必须坚持佩戴3M防尘面罩，否则长期易伤肺；强烈建议主攻洁净度高的氩弧焊",
        "工程项目制焊工常需随项目驻扎外地工地或船厂宿舍，不适合要求每天穿西装坐办公室的人群"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [12800, 22000],
        scam_alert: "焊工耗材确实比叉车贵（需消耗大量焊丝、不锈钢管和氩气），但正规技校含耗材绝不超过4000-5000元！凡收1.5万-2万宣称‘包分配进中石油/央企正式编、月薪保底2万’均为劳务外包骗局。"
      }
    }
  },
  {
    path_id: "PATH_054",
    title: "海外 AI 大模型数据标注与 RLHF 专家（Outlier / DataAnnotation / Mercor）",
    batch_id: 'BATCH_5',
    policy_update_month: "常年开放注册（随大模型训练批次动态更新任务池）",
    pk_arena: 'ADULT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55'],
    core_goals: ['URGENT_30D_CASH', 'DAILY_HOME_FAMILY'],
    scenario_tags: ["二本失业", "考研失利", "数字游民", "宝妈居家"],
    category: ["居家赚美元", "无需编程背景", "全球独立承包商"],
    status_light: "YELLOW",
    last_verified_date: "2026-11-14",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["AI标注", "RLHF", "数据标注", "Outlier", "DataAnnotation", "Mercor", "Scale AI", "居家赚美元", "数字游民", "宝妈居家", "远程工作", "W-8BEN"],
    diy_action_steps: [
      "第一步：直接访问 Outlier 官方专家门户 (https://outlier.ai)、DataAnnotation (dataannotation.tech) 或 Mercor 官网，按自身专业选择‘中文母语写作与逻辑评估(Chinese Writers/Generalist)’或‘数学/法律/医学/编程专家’通道免费注册（全程0元，严禁买中介内推链接！）。",
      "第二步：使用本人有效护照或二代身份证在稳定单一IP环境下完成 Persona 实名活体认证（切记：严禁使用任何AI插件、严禁频繁切换代理节点或多人共用账号）。",
      "第三步：精读20-50页全英文项目评估指南（Rubric），独立完成入门考核与项目资格测试（注意用地道英文详细写出模型回答A优于B的Factuality与Instruction Following理由）。",
      "第四步：在线签署美国国税局 IRS Form W-8BEN 非美国居民税务声明（依法豁免30%美国预扣税），绑定本人 PayPal 或 AirTM 账户，每周二/周三自动结算美元时薪（$18-$45/h）。"
    ],
    pk_profile: {
      short_name: "054 海外AI大模型RLHF评估专家",
      badge: "0元官网直申 · 居家时薪$18-$45美元周结",
      official_cost_avg: 0,
      prep_months: 0.5,
      prep_label: "7-21天全英文评估规范研读+入门测试",
      hard_threshold: "18-55岁 · 本科起 · 须无障碍读写英文评估指南 · 严防EQ断档",
      intern_months: 0.5,
      intern_monthly_net: 750,
      intern_label: "前1-2周入门考核与低薪测试期(通过率20%-35%)",
      regular_monthly_net: 9500,
      regular_range: [8000, 26000],
      on_job_living_expense: 1500,
      working_months_per_year: 9,
      family_separation: {
        level: 'LOW',
        text: "极低：100%居家远程独立承包商，无需打卡坐班，可自由支配时间照顾家庭"
      },
      body_toll: "无体力劳动；但长时间高强度盯着全英文指南做事实核查(Fact-checking)极耗脑力，且时刻承受平台反作弊误封与Empty Queue断粮焦虑",
      ceiling_3yr: "学科专家（法律/医学/数学/STEM）叠加Mission奖金月入可达1.6万-2.6万，或晋升项目Reviewer/QM（质检审核员）获更稳工时",
      agency_trap_diff: 6400,
      verdict_fit: [
        "18-55岁拥有本科及以上学历、英语读写扎实（六级/雅思6.5水平），希望0成本居家赚美元周结的失业过渡者、考研二战党、宝妈或数字游民",
        "中文功底深厚或具备数学、法律、医学、金融、代码等垂直学科背景，能严格遵守英文Rubric不用ChatGPT作弊的人"
      ],
      verdict_avoid: [
        "背负高额刚性房贷、指望每个月旱涝保收拿固定死工资的人（大模型训练存在Empty Queue任务断档期，可能连续几周无单）",
        "英语阅读吃力、习惯用AI代写答案或轻信小红书‘交4980元买内部保过题库/免考账号’的人（100%触发反作弊秒封号且没收余额）"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 55,
      education_min: "全日制本科及以上学历（中文/外语/法律/医学/数学/逻辑推理等学科专家优先）",
      physical_constraints: ["须能无障碍阅读20-50页全英文项目评估规范并用英文撰写评估理由", "持有有效护照或二代身份证完成实名活体认证", "自备高性能电脑与稳定国际网络"],
      prep_duration_days: { min: 7, max: 21 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 0,
        breakdown: [
          { item: "Outlier / DataAnnotation / Mercor 官网注册与入门评估测试", cost_cny: "0 (平台100%免费开放)" },
          { item: "美国国税局 IRS Form W-8BEN 非美居民税务声明在线签署", cost_cny: "0 (依法豁免30%美国预扣税)" }
        ]
      },
      portal_tier: "COMMERCIAL_FIRST_PARTY",
      official_portal_url: "https://outlier.ai",
      official_portal_name: "Outlier AI 官方专家门户 / DataAnnotation Tech (商业平台一手入口)",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "美国国税局 (IRS) 《Instructions for Form W-8BEN》（非美国居民外国个人境外独立劳务免税规则）",
          authority: "Internal Revenue Service (U.S. Department of the Treasury)",
          source_url: "https://www.irs.gov/forms-pubs/about-form-w-8-ben"
        },
        {
          level: "L2",
          doc_name: "Outlier AI / Scale AI 官方独立承包商服务条款与结算规则（商业平台一手条款，平台有权单方面调整费率与封禁）",
          authority: "Scale AI / Outlier",
          source_url: "https://outlier.ai/legal/terms-of-use"
        },
        {
          level: "L2",
          doc_name: "DataAnnotation.tech 官方准入评估与计薪规范（商业平台一手规则）",
          authority: "DataAnnotation Tech",
          source_url: "https://www.dataannotation.tech"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 国内活跃 AI 评估员每周 PayPal 美元结算流水与封号复盘帖采集，受大模型训练周期影响，任务池存在明显断档期(EQ)。",
      net_income_stages: [
        { stage: "全英文入门考核与项目资格测试期 (前1-2周)", monthly_cny_range: [0, 1500], highlight: "测试期多为无薪或低薪，评估规范极细，通过率约20%-35%", duration_months: 0.5 },
        { stage: "稳健兼职输出期 (每周15小时，时薪$18-$25美元)", monthly_cny_range: [8000, 11000], highlight: "每周二/周三自动结算美元至PayPal/AirTM，适合居家副业", duration_months: 6 },
        { stage: "学科专家爆单期 (法律/医学/数学/中文训练高峰，时薪$30-$45)", monthly_cny_range: [16000, 26000], highlight: "叠加周末Mission额外奖金周入可达$800+，但需防备项目结束后的断档期", duration_months: 6 }
      ],
      deal_breakers: [
        "【任务断档期(EQ)收入归零风险】项目随大模型训练周期动态上下线，一旦任务池清空(Empty Queue)可能连续数周0收入，绝不能当作固定月薪工作来背刚性房贷",
        "【变态级反作弊一秒封号】严禁使用ChatGPT等AI工具代写答案或频繁跨标签页复制粘贴，后台算法一旦触发风控直接永久封号并没收当周未结算美元余额",
        "【地理位置与IP严控】DataAnnotation限制大陆IP直接注册，Outlier严禁频繁切换代理节点，IP环境不稳定极易导致账号被判异常封禁"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [3980, 8800],
        scam_alert: "【防诈铁律】Outlier、Mercor等平台官网100%免费注册！小红书上收4000-8000元卖‘海外AI标注免考内推链接’或‘保过答案库’的全是割韭菜骗局（背雷同答案会直接触发平台反作弊集体封号）！"
      }
    }
  },
  {
    path_id: "PATH_056",
    title: "国际中文在线独立教师（Preply / iTalki 独立教师通道）",
    batch_id: 'BATCH_5',
    policy_update_month: "每周动态开放申请（iTalki每周一更新开放语种状态）",
    pk_arena: 'ADULT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55', 'SENIOR_50_PLUS'],
    core_goals: ['DAILY_HOME_FAMILY', 'SAVE_300K_3YR'],
    scenario_tags: ["宝妈居家", "二本失业", "文科/外语突围", "数字游民"],
    category: ["零成本居家创业", "自主定价赚美元", "长期复购资产"],
    status_light: "GREEN",
    last_verified_date: "2026-11-14",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["国际中文教师", "对外汉语", "iTalki", "Preply", "CTCSOL", "宝妈居家", "文科突围", "赚美元", "数字游民", "在线中文老师"],
    diy_action_steps: [
      "第一步：避开任何卖山寨‘IPA/ACI国际汉语教师证’的培训班！直接用电脑录制一段1-3分钟真诚自然的双语自我介绍视频（展示发音清晰度、亲和力与教学方法，严格遵守平台不加边框水印要求）。",
      "第二步：每周一查看 iTalki 教师申请页面 (https://teach.italki.com) 的中文语种开放状态，并同步在 Preply 官网 (preply.com/en/teach) 免费注册辅导教师账号（0元注册费，无强制证书门槛；若后续想升级职业教师只考教育部语合中心唯一权威《国际中文教师证书》CTCSOL）。",
      "第三步：精心打磨3套结构化数字教材（如《零基础生存口语》《HSK 1-6级标准教程PDF》《商务汉语/儿童绘本》），首月将课时费定在 $8-$12/小时 快速吸引前10名外国学生并攒齐10条五星文字好评。",
      "第四步：每攒满15-20节好评课即阶梯式将新学生单价上调至 $16-$28/小时，锁定10-15名欧美/日韩/海外华裔长期周更复购学生，通过 Payoneer（派安盈）或 PayPal 合规结汇提现。"
    ],
    pk_profile: {
      short_name: "056 国际中文独立教师 (iTalki/Preply)",
      badge: "0元免费入驻 · 居家自主定价赚美元复购",
      official_cost_avg: 0,
      prep_months: 0.5,
      prep_label: "7-14天录制介绍视频+打磨课件+平台审核",
      hard_threshold: "18-60岁 · 不卡学历/证书 · 普通话标准+基础英语沟通",
      intern_months: 2,
      intern_monthly_net: 2600,
      intern_label: "前1-2个月冷启动破冰期($8-$12/h攒首批五星好评)",
      regular_monthly_net: 11500,
      regular_range: [9000, 25000],
      on_job_living_expense: 1200,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "极低：100%居家在线1对1授课，每天陪家人，积累老学生后成为长期复购个人现金流资产"
      },
      body_toll: "无体力损耗；但连续视频讲话费嗓子，且若主攻北美/欧洲上班族学生需适应北京时间晚20:00至24:00授课",
      ceiling_3yr: "转型商务汉语/HSK冲刺/海外华裔少儿专项名师，单价$28-$40/h，月净入1.6万-2.5万人民币",
      agency_trap_diff: 9800,
      verdict_fit: [
        "18-60岁普通话标准、具备基础英语（或日韩西法语）交流能力的宝妈、文科/外语失业青年或退休教师，想0成本开启居家美元副业/主业的人",
        "有耐心度过前2个月冷启动获客期、愿意用心打磨课件并维护老学生长期复购的人"
      ],
      verdict_avoid: [
        "幻想‘注册第二天平台就自动派满单、不用备课直接躺赚’的急功近利者（前两个月需主动优化视频与试听课转化率）",
        "轻信国内机构花6800-12800元考所谓‘IPA/ACI国际注册汉语教师证包推荐上岗’的人（国家多次辟谣的山寨废纸！）"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 60,
      education_min: "iTalki 辅导教师(Community Tutor)及 Preply 教师均无强制学历与资格证门槛（本科/持CTCSOL证书可申职业教师提高定价）",
      physical_constraints: ["母语为中文且普通话标准清晰", "具备基础英语（或日韩西语）日常沟通能力以应对零基础外国学生", "自备高清摄像头、降噪麦克风电脑及稳定网络"],
      prep_duration_days: { min: 7, max: 30 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 0,
        breakdown: [
          { item: "iTalki / Preply 教师账号注册、主页审核与排课系统使用", cost_cny: "0 (平台100%免费)" },
          { item: "正式课时平台服务费抽成 (iTalki固定15%；Preply按课时从33%降至18%)", cost_cny: "按实际成交课时比例扣除，无前期费用" }
        ]
      },
      portal_tier: "COMMERCIAL_FIRST_PARTY",
      official_portal_url: "https://teach.italki.com",
      official_portal_name: "iTalki 国际教师申请官网 / Preply 教师官网 (商业平台一手入口)",
      l1_l2_sources: [
        {
          level: "L2",
          doc_name: "iTalki Official Teacher Application Requirements & Commission Policy（15% Flat Fee · 商业平台一手条款）",
          authority: "iTalki HK Limited",
          source_url: "https://teach.italki.com"
        },
        {
          level: "L2",
          doc_name: "Preply Official Tutor Commission Model & Payout Guidelines（商业平台一手条款）",
          authority: "Preply Inc.",
          source_url: "https://preply.com/en/teach"
        },
        {
          level: "L1",
          doc_name: "教育部中外语言交流合作中心《国际中文教师证书》(CTCSOL) 考试大纲（唯一官方权威背书证书）",
          authority: "中华人民共和国教育部中外语言交流合作中心 (chineseteacher.org.cn)",
          source_url: "https://www.chineseteacher.org.cn"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 iTalki 与 Preply 资深中文独立教师后台课时统计与美元提现流水整理，前2个月冷启动获客期单量较少。",
      net_income_stages: [
        { stage: "冷启动破冰期 (第1-2个月，定价$8-$12/h攒首批五星好评)", monthly_cny_range: [1800, 3500], highlight: "重在打磨PDF课件与积累前10条好评，建议前期兼职起步", duration_months: 2 },
        { stage: "口碑成熟稳态期 (第4-6个月起，拥有10-15名固定复购学生)", monthly_cny_range: [9000, 14500], highlight: "单价上调至$16-$25/h，每周授课20-25小时，时差契合国内晚间", duration_months: 6 },
        { stage: "高阶垂直专家期 (商务汉语/HSK冲刺/海外华裔少儿系统课)", monthly_cny_range: [16000, 25000], highlight: "单价可达$28-$40/h，老学生续课率极高，形成个人稳定现金流资产", duration_months: 12 }
      ],
      deal_breakers: [
        "【非平台派单，须自主获客运营】必须自己拍摄有感染力的英文介绍视频、自制课件并回复学生咨询，前两个月单量冷清期90%缺乏耐心的新人会半途放弃",
        "【Preply免费试听课与算法惩罚】Preply平台对所有新学生首节试听课收取100%佣金（老师免费试讲），且试听课转正率低会被算法降低搜索曝光排名",
        "【欧美黄金时段对应国内深夜】北美与欧洲上班族晚间学习时间对应北京时间20:00至凌晨02:00，长期只接欧美单易导致严重熬夜"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [6800, 12800],
        scam_alert: "【防诈铁律】国内机构兜售的所谓‘IPA/ACI国际注册汉语教师资格证’纯属国家多次辟谣的山寨假证！iTalki和Preply根本无需任何证书即可免费注册；若想考权威证书只认准教育部语合中心《国际中文教师证书》(CTCSOL，报名费仅几百元)！"
      }
    }
  },
  {
    path_id: "PATH_063",
    title: "中级注册安全工程师（应急管理部全国统考 · 企业EHS护身符）",
    batch_id: 'BATCH_5',
    policy_update_month: "每年 8 月网报 & 10 月末全国统考",
    pk_arena: 'ADULT_PK',
    domain: 'SAFE_DESK_GUARD',
    identity_group: ['MIDLIFE_35_55', 'YOUTH_18_35', 'SENIOR_50_PLUS'],
    core_goals: ['DAILY_HOME_FAMILY', 'BIAN_ZHI_STABLE'],
    scenario_tags: ["35+被裁", "大专蓝领", "中年转型", "二本失业"],
    category: ["国家准入资格", "法律强制配岗", "越老越吃香"],
    status_light: "GREEN",
    last_verified_date: "2026-11-14",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["注册安全工程师", "注安师", "EHS", "安全工程师", "安全员", "35+被裁", "中年转型", "不限专业", "越老越吃香"],
    diy_action_steps: [
      "第一步：核对工龄条件——任何专业的大专或本科生均可报考（安全工程及相关专业大专满5年/本科满3年；其他非相关专业大专满6年/本科满4年即可）。",
      "第二步：每年8月登录唯一官方报名系统‘中国人事考试网’ (http://www.cpta.com.cn) 选择告知承诺制在线报名（无需找任何代报机构，4科报名费合计仅210-280元）。",
      "第三步：无需脱产辞职，利用每天下班后2小时精读应急管理部官方4本教材（《安全生产法律法规》《安全生产管理》《安全生产技术基础》《安全生产专业实务》），4年滚动周期内考过4科即可拿证。",
      "第四步：拿证后通过应急管理部‘注册安全工程师注册管理系统’ (rmocse.chinasafety.ac.cn) 完成执业注册，并去人社App申领1500元国家技能补贴，入职外资制造业、化工园或大型工程企业任EHS安全工程师/主管。"
    ],
    pk_profile: {
      short_name: "063 中级注册安全工程师 (EHS)",
      badge: "不限专业可考 · 《安全生产法》强制配岗",
      official_cost_avg: 360,
      prep_months: 6,
      prep_label: "在职下班备考4-8个月(无需脱产断粮)",
      hard_threshold: "22-60岁 · 大专起(不限专业，满对应工龄即可)",
      intern_months: 0,
      intern_monthly_net: 7500,
      intern_label: "在职备考零脱产成本，拿证即聘初级EHS专员",
      regular_monthly_net: 10500,
      regular_range: [7500, 16500],
      on_job_living_expense: 2200,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "极低：制造工厂、化工园区或外资企业常白班管理岗，每天下班回家，越老越吃香"
      },
      body_toll: "摆脱流水线重体力劳动；但属于老板与工人之间的夹心层，且严禁在拒不整改重大隐患的黑心小厂签字背锅",
      ceiling_3yr: "晋升外资大厂资深EHS经理或化工安全注册总监（月净入1.1万-1.65万，年包20-28万）",
      agency_trap_diff: 6800,
      verdict_fit: [
        "35-55岁大专或本科有过工厂/工程/物业/制造业工作年限，想彻底摆脱重体力或流水线、转型常白班EHS安全管理岗的中年人",
        "预算极低（报名+教材仅300多元，拿证还倒贴1500元人社补贴），希望在职备考不耽误养家的人"
      ],
      verdict_avoid: [
        "法律底线意识薄弱、贪图几千块小钱帮黑心老板在虚假隐患排查表上签字背锅的人（一旦出亡人事故直接触发《刑法》第134条坐牢！）",
        "大专毕业未满5-6年（或本科毕业未满3-4年）的纯应届毕业生（工龄不够无法通过中国人事考试网资格核验）"
      ]
    },
    track_a_hard_facts: {
      age_min: 22,
      age_max: 60,
      education_min: "大专及以上学历（不限专业！安全工程大专满5年/本科满3年安全业务工龄；其他任何专业仅需多加1年工龄即可报考）",
      physical_constraints: ["身体健康，具备现场安全隐患排查与合规管理能力"],
      prep_duration_days: { min: 120, max: 240 },
      official_zero_markup_cost_cny: {
        total_min: 210,
        total_max: 520,
        breakdown: [
          { item: "中国人事考试网4科全国统考报名费 (每科约50-75元)", cost_cny: "210 - 280" },
          { item: "应急管理部官方指定正版教材4本及历年真题集", cost_cny: "150 - 240" },
          { item: "拿证后人社部门发放国家职业技能提升补贴", cost_cny: "倒贴 +1,500" }
        ]
      },
      official_portal_url: "http://www.cpta.com.cn",
      official_portal_name: "中国人事考试网（全国唯一报考官网） / 应急管理部注安师注册系统 (rmocse.chinasafety.ac.cn)",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "《中华人民共和国安全生产法》（2021年修正版）第二十七条及《国家职业资格目录（2021年版）》专业技术人员职业资格第24项准入类",
          authority: "全国人大常委会 / 人力资源和社会保障部",
          source_url: "https://www.mohrss.gov.cn"
        },
        {
          level: "L1",
          doc_name: "《注册安全工程师职业资格制度规定》及《考试实施办法》（应急〔2019〕8号）",
          authority: "中华人民共和国应急管理部 / 人力资源和社会保障部",
          source_url: "https://www.mem.gov.cn"
        },
        {
          level: "L2",
          doc_name: "各省人事考试中心年度中级注册安全工程师考务通知及收费公示",
          authority: "各省人力资源和社会保障厅",
          source_url: "http://www.cpta.com.cn"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 长三角/珠三角外资制造厂、大型危化园区及工程企业持证 EHS 工程师工资条采集，选考‘化工安全’与‘其他安全’薪资存在明显梯队差。",
      net_income_stages: [
        { stage: "在职备考期 (4-8个月，4年滚动有效期内过4科)", monthly_cny_range: [0, 0], highlight: "无需脱产，利用下班时间刷近5年真题即可通过", duration_months: 6 },
        { stage: "持证初级EHS安全专员 (制造工厂/物流园/物业)", monthly_cny_range: [7500, 10000], highlight: "摆脱流水线重体力，工作规律交五险一金，35-50岁极受青睐", duration_months: 12 },
        { stage: "持证资深EHS主管 / 化工安全注册师 (外资大厂/化工园区)", monthly_cny_range: [11000, 16500], highlight: "资深安全总监或化工方向注册师年包普遍达20-28万", duration_months: 18 }
      ],
      deal_breakers: [
        "【严防签字背锅坐牢红线】黑心小厂老板常高薪招持证人员在虚假隐患排查表上签字应付检查，一旦发生亡人事故，签字注安师直接触发《刑法》第134条重大责任事故罪！遇到不肯花钱整改隐患的黑心厂必须立刻辞职",
        "【双面受气夹心层】督促工人戴护具会被工人嫌弃，找老板批预算买安全设备会被老板嫌不创收，必须养成邮件/微信书面留痕自保的职业习惯",
        "全国社保已与注册系统实时联网，严禁‘人证分离’违规挂靠，一经查出直接吊销证书并禁考3年"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [4980, 9800],
        scam_alert: "【防诈铁律】任何专业大专/本科只要满足对应工龄均可在 cpta.com.cn 官网实行告知承诺制个人直接报名，报名费仅200余元！凡培训机构收5000-9000元吹嘘‘非安全专业代报名+内部押题密卷包过’纯属割韭菜！"
      }
    }
  },
  {
    path_id: "PATH_065",
    title: "中资央企海外项目部直招（非洲 / 中东 / 东南亚基建能源 · 合同制）",
    batch_id: 'BATCH_5',
    policy_update_month: "常年按工程节点公开社招（国资委央企招聘专栏）",
    pk_arena: 'ADULT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55'],
    core_goals: ['SAVE_300K_3YR', 'BIAN_ZHI_STABLE'],
    scenario_tags: ["负债重启", "二本失业", "35+被裁", "大专蓝领"],
    category: ["央企直签合同制", "五险一金+高额驻外津贴", "包吃住极速攒钱"],
    status_light: "GREEN",
    last_verified_date: "2026-11-14",
    includes_free_board_lodging: true,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["央企海外", "中资出海", "中东", "非洲", "东南亚", "基建", "中国交建", "中国电建", "中国建筑", "驻外津贴", "包吃住", "负债重启", "翻译", "工程造价", "电工焊工"],
    diy_action_steps: [
      "第一步：直接登录国务院国资委官网‘央企招聘专栏’ (http://www.sasac.gov.cn) 或中国交建 (zhaopin.ccccltd.cn)、中国电建、中国中铁、中国建筑各工程局官方招聘系统，筛选‘海外事业部/国际工程公司’直招岗位（技术员、HSE安全官、小语种/英语翻译、财务出纳、物资仓管、试验员、持证机手/电工）。",
      "第二步：认准劳动合同签署主体必须是【央企工程局下属分子公司或国际工程公司直签（或集团指定国企人资公司直派）】，核实是否在国内依法缴纳五险一金（100%零中介费，凡索要2.5-4.5万劳务费的必是私人包工头转包队！）。",
      "第三步：面试通过后，前往当地海关‘国际旅行卫生保健中心’完成出入境体检并接种黄热病、霍乱等国际预防接种证书（黄皮书），开具无犯罪记录公证（垫付约300-500元，入职后凭票报销）。",
      "第四步：由央企外事部门统一向项目所在国驻华使馆申办正规【工作签证（Work Visa）】（铁律：绝不持旅游签/商务签违规登机！），由企业全额购买赴任国际机票与境外人身意外险，进入海外标准营地包吃住攒钱。"
    ],
    pk_profile: {
      short_name: "065 中资央企海外项目部直招",
      badge: "0中介费央企直签 · 五险一金+驻外年攒15-30万",
      official_cost_avg: 250,
      prep_months: 1.5,
      prep_label: "1-2个月央企官网投递面试+海关黄皮书体检+工签",
      hard_threshold: "20-48岁 · 技管/翻译/财务大专起(机手/电焊放宽高中) · 严禁三高传染病",
      intern_months: 3,
      intern_monthly_net: 12000,
      intern_label: "前3个月海外项目部试用适应期(含驻外津贴，营地食宿全包)",
      regular_monthly_net: 18500,
      regular_range: [12000, 28000],
      on_job_living_expense: 500,
      working_months_per_year: 11.5,
      family_separation: {
        level: 'HIGH',
        text: "极高：驻扎东南亚、中东沙漠或非洲封闭营地，每6-12个月享1次带薪回国休假（企业报销往返机票）"
      },
      body_toll: "营地实行半军事化封闭管理（两点一线极度孤单）；中东面临50℃高温，非洲需严防疟疾与登革热",
      ceiling_3yr: "驻外2-3年零花销强制净存 35万-65万人民币彻底结清债务，或晋升海外项目部门经理/商务总工（年包30-45万）",
      agency_trap_diff: 35000,
      verdict_fit: [
        "20-48岁土木工程、机电、安全HSE、工程造价、英语/法语/阿语/西语、财务或持证电焊/重机司机，背负15-50万债务急需在2年内靠‘营地包吃住零消费+高额驻外补贴’暴力还清债务的人",
        "看重央企直签五险一金保障、不愿给黑劳务中介交3-4万砍头费的务实求职者"
      ],
      verdict_avoid: [
        "无法忍受封闭营地单调生活、有重度社交需求或离不开妻儿超过3个月的人",
        "轻信短视频劳务黑中介‘交3.5万办旅游签/商务签去非洲中东工地打黑工月入3万’的人（不仅无五险一金、极易被私人包工头恶意欠薪，还会因非法务工被当地移民局拘留遣返！）"
      ]
    },
    track_a_hard_facts: {
      age_min: 20,
      age_max: 48,
      education_min: "管理/技术/翻译/财务岗须全日制大专及以上；现场工长及持证电工/焊工/大型机械司机可放宽至中专/高中",
      physical_constraints: ["通过海关国际旅行卫生保健中心出入境健康体检（无高血压、心脏病、糖尿病及传染病）并接种国际疫苗", "开具公安机关无犯罪记录证明"],
      prep_duration_days: { min: 30, max: 75 },
      official_zero_markup_cost_cny: {
        total_min: 0,
        total_max: 500,
        breakdown: [
          { item: "央企官方招聘官网网申、面试及海外工作签证办理费", cost_cny: "0 (用人单位全额承担，严禁收中介费)" },
          { item: "赴项目国国际往返机票、营地食宿与境外意外医疗险", cost_cny: "0 (企业全包，且每6-12个月报销回国探亲机票)" },
          { item: "出入境体检与无犯罪公证垫付费 (入职后凭票报销)", cost_cny: "0 - 500" }
        ]
      },
      official_portal_url: "http://www.sasac.gov.cn",
      official_portal_name: "国务院国资委央企招聘专栏 / 各央企工程局唯一官方招聘门户",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "国务院国资委、商务部《关于进一步规范中央企业境外用工管理的指导意见》及《对外劳务合作管理条例》",
          authority: "国务院国有资产监督管理委员会 / 中华人民共和国商务部"
        },
        {
          level: "L1",
          doc_name: "海关总署《出入境人员健康体检管理办法》（国际旅行健康检查及疫苗接种标准）",
          authority: "中华人民共和国海关总署"
        },
        {
          level: "L2",
          doc_name: "中国交建 (zhaopin.ccccltd.cn)、中国电建、中国建筑等央企工程局海外事业部公开社会招聘公告",
          authority: "各中央企业工程局人力资源部"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 驻沙特、阿联酋、印尼镍矿园区及非洲安哥拉/刚果金中资基建项目部在职人员工资条采集，属央企直签企业合同制（非行政事业编），地区艰苦度决定补贴高低。",
      net_income_stages: [
        { stage: "东南亚和平地区项目部 (印尼/泰国/老挝等，生活条件较好)", monthly_cny_range: [12000, 16000], highlight: "国内五险一金照缴，营地包吃住零花销，一年净攒13-17万", duration_months: 12 },
        { stage: "中东富油国大型基建项目 (沙特/阿联酋等，技术/翻译/HSE/造价)", monthly_cny_range: [16000, 23000], highlight: "叠加高温与驻外补贴，一年净攒18-25万，带薪回国探亲报销机票", duration_months: 12 },
        { stage: "非洲/南美艰苦或矿区项目部 (安哥拉/刚果金/秘鲁等)", monthly_cny_range: [20000, 28000], highlight: "高额艰苦与安全补贴，驻外两年回国即可净存40-55万还清债务", duration_months: 12 }
      ],
      deal_breakers: [
        "【工地版监狱式的营地封闭与孤独】出于治安与宗教文化限制，中东沙漠与非洲项目员工严禁私自外出营地，每天宿舍与工地两点一线，连续半年至一年无法见家人",
        "【热带传染病与50℃极端气候】非洲项目面临疟疾、登革热感染风险；中东夏季室外超50℃高温，赶工期期间单休甚至全年无休冲节点是基建常态",
        "【回归国内职场断层】海外驻外3-5年回国后，往往只适应项目部简单人际关系，重新融入国内快节奏商业公司面临较大适应阵痛"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [25000, 45000],
        scam_alert: "【防诈生死线】1. 央企工程局真正的直签合同工100%走集团官网免费招聘，不收一分钱中介费！社会中介收2.5-4.5万送进去的100%是层层转包的私人分包劳务队（无五险一金且极易欠薪）。2. 凡让你持‘商务签/旅游签’先出国再转工签的100%属非法打黑工，绝不能登机！"
      }
    }
  },
  {
    path_id: "PATH_067",
    title: "退役大学生士兵专项硕士研究生招生计划（先服役2年 → 降分考取全日制名校硕士）",
    batch_id: 'BATCH_3',
    policy_update_month: "每年 9-10 月（研招网退役大学生士兵专项计划网报） & 春秋两季全国征兵季",
    pk_arena: 'STUDENT_PK',
    domain: 'STUDENT_STREAM',
    identity_group: ['STUDENT_15_18', 'YOUTH_18_35'],
    core_goals: ['BIAN_ZHI_STABLE', 'SAVE_300K_3YR'],
    scenario_tags: ["二本失业", "考研失利", "大专蓝领", "18-24岁青年"],
    category: ["学历二次洗牌", "复试线低20-60分", "攒20万退伍金+全日制双证"],
    status_light: "GREEN",
    last_verified_date: "2026-11-14",
    includes_free_board_lodging: true,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["退役大学生士兵", "士兵专项考研", "退役考研", "免试专升本", "名校硕士", "学历洗牌", "考研失利", "退伍金", "全日制双证", "985硕士"],
    diy_action_steps: [
      "第一步：本科在读/大四应届或大专在读/毕业阶段，直接登录【全国征兵网】(https://www.gfbzb.gov.cn) 报名应征入伍（大专生退伍后可先依法享受【免试专升本】读完2年公办全日制本科，再无缝衔接报考退役大学生士兵专项硕士！）。",
      "第二步：入伍前通过学校武装部在学信网申请《应征入伍服兵役高等学校学生国家教育资助》，由国家全额补偿或代偿本科/专科阶段学费（本专科最高16000元/年，4年最高退还6.4万元）。",
      "第三步：在部队服役满2年义务兵期（第2年利用熄灯前碎片时间坚持背考研英语单词与刷数学真题），退伍时领齐《入伍批准书》复印件加盖档案章、《退出现役证》原件及一次性退役金与地方经济补助（合计约15万-22万元）。",
      "第四步：退伍后3年内（或终身享专项报考资格，但3年内还可叠加初试+10分对比选择），每年9-10月登录【中国研究生招生信息网】(https://yz.chsi.com.cn) 在专项计划栏勾选‘退役大学生士兵专项计划’（考试费130-220元），凭低于普通统考20-60分的学校自主复试线逆袭985/211全日制双证硕士。"
    ],
    pk_profile: {
      short_name: "067 退役大学生士兵专项考研",
      badge: "攒15-22万退伍金 + 复试线降20-60分读985全日制硕士",
      official_cost_avg: 180,
      prep_months: 24,
      prep_label: "2年义务兵服役期(部队包吃住+发津贴，退伍领15-22万安置金)",
      hard_threshold: "18-24岁高校在校/毕业生入伍满2年退伍 · 持《入伍批准书》与《退出现役证》",
      intern_months: 36,
      intern_monthly_net: 1000,
      intern_label: "3年全日制985/211硕士在读期(享国家助学金≥6000/年+科研津贴，手握20万退伍金)",
      regular_monthly_net: 14000,
      regular_range: [10000, 18000],
      on_job_living_expense: 2500,
      working_months_per_year: 12,
      family_separation: {
        level: 'MEDIUM',
        text: "中等：前2年部队义务兵全封闭服役，后3年名校全日制读研享寒暑假，毕业后全国自由择业"
      },
      body_toll: "前2年部队高强度体能训练与严格纪律；最大痛点是2年脱离书本后重新捡起高数与考研英语极度痛苦",
      ceiling_3yr: "彻底洗掉双非/民办第一学历标签，以985/211全日制硕士双证身份参加定向选调生、央国企总部或大厂校招（年包15-28万）",
      agency_trap_diff: 42800,
      verdict_fit: [
        "18-24岁普通二本/民办三本/公办大专在读或应届生，一战考研失利或受困于第一学历歧视，愿意用2年青春换取‘15-22万退伍启动金 + 降20-60分进985/211全日制硕士’的学子",
        "大专生想走‘2年当兵 → 免试入读公办全日制本科 → 退役士兵专项考985全日制硕士’实现学历三级跳的逆袭者"
      ],
      verdict_avoid: [
        "吃不了部队高强度体能与纪律的苦、入伍后可能闹退兵的青年（拒服兵役将纳入国防失信黑名单，终身禁考公考编且两年内禁升学！）",
        "轻信商业机构花3-5万买所谓‘退役士兵专项考研内部保录名额’的考生（100%走研招网公开统考与高校复试公示）"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 24,
      education_min: "高校学生应征入伍退出现役，且具国家承认本科学历（大专生退役可先享免试专升本读公办本科再报专项）",
      physical_constraints: ["须符合全国征兵体格检查与政治考核标准，依法服现役满2年义务兵役正常退出现役", "持有《入伍批准书》和《退出现役证》原件核验"],
      prep_duration_days: { min: 730, max: 900 },
      official_zero_markup_cost_cny: {
        total_min: 130,
        total_max: 220,
        breakdown: [
          { item: "全国硕士研究生招生考试研招网初试报名费", cost_cny: "130 - 220" },
          { item: "服役2年退伍发放一次性退役金、地方经济补助及本科阶段学费全额退还", cost_cny: "倒贴 +150,000 ~ 220,000" },
          { item: "在读研究生阶段国家助学金 (100%全覆盖)", cost_cny: "每年发放 ≥6,000 元" }
        ]
      },
      official_portal_url: "https://yz.chsi.com.cn",
      official_portal_name: "中国研究生招生信息网（研招网专项计划专栏） / 全国征兵网 (gfbzb.gov.cn)",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "教育部办公厅《关于做好年度“退役大学生士兵”专项硕士研究生招生计划工作的通知》",
          authority: "中华人民共和国教育部"
        },
        {
          level: "L1",
          doc_name: "教育部、中央军委国防动员部《关于进一步做好大学生征兵工作的通知》及《兵役法》",
          authority: "教育部 / 中央军委国防动员部"
        },
        {
          level: "L2",
          doc_name: "北京大学、复旦大学、武汉大学等部属高校《退役大学生士兵专项硕士研究生招生简章》",
          authority: "各全国重点高校研究生院"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 多所 985/211 高校退役士兵专项拟录取分数线对比与退伍安置金标准整理，研究生阶段需按高校标准正常缴纳学费（由退伍金与国家助学金完全覆盖）。",
      net_income_stages: [
        { stage: "2年部队义务兵服役期 (包吃住穿医+每月津贴)", monthly_cny_range: [1100, 2200], highlight: "退伍时一次性结算退役金、地方补助及本科全部学费退还，合计约15-22万", duration_months: 24 },
        { stage: "退役考研上岸读研期 (985/211全日制双证硕士)", monthly_cny_range: [500, 1500], highlight: "复试线普遍比普通统考低20-60分，在读享每年≥6000元国家助学金及科研补贴", duration_months: 36 },
        { stage: "名校全日制硕士毕业起薪期 (央国企/选调生/大厂校招)", monthly_cny_range: [10000, 18000], highlight: "彻底洗掉双非/民办第一学历标签，毕业双证与普通统考生100%完全一致", duration_months: 12 }
      ],
      deal_breakers: [
        "【严防拒服兵役失信毁一生】入伍后受不了高强度体能与纪律而闹着退兵被除名的，将依法纳入国防义务严重失信名单，终身禁考公务员事业编、两年内禁升学出国并处巨额罚款",
        "【2年脱离书本导致数英生疏】部队高强度训练后重新捡起高数与考研英语极度痛苦，须在部队第二年利用熄灯前碎片时间坚持背单词保持语感",
        "名校热门经管/法学/计算机专项近年也有大量985退伍兵竞争，双非退伍兵仍需考出扎实初试分数，切勿幻想260分躺进清北"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [28000, 58000],
        scam_alert: "【防诈铁律】全军征兵100%走全国征兵网公开体检政审，全国考研100%走研招网公开初试复试公示！凡机构收3-5万吹嘘‘内部兵役运作+退役士兵专项保录名额’100%是诈骗！"
      }
    }
  },
  {
    path_id: "PATH_071",
    title: "同等学力人员申请硕士学位（在职免试入学 · 国家单证硕士）",
    batch_id: 'BATCH_5',
    policy_update_month: "每年 3 月网报 & 5 月全国同等学力统考（课程班常年春秋两季入学）",
    pk_arena: 'ADULT_PK',
    domain: 'SAFE_DESK_GUARD',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55', 'SENIOR_50_PLUS'],
    core_goals: ['DAILY_HOME_FAMILY', 'BIAN_ZHI_STABLE'],
    scenario_tags: ["35+被裁", "考公落榜", "体制内评职称", "职场提升"],
    category: ["免12月考研初试", "60分及格制统考", "评职称/申博跳板"],
    status_light: "GREEN",
    last_verified_date: "2026-11-14",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["同等学力申硕", "在职研究生", "单证硕士", "免试入学", "五月统考", "评职称", "教师评职称", "医护晋升", "申博", "学信网学位"],
    diy_action_steps: [
      "第一步：先自查硬性准入资格：必须已获得本科毕业证且持有【学士学位证书】满3年以上（可在学信网查询学位认证报告；仅有本科毕业证无学士学位证者严禁交钱报名！）。",
      "第二步：直接访问目标公办大学研究生院官网（如中国人民大学、对外经济贸易大学、中南财经政法大学等公办高校研究生院），查看《同等学力人员申请硕士学位招生简章》，直接向【高校官方财务对公账户】分阶段缴纳课程学习费（约0.8万-2.2万元，绝不走第三方助学机构私账！）。",
      "第三步：登录学信网【全国同等学力人员申请硕士学位管理工作信息平台】(https://tdxl.chsi.com.cn) 完成注册、现场确认及指纹采集，在4-5年有效期内于每年3月报名参加5月全国统一考试（仅考外国语+学科综合两门，每科报名费100元，满分100分考60分即及格通过，单科成绩保留！）。",
      "第四步：全国统考及格后1年内，向高校缴纳第二阶段论文指导与答辩费（约0.6万-1.5万元），在导师指导下完成硕士学位论文并通过教育部盲审与答辩，获颁学信网终身可查的《中华人民共和国硕士学位证书》。"
    ],
    pk_profile: {
      short_name: "071 同等学力在职申硕 (单证)",
      badge: "免12月考研初试 · 60分及格制拿学信网硕士学位证",
      official_cost_avg: 24000,
      prep_months: 0,
      prep_label: "0天脱产（100%在职周末/网课修学分，完全不影响本职工作收入）",
      hard_threshold: "23-60岁 · 必须持有【本科学士学位证】满3年 · 严防单双证混淆",
      intern_months: 12,
      intern_monthly_net: 0,
      intern_label: "第1年在职修学分与备考5月统考期（不中断原工作薪资，学位溢价增量¥0）",
      regular_monthly_net: 1500,
      regular_range: [500, 5000],
      on_job_living_expense: 0,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "极低：100%在职周末网课或本地高校授课，无需脱产辞职，每天正常回家陪伴家人"
      },
      body_toll: "无体力损耗；主要压力来自下班后备考5月英语/学科综合统考，以及最后阶段撰写3万字硕士论文过查重与盲审",
      ceiling_3yr: "体制内/公立医院/中小学教师评副高职称缩短年限并享每月学位津贴，或凭硕士学位证书直接申请攻读国内外博士（申博跳板）",
      agency_trap_diff: 42500,
      verdict_fit: [
        "23-60岁已持本科学士学位满3年的中小学教师、公立医院医护、国企/事业单位在编人员或企业中层，急需国家承认的《硕士学位证》用于评职称、晋升加薪或申请博士，但没精力去拼12月全日制考研初试的人",
        "希望直接向公办高校财务处交1.6万-3.8万官方学费、拒绝被教育中介收5-8万‘VIP包过托管费’的清醒职场人"
      ],
      verdict_avoid: [
        "【严防单双证混淆】指望拿这个证去报考明确要求‘硕士研究生学历（双证：毕业证+学位证）’的公务员/选调生岗位的应届或失业人员（同等学力仅发硕士学位证，无研究生毕业证，学历仍为本科！）",
        "只有本科毕业证但当年因挂科/未过四级没拿到【学士学位证】的人（硬性政策一票否决，交钱也无法在学信网注册申硕！）"
      ]
    },
    track_a_hard_facts: {
      age_min: 23,
      age_max: 60,
      education_min: "必须已获得国家承认的大学本科学历且持有【学士学位证书】满3年以上（仅有本科毕业证无学位证者无报考资格！）",
      physical_constraints: ["在职学习不影响本职工作，须在4-5年有效期内通过每年5月全国同等学力统考并完成学位论文盲审答辩"],
      prep_duration_days: { min: 365, max: 730 },
      official_zero_markup_cost_cny: {
        total_min: 16000,
        total_max: 38000,
        breakdown: [
          { item: "第一阶段：直接向公办高校财务处缴纳课程学习费", cost_cny: "8,000 - 22,000" },
          { item: "每年5月全国同等学力统考报名费 (交教育部考试院，每科100元)", cost_cny: "100 - 200" },
          { item: "第二阶段：统考及格后向高校缴纳硕士论文指导与答辩费", cost_cny: "6,000 - 15,000" }
        ]
      },
      official_portal_url: "https://tdxl.chsi.com.cn",
      official_portal_name: "全国同等学力人员申请硕士学位管理工作信息平台（学信网官方平台）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "《中华人民共和国学位法》及国务院学位委员会《关于授予具有研究生毕业同等学力人员硕士、博士学位的规定》（学位〔1998〕54号）",
          authority: "全国人大常委会 / 国务院学位委员会"
        },
        {
          level: "L1",
          doc_name: "教育部《关于做好年度同等学力人员申请硕士学位外国语水平和学科综合水平全国统一考试工作的通知》",
          authority: "中华人民共和国教育部"
        },
        {
          level: "L2",
          doc_name: "中国人民大学、对外经贸大学、湖南大学等公办高校研究生院《同等学力人员申请硕士学位招生简章及收费公示》",
          authority: "各具备硕士学位授予权的公办高校研究生院"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 中小学教师、公立医院医护及国企员工在职申硕通关周期与职称晋升效用复盘，属非学历教育单证硕士（仅发学位证，无研究生毕业证）。",
      net_income_stages: [
        { stage: "免试入学修学分与备考5月全国统考期 (第1年)", monthly_cny_range: [0, 0], highlight: "不影响正常全职上班赚钱，仅考外语(无听力)+学科综合，60分即及格", duration_months: 12 },
        { stage: "体制内/医院/学校取得硕士学位评职称期", monthly_cny_range: [500, 1500], highlight: "中小学评高职、医院晋副高可缩短1-2年年限，部分单位每月增发学位津贴", duration_months: 12 },
        { stage: "叠加硕士学位晋升管理岗或转申博期", monthly_cny_range: [2000, 5000], highlight: "学信网终身可查，可用于申报博士研究生或满足仅要求‘硕士学位’的岗位", duration_months: 12 }
      ],
      deal_breakers: [
        "【严防单双证混淆】颁发的仅为《硕士学位证书》（无研究生毕业证书），凡公务员/国企招考明确要求‘研究生学历（双证）’的岗位无法以研究生身份报考",
        "【无学士学位证严禁报名】无论全日制还是成人自考本科，必须同时持有【学士学位证】且满3年方可申硕，只有毕业证无学位证者交钱也无法通过学信网审核",
        "【严防最后一步论文盲审挂科】近年教育部学位论文抽检极严，若拖延不写论文或查重率超标导致两次答辩未过，前期缴纳的学费将全部作废"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [45000, 88000],
        scam_alert: "【防诈铁律】所有招生高校均在大学研究生院官网公开招生简章与学校对公缴费账户，全程总学费仅1.6万-3.8万！凡第三方教育机构收5-8万吹嘘‘VIP包过免考托管拿证’，纯属收几万块中间差价甚至卷款跑路陷阱，请直接向高校财务处缴费！"
      }
    }
  },
  {
    path_id: "PATH_036",
    title: "德国机会卡（Chancenkarte · §20a AufenthG 积分制找工作签证）",
    batch_id: 'BATCH_4',
    policy_update_month: "常年在线开放申请（德国外交部 digital.diplo.de 全年在线预审）",
    pk_arena: 'ADULT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55'],
    core_goals: ['SAVE_300K_3YR', 'DAILY_HOME_FAMILY'],
    scenario_tags: ["二本失业", "考研失利", "35+被裁", "个人全球化"],
    category: ["无需提前拿Offer", "1年合法赴德找工", "允许每周兼职20小时"],
    status_light: "GREEN",
    last_verified_date: "2026-11-15",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["德国机会卡", "Chancenkarte", "德国找工作签证", "anabin", "欧盟蓝卡", "兼职20小时", "个人全球化", "35+出海", "积分制签证", "Make it in Germany"],
    diy_action_steps: [
      "第一步：先登录德国教育部长联席会议官方学位数据库 (https://anabin.kmk.org) 免费查询你的大学是否为【H+】且学位为【Entspricht（完全对等）】：若持有中国全日制本科学士学位且在 anabin 为 H+，即属‘德国认可的专业人才（Fachkraft）’，【免6分积分要求】直接获批资格；若为正规大专/高职学历，则通过官网积分计算器（语言+年龄+工作经验）凑满6分并做 ZAB 职业资格认证。",
      "第二步：考出基础语言证明（大专积分路线必备）：英语达到 B2（如雅思 5.5-6.0 / PTE）或德语达到歌德学院 A1 证书（二选一即可）；并在德国官方认可机构（如 Expatrio / Fintiba / Coracle）在线开设个人限制提款账户（Sperrkonto），存入 12 个月生活保障金共约 13,092 欧元（每月 1,091 欧元，抵德后按月解冻归自己花销，非上交费用）。",
      "第三步：直接登录德国外交部官方在线签证门户 (https://digital.diplo.de) 选择‘Opportunity Card (Chancenkarte)’全英文在线上传材料完成预审（免中介！官方签证规费仅 75 欧元），预审通过后按提示前往辖区 VFS 签证中心录入指纹。",
      "第四步：持 1 年期机会卡入境德国后，立即使用法定赋予的【每周最多 20 小时合法兼职权 + 每家雇主最长 2 周试工权（Probearbeit）】边打工冲抵房租伙食（保住10万保证金本金），边投递 IT/工程/制造/物流/蓝领技工全职岗位，拿到全职合同后直接在德国当地外管局换发正式工签或欧盟蓝卡。"
    ],
    pk_profile: {
      short_name: "036 德国机会卡 (Chancenkarte)",
      badge: "无需提前拿Offer · 1年合法在德找工+每周20h兼职",
      official_cost_avg: 8500,
      prep_months: 2,
      prep_label: "1-2个月anabin核验+自保金开户+外交部在线预审",
      hard_threshold: "20-45岁 · 本科H+免积分(大专凑6分+英语B2或德语A1) · 需备10.2万自保金",
      intern_months: 3,
      intern_monthly_net: 8000,
      intern_label: "前2-5个月在德求职+每周20小时合法兼职期(月入约1000-1200欧冲抵吃住)",
      regular_monthly_net: 22500,
      regular_range: [19000, 26000],
      on_job_living_expense: 7500,
      working_months_per_year: 12,
      family_separation: {
        level: 'MEDIUM',
        text: "中等：前3-5个月单身赴德找工与租房落户；换发正式工签或欧盟蓝卡后可依法申请配偶及子女家庭团聚"
      },
      body_toll: "无重体力强制要求；最大折磨是慕尼黑/柏林等大城市落地首月极难租到可办市政厅落户登记(Anmeldung)的长租房，以及纯英语求职者的心理焦虑",
      ceiling_3yr: "成功换发欧盟蓝卡（Blue Card EU）后税后月入1.9万-2.6万人民币，德语达B1最快21个月（A1为27个月）即可获德国永久居留权",
      agency_trap_diff: 43000,
      verdict_fit: [
        "20-45岁拥有全日制本科（anabin H+免积分）或理工/护理/技工大专学历，受困于国内35岁年龄红线，手头能周转出约11万人民币（含10.2万个人自保金+8500元机票签证硬成本）的工程师、IT、机电技工或双语职场人",
        "不想在国内苦等德国雇主远程面试，希望直接肉身落地德国参加线下面试与2周带薪试工（Probearbeit）、同时靠每周20小时兼职养活自己的行动派"
      ],
      verdict_avoid: [
        "既不会一句德语、又是纯文科/行政/新媒体背景的求职者（德国85%本土岗位仍要求德语，纯英语文科生极易在1年内找不到全职合同被迫耗光路费回国）",
        "连10.2万人民币限制提款账户自保金（Sperrkonto）都无法凑齐，或轻信移民中介花4-6万买所谓‘机会卡代办服务’的人（外交部官网 digital.diplo.de 全程可DIY直申！）"
      ]
    },
    track_a_hard_facts: {
      age_min: 20,
      age_max: 45,
      education_min: "全日制本科及以上（anabin数据库查询为H+高校可免积分直通）或2年以上正规大专/高职学历（走6分积分制）",
      physical_constraints: ["基础语言底线：英语达到B2（如雅思5.5-6.0/PTE）或德语达到A1（二选一）", "在德国官方认可银行开设限制提款账户存入约13,092欧元（约10.2万人民币）个人生活保障金（抵达后按月解冻归个人使用）"],
      prep_duration_days: { min: 30, max: 90 },
      official_zero_markup_cost_cny: {
        total_min: 6500,
        total_max: 11500,
        breakdown: [
          { item: "德国驻华使馆机会卡签证规费 (75欧元) + VFS服务费", cost_cny: "780" },
          { item: "anabin官方高校对等数据库查询打印 (H+院校免费)", cost_cny: "0" },
          { item: "英语B2(雅思/PTE)或歌德德语A1官方考级费", cost_cny: "1,100 - 2,170" },
          { item: "入境过渡医疗保险与赴德单程机票", cost_cny: "4,500 - 8,500" }
        ]
      },
      official_portal_url: "https://www.make-it-in-germany.com",
      official_portal_name: "德国联邦政府官方人才门户 (Make it in Germany) / 德国外交部在线签证门户 (digital.diplo.de)",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "德国《居留法》（Aufenthaltsgesetz - AufenthG）第20a条及第20b条（机会卡法定条款）",
          authority: "德意志联邦共和国联邦内政部 (BMI)"
        },
        {
          level: "L1",
          doc_name: "德国联邦政府官方门户《Opportunity Card (Chancenkarte) Requirements & Points Calculator》",
          authority: "德国联邦经济与气候保护部 (BMWK)"
        },
        {
          level: "L2",
          doc_name: "德国教育部长联席会议官方学位数据库 (anabin.kmk.org) 及德国驻华使馆签证须知",
          authority: "Kultusministerkonferenz (KMK) / 德国驻华大使馆"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 持机会卡赴慕尼黑、柏林、法兰克福求职的中国申请者落地耗时与兼职流水采集，是否掌握德语口语对求职周期具有决定性影响。",
      net_income_stages: [
        { stage: "国内在线预审与递签准备期 (1-2个月)", monthly_cny_range: [0, 0], highlight: "全程可通过德国外交部 digital.diplo.de 在线预审，无需中介", duration_months: 2 },
        { stage: "在德求职+每周20小时合法兼职过渡期 (平均2-5个月)", monthly_cny_range: [7000, 9000], highlight: "利用法定20h/周兼职权打零工，基本可覆盖当地房租伙食（保住10万保证金）", duration_months: 3 },
        { stage: "成功拿到全职Offer原地换发工签/欧盟蓝卡后", monthly_cny_range: [19000, 26000], highlight: "税后实发2400-3200欧/月，持蓝卡且德语达B1最快21个月可申德国永居", duration_months: 12 }
      ],
      deal_breakers: [
        "【不会德语的纯文科/商科极易求职失败】德国85%本土企业工作语言仍为德语，非IT/工程/护理/技工类的纯文科生若仅会英语，半年找不到全职合同被迫耗光预算回国的风险极高",
        "【大城市租房与落户登记地狱】慕尼黑、柏林等城市极难租到可办理市政厅落户登记(Anmeldung)的长租房，落地首月安顿极度折磨人",
        "1年期满若未拿到符合资质与薪资标准的全职劳动合同（端盘子兼职合同不可换工签），签证到期必须按时离境"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [35000, 68000],
        scam_alert: "【防诈铁律】德国外交部已上线全英文在线预审系统(digital.diplo.de)，机会卡无需雇主担保、规则100%透明，自己办理签证费仅580元！凡移民中介收4-6万所谓‘机会卡项目代办费’纯属收高额翻译填表智商税！"
      }
    }
  },
  {
    path_id: "PATH_066",
    title: "国际豪华邮轮海乘直招（皇家加勒比 / MSC地中海 / 维京邮轮）",
    batch_id: 'BATCH_4',
    policy_update_month: "常年按月滚动面试（皇家加勒比/MSC/维京官方授权海员外派机构）",
    pk_arena: 'ADULT_PK',
    domain: 'OVERSEAS_SHIPPING',
    identity_group: ['YOUTH_18_35'],
    core_goals: ['SAVE_300K_3YR'],
    scenario_tags: ["二本失业", "大专蓝领", "18-32岁青年", "个人全球化"],
    category: ["赚免税美金+小费", "免费环游世界", "包吃住高储蓄"],
    status_light: "GREEN",
    last_verified_date: "2026-11-15",
    includes_free_board_lodging: true,
    requires_night_shift: true,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: false,
    keywords: ["豪华邮轮", "海乘", "皇家加勒比", "MSC地中海", "维京邮轮", "免税美金", "免税店销售", "荷官", "调酒师", "包吃住", "环游世界", "四小证"],
    diy_action_steps: [
      "第一步：先破除黑培训班陷阱——绝不要在没拿到邮轮公司录用信（LOE）前花2-4万去读所谓‘海乘定向委培班’！直接登录中国海事综合服务平台 (https://csp.msa.gov.cn) 查询全国持有《海员外派机构资质证书》的合规外派公司名录（如森海海事、华洋海事、中远海运劳务等官方代理），直接免费投递英文简历。",
      "第二步：准备1对1全英文视频面试（无需雅思/托福证书，重点考察日常英语听说流利度与服务意识）：若英语中等可报客房服务/自助餐服务员（$1100-$1500/月）；若英语流利或有奢侈品销售/调酒/摄影/荷官经验，直冲主餐厅服务员、免税店销售或娱乐场荷官（$2000-$3500/月）。",
      "第三步：拿到国际邮轮公司签发的正式录用信（Letter of Employment）后，再去海事局核准的公办航海院校自费考取《海船船员基本安全培训合格证(Z01)》与《客船船员特殊培训合格证(T06)》及海员体检、海员证（全程官方裸价仅3500-5000元）。",
      "第四步：凭邮轮公司担保函前往美国使领馆面签 C1/D 过境/船员签证（主流船东全额报销签证费与赴港口国际机票），登船开启6-8个月合同期全包吃住、零消费净存美金。"
    ],
    pk_profile: {
      short_name: "066 国际豪华邮轮海乘直招",
      badge: "船上包吃住零消费 · 免税美金+小费月净存0.8-2.5万",
      official_cost_avg: 4800,
      prep_months: 1.5,
      prep_label: "1-2个月外籍HR英文面试+考邮轮四小证与海员证",
      hard_threshold: "18-32岁(技师放宽38岁) · 英语口语流利过面试 · 无色盲/无暴露纹身",
      intern_months: 1,
      intern_monthly_net: 7800,
      intern_label: "登船首月安全演习与岗位磨合期(免税美金底薪照发，包吃住)",
      regular_monthly_net: 14500,
      regular_range: [7800, 25000],
      on_job_living_expense: 400,
      working_months_per_year: 9,
      family_separation: {
        level: 'HIGH',
        text: "极高：每个合同期连续在海上漂泊 6-8 个月（中间靠港仅能下船逛3-5小时），下船后休假2个月"
      },
      body_toll: "船员住水线以下6-8平米无窗双人铁盒舱；合同期内连续6-8个月每周工作7天（0完整休息日），每天站立服务10-13小时",
      ceiling_3yr: "晋升邮轮免税店主管、餐厅经理（Restaurant Manager）或娱乐场主管，月净入2万-3.2万人民币，2-3个合同期可攒下30-45万并练就母语级商务英语",
      agency_trap_diff: 30200,
      verdict_fit: [
        "18-32岁大专/二本英语、酒店管理、旅游、摄影、调酒或商科毕业生，渴望在船上包吃住零消费环境下1年半净存20-30万第一桶金、同时顺带靠港游览欧美日韩港口的年轻人",
        "性格外向抗压、服务意识强，想用4800元官方四小证裸价直接通过海事局持牌外派机构登船的务实派"
      ],
      verdict_avoid: [
        "有幽闭恐惧症（住水线以下无窗船舱）、严重晕船，或无法忍受连续6个月没有完整休息日、每天站立11小时的人",
        "还没参加邮轮HR面试就听信招生贩子花2.5万-4.5万去读‘海乘岗前模拟舱委培班’的求职者（交通部第30条严禁外派机构收中介费！）"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 32,
      education_min: "高中、中专、职高及以上学历（个别星级酒店主管或西餐主厨/理疗师可放宽至38岁）",
      physical_constraints: ["无需雅思托福证书，但须通过邮轮外籍HR 1对1全英文视频面试", "无色盲色弱、无传染病、短袖制服下无暴露纹身、无犯罪记录"],
      prep_duration_days: { min: 30, max: 60 },
      official_zero_markup_cost_cny: {
        total_min: 3500,
        total_max: 6500,
        breakdown: [
          { item: "海事局核准院校‘邮轮四小证(Z01基本安全+T06客船特殊培训)’费", cost_cny: "2,200 - 3,800" },
          { item: "海船船员健康体检费 + 《中华人民共和国海员证》工本费", cost_cny: "600 - 900" },
          { item: "美国C1/D船员签证费及登船机票 (主流邮轮由船东全额承担/报销)", cost_cny: "0 - 1,500" }
        ]
      },
      official_portal_url: "https://csp.msa.gov.cn",
      official_portal_name: "中国海事综合服务平台（查询全国合法持牌海员外派机构名录）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "国际劳工组织《2006年海事劳工公约》(MLC, 2006) 及交通运输部《海员外派管理规定》（第30条严禁收中介费）",
          authority: "国际劳工组织 (ILO) / 中华人民共和国交通运输部"
        },
        {
          level: "L1",
          doc_name: "交通运输部海事局《海船船员培训合格证签发管理办法》（Z01基本安全及T06客船特殊培训规定）",
          authority: "中华人民共和国海事局"
        },
        {
          level: "L2",
          doc_name: "皇家加勒比邮轮 / MSC地中海邮轮 / 维京邮轮中国官方指定海员外派机构招聘简章",
          authority: "各持牌海员外派机构 / 国际邮轮集团"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 皇家加勒比、MSC及维京邮轮在职中国籍海乘真实美金工资单采集，小费池岗位（餐厅/酒吧/免税店）收入远高于固定底薪岗位。",
      net_income_stages: [
        { stage: "线上面试与考取邮轮四小证等待上船期 (1-2个月)", monthly_cny_range: [0, 0], highlight: "面试通过后再去公办航海院校花3000元左右考四小证，切勿提前交培训费", duration_months: 1.5 },
        { stage: "入门固定底薪岗 (客房助理/自助餐服务员/摄影师，包吃住)", monthly_cny_range: [7800, 10800], highlight: "免税美金$1100-$1500/月，船上零消费，8个月合同期可净存6-8万", duration_months: 6 },
        { stage: "高小费与高提成核心岗 (主餐厅服务/调酒师/免税店销售/荷官)", monthly_cny_range: [14000, 25000], highlight: "美金底薪+乘客小费/奢侈品提成，干满1年半可纯攒20-30万并练出流利英语", duration_months: 12 }
      ],
      deal_breakers: [
        "【水线以下无窗铁盒+全年无休地狱工时】船员宿舍位于船体最底层无窗双人间（6-8平米）；一个合同期6-8个月内每周工作7天、无一天完整休息日，每天站立工作10-13小时",
        "【欧美严苛等级制度与投诉零容忍】管理层等级森严，遭到VIP乘客差评投诉可能面临严厉警告甚至中途被遣返回国（须自付高昂回程机票）",
        "海上卫星Wi-Fi极贵且网速慢，仅能在邮轮靠港的3-5小时短暂下船逛码头街区，绝非普通人幻想的‘免费奢华度假’"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [25000, 45000],
        scam_alert: "【防诈铁律】海乘培训机构常收2.5-4.5万搞所谓‘邮轮模拟舱定向委培班’！交通部《海员外派管理规定》第30条严禁外派机构向船员收中介费，去海事局官网(csp.msa.gov.cn)查出持牌外派公司免费投简历面试，考四小证仅需3000余元，立省3万智商税！"
      }
    }
  },
  {
    path_id: "PATH_058",
    title: "植保无人机飞手（CAAC民航局操控员执照 + 农机购置补贴跨区作业）",
    batch_id: 'BATCH_5',
    policy_update_month: "常年报考（3-5月春耕 & 7-10月夏秋飞防旺季；2024-2026年农机补贴周期）",
    pk_arena: 'ADULT_PK',
    domain: 'CERT_TRADES',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55'],
    core_goals: ['URGENT_30D_CASH', 'SAVE_300K_3YR'],
    scenario_tags: ["农村/县城青年", "大专蓝领", "35+被裁", "返乡创业"],
    category: ["低空经济刚需", "国家农机购置补贴", "旺季按亩高计件"],
    status_light: "GREEN",
    last_verified_date: "2026-11-23",
    includes_free_board_lodging: false,
    requires_night_shift: true,
    allows_daily_home: false,
    requires_heavy_lifting_or_waist: true,
    keywords: ["植保无人机", "飞手", "CAAC", "民航局执照", "UOM", "农机购置补贴", "低空经济", "飞防", "返乡创业", "跨区作业", "电力巡检"],
    diy_action_steps: [
      "第一步：先分清两类法定证书——若只做常规农田植保，依据国令第761号第十六条，须经大疆/极飞等生产企业按民航及农业农村部门规定培训考核取得《农用无人驾驶航空器操作证书》；若要承接政府统防统治招标、管制空域飞行或淡季跨界电力巡检/吊运，则登录中国民航局 UOM 平台 (https://uom.caac.gov.cn) 查询本地备案合规机构，花 6,800-9,800 元（含 400-600 元官方考费）考取 CAAC 中型超视距操控员执照。",
      "第二步：严禁零经验一上来就贷款买几万元新机！先带证受雇于本地或跨区飞防合作社做1个旺季专职飞手（底薪+每亩 1.5-2.5 元提成，月入 8,000-13,000 元），把配药防漂移、夜间避高压线、电池散热循环和找地主结款全套实操练透。",
      "第三步：决定返乡单干或夫妻组队时，选择列入本省《2024—2026年农机购置与应用补贴机具补贴额一览表》的合规机型，务必开具正规农机销售发票、实名登记 UOM 平台，并通过本省农机购置补贴 App 申领国家财政直接补贴（按载药量分档 6,000 ~ 14,400 元/台）。",
      "第四步：购齐足额第三者责任险与机身险（防撞高压线天价索赔），春秋旺季采用“本地大户包片+新疆/东北/黄淮跨区转场”拉长作业期，冬季封冻期凭 CAAC 通用执照切入光伏清洗、果园吊运或电力外协巡检平滑淡季现金流。"
    ],
    pk_profile: {
      short_name: "058 植保无人机飞手 (CAAC)",
      badge: "国家农机购机补贴 · 旺季日净赚1200+",
      official_cost_avg: 8300,
      prep_months: 1,
      prep_label: "15-30天民航局UOM备案考点理论+实操考证",
      hard_threshold: "16-55岁 · 初中起 · 严禁色盲色弱/矫正视力≥1.0",
      intern_months: 2,
      intern_monthly_net: 7500,
      intern_label: "首季受雇飞防合作社当跟队飞手(底薪+每亩提成，零购机风险)",
      regular_monthly_net: 13500,
      regular_range: [8000, 35000],
      on_job_living_expense: 1800,
      working_months_per_year: 7,
      family_separation: {
        level: 'MEDIUM',
        text: "中等：本地县乡作业可每天回家；若4-10月随跨区飞防队转战新疆/东北/中原大平原，则需数月驻田流动"
      },
      body_toll: "旺季凌晨3-4点摸黑下田、40℃暴晒高湿且全身沾满农药味，每日需反复搬运25-50kg药箱与电池充电；高精神高压防撞细高压线",
      ceiling_3yr: "自购植保机/夫妻飞防小队旺季日打300-500亩（干满5个月旺季净攒12-20万），淡季凭CAAC执照拓展电力巡检、山地果园吊运或测绘",
      agency_trap_diff: 12500,
      verdict_fit: [
        "18-50岁农村/县城青年、大专蓝领或返乡创业者，熟悉田间地头、能吃苦耐早起，希望靠低空经济与国家农机补贴在县域旺季赚取高额计件收入的人",
        "先在合作社当专职飞手攒满经验与客源，再决定是否领补贴购机单干的务实派"
      ],
      verdict_avoid: [
        "色盲色弱、无法接受凌晨4点摸黑下田与连续数月高强度日晒熬夜的人",
        "轻信短视频培训机构花1.8万-2.5万办培训贷、幻想‘拿证就包分配国家电网巡检月入两万’的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 16,
      age_max: 55,
      education_min: "初中及以上文化程度（无色盲色弱，矫正视力1.0以上）",
      physical_constraints: [
        "无色盲色弱（须清晰辨识低空高压电线与状态灯）",
        "常规农用无人机在适飞空域作业免民航局通用执照，但须经生产企业培训考核取得《农用无人驾驶航空器操作证书》；从事非农用（电力巡检/吊运/测绘）、管制空域飞行或承接政府统防统治招标须考取CAAC民航局操控员执照"
      ],
      prep_duration_days: { min: 15, max: 30 },
      official_zero_markup_cost_cny: {
        total_min: 6800,
        total_max: 9800,
        breakdown: [
          { item: "中国民航局(CAAC)无人机操控员官方考试规费", cost_cny: "400 - 600" },
          { item: "民航局UOM平台备案合规培训机构飞行实操学时费", cost_cny: "6,400 - 9,200" },
          { item: "自购植保无人机单干可申领国家农机购置补贴(按载药量分档，可选)", cost_cny: "财政直接补贴 6,000 ~ 14,400 元/台" }
        ]
      },
      official_portal_url: "https://uom.caac.gov.cn",
      official_portal_name: "中国民航局民用无人驾驶航空器综合管理平台 (UOM) / 农业农村部农机化信息网",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "国务院、中央军委《无人驾驶航空器飞行管理暂行条例》（国令第761号）第十六条、第十七条（农用操作证书与民航操控员执照分轨条款）",
          authority: "中华人民共和国国务院 / 中央军事委员会",
          source_url: "https://www.gov.cn"
        },
        {
          level: "L1",
          doc_name: "农业农村部办公厅、财政部办公厅《2024—2026年全国通用类农业机械中央财政资金最高补贴额一览表》（农办机〔2024〕6号 · 植保无人驾驶航空器补贴条款）",
          authority: "中华人民共和国农业农村部 / 财政部",
          source_url: "https://www.moa.gov.cn"
        },
        {
          level: "L2",
          doc_name: "中国民航局《民用无人驾驶航空器操控员执照管理规则》及UOM平台官方备案培训机构名录",
          authority: "中国民用航空局 (CAAC)",
          source_url: "https://uom.caac.gov.cn"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 河南、黑龙江、新疆及江苏跨区飞防队单亩报价与作业流水采集，具有极强的‘春秋农忙赚大钱、冬季封冻期断档’季节周期特征。",
      net_income_stages: [
        { stage: "冬季农闲封冻期 (11月至次年2月，无农田植保需求)", monthly_cny_range: [0, 3000], highlight: "须靠旺季存款过冬，或凭CAAC通用执照转接电力巡检/吊运散活", duration_months: 4 },
        { stage: "受雇飞防合作社当专职飞手期 (旺季底薪+每亩1.5-2.5元提成)", monthly_cny_range: [8000, 13000], highlight: "无需自掏腰包买机器，旺季随队南北转场赚取稳定计件工资", duration_months: 4 },
        { stage: "自购植保机单干/夫妻小队旺季期 (日打300-500亩，6-10元/亩)", monthly_cny_range: [18000, 35000], highlight: "扣除油电损耗后旺季日净赚1200-1800元，干满5个月旺季可净攒12-20万", duration_months: 5 }
      ],
      deal_breakers: [
        "【凌晨3点摸黑下田+40℃暴晒地狱作息】为避开正午高温蒸发与大风，最佳作业时间在凌晨04:00-10:00及深夜，旺季连续数月每天仅睡4-5小时、全身沾满农药味",
        "【撞高压线炸机天价赔偿风险】农村田间细高压电线极难辨识，疲劳分神炸机一次维修费动辄8000-20000元，若撞断高压线停电还将面临巨额索赔（必须买足三者险）",
        "北方与中原地区存在长达4-5个月冬季农闲断档期，缺乏财务规划者极易在淡季坐吃山空"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [16800, 25000],
        scam_alert: "【防诈铁律】1. 民航局CAAC中型超视距执照正常培训费仅7000-9500元（去官网 uom.caac.gov.cn 查备案机构直接报名），凡收1.8万-2.5万吹嘘‘考证包分配电网巡检/植保月入两万’100%是招转培割韭菜！2. 购机务必索要正规农机发票并申领国家农机购置补贴。"
      }
    }
  },
  {
    path_id: "PATH_060",
    title: "执业兽医资格证（农业农村部全国统考 · 宠物医疗与现代牧场双栖）",
    batch_id: 'BATCH_5',
    policy_update_month: "每年 1-3 月网上报名 & 7 月全国机考（中国兽医网）",
    pk_arena: 'ADULT_PK',
    domain: 'MEDICAL_CARE',
    identity_group: ['YOUTH_18_35', 'MIDLIFE_35_55', 'SENIOR_50_PLUS'],
    core_goals: ['DAILY_HOME_FAMILY', 'SAVE_300K_3YR'],
    scenario_tags: ["二本失业", "大专蓝领", "农村/县城青年", "35+被裁"],
    category: ["国家准入资格", "独家处方权护城河", "越老越吃香"],
    status_light: "GREEN",
    last_verified_date: "2026-11-23",
    includes_free_board_lodging: false,
    requires_night_shift: false,
    allows_daily_home: true,
    requires_heavy_lifting_or_waist: false,
    keywords: ["执业兽医", "兽医证", "宠物医生", "宠物医院", "畜牧兽医", "中国兽医网", "处方权", "现代牧场", "猪场兽医", "越老越吃香"],
    diy_action_steps: [
      "第一步：先严核专业学历准入红线——打开中国兽医网 (https://www.cadc.net.cn) 下载最新《执业兽医资格考试报名专业目录》，确认已持有（或通过国家承认成考/自考/国开修读）兽医、畜牧兽医、中兽医或水产养殖相关大专及以上学历（非目录专业严禁轻信中介代报）。",
      "第二步：每年1-3月直接登录中国兽医网“全国执业兽医资格考试网上信息平台”个人在线报名（4科机考费 0-280 元，部分省份全免），花 120-200 元购买中国农业出版社正版应试指南与历年真题库，在职刷题 3-6 个月（考过基础/预防/临床/综合应用4科，合格线固定公布）。",
      "第三步：7月全国统一机考通过并申领农业农村部《执业兽医资格证书》后，依据《动物防疫法》第六十九条向执业所在地县级人民政府农业农村主管部门办理执业备案（取得合法兽医处方权）。",
      "第四步：按个人偏好二选一落地——向往城市稳定与高天花板者，进连锁宠物医院做1年临床助理跟诊练手感后晋升主治/专科医生（月入1万-3.2万）；追求包吃住极速攒钱者，直投上市农牧集团大型现代牧场/猪场驻场兽医主管（包吃住五险一金，一年纯存12-15万）。"
    ],
    pk_profile: {
      short_name: "060 执业兽医资格证 (宠物/牧场)",
      badge: "法定独家处方权 · 零35岁年龄歧视",
      official_cost_avg: 370,
      prep_months: 4.5,
      prep_label: "3-6个月在职备考+中国兽医网全国机考",
      hard_threshold: "18-60岁 · 严卡兽医/畜牧/水产相关大专及以上学历",
      intern_months: 12,
      intern_monthly_net: 5500,
      intern_label: "拿证首年宠物医院临床助理跟诊期(积累化验与绝育手术手感)",
      regular_monthly_net: 12800,
      regular_range: [10000, 32000],
      on_job_living_expense: 2200,
      working_months_per_year: 12,
      family_separation: {
        level: 'LOW',
        text: "城市宠物医院可每天下班回家；若选高薪上市农牧集团猪场驻场，则因防非洲猪瘟须连续2-3个月封闭驻场"
      },
      body_toll: "无重体力搬运；但宠物临床易遇应激犬猫抓咬打狂犬疫苗及情绪化宠主医闹，牧场驻场则需耐受封闭隔离枯燥感",
      ceiling_3yr: "资深专科宠物医师（骨科/心脏超声/猫科）或连锁医院院长月入 1.8万-3.2万，越老越值钱，彻底免疫35岁失业潮",
      agency_trap_diff: 5400,
      verdict_fit: [
        "18-55岁拥有兽医、畜牧兽医、动物医学或水产养殖相关大专/本科学历（含在读或愿意先修成考对口大专者），希望花不到500元考费拿到法定独家处方权护城河的人",
        "喜爱临床医学诊断、抗压且愿意用首年5000元助理期换取3年后月入1.5万-3万终身硬手艺的人"
      ],
      verdict_avoid: [
        "非目录内专业又不愿花2.5年修读国家承认对口成考大专、妄想找中介花5000元‘走特殊渠道代报名’的人",
        "极度害怕犬猫抓咬、无法承受急诊手术血腥场面或无法应对宠主情绪冲突的人"
      ]
    },
    track_a_hard_facts: {
      age_min: 18,
      age_max: 60,
      education_min: "必须持有国务院教育行政部门认可的兽医、畜牧兽医、中兽医、水产养殖相关专业大专及以上学历（含全日制应届生及国家承认成考/自考/国开对应专业学历）",
      physical_constraints: ["严卡专业学历准入（非目录内专业无法通过系统审核）", "身体健康，具备动物临床保定与外科操作能力"],
      prep_duration_days: { min: 90, max: 180 },
      official_zero_markup_cost_cny: {
        total_min: 260,
        total_max: 480,
        breakdown: [
          { item: "农业农村部全国执业兽医资格机考4科报名费 (部分省份免收)", cost_cny: "0 - 280" },
          { item: "中国农业出版社官方指定考试指南与历年真题库", cost_cny: "120 - 200" }
        ]
      },
      official_portal_url: "https://www.cadc.net.cn",
      official_portal_name: "中国兽医网（国家动物疫病预防控制中心 · 全国执业兽医资格考试唯一报名平台）",
      l1_l2_sources: [
        {
          level: "L1",
          doc_name: "《中华人民共和国动物防疫法》（2021年修订）第六十一条、第六十九条、第七十条及《国家职业资格目录（2021年版）》专业技术人员职业资格第18项准入类：执业兽医",
          authority: "全国人大常委会 / 人力资源和社会保障部",
          source_url: "https://www.mohrss.gov.cn"
        },
        {
          level: "L1",
          doc_name: "《执业兽医和乡村兽医管理办法》（农业农村部令2022年第6号）及年度《执业兽医资格考试公告》",
          authority: "中华人民共和国农业农村部",
          source_url: "https://www.moa.gov.cn"
        },
        {
          level: "L2",
          doc_name: "中国兽医网全国执业兽医资格考试网上信息平台报名专业目录及分数线通知",
          authority: "国家动物疫病预防控制中心 (cadc.net.cn)",
          source_url: "https://www.cadc.net.cn"
        }
      ]
    },
    track_b_reality_slice: {
      mandatory_disclaimer: "⚠️ 体感数据基于 L3 连锁宠物医院临床主治医师（底薪+提成）及大型上市农牧集团驻场执业兽医师工资条采集，临床宠物医疗与规模化养殖场的工作环境截然不同。",
      net_income_stages: [
        { stage: "宠物医院临床助理跟诊期 (拿证首年积累手术与病例手感)", monthly_cny_range: [4500, 6500], highlight: "学习化验判读、保定与基础绝育手术，夯实临床基本功", duration_months: 12 },
        { stage: "持证宠物临床主治医生 / 大型上市猪场驻场兽医主管", monthly_cny_range: [10000, 15500], highlight: "宠物医院底薪+诊疗手术提成；大型牧场包吃住五险一金一年纯存12-15万", duration_months: 12 },
        { stage: "资深专科宠物医师 (骨科/心脏超声/猫科/连锁医院院长)", monthly_cny_range: [18000, 32000], highlight: "高客单价医疗刚需，完全不受35岁职场年龄歧视，经验越老越值钱", duration_months: 12 }
      ],
      deal_breakers: [
        "【严卡相关专业学历】非兽医/畜牧兽医/水产养殖专业无法报考，跨行文理科生必须先花2.5年修读成人教育相关专业大专学历方可报名",
        "【宠物医闹与抓咬伤风险】接诊应激烈性犬猫被抓咬打狂犬疫苗是常态；部分宠主把宠物当家人，一旦危重抢救无效极易面临激烈情绪冲突与网暴索赔",
        "【规模化养殖场的封闭坐牢隔离】若进大型养猪集团拿高薪驻场，为防非洲猪瘟进场须消毒隔离3-5天，随后连续2-3个月封闭在偏远山坳猪场内禁出大门"
      ],
      anti_scam_mirror: {
        typical_agency_quote_cny: [3800, 7800],
        scam_alert: "【防诈铁律】1. 农业农村部报名系统直接与学信网接口自动比对专业名称，凡机构收5000元吹嘘‘非兽医专业走特殊渠道代报名’100%是诈骗！2. 宠物美容师证无任何行医开药资格，唯有农业农村部颁发的《执业兽医资格证》具备法定处方权。"
      }
    }
  }
];

export const VERIFIED_PATHS: VerifiedPath[] = RAW_VERIFIED_PATHS.map(hydratePathWithFreshness);

export const L1_L5_PROTOCOL_SPEC = [
  {
    level: "L1",
    badge: "国家法定铁律",
    track: "轨 A：政策硬事实",
    sources: "全国人大法律、国务院行政法规、部委部门规章（教育部/交通运输部/应急管理部/市场监管总局/人社部令/德国居留法§16a/澳洲移民法462/深圳个人破产条例）、《国家职业资格目录》",
    rule: "决定一条升学或职业路径是否合法存在、准入年龄/户籍/身体底线、以及是否严禁收中介费。一票否决任何违规黑产。"
  },
  {
    level: "L2",
    badge: "官方执行裸价",
    track: "轨 A：政策硬事实",
    sources: "各省教育考试院/人事考试网、德国联邦劳工局/澳洲ImmiAccount、省级发改委/财政厅收费标准、特检院/海事/消防官方报名门户",
    rule: "确立 DIY 零加价成本底线（官方裸价尺）。任何超出 L2 基准 2 倍以上的市场报价自动触发黑中介预警。"
  },
  {
    level: "L3",
    badge: "一线契约实证",
    track: "轨 B：真实体感切片",
    sources: "双元制学徒合同与税后工资单、三支一扶/特岗在岗津贴流水、脱敏真实劳务合同、深圳中院个人破产重整裁定书",
    rule: "剥离招生简章与招聘广告的高薪泡沫，强制拆分为‘新手期/熟手期/高阶期’三段式真实到手净现金流与服务期枷锁。"
  },
  {
    level: "L4",
    badge: "行业统计交叉",
    track: "轨 B：真实体感切片",
    sources: "德国BIBB法定学徒津贴公报、澳洲Fair Work法定最低时薪、高校毕业生就业质量年度报告、中国海事局船员薪酬指数",
    rule: "与 L3 工资单交叉核验，剔除幸存者偏差（如极个别销冠或极端加班个例），锁定中位数区间。"
  },
  {
    level: "L5",
    badge: "伤痕劝退与防坑",
    track: "轨 B：真实体感切片",
    sources: "中国裁判文书网‘招转培/培训贷/公考协议班退费纠纷/反催收法务诈骗’判例、12315高频陷阱、一线退场者访谈",
    rule: "强制提炼至少 3 条生理/心理/契约锁定期‘头号劝退红线’与‘黑中介照妖镜’，不展示劝退红线不准入库。"
  }
];
