export interface CostBreakdownItem {
  item: string;
  cost_cny: string;
}

export interface L1L2Source {
  level: 'L1' | 'L2';
  doc_name: string;
  authority: string;
  source_url?: string;
}

export type PortalTrustTier = 'STATUTORY_GOV' | 'COMMERCIAL_FIRST_PARTY';

export type LinkHealthStatus =
  | 'HEALTHY'
  | 'REDIRECTED'
  | 'RESTRICTED_BOT'
  | 'UNREACHABLE'
  | 'UNCHECKED';

export interface LinkHealthSnapshot {
  status: LinkHealthStatus;
  http_status?: number;
  checked_at: string;
  final_url?: string;
  latency_ms?: number;
  note?: string;
}

export interface FreshnessMeta {
  /** 固定招生/报名/考核窗口月份（1-12）；空数组表示常年滚动开放 */
  window_months: number[];
  /** 窗口期人类可读摘要 */
  window_label: string;
  /** 强制复核周期（天）：商业平台60天、配额签证90天、年度招考/法定许可180天 */
  verify_cycle_days: number;
  /** 下次强制重验截止日 YYYY-MM-DD */
  next_verify_due: string;
  /** 最近一次真实 HTTP 探测结果 */
  link_health?: LinkHealthSnapshot;
}

export interface LinkHealthReportEntry {
  url: string;
  status: LinkHealthStatus;
  http_status?: number;
  final_url?: string;
  latency_ms?: number;
  note?: string;
  used_by_paths: string[];
}

export interface LinkHealthReportFile {
  generated_at: string;
  total_urls: number;
  summary: {
    HEALTHY: number;
    REDIRECTED: number;
    RESTRICTED_BOT: number;
    UNREACHABLE: number;
  };
  results: Record<string, LinkHealthReportEntry>;
}

export type FreshnessUrgency = 'FRESH' | 'DUE_SOON' | 'EXPIRED';

