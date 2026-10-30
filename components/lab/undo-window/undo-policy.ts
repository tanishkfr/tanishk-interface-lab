/** The host owns the deadline and the operation. */
export function canRequestUndo(status: string, expiresAt: number, now: number): boolean {
  return status === "available" && Number.isFinite(expiresAt) && now < expiresAt;
}
