---
title: MCP tools
description: Category reference for the ~96 d6e_* tools exposed by the instance MCP server.
---

## Overview

The d6e instance MCP server (default `:8081/mcp`) exposes the **same surface as the built-in chat**. With an API key, local AI agents (Cursor / Claude Code / Codex, and others) can run workspace SQL, STFs, workflows, embedding search, and more.

For connection steps, environment variables, and troubleshooting, see [Local AI development](/en/guides/local-ai-development/).

## Connection example

**Cursor** — `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "d6e": {
      "url": "http://<instance-host>:8081/mcp",
      "headers": { "Authorization": "Bearer d6e_YOUR_API_KEY" }
    }
  }
}
```

After connecting, call `d6e_list_workspaces` then `d6e_set_workspace` before other tools.

## Tools by category

### Health / Workspace Context

| Tool | Description |
| --- | --- |
| `d6e_health` | Check API server connectivity |
| `d6e_set_workspace` | Set the workspace ID used by subsequent operations |
| `d6e_get_current_workspace` | Return the currently selected workspace ID |

### Workspaces / Members

| Tool | Description |
| --- | --- |
| `d6e_list_workspaces` | List workspaces accessible to this API key |
| `d6e_get_workspace` | Get workspace details (name, policy groups, etc.) |
| `d6e_create_workspace` | Create a new workspace |
| `d6e_update_workspace` | Update workspace settings (name, policies, custom prompt, etc.) |
| `d6e_delete_workspace` | Soft-delete a workspace |
| `d6e_list_workspace_members` | List workspace members |
| `d6e_add_workspace_member` | Add a member (admin / member) |
| `d6e_update_workspace_member` | Change a member's role |
| `d6e_remove_workspace_member` | Remove a member |

### SQL

| Tool | Description |
| --- | --- |
| `d6e_sql` | Execute SQL in the workspace (DDL, SELECT, INSERT, and more) |

### Embeddings

File and table-row embeddings are asynchronous. Follow **EMBED → STATUS → SEARCH**: start embedding, poll until complete, then search.

| Tool | Description |
| --- | --- |
| `d6e_generate_embeddings` | Generate vector embeddings for a TEXT column (synchronous) |
| `d6e_similarity_search` | Semantic similarity search over column embeddings (synchronous) |
| `d6e_embed_files` | Start file embedding (asynchronous) |
| `d6e_file_embedding_status` | Check file embedding progress and status |
| `d6e_search_files` | Search embedded files by content similarity |
| `d6e_regenerate_file_embeddings` | Force re-generate file embeddings |
| `d6e_embed_table_rows` | Start table-row embedding (asynchronous) |
| `d6e_table_row_embedding_status` | Check table-row embedding progress and status |
| `d6e_search_table_rows` | Cross-table semantic search over embedded rows |
| `d6e_regenerate_table_rows` | Force re-generate table-row embeddings |

### Workflows

| Tool | Description |
| --- | --- |
| `d6e_list_workflows` | List workflows in the workspace |
| `d6e_get_workflow` | Get a workflow definition (STF / Effect steps, etc.) |
| `d6e_create_workflow` | Create a workflow with STF and Effect steps |
| `d6e_update_workflow` | Update an existing workflow |
| `d6e_delete_workflow` | Soft-delete a workflow |
| `d6e_execute_workflow` | Execute a workflow with input data |

### STFs / Libraries

| Tool | Description |
| --- | --- |
| `d6e_list_stfs` | List State Transition Functions (STFs) |
| `d6e_get_stf` | Get STF metadata |
| `d6e_create_stf` | Create an STF with JavaScript / WASM (or other) code |
| `d6e_update_stf` | Update STF metadata (name, description, public flag) |
| `d6e_delete_stf` | Soft-delete an STF |
| `d6e_list_stf_versions` | List versions of an STF |
| `d6e_create_stf_version` | Add a new code version to an existing STF |
| `d6e_instant_run_stf` | Run an STF immediately without creating a workflow |
| `d6e_describe_stf` | Discover a Docker STF's input_schema and operations |
| `d6e_list_stf_libraries` | List libraries importable from STF code |
| `d6e_get_library_types` | Get TypeScript type definitions (.d.ts) for an STF library |

### Effects

| Tool | Description |
| --- | --- |
| `d6e_list_effects` | List Effects (external HTTP calls) |
| `d6e_get_effect` | Get Effect metadata |
| `d6e_create_effect` | Create a new Effect |
| `d6e_update_effect` | Update Effect metadata |
| `d6e_delete_effect` | Soft-delete an Effect |
| `d6e_list_effect_versions` | List versions of an Effect |
| `d6e_create_effect_version` | Add a new HTTP configuration version to an Effect |

