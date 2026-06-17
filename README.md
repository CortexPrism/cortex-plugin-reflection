# Reflection Enhancer Pack

Post-turn reflection plugins: self-consistency, debate, verification.

## Installation

```bash
cortex plugin install marketplace:cortex-plugin-reflection
cortex plugin install github:CortexPrism/cortex-plugin-reflection
cortex plugin install ./manifest.json
```

## Quick Start

```bash
cortex tools list
cortex chat --plugin cortex-plugin-reflection
```

## Tools

### reflect_self_consistency

Sample multiple reasoning paths and majority vote.

**Parameters:**

- `problem` (string, required) — The problem to reason about
- `num_samples` (number, optional) — Number of reasoning paths (default: 3)
- `strategy` (string, optional) — Reasoning strategy hint

### reflect_debate

Two sub-agents argue opposing positions, judge picks best.

**Parameters:**

- `topic` (string, required) — The topic or question to debate
- `rounds` (number, optional) — Number of debate rounds (default: 3)

### reflect_verify

Agent writes tests for its own output before declaring done.

**Parameters:**

- `output` (string, required) — The agent's output to verify
- `criteria` (string, required) — Verification criteria

### reflect_improve

Suggest improvements based on reflection results.

**Parameters:**

- `original_output` (string, required) — The original agent output
- `reflection_results` (string, required) — JSON of previous reflection results

## Configuration

```json
{
  "plugins": {
    "cortex-plugin-reflection": {
      "enabled": true,
      "config": {
        "defaultSamples": 3,
        "debateRounds": 3,
        "autoVerify": true
      }
    }
  }
}
```

## Development

```bash
deno task test
deno fmt
deno lint
deno task validate
```

## License

MIT — See [LICENSE](./LICENSE) file
