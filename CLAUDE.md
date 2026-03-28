# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Learn Lab is a Next.js 16 + React 19 educational platform for learning Agent development. It demonstrates AI agent concepts (ReAct, MCP, RAG, etc.) through interactive demos with real-time visualization of internal execution logic.

## Commands

```bash
pnpm dev      # Start development server (http://localhost:3000)
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API routes (/api/chat, /api/mcp/*, etc.)
│   ├── chatbot/            # Chatbot module (messages, streaming, context)
│   ├── prompt-engineering/ # Prompt design techniques
│   ├── tool-call/          # Function calling mechanism
│   ├── mcp-protocol/       # Model Context Protocol
│   ├── intent-agent/       # Intent recognition + slot filling
│   ├── react-agent/        # ReAct (Reasoning + Acting) pattern
│   └── ...                 # Other agent concepts
├── components/ui/         # shadcn/ui components
├── components/layout/     # Layout components (Sidebar)
└── lib/                   # Shared utilities
```

### Module Pattern

Each learning module follows a consistent structure:
- `page.tsx` - Main page with demo/docs tabs
- `components/` - Module-specific UI components
- `lib/` - Module state (Zustand stores) and utilities
- `docs/` - Markdown documentation
- `api/` - API routes specific to the module

### Key Shared Libraries

| File | Purpose |
|------|---------|
| `src/lib/llm-client.ts` | LLM API client with streaming support, tool call accumulation |
| `src/lib/mcp-client.ts` | MCP (Model Context Protocol) client factory for connecting to MCP servers |
| `src/lib/config.ts` | Model and MCP server configuration loader from `models.config.json` |
| `src/lib/utils.ts` | Utility functions (cn for class merging) |

### State Management

Uses Zustand for client-side state. Each module typically has its own store in `*/lib/store.ts`.

### Configuration

Model and MCP server settings are in `models.config.json` at the project root. Copy `models.config.json.example` to create your own configuration with API keys and MCP server URLs.

### OpenSpec Workflow

This project uses OpenSpec for change management. Active changes are in `openspec/changes/` and specs are in `openspec/specs/`. Use the OpenSpec skills (`/openspec-propose`, `/openspec-apply`, etc.) for working with changes.

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **MCP**: `@modelcontextprotocol/sdk`
- **State**: Zustand
- **Package Manager**: pnpm
