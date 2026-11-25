import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { z } from 'zod';
import { VERIFIED_PATHS } from '../src/data/verifiedPaths.ts';
import {
  type VerifiedPath,
  getEffectiveStatusLight,
  isInActiveWindowMonth,
} from '../src/data/schema.ts';
import type {
  AdvisorDiagnoseResponse,
  AdvisorFollowUpResponse,
  HydratedExcludedPath,
  HydratedRecommendedPath,
} from '../src/types/advisor.ts';

const ADVISOR_MODEL = 'gemini-4-hydrogen';

const VERIFIED_PATHS_BY_ID = new Map<string, VerifiedPath>(
  VERIFIED_PATHS.map((p) => [p.path_id, p])
);

export const DiagnoseRequestSchema = z.object({
  situationText: z
    .string()
    .trim()
    .min(6, '请至少输入 6 个字描述你的真实处境（如年龄、学历、核心痛点或诉求）')
    .max(1200, '处境描述请控制在 1200 字以内'),
  age: z.number().int().min(14).max(75).nullable().optional(),
  education: z.string().trim().max(60).optional(),
  budgetCny: z.number().min(0).max(500000).default(20000),
  monthlyFamilyBurn: z.number().min(0).max(50000).default(2500),
  constraints: z
    .object({
      dailyHome: z.boolean().default(false),
      freeBoard: z.boolean().default(false),
      protectWaist: z.boolean().default(false),
      colorBlindSafe: z.boolean().default(false),
      noNightShift: z.boolean().default(false),
    })
    .default({
      dailyHome: false,
      freeBoard: false,
      protectWaist: false,
      colorBlindSafe: false,
      noNightShift: false,
    }),
});

export const FollowUpRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, '请输入你想追问的具体问题')
    .max(500, '追问内容请控制在 500 字以内'),
  situationText: z.string().trim().max(1200).default(''),
  budgetCny: z.number().min(0).max(500000).default(20000),
  monthlyFamilyBurn: z.number().min(0).max(50000).default(2500),
  recommendedPathIds: z.array(z.string().max(20)).max(6).default([]),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().max(1200),
      })
    )
    .max(8)
    .default([]),
});

export class AdvisorServiceError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'ADVISOR_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new AdvisorServiceError(
      '服务端尚未配置有效的 GEMINI_API_KEY。请在 AI Studio 的 Settings > Secrets 面板检查并配置密钥后重试。',
      500,
      'MISSING_API_KEY'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function classifyGeminiError(err: unknown): AdvisorServiceError {
  if (err instanceof AdvisorServiceError) return err;
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('api key not valid') ||
    lower.includes('403')
  ) {
    return new AdvisorServiceError(
      'AI 密钥校验未通过或无权调用。请在 AI Studio 的 Settings > Secrets 面板检查你的 GEMINI_API_KEY 配置。',
      400,
      'API_KEY_INVALID'
    );
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return new AdvisorServiceError(
      '当前 AI 调用额度已达上限，请稍后再试，或在 Settings > Secrets 面板切换更高配额的密钥。',
      429,
      'QUOTA_EXCEEDED'
    );
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return new AdvisorServiceError(
      'AI 模型接口暂时不可用（404），请稍后重试。',
      500,
      'MODEL_NOT_FOUND'
    );
  }
  return new AdvisorServiceError(
    `AI 诊断服务暂时繁忙或网络波动，请稍后重试。（${msg.slice(0, 120)}）`,
    500,
    'UPSTREAM_ERROR'
  );
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const classified = classifyGeminiError(err);
      if (
        classified.code === 'MISSING_API_KEY' ||
        classified.code === 'API_KEY_INVALID' ||
        classified.code === 'MODEL_NOT_FOUND' ||
        classified.code === 'QUOTA_EXCEEDED'
      ) {
        throw classified;
      }
      if (attempt < maxRetries) {
        const delayMs = 450 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw classifyGeminiError(lastError);
}

