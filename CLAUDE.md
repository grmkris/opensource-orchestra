# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Open Source Orchestra Portal - a decentralized Web3 platform for the Ethereum music community. It's built as a Turborepo monorepo focused on community building through a giving economy model with zero monetization or speculation.

## Commands

### Development
- `bun dev` - Start all applications in development mode
- `bun dev:web` - Start only the web application (runs on https://localhost:3001)
- `bun dev:server` - Start only the server (runs on http://localhost:3000)

### Build & Quality
- `bun build` - Build all applications using Turbo
- `bun check-types` - TypeScript type checking across all apps
- `bun check` - Run Biome formatting and linting (auto-fix enabled)

### Package Management
- Uses Bun as the package manager and runtime
- `bun install` to install dependencies

## Architecture

### Monorepo Structure
- `apps/web/` - Next.js 15 frontend with App Router and TypeScript
- `apps/server/` - Backend API (currently removed, see git status)
- Uses Turborepo for optimized builds and caching

### Web3 Integration
- **RainbowKit** - Wallet connection UI with extensive wallet support
- **wagmi** - React hooks for Ethereum interactions 
- **viem** - TypeScript interface for Ethereum
- **Porto** - Universal account support for next-gen Ethereum accounts

### Supported Networks
- Mainnet, Base, Optimism, Arbitrum, Polygon
- All configured with HTTP transports in `apps/web/src/lib/wagmi.ts`

### UI/Styling
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI components built on Radix UI
- **next-themes** - Dark/light theme support
- **Geist fonts** - Default font family

### Key Dependencies
- React 19.1.0 & Next.js 15.5.0
- TypeScript with strict mode enabled
- Tanstack Query for state management
- Zod for runtime type validation

## Development Setup

### Required Environment Variables
Create `apps/web/.env` with:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Code Conventions
- **Formatting**: Biome with tab indentation and double quotes
- **TypeScript**: Strict mode enabled with verbatimModuleSyntax
- **Imports**: Auto-organized via Biome
- **CSS Classes**: Sorted with clsx/cva/cn functions
- **Path Aliases**: `@/*` maps to `./src/*` in web app

### Configuration Files
- `biome.json` - Linting and formatting rules
- `turbo.json` - Build pipeline configuration
- `apps/web/next.config.ts` - Next.js config with typedRoutes enabled
- `apps/web/components.json` - shadcn/ui configuration

## Mission Context

The platform embodies a giving economy focused on community building rather than monetization. All contributions should align with the values of open collaboration, decentralization, and authentic community connections through music.