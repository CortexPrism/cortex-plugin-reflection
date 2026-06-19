import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { tools } from '../../mod.ts';
import type { PluginContext } from 'cortex/plugins';

const mockContext: PluginContext = {
  pluginId: 'cortex-plugin-reflection',
  pluginDir: '/tmp/plugins/cortex-plugin-reflection',
  state: {
    get: async () => null,
    set: async () => {},
  },
  config: {},
};

function findTool(name: string) {
  return tools.find((t) => t.definition.name === name);
}

Deno.test('reflect_self_consistency - samples reasoning paths', async () => {
  const tool = findTool('reflect_self_consistency');
  if (!tool) throw new Error('reflect_self_consistency tool not found');

  const result = await tool.execute(
    { problem: 'How to optimize a slow database query?' },
    mockContext,
  );
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.samples.length, 3);
  assertEquals(output.strategy, 'auto');
  assertEquals(typeof output.averageConfidence, 'number');
  assertEquals(typeof output.consensusLevel, 'string');
});

Deno.test('reflect_self_consistency - accepts custom num_samples', async () => {
  const tool = findTool('reflect_self_consistency');
  if (!tool) throw new Error('reflect_self_consistency tool not found');

  const result = await tool.execute({ problem: 'Test problem', num_samples: 5 }, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.samples.length, 5);
});

Deno.test('reflect_self_consistency - caps num_samples at 10', async () => {
  const tool = findTool('reflect_self_consistency');
  if (!tool) throw new Error('reflect_self_consistency tool not found');

  const result = await tool.execute({ problem: 'Test', num_samples: 20 }, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.samples.length, 10);
});

Deno.test('reflect_self_consistency - rejects missing problem', async () => {
  const tool = findTool('reflect_self_consistency');
  if (!tool) throw new Error('reflect_self_consistency tool not found');

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, 'non-empty string');
});

Deno.test('reflect_debate - runs debate successfully', async () => {
  const tool = findTool('reflect_debate');
  if (!tool) throw new Error('reflect_debate tool not found');

  const result = await tool.execute({ topic: 'Should we use microservices?' }, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.rounds, 3);
  assertStringIncludes(output.proArgument, 'structurally sound');
  assertEquals(typeof output.winner, 'string');
  assertEquals(typeof output.confidence, 'number');
});

Deno.test('reflect_debate - accepts custom rounds', async () => {
  const tool = findTool('reflect_debate');
  if (!tool) throw new Error('reflect_debate tool not found');

  const result = await tool.execute({ topic: 'Test', rounds: 2 }, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.rounds, 2);
});

Deno.test('reflect_debate - rejects missing topic', async () => {
  const tool = findTool('reflect_debate');
  if (!tool) throw new Error('reflect_debate tool not found');

  const result = await tool.execute({}, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, 'non-empty string');
});

Deno.test('reflect_verify - verifies output against criteria', async () => {
  const tool = findTool('reflect_verify');
  if (!tool) throw new Error('reflect_verify tool not found');

  const result = await tool.execute({
    output: 'function add(a, b) { return a + b; }',
    criteria: 'correct,edge_cases,performance',
  }, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.checks.length, 3);
  assertEquals(typeof output.passed, 'boolean');
  assertEquals(typeof output.score, 'number');
  assertStringIncludes(output.criteria, 'correct');
});

Deno.test('reflect_verify - rejects missing output', async () => {
  const tool = findTool('reflect_verify');
  if (!tool) throw new Error('reflect_verify tool not found');

  const result = await tool.execute({ criteria: 'test' }, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, 'Output must be');
});

Deno.test('reflect_verify - rejects missing criteria', async () => {
  const tool = findTool('reflect_verify');
  if (!tool) throw new Error('reflect_verify tool not found');

  const result = await tool.execute({ output: 'test' }, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, 'Criteria must be');
});

Deno.test('reflect_improve - generates improvement suggestions', async () => {
  const tool = findTool('reflect_improve');
  if (!tool) throw new Error('reflect_improve tool not found');

  const reflectionResults = JSON.stringify({
    consensusLevel: 'low',
    score: 60,
    winner: 'con',
  });

  const result = await tool.execute({
    original_output: 'Short output',
    reflection_results: reflectionResults,
  }, mockContext);
  assertEquals(result.success, true);
  const output = JSON.parse(result.output);
  assertEquals(output.suggestions.length >= 1, true);
  assertEquals(typeof output.totalImprovements, 'number');
});

Deno.test('reflect_improve - rejects missing original_output', async () => {
  const tool = findTool('reflect_improve');
  if (!tool) throw new Error('reflect_improve tool not found');

  const result = await tool.execute({ reflection_results: '{}' }, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, 'original_output');
});

Deno.test('reflect_improve - rejects invalid JSON reflection_results', async () => {
  const tool = findTool('reflect_improve');
  if (!tool) throw new Error('reflect_improve tool not found');

  const result = await tool.execute({
    original_output: 'test',
    reflection_results: 'not-json',
  }, mockContext);
  assertEquals(result.success, false);
  assertStringIncludes(result.error, 'valid JSON');
});

Deno.test('tools array exported', () => {
  assertEquals(tools.length, 4);
  assertEquals(tools[0].definition.name, 'reflect_self_consistency');
  assertEquals(tools[1].definition.name, 'reflect_debate');
  assertEquals(tools[2].definition.name, 'reflect_verify');
  assertEquals(tools[3].definition.name, 'reflect_improve');
});
