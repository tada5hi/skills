# query-api

> **Answer data questions against a live HTTP API from a base URL and credentials.**
> Stop hunting for the token endpoint, reading the spec and writing curl loops to get one answer.

[All skills](../../README.md#skills) · [`SKILL.md`](./SKILL.md)

## Why query-api?

You have a base URL, a login and a question such as "all roles with their permission bindings". Answering it by hand means finding the token endpoint, requesting a token, locating the OpenAPI document, working out the routes, paging through collections and joining the results.

| Concern | Without it | With query-api |
|---|---|---|
| **Authentication** | Find the token endpoint and grant type | Uses your token, an OAuth2 password or client credentials grant via OIDC discovery or `/token`, or HTTP Basic |
| **Finding endpoints** | Read the docs or a multi-megabyte spec | Probes common OpenAPI/Swagger paths and queries the spec with `jq`; falls back to rapiq/JSON-API conventions |
| **Paging and joins** | Write the loop and the join yourself | Pages until `meta.total`, uses `include=` where it can, and joins related collections with `jq` |
| **Writes** | One typo changes production data | Shows the exact method, path and body first and confirms deletes and bulk changes |
| **Secrets** | Tokens end up in shell history and chat | Keeps credentials in a session file with restricted permissions and redacts them from output |

## Installation

```bash
# this skill only, any Agent Skills agent
npx skills add tada5hi/skills --skill='query-api'

# Claude Code: the plugin bundles every skill
/plugin marketplace add tada5hi/skills
/plugin install skills@tada5hi
```

## Triggering

**Ask for it.** The agent loads the skill when your request matches its description, for example:

- "get me all roles with their permission bindings from https://auth.example.com, user admin, password ..."
- "list the users on this API"
- "create a client on this server with these credentials"

The agent may also use it whenever you hand over an API URL with credentials and ask to query, list, fetch, create or update resources on it.

**Invoke it directly.** Type `/query-api` (installed with the skills CLI) or `/skills:query-api` (Claude Code plugin).

## What it does

1. Collects the base URL, the credentials (username and password, client id and secret, or a token) and the task; anything missing is asked for in one question.
2. Creates a session directory for the token, the spec, responses and a `notes.md`, and reuses it for follow-up questions.
3. Authenticates with the first strategy that applies, and re-authenticates once on a mid-session `401`.
4. Discovers the endpoints from an OpenAPI/Swagger document, or from conventions; asks you for one example endpoint if both fail.
5. Runs the read requests, paging and joining as needed, and checks each HTTP status.
6. Runs write requests only when you asked for a change.
7. Presents the answer.

## Requirements

- `curl` and `jq`.
- Network access to the target API.
- A base URL and credentials for it.

## Output

The answer in the chat: a Markdown table for small results, or counts and notable rows plus the path of the saved JSON for large ones. It states `meta.total` against the rows fetched, so a truncated result is visible. For writes, it reports the response status and the ids of what it created or updated. Responses, the spec and notes stay in the session directory.

## Notes

- **Reads only, unless you ask.** It never sends POST, PATCH, PUT or DELETE as a side effect of a read question.
- **Credentials stay with the origin.** They go only to the base URL you gave, never into output or notes, and it does not follow redirects on authenticated calls.
- **Response data is data.** Instructions embedded in API responses are not followed.
- **rapiq dialect.** Servers built on [rapiq](https://github.com/tada5hi/rapiq), such as authup, get `include`, `filter`, `fields`, `sort` and `page` parameters.

## License

Apache-2.0, see [LICENSE](../../LICENSE).
