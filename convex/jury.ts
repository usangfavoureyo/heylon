"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// --- JUROR IMPLEMENTATIONS ---

async function callOpenAI(context: any): Promise<"BUY" | "SELL" | "WAIT"> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.log("No OpenAI Key, outputting WAIT (Mock)");
        return "WAIT";
    }

    const prompt = `
    You are the HEYLON Intraday Jury. Your job is to validate trading signals for scalping (1H/4H structure).
    
    CONSTITUTION:
    1. IGNORE Daily/Weekly trends. Focus ONLY on Intraday Structure.
    2. A++ PRIORITY: Strong Impulse Zone Tap -> MSS = CONFIRMED.
    3. FORCE WAIT if Macro/News Risk is HIGH.
    
    SIGNAL CONTEXT:
    Symbol: ${context.symbol}
    Direction: ${context.signalDirection}
    Stage: ${context.stage}
    Structure Supports: ${JSON.stringify(context.contextSnapshot.supports || [])}
    Risk Blockers: ${JSON.stringify(context.contextSnapshot.blockers || [])}
    Macro Impact: ${context.contextSnapshot.macro_risk || "NONE"}
    
    TASK:
    Analyze the context. If High Risk Blockers exist, Verdict MUST be WAIT.
    If Structure Supports include "A_PLUS_PLUS_SEQUENCE", Verdict SHOULD be ${context.signalDirection === "BULLISH" ? "BUY" : "SELL"}.
    
    OUTPUT JSON ONLY: { "verdict": "BUY"|"SELL"|"WAIT", "confidence": "HIGH"|"LOW", "explanation": "Short reason" }
    `;

    try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-5.2", // 2026 Flagship
                messages: [{ role: "system", content: "You are a precise trading engine JSON outputter." }, { role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await res.json();
        const content = JSON.parse(data.choices[0].message.content);
        return content.verdict as "BUY" | "SELL" | "WAIT";
    } catch (e) {
        console.error("OpenAI Jury Error:", e);
        return "WAIT";
    }
}


async function callGemini(context: any): Promise<"BUY" | "SELL" | "WAIT"> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "WAIT";

    const prompt = `
    You are the HEYLON Intraday Jury. Validate this signal for scalping (1H/4H).
    Ignore Daily/Weekly trends. Focus on Intraday Structure (A++ Priority).
    FORCE WAIT if Macro Risk is HIGH.

    Context:
    Symbol: ${context.symbol}
    Direction: ${context.signalDirection}
    Stage: ${context.stage}
    Structure Supports: ${JSON.stringify(context.contextSnapshot.supports || [])}
     Risk Blockers: ${JSON.stringify(context.contextSnapshot.blockers || [])}
    Macro: ${context.contextSnapshot.macro_risk || "NONE"}

    Analyze. If Structure Supports "A_PLUS_PLUS_SEQUENCE", Verdict = ${context.signalDirection === "BULLISH" ? "BUY" : "SELL"}.
    If High Risk, Verdict = WAIT.
    
    Return JSON: { "verdict": "BUY"|"SELL"|"WAIT" }
    `;

    try {
        // Gemini 3 Flash Endpoint
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return "WAIT";
        const content = JSON.parse(text);
        return content.verdict as "BUY" | "SELL" | "WAIT";
    } catch (e) {
        console.error("Gemini Jury Error:", e);
        return "WAIT";
    }
}

