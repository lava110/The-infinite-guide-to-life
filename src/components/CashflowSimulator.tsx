import React, { useState } from 'react';
import { VerifiedPath } from '../data/verifiedPaths';
import { Calculator, AlertTriangle, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';

interface CashflowSimulatorProps {
  paths: VerifiedPath[];
  selectedPathId: string;
  onSelectPath: (id: string) => void;
}

export const CashflowSimulator: React.FC<CashflowSimulatorProps> = ({
  paths,
  selectedPathId,
  onSelectPath,
}) => {
  const path = paths.find((p) => p.path_id === selectedPathId) || paths[0];
  const [monthlyLivingCost, setMonthlyLivingCost] = useState<number>(
    path.includes_free_board_lodging ? 1200 : 2800
  );
  const [initialSavings, setInitialSavings] = useState<number>(15000);

  // Update recommended living cost when switching paths
  const handlePathChange = (id: string) => {
    onSelectPath(id);
    const nextPath = paths.find((p) => p.path_id === id);
    if (nextPath) {
      setMonthlyLivingCost(nextPath.includes_free_board_lodging ? 1200 : 2800);
    }
  };

  const diyCostAvg = Math.round(
    (path.track_a_hard_facts.official_zero_markup_cost_cny.total_min +
      path.track_a_hard_facts.official_zero_markup_cost_cny.total_max) /
      2
  );
  const agencyCostAvg = Math.round(
    (path.track_b_reality_slice.anti_scam_mirror.typical_agency_quote_cny[0] +
      path.track_b_reality_slice.anti_scam_mirror.typical_agency_quote_cny[1]) /
      2
  );

  const prepMonths = Math.max(
    1,
    Math.round(
      (path.track_a_hard_facts.prep_duration_days.min +
        path.track_a_hard_facts.prep_duration_days.max) /
        2 /
        30
    )
  );

  const stage1Months = path.track_b_reality_slice.net_income_stages[0].duration_months || 3;
  const stage1IncomeAvg = Math.round(
    (path.track_b_reality_slice.net_income_stages[0].monthly_cny_range[0] +
      path.track_b_reality_slice.net_income_stages[0].monthly_cny_range[1]) /
      2
  );
  const stage2IncomeAvg = Math.round(
    (path.track_b_reality_slice.net_income_stages[1].monthly_cny_range[0] +
      path.track_b_reality_slice.net_income_stages[1].monthly_cny_range[1]) /
      2
  );

  // Build 12-month timeline starting from Day 1 of preparation
  const timeline = Array.from({ length: 12 }, (_, idx) => {
    const month = idx + 1;
    let phaseLabel = '';
    let grossIncome = 0;

    if (month <= prepMonths) {
      phaseLabel = '脱产考证期';
      grossIncome = 0;
    } else if (month <= prepMonths + stage1Months) {
      phaseLabel = '新手过渡期';
      grossIncome = stage1IncomeAvg;
    } else {
      phaseLabel = '熟手稳定期';
      grossIncome = stage2IncomeAvg;
    }

    const monthlyNetChange = grossIncome - monthlyLivingCost;
    return {
      month,
      phaseLabel,
      grossIncome,
      monthlyNetChange,
    };
  });

  // Compute cumulative cash balance for DIY vs Agency
  let diyBalance = initialSavings - diyCostAvg;
  let agencyBalance = initialSavings - agencyCostAvg;
  let lowestDiyBalance = diyBalance;
  let diyBreakEvenMonth: number | null = null;
  let agencyBreakEvenMonth: number | null = null;

  const cumulativeRows = timeline.map((row) => {
    diyBalance += row.monthlyNetChange;
    agencyBalance += row.monthlyNetChange;
    if (diyBalance < lowestDiyBalance) {
      lowestDiyBalance = diyBalance;
    }
    if (diyBreakEvenMonth === null && diyBalance >= initialSavings && row.month > prepMonths) {
      diyBreakEvenMonth = row.month;
    }
    if (agencyBreakEvenMonth === null && agencyBalance >= initialSavings && row.month > prepMonths) {
      agencyBreakEvenMonth = row.month;
    }
    return {
      ...row,
      diyBalance,
      agencyBalance,
    };
  });

  const scamPremiumLoss = agencyCostAvg - diyCostAvg;
  const wastedLaborMonths = (scamPremiumLoss / Math.max(1000, stage2IncomeAvg - monthlyLivingCost)).toFixed(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            生存底线压力测试 · 12个月现金流演进与回本周期推演
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <span>破局现金流推演沙盘（DIY 官方裸价 vs 黑中介打包）</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {paths.map((p) => (
            <button
              key={p.path_id}
              onClick={() => handlePathChange(p.path_id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap shrink-0 ${
                p.path_id === path.path_id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {p.path_id} · {p.title.split('（')[0].split('：').pop()}
            </button>
          ))}
        </div>
      </div>

      {/* 参数调节面板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/80 border border-slate-800/80 rounded-xl p-5">
        <div>
          <label className="flex justify-between text-xs font-medium text-slate-300 mb-2">
            <span>手头可用应急启动资金</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              ¥{initialSavings.toLocaleString()}
            </span>
          </label>
          <input
            type="range"
            min="2000"
            max="50000"
            step="1000"
            value={initialSavings}
            onChange={(e) => setInitialSavings(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            <span>¥2,000 (极限救急)</span>
            <span>¥15,000</span>
            <span>¥50,000</span>
          </div>
        </div>

        <div>
          <label className="flex justify-between text-xs font-medium text-slate-300 mb-2">
            <span>个人及家庭每月刚性生活开销</span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">
              ¥{monthlyLivingCost.toLocaleString()} / 月
            </span>
          </label>
          <input
            type="range"
            min="800"
            max="6000"
            step="200"
            value={monthlyLivingCost}
            onChange={(e) => setMonthlyLivingCost(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>¥800 (包吃住极简)</span>
            <span>{path.includes_free_board_lodging ? '当前路径上岗包吃住' : '需自理房租伙食'}</span>
            <span>¥6,000 (养家房贷)</span>
          </div>
        </div>

        <div className="flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400">黑中介信息差剥削测算</div>
          <div className="my-1">
            <span className="text-xs text-slate-300">多花冤枉钱：</span>
            <span className="text-base font-bold font-mono text-rose-400 tabular-nums">
              ¥{scamPremiumLoss.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            相当于熟手期白干 <strong className="text-rose-300 font-mono tabular-nums">{wastedLaborMonths} 个月</strong> 纯利润给中介交智商税
          </div>
        </div>
      </div>

      {/* 核心生存结论卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>现金流最低谷警戒线（DIY走法）</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div
            className={`text-xl font-bold font-mono tabular-nums ${
              lowestDiyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {lowestDiyBalance >= 0
              ? `安全余量 ¥${lowestDiyBalance.toLocaleString()}`
              : `资金缺口 -¥${Math.abs(lowestDiyBalance).toLocaleString()}`}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {lowestDiyBalance >= 0
              ? `现有储蓄足以覆盖 ${prepMonths} 个月脱产考证与前 ${stage1Months} 个月新手低薪期。`
              : `警告：在熬过新手过渡期前现金流将断流，需降低月开销或先打零工攒够差额！`}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>回本并超越初始储蓄周期</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {diyBreakEvenMonth ? `第 ${diyBreakEvenMonth} 个月回本` : '需 >12 个月'}
            <span className="text-xs font-normal text-slate-400 ml-2">
              (黑中介需 {agencyBreakEvenMonth ? `第 ${agencyBreakEvenMonth} 个月` : '>12 个月'})
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            计入脱产期零收入与吃住消耗后的真实净资产回正时间点。
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>满 12 个月期末净现金结余</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block">官方 DIY 走法</span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                ¥{cumulativeRows[11].diyBalance.toLocaleString()}
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div>
              <span className="text-[11px] text-slate-400 block">被黑中介扒皮后</span>
              <span className="text-lg font-bold font-mono text-rose-400 tabular-nums">
                ¥{cumulativeRows[11].agencyBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 12个月逐月现金流推演明细表 */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3 font-medium">月份</th>
              <th className="py-2.5 px-3 font-medium">所处阶段</th>
              <th className="py-2.5 px-3 font-medium text-right">当月净收入 (中位)</th>
              <th className="py-2.5 px-3 font-medium text-right">当月刚性开销</th>
              <th className="py-2.5 px-3 font-medium text-right">当月净储蓄增减</th>
              <th className="py-2.5 px-3 font-medium text-right text-emerald-400">DIY 累计账面余额</th>
              <th className="py-2.5 px-3 font-medium text-right text-rose-400">黑中介累计账面余额</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 font-mono tabular-nums">
            {cumulativeRows.map((r) => (
              <tr key={r.month} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2 px-3 text-slate-300 font-semibold">第 {r.month} 月</td>
                <td className="py-2 px-3 font-sans">
                  <span
                    className={`text-xs ${
                      r.phaseLabel === '脱产考证期'
                        ? 'text-slate-400'
                        : r.phaseLabel === '新手过渡期'
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    {r.phaseLabel}
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-slate-200">
                  ¥{r.grossIncome.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right text-slate-400">
                  -¥{monthlyLivingCost.toLocaleString()}
                </td>
                <td
                  className={`py-2 px-3 text-right font-semibold ${
                    r.monthlyNetChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {r.monthlyNetChange >= 0 ? '+' : ''}¥{r.monthlyNetChange.toLocaleString()}
                </td>
                <td
                  className={`py-2 px-3 text-right font-bold ${
                    r.diyBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ¥{r.diyBalance.toLocaleString()}
                </td>
                <td
                  className={`py-2 px-3 text-right ${
                    r.agencyBalance >= 0 ? 'text-slate-300' : 'text-rose-400 font-bold'
                  }`}
                >
                  ¥{r.agencyBalance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