function buildCompactCatalogForPrompt(referenceDate: Date = new Date()): string {
  const currentMonth = referenceDate.getMonth() + 1;
  const rows = VERIFIED_PATHS.map((p) => {
    const eff = getEffectiveStatusLight(p, referenceDate);
    const activeWindow = isInActiveWindowMonth(p.freshness_meta, currentMonth);
    return {
      id: p.path_id,
      title: p.title,
      arena: p.pk_arena,
      tags: p.scenario_tags.slice(0, 4),
      age: `${p.track_a_hard_facts.age_min}-${p.track_a_hard_facts.age_max}`,
      edu: p.track_a_hard_facts.education_min,
      phys: p.track_a_hard_facts.physical_constraints.join('; '),
      flags: `${p.allows_daily_home ? '可每日回家' : '需驻外/出海'}|${p.includes_free_board_lodging ? '包吃住/免学费' : '自理食宿'}|${p.requires_night_shift ? '有夜班/轮班' : '无强制夜班'}|${p.requires_heavy_lifting_or_waist ? '伤腰/重体力' : '对腰友好'}`,
      prep: `${p.track_a_hard_facts.prep_duration_days.min}-${p.track_a_hard_facts.prep_duration_days.max}天(${p.pk_profile.prep_months}月)`,
      cost: `${p.track_a_hard_facts.official_zero_markup_cost_cny.total_min}-${p.track_a_hard_facts.official_zero_markup_cost_cny.total_max}元`,
      net: `新手¥${p.track_b_reality_slice.net_income_stages[0].monthly_cny_range.join('-')}→熟手¥${p.track_b_reality_slice.net_income_stages[1].monthly_cny_range.join('-')}`,
      risks: p.track_b_reality_slice.deal_breakers.slice(0, 2).join('；'),
      scam: p.track_b_reality_slice.anti_scam_mirror.scam_alert.slice(0, 110),
      step1: (p.diy_action_steps[0] ?? '').slice(0, 90),
      win: p.freshness_meta?.window_label ?? '常年开放',
      active_now: activeWindow,
      light: eff.degraded ? 'AMBER_DEGRADED' : eff.effectiveLight,
    };
  });
  return JSON.stringify(rows);
}

const DIAGNOSE_SYSTEM_INSTRUCTION = `你是《人生无限：地球漫游指南》破局沙盘的【受控处境诊断顾问】。

你的核心使命是帮助身处升学分流、职场瓶颈、35+被裁、负债重启或返乡迷茫期的普通人打破信息差，同时守住【零幻觉、零鸡汤、零中介推销】底线。

【绝对红线（违者即失败）】：
1. 只能从下方提供的【已核验路径总库（33条）】中选择 path_id 进行推荐或排除。严禁编造任何库外路径、不存在的 PATH_ID、虚假官方网址、虚假补贴金额或虚假高薪承诺。
2. 必须严格校对硬门槛：
   - 年龄限制（age_range）：超龄一律不可作为主推，应放入 excluded_or_caution_paths 说明原因；
   - 学历/专业限制（如执业兽医严卡兽医/畜牧/水产专业，军队文职大多要求本科等）；
   - 体检/身体红线（如色盲色弱严禁特种驾驶/航海/消防/无人机；腰椎不好严禁重体力/搬运）；
   - 家庭牵挂（如明确每天回家顾家，则远洋船员/豪华邮轮/央企海外驻外必须排除）；
   - 资金断粮账（启动裸价 + 准备期月数 × 家庭月消耗 若远超手头资金，必须在 hard_cost_and_runway_check 中明确预警，不可盲目劝人借网贷脱产）。
3. 必须直白给出每条推荐路径最痛的劝退红线（摘取并结合该路径真实 deal_breakers），帮用户提前“泼冷水”而不是画大饼。
4. 如果用户的处境在本库现有 33 条路径中没有完美匹配的，必须诚实写入 out_of_library_disclaimer，绝不强行硬凑。
5. 语言风格：清醒、务实、像懂行且替你算账的资深行业老兵，杜绝空洞情绪安抚和官僚套话。每个字段保持精炼紧凑。`;

