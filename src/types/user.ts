export type StudioUser = {
  userId: string
  name: string
  email: string
  role: "owner" | "editor" | "reviewer" | "viewer" | "admin"
  status: "active" | "invited" | "disabled"
  lastActiveAt: string
}
