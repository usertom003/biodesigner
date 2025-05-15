"use client"

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FlaskConical, ListChecks, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Corrispondono ai modelli Pydantic del backend
interface ProteinExpressionHost {
    name: string;
    type: string;
}

interface ProteinExpressionPlasmid {
    name: string;
    promoter: string;
    resistance_marker?: string;
}

interface ProteinExpressionRequest {
    gene_sequence: string;
    target_protein_name: string;
    host_system: ProteinExpressionHost;
    plasmid_construct: ProteinExpressionPlasmid;
    expression_parameters?: Record<string, any>;
    desired_yield_mg_l?: number;
}

interface ProteinExpressionStep {
    step_number: number;
    name: string;
    description: string;
    duration_hours?: number;
    status: string;
    notes?: string;
}

interface ProteinExpressionResult {
    workflow_id: string;
    request_details: ProteinExpressionRequest;
    predicted_success_rate?: number;
    estimated_yield_mg_l?: number;
    workflow_steps: ProteinExpressionStep[];
    warnings?: string[];
    next_steps_recommendations?: string[];
}

const availableHostTypes = [
    { value: "bacteria", label: "Bacterial (e.g., E. coli)" },
    { value: "yeast", label: "Yeast (e.g., S. cerevisiae)" },
    { value: "mammalian", label: "Mammalian (e.g., CHO, HEK293)" },
    { value: "insect", label: "Insect (e.g., Sf9, Hi5)" },
];