const DIAGNOSE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: [
    'situation_summary',
    'cashflow_pressure_note',
    'recommended_paths',
    'excluded_or_caution_paths',
    'anti_scam_reminder',
    'out_of_library_disclaimer',
    'suggested_followups',
  ],
  properties: {
    situation_summary: {
      type: Type.STRING,
      description: '1-2句话精准提炼用户的年龄/身份、核心痛点、硬约束与真实优势。',
    },
    cashflow_pressure_note: {
      type: Type.STRING,
      description: '基于手头总资金与家庭月消耗，算出脱产缓冲月数并给出是否适合长周期脱产的冷酷判断。',
    },
    recommended_paths: {
      type: Type.ARRAY,
      description: '从已核验路径库中严格筛选 1-3 条最匹配的路径，按优先级排列。绝不可输出库外 path_id。',
      items: {
        type: Type.OBJECT,
        required: [
          'path_id',
          'fit_tier',
          'fit_score',
          'why_it_fits',
          'hard_cost_and_runway_check',
          'top_deal_breaker_warning',
          'first_step_today',
        ],
        properties: {
          path_id: { type: Type.STRING, description: '必须是库中真实存在的 PATH_XXX 编号' },
          fit_tier: {
            type: Type.STRING,
            enum: ['PRIMARY', 'ALTERNATIVE', 'BACKUP'],
          },
          fit_score: { type: Type.INTEGER, description: '0-99 之间的匹配分' },
          why_it_fits: { type: Type.STRING, description: '结合用户自身条件说明为什么这条路打破了信息差（2句话内）' },
          hard_cost_and_runway_check: {
            type: Type.STRING,
            description: '结合官方裸价、准备周期和用户家庭月耗算清会不会断粮（1-2句话）',
          },
          top_deal_breaker_warning: {
            type: Type.STRING,
            description: '基于该路径真实 deal_breakers 给出最必须提前接受的代价（1-2句话）',
          },
          first_step_today: {
            type: Type.STRING,
            description: '用户今天就能零中介费执行的具体第一步动作（1句话）',
          },
        },
      },
    },
    excluded_or_caution_paths: {
      type: Type.ARRAY,
      description: '列出 1-3 条用户可能动心但因年龄/专业/身体/顾家/断粮被明确排除的库内路径及原因。',
      items: {
        type: Type.OBJECT,
        required: ['path_id', 'reason'],
        properties: {
          path_id: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
      },
    },
    anti_scam_reminder: {
      type: Type.STRING,
      description: '针对上述推荐路径最常见的黑中介/招转培骗局，给出一条最致命的防诈铁律。',
    },
    out_of_library_disclaimer: {
      type: Type.STRING,
      description: '明确说明本结论仅基于当前33条已核验路径库；如用户存在库内尚未覆盖的特殊诉求或门槛缺口，在此诚实指出。',
    },
    suggested_followups: {
      type: Type.ARRAY,
      description: '给出 3 个用户最值得继续追问的具体对比问题（每个不超过24字）。',
      items: { type: Type.STRING },
    },
  },
};

interface RawAIDiagnoseOutput {
  situation_summary?: string;
  cashflow_pressure_note?: string;
  recommended_paths?: Array<{
    path_id: string;
    fit_tier: 'PRIMARY' | 'ALTERNATIVE' | 'BACKUP';
    fit_score: number;
    why_it_fits: string;
    hard_cost_and_runway_check: string;
    top_deal_breaker_warning: string;
    first_step_today: string;
  }>;
  excluded_or_caution_paths?: Array<{
    path_id: string;
    reason: string;
  }>;
  anti_scam_reminder?: string;
  out_of_library_disclaimer?: string;
  suggested_followups?: string[];
}

