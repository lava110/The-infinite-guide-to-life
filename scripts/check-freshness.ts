import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { VERIFIED_PATHS, evaluateFreshnessUrgency, isInActiveWindowMonth } from '../src/data/verifiedPaths.ts';
import type { LinkHealthReportFile } from '../src/data/schema.ts';

function runStep(label: string, scriptPath: string): number {
  console.log(`\n▶ ${label}`);
  const result = spawnSync('npx', ['tsx', scriptPath], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status ?? 1;
}

function main() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const currentMonth = today.getMonth() + 1;

  console.log('='.repeat(76));
  console.log(`🛰️  月度路径时效与官方链接联合巡检 (${dateStr} · 共 ${VERIFIED_PATHS.length} 条)`);
  console.log('='.repeat(76));

  const linkExit = runStep('阶段 1/2：实测全库官方门户链接健康度 (scripts/check-links.ts)', 'scripts/check-links.ts');
  const auditExit = runStep('阶段 2/2：执行全库 Schema、白名单与时效硬门禁审计 (scripts/audit-paths.ts)', 'scripts/audit-paths.ts');

  // 重新读取刚写入的最新 linkHealthReport.json（避免使用进程启动时的旧快照）
  const reportPath = path.resolve(process.cwd(), 'src/data/linkHealthReport.json');
  let latestReport: LinkHealthReportFile | null = null;
  if (fs.existsSync(reportPath)) {
    try {
      latestReport = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as LinkHealthReportFile;
    } catch {
      latestReport = null;
    }
  }

  const expiredPaths: string[] = [];
  const dueSoonPaths: string[] = [];
  const unreachablePaths: string[] = [];
  const activeWindowPaths: string[] = [];

  for (const p of VERIFIED_PATHS) {
    const meta = p.freshness_meta;
    if (meta) {
      const { urgency, daysRemaining } = evaluateFreshnessUrgency(meta.next_verify_due, today);
      if (urgency === 'EXPIRED') {
        expiredPaths.push(
          `${p.path_id} (${p.pk_profile.short_name})：已超期 ${Math.abs(daysRemaining)} 天（原定 ${meta.next_verify_due} 重验）`
        );
      } else if (urgency === 'DUE_SOON') {
        dueSoonPaths.push(
          `${p.path_id} (${p.pk_profile.short_name})：剩余 ${daysRemaining} 天到期（截止 ${meta.next_verify_due}）`
        );
      }
      if (isInActiveWindowMonth(meta, currentMonth)) {
        activeWindowPaths.push(`${p.path_id} (${p.pk_profile.short_name}) - ${meta.window_label}`);
      }
    }

    const latestLink = latestReport?.results[p.track_a_hard_facts.official_portal_url];
    if (latestLink?.status === 'UNREACHABLE') {
      unreachablePaths.push(
        `${p.path_id} (${p.pk_profile.short_name})：${p.track_a_hard_facts.official_portal_url} [${latestLink.note || latestLink.http_status || 'UNREACHABLE'}]`
      );
    }
  }

  console.log('\n' + '='.repeat(76));
  console.log('📋 巡检结论与告警判定');
  console.log('='.repeat(76));
  console.log(`- 当月 (${currentMonth} 月) 正值窗口期路径：${activeWindowPaths.length} 条`);
  for (const item of activeWindowPaths) {
    console.log(`  • ${item}`);
  }

  const hasAlerts =
    linkExit !== 0 ||
    auditExit !== 0 ||
    expiredPaths.length > 0 ||
    dueSoonPaths.length > 0 ||
    unreachablePaths.length > 0;

  if (hasAlerts) {
    console.log('\n🚨 触发月度巡检告警：发现以下待人工核验项');
    if (auditExit !== 0) {
      console.log(`- [Schema 门禁异常] audit-paths.ts 退出码 ${auditExit}`);
    }
    if (linkExit !== 0) {
      console.log(`- [链路探测异常] check-links.ts 退出码 ${linkExit}`);
    }
    if (expiredPaths.length > 0) {
      console.log(`- [已超期自动降级 (${expiredPaths.length} 条)]`);
      for (const item of expiredPaths) console.log(`  • ${item}`);
    }
    if (dueSoonPaths.length > 0) {
      console.log(`- [30天内即将到期 (${dueSoonPaths.length} 条)]`);
      for (const item of dueSoonPaths) console.log(`  • ${item}`);
    }
    if (unreachablePaths.length > 0) {
      console.log(`- [官网链接不可达/超时 (${unreachablePaths.length} 条，部分国内政务网可能存在海外机房阻断，请浏览器抽检)]`);
      for (const item of unreachablePaths) console.log(`  • ${item}`);
    }
  } else {
    console.log('\n✅ 全部路径时效有效、Schema 零报错、官方门户链路无不可达项。');
  }

  // 仅当硬性 Schema 审计或探测脚本本身崩溃时返回非 0；普通超期/海外链路超时正常退出以便自动提交快照并创建告警 Issue
  if (auditExit !== 0 || linkExit !== 0) {
    process.exit(1);
  }
}

main();
