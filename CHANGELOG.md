# Changelog

All notable changes to the Packet Store project will be documented in this file.

## [Unreleased]

### Added
- **Toast Notifications**: System to show smooth feedback for user actions.
- **Empty State**: Improved dashboard empty state with illustration.
- **Markdown Support**: Packet content now renders Markdown.
- **Syntax Highlighting**: Code blocks in packets are syntax highlighted (Notion-style).
- **Relative Dates**: Packet cards show "Edited X minutes ago".
- **Copy Button**: One-click copy for packet content.
- **Search**: Real-time filtering of packets by title/content.
- **Shortcuts**: `Ctrl+Enter` to submit packets.
- **View Options**: Toggle between Grid/List layouts.
- **Privacy Mode**: Blur content until hovered.
- **Typography**: Switch between Sans/Mono fonts.
- **Tagging**: Auto-extract `#tags` from content and filter by them.
- **Smart Paste**: Automatically detects code language when pasting and wraps in markdown.
- **Color Patterns**: Added 16-color palette (4x4 grid) with 8 unique background patterns (dots, grids, stripes).

### Changed
- **OTP Verification**: Email is now sent directly to the user (with admin fallback).
- **Database**: Switched to PostgreSQL for reliable persistence.