export async function diagnoseUserSituation(
  input: z.infer<typeof DiagnoseRequestSchema>
): Promise<AdvisorDiagnoseResponse> {
  const ai = createGeminiClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const catalogJson = buildCompactCatalogForPrompt(now);

  const activeConstraints: string[] = [];
  if (input.constraints.dailyHome) activeConstraints.push('必须每天回家/顾家，严禁长期驻外或出海');
  if (input.constraints.freeBoard) activeConstraints.push('优先或仅看包吃住/免学费路径');
  if (input.constraints.protectWaist) activeConstraints.push('护腰椎，严禁重体力搬运或长期高负荷劳损');
  if (input.constraints.colorBlindSafe) activeConstraints.push('存在色盲/色弱，严禁勾选任何卡辨色力的体检门槛路径');
  if (input.constraints.noNightShift) activeConstraints.push('拒绝长期强制夜班/熬夜倒班');

  const userPrompt = [
    `当前日期：${now.toISOString().slice(0, 10)}（当前为 ${currentMonth} 月，请注意核对路径的招生/网报窗口月份）`,
    `【用户画像与真实处境】`,
    `- 处境自述：${input.situationText}`,
    `- 补充年龄：${input.age ? `${input.age}岁` : '未单独填写（请从自述中识别，若未提及请不要臆测）'}`,
    `- 补充学历/专业：${input.education?.trim() ? input.education.trim() : '未单独填写（请从自述中识别）'}`,
    `- 手头可用总资金（启动+活命备用金）：¥${input.budgetCny.toLocaleString()}`,
    `- 脱产期家庭每月刚性消耗（房租/还贷/抚养）：¥${input.monthlyFamilyBurn.toLocaleString()}/月`,
    `- 已勾选刚性红线：${activeConstraints.length > 0 ? activeConstraints.join('；') : '无额外勾选红线'}`,
    ``,
    `【已核验路径总库（共 ${VERIFIED_PATHS.length} 条，唯一合法信息源）】`,
    catalogJson,
  ].join('\n');

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: ADVISOR_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: DIAGNOSE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: DIAGNOSE_RESPONSE_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    })
  );

  const rawText = (response.text ?? '').trim();
  if (!rawText) {
    throw new AdvisorServiceError('AI 未返回有效诊断内容，请重试。', 500, 'EMPTY_RESPONSE');
  }

  let parsed: RawAIDiagnoseOutput;
  try {
    parsed = JSON.parse(rawText) as RawAIDiagnoseOutput;
  } catch {
    throw new AdvisorServiceError('AI 返回格式解析失败，请重新发起诊断。', 500, 'PARSE_ERROR');
  }

  // Server-side grounding filter: drop any hallucinated path_id and hydrate canonical facts from VERIFIED_PATHS
  const seenRecIds = new Set<string>();
  const hydratedRecommended: HydratedRecommendedPath[] = [];

  for (const rec of parsed.recommended_paths ?? []) {
    const id = rec.path_id?.trim().toUpperCase();
    if (!id || seenRecIds.has(id)) continue;
    const canonicalPath = VERIFIED_PATHS_BY_ID.get(id);
    if (!canonicalPath) continue; // Drop any hallucinated path_id!
    seenRecIds.add(id);

    const eff = getEffectiveStatusLight(canonicalPath, now);
    const costMin = canonicalPath.track_a_hard_facts.official_zero_markup_cost_cny.total_min;
    const costMax = canonicalPath.track_a_hard_facts.official_zero_markup_cost_cny.total_max;
    const totalBurn = Math.round(costMin + canonicalPath.pk_profile.prep_months * input.monthlyFamilyBurn);
    const cashGap = Math.max(0, totalBurn - input.budgetCny);

    hydratedRecommended.push({
      path_id: canonicalPath.path_id,
      fit_tier:
        rec.fit_tier === 'PRIMARY' || rec.fit_tier === 'ALTERNATIVE' || rec.fit_tier === 'BACKUP'
          ? rec.fit_tier
          : hydratedRecommended.length === 0
            ? 'PRIMARY'
            : 'ALTERNATIVE',
      fit_score: Math.max(1, Math.min(99, Math.round(Number(rec.fit_score) || 75))),
      why_it_fits: String(rec.why_it_fits || '').trim(),
      hard_cost_and_runway_check: String(rec.hard_cost_and_runway_check || '').trim(),
      top_deal_breaker_warning: String(rec.top_deal_breaker_warning || '').trim(),
      first_step_today:
        String(rec.first_step_today || '').trim() || canonicalPath.diy_action_steps[0] || '',
      canonical: {
        title: canonicalPath.title,
        short_name: canonicalPath.pk_profile.short_name,
        pk_arena: canonicalPath.pk_arena,
        domain: canonicalPath.domain,
        official_cost_min: costMin,
        official_cost_max: costMax,
        agency_quote_min: canonicalPath.track_b_reality_slice.anti_scam_mirror.typical_agency_quote_cny[0],
        agency_quote_max: canonicalPath.track_b_reality_slice.anti_scam_mirror.typical_agency_quote_cny[1],
        prep_days_min: canonicalPath.track_a_hard_facts.prep_duration_days.min,
        prep_days_max: canonicalPath.track_a_hard_facts.prep_duration_days.max,
        prep_months: canonicalPath.pk_profile.prep_months,
        regular_monthly_net_range: canonicalPath.pk_profile.regular_range,
        official_portal_name: canonicalPath.track_a_hard_facts.official_portal_name,
        official_portal_url: canonicalPath.track_a_hard_facts.official_portal_url,
        portal_tier: canonicalPath.track_a_hard_facts.portal_tier ?? 'STATUTORY_GOV',
        window_label: canonicalPath.freshness_meta?.window_label ?? '常年滚动开放',
        is_active_window: isInActiveWindowMonth(canonicalPath.freshness_meta, currentMonth),
        effective_light: eff.effectiveLight,
        degraded: eff.degraded,
        degrade_reason: eff.degradeReason,
        last_verified_date: canonicalPath.last_verified_date,
        total_prep_and_family_burn: totalBurn,
        cash_gap_cny: cashGap,
      },
    });
    if (hydratedRecommended.length >= 3) break;
  }

  const seenExclIds = new Set<string>();
  const hydratedExcluded: HydratedExcludedPath[] = [];
  for (const ex of parsed.excluded_or_caution_paths ?? []) {
    const id = ex.path_id?.trim().toUpperCase();
    if (!id || seenExclIds.has(id) || seenRecIds.has(id)) continue;
    const canonicalPath = VERIFIED_PATHS_BY_ID.get(id);
    if (!canonicalPath) continue;
    seenExclIds.add(id);
    hydratedExcluded.push({
      path_id: canonicalPath.path_id,
      title: canonicalPath.title,
      reason: String(ex.reason || '').trim(),
    });
    if (hydratedExcluded.length >= 3) break;
  }

  return {
    model: ADVISOR_MODEL,
    generated_at: now.toISOString(),
    library_size: VERIFIED_PATHS.length,
    situation_summary: String(parsed.situation_summary || '').trim(),
    cashflow_pressure_note: String(parsed.cashflow_pressure_note || '').trim(),
    recommended_paths: hydratedRecommended,
    excluded_or_caution_paths: hydratedExcluded,
    anti_scam_reminder: String(parsed.anti_scam_reminder || '').trim(),
    out_of_library_disclaimer:
      String(parsed.out_of_library_disclaimer || '').trim() ||
      `本诊断严格限定于本沙盘当前已核验的 ${VERIFIED_PATHS.length} 条路径库内，不编造库外未核验政策。`,
    suggested_followups: (parsed.suggested_followups ?? [])
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, 3),
  };
}

