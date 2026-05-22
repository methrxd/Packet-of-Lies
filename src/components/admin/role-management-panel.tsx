"use client";

import type { FormEvent } from "react";
import { useActionState } from "react";

import {
  createRoleAction,
  deleteUserAction,
  type ActionState,
  updateRolePermissionsAction,
  updateUserRoleAction,
} from "@/app/(app)/admin/actions";

type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  username: string | null;
  roleName: string;
  roleId: string | null;
  profileCompletedAt: string | null;
  createdAt: string;
};

type PermissionDefinition = {
  key: string;
  label: string;
  description: string;
};

type RoleDefinition = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
};

type RoleManagementPanelProps = {
  users: AdminUser[];
  roles: RoleDefinition[];
  permissions: PermissionDefinition[];
};

const initialState: ActionState = {
  status: "idle",
  message: "",
};

function statusClass(status: ActionState["status"]) {
  if (status === "success") {
    return "rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-primary";
  }
  return "rounded-xl border border-[color:rgba(255,57,57,0.32)] bg-[color:rgba(255,57,57,0.12)] px-3 py-2 text-sm text-[var(--state-critical)]";
}

export function RoleManagementPanel({
  users,
  roles,
  permissions,
}: RoleManagementPanelProps) {
  const [roleAssignState, roleAssignAction, roleAssignPending] = useActionState(
    updateUserRoleAction,
    initialState
  );
  const [deleteUserState, deleteUserActionForm, deleteUserPending] = useActionState(
    deleteUserAction,
    initialState
  );
  const [createRoleState, createRoleActionForm, createRolePending] = useActionState(
    createRoleAction,
    initialState
  );
  const [permissionState, permissionAction, permissionPending] = useActionState(
    updateRolePermissionsAction,
    initialState
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-white/6 bg-white/2 p-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-2">
          <p className="font-mono-ui text-[10px] tracking-[0.2em] text-[var(--text-muted)] uppercase">
            Create role
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Add a custom role and configure permissions below.
          </p>
        </div>

        <form action={createRoleActionForm} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            name="name"
            required
            minLength={3}
            maxLength={32}
            placeholder="tier2_investigator"
            className="h-10 rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          />
          <input
            name="description"
            maxLength={140}
            placeholder="Can triage and update cases"
            className="h-10 rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
          />
          <button
            type="submit"
            disabled={createRolePending}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createRolePending ? "Creating..." : "Create role"}
          </button>
        </form>
      </div>

      {createRoleState.status !== "idle" ? (
        <p className={statusClass(createRoleState.status)}>{createRoleState.message}</p>
      ) : null}

      <div className="space-y-3">
        <p className="font-mono-ui text-[10px] tracking-[0.2em] text-[var(--text-muted)] uppercase">
          Role permissions
        </p>
        {roles.map((role) => (
          <form
            key={role.id}
            action={permissionAction}
            className="space-y-3 rounded-2xl border border-white/6 bg-white/2 p-4"
          >
            <input type="hidden" name="roleId" value={role.id} />
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  role.name === "admin"
                    ? "inline-flex rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2 py-1 text-xs text-primary"
                    : "inline-flex rounded-full border border-white/10 bg-white/4 px-2 py-1 text-xs text-[var(--text-secondary)]"
                }
              >
                {role.name}
              </span>
              {role.isSystem ? (
                <span className="inline-flex rounded-full border border-white/10 bg-white/4 px-2 py-1 text-xs text-[var(--text-secondary)]">
                  system
                </span>
              ) : null}
            </div>
            {role.description ? (
              <p className="text-sm text-[var(--text-secondary)]">{role.description}</p>
            ) : null}
            <div className="grid gap-2 md:grid-cols-2">
              {permissions.map((permission) => (
                <label
                  key={`${role.id}-${permission.key}`}
                  className="flex items-start gap-2 rounded-xl border border-white/8 bg-[var(--bg-card)] px-3 py-2"
                >
                  <input
                    type="checkbox"
                    name="permissionKeys"
                    value={permission.key}
                    defaultChecked={role.permissions.includes(permission.key)}
                    className="mt-1 size-4 accent-[var(--accent-border)]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[var(--text-primary)]">
                      {permission.label}
                    </span>
                    <span className="block text-xs text-[var(--text-muted)]">
                      {permission.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={permissionPending}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {permissionPending ? "Saving..." : `Save ${role.name} permissions`}
            </button>
          </form>
        ))}
      </div>

      {permissionState.status !== "idle" ? (
        <p className={statusClass(permissionState.status)}>{permissionState.message}</p>
      ) : null}

      <div className="space-y-3">
        <p className="font-mono-ui text-[10px] tracking-[0.2em] text-[var(--text-muted)] uppercase">
          User access
        </p>
        {users.map((user) => {
          const onDelete = (event: FormEvent<HTMLFormElement>) => {
            const confirmed = window.confirm(
              `Remove ${user.email} permanently? This cannot be undone.`
            );
            if (!confirmed) {
              event.preventDefault();
            }
          };

          return (
            <div
              key={user.id}
              className="grid gap-3 rounded-2xl border border-white/6 bg-white/2 p-4 md:grid-cols-[1fr_220px_auto]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{user.displayName}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{user.email}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  @{user.username ?? "pending-profile"}
                </p>
                <p className="font-mono-ui mt-2 text-[10px] tracking-[0.16em] text-[var(--text-muted)] uppercase">
                  Joined {new Date(user.createdAt).toLocaleDateString()} | {user.profileCompletedAt ? "Profile completed" : "Profile pending"}
                </p>
              </div>

              <form action={roleAssignAction} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <select
                  name="roleId"
                  defaultValue={user.roleId ?? roles.find((role) => role.name === user.roleName)?.id}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-border)]"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={roleAssignPending}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-sm font-medium text-primary transition-colors hover:bg-[color:rgba(2,249,109,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {roleAssignPending ? "Saving..." : "Save"}
                </button>
              </form>

              <form onSubmit={onDelete} action={deleteUserActionForm} className="flex items-center">
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  disabled={deleteUserPending}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[color:rgba(255,57,57,0.5)] bg-[color:rgba(255,57,57,0.16)] px-3 text-sm font-medium text-[var(--state-critical)] transition-colors hover:bg-[color:rgba(255,57,57,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteUserPending ? "Removing..." : "Delete user"}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {roleAssignState.status !== "idle" ? (
        <p className={statusClass(roleAssignState.status)}>{roleAssignState.message}</p>
      ) : null}

      {deleteUserState.status !== "idle" ? (
        <p className={statusClass(deleteUserState.status)}>{deleteUserState.message}</p>
      ) : null}
    </div>
  );
}
