import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Scale,
  Calculator,
  ExternalLink,
  Send,
  RotateCcw,
  CheckCircle2,
  Ban,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import type {
  AdvisorConstraints,
  AdvisorDiagnoseResponse,
  AdvisorFollowUpResponse,
  HydratedRecommendedPath,
} from '../types/advisor';

interface AIAdvisorPanelProps {
  totalPathsCount: number;
  situationText: string;
  onChangeSituationText: (val: string) => void;
  budgetCny: number;
  onChangeBudgetCny: (val: number) => void;
  monthlyFamilyBurn: number;
  onChangeMonthlyFamilyBurn: (val: number) => void;
  dailyHome: boolean;
  onToggleDailyHome: () => void;
  freeBoard: boolean;
  onToggleFreeBoard: () => void;
  protectWaist: boolean;
  onToggleProtectWaist: () => void;
  colorBlindSafe: boolean;
  onToggleColorBlindSafe: () => void;
  autoTriggerToken: number;
  selectedAdultCompareIds: string[];
  selectedStudentCompareIds: string[];
  onToggleAdultCompare: (pathId: string) => void;
  onToggleStudentCompare: (pathId: string) => void;
  onJumpToCard: (pathId: string) => void;
  onJumpToSimulator: (pathId: string) => void;
}

interface FollowUpTurn {
  question: string;
  answer: string;
  cited_paths: AdvisorFollowUpResponse['cited_paths'];
}

const ADVISOR_PRESETS: Array<{
  label: string;
  age: number;
  education: string;
  budget: number;
  burn: number;
  constraints: Partial<AdvisorConstraints>;
  text: string;
}> = [
  {
    label: '38岁被裁 · 护腰顾家求稳',
    age: 38,
    education: '大专（非理工）',
    budget: 12000,
    burn: 3000,
    constraints: { dailyHome: true, protectWaist: true },
    text: '今年38岁刚从教培/行政岗位被裁，手头备用金1.2万，家里每月房租和孩子开销要3000，必须每天回家接送孩子，腰椎不好不能搬重物，不想去送外卖开网约车内卷，想找30-60天内能上手、低成本有正规门槛的本地活路。',
  },
  {
    label: '26岁负债15万 · 强制攒钱翻身',
    age: 26,
    education: '大专',
    budget: 8000,
    burn: 0,
    constraints: { freeBoard: true },
    text: '26岁单身无牵挂，创业失败欠债15万，手头只剩8000块，能吃苦也能长期离家，想找包吃住、零房租、2-3年能强制攒下25万以上把债清掉的正规路子，怕被招转培黑中介再坑一次。',
  },
  {
    label: '15岁初三普高边缘 · 拒交25万民办',
    age: 15,
    education: '初中在读（初三）',
    budget: 15000,
    burn: 0,
    constraints: {},
    text: '孩子今年15岁初三，模考成绩在公办普高线边缘，家里普通工薪拿不出二十多万去读高价民办高中，也不想随便去野鸡中专混三年，想看国家公办体系里学费低、毕业能拿统招学历或直接进央国企/体制的升学路径。',
  },
  {
    label: '29岁县城返乡 · 农机/兽医/手艺',
    age: 29,
    education: '畜牧兽医大专',
    budget: 15000,
    burn: 1500,
    constraints: {},
    text: '29岁在外面打工存不下钱，老家在河南农业大县，之前读的畜牧兽医大专一直没用上，家里有院子开销低，想返乡干点有国家资质护城河或者农机补贴的实在行当。',
  },
];

const TIER_META: Record<
  HydratedRecommendedPath['fit_tier'],
  { label: string; badgeClass: string; borderClass: string }
> = {
  PRIMARY: {
    label: '首选主攻路径',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    borderClass: 'border-emerald-500/40',
  },
  ALTERNATIVE: {
    label: '稳妥备选路径',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    borderClass: 'border-blue-500/35',
  },
  BACKUP: {
    label: '保底过渡路径',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    borderClass: 'border-amber-500/35',
  },
};

