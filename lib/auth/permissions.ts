export type UserRole = "admin" | "agent" | "user"

export interface Permission {
  resource: string
  action: string
}

export const PERMISSIONS = {
  // Admin permissions
  ADMIN_DASHBOARD: { resource: "admin", action: "view" },
  USER_MANAGEMENT: { resource: "users", action: "manage" },
  SYSTEM_SETTINGS: { resource: "system", action: "manage" },
  ALL_TICKETS: { resource: "tickets", action: "view_all" },

  // Agent permissions
  AGENT_DASHBOARD: { resource: "agent", action: "view" },
  TICKET_ASSIGNMENT: { resource: "tickets", action: "assign" },
  TICKET_MANAGEMENT: { resource: "tickets", action: "manage" },

  // User permissions
  USER_DASHBOARD: { resource: "user", action: "view" },
  OWN_TICKETS: { resource: "tickets", action: "view_own" },
  CREATE_TICKET: { resource: "tickets", action: "create" },
} as const

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    PERMISSIONS.ADMIN_DASHBOARD,
    PERMISSIONS.USER_MANAGEMENT,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.ALL_TICKETS,
    PERMISSIONS.AGENT_DASHBOARD,
    PERMISSIONS.TICKET_ASSIGNMENT,
    PERMISSIONS.TICKET_MANAGEMENT,
    PERMISSIONS.USER_DASHBOARD,
    PERMISSIONS.OWN_TICKETS,
    PERMISSIONS.CREATE_TICKET,
  ],
  agent: [
    PERMISSIONS.AGENT_DASHBOARD,
    PERMISSIONS.TICKET_ASSIGNMENT,
    PERMISSIONS.TICKET_MANAGEMENT,
    PERMISSIONS.USER_DASHBOARD,
    PERMISSIONS.OWN_TICKETS,
    PERMISSIONS.CREATE_TICKET,
  ],
  user: [PERMISSIONS.USER_DASHBOARD, PERMISSIONS.OWN_TICKETS, PERMISSIONS.CREATE_TICKET],
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  return rolePermissions.some((p) => p.resource === permission.resource && p.action === permission.action)
}

export function canAccessAdminDashboard(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.ADMIN_DASHBOARD)
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.USER_MANAGEMENT)
}

export function canViewAllTickets(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.ALL_TICKETS)
}

export function canManageTickets(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.TICKET_MANAGEMENT)
}

export function canAssignTickets(userRole: UserRole): boolean {
  return hasPermission(userRole, PERMISSIONS.TICKET_ASSIGNMENT)
}
