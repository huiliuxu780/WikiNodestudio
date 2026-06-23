import type { StudioUser } from "@/types/user"

export const mockUsers: StudioUser[] = [
  { userId: "user-001", name: "Rivers", email: "rivers@example.com", role: "owner", status: "active", lastActiveAt: "2026-06-22 18:00" },
  { userId: "user-002", name: "Knowledge Ops", email: "knowledge@example.com", role: "editor", status: "active", lastActiveAt: "2026-06-22 16:10" },
  { userId: "user-003", name: "Service Finance", email: "finance@example.com", role: "reviewer", status: "active", lastActiveAt: "2026-06-21 15:30" },
  { userId: "user-004", name: "Product Docs", email: "docs@example.com", role: "editor", status: "invited", lastActiveAt: "2026-06-19 10:45" },
  { userId: "user-005", name: "Audit Admin", email: "audit@example.com", role: "admin", status: "active", lastActiveAt: "2026-06-22 09:40" },
]