export default function ProteinExpressionWorkflow() {
    const [geneSequence, setGeneSequence] = useState<string>("");
    const [proteinName, setProteinName] = useState<string>("");
    const [hostType, setHostType] = useState<string>("bacteria");
    const [hostName, setHostName] = useState<string>("E. coli BL21(DE3)");
    const [plasmidName, setPlasmidName] = useState<string>("pET-28a");
    const [promoter, setPromoter] = useState<string>("T7");
    const [resistance, setResistance] = useState<string>("Kanamycin");
    const [expParams, setExpParams] = useState<string>("{ \"temperature_c\": 37, \"induction_method\": \"IPTG\", \"iptg_concentration_mm\": 0.5 }");
    const [desiredYield, setDesiredYield] = useState<string>("50");

    const [results, setResults] = useState<ProteinExpressionResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { toast } = useToast();

    useEffect(() => {
        // Auto-populate host name and promoter based on type for user convenience
        if (hostType === "bacteria") {
            setHostName("E. coli BL21(DE3)");
            setPromoter("T7");
        } else if (hostType === "yeast") {
            setHostName("S. cerevisiae INVSc1");
            setPromoter("GAL1");
        } else if (hostType === "mammalian"){
            setHostName("HEK293-T");
            setPromoter("CMV");
        } else {
            setHostName("");
            setPromoter("");
        }
    }, [hostType]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!geneSequence.trim() || !proteinName.trim() || !hostName.trim() || !plasmidName.trim() || !promoter.trim()) {
            toast({
                title: "Missing Required Fields",
                description: "Please fill in all required fields for expression workflow generation.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setResults(null);

        let parsedExpParams: Record<string, any> | undefined;
        if (expParams.trim()) {
            try {
                parsedExpParams = JSON.parse(expParams);
            } catch (error) {
                toast({
                    title: "Invalid Expression Parameters",
                    description: "Expression parameters must be a valid JSON object.",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }
        }

        const requestBody: ProteinExpressionRequest = {
            gene_sequence: geneSequence,
            target_protein_name: proteinName,
            host_system: { name: hostName, type: hostType },
            plasmid_construct: { name: plasmidName, promoter: promoter, resistance_marker: resistance || undefined },
            expression_parameters: parsedExpParams,
            desired_yield_mg_l: desiredYield ? parseFloat(desiredYield) : undefined,
        };

        try {
            const response = await fetch("/api/expression/workflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Failed to process workflow request." }));
                throw new Error(errorData.detail || `Workflow request failed with status ${response.status}`);
            }

            const data: ProteinExpressionResult = await response.json();
            setResults(data);

            toast({
                title: "Protein Expression Workflow Generated",
                description: `Workflow ID: ${data.workflow_id}`,
            });

        } catch (error: any) {
            console.error("Protein expression workflow error:", error);
            toast({
                title: "Workflow Generation Failed",
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
                <FlaskConical className="h-8 w-8 text-primary" />
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Protein Expression Workflow Designer</h2>
                    <p className="text-muted-foreground text-sm">
                        Plan and outline your protein expression experiments.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">1. Target & Gene</h3>
                    <div>
                        <Label htmlFor="protein-name">Target Protein Name</Label>
                        <Input id="protein-name" value={proteinName} onChange={(e: ChangeEvent<HTMLInputElement>) => setProteinName(e.target.value)} placeholder="e.g., Human Insulin, GFP" disabled={isLoading} />
                    </div>
                    <div>
                        <Label htmlFor="gene-sequence">Gene Sequence (DNA)</Label>
                        <Textarea id="gene-sequence" value={geneSequence} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setGeneSequence(e.target.value.toUpperCase())} placeholder="Enter DNA sequence (ATGC)..." rows={5} className="font-mono text-sm" disabled={isLoading} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">2. Expression System</h3>
                    <div>
                        <Label htmlFor="host-type">Host Type</Label>
                        <Select value={hostType} onValueChange={setHostType} disabled={isLoading}>
                            <SelectTrigger id="host-type"><SelectValue placeholder="Select host type" /></SelectTrigger>
                            <SelectContent>
                                {availableHostTypes.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="host-name">Host Strain/Cell Line Name</Label>
                        <Input id="host-name" value={hostName} onChange={(e: ChangeEvent<HTMLInputElement>) => setHostName(e.target.value)} placeholder="e.g., E. coli BL21(DE3)" disabled={isLoading} />
                    </div>
                     <div>
                        <Label htmlFor="plasmid-name">Plasmid/Vector Name</Label>
                        <Input id="plasmid-name" value={plasmidName} onChange={(e: ChangeEvent<HTMLInputElement>) => setPlasmidName(e.target.value)} placeholder="e.g., pET-28a, pcDNA3.1" disabled={isLoading} />
                    </div>
                    <div>
                        <Label htmlFor="promoter">Promoter</Label>
                        <Input id="promoter" value={promoter} onChange={(e: ChangeEvent<HTMLInputElement>) => setPromoter(e.target.value)} placeholder="e.g., T7, CMV, GAL1" disabled={isLoading} />
                    </div>
                     <div>
                        <Label htmlFor="resistance">Resistance Marker (Optional)</Label>
                        <Input id="resistance" value={resistance} onChange={(e: ChangeEvent<HTMLInputElement>) => setResistance(e.target.value)} placeholder="e.g., Kanamycin, Ampicillin" disabled={isLoading} />
                    </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                     <h3 className="text-lg font-medium text-primary">3. Parameters & Goal</h3>
                    <div>
                        <Label htmlFor="exp-params">Expression Parameters (Optional, JSON)</Label>
                        <Textarea id="exp-params" value={expParams} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setExpParams(e.target.value)} placeholder={'e.g., { "temperature_c": 18, "induction_duration_h": 16 }'} rows={3} className="font-mono text-xs" disabled={isLoading} />
                    </div>
                    <div>
                        <Label htmlFor="desired-yield">Desired Yield (mg/L, Optional)</Label>
                        <Input id="desired-yield" type="number" value={desiredYield} onChange={(e: ChangeEvent<HTMLInputElement>) => setDesiredYield(e.target.value)} placeholder="e.g., 100" disabled={isLoading} />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <Button type="submit" disabled={isLoading} className="w-full text-base py-3 px-6">
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Workflow...</>
                        ) : (
                            <><ListChecks className="mr-2 h-5 w-5" /> Generate Expression Workflow</>
                        )}
                    </Button>
                </div>
            </form>

            {results && (
                <div className="md:col-span-2 mt-8 space-y-6">
                    <h3 className="text-xl font-semibold tracking-tight border-b pb-2">Generated Workflow <span className='text-sm text-muted-foreground'>(ID: {results.workflow_id})</span></h3>
                    
                    {results.warnings && results.warnings.length > 0 && (
                        <div className="p-3 border border-yellow-300 bg-yellow-50 rounded-md">
                            <div className="flex items-center space-x-2"><AlertTriangle className="h-5 w-5 text-yellow-600" /><h4 className="font-medium text-yellow-700">Warnings</h4></div>
                            <ul className="list-disc list-inside mt-2 text-sm text-yellow-700 space-y-1">
                                {results.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <p className="text-sm"><strong>Target Protein:</strong> {results.request_details.target_protein_name}</p>
                        <p className="text-sm"><strong>Host:</strong> {results.request_details.host_system.name} ({results.request_details.host_system.type})</p>
                        <p className="text-sm"><strong>Plasmid:</strong> {results.request_details.plasmid_construct.name} (Promoter: {results.request_details.plasmid_construct.promoter})</p>
                        {results.predicted_success_rate !== undefined && <p className="text-sm"><strong>Predicted Success:</strong> <span className="font-semibold">{(results.predicted_success_rate * 100).toFixed(1)}%</span></p>}
                        {results.estimated_yield_mg_l !== undefined && <p className="text-sm"><strong>Estimated Yield:</strong> <span className="font-semibold">{results.estimated_yield_mg_l.toFixed(2)} mg/L</span></p>}
                    </div>

                    <h4 className="text-lg font-medium pt-4">Workflow Steps:</h4>
                    <div className="space-y-3">
                        {results.workflow_steps.map((step) => (
                            <div key={step.step_number} className="p-3 border rounded-md bg-background">
                                <div className="flex items-center justify-between">
                                    <h5 className="font-medium text-primary">Step {step.step_number}: {step.name}</h5>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${step.status === 'Planned' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{step.status}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                {step.duration_hours && <p className="text-xs text-muted-foreground mt-1">Est. Duration: {step.duration_hours} hours</p>}
                                {step.notes && <p className="text-xs italic mt-1">Notes: {step.notes}</p>}
                            </div>
                        ))}
                    </div>

                    {results.next_steps_recommendations && results.next_steps_recommendations.length > 0 && (
                        <div className="pt-4">
                            <h4 className="text-lg font-medium">Recommendations:</h4>
                            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                                {results.next_steps_recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 