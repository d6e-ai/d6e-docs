---
title: REST API
description: Category reference for the public developer-facing `/api/v1` REST endpoints.
---

## Overview

The public HTTP API of a d6e instance is `/api/v1/*`. Send a JWT or API key (`d6e_*`) as `Authorization: Bearer`. How the workspace is resolved depends on the route shape (see the table below).

This page covers public developer REST only. Internal admin APIs (`X-Admin-Token`) are not included.

## Authentication

| Route shape | Workspace resolution | `X-Workspace-ID` |
| --- | --- | --- |
| `/workspaces/{id}/sql`, `/members`, `/invitations`, `/embeddings`, `/setup/*`, `/redirect-uris` | Path `{id}` + membership | Optional (must match path if sent) |
| `/workspaces/{id}/files/*`, `/documents/*` | **Header only** (path `{id}` ignored) | **Required** |
| `/workflows`, `/stfs`, `/effects`, `/policies`, `/policy-groups`, `/pinned-charts`, `/audit-logs` | Header only | **Required** |
| `/saas-proxy`, `/saas-proxy-download`, `/drive-sync/*` | `workspace_id` in body / query | Not used |
| `/api-keys` | N/A | Not needed (session JWT only) |

| Header | Description |
| --- | --- |
| `Authorization: Bearer <token>` | Session JWT or API key `d6e_*` |
| `X-Workspace-ID: <uuid>` | Required on header-scoped routes; optional on path-scoped routes |

## Auth

| Method | Path | Auth | Description |
| --- | --- | --- |
| GET | `/api/v1/auth/me` | Bearer | Current user profile |
| POST | `/api/v1/auth/token` | None | OAuth token exchange (instance proxies to d6e-auth) |

### GET `/api/v1/auth/me`

```json
{ "id": "<uuid>", "email": "user@example.com", "name": "Alice" }
```

### POST `/api/v1/auth/token`

Allowed `grant_type` values are `authorization_code` and `refresh_token` only (`client_credentials` is rejected). `client_id` / `client_secret` are supplied server-side.

```json
{
  "grant_type": "authorization_code",
  "code": "...",
  "redirect_uri": "https://app.example.com/callback"
}
```

Success (passthrough from d6e-auth):

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## Workspaces / Members / Invitations / Redirect URIs

### Workspaces

| Method | Path | Auth | Description |
| --- | --- | --- |
| GET | `/api/v1/workspaces` | Bearer | List workspaces the caller belongs to |
| POST | `/api/v1/workspaces` | Bearer (**session only**) | Create. Scoped JWT / API keys are rejected |
| GET | `/api/v1/workspaces/{id}` | Bearer (member) | Get details |
| PATCH | `/api/v1/workspaces/{id}` | Bearer (admin) | Update name, policy groups, settings |
| DELETE | `/api/v1/workspaces/{id}` | Bearer (admin) | Soft delete (204) |

**POST body:** `{ "name": "New workspace" }` (1–255 characters)

**PATCH body (optional fields):** `name`, `ddl_policy_group_id`, `workflow_editor_policy_group_id`, `policy_editor_policy_group_id`, `mcp_timeout_ms` (30000–3600000), `custom_prompt`, `auto_embed_files`, `auto_embed_tables`

### Members

| Method | Path | Auth | Description |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/members` | member | List members |
| POST | `/api/v1/workspaces/{id}/members` | admin | Add member or queue invitation |
| PATCH | `/api/v1/workspaces/{id}/members/{memberId}` | admin | Change role |
| DELETE | `/api/v1/workspaces/{id}/members/{memberId}` | admin | Remove (204) |

**POST:** `{ "email": "…", "role": "member" | "admin" }`

Demoting or removing the last admin returns `400` / `LAST_ADMIN`.

### Invitations

| Method | Path | Auth | Description |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/invitations` | admin | List pending invitations |
| DELETE | `/api/v1/workspaces/{id}/invitations/{invitationId}` | admin | Cancel invitation |

### Redirect URIs