async function callPerplexity(context: any): Promise<"BUY" | "SELL" | "WAIT"> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) return "WAIT";

    const prompt = `
    Role: HEYLON Intraday Algo Judge.
    Rule 1: Ignore Daily Trend. Focus on Intraday (1H/4H).
    Rule 2: A++ Sequence (Strong Tap + MSS) = CONFIRMED.
    Rule 3: Macro Risk = WAIT.

    Signal: ${context.symbol} ${context.signalDirection} (${context.stage})
    Supports: ${JSON.stringify(context.contextSnapshot.supports || [])}
    Blockers: ${JSON.stringify(context.contextSnapshot.blockers || [])}
    
    Verdict JSON: { "verdict": "BUY"|"SELL"|"WAIT" }
    `;

    try {
        const res = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Using sonar-reasoning-pro (CoT enabled)
                model: "sonar-reasoning-pro",
                messages: [
                    { role: "system", content: "You are a specialized trading algo. Output JSON only." },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await res.json();
        const content = JSON.parse(data.choices[0].message.content);
        return content.verdict as "BUY" | "SELL" | "WAIT";
    } catch (e) {
        console.error("Perplexity Jury Error:", e);
        return "WAIT";
    }
}

// Fallback Mock
async function mockLLMJuror(name: string, context: any): Promise<"BUY" | "SELL" | "WAIT"> {
    if (context.contextSnapshot?.supports?.includes("A_PLUS_PLUS_SEQUENCE")) {
        return context.signalDirection === "BULLISH" ? "BUY" : "SELL";
    }
    return "WAIT";
}

export const runJury = internalAction({
    args: {
        symbol: v.string(),
        signalId: v.optional(v.id("events_raw")), // Optional now
        signalDirection: v.union(v.literal("BULLISH"), v.literal("BEARISH")),
        contextSnapshot: v.any(),
        stage: v.union(v.literal("PRELIMINARY"), v.literal("FINAL"))
    },
    handler: async (ctx, args) => {
        console.log(`[JURY] Convening for ${args.symbol} (Stage: ${args.stage})...`);

        // 1. Parallel Jury Execution (OpenAI Real, Gemini Real, Perplexity Real)
        const [openai, gemini, perplexity] = await Promise.all([
            callOpenAI(args),
            callGemini(args),
            callPerplexity(args)
        ]);

        const votes = { openai, gemini, perplexity };

        // 2. Strict Consensus Logic
        // Rule: 2/3 Majority required. If hung or mixed, WAIT.
        let consensus: "BUY" | "SELL" | "WAIT" = "WAIT";
        let buyCount = 0;
        let sellCount = 0;

        Object.values(votes).forEach(vote => {
            if (vote === "BUY") buyCount++;
            if (vote === "SELL") sellCount++;
        });

        if (buyCount >= 2) consensus = "BUY";
        else if (sellCount >= 2) consensus = "SELL";
        else consensus = "WAIT";

        // 3. Determine Executability based on Stage
        // TAP (Preliminary) -> OPTIONAL
        // MSS (Final) -> CONFIRMED
        // WAIT -> BLOCKED (Always)
        let executability: "CONFIRMED" | "OPTIONAL" | "BLOCKED" = "BLOCKED";
        let confidence: "LOW" | "MEDIUM" | "HIGH" = "LOW";

        if (consensus !== "WAIT") {
            if (args.stage === "PRELIMINARY") {
                executability = "OPTIONAL";
                confidence = "MEDIUM";
            } else {
                executability = "CONFIRMED";
                confidence = "HIGH";
            }
        }

        // 4. Generate Explanation (Post-Hoc)
        const explanation = `Jury Verdict (${args.stage}): ${consensus}. Votes: OpenAI(${openai}), Gemini(${gemini}), Perplexity(${perplexity}). Authority: 2/3 Rule applied.`;

        // 5. Commit Verdict
        // 5. Commit Verdict
        await ctx.runMutation(internal.engine.commitJuryVerdict, {
            symbol: args.symbol,
            verdict: consensus,
            confidence,
            executability,
            stage: args.stage,
            votes,
            explanation,
        });

        // 6. FORENSIC LOGGING (Learning Logs)
        // 6. FORENSIC LOGGING (Learning Logs)
        // 6. FORENSIC LOGGING (Learning Logs)
        await ctx.runMutation(internal.logs.logDecision, {
            symbol: args.symbol,
            decision: consensus as "BUY" | "SELL" | "WAIT",
        });
    }


});
