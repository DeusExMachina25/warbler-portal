import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth/safe-redirect";

describe("safeNextPath", () => {
  it("keeps a same-site path", () => {
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/dashboard?tab=bookings")).toBe("/dashboard?tab=bookings");
  });

  it("falls back when nothing is given", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath("")).toBe("/dashboard");
  });

  it("rejects links to other websites", () => {
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
  });
});
