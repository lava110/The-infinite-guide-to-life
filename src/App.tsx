/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  VERIFIED_PATHS,
  VerifiedPath,
  IdentityGroup,
  PathDomainId,
  PATH_DOMAINS,
  CoreGoalTag,
  parseUserSituationText,
  evaluatePathFit,
  evaluateFreshnessUrgency,
  isInActiveWindowMonth,
  isUpcomingWindowMonth,
  getEffectiveStatusLight,
} from './data/verifiedPaths';
import { CashflowSimulator } from './components/CashflowSimulator';
import { ComparisonMatrix, ProtocolInspector } from './components/ComparisonAndProtocol';
import { StudentPathPKMatrix } from './components/StudentPathPKMatrix';
import { AIAdvisorPanel } from './components/AIAdvisorPanel';
import {
  Search,
  RotateCcw,
  ExternalLink,
  CheckSquare,
  Copy,
  Check,
  X,
  Calculator,
  ArrowUpRight,
  Scale,
  ArrowRight,
  GraduationCap,
  LayoutList,
  Table as TableIcon,
  Sliders,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

type ActiveSection = 'EXPLORER' | 'AI_ADVISOR' | 'STUDENT_PK' | 'MATRIX' | 'CASHFLOW' | 'PROTOCOL';
type DrawerTab = 'NONE' | 'TRACK_A' | 'TRACK_B' | 'DIY_STEPS';
type IdentityFilter = 'ALL' | IdentityGroup;
type BrowseLayoutMode = 'CARDS' | 'COMPACT_TABLE';

const IDENTITY_OPTIONS: { id: IdentityFilter; label: string }[] = [
  { id: 'ALL', label: '全部年龄与身份' },
  { id: 'STUDENT_15_18', label: '15-18岁：中考/高考升学分流' },
  { id: 'YOUTH_18_35', label: '18-35岁：青年失业/负债重启' },
  { id: 'MIDLIFE_35_55', label: '35-55岁：中年被裁托底回血' },
  { id: 'SENIOR_50_PLUS', label: '50-60岁：大龄准入稳岗' },
];

const CORE_GOAL_OPTIONS: { id: CoreGoalTag | 'ALL'; label: string }[] = [
  { id: 'ALL', label: '不限核心目标' },
  { id: 'URGENT_30D_CASH', label: '30天极速见回头钱' },
  { id: 'SAVE_300K_3YR', label: '3年攒25-30万硬通货' },
  { id: 'DAILY_HOME_FAMILY', label: '每天下班回家顾家' },
  { id: 'BIAN_ZHI_STABLE', label: '拿事业编/央国企五险一金' },
  { id: 'STUDY_ON_DUTY', label: '坐班清闲可看书备考' },
];

const EXAMPLE_PROMPTS = [
  '27岁普通二本考公死在申论，想找不考申论、六险二金高薪的军队文职或三支一扶体制岗',
  '36岁全职妈妈重返职场/被裁，腰不好不能搬重物，想找室内轻体力吹空调坐班且考证有国家补贴的路子',
  '孩子15岁初三，中考预估在普高线边缘，家里拿不出25万读民办高中',
  '26岁失业负债18万，单身不用顾家，想找包吃住强制攒钱还债的路子',
];

const HIGH_FREQ_SEARCH_TAGS: {
  id: string;
  label: string;
  fillText: string;
  hint: string;
}[] = [
  {
    id: 'mom_return',
    label: '全职妈妈重返 · 室内轻体力',
    fillText: '36岁 全职妈妈重返 室内轻体力 吹空调坐班 不能搬重物 每天回家 消控 Q1指挥',
    hint: '触发消防四级监控、起重机Q1地面指挥等女性友好准入岗',
  },
  {
    id: 'no_shenlun',
    label: '不考申论 · 六险二金体制岗',
    fillText: '26岁 考公落榜 不考申论 六险二金 解放军文职 国铁机务 编制',
    hint: '触发解放军文职人员统考、国铁18局直招等体制高保障通道',
  },
  {
    id: 'kaoyan_plus10',
    label: '考研逆袭双证 · 士兵专项/西部计划+10分',
    fillText: '22岁 应届 考研失利 退役大学生士兵 士兵专项考研 名校硕士 考研加10分 四项目人员 西部计划 三支一扶 学费代偿',
    hint: '触发退役大学生士兵专项考研(降20-60分读985硕+攒20万退伍金)、大学生西部计划(考研+10分)',
  },
  {
    id: 'midlife_30d',
    label: '35+转型/在职申硕 · 注安师EHS/同等学力',
    fillText: '38岁被裁 中年转型 注册安全工程师 EHS 同等学力申硕 在职研究生 评职称 叉车N1 起重机Q2 低压电工',
    hint: '触发中级注册安全工程师(EHS护身符)、同等学力在职免试申硕(60分及格)、N1叉车、Q1/Q2起重机',
  },
  {
    id: 'debt_save300k',
    label: '包吃住零房租 · 邮轮海乘/央企驻外/船员攒钱',
    fillText: '27岁 负债还债 包吃住 强制攒钱 30万 豪华邮轮 海乘 皇家加勒比 央企海外 中国交建 中东 非洲 远洋船员 三甲免陪护理员 国家队消防员',
    hint: '触发国际豪华邮轮海乘(免税美金+小费)、中资央企海外项目部直招、远洋水手机工、三甲免陪护工',
  },
  {
    id: 'remote_usd',
    label: '居家赚美元 · AI标注/iTalki中文外教',
    fillText: '28岁 宝妈居家 数字游民 居家赚美元 AI标注 RLHF Outlier 国际中文教师 iTalki Preply 零成本居家创业',
    hint: '触发海外AI大模型RLHF评估专家(Outlier/DataAnnotation)、iTalki/Preply国际中文独立教师',
  },
  {
    id: 'overseas_zero_tuition',
    label: '个人全球化出海 · 德国机会卡/双元制/WHV',
    fillText: '28岁 个人全球化 低成本出海 德国机会卡 Chancenkarte 德国双元制 语合中心 公派海外 意大利免学费DSU助学金 澳洲WHV 新西兰WHV',
    hint: '触发德国机会卡(无需Offer赴德找工+每周20h兼职)、德国双元制、语合中心公派、意大利免学费+DSU、澳新WHV',
  },
  {
    id: 'waist_protect',
    label: '腰突保护 · 严禁搬运重物',
    fillText: '40岁 腰椎不好 不能搬重物 体力差 坐班 消控室监控 配电值守 Q1地面指挥',
    hint: '一票否决重体力搬运，优先置顶室内监控、地面指挥与值守岗',
  },
  {
    id: 'student_stream',
    label: '15-22岁低分高走 · 考军校/农村专项/入编',
    fillText: '18岁高考 部队考军校 大学生提干 农村专项 国家专项 公费定向医学生 中本贯通 定向培养军士',
    hint: '触发部队士兵考军校/提干(授少尉衔)、农村三大专项、公费定向医学生、中本贯通、定向军士',
  },
  {
    id: 'study_on_duty',
    label: '坐班可看书 · 在岗备考二战',
    fillText: '24岁 坐班清闲 看书备考 二战 消控室监控 消防设施操作员 西部计划',
    hint: '触发做一休一值守、室内监控等可在岗复习备考的过渡缓冲岗',
  },
  {
    id: 'color_blind_ok',
    label: '色盲色弱可报 · 体检不卡辨色',
    fillText: '色盲色弱 体检不卡 护理员 意大利留学 基层服务',
    hint: '自动剔除严禁色盲色弱的特种驾驶/航海/消防岗，保留不卡辨色力路径',
  },
];

export default function LifeUnlimitedExplorer() {
  // Top-level navigation & view mode
  const [activeSection, setActiveSection] = useState<ActiveSection>('EXPLORER');
  const [browseLayout, setBrowseLayout] = useState<BrowseLayoutMode>('CARDS');

  // 100+ Path Funnel Filters (Domain + Key Tags + Hard Redlines + Natural Language Situation Input)
  const [selectedDomain, setSelectedDomain] = useState<PathDomainId>('ALL');
  const [identityFilter, setIdentityFilter] = useState<IdentityFilter>('ALL');
  const [goalFilter, setGoalFilter] = useState<CoreGoalTag | 'ALL'>('ALL');
  const [maxBudget, setMaxBudget] = useState<number>(20000); // 自己手头可用总资金（启动与活命备用金）
  const [monthlyFamilyBurn, setMonthlyFamilyBurn] = useState<number>(2500); // 每月家庭刚性消耗资金（房租/还贷/抚养）
  const [strictBurnFilter, setStrictBurnFilter] = useState<boolean>(false); // 是否严格过滤掉“路径花费+准备期月消耗 > 手头总资金”的断粮路径
  const [maxPrepDays, setMaxPrepDays] = useState<number>(9999);
  const [sortNewestFirst, setSortNewestFirst] = useState<boolean>(true);
  const [windowFilter, setWindowFilter] = useState<'ALL' | 'ACTIVE_MONTH' | 'YEAR_ROUND'>('ALL');

  // Hard Constraint Toggles (一票否决开关)
  const [onlyFreeBoard, setOnlyFreeBoard] = useState<boolean>(false);
  const [onlyDailyHome, setOnlyDailyHome] = useState<boolean>(false);
  const [protectWaistNoHeavy, setProtectWaistNoHeavy] = useState<boolean>(false);
  const [colorBlindSafe, setColorBlindSafe] = useState<boolean>(false);

  // Supplemental Natural Language Situation Input (个人补充信息输入框)
  const [situationText, setSituationText] = useState<string>('');
  const [appendTagMode, setAppendTagMode] = useState<boolean>(false);

  // Card drawer states
  const [activeTabMap, setActiveTabMap] = useState<Record<string, DrawerTab>>({
    PATH_058: 'TRACK_B',
    PATH_060: 'TRACK_B',
    PATH_036: 'TRACK_B',
    PATH_066: 'TRACK_B',
  });

  // Adult PK Decision Matrix state (defaults to PATH_036 vs PATH_066 vs PATH_065, max 3 paths)
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([
    'PATH_036',
    'PATH_066',
    'PATH_065',
  ]);
  // Student & Campus Admission 8-Year PK Matrix state (defaults to 067退役士兵专项考研 + 013农村三大专项 + 021西部计划)
  const [selectedStudentCompareIds, setSelectedStudentCompareIds] = useState<string[]>([
    'PATH_067',
    'PATH_013',
    'PATH_021',
  ]);
  const [simulatorPathId, setSimulatorPathId] = useState<string>('PATH_036');

  // DIY Action Checklist Modal state
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [advisorAutoTriggerToken, setAdvisorAutoTriggerToken] = useState<number>(0);

  // Parse natural language situation text in real time
  const situationDiagnosis = useMemo(
    () => parseUserSituationText(situationText),
    [situationText]
  );

  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);
  const nextMonth = (currentMonth % 12) + 1;

  // 时效雷达统计：当月窗口、下月预告、常年随时启程、超期自动降级
  const freshnessRadar = useMemo(() => {
    const activeWindowPaths = VERIFIED_PATHS.filter((p) =>
      isInActiveWindowMonth(p.freshness_meta, currentMonth)
    );
    const upcomingWindowPaths = VERIFIED_PATHS.filter((p) =>
      isUpcomingWindowMonth(p.freshness_meta, currentMonth)
    );
    const yearRoundPaths = VERIFIED_PATHS.filter(
      (p) => (p.freshness_meta?.window_months.length ?? 0) === 0
    );
    const degradedPaths = VERIFIED_PATHS.filter(
      (p) => getEffectiveStatusLight(p).degraded
    );
    return {
      activeWindowPaths,
      upcomingWindowPaths,
      yearRoundPaths,
      degradedPaths,
    };
  }, [currentMonth]);

  // Filter and score all verified paths
  const scoredAndFilteredPaths = useMemo(() => {
    const hasSituationInput = situationText.trim().length > 0;

    const list = VERIFIED_PATHS.filter((p) => {
      const matchesDomain = selectedDomain === 'ALL' || p.domain === selectedDomain;
      const matchesIdentity =
        identityFilter === 'ALL' || p.identity_group.includes(identityFilter);
      const matchesGoal = goalFilter === 'ALL' || p.core_goals.includes(goalFilter);
      const matchesWindow =
        windowFilter === 'ALL' ||
        (windowFilter === 'ACTIVE_MONTH' && isInActiveWindowMonth(p.freshness_meta, currentMonth)) ||
        (windowFilter === 'YEAR_ROUND' && (p.freshness_meta?.window_months.length ?? 0) === 0);
      const costMin = p.track_a_hard_facts.official_zero_markup_cost_cny.total_min;
      const prepMonths = p.pk_profile.prep_months;
      const totalPrepAndFamilyBurn = Math.round(costMin + prepMonths * monthlyFamilyBurn);

      const matchesBudget = strictBurnFilter
        ? totalPrepAndFamilyBurn <= maxBudget
        : costMin <= maxBudget;
      const matchesDays =
        p.track_a_hard_facts.prep_duration_days.min <= maxPrepDays;
      const matchesBoard = !onlyFreeBoard || p.includes_free_board_lodging;
      const matchesHome = !onlyDailyHome || p.allows_daily_home;
      const matchesWaist = !protectWaistNoHeavy || !p.requires_heavy_lifting_or_waist;
      const matchesColorBlind =
        !colorBlindSafe ||
        !p.track_a_hard_facts.physical_constraints.some((c) => c.includes('无色盲'));

      return (
        matchesDomain &&
        matchesIdentity &&
        matchesGoal &&
        matchesWindow &&
        matchesBudget &&
        matchesDays &&
        matchesBoard &&
        matchesHome &&
        matchesWaist &&
        matchesColorBlind
      );
    }).map((path, idx) => {
      const fit = evaluatePathFit(path, situationDiagnosis, situationText);
      return { path, fit, originalIndex: idx };
    });

    if (hasSituationInput) {
      return [...list].sort((a, b) => b.fit.score - a.fit.score);
    }
    if (sortNewestFirst) {
      return [...list].sort((a, b) => {
        const dateCmp = b.path.last_verified_date.localeCompare(a.path.last_verified_date);
        if (dateCmp !== 0) return dateCmp;
        return b.originalIndex - a.originalIndex;
      });
    }
    return [...list].sort((a, b) => a.path.path_id.localeCompare(b.path.path_id));
  }, [
    selectedDomain,
    identityFilter,
    goalFilter,
    windowFilter,
    currentMonth,
    maxBudget,
    monthlyFamilyBurn,
    strictBurnFilter,
    maxPrepDays,
    sortNewestFirst,
    onlyFreeBoard,
    onlyDailyHome,
    protectWaistNoHeavy,
    colorBlindSafe,
    situationText,
    situationDiagnosis,
  ]);

  // Count per domain for the sidebar/top category directory
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: VERIFIED_PATHS.length };
    for (const d of PATH_DOMAINS) {
      if (d.id !== 'ALL') {
        counts[d.id] = VERIFIED_PATHS.filter((p) => p.domain === d.id).length;
      }
    }
    return counts;
  }, []);

  const toggleTab = (pathId: string, tab: DrawerTab) => {
    setActiveTabMap((prev) => ({
      ...prev,
      [pathId]: prev[pathId] === tab ? 'NONE' : tab,
    }));
  };

  // 成人转行 PK 最多支持 3 条路径同屏 PK，避免视觉信息过载
  const toggleCompareId = (pathId: string) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(pathId)) {
        return prev.filter((id) => id !== pathId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), pathId];
      }
      return [...prev, pathId];
    });
  };

  // 学生升学与应届专项 PK 最多支持 4 条同屏对比
  const toggleStudentCompareId = (pathId: string) => {
    setSelectedStudentCompareIds((prev) => {
      if (prev.includes(pathId)) {
        return prev.filter((id) => id !== pathId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), pathId];
      }
      return [...prev, pathId];
    });
  };

  const resetFilters = () => {
    setSelectedDomain('ALL');
    setIdentityFilter('ALL');
    setGoalFilter('ALL');
    setWindowFilter('ALL');
    setMaxBudget(20000);
    setMonthlyFamilyBurn(2500);
    setStrictBurnFilter(false);
    setMaxPrepDays(9999);
    setOnlyFreeBoard(false);
    setOnlyDailyHome(false);
    setProtectWaistNoHeavy(false);
    setColorBlindSafe(false);
    setSituationText('');
  };

  const handleJumpToSimulator = (pathId: string) => {
    setSimulatorPathId(pathId);
    setActiveSection('CASHFLOW');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToPathFromBlueprint = (pathId: string) => {
    resetFilters();
    setBrowseLayout('CARDS');
    setActiveTabMap((prev) => ({ ...prev, [pathId]: 'TRACK_A' }));
    setActiveSection('EXPLORER');
    setTimeout(() => {
      const el = document.getElementById(`card-${pathId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleOpenAIAdvisorWithContext = () => {
    setActiveSection('AI_ADVISOR');
    if (situationText.trim().length >= 6) {
      setAdvisorAutoTriggerToken((n) => n + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyActionPlan = (path: VerifiedPath) => {
    const text = [
      `【${path.path_id}】${path.title}`,
      `官方裸价硬成本：¥${path.track_a_hard_facts.official_zero_markup_cost_cny.total_min} - ¥${path.track_a_hard_facts.official_zero_markup_cost_cny.total_max}`,
      `唯一官方核验门户：${path.track_a_hard_facts.official_portal_name} (${path.track_a_hard_facts.official_portal_url})`,
      `头号劝退红线：${path.track_b_reality_slice.deal_breakers[0]}`,
      `防坑铁律：${path.track_b_reality_slice.anti_scam_mirror.scam_alert}`,
      `--- DIY 零中介费实操四步走 ---`,
      ...path.diy_action_steps,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(path.path_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const comparedPathsList = useMemo(
    () =>
      VERIFIED_PATHS.filter(
        (p) => p.pk_arena === 'ADULT_PK' && selectedCompareIds.includes(p.path_id)
      ),
    [selectedCompareIds]
  );

  const studentComparedPathsList = useMemo(
    () =>
      VERIFIED_PATHS.filter(
        (p) => p.pk_arena === 'STUDENT_PK' && selectedStudentCompareIds.includes(p.path_id)
      ),
    [selectedStudentCompareIds]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* 严格遵循三区契约的顶部导航栏 (Top Bar Contract) */}
      <header className="border-b border-slate-800/90 bg-slate-950/95 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Brand title, one line */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('EXPLORER');
            }}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            人生无限：地球漫游指南
          </a>

          {/* Zone 2: concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveSection('EXPLORER')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeSection === 'EXPLORER'
                  ? 'text-white border-b-2 border-emerald-400'
                  : ''
              }`}
            >
              破局沙盘总库 ({VERIFIED_PATHS.length})
            </button>
            <button
              onClick={() => setActiveSection('AI_ADVISOR')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-1 ${
                activeSection === 'AI_ADVISOR'
                  ? 'text-emerald-300 border-b-2 border-emerald-400'
                  : 'text-emerald-400/90'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 处境诊断</span>
            </button>
            <button
              onClick={() => setActiveSection('STUDENT_PK')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeSection === 'STUDENT_PK'
                  ? 'text-white border-b-2 border-blue-400'
                  : ''
              }`}
            >
              学生升学8年PK ({selectedStudentCompareIds.length}/4)
            </button>
            <button
              onClick={() => setActiveSection('MATRIX')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeSection === 'MATRIX'
                  ? 'text-white border-b-2 border-amber-400'
                  : ''
              }`}
            >
              成人转行PK ({selectedCompareIds.length}/3)
            </button>
            <button
              onClick={() => setActiveSection('CASHFLOW')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeSection === 'CASHFLOW'
                  ? 'text-white border-b-2 border-emerald-400'
                  : ''
              }`}
            >
              逐月现金流表
            </button>
            <button
              onClick={() => setActiveSection('PROTOCOL')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeSection === 'PROTOCOL'
                  ? 'text-white border-b-2 border-emerald-400'
                  : ''
              }`}
            >
              五阶流水线 & 巡检台账
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setIsChecklistOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              生成 DIY 行动核验单
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 顶部标题与宣言 */}
        <section className="mb-6 border-b border-slate-800 pb-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="text-emerald-400 font-semibold">
              L1-L5 分轨核验引擎 · 百条级模块化架构
            </span>
            <span aria-hidden="true">·</span>
            <span>五大一级赛道解耦入库</span>
            <span aria-hidden="true">·</span>
            <span>支持标签漏斗筛选 + 自然语言处境自述诊断</span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                《人生无限：地球漫游指南》多维处境破局沙盘
              </h1>
              <p className="text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
                先在下方点选你的<strong className="text-slate-200 font-medium">年龄身份、核心诉求与刚性红线</strong>，或在补充框内输入你的真实处境（如存款、家庭牵挂、身体限制），系统将从百条级分域路径库中实时过滤并置顶最匹配的活路。
              </p>
            </div>

            {/* 移动端视图切换器 */}
            <div className="flex md:hidden flex-wrap gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full">
              {[
                { id: 'EXPLORER', label: '沙盘总库' },
                { id: 'AI_ADVISOR', label: 'AI诊断' },
                { id: 'STUDENT_PK', label: `升学PK(${selectedStudentCompareIds.length})` },
                { id: 'MATRIX', label: `成人PK(${selectedCompareIds.length})` },
                { id: 'CASHFLOW', label: '现金流' },
                { id: 'PROTOCOL', label: '台账' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveSection(t.id as ActiveSection)}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition whitespace-nowrap ${
                    activeSection === t.id
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 视图分支 1：破局沙盘主界面（面向 100+ 路径的分域诊断漏斗架构） */}
        {activeSection === 'EXPLORER' && (
          <>
            {/* 第一层顶舱：关键选项标签组 + 补充信息自然语言诊断框 */}
            <section className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* 模块 A：个人处境补充输入框（Natural Language Situation Input） */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="situation-input"
                    className="text-xs font-bold text-emerald-400 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>
                      处境补充自述框（输入你的年龄、手头存款、家庭牵挂或身体限制，实时语义加权排序）：
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    {situationText && (
                      <button
                        type="button"
                        onClick={() => setSituationText('')}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>清空自述</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleOpenAIAdvisorWithContext}
                      className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>交给 AI 深度诊断当前处境 →</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    id="situation-input"
                    type="text"
                    value={situationText}
                    onChange={(e) => setSituationText(e.target.value)}
                    placeholder="例如：我今年38岁刚被裁，手头只有4000块，每天要接送孩子不能外地出差，腰不好不能搬重物..."
                    className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition"
                  />
                </div>

                {/* 高频搜索词云标签（点击自动填充到补充自述框，触发 L1-L5 语义核验引擎） */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-semibold">
                        高频搜索词云标签（点击自动填入上方自述框，触发 L1-L5 语义加权）：
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppendTagMode((prev) => !prev)}
                      className={`px-2 py-0.5 rounded border text-[11px] transition ${
                        appendTagMode
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {appendTagMode ? '当前模式：多标签叠加拼接' : '当前模式：单击直接填入（点此切换叠加）'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {HIGH_FREQ_SEARCH_TAGS.map((tag) => {
                      const isActive =
                        situationText.trim().length > 0 &&
                        (situationText.includes(tag.fillText) ||
                          situationText.includes(tag.label.split(' · ')[0]));
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            if (!appendTagMode) {
                              setSituationText(isActive && situationText === tag.fillText ? '' : tag.fillText);
                            } else {
                              if (situationText.includes(tag.fillText)) {
                                setSituationText(
                                  situationText
                                    .replace(tag.fillText, '')
                                    .replace(/\s+/g, ' ')
                                    .trim()
                                );
                              } else {
                                setSituationText((prev) =>
                                  prev.trim() ? `${prev.trim()} ${tag.fillText}` : tag.fillText
                                );
                              }
                            }
                          }}
                          title={tag.hint}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                              : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <span className={isActive ? 'text-emerald-400 font-bold' : 'text-amber-400/80'}>
                            #
                          </span>
                          <span>{tag.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 一键代入典型处境示例 */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                  <span className="text-slate-500 shrink-0">长句处境示例：</span>
                  {EXAMPLE_PROMPTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSituationText(sample)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition text-left truncate max-w-xs"
                      title={sample}
                    >
                      “{sample}”
                    </button>
                  ))}
                </div>

                {/* 实时语义解析出的信号反馈条 */}
                {situationDiagnosis.extractedSignals.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-emerald-400 font-semibold">
                      L1-L5 语义引擎已提取硬约束信号：
                    </span>
                    {situationDiagnosis.extractedSignals.map((sig, i) => (
                      <span
                        key={i}
                        className="text-slate-200 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 模块 B：四维关键标签点选矩阵 */}
              <div className="space-y-4">
                {/* 维度 1：人群与年龄段 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 w-28 shrink-0">
                    01. 年龄与身份：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {IDENTITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setIdentityFilter(opt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                          identityFilter === opt.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 维度 2：核心诉求目标 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 w-28 shrink-0">
                    02. 核心诉求：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CORE_GOAL_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setGoalFilter(opt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                          goalFilter === opt.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 维度 3：刚性红线排除（多选开关） */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 w-28 shrink-0">
                    03. 刚性底线：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setOnlyDailyHome((v) => !v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                        onlyDailyHome
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {onlyDailyHome ? '✓ 必须每天回家顾家' : '必须每天回家顾家'}
                    </button>
                    <button
                      onClick={() => setOnlyFreeBoard((v) => !v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                        onlyFreeBoard
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {onlyFreeBoard ? '✓ 仅看包吃住/免学费' : '仅看包吃住/免学费'}
                    </button>
                    <button
                      onClick={() => setProtectWaistNoHeavy((v) => !v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                        protectWaistNoHeavy
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {protectWaistNoHeavy ? '✓ 护腰椎/零重体力搬运' : '护腰椎/零重体力搬运'}
                    </button>
                    <button
                      onClick={() => setColorBlindSafe((v) => !v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                        colorBlindSafe
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {colorBlindSafe ? '✓ 色盲色弱可报' : '色盲色弱可报'}
                    </button>
                  </div>
                </div>

                {/* 维度 4 & 5 并列：手头可用总资金（自己有多少钱） VS 家庭月消耗资金（每月得花多少钱） */}
                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      <span>
                        三笔生死账底线联动：自己手头有多少资金 VS 脱产期家庭每月消耗多少 VS 路径本身花费多少
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400">资金处境一键代入：</span>
                      {[
                        { label: '极限断粮 (手头¥5k / 月耗¥3k)', budget: 5000, burn: 3000 },
                        { label: '常规家庭 (手头¥1.5w / 月耗¥3k)', budget: 15000, burn: 3000 },
                        { label: '稳健缓冲 (手头¥2w / 月耗¥2.5k)', budget: 20000, burn: 2500 },
                        { label: '单身轻装 (手头¥2w / 月耗¥0)', budget: 20000, burn: 0 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setMaxBudget(preset.budget);
                            setMonthlyFamilyBurn(preset.burn);
                          }}
                          className={`px-2.5 py-1 rounded border transition whitespace-nowrap shrink-0 ${
                            maxBudget === preset.budget && monthlyFamilyBurn === preset.burn
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 并列双滑块：左栏「启动/备用总资金硬底线」 + 右栏「家庭月消耗资金」 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800/90">
                      <label className="flex justify-between items-baseline text-xs font-medium text-slate-300 mb-2">
                        <span>04. 我手头可用总资金（启动与活命备用金硬底线）</span>
                        <span className="text-base text-emerald-400 font-mono font-bold tabular-nums">
                          ¥{maxBudget.toLocaleString()}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="2000"
                        max="50000"
                        step="1000"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono tabular-nums">
                        <span>¥2,000 (极度捉襟见肘)</span>
                        <span>¥15,000 (常规备用金)</span>
                        <span>¥50,000 (粮草充裕)</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800/90">
                      <label className="flex justify-between items-baseline text-xs font-medium text-slate-300 mb-2">
                        <span>05. 家庭月消耗资金（脱产期每月房租/还贷/抚养）</span>
                        <span className="text-base text-amber-400 font-mono font-bold tabular-nums">
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
                      <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono tabular-nums">
                        <span>¥0 (一人吃饱/家里托底)</span>
                        <span>¥2,500 (常规房租家用)</span>
                        <span>¥8,000 (高压房贷抚养)</span>
                      </div>
                    </div>
                  </div>

                  {/* 维度 6：断粮过滤模式开关 + 可承受准备周期上限 + 重置按钮 */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStrictBurnFilter((v) => !v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                          strictBurnFilter
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>
                          {strictBurnFilter
                            ? '✓ 已开启严格防断粮过滤：剔除「路径花费 + 准备期家庭月耗 > 手头总资金」的路径'
                            : '点击开启严格防断粮过滤（当前保留所有首期裸价 ≤ 手头资金的路径并标红断粮缺口）'}
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-400">
                          06. 准备周期上限：
                        </span>
                        {[
                          { label: '≤30天救急', days: 30 },
                          { label: '≤180天转行', days: 180 },
                          { label: '不限周期', days: 9999 },
                        ].map((btn) => (
                          <button
                            key={btn.days}
                            type="button"
                            onClick={() => setMaxPrepDays(btn.days)}
                            className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                              maxPrepDays === btn.days
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={resetFilters}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>重置全部条件</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 第二层：五大一级赛道目录栏 + “紧凑速览表 / 深度双轨卡片”切换器 */}
            <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {PATH_DOMAINS.map((dom) => {
                  const active = selectedDomain === dom.id;
                  return (
                    <button
                      key={dom.id}
                      onClick={() => setSelectedDomain(dom.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-slate-900 border-emerald-500 text-white'
                          : 'bg-slate-900/40 border-slate-800/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono text-[11px] text-emerald-400">{dom.code}</span>
                      <span>{dom.name}</span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        ({domainCounts[dom.id] || 0})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 视图密度切换、时效窗口快捷筛选与最新复核排序 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  命中 {scoredAndFilteredPaths.length} / {VERIFIED_PATHS.length} 条路径
                </span>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setWindowFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                      windowFilter === 'ALL'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    全部时效
                  </button>
                  <button
                    type="button"
                    onClick={() => setWindowFilter('ACTIVE_MONTH')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                      windowFilter === 'ACTIVE_MONTH'
                        ? 'bg-emerald-500/25 text-emerald-300'
                        : 'text-emerald-400/80 hover:text-emerald-300'
                    }`}
                  >
                    {currentMonth}月窗口 ({freshnessRadar.activeWindowPaths.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setWindowFilter('YEAR_ROUND')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                      windowFilter === 'YEAR_ROUND'
                        ? 'bg-blue-500/25 text-blue-200'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    常年随时启程 ({freshnessRadar.yearRoundPaths.length})
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSortNewestFirst((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition whitespace-nowrap shrink-0 ${
                    sortNewestFirst
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sortNewestFirst ? '✓ 按最新复核置顶' : '按编号正序 (001→071)'}
                </button>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setBrowseLayout('CARDS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                      browseLayout === 'CARDS'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span>深度双轨卡片</span>
                  </button>
                  <button
                    onClick={() => setBrowseLayout('COMPACT_TABLE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                      browseLayout === 'COMPACT_TABLE'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>百条高密速览表</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 时效雷达提醒条：当月黄金报名/招生窗口 + 下月提前预告 + 超期降级状态 */}
            {(freshnessRadar.activeWindowPaths.length > 0 ||
              freshnessRadar.upcomingWindowPaths.length > 0 ||
              freshnessRadar.degradedPaths.length > 0) && (
              <section className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {freshnessRadar.activeWindowPaths.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-emerald-400">
                        {currentMonth}月正值报名/招生窗口：
                      </span>
                      {freshnessRadar.activeWindowPaths.map((wp) => (
                        <button
                          key={wp.path_id}
                          type="button"
                          onClick={() => handleJumpToPathFromBlueprint(wp.path_id)}
                          className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 font-medium transition"
                        >
                          {wp.pk_profile.short_name}
                        </button>
                      ))}
                    </div>
                  )}
                  {freshnessRadar.upcomingWindowPaths.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                      <span aria-hidden="true">|</span>
                      <span>{nextMonth}月即将开启：</span>
                      {freshnessRadar.upcomingWindowPaths.slice(0, 3).map((up) => (
                        <button
                          key={up.path_id}
                          type="button"
                          onClick={() => handleJumpToPathFromBlueprint(up.path_id)}
                          className="text-blue-300 hover:text-blue-200 underline decoration-blue-500/40 underline-offset-2"
                        >
                          {up.pk_profile.short_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {freshnessRadar.degradedPaths.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setActiveSection('PROTOCOL')}
                      className="text-amber-300 hover:text-amber-200 font-semibold"
                    >
                      ⚠️ {freshnessRadar.degradedPaths.length} 条超复核期已自动降级 → 查看台账
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveSection('PROTOCOL')}
                      className="text-slate-400 hover:text-emerald-300 transition font-mono"
                    >
                      全库 {VERIFIED_PATHS.length} 条均在复核有效期内 →
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* 筛选结果为空时的兜底态 */}
            {scoredAndFilteredPaths.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <div className="text-base font-bold text-white">
                  当前组合筛选条件下暂无匹配路径
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  你勾选的刚性红线或启动资金上限较为严苛。点击下方按钮一键重置条件以查看全部 {VERIFIED_PATHS.length} 条核验路径。
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition"
                >
                  重置筛选并查看全部路径
                </button>
              </div>
            ) : browseLayout === 'COMPACT_TABLE' ? (
              /* 模式 A：百条级高密度速览表（一屏扫视 15-20 条，专门应对 100+ 路径扩容） */
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-4 font-semibold">代码</th>
                        <th className="py-3 px-4 font-semibold">路径名称与核心定位</th>
                        {situationText.trim() && (
                          <th className="py-3 px-4 font-semibold text-emerald-400">处境契合诊断</th>
                        )}
                        <th className="py-3 px-4 font-semibold text-right">官方裸价 (轨A)</th>
                        <th className="py-3 px-4 font-semibold text-right">准备周期</th>
                        <th className="py-3 px-4 font-semibold text-right">含家用总花费 (生死线)</th>
                        <th className="py-3 px-4 font-semibold text-right">转正/熟手月净入</th>
                        <th className="py-3 px-4 font-semibold">时效与窗口</th>
                        <th className="py-3 px-4 font-semibold">食宿/顾家属性</th>
                        <th className="py-3 px-4 font-semibold text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {scoredAndFilteredPaths.map(({ path, fit }) => {
                        const isCompared = selectedCompareIds.includes(path.path_id);
                        const isStudentCompared = selectedStudentCompareIds.includes(path.path_id);
                        const isStudentPath = path.pk_arena === 'STUDENT_PK';
                        const costMin = path.track_a_hard_facts.official_zero_markup_cost_cny.total_min;
                        const prepMonths = path.pk_profile.prep_months;
                        const totalNeed = Math.round(costMin + prepMonths * monthlyFamilyBurn);
                        const isSafe = maxBudget >= totalNeed;
                        const effStatus = getEffectiveStatusLight(path);
                        const inWindow = isInActiveWindowMonth(path.freshness_meta, currentMonth);
                        return (
                          <tr
                            key={path.path_id}
                            className="hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                              {path.path_id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white text-sm">{path.title}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                头号劝退：{path.track_b_reality_slice.deal_breakers[0]}
                              </div>
                            </td>
                            {situationText.trim() && (
                              <td className="py-3 px-4">
                                <div
                                  className={`font-mono font-bold ${
                                    fit.conflictWarnings.length > 0
                                      ? 'text-rose-400'
                                      : 'text-emerald-400'
                                  }`}
                                >
                                  契合度 {fit.score}%
                                </div>
                                {fit.conflictWarnings.length > 0 ? (
                                  <div className="text-[11px] text-rose-300">
                                    ⚠️ {fit.conflictWarnings[0]}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-emerald-300">
                                    ✓ {fit.matchReasons[0] || '符合底线要求'}
                                  </div>
                                )}
                              </td>
                            )}
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                              ¥{path.track_a_hard_facts.official_zero_markup_cost_cny.total_min.toLocaleString()} -{' '}
                              {path.track_a_hard_facts.official_zero_markup_cost_cny.total_max.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                              {path.track_a_hard_facts.prep_duration_days.min}-
                              {path.track_a_hard_facts.prep_duration_days.max}天
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                              <div className={isSafe ? 'font-bold text-emerald-300' : 'font-bold text-rose-400'}>
                                ¥{totalNeed.toLocaleString()}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {isSafe
                                  ? `✓ 余 +¥${(maxBudget - totalNeed).toLocaleString()}`
                                  : `🚨 差 -¥${(totalNeed - maxBudget).toLocaleString()}`}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 tabular-nums whitespace-nowrap">
                              ¥{path.track_b_reality_slice.net_income_stages[1].monthly_cny_range[0].toLocaleString()} -{' '}
                              {path.track_b_reality_slice.net_income_stages[1].monthly_cny_range[1].toLocaleString()}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div
                                className={
                                  effStatus.degraded
                                    ? 'text-amber-300 font-semibold'
                                    : inWindow
                                      ? 'text-emerald-300 font-semibold'
                                      : 'text-slate-300'
                                }
                              >
                                {effStatus.degraded
                                  ? '⚠️ 超期降级'
                                  : inWindow
                                    ? `${currentMonth}月核心窗口`
                                    : (path.freshness_meta?.window_months.length ?? 0) === 0
                                      ? '常年随时启程'
                                      : `${path.freshness_meta?.window_months.join('/')}月窗口`}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500">
                                {path.track_a_hard_facts.portal_tier === 'COMMERCIAL_FIRST_PARTY'
                                  ? '商业一手源'
                                  : '法定一手源'}
                                {path.freshness_meta?.next_verify_due
                                  ? ` · 效期至 ${path.freshness_meta.next_verify_due.slice(5)}`
                                  : ''}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                              <span>{path.allows_daily_home ? '每天回家' : '驻船/驻场'}</span>
                              <span className="mx-1 text-slate-600">·</span>
                              <span>
                                {path.includes_free_board_lodging ? '包吃住/免学费' : '食宿自理'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                              <button
                                onClick={() => {
                                  setBrowseLayout('CARDS');
                                  setActiveTabMap((prev) => ({
                                    ...prev,
                                    [path.path_id]: 'TRACK_A',
                                  }));
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition"
                              >
                                详情
                              </button>
                              {isStudentPath ? (
                                <button
                                  onClick={() => toggleStudentCompareId(path.path_id)}
                                  className={`px-2.5 py-1 rounded font-medium border transition ${
                                    isStudentCompared
                                      ? 'bg-blue-500/25 border-blue-400 text-blue-200'
                                      : 'bg-blue-950/40 border-blue-500/40 text-blue-300 hover:text-white'
                                  }`}
                                >
                                  {isStudentCompared ? '✓ 已在升学PK' : '+ 升学PK'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleCompareId(path.path_id)}
                                  className={`px-2.5 py-1 rounded font-medium border transition ${
                                    isCompared
                                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {isCompared ? '✓ 已在成人PK' : '+ 成人PK'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* 模式 B：深度双轨卡片列表 */
              <main className="space-y-6">
                {scoredAndFilteredPaths.map(({ path, fit }) => {
                  const currentTab = activeTabMap[path.path_id] || 'NONE';
                  const costMin =
                    path.track_a_hard_facts.official_zero_markup_cost_cny.total_min;
                  const costMax =
                    path.track_a_hard_facts.official_zero_markup_cost_cny.total_max;
                  const agencyMin =
                    path.track_b_reality_slice.anti_scam_mirror.typical_agency_quote_cny[0];
                  const agencyMax =
                    path.track_b_reality_slice.anti_scam_mirror.typical_agency_quote_cny[1];
                  const isCompared = selectedCompareIds.includes(path.path_id);
                  const isStudentCompared = selectedStudentCompareIds.includes(path.path_id);
                  const isStudentPath = path.pk_arena === 'STUDENT_PK';
                  const effectiveStatus = getEffectiveStatusLight(path);

                  return (
                    <article
                      id={`card-${path.path_id}`}
                      key={path.path_id}
                      className={`bg-slate-900 border rounded-2xl overflow-hidden transition ${
                        effectiveStatus.degraded
                          ? 'border-amber-500/50 hover:border-amber-400/70'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* 超复核截止日自动降级告警条 */}
                      {effectiveStatus.degraded && (
                        <div className="px-6 py-2 bg-amber-950/50 border-b border-amber-500/30 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
                          <span>
                            <strong className="text-amber-400">⚠️ 时效自动降级：</strong>
                            {effectiveStatus.degradeReason}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveSection('PROTOCOL')}
                            className="text-amber-300 hover:text-amber-100 underline whitespace-nowrap"
                          >
                            查看全库巡检台账 →
                          </button>
                        </div>
                      )}

                      {/* 当用户输入了补充自述时，顶部显示实时处境契合度与冲突预警条 */}
                      {situationText.trim().length > 0 && (
                        <div
                          className={`px-6 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-2 ${
                            fit.conflictWarnings.length > 0
                              ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                              : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold">
                              处境匹配度 {fit.score}%
                            </span>
                            {fit.matchReasons.map((r, idx) => (
                              <span key={idx} className="text-emerald-300">
                                · ✓ {r}
                              </span>
                            ))}
                            {fit.conflictWarnings.map((w, idx) => (
                              <span
                                key={idx}
                                className="text-rose-300 font-semibold flex items-center gap-1"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{w}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 第一级：卡片概览态（3秒扫视核心底牌） */}
                      <div className="p-6">
                        {/* 零胶囊静态元数据行 (Zero-Pill Metadata Discipline) */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                          <div className="flex flex-wrap items-center gap-2 text-slate-400">
                            <span className="font-mono font-semibold text-slate-200">
                              {path.path_id}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                effectiveStatus.effectiveLight === 'GREEN'
                                  ? 'text-emerald-400 font-medium'
                                  : 'text-amber-400 font-medium'
                              }
                            >
                              {effectiveStatus.degraded
                                ? `已超期降级 · 上次复核 ${path.last_verified_date}`
                                : effectiveStatus.effectiveLight === 'GREEN'
                                  ? `绿灯正常 · 结构校验通过（人工复核 ${path.last_verified_date}）`
                                  : `黄灯配额预警 · 结构校验通过（人工复核 ${path.last_verified_date}）`}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                path.track_a_hard_facts.portal_tier === 'COMMERCIAL_FIRST_PARTY'
                                  ? 'text-amber-300 font-semibold'
                                  : 'text-blue-300 font-medium'
                              }
                            >
                              {path.track_a_hard_facts.portal_tier === 'COMMERCIAL_FIRST_PARTY'
                                ? '商业平台一手条款（无国家法定兜底）'
                                : '政府/法定机构一手源'}
                            </span>
                            {path.freshness_meta && isInActiveWindowMonth(path.freshness_meta) && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-emerald-300 font-semibold">
                                  本月正值核心报名/窗口月
                                </span>
                              </>
                            )}
                            {path.freshness_meta && (() => {
                              const { urgency } = evaluateFreshnessUrgency(path.freshness_meta.next_verify_due);
                              return (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span
                                    className={
                                      urgency === 'EXPIRED'
                                        ? 'text-rose-400 font-semibold'
                                        : urgency === 'DUE_SOON'
                                          ? 'text-amber-300 font-medium'
                                          : 'text-slate-400'
                                    }
                                  >
                                    {urgency === 'EXPIRED'
                                      ? `待重新核验（截止 ${path.freshness_meta.next_verify_due}）`
                                      : `下次重验 ${path.freshness_meta.next_verify_due}`}
                                  </span>
                                </>
                              );
                            })()}
                            {path.policy_update_month && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-slate-300">
                                  巡检窗口：{path.policy_update_month}
                                </span>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span>
                              适用：{path.scenario_tags.join(' / ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">
                              {path.category.map((cat) => `#${cat}`).join(' · ')}
                            </span>
                            {isStudentPath ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => toggleStudentCompareId(path.path_id)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition whitespace-nowrap shrink-0 ${
                                    isStudentCompared
                                      ? 'bg-blue-500/25 border-blue-400 text-blue-200'
                                      : 'bg-slate-800 border-blue-500/40 text-blue-300 hover:bg-blue-950/60 hover:text-white'
                                  }`}
                                >
                                  {isStudentCompared ? '✓ 已在升学PK台' : '+ 加入升学PK'}
                                </button>
                                <button
                                  onClick={() => {
                                    if (!isStudentCompared) {
                                      toggleStudentCompareId(path.path_id);
                                    }
                                    setActiveSection('STUDENT_PK');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30 transition whitespace-nowrap shrink-0"
                                >
                                  看升学8年PK →
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => toggleCompareId(path.path_id)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition whitespace-nowrap shrink-0 ${
                                  isCompared
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                              >
                                {isCompared ? '✓ 已在成人PK台' : '+ 加入成人PK'}
                              </button>
                            )}
                          </div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-4">
                          {path.title}
                        </h2>

                        {/* 四宫格核心指标对比 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
                            <div className="text-xs text-slate-400 mb-1">
                              路径官方裸价花费 (轨A)
                            </div>
                            <div className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                              ¥{costMin.toLocaleString()} - {costMax.toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
                            <div className="text-xs text-slate-400 mb-1">
                              {isStudentPath ? '报考/录取窗口期' : '脱产拿证/准备周期'}
                            </div>
                            <div className="text-base font-bold text-white font-mono tabular-nums">
                              {path.track_a_hard_facts.prep_duration_days.min} -{' '}
                              {path.track_a_hard_facts.prep_duration_days.max} 天 (≈
                              {path.pk_profile.prep_months}个月)
                            </div>
                          </div>
                          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
                            <div className="text-xs text-slate-400 mb-1">
                              {isStudentPath ? '毕业转正/入编月净入' : '熟手期月净收入 (轨B)'}
                            </div>
                            <div className="text-base font-bold text-amber-400 font-mono tabular-nums">
                              ¥
                              {path.track_b_reality_slice.net_income_stages[1].monthly_cny_range[0].toLocaleString()}{' '}
                              -{' '}
                              {path.track_b_reality_slice.net_income_stages[1].monthly_cny_range[1].toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
                            <div className="text-xs text-slate-400 mb-1">
                              硬性准入底线
                            </div>
                            <div className="text-sm font-semibold text-slate-200 truncate font-mono tabular-nums">
                              {path.track_a_hard_facts.age_min}-
                              {path.track_a_hard_facts.age_max}岁 ·{' '}
                              <span className="font-sans">
                                {path.track_a_hard_facts.education_min}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 三笔资金生死账实时核算条：手头总资金 vs (路径花费 + 准备期家庭月消耗) */}
                        {(() => {
                          const prepMonths = path.pk_profile.prep_months;
                          const familyPrepBurn = Math.round(prepMonths * monthlyFamilyBurn);
                          const totalBurnNeeded = costMin + familyPrepBurn;
                          const bufferLeft = maxBudget - totalBurnNeeded;
                          const isSafe = bufferLeft >= 0;

                          return (
                            <div
                              className={`rounded-xl px-4 py-2.5 mb-3 border text-xs flex flex-wrap items-center justify-between gap-2 ${
                                isSafe
                                  ? 'bg-emerald-950/25 border-emerald-500/30 text-slate-200'
                                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                              }`}
                            >
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono tabular-nums">
                                <span
                                  className={`font-sans font-bold ${
                                    isSafe ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {isSafe ? '✓ 不断粮校验通过：' : '🚨 半路断粮预警：'}
                                </span>
                                <span>
                                  路径最低花费 <strong className="text-white">¥{costMin.toLocaleString()}</strong>
                                </span>
                                <span>+</span>
                                <span>
                                  准备期家庭消耗 <strong className="text-amber-300">¥{familyPrepBurn.toLocaleString()}</strong>{' '}
                                  <span className="text-slate-400">
                                    ({prepMonths}个月 × ¥{monthlyFamilyBurn.toLocaleString()}/月)
                                  </span>
                                </span>
                                <span>=</span>
                                <span>
                                  见回头钱前共需 <strong className="text-white">¥{totalBurnNeeded.toLocaleString()}</strong>
                                </span>
                              </div>

                              <div className="font-mono font-bold tabular-nums">
                                {isSafe ? (
                                  <span className="text-emerald-300">
                                    对比你手头 ¥{maxBudget.toLocaleString()} → 还剩 +¥
                                    {bufferLeft.toLocaleString()} 安全缓冲
                                  </span>
                                ) : (
                                  <span className="text-rose-300">
                                    对比你手头 ¥{maxBudget.toLocaleString()} → 资金缺口 -¥
                                    {Math.abs(bufferLeft).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* 置顶头号劝退红线 */}
                        <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl px-4 py-3 mb-5 flex items-start justify-between gap-4">
                          <p className="text-xs text-rose-200/90 leading-relaxed">
                            <strong className="text-rose-400 font-semibold">
                              头号劝退红线：
                            </strong>
                            {path.track_b_reality_slice.deal_breakers[0]}
                          </p>
                          <button
                            onClick={() =>
                              isStudentPath
                                ? setActiveSection('STUDENT_PK')
                                : handleJumpToSimulator(path.path_id)
                            }
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium whitespace-nowrap shrink-0 flex items-center gap-1"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>{isStudentPath ? '8年家庭总账推演' : '逐月现金流表'}</span>
                          </button>
                        </div>

                        {/* 双轨切换触发器 + DIY 四步行动清单抽屉按钮 */}
                        <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-800/80">
                          <button
                            onClick={() => toggleTab(path.path_id, 'TRACK_A')}
                            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-2 whitespace-nowrap ${
                              currentTab === 'TRACK_A'
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>
                              轨 A：法定硬事实与官方裸价单 (
                              {path.track_a_hard_facts.l1_l2_sources.length}项 L1/L2 铁证)
                            </span>
                            <span>{currentTab === 'TRACK_A' ? '▲' : '▼'}</span>
                          </button>

                          <button
                            onClick={() => toggleTab(path.path_id, 'TRACK_B')}
                            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-2 whitespace-nowrap ${
                              currentTab === 'TRACK_B'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>
                              轨 B：真实收入阶梯 · 劝退清单 · 黑中介照妖镜
                            </span>
                            <span>{currentTab === 'TRACK_B' ? '▲' : '▼'}</span>
                          </button>

                          <button
                            onClick={() => toggleTab(path.path_id, 'DIY_STEPS')}
                            className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-2 whitespace-nowrap ${
                              currentTab === 'DIY_STEPS'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>DIY 零中介实操四步走</span>
                            <span>{currentTab === 'DIY_STEPS' ? '▲' : '▼'}</span>
                          </button>
                        </div>
                      </div>

                      {/* 第二级：轨 A 展开抽屉（L1/L2 法定硬事实） */}
                      {currentTab === 'TRACK_A' && (
                        <div className="bg-slate-950 border-t border-blue-500/30 p-6 space-y-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h3
                                className={`text-sm font-bold ${
                                  path.track_a_hard_facts.portal_tier === 'COMMERCIAL_FIRST_PARTY'
                                    ? 'text-amber-400'
                                    : 'text-blue-400'
                                }`}
                              >
                                {path.track_a_hard_facts.portal_tier === 'COMMERCIAL_FIRST_PARTY'
                                  ? '轨 A：商业平台一手条款与涉税规则（非国家法定保障，平台可随时调整佣金或封禁）'
                                  : '轨 A：政策硬事实（已按 ≥2 独立官方源交叉核验 · 人工复核于 ' +
                                    path.last_verified_date +
                                    '）'}
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                身体/前置硬性条件：{path.track_a_hard_facts.physical_constraints.join(' · ')}
                              </p>
                              {path.freshness_meta?.link_health && path.freshness_meta.link_health.status !== 'UNCHECKED' && (
                                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                                  官网链路最近实测（{path.freshness_meta.link_health.checked_at}）：
                                  <span
                                    className={
                                      path.freshness_meta.link_health.status === 'HEALTHY' ||
                                      path.freshness_meta.link_health.status === 'REDIRECTED'
                                        ? 'text-emerald-400 ml-1'
                                        : path.freshness_meta.link_health.status === 'RESTRICTED_BOT'
                                          ? 'text-amber-300 ml-1'
                                          : 'text-rose-400 ml-1'
                                    }
                                  >
                                    {path.freshness_meta.link_health.status === 'HEALTHY'
                                      ? `HTTP ${path.freshness_meta.link_health.http_status} 正常可达`
                                      : path.freshness_meta.link_health.status === 'REDIRECTED'
                                        ? `HTTP ${path.freshness_meta.link_health.http_status} 重定向可达`
                                        : path.freshness_meta.link_health.status === 'RESTRICTED_BOT'
                                          ? `政务/站点防爬拦截 (${path.freshness_meta.link_health.http_status}) · 请浏览器直访`
                                          : `连接超时或阻断 (${path.freshness_meta.link_health.note || '请浏览器核实'})`}
                                  </span>
                                </p>
                              )}
                            </div>
                            <a
                              href={path.track_a_hard_facts.official_portal_url}
                              target="_blank"
                              rel="noreferrer"
                              className={`px-3.5 py-2 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                                path.track_a_hard_facts.portal_tier === 'COMMERCIAL_FIRST_PARTY'
                                  ? 'bg-amber-600 hover:bg-amber-500'
                                  : 'bg-blue-600 hover:bg-blue-500'
                              }`}
                            >
                              <span>
                                {path.track_a_hard_facts.portal_tier === 'COMMERCIAL_FIRST_PARTY'
                                  ? `直达商业平台一手入口：${path.track_a_hard_facts.official_portal_name}`
                                  : `直达官方唯一核验门户：${path.track_a_hard_facts.official_portal_name}`}
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 官方裸价拆解表 */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                              <div className="text-xs font-semibold text-slate-400 mb-3">
                                法定零加价硬成本明细（DIY 基准尺）
                              </div>
                              <div className="space-y-2">
                                {path.track_a_hard_facts.official_zero_markup_cost_cny.breakdown.map(
                                  (b, i) => (
                                    <div
                                      key={i}
                                      className="flex justify-between text-xs border-b border-slate-800/60 pb-2"
                                    >
                                      <span className="text-slate-300">{b.item}</span>
                                      <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                                        ¥{b.cost_cny}
                                      </span>
                                    </div>
                                  )
                                )}
                                <div className="flex justify-between text-xs pt-1 font-bold">
                                  <span className="text-slate-200">官方 DIY 裸价总计区间</span>
                                  <span className="font-mono text-emerald-400 tabular-nums">
                                    ¥{costMin.toLocaleString()} - ¥{costMax.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* L1/L2 证据链列表 */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                              <div className="text-xs font-semibold text-slate-400 mb-3">
                                交叉核验法定证据链（L1/L2）
                              </div>
                              <ul className="space-y-2.5">
                                {path.track_a_hard_facts.l1_l2_sources.map((src, i) => (
                                  <li key={i} className="text-xs flex items-start gap-2.5">
                                    <span className="font-mono font-bold text-blue-400 shrink-0 mt-0.5">
                                      [{src.level}]
                                    </span>
                                    <div className="min-w-0">
                                      <div className="text-slate-200 font-medium flex flex-wrap items-center gap-1.5">
                                        {src.source_url ? (
                                          <a
                                            href={src.source_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:text-blue-300 underline decoration-blue-500/40 underline-offset-2 inline-flex items-center gap-1"
                                          >
                                            <span>{src.doc_name}</span>
                                            <ArrowUpRight className="w-3 h-3 shrink-0 text-blue-400" />
                                          </a>
                                        ) : (
                                          <span>{src.doc_name}</span>
                                        )}
                                      </div>
                                      <div className="text-slate-500 text-[11px]">
                                        发文/执行机关：{src.authority}
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 第三级：轨 B 展开抽屉（体感切片与黑中介照妖镜） */}
                      {currentTab === 'TRACK_B' && (
                        <div className="bg-slate-950 border-t border-amber-500/30 p-6 space-y-6">
                          {/* 强制分轨黄底声明 */}
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5 text-xs text-amber-200">
                            <strong className="font-semibold">分轨核验声明：</strong>
                            {path.track_b_reality_slice.mandatory_disclaimer}
                          </div>

                          {/* 真实到手现金流三阶梯 */}
                          <div>
                            <h4 className="text-xs font-semibold text-slate-400 mb-3">
                              真实到手净现金流演进阶梯（破除“一上岗即高薪”假象）
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {path.track_b_reality_slice.net_income_stages.map(
                                (st, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-slate-900 border border-slate-800 p-4 rounded-xl"
                                  >
                                    <div className="text-xs text-slate-400 mb-1">
                                      阶段 {idx + 1}：{st.stage}
                                    </div>
                                    <div className="text-lg font-bold font-mono text-amber-400 mb-1 tabular-nums">
                                      ¥{st.monthly_cny_range[0].toLocaleString()} -{' '}
                                      {st.monthly_cny_range[1].toLocaleString()}/月
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {st.highlight}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* 完整劝退红线清单 */}
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <div className="text-xs font-semibold text-rose-400 mb-2.5">
                              L5 伤痕实证：完整生理 / 心理 / 契约锁定期劝退红线（必读）
                            </div>
                            <ul className="space-y-2 text-xs text-slate-300">
                              {path.track_b_reality_slice.deal_breakers.map((db, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="font-mono text-rose-400 font-bold shrink-0">
                                    0{i + 1}.
                                  </span>
                                  <span>{db}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 黑中介照妖镜尺子 */}
                          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4">
                            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                              <span className="text-xs font-bold text-rose-400">
                                黑中介“照妖镜”成本基准对比尺
                              </span>
                              <span className="text-xs font-mono text-rose-300 tabular-nums">
                                黑产信息差溢价高达{' '}
                                {Math.max(2, Math.round(agencyMax / Math.max(600, costMax)))} 倍以上
                              </span>
                            </div>

                            <div className="space-y-2.5 mb-3">
                              <div className="flex items-center gap-3 text-xs">
                                <span className="w-36 text-emerald-400 font-medium shrink-0">
                                  官方 DIY 裸价成本：
                                </span>
                                <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full rounded-full"
                                    style={{
                                      width: `${Math.max(
                                        10,
                                        Math.min(
                                          100,
                                          Math.round((Math.max(500, costMax) / agencyMax) * 100)
                                        )
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="w-32 text-right font-mono text-emerald-400 font-bold tabular-nums shrink-0">
                                  ¥{costMin.toLocaleString()} - {costMax.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="w-36 text-rose-400 font-medium shrink-0">
                                  黑中介常见打包报价：
                                </span>
                                <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden">
                                  <div className="bg-rose-500 h-full w-full rounded-full" />
                                </div>
                                <span className="w-32 text-right font-mono text-rose-400 font-bold tabular-nums shrink-0">
                                  ¥{agencyMin.toLocaleString()} - {agencyMax.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-rose-200/90 bg-rose-950/40 p-3 rounded-lg border border-rose-500/20 leading-relaxed">
                              <strong className="text-rose-300 font-semibold">
                                防坑铁律：
                              </strong>
                              {path.track_b_reality_slice.anti_scam_mirror.scam_alert}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 第四级：DIY 零中介实操四步走抽屉 */}
                      {currentTab === 'DIY_STEPS' && (
                        <div className="bg-slate-950 border-t border-emerald-500/30 p-6 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-emerald-400">
                                DIY 零中介费实操闭环四步走（绕过一切黄牛与招转培）
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                照此步骤直接对接国家法定考试院/考试中心与公办院校，立省 ¥
                                {Math.max(1000, agencyMin - costMax).toLocaleString()} - ¥
                                {(agencyMax - costMin).toLocaleString()} 智商税
                              </p>
                            </div>
                            <button
                              onClick={() => copyActionPlan(path)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
                            >
                              {copiedId === path.path_id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300">已复制行动卡片</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>复制完整避坑行动单</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {path.diy_action_steps.map((step, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed"
                              >
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </main>
            )}
          </>
        )}

        {/* 视图分支 1.5：受控 AI 个性化处境诊断顾问（严格限定于 33 条已核验路径库） */}
        {activeSection === 'AI_ADVISOR' && (
          <AIAdvisorPanel
            totalPathsCount={VERIFIED_PATHS.length}
            situationText={situationText}
            onChangeSituationText={setSituationText}
            budgetCny={maxBudget}
            onChangeBudgetCny={setMaxBudget}
            monthlyFamilyBurn={monthlyFamilyBurn}
            onChangeMonthlyFamilyBurn={setMonthlyFamilyBurn}
            dailyHome={onlyDailyHome}
            onToggleDailyHome={() => setOnlyDailyHome((v) => !v)}
            freeBoard={onlyFreeBoard}
            onToggleFreeBoard={() => setOnlyFreeBoard((v) => !v)}
            protectWaist={protectWaistNoHeavy}
            onToggleProtectWaist={() => setProtectWaistNoHeavy((v) => !v)}
            colorBlindSafe={colorBlindSafe}
            onToggleColorBlindSafe={() => setColorBlindSafe((v) => !v)}
            autoTriggerToken={advisorAutoTriggerToken}
            selectedAdultCompareIds={selectedCompareIds}
            selectedStudentCompareIds={selectedStudentCompareIds}
            onToggleAdultCompare={toggleCompareId}
            onToggleStudentCompare={toggleStudentCompareId}
            onJumpToCard={handleJumpToPathFromBlueprint}
            onJumpToSimulator={handleJumpToSimulator}
          />
        )}

        {/* 视图分支 2：学生升学与高校应届专项 · 8年家庭总账推演沙盘 */}
        {activeSection === 'STUDENT_PK' && (
          <StudentPathPKMatrix
            selectedStudentIds={selectedStudentCompareIds}
            onToggleStudentId={toggleStudentCompareId}
            onSetStudentIds={setSelectedStudentCompareIds}
            onJumpToCard={handleJumpToPathFromBlueprint}
          />
        )}

        {/* 视图分支 3：成人转行并排 PK 决策天平（断粮爆仓压力测试 + 1-3年净攒钱反转） */}
        {activeSection === 'MATRIX' && (
          <ComparisonMatrix
            paths={VERIFIED_PATHS}
            selectedCompareIds={selectedCompareIds}
            onToggleCompareId={toggleCompareId}
            onSetCompareIds={setSelectedCompareIds}
            onJumpToSimulator={handleJumpToSimulator}
            liquidSavings={maxBudget}
            onChangeLiquidSavings={setMaxBudget}
            monthlyFamilyBurn={monthlyFamilyBurn}
            onChangeMonthlyFamilyBurn={setMonthlyFamilyBurn}
          />
        )}

        {/* 视图分支 4：12个月生存现金流与回本推演沙盘 */}
        {activeSection === 'CASHFLOW' && (
          <CashflowSimulator
            paths={VERIFIED_PATHS}
            selectedPathId={simulatorPathId}
            onSelectPath={setSimulatorPathId}
          />
        )}

        {/* 视图分支 5：L1-L5 五阶防伪生产流水线 · Zod 入库守卫与 50 卡批次蓝图 */}
        {activeSection === 'PROTOCOL' && (
          <ProtocolInspector
            paths={VERIFIED_PATHS}
            onJumpToPath={handleJumpToPathFromBlueprint}
          />
        )}
      </div>

      {/* 底部悬浮对比坞（Sticky Compare Dock）：清晰分流“学生升学PK槽”与“成人转行PK槽” */}
      {activeSection === 'EXPLORER' &&
        (comparedPathsList.length > 0 || studentComparedPathsList.length > 0) && (
          <div className="fixed bottom-4 inset-x-0 z-20 px-4 pointer-events-none">
            <div className="max-w-5xl mx-auto bg-slate-900/95 backdrop-blur border border-slate-700/90 rounded-xl px-4 py-2.5 shadow-2xl flex items-center justify-between gap-4 pointer-events-auto">
              <div className="flex items-center gap-3 overflow-x-auto">
                {studentComparedPathsList.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-semibold text-blue-400 whitespace-nowrap flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>升学PK ({studentComparedPathsList.length}/4):</span>
                    </span>
                    {studentComparedPathsList.map((p) => (
                      <span
                        key={p.path_id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-950/50 border border-blue-500/40 rounded-lg text-xs text-blue-200 whitespace-nowrap shrink-0"
                      >
                        <span className="font-mono text-blue-300">{p.pk_profile.short_name}</span>
                        <button
                          onClick={() => toggleStudentCompareId(p.path_id)}
                          className="text-blue-400 hover:text-rose-400 ml-0.5"
                          title="移出升学PK槽"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {comparedPathsList.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-semibold text-amber-400 whitespace-nowrap flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      <span>成人PK ({comparedPathsList.length}/3):</span>
                    </span>
                    {comparedPathsList.map((p) => (
                      <span
                        key={p.path_id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 whitespace-nowrap shrink-0"
                      >
                        <span className="font-mono text-emerald-400">{p.pk_profile.short_name}</span>
                        <button
                          onClick={() => toggleCompareId(p.path_id)}
                          className="text-slate-500 hover:text-rose-400 ml-0.5"
                          title="移出成人PK槽"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setActiveSection('STUDENT_PK');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hidden sm:flex px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold rounded-lg transition items-center gap-1 whitespace-nowrap"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>学生升学8年PK ({studentComparedPathsList.length})</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection('MATRIX');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>成人转行PK ({comparedPathsList.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

      {/* 极简页脚 */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-900 text-xs text-slate-500 flex flex-wrap justify-between gap-4">
        <div>
          《人生无限：地球漫游指南》破局沙盘 · 所有轨 A 法定标准均挂载教育部/海事/特检/应急官方核验门户
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSection('STUDENT_PK')}
            className="hover:text-slate-300 transition"
          >
            15-18岁升学分流8年沙盘
          </button>
          <button
            onClick={() => setActiveSection('PROTOCOL')}
            className="hover:text-slate-300 transition"
          >
            查阅 L1-L5 核验标准
          </button>
          <button
            onClick={() => setIsChecklistOpen(true)}
            className="hover:text-slate-300 transition"
          >
            导出 DIY 行动清单
          </button>
        </div>
      </footer>

      {/* DIY 行动核验单弹窗 (Modal) */}
      {isChecklistOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  DIY 零中介费行动核验单（当前匹配 {scoredAndFilteredPaths.length} 条路径）
                </h2>
              </div>
              <button
                onClick={() => setIsChecklistOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 text-emerald-200 leading-relaxed">
                <strong>防坑自检三原则：</strong>
                1. 升学路径 100% 走省教育考试院中考/高考提前批官网填报，严禁相信“花8万买内部点招指标”；
                2. 职业路径认准官方 .gov.cn / .cn 门户，凡要求办理分期贷或交“包上岗押金”一律拉黑；
                3. 备足至少 3-6 个月新手低薪期的家庭生活费缓冲再启动脱产。
              </div>

              {scoredAndFilteredPaths.map(({ path: p }) => (
                <div
                  key={p.path_id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="font-bold text-sm text-white">
                      <span className="font-mono text-emerald-400 mr-2">{p.path_id}</span>
                      {p.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={p.track_a_hard_facts.official_portal_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>{p.track_a_hard_facts.official_portal_name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => copyActionPlan(p)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition"
                      >
                        {copiedId === p.path_id ? '✓ 已复制' : '复制此单'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-slate-300 tabular-nums">
                    <div>
                      官方裸价：
                      <span className="text-emerald-400 font-bold">
                        ¥{p.track_a_hard_facts.official_zero_markup_cost_cny.total_min}-
                        {p.track_a_hard_facts.official_zero_markup_cost_cny.total_max}
                      </span>
                    </div>
                    <div>
                      准备周期：{p.track_a_hard_facts.prep_duration_days.min}-
                      {p.track_a_hard_facts.prep_duration_days.max}天
                    </div>
                    <div>
                      转正/熟手月净入：
                      <span className="text-amber-400 font-bold">
                        ¥{p.track_b_reality_slice.net_income_stages[1].monthly_cny_range[0]}-
                        {p.track_b_reality_slice.net_income_stages[1].monthly_cny_range[1]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    {p.diy_action_steps.map((s, i) => (
                      <div key={i} className="leading-relaxed">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