All require admin. HTTPS required; fragments forbidden; max 2000 characters.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/redirect-uris` | List (`{ "items": [...] }`) |
| POST | `/api/v1/workspaces/{id}/redirect-uris` | `{ "redirect_uri": "https://…" }` |
| DELETE | `/api/v1/workspaces/{id}/redirect-uris` | Body includes `redirect_uri` (204) |

## SQL

| Method | Path | Auth | Description |
| --- | --- | --- |
| POST | `/api/v1/workspaces/{id}/sql` | Bearer (path ws) | Execute SQL (policy + DDL checks) |
| POST | `/api/v1/workspaces/{id}/sql/preview` | Bearer (path ws) | Transform preview (policies not evaluated) |

**Request:** `{ "sql": "<single statement>" }` (multiple statements are not allowed)

Logical table names are limited to 23 characters. Prefer `uuidv7()` for primary keys. There is no `GET …/tables` endpoint — list tables via SQL against `information_schema`.

### Operation permissions

| Operation | Permission |
| --- | --- |
| DDL | Workspace admin, or member of `ddl_policy_group_id` |
| DML (SELECT / INSERT / UPDATE / DELETE) | Row-level policies (allow / deny + condition) |
| Soft delete | DELETE on tables with `deleted_at` is rewritten to soft delete |

### Response examples

**SELECT:**

```json
{
  "rows": [{ "id": "018e…", "amount": 1200 }],
  "executed_sql": "SELECT … FROM user_data.ws_…_invoices …"
}
```

**DML / DDL:**

```json
{ "affected_rows": 3, "executed_sql": "…" }
```

**Preview (policies not evaluated):**

```json
{
  "proposal_id": "…",
  "original_sql": "UPDATE invoices SET …",
  "transformed_sql": "UPDATE user_data.ws_…_invoices SET …",
  "operation": "update",
  "affected_tables": ["invoices"],
  "requires_approval": true
}
```

`requires_approval` is `true` for non-SELECT statements.

### Error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `PARSE_ERROR` | 400 | SQL syntax error |
| `INVALID_TABLE` | 400 | Invalid table name (e.g. length) |
| `UNSUPPORTED` | 400 | Unsupported statement |
| `SCHEMA_ACCESS_DENIED` | 400 | Schema access denied |
| `TRANSACTION_NOT_ALLOWED` | 400 | Transactions are forbidden |
| `MULTIPLE_STATEMENTS` | 400 | Multiple statements are forbidden |
| `EXECUTION_ERROR` | 400 | Database execution error |
| `POLICY_DENIED` | 403 | Policy denial (not an auth failure) |
| `DDL_FORBIDDEN` / `DDL_NOT_ALLOWED` | 403 | No DDL permission |
| `FORBIDDEN` | 403 | Not a member |
| `NOT_FOUND` | 404 | Workspace not found |

## Storage Files

All require `Authorization: Bearer` + **`X-Workspace-ID`** (path `{id}` is ignored). Max size 1 GB (413 when exceeded).

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/files` | List metadata (no BYTEA) |
| GET | `/api/v1/workspaces/{id}/files/{fileId}` | Get metadata |
| GET | `/api/v1/workspaces/{id}/files/{fileId}/download` | Binary download |
| POST | `/api/v1/workspaces/{id}/files` | JSON base64 upload |
| POST | `/api/v1/workspaces/{id}/files/multipart` | Multipart (`file` + optional `metadata`) |
| DELETE | `/api/v1/workspaces/{id}/files/{fileId}` | Soft delete |

**JSON upload:**

```json
{
  "filename": "report.pdf",
  "content_type": "application/pdf",
  "content": "<base64>",
  "metadata": {}
}
```

**UploadResponse:** `{ "id", "filename", "content_type", "size", "created_at" }`

Upload and delete require StorageFile editor permission (shared with `workflow_editor_policy_group_id`). When `auto_embed_files` is enabled, embedding starts asynchronously.

## Documents

