import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VERIFIED_PATHS } from './src/data/verifiedPaths.ts';
import {
  AdvisorServiceError,
  DiagnoseRequestSchema,
  FollowUpRequestSchema,
  answerFollowUpQuestion,
  diagnoseUserSituation,
} from './server/advisorService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_INDEX = path.resolve(__dirname, 'dist', 'index.html');
const IS_PROD =
  process.env.NODE_ENV === 'production' ||
  (process.env.NODE_ENV !== 'development' && fs.existsSync(DIST_INDEX));
const PORT = IS_PROD ? Number(process.env.PORT) || 3000 : 3000;

// Lightweight per-IP sliding-window rate limiter for AI endpoints (20 req / 5 min)
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX_REQUESTS = 20;
const ipHits = new Map<string, number[]>();

function advisorRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  if (ipHits.size > 500) {
    for (const [key, hits] of ipHits.entries()) {
      const fresh = hits.filter((t) => now - t < RATE_WINDOW_MS);
      if (fresh.length === 0) ipHits.delete(key);
      else ipHits.set(key, fresh);
    }
  }
  const timestamps = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_MAX_REQUESTS) {
    res.status(429).json({
      error: '请求过于频繁，请稍候 1 分钟再继续使用 AI 处境诊断。',
      code: 'RATE_LIMITED',
    });
    return;
  }
  timestamps.push(now);
  ipHits.set(ip, timestamps);
  next();
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // Security headers (preserve iframe embedding compatibility for AI Studio preview)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '32kb' }));

  // Health & capability probe (never reveals secrets)
  app.get('/api/health', (_req, res) => {
    const key = process.env.GEMINI_API_KEY?.trim();
    res.json({
      ok: true,
      pathsCount: VERIFIED_PATHS.length,
      aiConfigured: Boolean(key && key !== 'MY_GEMINI_API_KEY'),
    });
  });

  // Grounded AI Situation Diagnosis endpoint (JSON)
  app.post('/api/advisor/diagnose', advisorRateLimit, async (req, res) => {
    const parsed = DiagnoseRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || '请求参数校验失败，请检查填写内容。',
        code: 'INVALID_INPUT',
      });
      return;
    }

    try {
      const result = await diagnoseUserSituation(parsed.data);
      res.json(result);
    } catch (err) {
      if (err instanceof AdvisorServiceError) {
        const safeStatus = [403, 502, 503, 504].includes(err.status) ? 500 : err.status;
        res.status(safeStatus).json({ error: err.message, code: err.code });
        return;
      }
      res.status(500).json({
        error: '服务端处理诊断请求时发生异常，请稍后重试。',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  // Grounded AI Situation Diagnosis endpoint (SSE stream with heartbeat to avoid proxy/VPN idle timeout)
  app.post('/api/advisor/diagnose-stream', advisorRateLimit, async (req, res) => {
    const parsed = DiagnoseRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || '请求参数校验失败，请检查填写内容。',
        code: 'INVALID_INPUT',
      });
      return;
    }

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const writeEvent = (event: string, data: unknown) => {
      if (res.writableEnded) return;
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    let closed = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        closed = true;
      }
    });

    writeEvent('status', {
      message: `已接入核验台账，正在逐条比对 ${VERIFIED_PATHS.length} 条路径的年龄、体检与断粮账…`,
    });

    const heartbeat = setInterval(() => {
      if (closed || res.writableEnded) return;
      writeEvent('ping', { ts: Date.now() });
    }, 2000);

    try {
      const result = await diagnoseUserSituation(parsed.data);
      if (!closed && !res.writableEnded) {
        writeEvent('result', result);
      }
    } catch (err) {
      if (!closed && !res.writableEnded) {
        if (err instanceof AdvisorServiceError) {
          writeEvent('error', { error: err.message, code: err.code });
        } else {
          writeEvent('error', {
            error: '服务端处理诊断请求时发生异常，请稍后重试。',
            code: 'INTERNAL_ERROR',
          });
        }
      }
    } finally {
      clearInterval(heartbeat);
      if (!res.writableEnded) {
        res.end();
      }
    }
  });

  // Grounded AI Follow-Up Q&A endpoint
  app.post('/api/advisor/followup', advisorRateLimit, async (req, res) => {
    const parsed = FollowUpRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || '追问参数校验失败。',
        code: 'INVALID_INPUT',
      });
      return;
    }

    try {
      const result = await answerFollowUpQuestion(parsed.data);
      res.json(result);
    } catch (err) {
      if (err instanceof AdvisorServiceError) {
        const safeStatus = [403, 502, 503, 504].includes(err.status) ? 500 : err.status;
        res.status(safeStatus).json({ error: err.message, code: err.code });
        return;
      }
      res.status(500).json({
        error: '服务端处理追问请求时发生异常，请稍后重试。',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  // Return JSON 404 for unknown /api routes
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found', code: 'NOT_FOUND' });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[server] Running on http://0.0.0.0:${PORT} (${IS_PROD ? 'production' : 'dev+vite'}) · ${VERIFIED_PATHS.length} verified paths`
    );
  });
}

startServer().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