export function computeNextVerifyDue(lastVerifiedDate: string, cycleDays: number): string {
  const base = new Date(`${lastVerifiedDate}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) return lastVerifiedDate;
  base.setUTCDate(base.getUTCDate() + cycleDays);
  return base.toISOString().slice(0, 10);
}

export function evaluateFreshnessUrgency(
  nextVerifyDue: string,
  referenceDate: Date = new Date()
): { urgency: FreshnessUrgency; daysRemaining: number } {
  const due = new Date(`${nextVerifyDue}T00:00:00Z`);
  const ref = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate())
  );
  const diffDays = Math.round((due.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { urgency: 'EXPIRED', daysRemaining: diffDays };
  if (diffDays <= 30) return { urgency: 'DUE_SOON', daysRemaining: diffDays };
  return { urgency: 'FRESH', daysRemaining: diffDays };
}

export function isInActiveWindowMonth(
  meta?: FreshnessMeta,
  currentMonth: number = new Date().getMonth() + 1
): boolean {
  if (!meta || meta.window_months.length === 0) return false;
  return meta.window_months.includes(currentMonth);
}

export function isUpcomingWindowMonth(
  meta?: FreshnessMeta,
  currentMonth: number = new Date().getMonth() + 1
): boolean {
  if (!meta || meta.window_months.length === 0) return false;
  const nextMonth = (currentMonth % 12) + 1;
  return !meta.window_months.includes(currentMonth) && meta.window_months.includes(nextMonth);
}

export interface EffectiveStatusResult {
  effectiveLight: 'GREEN' | 'YELLOW' | 'AMBER';
  degraded: boolean;
  degradeReason?: string;
  urgency: FreshnessUrgency;
  daysRemaining: number;
}

/**
 * 基于 freshness_meta 自动计算有效红绿灯状态：
 * - 超过 next_verify_due 自动从 GREEN 降级为 AMBER，杜绝“过期政策仍挂绿灯”
 */
export function getEffectiveStatusLight(
  path: Pick<VerifiedPath, 'status_light' | 'freshness_meta'>,
  referenceDate: Date = new Date()
): EffectiveStatusResult {
  const meta = path.freshness_meta;
  if (!meta) {
    return {
      effectiveLight: path.status_light,
      degraded: false,
      urgency: 'FRESH',
      daysRemaining: 180,
    };
  }
  const { urgency, daysRemaining } = evaluateFreshnessUrgency(meta.next_verify_due, referenceDate);
  if (urgency === 'EXPIRED') {
    return {
      effectiveLight: 'AMBER',
      degraded: true,
      degradeReason: `已超复核截止日 ${Math.abs(daysRemaining)} 天（原定 ${meta.next_verify_due} 重验），报名费率/政策口径可能已变动，请优先点击官方门户核对原文`,
      urgency,
      daysRemaining,
    };
  }
  return {
    effectiveLight: path.status_light,
    degraded: false,
    urgency,
    daysRemaining,
  };
}

export interface NetIncomeStage {
  stage: string;
  monthly_cny_range: [number, number];
  highlight?: string;
  duration_months?: number;
}

export interface PKProfile {
  short_name: string;
  badge: string;
  official_cost_avg: number;
  prep_months: number;
  prep_label: string;
  hard_threshold: string;
  intern_months: number;
  intern_monthly_net: number;
  intern_label: string;
  regular_monthly_net: number;
  regular_range: [number, number];
  on_job_living_expense: number;
  working_months_per_year: number;
  family_separation: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    text: string;
  };
  body_toll: string;
  ceiling_3yr: string;
  agency_trap_diff: number;
  verdict_fit: string[];
  verdict_avoid: string[];
}

export type IdentityGroup =
  | 'STUDENT_15_18'
  | 'YOUTH_18_35'
  | 'MIDLIFE_35_55'
  | 'SENIOR_50_PLUS';

export type PathDomainId =
  | 'ALL'
  | 'STUDENT_STREAM'     // D01. 升学分流与体制基层 (中本贯通/公费定向/三支一扶/特岗/国铁订单班)
  | 'CERT_TRADES'        // D02. 国家准入特种技术蓝领 (叉车N1/高低压电工/承压焊工/起重机Q2)
  | 'OVERSEAS_SHIPPING'  // D03. 远洋航运与低成本出海 (德国双元制Ausbildung/远洋水手机工)
  | 'SAFE_DESK_GUARD'    // D04. 重点单位值守与备考岗 (中级消防四级/高压配电值守)
  | 'MEDICAL_CARE';      // D05. 医养刚需与零房租高储蓄 (三甲免陪护理员/母婴康护)

export interface PathDomainMeta {
  id: PathDomainId;
  code: string;
  name: string;
  description: string;
  planned_capacity: string;
}

export const PATH_DOMAINS: PathDomainMeta[] = [
  {
    id: 'ALL',
    code: 'ALL',
    name: '全部赛道总库',
    description: '跨年龄层、跨行业准入的 L1-L5 标准核验路径总索引',
    planned_capacity: '100+ 路径容量架构',
  },
  {
    id: 'STUDENT_STREAM',
    code: 'D01',
    name: '升学分流与体制基层',
    description: '中考/高考提前批、中本贯通、公费定向生、特岗教师/三支一扶、央国企订单班',
    planned_capacity: '规划 001-025 号',
  },
  {
    id: 'OVERSEAS_SHIPPING',
    code: 'D02',
    name: '低成本出海与远洋航运',
    description: '德国双元制带薪职教(Ausbildung)、海事局适任远洋船员，合规工签或强制储蓄',
    planned_capacity: '规划 026-045 号',
  },
  {
    id: 'CERT_TRADES',
    code: 'D03',
    name: '国家准入特种技术蓝领',
    description: '市场监管局/应急管理部法定准入硬证（N1叉车/电工/承压焊工/Q2天车）',
    planned_capacity: '规划 046-075 号',
  },
  {
    id: 'SAFE_DESK_GUARD',
    code: 'D04',
    name: '重点单位值守与备考岗',
    description: '消防鉴定站/电力值守准入，体力消耗极低、做一休一可复习备考',
    planned_capacity: '规划 076-090 号',
  },
  {
    id: 'MEDICAL_CARE',
    code: 'D05',
    name: '医养刚需与零房租高储蓄',
    description: '卫健委免陪照护试点与老龄化刚需，零房租包吃住、极速现金流回血',
    planned_capacity: '规划 091-110 号',
  },
];

export type CoreGoalTag =
  | 'URGENT_30D_CASH'     // 30天极速见回头钱
  | 'SAVE_300K_3YR'       // 3年攒25-30万或高薪出海
  | 'DAILY_HOME_FAMILY'   // 每天下班回家顾家
  | 'BIAN_ZHI_STABLE'     // 拿事业编/定向考公/央国企
  | 'STUDY_ON_DUTY';      // 坐班清闲可看书备考

export type PKArenaType = 'STUDENT_PK' | 'ADULT_PK';

export interface VerifiedPath {
  path_id: string;
  title: string;
  batch_id?: 'BATCH_1' | 'BATCH_2' | 'BATCH_3' | 'BATCH_4' | 'BATCH_5';
  policy_update_month?: string;
  pk_arena: PKArenaType;
  domain: Exclude<PathDomainId, 'ALL'>;
  identity_group: IdentityGroup[];
  core_goals: CoreGoalTag[];
  scenario_tags: string[];
  category: string[];
  status_light: 'GREEN' | 'YELLOW' | 'AMBER';
  last_verified_date: string;
  freshness_meta?: FreshnessMeta;
  includes_free_board_lodging: boolean;
  requires_night_shift: boolean;
  allows_daily_home: boolean;
  requires_heavy_lifting_or_waist: boolean;
  keywords: string[];
  diy_action_steps: string[];
  pk_profile: PKProfile;
  track_a_hard_facts: {
    age_min: number;
    age_max: number;
    education_min: string;
    physical_constraints: string[];
    prep_duration_days: { min: number; max: number };
    official_zero_markup_cost_cny: {
      total_min: number;
      total_max: number;
      breakdown: CostBreakdownItem[];
    };
    portal_tier?: PortalTrustTier;
    official_portal_url: string;
    official_portal_name: string;
    l1_l2_sources: L1L2Source[];
  };
  track_b_reality_slice: {
    mandatory_disclaimer: string;
    net_income_stages: [NetIncomeStage, NetIncomeStage, NetIncomeStage];
    deal_breakers: string[];
    anti_scam_mirror: {
      typical_agency_quote_cny: [number, number];
      scam_alert: string;
    };
  };
}

/**
 * 处境补充输入框语义诊断器 (Situation Natural Language Diagnostic Engine)
 */
export interface SituationDiagnosis {
  detectedAge: number | null;
  detectedMaxBudget: number | null;
  preferDailyHome: boolean;
  avoidNightShift: boolean;
  avoidWaistHeavy: boolean;
  hasColorBlindness: boolean;
  preferBianzhiOrEdu: boolean;
  preferHighSavingDebt: boolean;
  preferQuietStudy: boolean;
  preferOverseasOrLang: boolean;
  isRecentGradExamFail: boolean;
  extractedSignals: string[];
}

export function parseUserSituationText(rawText: string): SituationDiagnosis {
  const text = rawText.trim();
  const signals: string[] = [];

  // 1. 提取年龄
  let detectedAge: number | null = null;
  const ageMatch = text.match(/(\d{2})\s*岁/);
  if (ageMatch) {
    detectedAge = Number(ageMatch[1]);
    signals.push(`识别年龄：${detectedAge}岁`);
  } else if (/初三|中考/.test(text)) {
    detectedAge = 15;
    signals.push('识别阶段：15岁中考分流');
  } else if (/高三|高考/.test(text)) {
    detectedAge = 18;
    signals.push('识别阶段：18岁高考分流');
  }

  // 2. 提取手头预算
  let detectedMaxBudget: number | null = null;
  const budgetMatch = text.match(/(?:只有|仅剩|手头|预算|存款)\s*(\d{3,5})\s*(?:元|块)?/);
  if (budgetMatch) {
    detectedMaxBudget = Number(budgetMatch[1]);
    signals.push(`识别资金上限：¥${detectedMaxBudget}`);
  }

  // 3. 提取顾家/不能外地出差诉求
  const preferDailyHome =
    /接送孩子|照顾老人|每天回家|不能出差|不出远门|本地|顾家|陪娃|离家近|居家|在家办公|宝妈居家|远程/.test(text);
  if (preferDailyHome) {
    signals.push('硬性约束：需每天回家/居家顾家');
  }

  // 4. 提取不能熬夜/夜班
  const avoidNightShift = /不能熬夜|不接受夜班|拒绝夜班|白班|心脏不好|睡眠差/.test(text);
  if (avoidNightShift) {
    signals.push('硬性约束：排斥夜班/熬夜');
  }

  // 5. 提取腰突/不能搬重物
  const avoidWaistHeavy = /腰突|腰椎|腰不好|不能搬重物|体力差|力气小|颈椎不好/.test(text);
  if (avoidWaistHeavy) {
    signals.push('身体保护：避开重体力/伤腰颈工种');
  }

  // 6. 提取色盲色弱
  const hasColorBlindness = /色盲|色弱/.test(text);
  if (hasColorBlindness) {
    signals.push('体检红线：存在色盲/色弱');
  }

  // 7. 诉求倾向
  const preferBianzhiOrEdu = /中考|高考|升学|编制|铁饭碗|民办|学费|本科|大专|三支一扶|特岗|西部计划|考研加10分|四项目|考公|考编|军队文职|文职|不考申论|六险二金/.test(text);
  if (preferBianzhiOrEdu) {
    signals.push('核心诉求：升学性价比/体制编制/考研加分或军队文职上岸');
  }

  const preferHighSavingDebt = /负债|欠债|还债|网贷|强制攒钱|翻身|30万|包吃住|央企海外|中东|非洲|东南亚|驻外/.test(text);
  if (preferHighSavingDebt) {
    signals.push('核心诉求：高储蓄率/包吃住快速还债');
  }

  const preferQuietStudy = /备考|看书|二战|清闲|坐班|全职妈妈|宝妈|重返|低体力|消控|室内轻体力|吹空调|地面指挥|Q1|居家赚美元|数字游民|AI标注|Outlier|RLHF|iTalki|Preply|对外汉语/.test(text);
  if (preferQuietStudy) {
    signals.push('核心诉求：室内轻体力/居家远程/在岗坐班可兼顾家庭或备考');
  }

  const preferOverseasOrLang = /出国|海外|德国|双元制|欧洲|润|外语|德语|英语|移民|永居|澳洲|新西兰|意大利|WHV|留学|助学金|DSU|赚美元|iTalki|Preply|Outlier|DataAnnotation|Mercor|国际中文|央企海外|中东|非洲|东南亚|驻外|外派/.test(text);
  if (preferOverseasOrLang) {
    signals.push('核心诉求：低成本合规出海/央企驻外/跨境远程赚美元');
  }

  const isRecentGradExamFail = /考研失利|考公落榜|二本失业|应届|毕业即失业|择业期|不考申论|高考滑档|考研加10分|学费代偿/.test(text);
  if (isRecentGradExamFail) {
    signals.push('处境画像：高校毕业生/考研考公或升学受挫重启');
  }

  return {
    detectedAge,
    detectedMaxBudget,
    preferDailyHome,
    avoidNightShift,
    avoidWaistHeavy,
    hasColorBlindness,
    preferBianzhiOrEdu,
    preferHighSavingDebt,
    preferQuietStudy,
    preferOverseasOrLang,
    isRecentGradExamFail,
    extractedSignals: signals,
  };
}

export interface PathMatchResult {
  score: number;
  matchReasons: string[];
  conflictWarnings: string[];
}

export function evaluatePathFit(
  path: VerifiedPath,
  diag: SituationDiagnosis,
  rawQuery: string
): PathMatchResult {
  let score = 60;
  const matchReasons: string[] = [];
  const conflictWarnings: string[] = [];

  const q = rawQuery.trim().toLowerCase();
  if (q) {
    const tokens = q
      .split(/[\s,，、/·|]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);
    const searchTokens = tokens.length > 0 ? tokens : [q];

    const matchedKeywords = new Set<string>();
    for (const token of searchTokens) {
      if (path.title.toLowerCase().includes(token) || path.path_id.toLowerCase().includes(token)) {
        matchedKeywords.add(token);
      }
      for (const k of path.keywords) {
        if (token.includes(k.toLowerCase()) || k.toLowerCase().includes(token)) {
          matchedKeywords.add(k);
        }
      }
      for (const tag of [...path.scenario_tags, ...path.category]) {
        if (token.includes(tag.toLowerCase()) || tag.toLowerCase().includes(token)) {
          matchedKeywords.add(tag);
        }
      }
    }

    if (matchedKeywords.size > 0) {
      const hitList = Array.from(matchedKeywords).slice(0, 3);
      score += Math.min(35, 18 + matchedKeywords.size * 6);
      matchReasons.push(`命中语义标签：${hitList.join(' / ')}`);
    }
  }

  if (diag.detectedAge !== null) {
    if (
      diag.detectedAge >= path.track_a_hard_facts.age_min &&
      diag.detectedAge <= path.track_a_hard_facts.age_max
    ) {
      score += 15;
      matchReasons.push(`年龄(${diag.detectedAge}岁)符合法定准入`);
    } else {
      score -= 50;
      conflictWarnings.push(
        `年龄超限：要求 ${path.track_a_hard_facts.age_min}-${path.track_a_hard_facts.age_max} 岁`
      );
    }
  }

  if (diag.detectedMaxBudget !== null) {
    if (path.track_a_hard_facts.official_zero_markup_cost_cny.total_min <= diag.detectedMaxBudget) {
      score += 15;
      matchReasons.push('启动资金在手头预算内');
    } else {
      score -= 35;
      conflictWarnings.push(
        `启动费超支：官方裸价最低需 ¥${path.track_a_hard_facts.official_zero_markup_cost_cny.total_min}`
      );
    }
  }

  if (diag.preferDailyHome) {
    if (path.allows_daily_home) {
      score += 20;
      matchReasons.push('支持本地就业每天回家顾家');
    } else {
      score -= 40;
      conflictWarnings.push('与“每天回家/不离家”冲突：需长期驻外或出海');
    }
  }

  if (diag.avoidNightShift) {
    if (!path.requires_night_shift) {
      score += 15;
      matchReasons.push('常白班为主，无强制熬夜轮班');
    } else {
      score -= 25;
      conflictWarnings.push('需承受夜班/轮班作业');
    }
  }

  if (diag.avoidWaistHeavy) {
    if (!path.requires_heavy_lifting_or_waist) {
      score += 15;
      matchReasons.push('对腰椎/重体力负荷较友好');
    } else {
      score -= 30;
      conflictWarnings.push('存在腰部负重或久仰颈椎劳损风险');
    }
  }

  if (diag.hasColorBlindness) {
    const noColorBlind = path.track_a_hard_facts.physical_constraints.some((c) =>
      c.includes('无色盲')
    );
    if (noColorBlind) {
      score -= 60;
      conflictWarnings.push('法定体检一票否决：严禁色盲/色弱');
    } else {
      score += 20;
      matchReasons.push('体检不卡辨色力（色盲色弱可报）');
    }
  }

  if (diag.preferBianzhiOrEdu && (path.domain === 'STUDENT_STREAM' || path.core_goals.includes('BIAN_ZHI_STABLE'))) {
    score += 25;
    matchReasons.push('契合体制编制上岸/升学分流诉求');
  }

  if (diag.preferHighSavingDebt && path.includes_free_board_lodging) {
    score += 25;
    matchReasons.push('包吃住/零房租，净储蓄转化率极高');
  }

  if (diag.preferQuietStudy && path.core_goals.includes('STUDY_ON_DUTY')) {
    score += 25;
    matchReasons.push('值守期间体力消耗低，适合边上班边备考');
  }

  if (diag.preferOverseasOrLang && path.domain === 'OVERSEAS_SHIPPING') {
    score += 30;
    matchReasons.push('契合低成本合规出海/带薪学手艺方向');
  }

  if (
    diag.isRecentGradExamFail &&
    (path.scenario_tags.includes('考研失利') ||
      path.scenario_tags.includes('考公落榜') ||
      path.scenario_tags.includes('二本失业'))
  ) {
    score += 25;
    matchReasons.push('专为二本失业/考研失利/考公落榜设计');
  }

  return {
    score: Math.max(0, Math.min(99, score)),
    matchReasons,
    conflictWarnings,
  };
}
