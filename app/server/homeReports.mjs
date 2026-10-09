import 'server-only';
import { buildReportSummary } from '../shared/reportPresentation.mjs';

// Bound the home read independently of the database client's retry policy.
export async function loadHomeReports(load, timeoutMs = 2500) {
  const controller = new AbortController();
  let timer;
  const failed = { reports: [], loadFailed: true };
  try {
    const deadline = new Promise((resolve) => {
      timer = setTimeout(() => {
        controller.abort();
        resolve({ data: null, error: true });
      }, timeoutMs);
    });
    const { data, error } = await Promise.race([
      Promise.resolve().then(() => load(controller.signal)), deadline,
    ]);
    if (error) return failed;
    return { reports: (data ?? []).map(buildReportSummary), loadFailed: false };
  } catch {
    return failed;
  } finally {
    clearTimeout(timer);
  }
}
