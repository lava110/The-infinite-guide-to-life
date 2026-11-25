import {
  type FreshnessMeta,
  type LinkHealthReportFile,
  type VerifiedPath,
  computeNextVerifyDue,
} from './schema.ts';
import rawLinkHealthReport from './linkHealthReport.json' with { type: 'json' };

export const LINK_HEALTH_REPORT = rawLinkHealthReport as unknown as LinkHealthReportFile;

export interface PathFreshnessPolicy {
  window_months: number[];
  verify_cycle_days: number;
  window_label?: string;
}

/**
 * 全库 33 条路径的结构化时效与报名窗口注册表
 * - window_months: [] 表示常年滚动开放；非空数组表示固定年度招生/网报/旺季核心月（1-12）
 * - verify_cycle_days: 商业平台 60 天、配额签证 90 天、年度招考/法定职业资格 180 天
 */
export const PATH_FRESHNESS_REGISTRY: Record<string, PathFreshnessPolicy> = {
  PATH_001: { window_months: [], verify_cycle_days: 180, window_label: '常年滚动招生（海事适任培训）' },
  PATH_002: { window_months: [], verify_cycle_days: 180, window_label: '常年按月考核（特检院 N1 叉车）' },
  PATH_003: { window_months: [4, 5, 6], verify_cycle_days: 180, window_label: '每年 4-6 月中考提前批简章与志愿' },
  PATH_004: { window_months: [5, 6], verify_cycle_days: 180, window_label: '每年 5-6 月高考提前批定向招生' },
  PATH_005: { window_months: [2, 3, 8, 9], verify_cycle_days: 120, window_label: '每年 2-3 月春季班 & 8-9 月主入学季' },
  PATH_006: { window_months: [4, 5, 6], verify_cycle_days: 180, window_label: '每年 4-6 月各省三支一扶/特岗招募' },
  PATH_007: { window_months: [], verify_cycle_days: 180, window_label: '全年每月批次考核（官网排号）' },
  PATH_008: { window_months: [], verify_cycle_days: 180, window_label: '常年按月考核（特检院 Q1/Q2 起重机）' },
  PATH_009: { window_months: [], verify_cycle_days: 180, window_label: '常年滚动报考（应急管理厅特种作业）' },
  PATH_010: { window_months: [2, 3], verify_cycle_days: 180, window_label: '每年 2-3 月人社补贴目录更新（全年招培）' },
  PATH_011: { window_months: [5, 6], verify_cycle_days: 180, window_label: '每年 5-6 月高考专科提前批定向军士' },
  PATH_012: { window_months: [6, 10, 11, 12], verify_cycle_days: 180, window_label: '每年 6 月高考招生 & 10-12 月铁路局校招' },
  PATH_013: { window_months: [3, 4], verify_cycle_days: 180, window_label: '每年 3-4 月农村三大专项网报（4月25日前）' },
  PATH_015: { window_months: [1, 2, 3, 6], verify_cycle_days: 180, window_label: '每年 1-3 月部队基层报名 & 6 月文化统考' },
  PATH_021: { window_months: [3, 4, 5], verify_cycle_days: 180, window_label: '每年 3-5 月全国西部计划网报' },
  PATH_023: { window_months: [7, 8], verify_cycle_days: 180, window_label: '每年 7-8 月国家消防员公开招录' },
  PATH_024: { window_months: [10, 11], verify_cycle_days: 180, window_label: '每年 10-11 月军队文职全军统考报名' },
  PATH_031: { window_months: [7, 8, 9, 10], verify_cycle_days: 90, window_label: '每年 7-10 月澳洲新财年 462 抽签季' },
  PATH_032: { window_months: [5, 6, 7], verify_cycle_days: 90, window_label: '每年 5-7 月新西兰 WHV 名额开放日' },
  PATH_034: { window_months: [4, 5, 6, 7, 8], verify_cycle_days: 150, window_label: '每年 4-8 月意大利预注册与 DSU 助学金季' },
  PATH_035: { window_months: [3, 4, 10, 11], verify_cycle_days: 120, window_label: '每年 3-4 月 & 10-11 月语合中心分批招募' },
  PATH_036: { window_months: [], verify_cycle_days: 120, window_label: '常年在线预审（德国外交部机会卡门户）' },
  PATH_041: { window_months: [], verify_cycle_days: 180, window_label: '常年法定受理（深圳个人破产 / 浙江债务清理）' },
  PATH_046: { window_months: [], verify_cycle_days: 180, window_label: '常年报考（TSG Z6002-2026 现行有效）' },
  PATH_054: { window_months: [], verify_cycle_days: 60, window_label: '商业平台动态任务池（每60天强制复核条款）' },
  PATH_056: { window_months: [], verify_cycle_days: 60, window_label: '每周一动态开放语种（每60天强制复核佣金）' },
  PATH_058: { window_months: [3, 4, 5, 7, 8, 9, 10], verify_cycle_days: 120, window_label: '常年考证（3-5月春耕 & 7-10月夏秋飞防旺季）' },
  PATH_060: { window_months: [1, 2, 3, 7], verify_cycle_days: 180, window_label: '每年 1-3 月网报 & 7 月执业兽医全国机考' },
  PATH_063: { window_months: [8, 10], verify_cycle_days: 180, window_label: '每年 8 月网报 & 10 月末注安师全国统考' },
  PATH_065: { window_months: [], verify_cycle_days: 120, window_label: '常年按工程节点公开社招（国资委招聘平台）' },
  PATH_066: { window_months: [], verify_cycle_days: 120, window_label: '常年按月滚动面试（海事持牌外派机构）' },
  PATH_067: { window_months: [2, 3, 8, 9, 10], verify_cycle_days: 180, window_label: '春秋征兵季（2-3/8-9月）& 9-10 月研招网报' },
  PATH_071: { window_months: [3, 5], verify_cycle_days: 180, window_label: '每年 3 月统考报名 & 5 月全国同等学力统考' },
};

export function hydratePathWithFreshness(path: VerifiedPath): VerifiedPath {
  const isCommercial = path.track_a_hard_facts.portal_tier === 'COMMERCIAL_FIRST_PARTY';
  const policy = PATH_FRESHNESS_REGISTRY[path.path_id] ?? {
    window_months: [],
    verify_cycle_days: isCommercial ? 60 : 180,
    window_label: path.policy_update_month || '常年开放',
  };

  const portalUrl = path.track_a_hard_facts.official_portal_url;
  const probeEntry = LINK_HEALTH_REPORT.results?.[portalUrl];

  const freshness_meta: FreshnessMeta = {
    window_months: policy.window_months,
    window_label: policy.window_label || path.policy_update_month || '常年开放',
    verify_cycle_days: policy.verify_cycle_days,
    next_verify_due: computeNextVerifyDue(path.last_verified_date, policy.verify_cycle_days),
    link_health: probeEntry
      ? {
          status: probeEntry.status,
          http_status: probeEntry.http_status,
          checked_at: LINK_HEALTH_REPORT.generated_at,
          final_url: probeEntry.final_url,
          latency_ms: probeEntry.latency_ms,
          note: probeEntry.note,
        }
      : {
          status: 'UNCHECKED',
          checked_at: LINK_HEALTH_REPORT.generated_at || '',
        },
  };

  return {
    ...path,
    freshness_meta,
  };
}