### Policies / Policy Groups

| Tool | Description |
| --- | --- |
| `d6e_list_policies` | List row-level access policies |
| `d6e_get_policy` | Get a policy definition |
| `d6e_create_policy` | Create a policy for a table operation |
| `d6e_update_policy` | Update an existing policy |
| `d6e_delete_policy` | Soft-delete a policy |
| `d6e_list_policy_groups` | List policy groups |
| `d6e_get_policy_group` | Get a policy group (user / STF members) |
| `d6e_create_policy_group` | Create a policy group |
| `d6e_update_policy_group` | Update a policy group |
| `d6e_delete_policy_group` | Soft-delete a policy group |

### Storage Files

| Tool | Description |
| --- | --- |
| `d6e_list_files` | List files in the workspace |
| `d6e_get_file` | Get file metadata (without content) |
| `d6e_upload_file` | Upload a file (base64, max 1GB) |
| `d6e_download_file` | Download file content as base64 |
| `d6e_delete_file` | Soft-delete a file |
| `d6e_view_image` | Return an image / PDF as visual content for the LLM |
| `d6e_extract_file_text` | Extract text from Office docs or run OCR on images |

### Documents

| Tool | Description |
| --- | --- |
| `d6e_create_document` | Create a Markdown document |
| `d6e_get_document` | Get document body and metadata |
| `d6e_list_documents` | List documents (metadata only) |
| `d6e_update_document` | Update a document (creates a new version on content change) |
| `d6e_replace_document_section` | Replace a specific text section in a document |
| `d6e_delete_document` | Soft-delete a document |
| `d6e_get_document_versions` | Get document version history |

### Workspace Setup

| Tool | Description |
| --- | --- |
| `d6e_list_workspace_prompt_rules` | List workspace prompt rules |
| `d6e_create_workspace_prompt_rule` | Add a rule segment for the system prompt |
| `d6e_update_workspace_prompt_rule` | Update a prompt rule |
| `d6e_delete_workspace_prompt_rule` | Delete a prompt rule |
| `d6e_list_workspace_skills` | List custom Agent Skills |
| `d6e_create_workspace_skill` | Create a custom Agent Skill |
| `d6e_update_workspace_skill` | Update a custom Agent Skill |
| `d6e_delete_workspace_skill` | Delete a custom Agent Skill |
| `d6e_get_workspace_title_rule` | Get the chat-session title-naming rule |
| `d6e_set_workspace_title_rule` | Set or update the title-naming rule |
| `d6e_clear_workspace_title_rule` | Clear the title-naming rule |
| `d6e_list_workspace_chat_templates` | List chat frontend templates |
| `d6e_get_workspace_chat_template` | Get a chat template in full |
| `d6e_create_workspace_chat_template` | Create a chat template |
| `d6e_update_workspace_chat_template` | Update a chat template |
| `d6e_delete_workspace_chat_template` | Delete a chat template |
| `d6e_set_active_workspace_chat_template` | Activate one chat template |
| `d6e_deactivate_workspace_chat_templates` | Deactivate all chat templates |
| `d6e_get_workspace_dashboard_enabled` | Get the dashboard visibility setting |
| `d6e_set_workspace_dashboard_enabled` | Enable or disable the dashboard |
| `d6e_list_saas_credentials` | List linked SaaS credentials (token values omitted) |

### SaaS / Drive

| Tool | Description |
| --- | --- |
| `d6e_call_external_api` | Call an external SaaS API with stored credentials |
| `d6e_download_external_file` | Download a binary from SaaS into workspace storage |
| `d6e_read_drive_file` | Read a file from the synced Google Drive mirror (with cache) |

### Audit

| Tool | Description |
| --- | --- |
| `d6e_list_audit_logs` | List workspace audit logs (who did what, when) |

## Category counts

| Category | Count |
| --- | ---: |
| Health / Workspace Context | 3 |
| Workspaces / Members | 9 |
| SQL | 1 |
| Embeddings | 10 |
| Workflows | 6 |
| STFs / Libraries | 11 |
| Effects | 7 |
| Policies / Policy Groups | 10 |
| Storage Files | 7 |
| Documents | 7 |
| Workspace Setup | 21 |
| SaaS / Drive | 3 |
| Audit | 1 |
| **Total** | **96** |

## Related

- [Local AI development](/en/guides/local-ai-development/) — MCP connection guide
- [REST API](/en/reference/rest-api/) — equivalent HTTP endpoints