Bearer + **`X-Workspace-ID` required** (path `{id}` ignored). Content is Markdown only.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/workspaces/{id}/documents` | List (`?doc_type=&status=`, no content) |
| POST | `/api/v1/workspaces/{id}/documents` | Create |
| GET | `/api/v1/workspaces/{id}/documents/{docId}` | Get (with content) |
| PATCH | `/api/v1/workspaces/{id}/documents/{docId}` | Update (content change creates a version snapshot) |
| DELETE | `/api/v1/workspaces/{id}/documents/{docId}` | Soft delete |
| GET | `/api/v1/workspaces/{id}/documents/{docId}/versions` | Version history |

**Create:** `{ "title", "doc_type", "status", "content", "metadata?" }`

## Embeddings

Path-scoped (`X-Workspace-ID` optional). Clients do not need Gemini / OpenAI keys (configured on the instance).

### Column (synchronous)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/workspaces/{id}/embeddings/generate` | `{ "table_name", "column_name" }` → `{ "generated_count", "column_added" }` |
| GET | `/api/v1/workspaces/{id}/embeddings/status?table_name=` | Column embedding status |
| POST | `/api/v1/workspaces/{id}/embeddings/similarity-search` | `{ "table_name", "column_name", "query", "limit?" }` |

### Files (asynchronous)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/workspaces/{id}/embeddings/files/embed` | `{ "file_ids": [...] }` (required, max 50) |
| GET | `/api/v1/workspaces/{id}/embeddings/files/status` | pending / processing / completed / failed / skipped |
| POST | `/api/v1/workspaces/{id}/embeddings/files/search` | `{ "query", "limit?" }` |
| POST | `/api/v1/workspaces/{id}/embeddings/files/regenerate` | `{ "file_ids" }` |

### Tables (asynchronous)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/workspaces/{id}/embeddings/tables/embed` | `{ "table_names": [...] }` |
| GET | `/api/v1/workspaces/{id}/embeddings/tables/status` | Status |
| POST | `/api/v1/workspaces/{id}/embeddings/tables/search` | `{ "query", "limit?" }` |
| POST | `/api/v1/workspaces/{id}/embeddings/tables/regenerate` | Force regenerate |

| Operation | Permission |
| --- | --- |
| generate / tables embed | DDL |
| files embed | storage editor |
| status / search | member |

Operator misconfiguration: `503 EMBEDDING_NOT_CONFIGURED`, `503 MODEL_NOT_MULTIMODAL`, `502 EMBEDDING_API_ERROR`

## Workspace Setup

Base: `/api/v1/workspaces/{id}/setup/*` (path-scoped)

| Resource | Methods | Auth | Description |
| --- | --- | --- | --- |
| `/prompt-rules` | GET / POST | GET: member, POST: admin | Prompt rules |
| `/prompt-rules/{ruleId}` | PATCH / DELETE | admin | Update / delete |
| `/skills` | GET / POST | admin | Workspace skills |
| `/skills/{skillId}` | GET / PATCH / DELETE | admin | Skill CRUD |
| `/title-rule` | GET / PUT / DELETE | GET: member, PUT/DELETE: admin | Chat title rule |
| `/chat-templates` | GET / POST | admin | Chat templates |
| `/chat-templates/{id}` | GET / PATCH / DELETE | admin | Template CRUD |
| `/chat-templates/{id}/activate` | POST | admin | Activate one template |
| `/chat-templates/deactivate` | POST | admin | Deactivate all |
| `/dashboard-enabled` | GET / PUT | GET: member, PUT: admin | `{ "enabled": bool }` |
| `/saas-credentials` | GET | member | Connected providers (non-secret) |

**Prompt rule create:** `{ "content": "…" }` (max 50k)  
**Title rule PUT:** `{ "content": "…" }` (empty deletes; max 2000)

## Workflows

