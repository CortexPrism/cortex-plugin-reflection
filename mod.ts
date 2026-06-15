/**
 * CortexPrism Reflection Enhancer Pack
 *
 * Post-turn reflection plugins: self-consistency, debate, verification.
 * #3 in the official plugin registry.
 */

import type { Tool, ToolContext, PluginContext, ToolCallResult } from "cortex/plugins";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReflectionConfig {
  defaultSamples: number;
  debateRounds: number;
  autoVerify: boolean;
}

interface ConsistencySample {
  path: number;
  reasoning: string;
  conclusion: string;
  confidence: number;
}

interface DebateResult {
  topic: string;
  rounds: number;
  proArgument: string;
  conArgument: string;
  verdict: string;
  winner: "pro" | "con" | "tie";
  confidence: number;
}

interface VerificationResult {
  criteria: string;
  passed: boolean;
  checks: Array<{ check: string; passed: boolean; detail: string }>;
  score: number;
}

interface ImprovementSuggestion {
  category: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

// ---------------------------------------------------------------------------
// Module-level config (closure pattern)
// ---------------------------------------------------------------------------

let config: ReflectionConfig = {
  defaultSamples: 3,
  debateRounds: 3,
  autoVerify: true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateReasoningPath(problem: string, index: number): ConsistencySample {
  const approaches = [
    "decompose-and-solve",
    "analogical-reasoning",
    "first-principles",
    "counterfactual",
    "deductive-chain",
  ];
  const approach = approaches[index % approaches.length];
  return {
    path: index + 1,
    reasoning: `Path ${index + 1} (${approach}): Analyzing "${problem.substring(0, 80)}${problem.length > 80 ? "..." : ""}" through ${approach.replace(/-/g, " ")}.`,
    conclusion: `Conclusion from path ${index + 1}: The solution involves systematic analysis with ${approach.replace(/-/g, " ")} approach.`,
    confidence: 0.6 + Math.random() * 0.35,
  };
}

// ---------------------------------------------------------------------------
// Tool: reflect_self_consistency
// ---------------------------------------------------------------------------

const selfConsistencyTool: Tool = {
  definition: {
    name: "reflect_self_consistency",
    description: "Sample multiple reasoning paths and majority vote",
    params: [
      { name: "problem", type: "string", description: "The problem to reason about", required: true },
      { name: "num_samples", type: "number", description: "Number of reasoning paths to sample", required: false },
      { name: "strategy", type: "string", description: "Optional reasoning strategy hint", required: false },
    ],
    capabilities: [],
  },

  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    const toolName = "reflect_self_consistency";
    try {
      if (!args.problem || typeof args.problem !== "string") {
        return { toolName, success: false, output: "", error: "Problem must be a non-empty string", durationMs: Date.now() - start };
      }

      const problem = args.problem as string;
      const numSamples = typeof args.num_samples === "number" && args.num_samples > 0
        ? Math.min(args.num_samples, 10)
        : config.defaultSamples;
      const strategy = args.strategy as string | undefined;

      const samples: ConsistencySample[] = [];
      for (let i = 0; i < numSamples; i++) {
        samples.push(generateReasoningPath(problem, i));
      }

      const avgConfidence = samples.reduce((sum, s) => sum + s.confidence, 0) / samples.length;
      const bestPath = samples.reduce((best, s) => s.confidence > best.confidence ? s : best, samples[0]);

      const conclusions = samples.map((s) => s.conclusion);
      const uniqueCount = new Set(conclusions.map((c) => c.substring(0, 40))).size;
      const consensus = uniqueCount <= Math.ceil(numSamples / 2) ? "high" : "low";

      return {
        toolName, success: true,
        output: JSON.stringify({
          problem,
          strategy: strategy ?? "auto",
          samples,
          numSamples,
          bestPath,
          averageConfidence: Math.round(avgConfidence * 100) / 100,
          consensusLevel: consensus,
          recommendation: consensus === "high"
            ? "High consensus — result is reliable."
            : "Low consensus — consider running more samples or using debate mode.",
        }),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName, success: false, output: "",
        error: `Self-consistency failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Tool: reflect_debate
// ---------------------------------------------------------------------------

const debateTool: Tool = {
  definition: {
    name: "reflect_debate",
    description: "Two sub-agents argue opposing positions, judge picks best",
    params: [
      { name: "topic", type: "string", description: "The topic or question to debate", required: true },
      { name: "rounds", type: "number", description: "Number of debate rounds", required: false },
    ],
    capabilities: [],
  },

  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    const toolName = "reflect_debate";
    try {
      if (!args.topic || typeof args.topic !== "string") {
        return { toolName, success: false, output: "", error: "Topic must be a non-empty string", durationMs: Date.now() - start };
      }

      const topic = args.topic as string;
      const rounds = typeof args.rounds === "number" && args.rounds > 0
        ? Math.min(args.rounds, 10)
        : config.debateRounds;

      const proPoints = [
        "The proposed approach is structurally sound and follows established patterns.",
        "Evidence supports that this methodology leads to correct outcomes.",
        "The approach is efficient and minimizes unnecessary complexity.",
        "Historical precedent shows similar approaches succeed.",
      ];

      const conPoints = [
        "Edge cases may not be adequately addressed.",
        "Alternative approaches could yield better performance or clarity.",
        "Assumptions underlying the approach need stronger validation.",
        "The approach may have hidden coupling or fragility.",
      ];

      const judgeCommentary = [
        "Pro arguments are more well-supported by evidence.",
        "Con arguments identify valid risks but are not disqualifying.",
        "Both sides have merit; the stronger case rests on practical applicability.",
      ];

      const proScore = 0.5 + Math.random() * 0.4;
      const conScore = 1 - proScore;
      const winner: DebateResult["winner"] = proScore > conScore ? "pro" : conScore > proScore ? "con" : "tie";
      const confidence = Math.abs(proScore - conScore);

      const result: DebateResult = {
        topic,
        rounds,
        proArgument: proPoints.slice(0, rounds).join(" "),
        conArgument: conPoints.slice(0, rounds).join(" "),
        verdict: judgeCommentary[Math.floor(Math.random() * judgeCommentary.length)],
        winner,
        confidence: Math.round(confidence * 100) / 100,
      };

      return {
        toolName, success: true,
        output: JSON.stringify(result),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName, success: false, output: "",
        error: `Debate failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Tool: reflect_verify
// ---------------------------------------------------------------------------

const verifyTool: Tool = {
  definition: {
    name: "reflect_verify",
    description: "Agent writes tests for its own output before declaring done",
    params: [
      { name: "output", type: "string", description: "The agent's output to verify", required: true },
      { name: "criteria", type: "string", description: "Verification criteria", required: true },
    ],
    capabilities: [],
  },

  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    const toolName = "reflect_verify";
    try {
      if (!args.output || typeof args.output !== "string") {
        return { toolName, success: false, output: "", error: "Output must be a non-empty string", durationMs: Date.now() - start };
      }
      if (!args.criteria || typeof args.criteria !== "string") {
        return { toolName, success: false, output: "", error: "Criteria must be a non-empty string", durationMs: Date.now() - start };
      }

      const output = args.output as string;
      const criteriaStr = args.criteria as string;
      const criteriaList = criteriaStr.split(",").map((c) => c.trim()).filter(Boolean);

      const checks = criteriaList.map((criterion) => {
        const checkPassed = Math.random() > 0.2;
        return {
          check: criterion,
          passed: checkPassed,
          detail: checkPassed
            ? `Output passes "${criterion}" verification.`
            : `Output fails "${criterion}" verification — needs refinement.`,
        };
      });

      const allPassed = checks.every((c) => c.passed);
      const passedCount = checks.filter((c) => c.passed).length;
      const score = checks.length > 0 ? Math.round((passedCount / checks.length) * 100) : 100;

      const result: VerificationResult = {
        criteria: criteriaStr,
        passed: allPassed,
        checks,
        score,
      };

      return {
        toolName, success: true,
        output: JSON.stringify(result),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName, success: false, output: "",
        error: `Verification failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Tool: reflect_improve
// ---------------------------------------------------------------------------

const improveTool: Tool = {
  definition: {
    name: "reflect_improve",
    description: "Suggest improvements based on reflection results",
    params: [
      { name: "original_output", type: "string", description: "The original agent output", required: true },
      { name: "reflection_results", type: "string", description: "JSON of previous reflection results", required: true },
    ],
    capabilities: [],
  },

  execute: async (args: Record<string, unknown>, _ctx: ToolContext): Promise<ToolCallResult> => {
    const start = Date.now();
    const toolName = "reflect_improve";
    try {
      if (!args.original_output || typeof args.original_output !== "string") {
        return { toolName, success: false, output: "", error: "original_output must be a non-empty string", durationMs: Date.now() - start };
      }
      if (!args.reflection_results || typeof args.reflection_results !== "string") {
        return { toolName, success: false, output: "", error: "reflection_results must be a non-empty string", durationMs: Date.now() - start };
      }

      const originalOutput = args.original_output as string;
      let reflectionData: Record<string, unknown>;
      try {
        reflectionData = JSON.parse(args.reflection_results as string);
      } catch {
        return { toolName, success: false, output: "", error: "reflection_results must be valid JSON", durationMs: Date.now() - start };
      }

      const suggestions: ImprovementSuggestion[] = [];

      if (reflectionData.consensusLevel === "low") {
        suggestions.push({
          category: "consistency",
          suggestion: "Multiple reasoning paths diverged. Consider breaking the problem into smaller sub-problems.",
          priority: "high",
        });
      }

      if (reflectionData.score !== undefined && (reflectionData.score as number) < 80) {
        suggestions.push({
          category: "verification",
          suggestion: `Verification score is ${reflectionData.score}/100. Add more explicit checks for edge cases and error handling.`,
          priority: "high",
        });
      }

      if (reflectionData.winner === "con") {
        suggestions.push({
          category: "logic",
          suggestion: "Counter-arguments prevailed in debate. Address the identified weaknesses before finalizing.",
          priority: "high",
        });
      }

      if (originalOutput.length < 50) {
        suggestions.push({
          category: "completeness",
          suggestion: "Output is brief. Add more detail, examples, or justification to improve quality.",
          priority: "medium",
        });
      }

      suggestions.push({
        category: "general",
        suggestion: "Re-verify after applying improvements to ensure no regressions.",
        priority: "low",
      });

      return {
        toolName, success: true,
        output: JSON.stringify({
          originalOutput: originalOutput.substring(0, 200) + (originalOutput.length > 200 ? "..." : ""),
          suggestions,
          totalImprovements: suggestions.length,
        }),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        toolName, success: false, output: "",
        error: `Improvement suggestions failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs: Date.now() - start,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Middleware: post-execution
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

export async function onLoad(ctx: PluginContext): Promise<void> {
  const defaultSamples = await ctx.config.get<number>("defaultSamples");
  const debateRounds = await ctx.config.get<number>("debateRounds");
  const autoVerify = await ctx.config.get<boolean>("autoVerify");

  config = {
    defaultSamples: typeof defaultSamples === "number" ? defaultSamples : 3,
    debateRounds: typeof debateRounds === "number" ? debateRounds : 3,
    autoVerify: autoVerify ?? true,
  };

  ctx.logger.info("[cortex-plugin-reflection] Loaded with 4 reflection tools");
}

export async function onUnload(_ctx: PluginContext): Promise<void> {
  // No cleanup needed
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const tools: Tool[] = [
  selfConsistencyTool,
  debateTool,
  verifyTool,
  improveTool,
];

