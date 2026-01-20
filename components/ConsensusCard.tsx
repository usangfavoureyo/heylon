import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { OpenAILogo, GeminiLogo, PerplexityLogo } from "@/components/icons/LLMIcons";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSymbol } from "@/components/providers/SymbolProvider";

interface VoteProps {
    provider: string;
    decision: 'BUY' | 'SELL' | 'WAIT';
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

function VoteItem({ provider, decision, confidence }: VoteProps) {
    const colorMap = {
        BUY: "text-emerald-500",
        SELL: "text-red-500",
        WAIT: "text-neutral-500"
    };

    const IconMap = {
        BUY: CheckCircle,
        SELL: XCircle,
        WAIT: MinusCircle
    };

    const Icon = IconMap[decision];

    return (
        <div className="grid grid-cols-12 items-center py-3 border-b border-neutral-800 last:border-0">
            {/* Provider Column */}
            <div className="col-span-5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 shrink-0">
                    {provider === 'GPT-4o' && <OpenAILogo className="w-4 h-4 text-white" />}
                    {provider === 'Gemini' && <GeminiLogo className="w-4 h-4 text-blue-500" />}
                    {provider === 'Perplexity' && <PerplexityLogo className="w-4 h-4 text-teal-500" />}
                </div>
                <span className="text-sm font-normal text-neutral-200 truncate">{provider}</span>
            </div>

            {/* Confidence Column */}
            <div className="col-span-4 flex items-center">
                <span className="text-[10px] text-neutral-500 font-normal tracking-wider uppercase bg-neutral-900 px-2 py-1 rounded">
                    {confidence}
                </span>
            </div>

            {/* Decision Column */}
            <div className="col-span-3 flex items-center justify-end">
                <div className={cn("flex items-center gap-2 font-medium", colorMap[decision])}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{decision}</span>
                </div>
            </div>
        </div>
    )
}

export function ConsensusCard() {
    const { activeSymbol } = useSymbol();
    const state = useQuery(api.engine.getDecisionState, { symbol: activeSymbol || "NQ" });

    // Default / Loading State
    const votes: VoteProps[] = [
        { provider: 'OpenAI', decision: state?.jury?.votes?.openai || 'WAIT', confidence: 'MEDIUM' },
        { provider: 'Gemini', decision: state?.jury?.votes?.gemini || 'WAIT', confidence: 'MEDIUM' },
        { provider: 'Perplexity', decision: state?.jury?.votes?.perplexity || 'WAIT', confidence: 'MEDIUM' },
    ];

    const consensusVerdict = state?.jury?.consensus || "WAIT";
    const consensusBias = consensusVerdict === "BUY" ? "BULLISH" : consensusVerdict === "SELL" ? "BEARISH" : "NEUTRAL";
    const biasVariant = consensusBias === "BULLISH" ? "bias-buy" : consensusBias === "BEARISH" ? "bias-sell" : "bias-neutral";

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base">Consensus Engine</CardTitle>
                <Badge variant={biasVariant}>{consensusBias} BIAS</Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {votes.map((vote) => (
                        <VoteItem key={vote.provider} {...vote} />
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-800">
                    <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                        {state?.jury?.explanation ? (
                            <span>{state.jury.explanation}</span>
                        ) : (
                            <span className="text-neutral-600 italic">Waiting for Jury consensus...</span>
                        )}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