export const AIAdvisorPanel: React.FC<AIAdvisorPanelProps> = ({
  totalPathsCount,
  situationText,
  onChangeSituationText,
  budgetCny,
  onChangeBudgetCny,
  monthlyFamilyBurn,
  onChangeMonthlyFamilyBurn,
  dailyHome,
  onToggleDailyHome,
  freeBoard,
  onToggleFreeBoard,
  protectWaist,
  onToggleProtectWaist,
  colorBlindSafe,
  onToggleColorBlindSafe,
  autoTriggerToken,
  selectedAdultCompareIds,
  selectedStudentCompareIds,
  onToggleAdultCompare,
  onToggleStudentCompare,
  onJumpToCard,
  onJumpToSimulator,
}) => {
  const [ageInput, setAgeInput] = useState<string>('');
  const [educationInput, setEducationInput] = useState<string>('');
  const [noNightShift, setNoNightShift] = useState<boolean>(false);

  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnoseStatusText, setDiagnoseStatusText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AdvisorDiagnoseResponse | null>(null);

  const [followUpInput, setFollowUpInput] = useState<string>('');
  const [isAskingFollowUp, setIsAskingFollowUp] = useState<boolean>(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpTurn[]>([]);

  const lastHandledTokenRef = useRef<number>(0);

  const runwayMonths =
    monthlyFamilyBurn > 0 ? (budgetCny / monthlyFamilyBurn).toFixed(1) : '∞';

  const commitDiagnosePayload = (data: Record<string, unknown>): boolean => {
    if (
      !data ||
      typeof data !== 'object' ||
      typeof data.situation_summary !== 'string' ||
      !Array.isArray(data.recommended_paths)
    ) {
      setErrorMsg('诊断接口返回数据结构不完整，请稍后重试。');
      return false;
    }
    setResult({
      model: typeof data.model === 'string' ? data.model : 'gemini-4-hydrogen',
      generated_at:
        typeof data.generated_at === 'string' ? data.generated_at : new Date().toISOString(),
      library_size:
        typeof data.library_size === 'number' ? data.library_size : totalPathsCount,
      situation_summary: data.situation_summary,
      cashflow_pressure_note:
        typeof data.cashflow_pressure_note === 'string' ? data.cashflow_pressure_note : '',
      recommended_paths: data.recommended_paths as HydratedRecommendedPath[],
      excluded_or_caution_paths: Array.isArray(data.excluded_or_caution_paths)
        ? (data.excluded_or_caution_paths as AdvisorDiagnoseResponse['excluded_or_caution_paths'])
        : [],
      anti_scam_reminder:
        typeof data.anti_scam_reminder === 'string' ? data.anti_scam_reminder : '',
      out_of_library_disclaimer:
        typeof data.out_of_library_disclaimer === 'string'
          ? data.out_of_library_disclaimer
          : '',
      suggested_followups: Array.isArray(data.suggested_followups)
        ? (data.suggested_followups as string[])
        : [],
    });
    setFollowUpHistory([]);
    return true;
  };

  const runDiagnosis = async (override?: {
    text?: string;
    age?: number | null;
    education?: string;
    budget?: number;
    burn?: number;
    constraints?: AdvisorConstraints;
  }) => {
    const textToSend = (override?.text ?? situationText).trim();
    if (textToSend.length < 6) {
      setErrorMsg('请先用至少 6 个字描述你的真实处境（或点击上方典型处境一键代入）。');
      return;
    }

    setErrorMsg(null);
    setFollowUpError(null);
    setIsDiagnosing(true);
    setDiagnoseStatusText(`正在连接核验服务并比对 ${totalPathsCount} 条路径…`);

    const parsedAge =
      override?.age !== undefined
        ? override.age
        : ageInput.trim()
          ? Number(ageInput.trim())
          : null;

    const payload = {
      situationText: textToSend,
      age:
        parsedAge !== null && Number.isFinite(parsedAge) && parsedAge >= 14 && parsedAge <= 75
          ? Math.round(parsedAge)
          : null,
      education: (override?.education ?? educationInput).trim(),
      budgetCny: override?.budget ?? budgetCny,
      monthlyFamilyBurn: override?.burn ?? monthlyFamilyBurn,
      constraints: override?.constraints ?? {
        dailyHome,
        freeBoard,
        protectWaist,
        colorBlindSafe,
        noNightShift,
      },
    };

    try {
      const resp = await fetch('/api/advisor/diagnose-stream', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json',
        },
        body: JSON.stringify(payload),
      });

      const contentType = resp.headers.get('content-type') || '';

      // Handle standard JSON response (validation errors or direct JSON)
      if (contentType.includes('application/json')) {
        const data = await resp.json().catch(() => null);
        if (!resp.ok) {
          setErrorMsg(
            typeof data?.error === 'string'
              ? data.error
              : `诊断请求失败（HTTP ${resp.status}），请稍后重试。`
          );
          return;
        }
        if (data && typeof data === 'object') {
          commitDiagnosePayload(data as Record<string, unknown>);
        } else {
          setErrorMsg('诊断服务返回空响应，请稍后重试。');
        }
        return;
      }

      // Handle SSE stream (keeps connection alive across proxies/VPNs)
      if (resp.ok && contentType.includes('text/event-stream') && resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let gotTerminalEvent = false;

        const processBlock = (rawBlock: string) => {
          const lines = rawBlock.split(/\r?\n/);
          let eventName = 'message';
          const dataLines: string[] = [];
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trim());
            }
          }
          if (dataLines.length === 0) return;
          const payloadStr = dataLines.join('\n');
          let parsedData: Record<string, unknown> | null = null;
          try {
            parsedData = JSON.parse(payloadStr) as Record<string, unknown>;
          } catch {
            return;
          }
          if (!parsedData) return;

          if (eventName === 'status' && typeof parsedData.message === 'string') {
            setDiagnoseStatusText(parsedData.message);
          } else if (eventName === 'result') {
            gotTerminalEvent = true;
            commitDiagnosePayload(parsedData);
          } else if (eventName === 'error') {
            gotTerminalEvent = true;
            setErrorMsg(
              typeof parsedData.error === 'string'
                ? parsedData.error
                : '诊断执行失败，请稍后重试。'
            );
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (value) {
            buffer += decoder.decode(value, { stream: !done });
            const blocks = buffer.split(/\r?\n\r?\n/);
            buffer = blocks.pop() ?? '';
            for (const block of blocks) {
              if (block.trim()) processBlock(block);
            }
          }
          if (done) {
            if (buffer.trim()) processBlock(buffer);
            break;
          }
        }

        if (!gotTerminalEvent) {
          setErrorMsg('诊断连接在返回结果前中断，请点击重试。');
        }
        return;
      }

      setErrorMsg(
        resp.ok
          ? '诊断服务刚完成重启或返回了非预期格式，请刷新页面后重试。'
          : `诊断请求失败（HTTP ${resp.status}），请稍后重试。`
      );
    } catch (err) {
      const detail = err instanceof Error && err.message ? `（${err.message}）` : '';
      setErrorMsg(`无法连接到诊断服务，请检查网络或刷新页面后重试${detail}`);
    } finally {
      setIsDiagnosing(false);
      setDiagnoseStatusText('');
    }
  };

  useEffect(() => {
    if (autoTriggerToken > 0 && autoTriggerToken !== lastHandledTokenRef.current) {
      lastHandledTokenRef.current = autoTriggerToken;
      if (situationText.trim().length >= 6) {
        void runDiagnosis();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTriggerToken]);

  const handleApplyPreset = (preset: (typeof ADVISOR_PRESETS)[number]) => {
    onChangeSituationText(preset.text);
    setAgeInput(String(preset.age));
    setEducationInput(preset.education);
    onChangeBudgetCny(preset.budget);
    onChangeMonthlyFamilyBurn(preset.burn);
    if (Boolean(preset.constraints.dailyHome) !== dailyHome) onToggleDailyHome();
    if (Boolean(preset.constraints.freeBoard) !== freeBoard) onToggleFreeBoard();
    if (Boolean(preset.constraints.protectWaist) !== protectWaist) onToggleProtectWaist();
    if (Boolean(preset.constraints.colorBlindSafe) !== colorBlindSafe) onToggleColorBlindSafe();
    setNoNightShift(Boolean(preset.constraints.noNightShift));
    setErrorMsg(null);
  };

  const handleSendFollowUp = async (questionOverride?: string) => {
    const q = (questionOverride ?? followUpInput).trim();
    if (!q || isAskingFollowUp) return;

    setFollowUpError(null);
    setIsAskingFollowUp(true);
    if (!questionOverride) {
      setFollowUpInput('');
    }

    const flatHistory = followUpHistory.flatMap((t) => [
      { role: 'user' as const, text: t.question },
      { role: 'assistant' as const, text: t.answer },
    ]);

    try {
      const resp = await fetch('/api/advisor/followup', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          situationText,
          budgetCny,
          monthlyFamilyBurn,
          recommendedPathIds: result?.recommended_paths.map((r) => r.path_id) ?? [],
          history: flatHistory,
        }),
      });
      const contentType = resp.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setFollowUpError(
          resp.ok
            ? '追问服务返回了非预期格式，请刷新页面后重试。'
            : `追问失败（HTTP ${resp.status}），请稍后重试。`
        );
        return;
      }
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setFollowUpError(
          typeof data?.error === 'string'
            ? data.error
            : `追问失败（HTTP ${resp.status}），请稍后重试。`
        );
        return;
      }
      if (!data || typeof data.answer !== 'string') {
        setFollowUpError('追问返回内容不完整，请重试。');
        return;
      }
      const typed = data as AdvisorFollowUpResponse;
      setFollowUpHistory((prev) => [
        ...prev,
        {
          question: q,
          answer: typed.answer,
          cited_paths: Array.isArray(typed.cited_paths) ? typed.cited_paths : [],
        },
      ]);
    } catch (err) {
      const detail = err instanceof Error && err.message ? `（${err.message}）` : '';
      setFollowUpError(`网络连接异常，追问未能送达，请重试${detail}`);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部受控边界宣言条 */}
      <section className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>受控 AI 个性化处境诊断顾问 · 严格锁定全库 {totalPathsCount} 条 L1-L5 已核验路径</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            本顾问不是泛泛而谈的聊天机器人：所有推荐的 <span className="font-mono text-emerald-300">PATH_XXX</span> 编号、官方裸价、门户网址与复核状态均由服务端从已核验路径总库<strong className="text-white">强挂载校对</strong>，自动过滤库外幻觉，并强制结合你的资金断粮线、年龄/专业/体检红线先泼冷水、再给今天就能执行的第一步。
          </p>
        </div>
        <div className="text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 space-y-1 shrink-0">
          <div>防幻觉约束：<span className="text-emerald-400">100% 库内 ID 强校验</span></div>
          <div>官方裸价与网址：<span className="text-emerald-400">服务端台账直出</span></div>
          <div>超期路径防护：<span className="text-amber-300">自动降级并告警</span></div>
        </div>
      </section>

      {/* 处境输入工作台 */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>第一步：描述你的真实处境与底线约束</span>
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500">典型处境一键代入：</span>
            {ADVISOR_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-300 rounded-lg transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 处境自述文本框 */}
        <div>
          <textarea
            rows={4}
            value={situationText}
            onChange={(e) => onChangeSituationText(e.target.value)}
            placeholder="请尽量写清你的真实处境：例如年龄、学历/专业、目前卡在什么瓶颈、能否长期离家、有没有身体限制（如腰椎/色弱）、是否负债或需要兼顾家人……"
            className="w-full bg-slate-950 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition resize-y"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>与主沙盘「处境补充自述框」双向同步，无需重复填写</span>
            <span className="font-mono tabular-nums">{situationText.length} / 1200</span>
          </div>
        </div>

        {/* 结构化硬参数行：年龄 + 学历专业 + 手头总资金 + 家庭月耗 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <label className="block text-[11px] text-slate-400 mb-1">年龄（选填，严核准入上限）</label>
            <input
              type="number"
              min={14}
              max={75}
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              placeholder="例如 36"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <label className="block text-[11px] text-slate-400 mb-1">学历与专业（选填，如本科/大专）</label>
            <input
              type="text"
              maxLength={60}
              value={educationInput}
              onChange={(e) => setEducationInput(e.target.value)}
              placeholder="例如 普通二本文科 / 初三"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <label className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>手头可用总资金</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                ¥{budgetCny.toLocaleString()}
              </span>
            </label>
            <input
              type="range"
              min={2000}
              max={50000}
              step={1000}
              value={budgetCny}
              onChange={(e) => onChangeBudgetCny(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer mt-1"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <label className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>家庭月刚性消耗</span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                ¥{monthlyFamilyBurn.toLocaleString()}/月
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={8000}
              step={500}
              value={monthlyFamilyBurn}
              onChange={(e) => onChangeMonthlyFamilyBurn(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* 刚性红线勾选 + 资金硬撑月数提示 + 发起按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">硬性底线：</span>
            {[
              { active: dailyHome, toggle: onToggleDailyHome, label: '必须每天回家顾家' },
              { active: freeBoard, toggle: onToggleFreeBoard, label: '优先包吃住/免学费' },
              { active: protectWaist, toggle: onToggleProtectWaist, label: '护腰椎/零重体力' },
              { active: colorBlindSafe, toggle: onToggleColorBlindSafe, label: '色盲色弱可报' },
              { active: noNightShift, toggle: () => setNoNightShift((v) => !v), label: '拒绝长期夜班' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.toggle}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  item.active
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.active ? `✓ ${item.label}` : item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              纯生存缓冲：<strong className="text-amber-300">{runwayMonths} 个月</strong>
            </span>
            <button
              type="button"
              disabled={isDiagnosing}
              onClick={() => void runDiagnosis()}
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap"
            >
              {isDiagnosing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{diagnoseStatusText || `正在逐条核验 ${totalPathsCount} 条路径与断粮账…`}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>生成受控处境诊断方案</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}
      </section>

      {/* 诊断结果区 */}
      {result && (
        <div className="space-y-6">
          {/* 处境提炼 + 资金断粮压力研判 */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>处境核心诊断提炼</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{result.situation_summary}</p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">
                核验基准库：{result.library_size ?? totalPathsCount} 条已核验路径 · 生成时间：
                {typeof result.generated_at === 'string' && result.generated_at.length >= 16
                  ? `${result.generated_at.slice(0, 16).replace('T', ' ')} UTC`
                  : '刚刚'}
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/35 rounded-2xl p-5 space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>脱产资金与断粮压力研判</span>
              </div>
              <p className="text-sm text-amber-100/90 leading-relaxed">
                {result.cashflow_pressure_note}
              </p>
            </div>
          </section>

          {/* 推荐路径卡片列表 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                库内精准筛选推荐（{result.recommended_paths.length} 条 · 官方数据由服务端强挂载）
              </h3>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setFollowUpHistory([]);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>清空本次结果</span>
              </button>
            </div>

            {result.recommended_paths.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-sm text-slate-300 leading-relaxed">
                当前约束条件下，已核验的 {result.library_size} 条路径库中暂未筛选出完全不触碰硬红线的路径。请尝试适度放宽某一项单选条件，或查阅下方“库外诚实说明”。
              </div>
            ) : (
              <div className="space-y-4">
                {(result.recommended_paths ?? []).map((rec) => {
                  const tier = TIER_META[rec.fit_tier] ?? TIER_META.ALTERNATIVE;
                  const c = rec.canonical;
                  if (!c) return null;
                  const isStudent = c.pk_arena === 'STUDENT_PK';
                  const inCompare = isStudent
                    ? selectedStudentCompareIds.includes(rec.path_id)
                    : selectedAdultCompareIds.includes(rec.path_id);

                  return (
                    <article
                      key={rec.path_id}
                      className={`bg-slate-900 border ${tier.borderClass} rounded-2xl overflow-hidden`}
                    >
                      {c.degraded && (
                        <div className="bg-amber-500/15 border-b border-amber-500/35 px-5 py-2 text-xs text-amber-200 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            <strong>超期自动降级提醒：</strong>
                            {c.degrade_reason}
                          </span>
                        </div>
                      )}

                      <div className="p-5 space-y-4">
                        {/* 标题行 */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${tier.badgeClass}`}
                              >
                                {tier.label}
                              </span>
                              <span className="font-mono text-xs font-bold text-emerald-400">
                                {rec.path_id}
                              </span>
                              <span className="text-xs font-mono text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                                匹配度 {rec.fit_score}/99
                              </span>
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded border ${
                                  c.is_active_window
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-400'
                                }`}
                              >
                                窗口：{c.window_label}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-white">{c.title}</h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onJumpToCard(rec.path_id)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                            >
                              <span>看完整双轨卡片</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                isStudent
                                  ? onToggleStudentCompare(rec.path_id)
                                  : onToggleAdultCompare(rec.path_id)
                              }
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1 ${
                                inCompare
                                  ? isStudent
                                    ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                                    : 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                              }`}
                            >
                              {isStudent ? (
                                <GraduationCap className="w-3.5 h-3.5" />
                              ) : (
                                <Scale className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {inCompare
                                  ? isStudent
                                    ? '✓ 已入升学PK'
                                    : '✓ 已入成人PK'
                                  : isStudent
                                    ? '+ 加入升学PK'
                                    : '+ 加入成人PK'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onJumpToSimulator(rec.path_id)}
                              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                              <span>算现金流</span>
                            </button>
                          </div>
                        </div>

                        {/* 服务端直出硬数据条 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono tabular-nums">
                          <div>
                            <div className="text-[11px] text-slate-500 font-sans">官方零加价裸价</div>
                            <div className="text-emerald-400 font-bold mt-0.5">
                              ¥{c.official_cost_min.toLocaleString()} - ¥
                              {c.official_cost_max.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-500 font-sans">
                              含家庭月耗总需（{c.prep_months}个月）
                            </div>
                            <div
                              className={`font-bold mt-0.5 ${
                                c.cash_gap_cny > 0 ? 'text-rose-400' : 'text-emerald-300'
                              }`}
                            >
                              ¥{c.total_prep_and_family_burn.toLocaleString()}
                              {c.cash_gap_cny > 0
                                ? ` (缺 ¥${c.cash_gap_cny.toLocaleString()})`
                                : ' (预算内)'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-500 font-sans">熟手/转正月净入</div>
                            <div className="text-amber-400 font-bold mt-0.5">
                              ¥{c.regular_monthly_net_range[0].toLocaleString()} - ¥
                              {c.regular_monthly_net_range[1].toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-500 font-sans">
                              {c.portal_tier === 'COMMERCIAL_FIRST_PARTY'
                                ? '商业平台一手入口'
                                : '官方唯一核验门户'}
                            </div>
                            <a
                              href={c.official_portal_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline font-sans inline-flex items-center gap-1 mt-0.5 truncate max-w-full"
                              title={c.official_portal_name}
                            >
                              <span className="truncate">{c.official_portal_name}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        </div>

                        {/* AI 四维结构化剖析 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5">
                            <div className="font-bold text-emerald-400 mb-1">
                              1. 为什么打破你的信息差
                            </div>
                            <p className="text-slate-200">{rec.why_it_fits}</p>
                          </div>

                          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5">
                            <div className="font-bold text-blue-400 mb-1">
                              2. 成本与断粮底线实测
                            </div>
                            <p className="text-slate-200">{rec.hard_cost_and_runway_check}</p>
                          </div>

                          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5">
                            <div className="font-bold text-rose-400 mb-1">
                              3. 必须提前接受的劝退红线（先泼冷水）
                            </div>
                            <p className="text-rose-100/90">{rec.top_deal_breaker_warning}</p>
                          </div>

                          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5">
                            <div className="font-bold text-emerald-300 mb-1">
                              4. 今天就能零中介费执行的第一步
                            </div>
                            <p className="text-emerald-100/90">{rec.first_step_today}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* 排除与慎入清单 + 防诈铁律 + 库外免责 */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-rose-400" />
                <span>已为你排除或慎入的库内路径（防踩坑）</span>
              </div>
              {result.excluded_or_caution_paths.length > 0 ? (
                <ul className="space-y-2.5 text-xs">
                  {result.excluded_or_caution_paths.map((ex) => (
                    <li
                      key={ex.path_id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-200">
                          <span className="font-mono text-rose-400 mr-1.5">{ex.path_id}</span>
                          {ex.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => onJumpToCard(ex.path_id)}
                          className="text-[11px] text-slate-400 hover:text-white shrink-0"
                        >
                          核对原卡
                        </button>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{ex.reason}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">暂无需要特别提示排除的热门路径。</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-rose-950/20 border border-rose-500/35 rounded-2xl p-5 space-y-2">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>针对性黑中介防诈铁律</span>
                </div>
                <p className="text-xs text-rose-100/90 leading-relaxed">
                  {result.anti_scam_reminder}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="text-xs font-bold text-slate-400">受控范围与诚实边界声明</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {result.out_of_library_disclaimer}
                </p>
              </div>
            </div>
          </section>

          {/* 受控多轮追问区 */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white">
                受控追问区（基于本次诊断与 {totalPathsCount} 条已核验路径继续深挖）
              </h3>
              <span className="text-[11px] text-slate-500">
                回答中提及的路径编号会自动挂载可点击的原卡入口
              </span>
            </div>

            {result.suggested_followups.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.suggested_followups.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={isAskingFollowUp}
                    onClick={() => void handleSendFollowUp(q)}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 rounded-lg transition text-left"
                  >
                    + {q}
                  </button>
                ))}
              </div>
            )}

            {followUpHistory.length > 0 && (
              <div className="space-y-3 pt-1">
                {followUpHistory.map((turn, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs"
                  >
                    <div className="font-semibold text-emerald-400">问：{turn.question}</div>
                    <div className="text-slate-200 leading-relaxed whitespace-pre-line">
                      {turn.answer}
                    </div>
                    {turn.cited_paths.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                        <span className="text-[11px] text-slate-500">引用已核验路径：</span>
                        {turn.cited_paths.map((cp) => (
                          <button
                            key={cp.path_id}
                            type="button"
                            onClick={() => onJumpToCard(cp.path_id)}
                            className="px-2 py-0.5 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/35 text-emerald-300 rounded font-mono text-[11px] transition"
                          >
                            {cp.path_id} · {cp.short_name} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendFollowUp();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                maxLength={500}
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="例如：如果我先用A路径过渡攒半年钱，再转B路径，现金流怎么衔接？"
                className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={isAskingFollowUp || followUpInput.trim().length < 2}
                className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                {isAskingFollowUp ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>追问</span>
              </button>
            </form>

            {followUpError && (
              <div className="text-xs text-rose-300 bg-rose-950/30 border border-rose-500/30 rounded-lg px-3 py-2">
                {followUpError}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