CRUD requires Bearer + **`X-Workspace-ID`**.  
**Execute** requires `X-Workspace-ID`; `Authorization` is **optional**.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/workflows` | List |
| POST | `/api/v1/workflows` | Create |
| GET | `/api/v1/workflows/{id}` | Get |
| PATCH | `/api/v1/workflows/{id}` | Update |
| DELETE | `/api/v1/workflows/{id}` | Soft delete |
| POST | `/api/v1/workflows/{id}/execute` | Run; body = workflow `$input` JSON |

The response is the last STF step output. There is no name lookup API — list and match on `name`. For workflows that include Docker STFs, prefer a timeout of 120 seconds or more.

## STFs

Bearer + `X-Workspace-ID` (required except for `stf-libraries`)

| Method | Path | Description |
| --- | --- | --- |
| GET / POST | `/api/v1/stfs` | List / create |
| GET / PATCH / DELETE | `/api/v1/stfs/{id}` | Get / update / soft delete |
| GET / POST | `/api/v1/stfs/{id}/versions` | List / add versions |
| POST | `/api/v1/stfs/{id}/describe` | Infer schema `{ "version"?: "1.0.0" }` |
| POST | `/api/v1/stfs/instant-run` | Run without a workflow `{ "stf_version_id", "input" }` |
| GET / POST | `/api/v1/stfs/{stfId}/secrets` | List key names / upsert `{ "env_key", "value" }` |
| DELETE | `/api/v1/stfs/{stfId}/secrets/{envKey}` | Delete secret |
| GET | `/api/v1/stf-libraries` | List shared libraries (Bearer only) |
| GET | `/api/v1/stf-libraries/{name}/types` | TypeScript type definitions (Bearer only) |

**Create:**

```json
{
  "name": "hello",
  "description": "optional",
  "is_public": false,
  "version": "1.0.0",
  "runtime": "javascript",
  "code": "<base64>",
  "input_schema": {},
  "output_schema": {}
}
```

`runtime` is `"javascript"` | `"docker"` | `"wasm"`. Secret lists return key names only (values are write-only).

## Effects

Bearer + `X-Workspace-ID`

| Method | Path | Description |
| --- | --- | --- |
| GET / POST | `/api/v1/effects` | List / create |
| GET / PATCH / DELETE | `/api/v1/effects/{id}` | Get / update / soft delete |
| GET / POST | `/api/v1/effects/{id}/versions` | List / add versions |

**Main create fields:** `name`, `version`, `url`, `method`, `header_mappings[]`, `body_mappings[]`, `query_mappings?`, `input_schema?`

FieldMapping: `{ "source": { "type": "Variable" | "Const", "value": "…" }, "target": "…" }`

## Policies / Policy Groups

Bearer + `X-Workspace-ID`. POST / PATCH / DELETE require membership in `policy_editor_policy_group_id` (no restriction when null).

### Policies

| Method | Path |
| --- | --- |
| GET / POST | `/api/v1/policies` |
| GET / PATCH / DELETE | `/api/v1/policies/{id}` |

| Field | Values | Description |
| --- | --- | --- |
| `mode` | `allow` \| `deny` | Allow or deny |
| `operation` | `select` \| `insert` \| `update` \| `delete` | Row-level only. DDL and storage editing are not this enum |
| `condition` | modql JSON | `$eq` `$ne` `$gt` `$gte` `$lt` `$lte` `$in` `$null`. Placeholder `"$user_id"`. Simple form `{ "field": "value" }` allowed. Combined with AND |

No matching policy means deny all. DDL is controlled by `ddl_policy_group_id`; storage / workflow editing by `workflow_editor_policy_group_id`.

**Create example:**

```json
{
  "name": "sales-read-own",
  "policy_group_id": "<uuid>",
  "mode": "allow",
  "table_name": "leads",
  "operation": "select",
  "condition": { "owner_id": { "$eq": "$user_id" } }
}
```

### Policy Groups

| Method | Path |
| --- | --- |
| GET / POST | `/api/v1/policy-groups` |
| GET / PATCH / DELETE | `/api/v1/policy-groups/{id}` |

**Create:** `{ "name": "Finance editors", "user_ids": ["…"], "stf_ids": ["…"] }`  
PATCH replaces `user_ids` / `stf_ids` entirely.

## API Keys

Session JWT only (API keys and scoped JWTs cannot manage keys).

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/api-keys` | List caller's keys (metadata only) |
| POST | `/api/v1/api-keys` | Create; raw key returned once |
| DELETE | `/api/v1/api-keys/{id}` | Revoke |

**POST:** `{ "name": "local dev", "expires_at"?: "…" }`