const FOLLOWUP_SYSTEM_INSTRUCTION = `你是《人生无限：地球漫游指南》破局沙盘的【受控追问顾问】。
必须严格遵守以下规则：
1. 只能依据提供的【已核验路径总库（33条）】回答用户追问，严禁编造库外政策、网址、补贴或培训包就业承诺。
2. 回答中凡提到具体路径，必须在括号或句中标出准确的 PATH_XXX 编号（例如 PATH_036、PATH_058），方便系统自动挂载核验链接。
3. 如果用户问及库外行业、地区细则或个人法律/医疗专业判断，必须诚实说明“本库暂无该细分实测数据，请直接以对应政务官网最新公告为准”。
4. 用清晰的分点短句作答，控制在 350 字以内，先给结论再给算账细节与风险提醒。
5. 输出纯文本分段（用“一、/ 1.”分点即可），不要使用 Markdown 语法符号（如 **、###、\` 等）。`;

export async function answerFollowUpQuestion(
  input: z.infer<typeof FollowUpRequestSchema>
): Promise<AdvisorFollowUpResponse> {
  const ai = createGeminiClient();
  const now = new Date();
  const catalogJson = buildCompactCatalogForPrompt(now);

  const validFocusIds = input.recommendedPathIds
    .map((id) => id.trim().toUpperCase())
    .filter((id) => VERIFIED_PATHS_BY_ID.has(id));

  const historyBlock =
    input.history.length > 0
      ? input.history
          .slice(-6)
          .map((h) => `${h.role === 'user' ? '用户' : '顾问'}：${h.text}`)
          .join('\n')
      : '无此前追问记录';

  const prompt = [
    `当前日期：${now.toISOString().slice(0, 10)}`,
    `【用户原始处境】${input.situationText || '未提供'}`,
    `【用户资金】手头总资金 ¥${input.budgetCny.toLocaleString()}，家庭月消耗 ¥${input.monthlyFamilyBurn.toLocaleString()}/月`,
    `【刚推荐的重点路径】${validFocusIds.length > 0 ? validFocusIds.join(', ') : '无特定焦点，可在33条总库中检索'}`,
    `【最近追问记录】\n${historyBlock}`,
    `【用户最新追问】${input.question}`,
    ``,
    `【已核验路径总库（共 ${VERIFIED_PATHS.length} 条，唯一合法信息源）】`,
    catalogJson,
  ].join('\n');

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: ADVISOR_MODEL,
      contents: prompt,
      config: {
        systemInstruction: FOLLOWUP_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    })
  );

  const answer = (response.text ?? '').trim();
  if (!answer) {
    throw new AdvisorServiceError('AI 未返回有效回答，请重试。', 502, 'EMPTY_RESPONSE');
  }

  // Extract verified PATH_XXX citations mentioned in the answer
  const matches = answer.match(/PATH_\d{3}/g) ?? [];
  const citedSet = new Set<string>();
  const cited_paths: AdvisorFollowUpResponse['cited_paths'] = [];
  for (const rawId of matches) {
    if (citedSet.has(rawId)) continue;
    const p = VERIFIED_PATHS_BY_ID.get(rawId);
    if (!p) continue;
    citedSet.add(rawId);
    cited_paths.push({
      path_id: p.path_id,
      title: p.title,
      short_name: p.pk_profile.short_name,
      official_portal_url: p.track_a_hard_facts.official_portal_url,
    });
  }

  return {
    model: ADVISOR_MODEL,
    generated_at: now.toISOString(),
    answer,
    cited_paths,
  };
}
