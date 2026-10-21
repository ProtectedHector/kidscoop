/**
 * The browser side of login-failure handling. `showLoginProblem()` tells the visitor (through
 * <LoginProblemNotice>), `reportLoginFailure()` tells the server, which emails the admin.
 */
import type { ClientAlertKind, LoginProblem } from '@/features/auth/model/alert-kinds';

const EVENT = 'kidzcoop:login-problem';

export function showLoginProblem(problem: LoginProblem) {
  window.dispatchEvent(new CustomEvent<LoginProblem>(EVENT, { detail: problem }));
}

export function onLoginProblem(listener: (problem: LoginProblem) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<LoginProblem>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

const reported = new Set<string>();

/** Sends one report per kind and detail per page load. Fire-and-forget. */
export function reportLoginFailure(kind: ClientAlertKind, detail?: string) {
  const key = `${kind}:${detail ?? ''}`;
  if (reported.has(key)) return;
  reported.add(key);

  void fetch('/api/alerts/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, detail }),
    keepalive: true,
  }).catch(() => null);
}