**201:**

```json
{ "id": "…", "key": "d6e_…" }
```

## Audit Logs / Pinned Charts

### Audit Logs

| Method | Path | Auth | Description |
| --- | --- | --- |
| GET | `/api/v1/audit-logs` | Bearer + X-Workspace-ID | List audit entries |

**Query:** `user_id`, `action` (trailing `*` prefix match such as `execute_sql*`), `resource_type`, `resource_id`, `limit` (default 100, max 1000), `offset`

### Pinned Charts

| Method | Path | Auth | Description |
| --- | --- | --- |
| GET | `/api/v1/pinned-charts` | Bearer + X-Workspace-ID | List visible charts (`is_visible=true`) |
| POST | `/api/v1/pinned-charts` | Bearer + X-Workspace-ID | Create |
| GET / PATCH / DELETE | `/api/v1/pinned-charts/{id}` | Bearer + X-Workspace-ID | Get / update / soft delete |

**Create:** `{ "title", "sql_query", "chart_type", "x_axis_column?", "y_axis_columns?", "display_order?", "description?" }`

Fetch chart data separately by running `sql_query` via `POST …/sql`.

## Drive Sync

`workspace_id` is in the query (GET) or body (writes). `X-Workspace-ID` is not used. Requires a `google_workspace` credential.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/drive-sync/status?workspace_id=` | Sync status + roots + node_count |
| GET / PUT | `/api/v1/drive-sync/config` | Get / update config (PUT body includes `workspace_id`) |
| GET / POST | `/api/v1/drive-sync/roots` | List / add roots |
| DELETE | `/api/v1/drive-sync/roots/{rootId}?workspace_id=` | Remove root |
| POST | `/api/v1/drive-sync/sync` | Start background sync (returns immediately — poll status) |
| POST | `/api/v1/drive-sync/materialize` | `{ workspace_id, drive_file_id }` → copy into storage |
| POST | `/api/v1/drive-sync/read` | Read Drive file content |
| GET | `/api/v1/drive-sync/picker?workspace_id=&parent=&shared_drives=` | Folder picker |

**Add root:** `{ workspace_id, drive_id, drive_type: "folder" | "shared_drive" | "my_drive", name, shared_drive_id? }`

## SaaS Proxy

Both require Bearer. Put `workspace_id` in the JSON body. Authorization and similar headers cannot be overridden.

### POST `/api/v1/saas-proxy`

```json
{
  "workspace_id": "<UUID>",
  "provider": "google_workspace",
  "method": "GET",
  "path": "/drive/v3/files?…",
  "headers": {},
  "body": null,
  "file_id": null
}
```

**Response:** `{ "status", "headers", "body" }`. Cap 10 MB. Redirects are not followed.

### POST `/api/v1/saas-proxy-download`

Same body shape plus optional `suggested_filename?`, `metadata?`. Cap 100 MB. Requires storage editor. HTTPS redirects are followed.

- 2xx → `{ status, headers, id, filename, content_type, size, created_at }` (saved to storage)
- Non-2xx → `{ status, headers, error_body }` (no storage row)

## Error responses

Standard shape:

```json
{ "error": "Human-readable message", "code": "ERROR_CODE", "details": "optional" }
```

| HTTP | Typical code | Use |
| --- | --- | --- |
| 400 | `BAD_REQUEST`, `VALIDATION_ERROR`, `LAST_ADMIN`, `PARSE_ERROR`, etc. | Bad input / validation |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN`, `POLICY_DENIED`, `DDL_FORBIDDEN` | Permission / policy |
| 404 | `NOT_FOUND` | Missing resource |
| 422 | `RUNTIME_ERROR` (+ `details`) | STF / engine execution failure |
| 500 | `INTERNAL_ERROR` | Server failure |

Also: `409 CONFLICT`, `413` (size limit), `502` (upstream failure), `503 EMBEDDING_NOT_CONFIGURED`, and others. The auth token endpoint may return OAuth-style `{ "error": "…" }`.

## Related

For the same operations via MCP, see [MCP tools](/en/reference/mcp-tools/).
