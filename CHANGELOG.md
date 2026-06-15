# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup

## [1.0.0] — 2026-06-15

### Added
- Initial release of cortex-plugin-reflection
- `reflect_self_consistency` — Sample multiple reasoning paths and majority vote
- `reflect_debate` — Two sub-agents argue opposing positions, judge picks best
- `reflect_verify` — Agent writes tests for its own output before declaring done
- `reflect_improve` — Suggest improvements based on reflection results
- Post-execution middleware hook
- UI settings: defaultSamples, debateRounds, autoVerify
