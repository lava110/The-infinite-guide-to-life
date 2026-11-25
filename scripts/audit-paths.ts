import fs from 'node:fs';
import path from 'node:path';
import { VERIFIED_PATHS, evaluateFreshnessUrgency, isInActiveWindowMonth } from '../src/data/verifiedPaths';
import {
  validateCandidateCard,
  validateFullVerifiedPath,
  isPortalUrlValidForTier,
} from '../src/data/ingestionGuard';
import { PATH_FRESHNESS_REGISTRY, LINK_HEALTH_REPORT } from '../src/data/freshnessRegistry';

function printHeader(title: string) {
  console.log('\n' + '='.repeat(76));
  console.log(title);
  console.log('='.repeat(76));
}

function auditCandidateFile(filePath: string) {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ 找不到候选 JSON 文件: ${resolved}`);
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch (err) {
    console.error(`❌ JSON 语法解析失败:`, err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const items = Array.isArray(parsed) ? parsed : [parsed];
  const existingIds = new Set(VERIFIED_PATHS.map((p) => p.path_id));
  const seenInBatch = new Set<string>();

  printHeader(`🛡️  候选路径入库前置闸门校验 (${path.basename(resolved)} · 共 ${items.length} 条)`);

  let failedCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>;
    const idLabel = typeof item?.path_id === 'string' ? item.path_id : `#${i + 1}`;
    const res = validateCandidateCard(item);
    const errors = [...res.errors];

    if (typeof item?.path_id === 'string') {
      if (existingIds.has(item.path_id)) {
        errors.push({ path: 'path_id', message: `与现有库内路径 ${item.path_id} 重号（若是更新请确认覆盖）` });
      }
      if (seenInBatch.has(item.path_id)) {
        errors.push({ path: 'path_id', message: `同一候选文件中出现重复编号 ${item.path_id}` });
      }
      seenInBatch.add(item.path_id);
    }

    if (errors.length === 0) {
      console.log(`  ✅ [${idLabel}] 通过 PathCardMasterSchema & 分轨域名白名单校验`);
    } else {
      failedCount++;
      console.log(`  ❌ [${idLabel}] 拦截 (${errors.length} 项错误):`);
      for (const e of errors) {
        console.log(`     - [${e.path}] ${e.message}`);
      }
    }
  }

  console.log('\n' + '-'.repeat(76));
  if (failedCount > 0) {
    console.error(`🚨 闸门拦截：${failedCount}/${items.length} 条候选路径未通过校验，禁止合入！`);
    process.exit(1);
  }
  console.log(`✅ 全部 ${items.length}/${items.length} 条候选路径通过入库前门禁！`);
}

function auditProductionDatabase() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  printHeader(
    `🛡️  全库生产路径严格审计 (${VERIFIED_PATHS.length} 条 · 基准日期 ${today.toISOString().slice(0, 10)})`
  );

  const seenIds = new Set<string>();
  let hardFailures = 0;
  let expiredCount = 0;
  let dueSoonCount = 0;
  let unreachablePortalCount = 0;
  let missingRegistryCount = 0;
  const activeWindowIds: string[] = [];

  for (const p of VERIFIED_PATHS) {
    const issues: string[] = [];

    if (seenIds.has(p.path_id)) {
      issues.push(`重复 path_id: ${p.path_id}`);
    }
    seenIds.add(p.path_id);

    if (!PATH_FRESHNESS_REGISTRY[p.path_id]) {
      missingRegistryCount++;
      issues.push(`未在 freshnessRegistry.ts 中登记窗口月与复核周期`);
    }

    const fullCheck = validateFullVerifiedPath(p);
    if (!fullCheck.passed) {
      for (const err of fullCheck.errors) {
        issues.push(`[${err.path}] ${err.message}`);
      }
    }

    const tier = p.track_a_hard_facts.portal_tier ?? 'STATUTORY_GOV';
    if (!isPortalUrlValidForTier(p.track_a_hard_facts.official_portal_url, tier)) {
      issues.push(`门户域名未通过 ${tier} 白名单校验: ${p.track_a_hard_facts.official_portal_url}`);
    }

    const meta = p.freshness_meta;
    if (meta) {
      const { urgency, daysRemaining } = evaluateFreshnessUrgency(meta.next_verify_due, today);
      if (urgency === 'EXPIRED') {
        expiredCount++;
        console.log(
          `  ⚠️  [${p.path_id}] 已超复核截止日 ${Math.abs(daysRemaining)} 天 (截止 ${meta.next_verify_due})`
        );
      } else if (urgency === 'DUE_SOON') {
        dueSoonCount++;
        console.log(
          `  ⏳ [${p.path_id}] 即将到期复核（剩余 ${daysRemaining} 天 · 截止 ${meta.next_verify_due}）`
        );
      }

      if (isInActiveWindowMonth(meta, currentMonth)) {
        activeWindowIds.push(`${p.path_id} (${p.pk_profile.short_name})`);
      }

      if (meta.link_health?.status === 'UNREACHABLE') {
        unreachablePortalCount++;
        console.log(
          `  🔴 [${p.path_id}] 官网链接不可达: ${p.track_a_hard_facts.official_portal_url} (${meta.link_health.note || meta.link_health.http_status})`
        );
      }
    }

    if (issues.length > 0) {
      hardFailures++;
      console.error(`  ❌ [${p.path_id}] ${p.title}`);
      for (const msg of issues) {
        console.error(`     - ${msg}`);
      }
    }
  }

  const statutoryCount = VERIFIED_PATHS.filter(
    (p) => (p.track_a_hard_facts.portal_tier ?? 'STATUTORY_GOV') === 'STATUTORY_GOV'
  ).length;
  const commercialCount = VERIFIED_PATHS.length - statutoryCount;

  console.log('\n📊 审计汇总：');
  console.log(`   - 全量生产路径：${VERIFIED_PATHS.length} 条（政府/法定一手源 ${statutoryCount} · 商业平台一手源 ${commercialCount}）`);
  console.log(`   - 全字段 Schema + 白名单 + 唯一性硬门禁：${hardFailures === 0 ? '✅ 100% 通过' : `❌ ${hardFailures} 条失败`}`);
  console.log(`   - 时效注册表覆盖：${VERIFIED_PATHS.length - missingRegistryCount}/${VERIFIED_PATHS.length}`);
  console.log(`   - 复核时效状态：已超期 ${expiredCount} 条 | 30天内到期 ${dueSoonCount} 条`);
  console.log(
    `   - 官网链路健康快照：${LINK_HEALTH_REPORT.generated_at ? `上次实测 ${LINK_HEALTH_REPORT.generated_at}（不可达 ${unreachablePortalCount} 条）` : '尚未执行 npm run check:links'}`
  );
  console.log(`   - 当前 ${currentMonth} 月正值招生/网报/作业窗口 (${activeWindowIds.length} 条)：`);
  if (activeWindowIds.length > 0) {
    for (const label of activeWindowIds) {
      console.log(`     • ${label}`);
    }
  } else {
    console.log('     • 无固定月份限定窗口（均为常年滚动开放）');
  }

  if (hardFailures > 0) {
    console.error('\n🚨 存在硬性门禁错误，请修复后再合入！');
    process.exit(1);
  }

  console.log('\n✅ 全库生产路径审计通过（FullVerifiedPathSchema 锁死校验 0 报错）。');
}

const candidateArg = process.argv[2];
if (candidateArg) {
  auditCandidateFile(candidateArg);
} else {
  auditProductionDatabase();
}
