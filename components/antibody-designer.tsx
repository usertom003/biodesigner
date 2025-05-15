"use client"

import { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, TestTube2, AlertTriangle } from 'lucide-react';

// Corrispondono ai modelli Pydantic del backend
interface AntibodyDesignRequest {
    target_antigen_sequence: string;
    design_parameters?: Record<string, any>;
}

interface DesignedAntibodyCandidate {
    vh_sequence: string;
    vl_sequence: string;
    predicted_affinity?: number;
    score?: number;
}

interface AntibodyDesignResult {
    request_id: string;
    candidates: DesignedAntibodyCandidate[];
    warnings?: string[];
}

export default function AntibodyDesigner() {
    const [antigenSequence, setAntigenSequence] = useState<string>("");
    const [designParams, setDesignParams] = useState<string>(""); // JSON string for simplicity
    const [results, setResults] = useState<AntibodyDesignResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { toast } = useToast();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!antigenSequence.trim()) {
            toast({
                title: "Antigen Sequence Required",
                description: "Please enter the target antigen sequence.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setResults(null);

        let parsedParams: Record<string, any> | undefined;
        if (designParams.trim()) {
            try {
                parsedParams = JSON.parse(designParams);
            } catch (error) {
                toast({
                    title: "Invalid Design Parameters",
                    description: "Design parameters must be a valid JSON object.",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }
        }

        const requestBody: AntibodyDesignRequest = {
            target_antigen_sequence: antigenSequence,
            design_parameters: parsedParams,
        };

        try {
            const response = await fetch("/api/antibodies/design", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Failed to process antibody design request." }));
                throw new Error(errorData.detail || `Design request failed with status ${response.status}`);
            }

            const data: AntibodyDesignResult = await response.json();
            setResults(data);

            toast({
                title: "Antibody Design Complete",
                description: `Found ${data.candidates.length} candidate(s). Request ID: ${data.request_id}`,
            });

        } catch (error: any) {
            console.error("Antibody design error:", error);
            toast({
                title: "Antibody Design Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-card text-card-foreground rounded-lg shadow">
            <div className="flex items-center space-x-3">
                <Wand2 className="h-8 w-8 text-primary" />
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Antibody Designer</h2>
                    <p className="text-muted-foreground text-sm">
                        Design novel antibody candidates against a target antigen.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="antigen-sequence" className="text-base font-medium">Target Antigen Sequence</Label>
                    <Textarea
                        id="antigen-sequence"
                        value={antigenSequence}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAntigenSequence(e.target.value.toUpperCase())}
                        placeholder="Enter protein or peptide sequence of the target antigen (e.g., MGSNKSPSKDHPLK...)"
                        rows={5}
                        className="mt-1 font-mono text-sm tracking-wider"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <Label htmlFor="design-params" className="text-base font-medium">Design Parameters (Optional, JSON format)</Label>
                    <Textarea
                        id="design-params"
                        value={designParams}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDesignParams(e.target.value)}
                        placeholder='e.g., { "target_epitopes": ["NKSPSK", "DHPLK"], "desired_affinity_nm": 10, "species": "human" }'
                        rows={3}
                        className="mt-1 font-mono text-xs"
                        disabled={isLoading}
                    />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-base py-3 px-6">
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Designing...</>
                    ) : (
                        <><Wand2 className="mr-2 h-5 w-5" /> Design Antibodies</>
                    )}
                </Button>
            </form>

            {results && (
                <div className="mt-8 space-y-6">
                    <h3 className="text-xl font-semibold tracking-tight border-b pb-2">Design Results <span className='text-sm text-muted-foreground'>(Request ID: {results.request_id})</span></h3>
                    
                    {results.warnings && results.warnings.length > 0 && (
                        <div className="p-3 border border-yellow-300 bg-yellow-50 rounded-md">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <h4 className="font-medium text-yellow-700">Warnings</h4>
                            </div>
                            <ul className="list-disc list-inside mt-2 text-sm text-yellow-700 space-y-1">
                                {results.warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results.candidates.length > 0 ? (
                        <div className="space-y-4">
                            {results.candidates.map((candidate, index) => (
                                <div key={index} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-background">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-medium text-primary">Candidate {index + 1}</h4>
                                        {candidate.score && (
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${candidate.score > 0.7 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                Score: {candidate.score.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Variable Heavy (VH) Sequence:</Label>
                                            <Textarea value={candidate.vh_sequence} readOnly rows={2} className="mt-1 font-mono text-xs bg-muted/30" />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Variable Light (VL) Sequence:</Label>
                                            <Textarea value={candidate.vl_sequence} readOnly rows={2} className="mt-1 font-mono text-xs bg-muted/30" />
                                        </div>
                                        {candidate.predicted_affinity !== undefined && (
                                            <p className="text-sm">
                                                Predicted Affinity: <span className="font-medium">{candidate.predicted_affinity.toFixed(2)} nM</span> (example unit)
                                            </p>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => navigator.clipboard.writeText(`VH: ${candidate.vh_sequence}\nVL: ${candidate.vl_sequence}`)}>
                                        <TestTube2 className="mr-2 h-3 w-3"/> Copy Sequences
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">No antibody candidates were generated for this request.</p>
                    )}
                </div>
            )}
        </div>
    );
} 