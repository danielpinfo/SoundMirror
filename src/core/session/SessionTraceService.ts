// Reporting-only wrapper (must not control behavior)
export class SessionTraceService {
  push(_event: string, _payload: any) {}
}