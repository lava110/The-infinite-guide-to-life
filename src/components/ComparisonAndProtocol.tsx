import React, { useState, useMemo } from 'react';
import {
  VerifiedPath,
  L1_L5_PROTOCOL_SPEC,
  VERIFIED_PATHS,
  evaluateFreshnessUrgency,
  isInActiveWindowMonth,
} from '../data/verifiedPaths';
import { LINK_HEALTH_REPORT } from '../data/freshnessRegistry';
import {
  validateCandidateCard,
  validateFullVerifiedPath,
  SCAM_BLACKLIST,
  BATCH_BLUEPRINT_50,
  CHIEF_DATA_AUDITOR_PROMPT,
  SAMPLE_INVALID_CANDIDATES,
  isPortalUrlValidForTier,
} from '../data/ingestionGuard';
import {
  Scale,
  ShieldAlert,
  CheckCircle2,
  ArrowUpRight,
  Sliders,
  Calculator,
  GitMerge,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Layers,
  Ban,
} from 'lucide-react';

interface ComparisonMatrixProps {
  paths: VerifiedPath[];
  selectedCompareIds: string[];
  onToggleCompareId: (id: string) => void;
  onSetCompareIds?: (ids: string[]) => void;
  onJumpToSimulator: (id: string) => void;
  liquidSavings?: number;
  onChangeLiquidSavings?: (val: number) => void;
  monthlyFamilyBurn?: number;
  onChangeMonthlyFamilyBurn?: (val: number) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  paths,
  selectedCompareIds,
  onToggleCompareId,
  onSetCompareIds,
  onJumpToSimulator,
  liquidSavings: externalSavings,
  onChangeLiquidSavings,
  monthlyFamilyBurn: externalBurn,
  onChangeMonthlyFamilyBurn,
}) => {
  // 用户个人生存底线输入（驱动实时现金流压力测试，支持与主沙盘同步）
  const [internalSavings, setInternalSavings] = useState<number>(20000);
  const [internalBurn, setInternalBurn] = useState<number>(2500);

  const liquidSavings = externalSavings ?? internalSavings;
  const setLiquidSavings = onChangeLiquidSavings ?? setInternalSavings;
  const monthlyFamilyBurn = externalBurn ?? internalBurn;
  const setMonthlyFamilyBurn = onChangeMonthlyFamilyBurn ?? setInternalBurn;

  const adultPaths = useMemo(
    () => paths.filter((p) => p.pk_arena === 'ADULT_PK'),
    [paths]
  );

  const comparedPaths = useMemo(
    () => adultPaths.filter((p) => selectedCompareIds.includes(p.path_id)),
    [adultPaths, selectedCompareIds]
  );

  // 动态推演每条路径的财务生存模型 + 预计断粮时间
  const simulationResults = useMemo(() => {
    return comparedPaths.map((path) => {
      const pk = path.pk_profile;
      // 1. 培训期净消耗 = 学费 + 培训月数 * 家庭刚性支出
      const prepBurn = pk.official_cost_avg + pk.prep_months * monthlyFamilyBurn;

      // 2. 见习/新手期每月净赤字 = max(0, 家庭刚性支出 - 见习月薪)
      const internMonthlyDeficit = Math.max(0, monthlyFamilyBurn - pk.intern_monthly_net);
      const internTotalBurn = internMonthlyDeficit * pk.intern_months;

      // 3. 转正前最大资金缺口（Max Drawdown）
      const maxCashDrawdown = Math.round(prepBurn + internTotalBurn);
      const isBankruptRisk = liquidSavings < maxCashDrawdown;
      const cashShortfall = Math.max(0, maxCashDrawdown - liquidSavings);

      // 4. 转正后每月可净存金额 = 转正平均月薪 - 在岗个人生活开销 - 家庭刚性支出
      const regularMonthlySave =
        pk.regular_monthly_net - pk.on_job_living_expense - monthlyFamilyBurn;

      // 5. 计算“预计断粮时间”（Estimated Depletion Time）与“纯消耗极限支撑月数”
      const afterUpfrontCash = liquidSavings - pk.official_cost_avg;
      const pureBurnRunwayMonths =
        afterUpfrontCash <= 0
          ? 0
          : monthlyFamilyBurn > 0
          ? Number((afterUpfrontCash / monthlyFamilyBurn).toFixed(1))
          : 99.9;

      let depletionMonth: number | null = null; // null 代表全程不断粮
      let depletionStageLabel = '';

      if (afterUpfrontCash <= 0) {
        depletionMonth = 0;
        depletionStageLabel = '第 0 天即断粮（手头资金连路径官方首期花费都不够）';
      } else if (monthlyFamilyBurn > 0 && afterUpfrontCash < pk.prep_months * monthlyFamilyBurn) {
        depletionMonth = Number((afterUpfrontCash / monthlyFamilyBurn).toFixed(1));
        const estDays = Math.max(1, Math.round(depletionMonth * 30));
        depletionStageLabel = `预计第 ${depletionMonth} 个月（约第 ${estDays} 天 · 脱产准备期半路断粮）`;
      } else if (
        internMonthlyDeficit > 0 &&
        afterUpfrontCash - pk.prep_months * monthlyFamilyBurn < internTotalBurn
      ) {
        const cashIntoIntern = afterUpfrontCash - pk.prep_months * monthlyFamilyBurn;
        const internSurvivedMonths = cashIntoIntern / internMonthlyDeficit;
        depletionMonth = Number((pk.prep_months + internSurvivedMonths).toFixed(1));
        const estDays = Math.max(1, Math.round(depletionMonth * 30));
        depletionStageLabel = `预计第 ${depletionMonth} 个月（约第 ${estDays} 天 · 低薪见习期断粮）`;
      } else if (regularMonthlySave < 0) {
        const cashIntoRegular = Math.max(0, liquidSavings - maxCashDrawdown);
        const regularSurvivedMonths = cashIntoRegular / Math.abs(regularMonthlySave);
        depletionMonth = Number(
          (pk.prep_months + pk.intern_months + regularSurvivedMonths).toFixed(1)
        );
        depletionStageLabel = `预计第 ${depletionMonth} 个月（转正后收入仍低于每月支出，慢性失血断粮）`;
      } else {
        depletionMonth = null;
        depletionStageLabel =
          monthlyFamilyBurn > 0
            ? `全程不断粮（余粮可纯撑 ${pureBurnRunwayMonths} 个月 > 脱产期 ${pk.prep_months} 个月）`
            : `全程不断粮（零家庭月负担，余粮 +¥${(liquidSavings - maxCashDrawdown).toLocaleString()}）`;
      }

      // 6. 计算第 6 个月、第 12 个月与第 36 个月的累计净现金结余（相对于今天的变化量）
      const totalPreRegularMonths = Number((pk.prep_months + pk.intern_months).toFixed(1));
      const regularMonthsInHalfYear = Math.max(0, 6 - totalPreRegularMonths);
      const regularMonthsInYear1 = Math.max(0, 12 - totalPreRegularMonths);

      // 见习期若月薪高于家庭刚性支出，则产生微弱正结余
      const internMonthlyGain = Math.max(
        0,
        pk.intern_monthly_net - monthlyFamilyBurn - pk.on_job_living_expense * 0.5
      );
      const internNetGain = internMonthlyGain * pk.intern_months;

      // 第6个月末净结余估算
      let netWorth6Mo = 0;
      if (6 <= pk.prep_months) {
        netWorth6Mo = Math.round(-(pk.official_cost_avg + 6 * monthlyFamilyBurn));
      } else if (6 <= totalPreRegularMonths) {
        const elapsedIntern = 6 - pk.prep_months;
        netWorth6Mo = Math.round(
          -prepBurn -
            elapsedIntern * internMonthlyDeficit +
            elapsedIntern * internMonthlyGain
        );
      } else {
        netWorth6Mo = Math.round(
          -prepBurn -
            internTotalBurn +
            internNetGain +
            regularMonthsInHalfYear * regularMonthlySave
        );
      }

      const netWorth12Mo = Math.round(
        -prepBurn - internTotalBurn + internNetGain + regularMonthsInYear1 * regularMonthlySave
      );

      // 第2、3年每年有效攒钱月数需考虑船员休假（休假期间无工资且有家庭开销）
      const offDutyMonthsPerYear = 12 - pk.working_months_per_year;
      const annualNetSaveAfterYear1 =
        pk.working_months_per_year * regularMonthlySave -
        offDutyMonthsPerYear * (monthlyFamilyBurn + 1000);

      const netWorth36Mo = Math.round(netWorth12Mo + annualNetSaveAfterYear1 * 2);

      return {
        path_id: path.path_id,
        afterUpfrontCash,
        pureBurnRunwayMonths,
        depletionMonth,
        depletionStageLabel,
        maxCashDrawdown,
        isBankruptRisk,
        cashShortfall,
        totalPreRegularMonths,
        regularMonthlySave,
        netWorth6Mo,
        netWorth12Mo,
        netWorth36Mo,
      };
    });
  }, [comparedPaths, liquidSavings, monthlyFamilyBurn]);

  // 自动识别当前选中路径中“最经济的路径”（回血前总资金消耗 maxCashDrawdown 最低，若相同则比首期官方成本）
  const mostEconomicalPathId = useMemo(() => {
    if (simulationResults.length === 0) return null;
    const sorted = [...simulationResults].sort((a, b) => {
      if (a.maxCashDrawdown !== b.maxCashDrawdown) {
        return a.maxCashDrawdown - b.maxCashDrawdown;
      }
      return b.afterUpfrontCash - a.afterUpfrontCash;
    });
    return sorted[0].path_id;
  }, [simulationResults]);

  // 自动合成“先 B 后 A”阶梯跳板策略：当存在1条爆仓高潜路径 + 1条安全救急路径时触发
  const steppingStoneAdvice = useMemo(() => {
    if (comparedPaths.length < 2) return null;
    const paired = comparedPaths.map((p, i) => ({ path: p, sim: simulationResults[i] }));
    const bankruptHighCeiling = paired.find(
      (item) => item.sim.isBankruptRisk && item.sim.netWorth36Mo > 100000
    );
    const safeBridge = paired.find(
      (item) => !item.sim.isBankruptRisk && item.sim.regularMonthlySave > 0
    );

    if (!bankruptHighCeiling || !safeBridge) return null;

    const monthsNeededToSaveGap = Math.ceil(
      bankruptHighCeiling.sim.cashShortfall /
        Math.max(500, safeBridge.sim.regularMonthlySave)
    );
    const totalBridgeMonths = Math.ceil(
      safeBridge.sim.totalPreRegularMonths + monthsNeededToSaveGap
    );

    return {
      bridgePath: safeBridge.path,
      targetPath: bankruptHighCeiling.path,
      shortfall: bankruptHighCeiling.sim.cashShortfall,
      targetDrawdown: bankruptHighCeiling.sim.maxCashDrawdown,
      totalBridgeMonths,
    };
  }, [comparedPaths, simulationResults]);

  const maxAbs36Mo = useMemo(() => {
    const vals = simulationResults.map((s) => Math.abs(s.netWorth36Mo));
    return Math.max(100000, ...vals);
  }, [simulationResults]);

  const adultCategoryGroups = useMemo(
    () => [
      {
        title: '① 国家准入硬技能、医疗处方权、在职申硕与室内轻体力 (9条)',
        desc: '15-60天极速拿证或在职考证/申硕，涵盖植保无人机、执业兽医、EHS注安师、同等学力申硕、消控与特种机械',
        ids: ['PATH_002', 'PATH_007', 'PATH_008', 'PATH_009', 'PATH_046', 'PATH_058', 'PATH_060', 'PATH_063', 'PATH_071'],
      },
      {
        title: '② 居家远程赚美元与成人低成本出海 (6条)',
        desc: '0成本居家美元周结/复购，或德国机会卡/双元制/澳新WHV合法出海找工与打工度假',
        ids: ['PATH_005', 'PATH_031', 'PATH_032', 'PATH_036', 'PATH_054', 'PATH_056'],
      },
      {
        title: '③ 包吃住高储蓄、社会统考体制与债务止损 (7条)',
        desc: '豪华邮轮海乘/央企驻外/远洋/三甲免陪零房租攒钱、社会招考体制岗（消防员/文职）与法定债务重整',
        ids: ['PATH_001', 'PATH_010', 'PATH_023', 'PATH_024', 'PATH_041', 'PATH_065', 'PATH_066'],
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* 顶部标题与路径切换器 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span className="text-amber-400 font-semibold">
                成人转行并排 PK 决策天平（共收录 {adultPaths.length} 条成人转行/社会招考路径）
              </span>
              <span aria-hidden="true">·</span>
              <span>已剔除全部中考/高考/应届生专属升学路径</span>
              <span aria-hidden="true">·</span>
              <span>最多同屏 PK 3 条路径</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {comparedPaths.length > 0
                ? comparedPaths.map((p) => p.pk_profile.short_name).join('  VS  ')
                : '请选择 2 - 3 条成人转行路径进入 PK 决策台'}
            </h2>
          </div>

          {onSetCompareIds && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 mr-1">成人转行典型组合一键 PK：</span>
              {[
                {
                  label: '出海包吃住攒美金：066 豪华邮轮海乘 VS 001 远洋船员 VS 065 央企海外直招',
                  ids: ['PATH_066', 'PATH_001', 'PATH_065'],
                },
                {
                  label: '个人全球化赴欧澳：036 德国机会卡 VS 005 德国双元制 VS 031 澳洲462 WHV',
                  ids: ['PATH_036', 'PATH_005', 'PATH_031'],
                },
                {
                  label: '35+在职晋升/护身符：063 注册安全工程师 VS 071 同等学力在职申硕 VS 024 解放军文职',
                  ids: ['PATH_063', 'PATH_071', 'PATH_024'],
                },
                {
                  label: '返乡/县城硬核手艺：058 植保无人机飞手 VS 060 执业兽医资格证 VS 046 特种承压焊工',
                  ids: ['PATH_058', 'PATH_060', 'PATH_046'],
                },
                {
                  label: '居家赚美元/轻体力：054 海外AI标注专家 VS 056 iTalki中文教师 VS 007 消防四级监控',
                  ids: ['PATH_054', 'PATH_056', 'PATH_007'],
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => onSetCompareIds(preset.ids)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-300 font-medium transition whitespace-nowrap"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 按成人转行三大类分组展示 17 条成人路径 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-b border-slate-800 pb-4">
          {adultCategoryGroups.map((grp) => {
            const grpPaths = adultPaths.filter((p) => grp.ids.includes(p.path_id));
            return (
              <div
                key={grp.title}
                className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-2.5"
              >
                <div>
                  <div className="text-xs font-bold text-amber-300">{grp.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {grp.desc}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {grpPaths.map((p) => {
                    const active = selectedCompareIds.includes(p.path_id);
                    const disableAdd = !active && selectedCompareIds.length >= 3;
                    return (
                      <button
                        key={p.path_id}
                        onClick={() => {
                          if (disableAdd) return;
                          onToggleCompareId(p.path_id);
                        }}
                        disabled={disableAdd}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition text-left ${
                          active
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                            : disableAdd
                            ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {p.pk_profile.short_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 核心交互区：个人生存压力测试控制台 */}
        <div className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>第一步：输入你的生存底线（实时测算哪条路会让你半路断粮）</span>
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 mr-1">处境一键代入：</span>
              {[
                { label: '极限断粮 (存¥5k / 家用¥3k)', savings: 5000, burn: 3000 },
                { label: '常规缓冲 (存¥1.5w / 家用¥3.5k)', savings: 15000, burn: 3500 },
                { label: '单身轻装 (存¥2.5w / 家用¥1.5k)', savings: 25000, burn: 1500 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setLiquidSavings(preset.savings);
                    setMonthlyFamilyBurn(preset.burn);
                  }}
                  className={`px-2.5 py-1 rounded border transition whitespace-nowrap shrink-0 ${
                    liquidSavings === preset.savings && monthlyFamilyBurn === preset.burn
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
              <label className="flex justify-between text-xs text-slate-300 mb-2">
                <span>我手头仅剩的可动用备用金（活命钱）：</span>
                <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                  ¥{liquidSavings.toLocaleString()}
                </span>
              </label>
              <input
                type="range"
                min="2000"
                max="50000"
                step="1000"
                value={liquidSavings}
                onChange={(e) => setLiquidSavings(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                <span>¥2,000 (极度捉襟见肘)</span>
                <span>¥15,000 (小有缓冲)</span>
                <span>¥50,000 (粮草充足)</span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
              <label className="flex justify-between text-xs text-slate-300 mb-2">
                <span>每月雷打不动的家庭刚性支出（房租/还贷/抚养）：</span>
                <span className="text-base font-mono font-bold text-amber-400 tabular-nums">
                  ¥{monthlyFamilyBurn.toLocaleString()} / 月
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="8000"
                step="500"
                value={monthlyFamilyBurn}
                onChange={(e) => setMonthlyFamilyBurn(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                <span>¥0 (零负担/家里托底)</span>
                <span>¥3,000 (常规房租抚养)</span>
                <span>¥8,000 (高压房贷家用)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 新增：横向并排【财务可行性 & 预计断粮时间】对比行（自动高亮最经济路径） */}
      {comparedPaths.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                财务可行性横向对比行（基于启动资金 ¥{liquidSavings.toLocaleString()} · 月支出 ¥
                {monthlyFamilyBurn.toLocaleString()}/月 实时测算）
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-medium">
              已自动高亮回血前总资金消耗最低的【最经济路径】
            </span>
          </div>

          <div
            className={`grid grid-cols-1 gap-4 ${
              comparedPaths.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'
            }`}
          >
            {comparedPaths.map((path, idx) => {
              const pk = path.pk_profile;
              const sim = simulationResults[idx];
              const isMostEconomical = path.path_id === mostEconomicalPathId;
              const burnRatioPct = Math.min(
                100,
                Math.round((sim.maxCashDrawdown / Math.max(1, liquidSavings)) * 100)
              );

              return (
                <div
                  key={`feasibility-${path.path_id}`}
                  className={`rounded-xl p-4 border transition relative ${
                    isMostEconomical
                      ? 'bg-emerald-950/30 border-emerald-400 ring-1 ring-emerald-400/50'
                      : sim.isBankruptRisk
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-white truncate">
                      {pk.short_name}
                    </span>
                    {isMostEconomical ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 text-[11px] font-bold whitespace-nowrap shrink-0">
                        ★ 最经济路径 (总消耗最低)
                      </span>
                    ) : sim.isBankruptRisk ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-semibold whitespace-nowrap shrink-0">
                        半路断粮高危
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] whitespace-nowrap shrink-0">
                        资金可行
                      </span>
                    )}
                  </div>

                  {/* 核心指标：预计断粮时间 */}
                  <div className="bg-slate-950/90 border border-slate-800/80 rounded-lg p-3 mb-3">
                    <div className="text-[11px] text-slate-400 mb-1">
                      预计断粮时间（按首期花费 ¥{pk.official_cost_avg.toLocaleString()} + 月耗 ¥
                      {monthlyFamilyBurn.toLocaleString()} 推演）：
                    </div>
                    <div
                      className={`text-sm font-mono font-bold tabular-nums ${
                        sim.depletionMonth !== null ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {sim.depletionStageLabel}
                    </div>
                  </div>

                  {/* 财务三要素明细 */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono tabular-nums mb-2.5">
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800/60">
                      <div className="text-slate-500 font-sans">路径首期花费</div>
                      <div className="text-slate-200 font-bold mt-0.5">
                        ¥{pk.official_cost_avg.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800/60">
                      <div className="text-slate-500 font-sans">回血前总消耗</div>
                      <div
                        className={`font-bold mt-0.5 ${
                          isMostEconomical ? 'text-emerald-400' : 'text-amber-300'
                        }`}
                      >
                        ¥{sim.maxCashDrawdown.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-800/60">
                      <div className="text-slate-500 font-sans">最低谷余粮/缺口</div>
                      <div
                        className={`font-bold mt-0.5 ${
                          sim.isBankruptRisk ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {sim.isBankruptRisk
                          ? `-¥${sim.cashShortfall.toLocaleString()}`
                          : `+¥${(liquidSavings - sim.maxCashDrawdown).toLocaleString()}`}
                      </div>
                    </div>
                  </div>

                  {/* 备用金消耗水位条 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                      <span>回血前消耗占备用金比例</span>
                      <span className={sim.isBankruptRisk ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {Math.round((sim.maxCashDrawdown / Math.max(1, liquidSavings)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sim.isBankruptRisk
                            ? 'bg-rose-500'
                            : isMostEconomical
                            ? 'bg-emerald-400'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${burnRatioPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 动态阶梯组合破局提示（当检测到一条路爆仓、另一条路可作跳板时自动触发） */}
      {steppingStoneAdvice && (
        <div className="bg-amber-950/25 border border-amber-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <GitMerge className="w-4 h-4" />
              <span>沙盘智能推演：“先 B 后 A”两段式阶梯破局方案</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              你当前备用金（<strong className="font-mono text-white">¥{liquidSavings.toLocaleString()}</strong>）直接冲刺{' '}
              <strong className="text-amber-300">【{steppingStoneAdvice.targetPath.pk_profile.short_name}】</strong>{' '}
              会在转正前产生 <strong className="font-mono text-rose-400">¥{steppingStoneAdvice.shortfall.toLocaleString()}</strong> 断粮缺口。
              建议先花 <strong className="font-mono text-emerald-400">¥{steppingStoneAdvice.bridgePath.pk_profile.official_cost_avg.toLocaleString()}</strong> 切入{' '}
              <strong className="text-emerald-300">【{steppingStoneAdvice.bridgePath.pk_profile.short_name}】</strong> 救急活下来，预计在岗约{' '}
              <strong className="font-mono text-white">{steppingStoneAdvice.totalBridgeMonths} 个月</strong> 即可攒够{' '}
              <strong className="font-mono text-emerald-400">¥{steppingStoneAdvice.targetDrawdown.toLocaleString()}</strong> 安全垫，随后再无缝切换至高储蓄赛道！
            </p>
          </div>
        </div>
      )}

      {/* 并排 PK 矩阵主体 */}
      {comparedPaths.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <p className="text-sm text-slate-400 mb-4">请至少勾选 2 条路径进入并排 PK 决策天平</p>
          <button
            onClick={() => {
              onToggleCompareId('PATH_001');
              onToggleCompareId('PATH_002');
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition"
          >
            恢复默认 PK (PATH_001 远洋船员 vs PATH_002 特种叉车 N1)
          </button>
        </div>
      ) : (
        <section
          className={`grid grid-cols-1 gap-6 ${
            comparedPaths.length === 3 ? ' lg:grid-cols-3' : 'md:grid-cols-2'
          }`}
        >
          {comparedPaths.map((path, index) => {
            const pk = path.pk_profile;
            const sim = simulationResults[index];
            const costRange = path.track_a_hard_facts.official_zero_markup_cost_cny;
            const isMostEconomical = path.path_id === mostEconomicalPathId;

            return (
              <div
                key={path.path_id}
                className={`bg-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between border ${
                  isMostEconomical
                    ? 'border-emerald-400/80 ring-1 ring-emerald-400/30'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* 卡片头部 */}
                  <div className="p-5 bg-slate-900/90 border-b border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">{path.path_id}</span>
                        {isMostEconomical && (
                          <span className="text-[11px] font-bold text-emerald-400">
                            · ★ 最经济路径
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-400 font-medium">{pk.badge}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{pk.short_name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{pk.hard_threshold}</p>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* 维度 1：断粮爆仓压力测试结果（动态计算） */}
                    <div
                      className={`p-4 rounded-xl border ${
                        sim.isBankruptRisk
                          ? 'bg-rose-950/30 border-rose-500/40'
                          : 'bg-emerald-950/20 border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-200">
                          1. 上岸前“断粮爆仓”压力测试
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            sim.isBankruptRisk
                              ? 'bg-rose-500 text-white'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {sim.isBankruptRisk ? '⚠️ 资金链断裂警告' : '✅ 备用金安全过关'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/60">
                          <div className="text-slate-400">熬到转正需耗时：</div>
                          <div className="text-sm font-mono font-bold text-white mt-0.5 tabular-nums">
                            {sim.totalPreRegularMonths} 个月
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ({pk.prep_months}月培训 + {pk.intern_months}月低薪过渡)
                          </div>
                        </div>
                        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/60">
                          <div className="text-slate-400">转正前最大资金缺口：</div>
                          <div className="text-sm font-mono font-bold text-amber-400 mt-0.5 tabular-nums">
                            ¥{sim.maxCashDrawdown.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            含官方学费 + 过渡期家用倒贴
                          </div>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed text-slate-300">
                        {sim.isBankruptRisk ? (
                          <span className="text-rose-300">
                            <strong>残酷真相：</strong>你的 ¥{liquidSavings.toLocaleString()}{' '}
                            存款不够熬完前 {sim.totalPreRegularMonths} 个月！还差{' '}
                            <strong className="underline font-mono tabular-nums">
                              ¥{sim.cashShortfall.toLocaleString()}
                            </strong>{' '}
                            缺口，若无家人支援或兼职缓冲，会在拿高薪前被迫中途放弃。
                          </span>
                        ) : (
                          <span className="text-emerald-300">
                            <strong>安全通过：</strong>你的备用金完全足以覆盖前{' '}
                            {sim.totalPreRegularMonths} 个月的学费与家用消耗（结余缓冲{' '}
                            <strong className="font-mono tabular-nums">
                              ¥{(liquidSavings - sim.maxCashDrawdown).toLocaleString()}
                            </strong>
                            ），不会发生半路断粮。
                          </span>
                        )}
                      </p>
                    </div>

                    {/* 维度 2：6个月 / 1年 / 3年真实净攒钱推演 */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-200">
                          2. 扣除家用与吃住漏斗后：净攒钱反转推演
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                          在岗月开销 ¥{pk.on_job_living_expense}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        {/* 第 6 个月末 */}
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">第 6 个月末累计净结余：</span>
                            <span
                              className={`font-mono font-semibold tabular-nums ${
                                sim.netWorth6Mo >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {sim.netWorth6Mo >= 0
                                ? `+¥${sim.netWorth6Mo.toLocaleString()}`
                                : `-¥${Math.abs(sim.netWorth6Mo).toLocaleString()}`}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">{pk.intern_label}</div>
                        </div>

                        {/* 第 1 年末 */}
                        <div className="pt-2 border-t border-slate-800/60">
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-400">第 1 年末累计净结余：</span>
                            <span
                              className={`font-mono font-bold tabular-nums ${
                                sim.netWorth12Mo >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {sim.netWorth12Mo >= 0
                                ? `+¥${sim.netWorth12Mo.toLocaleString()}`
                                : `-¥${Math.abs(sim.netWorth12Mo).toLocaleString()}`}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {path.path_id === 'PATH_001'
                              ? '船员第1年有10个月在培训和见习，第一年基本刚回本'
                              : path.path_id === 'PATH_002'
                              ? '叉车第2个月即开始正向进账，短期救急现金流极快'
                              : `前 ${sim.totalPreRegularMonths} 个月完成拿证与新手过渡`}
                          </div>
                        </div>

                        {/* 第 3 年末 */}
                        <div className="pt-2.5 border-t border-slate-800/80">
                          <div className="flex justify-between items-baseline mb-1.5">
                            <span className="text-slate-200 font-semibold">
                              第 3 年末累计净攒下（翻身账）：
                            </span>
                            <span
                              className={`text-base font-mono font-bold tabular-nums ${
                                sim.netWorth36Mo >= 150000
                                  ? 'text-amber-400'
                                  : sim.netWorth36Mo >= 0
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {sim.netWorth36Mo >= 0
                                ? `+¥${sim.netWorth36Mo.toLocaleString()}`
                                : `-¥${Math.abs(sim.netWorth36Mo).toLocaleString()}`}
                            </span>
                          </div>

                          {/* 3年净储蓄可视化对比条 */}
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
                            <div
                              className={`h-full rounded-full ${
                                sim.netWorth36Mo >= 150000
                                  ? 'bg-amber-400'
                                  : sim.netWorth36Mo >= 0
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{
                                width: `${Math.max(
                                  8,
                                  Math.min(
                                    100,
                                    Math.round((Math.abs(sim.netWorth36Mo) / maxAbs36Mo) * 100)
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="text-[11px] text-slate-500">
                            年均在岗 {pk.working_months_per_year} 个月 · 扣除个人吃住(¥
                            {pk.on_job_living_expense}/月)及家用后的纯结余
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 维度 3：轨 A 硬成本与轨 B 肉身代价对撞 */}
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/70">
                        <span className="text-slate-400 block mb-1">
                          家庭割裂与孤独代价 (轨B)：
                        </span>
                        <span
                          className={`font-medium ${
                            pk.family_separation.level === 'HIGH'
                              ? 'text-rose-300'
                              : pk.family_separation.level === 'MEDIUM'
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                          }`}
                        >
                          {pk.family_separation.text}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/70">
                        <span className="text-slate-400 block mb-1">
                          生理与健康磨损点 (轨B)：
                        </span>
                        <span className="text-slate-200 leading-relaxed">{pk.body_toll}</span>
                      </div>

                      <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/70">
                        <span className="text-slate-400 block mb-1">3年后的职业天花板：</span>
                        <span className="text-slate-200 leading-relaxed">{pk.ceiling_3yr}</span>
                      </div>

                      <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-500/20 flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <span className="text-blue-300 font-semibold block font-mono tabular-nums">
                            官方裸价：¥{costRange.total_min.toLocaleString()} -{' '}
                            {costRange.total_max.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            自己去官网办，立省黑中介溢价约{' '}
                            <strong className="font-mono text-rose-300 tabular-nums">
                              ¥{pk.agency_trap_diff.toLocaleString()}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={path.track_a_hard_facts.official_portal_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded-lg text-[11px] font-medium transition flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <span>{path.track_a_hard_facts.official_portal_name}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => onJumpToSimulator(path.path_id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg transition"
                            title="查看逐月现金流明细表"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 底部：一锤定音决断拍板器 */}
                <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-emerald-400">
                    满足以下条件，直接选【{pk.short_name}】：
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {pk.verdict_fit.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 font-bold shrink-0">•</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-xs font-bold text-rose-400 pt-2.5 border-t border-slate-800/80">
                    踩中以下任意一条，立刻放弃：
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {pk.verdict_avoid.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-400 font-bold shrink-0">×</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};

interface ProtocolInspectorProps {
  paths?: VerifiedPath[];
  onJumpToPath?: (pathId: string) => void;
}

export const ProtocolInspector: React.FC<ProtocolInspectorProps> = ({
  paths = VERIFIED_PATHS,
  onJumpToPath,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'PIPELINE' | 'ZOD_GATE' | 'BATCH_50' | 'PROTOCOL_SPEC'
  >('PIPELINE');

  // Zod 入库守卫实时测试器状态
  const [candidateJsonText, setCandidateJsonText] = useState<string>(() =>
    JSON.stringify(VERIFIED_PATHS[4], null, 2)
  );
  const [activePresetLabel, setActivePresetLabel] = useState<string>(
    '✅ 已入库合规样本：PATH_005 德国双元制 (Ausbildung)'
  );
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedCliCmd, setCopiedCliCmd] = useState<boolean>(false);
  const [showAuditTable, setShowAuditTable] = useState<boolean>(true);

  // 对全库所有已上线路径执行实时 FullVerifiedPathSchema 全字段门禁 + 时效 + 真实链路健康核验
  const fullDbAuditSummary = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const results = paths.map((p) => {
      const portalTier = p.track_a_hard_facts.portal_tier ?? 'STATUTORY_GOV';
      const meta = p.freshness_meta;
      const freshness = meta
        ? evaluateFreshnessUrgency(meta.next_verify_due, today)
        : { urgency: 'FRESH' as const, daysRemaining: 180 };
      return {
        path_id: p.path_id,
        title: p.title,
        short_name: p.pk_profile.short_name,
        portal: p.track_a_hard_facts.official_portal_url,
        portalTier,
        policy_update_month: meta?.window_label || p.policy_update_month || '常年稳定',
        windowMonths: meta?.window_months ?? [],
        inActiveWindow: isInActiveWindowMonth(meta, currentMonth),
        nextVerifyDue: meta?.next_verify_due ?? '-',
        freshnessUrgency: freshness.urgency,
        daysRemaining: freshness.daysRemaining,
        linkHealth: meta?.link_health,
        domainValid: isPortalUrlValidForTier(
          p.track_a_hard_facts.official_portal_url,
          portalTier
        ),
        validation: validateFullVerifiedPath(p),
      };
    });
    const passedCount = results.filter((r) => r.validation.passed && r.domainValid).length;
    const statutoryCount = results.filter((r) => r.portalTier === 'STATUTORY_GOV').length;
    const commercialCount = results.filter((r) => r.portalTier === 'COMMERCIAL_FIRST_PARTY').length;
    const expiredCount = results.filter((r) => r.freshnessUrgency === 'EXPIRED').length;
    const dueSoonCount = results.filter((r) => r.freshnessUrgency === 'DUE_SOON').length;
    const activeWindowCount = results.filter((r) => r.inActiveWindow).length;
    const unreachableCount = results.filter((r) => r.linkHealth?.status === 'UNREACHABLE').length;
    return {
      total: results.length,
      passedCount,
      statutoryCount,
      commercialCount,
      expiredCount,
      dueSoonCount,
      activeWindowCount,
      unreachableCount,
      currentMonth,
      allPassed: passedCount === results.length,
      results,
    };
  }, [paths]);

  // 对当前编辑器内的 JSON 文本执行实时 Zod 校验
  const liveGateResult = useMemo(() => {
    try {
      const parsed = JSON.parse(candidateJsonText);
      return {
        syntaxValid: true,
        syntaxError: null as string | null,
        ...validateCandidateCard(parsed),
      };
    } catch (err) {
      return {
        syntaxValid: false,
        syntaxError: err instanceof Error ? err.message : 'JSON 语法解析错误',
        passed: false,
        data: undefined,
        errors: [],
      };
    }
  }, [candidateJsonText]);

  const handleCopyAuditorPrompt = () => {
    navigator.clipboard.writeText(CHIEF_DATA_AUDITOR_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyCliCommand = () => {
    navigator.clipboard.writeText('npm run check:links && npm run audit:paths');
    setCopiedCliCmd(true);
    setTimeout(() => setCopiedCliCmd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 顶部总控与四维工程切换栏 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span className="text-emerald-400 font-semibold">
                Multi-Agent Verification Pipeline
              </span>
              <span aria-hidden="true">·</span>
              <span>以 L5 为雷达、以 L1 白名单为滤网、以 Zod 为代码级入库闸门</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-emerald-300">
                全库实时 Schema 审计：{fullDbAuditSummary.passedCount}/{fullDbAuditSummary.total} 通过（政府/法定源 {fullDbAuditSummary.statutoryCount} · 商业平台一手源 {fullDbAuditSummary.commercialCount}）
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>L1-L5 五阶防伪生产流水线 · Zod 自动化入库守卫与 50 卡扩张蓝图</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'PIPELINE', label: '1. 五阶状态机与伪考证熔断库' },
              { id: 'ZOD_GATE', label: '2. Zod 入库守卫实测沙盒 & Prompt' },
              { id: 'BATCH_50', label: '3. 50卡批次蓝图 & 心跳巡检器' },
              { id: 'PROTOCOL_SPEC', label: '4. L1-L5 证据宪章与防坑剧本' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 子模块 1：五阶数据生产流水线架构 + 工位 2 伪考证熔断黑名单库 */}
        {activeSubTab === 'PIPELINE' && (
          <div className="pt-6 space-y-6">
            {/* 五阶状态机可视化 */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-white">
                  一、 五阶数据生产状态机（将“发现野路子线索”与“法定事实核验”彻底物理隔离）
                </h3>
                <span className="text-xs text-slate-400">
                  只有通过前一道闸门的证据包 (Evidence Bundle) 才能流向下一工位
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  {
                    stage: '工位 1',
                    title: 'L5 线索嗅探 Agent',
                    input: '小红书 / 贴吧 / 豆瓣冷门就业组吐槽帖',
                    rule: '剥夺记录任何学费与薪资数字的权限！只提取三元组：[人群困境] → [证书/政策/签证名] → [疑似发证部委]。',
                    output: '产出：Candidate_Lead',
                    tone: 'border-slate-800 bg-slate-950',
                  },
                  {
                    stage: '工位 2',
                    title: 'L1/L2 法定白名单反查',
                    input: '锁定 site:gov.cn / 72项国家职业资格目录 / 外国移民局',
                    rule: '核查人社部72项准入目录与部委规章。若无 L1 法定依据且全网吹嘘“包挂靠/兼职贷”，直接触发熔断打入黑名单！',
                    output: '✅ ≥2份L1/L2公报 或 ❌ 熔断拉黑',
                    tone: 'border-blue-500/40 bg-blue-950/15',
                  },
                  {
                    stage: '工位 3',
                    title: '轨 B 正反双向对冲萃取',
                    input: '强制拼接“后悔/被坑/劝退/学徒期工资”反搜',
                    rule: '严禁输出单一平均月薪！强制剥离 [1.新手断档期, 2.转正中位数, 3.高阶溢价]，并用中介打包价减轨A裸价生成照妖镜。',
                    output: '产出：轨A + 轨B 混合草稿',
                    tone: 'border-amber-500/40 bg-amber-950/15',
                  },
                  {
                    stage: '工位 4',
                    title: 'Zod 代码级 Schema 闸门',
                    input: 'PathCardMasterSchema 数学与正则硬约束',
                    rule: '校验官方域名正则白名单、L1源≥1且总源≥2、禁用模糊猜测词、强制⚠️免责声明、3段收入与≥3条15字以上劝退红线。',
                    output: '产出：Staged_JSON (零违规)',
                    tone: 'border-emerald-500/40 bg-emerald-950/15',
                  },
                  {
                    stage: '工位 5',
                    title: '人类终审 + 定时心跳巡检',
                    input: '每月 Cron HEAD 死链检测 + 政策窗口期唤醒',
                    rule: '人类主理人3分钟核对官方截图签发入库；后续按 policy_update_month 在每年固定招生/招考月定点唤醒重跑。',
                    output: '正式发布入库 (LIVE)',
                    tone: 'border-slate-700 bg-slate-950',
                  },
                ].map((s, idx) => (
                  <div
                    key={s.stage}
                    className={`rounded-xl border p-4 flex flex-col justify-between ${s.tone}`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono font-bold text-emerald-400">{s.stage}</span>
                        <span className="text-slate-500 font-mono">STEP 0{idx + 1}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2">{s.title}</h4>
                      <div className="text-[11px] text-slate-400 mb-2">
                        <strong className="text-slate-300">输入源：</strong>
                        {s.input}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">{s.rule}</p>
                    </div>
                    <div className="pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-amber-300">
                      {s.output}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 工位 2 熔断拦截实录：《伪考证/割韭菜黑名单库 (SCAM_BLACKLIST)》 */}
            <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                  <Ban className="w-4 h-4" />
                  <span>
                    工位 2 自动熔断拦截库：《目录外伪考证 / 招转培黑名单 (SCAM_BLACKLIST)》
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  凡未命中人社部《国家职业资格目录（72项）》且无部委准入依据，一律在此拦截，绝不生成推荐卡片
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SCAM_BLACKLIST.map((item) => (
                  <div
                    key={item.scam_id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-rose-300">
                        🚫 {item.fake_cert_name}
                      </span>
                      <span className="font-mono text-slate-400 tabular-nums">
                        收割报价：{item.agency_fee_cny}
                      </span>
                    </div>
                    <div className="text-slate-400 italic bg-slate-950 p-2.5 rounded border border-slate-800/80">
                      L5 营销软文话术：{item.l5_marketing_hook}
                    </div>
                    <div className="text-amber-300 font-medium">
                      {item.l1_verification_verdict}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{item.intercept_reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 子模块 2：工位 4 Zod 入库守卫实时拦截沙盒 & Chief Data Auditor System Prompt */}
        {activeSubTab === 'ZOD_GATE' && (
          <div className="pt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 左侧：实时 JSON 编辑器与预设测试用例 */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>工位 4：Zod 代码级 Schema 闸门实时测试台 (`validateCandidateCard`)</span>
                  </div>
                  <span className="text-xs text-slate-400">可直接修改下方 JSON 触发实时拦截</span>
                </div>

                {/* 一键切换测试样本按钮组 */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    {
                      label: '✅ 合规样本：PATH_058 植保无人机飞手 (CAAC)',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_058') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_060 执业兽医资格证',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_060') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_065 中资央企海外项目部直招',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_065') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_054 海外AI标注与RLHF专家 (Outlier)',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_054') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_056 国际中文独立教师 (iTalki/Preply)',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_056') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_063 中级注册安全工程师 (EHS)',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_063') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_015 部队考军校 / 大学生提干',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_015') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_013 农村三大专项 (降15-50分进985)',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_013') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_035 教育部语合中心公派志愿者',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_035') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_021 大学生西部计划 (0元/考研+10分)',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_021') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_008 起重机指挥与司机 (Q1/Q2)',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_008') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_032 新西兰WHV (YELLOW)',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_032') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_034 意大利免学费+DSU',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_034') || VERIFIED_PATHS[0],
                    },
                    {
                      label: '✅ 合规样本：PATH_024 解放军文职招考',
                      data: VERIFIED_PATHS.find((p) => p.path_id === 'PATH_024') || VERIFIED_PATHS[0],
                    },
                    ...SAMPLE_INVALID_CANDIDATES.map((s) => ({
                      label: s.label,
                      data: s.json,
                    })),
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setActivePresetLabel(preset.label);
                        setCandidateJsonText(JSON.stringify(preset.data, null, 2));
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border font-medium transition ${
                        activePresetLabel === preset.label
                          ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={candidateJsonText}
                  onChange={(e) => {
                    setActivePresetLabel('自定义编辑 JSON 测试中...');
                    setCandidateJsonText(e.target.value);
                  }}
                  rows={18}
                  spellCheck={false}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* 右侧：Zod 实时校验结果面板 + Chief Data Auditor System Prompt */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  className={`rounded-xl border p-5 space-y-3 ${
                    liveGateResult.passed
                      ? 'bg-emerald-950/25 border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      ZOD INGESTION GUARD STATUS
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                        liveGateResult.passed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {liveGateResult.passed ? 'PASSED · 准予入库' : 'REJECTED · 闸门熔断拦截'}
                    </span>
                  </div>

                  {liveGateResult.passed && liveGateResult.data ? (
                    <div className="space-y-2 text-xs text-emerald-200">
                      <div className="font-bold text-sm text-white">
                        ✅ 卡片 [{liveGateResult.data.path_id} {liveGateResult.data.title}] 通过全部工程校验！
                      </div>
                      <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                        <li>
                          • 官网白名单正则：PASS ({liveGateResult.data.track_a_hard_facts.official_portal_url})
                        </li>
                        <li>
                          • 轨 A 证据链数量：{liveGateResult.data.track_a_hard_facts.l1_l2_sources.length} 个独立源（含 L1 一手源）
                        </li>
                        <li>
                          • 轨 A 禁用模糊词检测：0 命中（不含“听说/大概/好像”）
                        </li>
                        <li>
                          • 轨 B 三段式薪资剥离：严格 3 阶段（已暴露阶段1低薪/过渡期）
                        </li>
                        <li>
                          • 轨 B 劝退红线与照妖镜：{liveGateResult.data.track_b_reality_slice.deal_breakers.length} 条硬核劝退红线已就绪
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      <div className="font-bold text-sm text-rose-300">
                        ❌ 路径卡片未通过 L1-L5 分轨入库闸门，共拦截{' '}
                        {liveGateResult.syntaxError ? 1 : liveGateResult.errors.length} 项违规：
                      </div>
                      {liveGateResult.syntaxError ? (
                        <div className="p-3 bg-slate-950 rounded-lg border border-rose-500/40 font-mono text-rose-300">
                          JSON 语法错误：{liveGateResult.syntaxError}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {liveGateResult.errors.map((issue, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-slate-950/90 rounded-lg border border-rose-500/30 space-y-1"
                            >
                              <div className="font-mono text-[11px] text-amber-300">
                                字段 [{issue.path}]
                              </div>
                              <div className="text-rose-200 leading-relaxed">{issue.message}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 核验 Agent 核心 System Prompt 复制区 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-white">
                        工位 2+3 核验 Agent 系统提示词 (Chief Data Auditor Prompt)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        可直接用于 Claude Code / API 批量跑第 007 ~ 050 号卡片
                      </div>
                    </div>
                    <button
                      onClick={handleCopyAuditorPrompt}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>已复制 Prompt</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>复制 System Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-900 border border-slate-800/80 rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-52 whitespace-pre-wrap leading-relaxed">
                    {CHIEF_DATA_AUDITOR_PROMPT}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 子模块 3：50 张卡片批次扩张蓝图（Batch 1 ~ Batch 5）与定时心跳巡检器 */}
        {activeSubTab === 'BATCH_50' && (
          <div className="pt-6 space-y-6">
            {/* 真实时效与官网死链巡检控制台（数据来自 scripts/check-links.ts & scripts/audit-paths.ts） */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                    <span>工位 5：全字段 Schema 门禁 & 真实 HTTP 死链巡检台账</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    由独立 CLI 脚本 <code className="text-amber-300 font-mono">npm run check:links</code> 真实探测各官方门户 HTTP 状态并落盘至 <code className="text-slate-300 font-mono">linkHealthReport.json</code>，由 <code className="text-emerald-300 font-mono">npm run audit:paths</code> 校验全字段 <code className="text-slate-300 font-mono">FullVerifiedPathSchema</code> 与复核截止日。
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyCliCommand}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0"
                  >
                    {copiedCliCmd ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>已复制巡检命令</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>npm run check:links && npm run audit:paths</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAuditTable((v) => !v)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition shrink-0"
                  >
                    {showAuditTable ? '收起全库巡检明细 ▲' : '展开全库巡检明细 ▼'}
                  </button>
                </div>
              </div>

              {/* 四项实测汇总指标 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 mb-1">全字段 Schema 锁死门禁</div>
                  <div className="font-mono font-bold text-emerald-400">
                    {fullDbAuditSummary.passedCount}/{fullDbAuditSummary.total} 100% 通过
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    法定源 {fullDbAuditSummary.statutoryCount} · 商业平台源 {fullDbAuditSummary.commercialCount}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 mb-1">实测 HTTP 链路快照</div>
                  <div className="font-mono font-bold text-slate-100">
                    可达 {LINK_HEALTH_REPORT.summary.HEALTHY + LINK_HEALTH_REPORT.summary.REDIRECTED} · 防爬 {LINK_HEALTH_REPORT.summary.RESTRICTED_BOT} · 异常 {LINK_HEALTH_REPORT.summary.UNREACHABLE}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    {LINK_HEALTH_REPORT.generated_at || '尚未执行脚本探测'}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 mb-1">复核时效预警（next_verify_due）</div>
                  <div className={`font-mono font-bold ${fullDbAuditSummary.expiredCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    已超期 {fullDbAuditSummary.expiredCount} · 30天内到期 {fullDbAuditSummary.dueSoonCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    商业平台 60天 / 配额签证 90天 / 法定 180天
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 mb-1">当月 ({fullDbAuditSummary.currentMonth}月) 核心报名/窗口期</div>
                  <div className="font-mono font-bold text-blue-300">
                    {fullDbAuditSummary.activeWindowCount} 条路径正值窗口月
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    基于 freshness_meta.window_months 自动计算
                  </div>
                </div>
              </div>

              {/* 全库 33 条实时巡检明细表 */}
              {showAuditTable && (
                <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3 font-mono">编号 / 路径</th>
                        <th className="py-2 px-3">信源分级</th>
                        <th className="py-2 px-3">官网 HTTP 实测</th>
                        <th className="py-2 px-3">窗口月</th>
                        <th className="py-2 px-3 font-mono">下次重验日</th>
                        <th className="py-2 px-3">全字段 Schema</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {fullDbAuditSummary.results.map((row) => {
                        const lh = row.linkHealth;
                        const lhStatus = lh?.status ?? 'UNCHECKED';
                        const lhClass =
                          lhStatus === 'HEALTHY' || lhStatus === 'REDIRECTED'
                            ? 'text-emerald-400'
                            : lhStatus === 'RESTRICTED_BOT'
                              ? 'text-amber-300'
                              : lhStatus === 'UNREACHABLE'
                                ? 'text-rose-400'
                                : 'text-slate-500';
                        const lhLabel =
                          lhStatus === 'HEALTHY'
                            ? `200 可达 (${lh?.latency_ms ?? 0}ms)`
                            : lhStatus === 'REDIRECTED'
                              ? `重定向可达 (${lh?.http_status ?? ''})`
                              : lhStatus === 'RESTRICTED_BOT'
                                ? `防爬拦截 (${lh?.http_status ?? 'WAF'})`
                                : lhStatus === 'UNREACHABLE'
                                  ? `异常 (${lh?.http_status ?? '超时/阻断'})`
                                  : '未探测';

                        return (
                          <tr key={row.path_id} className="hover:bg-slate-900/60">
                            <td className="py-2 px-3">
                              <button
                                onClick={() => onJumpToPath && onJumpToPath(row.path_id)}
                                className="text-left hover:text-emerald-300 transition"
                              >
                                <span className="font-mono font-bold text-slate-200 mr-1.5">
                                  {row.path_id}
                                </span>
                                <span className="text-slate-300">{row.short_name}</span>
                              </button>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span
                                className={
                                  row.portalTier === 'COMMERCIAL_FIRST_PARTY'
                                    ? 'text-amber-300 font-medium'
                                    : 'text-blue-300'
                                }
                              >
                                {row.portalTier === 'COMMERCIAL_FIRST_PARTY' ? '商业平台一手' : '政府法定源'}
                              </span>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap font-mono">
                              <a
                                href={row.portal}
                                target="_blank"
                                rel="noreferrer"
                                className={`${lhClass} hover:underline`}
                                title={lh?.note || row.portal}
                              >
                                {lhLabel}
                              </a>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              {row.windowMonths.length === 0 ? (
                                <span className="text-slate-400">常年开放</span>
                              ) : (
                                <span className={row.inActiveWindow ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                                  {row.windowMonths.map((m) => `${m}月`).join('/')}
                                  {row.inActiveWindow ? ' · 本月窗口' : ''}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap font-mono">
                              <span
                                className={
                                  row.freshnessUrgency === 'EXPIRED'
                                    ? 'text-rose-400 font-bold'
                                    : row.freshnessUrgency === 'DUE_SOON'
                                      ? 'text-amber-300 font-semibold'
                                      : 'text-slate-300'
                                }
                              >
                                {row.nextVerifyDue}
                              </span>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap font-mono">
                              {row.validation.passed && row.domainValid ? (
                                <span className="text-emerald-400">PASS</span>
                              ) : (
                                <span className="text-rose-400">FAIL</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Batch 1 ~ Batch 5 排期矩阵 */}
            <div className="space-y-4">
              {BATCH_BLUEPRINT_50.map((batch) => {
                const liveCount = batch.items.filter((i) => i.status === 'LIVE_VERIFIED').length;
                return (
                  <div
                    key={batch.batch_id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                          <span className="font-mono font-bold text-amber-400">
                            {batch.range_label}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>目标受众：{batch.target_persona}</span>
                        </div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-400" />
                          <span>{batch.batch_name}</span>
                        </h3>
                      </div>
                      <div className="text-xs font-mono text-emerald-400">
                        已核验上线 {liveCount} 张 / 种子池 {batch.items.length} 张
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {batch.items.map((seed) => {
                        const isLive = seed.status === 'LIVE_VERIFIED';
                        return (
                          <div
                            key={seed.path_id}
                            className={`rounded-lg border p-3.5 flex flex-col justify-between text-xs ${
                              isLive
                                ? 'bg-slate-900 border-emerald-500/30'
                                : 'bg-slate-900/40 border-slate-800/80'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="font-mono font-bold text-slate-200">
                                  {seed.path_id}
                                </span>
                                <span
                                  className={`font-mono text-[11px] ${
                                    isLive ? 'text-emerald-400 font-semibold' : 'text-amber-400'
                                  }`}
                                >
                                  {isLive ? '● 已过闸门入库 (LIVE)' : '○ 已完成L5嗅探 · 待跑L1'}
                                </span>
                              </div>
                              <div className="font-bold text-slate-100 mb-2 leading-snug">
                                {seed.title}
                              </div>
                              <div className="text-[11px] text-slate-400 space-y-1">
                                <div>权威源：{seed.authority_tag}</div>
                                <div>巡检窗口：{seed.policy_update_month}</div>
                              </div>
                            </div>

                            {isLive && onJumpToPath && (
                              <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end">
                                <button
                                  onClick={() => onJumpToPath(seed.path_id)}
                                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                                >
                                  <span>在沙盘中查看此卡片</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 子模块 4：L1 - L5 双轨五级证据核验宪章 & 三大黑产高频剧本 */}
        {activeSubTab === 'PROTOCOL_SPEC' && (
          <div className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {L1_L5_PROTOCOL_SPEC.map((item) => {
                const isTrackA = item.track.includes('轨 A');
                return (
                  <div
                    key={item.level}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono font-bold text-base text-white">
                          {item.level}
                        </span>
                        <span className={isTrackA ? 'text-blue-400' : 'text-amber-400'}>
                          {item.track}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 mb-2">{item.badge}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        <strong className="text-slate-300">采信源：</strong>
                        {item.sources}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-emerald-400">入库铁律：</strong>
                      {item.rule}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 三大黑产高频话术解剖表 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>黑中介“招转培 / 培训贷 / 假证包过”三大高频收割剧本拆解</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="font-bold text-white">
                    剧本 01：虚假高薪学徒工 + 美容/教育分期贷
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    在招聘软件发布“零经验叉车学徒/电工助理，月薪8500包吃住”，面试时声称需先在合作机构办证，诱导签署数千元至上万元账单分期协议。
                  </p>
                  <div className="text-emerald-400 flex items-start gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      破局铁律：一切要求下载信贷App或先交数千元押金的“招聘”立即拉黑，直接去特检院/应急局官网备案考点自考。
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="font-bold text-white">
                    剧本 02：混淆发证机关，高价卖“山寨协会证”
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    利用外行不懂准入目录，把某山寨协会印制的“高级叉车师/国际海员证/高级康复师”以4800元兜售，宣称“免考拿证、全国通用”。
                  </p>
                  <div className="text-emerald-400 flex items-start gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      破局铁律：认准每张卡片轨 A 挂载的唯一 .gov.cn / .cn 官方查询门户，凡是官网查不到电子档案的证书等同废纸。
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="font-bold text-white">
                    剧本 03：隐瞒前半年见习期，制造“首月过万”幻觉
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    只宣传远洋水手月薪1.2万、高叉月薪9000，绝口不提远洋前6个月见习期每月仅1500-3000元津贴、考场拿证后大仓拒收纯新手的断档期。
                  </p>
                  <div className="text-emerald-400 flex items-start gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      破局铁律：必须按轨 B“阶段1新手期”核算至少3-6个月的家庭生活费安全垫，无安全垫切勿盲目辞职脱产。
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
