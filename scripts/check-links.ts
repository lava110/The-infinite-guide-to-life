import fs from 'node:fs';
import path from 'node:path';
import { VERIFIED_PATHS } from '../src/data/verifiedPaths';
import type {
  LinkHealthReportEntry,
  LinkHealthReportFile,
  LinkHealthStatus,
} from '../src/data/schema';

const REQUEST_TIMEOUT_MS = 10_000;
const CONCURRENCY = 6;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// 常见的政务网/海外反爬 WAF 状态码（含国内政务云 CT2-WAAP 对非浏览器 GET 返回的 405，并非页面不存在，需人工浏览器抽检确认）
const BOT_WAF_STATUSES = new Set([401, 403, 405, 406, 412, 418, 429, 451, 521]);

async function fetchWithTimeout(url: string, method: 'HEAD' | 'GET') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function probeUrl(url: string, usedByPaths: string[]): Promise<LinkHealthReportEntry> {
  const started = Date.now();
  try {
    let response = await fetchWithTimeout(url, 'HEAD');
    // 很多政府官网不支持 HEAD 或对 HEAD 返回 403/405/501，自动降级用 GET 探测响应头
    if (response.status === 405 || response.status === 501 || response.status === 403 || response.status === 400) {
      try {
        response = await fetchWithTimeout(url, 'GET');
      } catch {
        // 保留首次响应
      }
    }

    const latencyMs = Date.now() - started;
    const finalUrl = response.url || url;
    const httpStatus = response.status;

    let status: LinkHealthStatus;
    let note: string | undefined;

    if (httpStatus >= 200 && httpStatus < 300) {
      const normalizedOrig = url.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      const normalizedFinal = finalUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      if (normalizedFinal !== normalizedOrig) {
        status = 'REDIRECTED';
        note = `已重定向至 ${finalUrl}`;
      } else {
        status = 'HEALTHY';
      }
    } else if (BOT_WAF_STATUSES.has(httpStatus)) {
      status = 'RESTRICTED_BOT';
      note = `返回 HTTP ${httpStatus}（常见政务/Cloudflare 防爬拦截，请浏览器人工复核）`;
    } else {
      status = 'UNREACHABLE';
      note = `HTTP ${httpStatus} ${response.statusText || ''}`.trim();
    }

    // 主动释放连接体
    try {
      await response.body?.cancel();
    } catch {
      // ignore
    }

    return {
      url,
      status,
      http_status: httpStatus,
      final_url: finalUrl !== url ? finalUrl : undefined,
      latency_ms: latencyMs,
      note,
      used_by_paths: usedByPaths,
    };
  } catch (err) {
    const latencyMs = Date.now() - started;
    const rawMsg =
      err instanceof Error
        ? err.name === 'AbortError'
          ? `请求超时 (>${REQUEST_TIMEOUT_MS / 1000}s)`
          : err.cause && typeof err.cause === 'object' && 'code' in err.cause
            ? `${err.message} (${String((err.cause as { code?: unknown }).code)})`
            : err.message
        : String(err);

    return {
      url,
      status: 'UNREACHABLE',
      latency_ms: latencyMs,
      note: rawMsg,
      used_by_paths: usedByPaths,
    };
  }
}

async function runPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function next() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await worker(items[idx]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
  return results;
}

async function main() {
  const includeSources = process.argv.includes('--all-sources');
  const urlMap = new Map<string, Set<string>>();

  for (const p of VERIFIED_PATHS) {
    const portal = p.track_a_hard_facts.official_portal_url;
    if (!urlMap.has(portal)) urlMap.set(portal, new Set());
    urlMap.get(portal)!.add(p.path_id);

    if (includeSources) {
      for (const src of p.track_a_hard_facts.l1_l2_sources) {
        if (src.source_url) {
          if (!urlMap.has(src.source_url)) urlMap.set(src.source_url, new Set());
          urlMap.get(src.source_url)!.add(p.path_id);
        }
      }
    }
  }

  const targets = Array.from(urlMap.entries()).map(([url, set]) => ({
    url,
    paths: Array.from(set).sort(),
  }));

  console.log(`\n🌐 开始真实 HTTP 巡检（共 ${targets.length} 个去重官方门户URL · 并发 ${CONCURRENCY}）...\n`);

  const probed = await runPool(targets, CONCURRENCY, async (t) => {
    const entry = await probeUrl(t.url, t.paths);
    const icon =
      entry.status === 'HEALTHY'
        ? '✅'
        : entry.status === 'REDIRECTED'
          ? '↪️'
          : entry.status === 'RESTRICTED_BOT'
            ? '🛡️'
            : '🔴';
    console.log(
      `  ${icon} [${entry.status.padEnd(14)}] ${String(entry.http_status ?? 'ERR').padStart(3)}  ${String(entry.latency_ms ?? 0).padStart(5)}ms  ${entry.url}  (${entry.used_by_paths.join(', ')})`
    );
    if (entry.note) {
      console.log(`     └─ ${entry.note}`);
    }
    return entry;
  });

  const summary = {
    HEALTHY: 0,
    REDIRECTED: 0,
    RESTRICTED_BOT: 0,
    UNREACHABLE: 0,
  };
  const resultsRecord: Record<string, LinkHealthReportEntry> = {};

  for (const entry of probed) {
    if (entry.status !== 'UNCHECKED') {
      summary[entry.status]++;
    }
    resultsRecord[entry.url] = entry;
  }

  const report: LinkHealthReportFile = {
    generated_at: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    total_urls: probed.length,
    summary,
    results: resultsRecord,
  };

  const outPath = path.resolve(process.cwd(), 'src/data/linkHealthReport.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log('\n' + '='.repeat(76));
  console.log(`📝 巡检报告已写入: src/data/linkHealthReport.json`);
  console.log(
    `   ✅ 正常可达: ${summary.HEALTHY} | ↪️ 重定向可达: ${summary.REDIRECTED} | 🛡️ 防爬拦截(需浏览器确认): ${summary.RESTRICTED_BOT} | 🔴 不可达/超时: ${summary.UNREACHABLE}`
  );
  console.log('='.repeat(76));
}

main().catch((err) => {
  console.error('❌ 巡检脚本异常退出:', err);
  process.exit(1);
});
