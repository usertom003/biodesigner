"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Download, RefreshCw, Copy, Check, BarChart3 } from "lucide-react"

// Codon usage tables for different organisms
const codonUsageTables = {
  ecoli: {
    name: "Escherichia coli",
    codons: {
      // Alanine
      GCA: 0.21,
      GCC: 0.27,
      GCG: 0.36,
      GCT: 0.16,
      // Arginine
      AGA: 0.04,
      AGG: 0.02,
      CGA: 0.06,
      CGC: 0.4,
      CGG: 0.1,
      CGT: 0.38,
      // Asparagine
      AAC: 0.55,
      AAT: 0.45,
      // Aspartic Acid
      GAC: 0.37,
      GAT: 0.63,
      // Cysteine
      TGC: 0.55,
      TGT: 0.45,
      // Glutamic Acid
      GAA: 0.68,
      GAG: 0.32,
      // Glutamine
      CAA: 0.34,
      CAG: 0.66,
      // Glycine
      GGA: 0.11,
      GGC: 0.4,
      GGG: 0.15,
      GGT: 0.34,
      // Histidine
      CAC: 0.43,
      CAT: 0.57,
      // Isoleucine
      ATA: 0.07,
      ATC: 0.42,
      ATT: 0.51,
      // Leucine
      CTA: 0.04,
      CTC: 0.1,
      CTG: 0.5,
      CTT: 0.1,
      TTA: 0.13,
      TTG: 0.13,
      // Lysine
      AAA: 0.74,
      AAG: 0.26,
      // Methionine
      ATG: 1.0,
      // Phenylalanine
      TTC: 0.43,
      TTT: 0.57,
      // Proline
      CCA: 0.19,
      CCC: 0.12,
      CCG: 0.52,
      CCT: 0.16,
      // Serine
      AGC: 0.28,
      AGT: 0.15,
      TCA: 0.12,
      TCC: 0.15,
      TCG: 0.15,
      TCT: 0.15,
      // Threonine
      ACA: 0.13,
      ACC: 0.4,
      ACG: 0.27,
      ACT: 0.19,
      // Tryptophan
      TGG: 1.0,
      // Tyrosine
      TAC: 0.43,
      TAT: 0.57,
      // Valine
      GTA: 0.15,
      GTC: 0.22,
      GTG: 0.37,
      GTT: 0.26,
      // Stop Codons
      TAA: 0.61,
      TAG: 0.09,
      TGA: 0.3,
    },
  },
  yeast: {
    name: "Saccharomyces cerevisiae",
    codons: {
      // Alanine
      GCA: 0.21,
      GCC: 0.26,
      GCG: 0.11,
      GCT: 0.42,
      // Arginine
      AGA: 0.48,
      AGG: 0.21,
      CGA: 0.07,
      CGC: 0.06,
      CGG: 0.04,
      CGT: 0.14,
      // Asparagine
      AAC: 0.41,
      AAT: 0.59,
      // Aspartic Acid
      GAC: 0.35,
      GAT: 0.65,
      // Cysteine
      TGC: 0.37,
      TGT: 0.63,
      // Glutamic Acid
      GAA: 0.7,
      GAG: 0.3,
      // Glutamine
      CAA: 0.69,
      CAG: 0.31,
      // Glycine
      GGA: 0.22,
      GGC: 0.19,
      GGG: 0.12,
      GGT: 0.47,
      // Histidine
      CAC: 0.35,
      CAT: 0.65,
      // Isoleucine
      ATA: 0.27,
      ATC: 0.26,
      ATT: 0.47,
      // Leucine
      CTA: 0.14,
      CTC: 0.06,
      CTG: 0.11,
      CTT: 0.13,
      TTA: 0.28,
      TTG: 0.29,
      // Lysine
      AAA: 0.58,
      AAG: 0.42,
      // Methionine
      ATG: 1.0,
      // Phenylalanine
      TTC: 0.4,
      TTT: 0.6,
      // Proline
      CCA: 0.42,
      CCC: 0.15,
      CCG: 0.12,
      CCT: 0.31,
      // Serine
      AGC: 0.11,
      AGT: 0.16,
      TCA: 0.21,
      TCC: 0.16,
      TCG: 0.1,
      TCT: 0.26,
      // Threonine
      ACA: 0.3,
      ACC: 0.22,
      ACG: 0.13,
      ACT: 0.35,
      // Tryptophan
      TGG: 1.0,
      // Tyrosine
      TAC: 0.43,
      TAT: 0.57,
      // Valine
      GTA: 0.21,
      GTC: 0.18,
      GTG: 0.19,
      GTT: 0.42,
      // Stop Codons
      TAA: 0.47,
      TAG: 0.23,
      TGA: 0.3,
    },
  },
  human: {
    name: "Homo sapiens",
    codons: {
      // Alanine
      GCA: 0.23,
      GCC: 0.4,
      GCG: 0.11,
      GCT: 0.26,
      // Arginine
      AGA: 0.2,
      AGG: 0.2,
      CGA: 0.11,
      CGC: 0.19,
      CGG: 0.21,
      CGT: 0.08,
      // Asparagine
      AAC: 0.54,
      AAT: 0.46,
      // Aspartic Acid
      GAC: 0.54,
      GAT: 0.46,
      // Cysteine
      TGC: 0.55,
      TGT: 0.45,
      // Glutamic Acid
      GAA: 0.42,
      GAG: 0.58,
      // Glutamine
      CAA: 0.25,
      CAG: 0.75,
      // Glycine
      GGA: 0.25,
      GGC: 0.34,
      GGG: 0.25,
      GGT: 0.16,
      // Histidine
      CAC: 0.58,
      CAT: 0.42,
      // Isoleucine
      ATA: 0.16,
      ATC: 0.48,
      ATT: 0.36,
      // Leucine
      CTA: 0.07,
      CTC: 0.2,
      CTG: 0.41,
      CTT: 0.13,
      TTA: 0.07,
      TTG: 0.12,
      // Lysine
      AAA: 0.42,
      AAG: 0.58,
      // Methionine
      ATG: 1.0,
      // Phenylalanine
      TTC: 0.54,
      TTT: 0.46,
      // Proline
      CCA: 0.27,
      CCC: 0.33,
      CCG: 0.11,
      CCT: 0.28,
      // Serine
      AGC: 0.24,
      AGT: 0.15,
      TCA: 0.15,
      TCC: 0.22,
      TCG: 0.06,
      TCT: 0.18,
      // Threonine
      ACA: 0.28,
      ACC: 0.36,
      ACG: 0.12,
      ACT: 0.24,
      // Tryptophan
      TGG: 1.0,
      // Tyrosine
      TAC: 0.56,
      TAT: 0.44,
      // Valine
      GTA: 0.11,
      GTC: 0.24,
      GTG: 0.47,
      GTT: 0.18,
      // Stop Codons
      TAA: 0.28,
      TAG: 0.2,
      TGA: 0.52,
    },
  },
  bacillus: {
    name: "Bacillus subtilis",
    codons: {
      // Alanine
      GCA: 0.21,
      GCC: 0.17,
      GCG: 0.24,
      GCT: 0.38,
      // Arginine
      AGA: 0.26,
      AGG: 0.06,
      CGA: 0.07,
      CGC: 0.19,
      CGG: 0.06,
      CGT: 0.36,
      // Asparagine
      AAC: 0.4,
      AAT: 0.6,
      // Aspartic Acid
      GAC: 0.3,
      GAT: 0.7,
      // Cysteine
      TGC: 0.3,
      TGT: 0.7,
      // Glutamic Acid
      GAA: 0.7,
      GAG: 0.3,
      // Glutamine
      CAA: 0.6,
      CAG: 0.4,
      // Glycine
      GGA: 0.3,
      GGC: 0.2,
      GGG: 0.1,
      GGT: 0.4,
      // Histidine
      CAC: 0.3,
      CAT: 0.7,
      // Isoleucine
      ATA: 0.1,
      ATC: 0.3,
      ATT: 0.6,
      // Leucine
      CTA: 0.05,
      CTC: 0.1,
      CTG: 0.1,
      CTT: 0.2,
      TTA: 0.25,
      TTG: 0.3,
      // Lysine
      AAA: 0.7,
      AAG: 0.3,
      // Methionine
      ATG: 1.0,
      // Phenylalanine
      TTC: 0.4,
      TTT: 0.6,
      // Proline
      CCA: 0.2,
      CCC: 0.1,
      CCG: 0.3,
      CCT: 0.4,
      // Serine
      AGC: 0.15,
      AGT: 0.15,
      TCA: 0.15,
      TCC: 0.15,
      TCG: 0.1,
      TCT: 0.3,
      // Threonine
      ACA: 0.2,
      ACC: 0.2,
      ACG: 0.2,
      ACT: 0.4,
      // Tryptophan
      TGG: 1.0,
      // Tyrosine
      TAC: 0.4,
      TAT: 0.6,
      // Valine
      GTA: 0.2,
      GTC: 0.2,
      GTG: 0.2,
      GTT: 0.4,
      // Stop Codons
      TAA: 0.6,
      TAG: 0.1,
      TGA: 0.3,
    },
  },
  plant: {
    name: "Arabidopsis thaliana",
    codons: {
      // Alanine
      GCA: 0.22,
      GCC: 0.22,
      GCG: 0.15,
      GCT: 0.41,
      // Arginine
      AGA: 0.35,
      AGG: 0.16,
      CGA: 0.12,
      CGC: 0.09,
      CGG: 0.09,
      CGT: 0.19,
      // Asparagine
      AAC: 0.45,
      AAT: 0.55,
      // Aspartic Acid
      GAC: 0.4,
      GAT: 0.6,
      // Cysteine
      TGC: 0.45,
      TGT: 0.55,
      // Glutamic Acid
      GAA: 0.5,
      GAG: 0.5,
      // Glutamine
      CAA: 0.55,
      CAG: 0.45,
      // Glycine
      GGA: 0.35,
      GGC: 0.15,
      GGG: 0.15,
      GGT: 0.35,
      // Histidine
      CAC: 0.4,
      CAT: 0.6,
      // Isoleucine
      ATA: 0.2,
      ATC: 0.35,
      ATT: 0.45,
      // Leucine
      CTA: 0.1,
      CTC: 0.18,
      CTG: 0.12,
      CTT: 0.25,
      TTA: 0.15,
      TTG: 0.2,
      // Lysine
      AAA: 0.45,
      AAG: 0.55,
      // Methionine
      ATG: 1.0,
      // Phenylalanine
      TTC: 0.45,
      TTT: 0.55,
      // Proline
      CCA: 0.35,
      CCC: 0.15,
      CCG: 0.15,
      CCT: 0.35,
      // Serine
      AGC: 0.15,
      AGT: 0.15,
      TCA: 0.2,
      TCC: 0.15,
      TCG: 0.1,
      TCT: 0.25,
      // Threonine
      ACA: 0.3,
      ACC: 0.25,
      ACG: 0.15,
      ACT: 0.3,
      // Tryptophan
      TGG: 1.0,
      // Tyrosine
      TAC: 0.45,
      TAT: 0.55,
      // Valine
      GTA: 0.15,
      GTC: 0.2,
      GTG: 0.25,
      GTT: 0.4,
      // Stop Codons
      TAA: 0.4,
      TAG: 0.2,
      TGA: 0.4,
    },
  },
}

// Genetic code - codon to amino acid mapping
const geneticCode = {
  // Alanine
  GCA: "A",
  GCC: "A",
  GCG: "A",
  GCT: "A",
  // Arginine
  AGA: "R",
  AGG: "R",
  CGA: "R",
  CGC: "R",
  CGG: "R",
  CGT: "R",
  // Asparagine
  AAC: "N",
  AAT: "N",
  // Aspartic Acid
  GAC: "D",
  GAT: "D",
  // Cysteine
  TGC: "C",
  TGT: "C",
  // Glutamic Acid
  GAA: "E",
  GAG: "E",
  // Glutamine
  CAA: "Q",
  CAG: "Q",
  // Glycine
  GGA: "G",
  GGC: "G",
  GGG: "G",
  GGT: "G",
  // Histidine
  CAC: "H",
  CAT: "H",
  // Isoleucine
  ATA: "I",
  ATC: "I",
  ATT: "I",
  // Leucine
  CTA: "L",
  CTC: "L",
  CTG: "L",
  CTT: "L",
  TTA: "L",
  TTG: "L",
  // Lysine
  AAA: "K",
  AAG: "K",
  // Methionine
  ATG: "M",
  // Phenylalanine
  TTC: "F",
  TTT: "F",
  // Proline
  CCA: "P",
  CCC: "P",
  CCG: "P",
  CCT: "P",
  // Serine
  AGC: "S",
  AGT: "S",
  TCA: "S",
  TCC: "S",
  TCG: "S",
  TCT: "S",
  // Threonine
  ACA: "T",
  ACC: "T",
  ACG: "T",
  ACT: "T",
  // Tryptophan
  TGG: "W",
  // Tyrosine
  TAC: "Y",
  TAT: "Y",
  // Valine
  GTA: "V",
  GTC: "V",
  GTG: "V",
  GTT: "V",
  // Stop Codons
  TAA: "*",
  TAG: "*",
  TGA: "*",
}

// Amino acid to codon mapping (reverse of genetic code)
const aminoAcidToCodons: { [key: string]: string[] } = {}
Object.entries(geneticCode).forEach(([codon, aa]) => {
  if (!aminoAcidToCodons[aa]) {
    aminoAcidToCodons[aa] = []
  }
  aminoAcidToCodons[aa].push(codon)
})

// Helper function to get organism display name, can be kept or adapted
const getOrganismDisplayName = (orgId: string): string => {
  // This map can be expanded or loaded from config if needed
  const organismMap: { [key: string]: string } = {
    ecoli: "Escherichia coli",
    yeast: "Saccharomyces cerevisiae",
    human: "Homo sapiens",
    bacillus: "Bacillus subtilis",
    plant: "Arabidopsis thaliana",
  };
  return organismMap[orgId] || orgId;
};

export default function CodonOptimizer({ sequence, type }: { sequence: string; type: string }) {
  const [organism, setOrganism] = useState("ecoli")
  const [optimizationLevel, setOptimizationLevel] = useState(80) // Percentage
  const [avoidRestrictionSites, setAvoidRestrictionSites] = useState(true)
  // For now, we'll define a default list of sites to avoid if the switch is on
  const defaultRestrictionSitesToAvoid = ["GAATTC", "GGATCC", "AAGCTT"]; 
  const [avoidRNASecondaryStructures, setAvoidRNASecondaryStructures] = useState(true)
  const [optimizedSequence, setOptimizedSequence] = useState("")
  const [optimizationStats, setOptimizationStats] = useState<any>(null) // Will match CodonOptimizationResult structure
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Optimize sequence by calling the backend API
  const handleBackendOptimizeSequence = async () => {
    if (!sequence) {
      toast({
        title: "No sequence to optimize",
        description: "Please provide a DNA sequence for optimization.",
        variant: "destructive",
      })
      return
    }

    if (type !== "gene") {
      toast({
        title: "Not a coding sequence",
        description: "Codon optimization is only applicable to coding sequences (genes).",
        variant: "destructive",
      })
      return
    }

    setIsOptimizing(true)
    setOptimizedSequence("")
    setOptimizationStats(null)

    const requestBody = {
      sequence: sequence,
      target_organism: organism,
      optimization_strength: optimizationLevel / 100, // Convert percentage to 0-1 scale
      restriction_sites_to_avoid: avoidRestrictionSites ? defaultRestrictionSitesToAvoid : [],
      avoid_rna_secondary_structures: avoidRNASecondaryStructures,
    }

    try {
      const response = await fetch("/api/sequences/optimize-codons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to process optimization request." }))
        throw new Error(errorData.detail || `Optimization failed with status ${response.status}`)
      }

      const result = await response.json() // This should be CodonOptimizationResult

      setOptimizedSequence(result.optimized_sequence)
      setOptimizationStats({
        originalCAI: result.cai_before,
        optimizedCAI: result.cai_after,
        originalGC: result.gc_content_before,
        optimizedGC: result.gc_content_after,
        codonChanges: result.codon_change_details || [], // Ensure this matches backend field name
        changedCodons: result.changes_made,
        totalCodons: result.original_sequence.length / 3, // Approximate, or get from backend if available
        percentChanged: result.changes_made > 0 ? (result.changes_made / (result.original_sequence.length / 3)) * 100 : 0,
      })

      toast({
        title: "Optimization Complete",
        description: `Optimized ${result.changes_made} codons for ${getOrganismDisplayName(organism)}.`,
      })
    } catch (error: any) {
      console.error("Optimization error:", error)
      toast({
        title: "Optimization Failed",
        description: error.message || "An error occurred during codon optimization.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  // Client-side helper functions like calculateCAI, calculateGCContent, getReverseComplement are REMOVED
  // as this logic is now handled by the backend.

  // Copy optimized sequence to clipboard
  const copyToClipboard = () => {
    if (!optimizedSequence) return;
    navigator.clipboard.writeText(optimizedSequence)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Copied to clipboard",
      description: "The optimized sequence has been copied to your clipboard.",
    })
  }

  // Download optimized sequence
  const downloadSequence = () => {
    if (!optimizedSequence) return;
    const element = document.createElement("a")
    const file = new Blob(
      [
        `>Optimized_for_${getOrganismDisplayName(organism)}_${new Date().toISOString().slice(0, 10)}\\n${optimizedSequence}`,
      ],
      { type: "text/plain" },
    )
    element.href = URL.createObjectURL(file)
    element.download = `optimized_sequence_${organism}_${new Date().toISOString().slice(0, 10)}.fasta`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Sequence downloaded",
      description: "The optimized sequence has been downloaded as a FASTA file.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Codon Optimizer</h3>
        <Button onClick={handleBackendOptimizeSequence} disabled={isOptimizing || !sequence || type !== "gene"}>
          {isOptimizing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            "Optimize Codons"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organism">Target Organism</Label>
          <Select value={organism} onValueChange={setOrganism}>
            <SelectTrigger id="organism">
              <SelectValue placeholder="Select organism" />
            </SelectTrigger>
            <SelectContent>
              {/* Populate with actual organism IDs supported by backend */}
              <SelectItem value="ecoli">{getOrganismDisplayName("ecoli")}</SelectItem>
              <SelectItem value="yeast">{getOrganismDisplayName("yeast")}</SelectItem>
              <SelectItem value="human">{getOrganismDisplayName("human")}</SelectItem>
              <SelectItem value="bacillus">{getOrganismDisplayName("bacillus")}</SelectItem>
              <SelectItem value="plant">{getOrganismDisplayName("plant")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="optimization-level">Optimization Level: {optimizationLevel}%</Label>
          <Slider
            id="optimization-level"
            min={0}
            max={100}
            step={5}
            value={[optimizationLevel]}
            onValueChange={(value: number[]) => setOptimizationLevel(value[0])}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch id="avoid-restriction" checked={avoidRestrictionSites} onCheckedChange={setAvoidRestrictionSites} />
          <Label htmlFor="avoid-restriction">Avoid common restriction sites</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="avoid-rna"
            checked={avoidRNASecondaryStructures}
            onCheckedChange={setAvoidRNASecondaryStructures}
          />
          <Label htmlFor="avoid-rna">Avoid RNA secondary structures</Label>
        </div>
      </div>

      {optimizedSequence && optimizationStats && (
        <Tabs defaultValue="sequence">
          <TabsList className="w-full">
            <TabsTrigger value="sequence" className="flex-1">
              Optimized Sequence
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">
              Optimization Statistics
            </TabsTrigger>
            <TabsTrigger value="changes" className="flex-1">
              Codon Changes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sequence" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">
                Optimized for <span className="font-medium">{getOrganismDisplayName(organism)}</span>
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadSequence}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <Textarea value={optimizedSequence} readOnly className="font-mono text-xs h-40" />

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-3">
                <div className="text-sm font-medium mb-1">Original Sequence</div>
                <div className="text-xs text-muted-foreground mb-2">First 50 bases:</div>
                <div className="font-mono text-xs overflow-x-auto whitespace-pre">
                  {sequence.substring(0, 50)}
                  {sequence.length > 50 ? "..." : ""}
                </div>
              </div>
              <div className="border rounded-md p-3">
                <div className="text-sm font-medium mb-1">Optimized Sequence</div>
                <div className="text-xs text-muted-foreground mb-2">First 50 bases:</div>
                <div className="font-mono text-xs overflow-x-auto whitespace-pre">
                  {optimizedSequence.substring(0, 50)}
                  {optimizedSequence.length > 50 ? "..." : ""}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-4">
            {optimizationStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Codon Adaptation Index (CAI)</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Original:</span>
                      <span className="font-medium">{optimizationStats.originalCAI?.toFixed(3) || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Optimized:</span>
                      <span className="font-medium">{optimizationStats.optimizedCAI?.toFixed(3) || "N/A"}</span>
                    </div>
                    {typeof optimizationStats.originalCAI === 'number' && typeof optimizationStats.optimizedCAI === 'number' && optimizationStats.originalCAI !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Improvement:</span>
                      <span className="font-medium text-green-600">
                        {(((optimizationStats.optimizedCAI - optimizationStats.originalCAI) / optimizationStats.originalCAI) * 100).toFixed(1)}%
                      </span>
                    </div>
                    )}
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">GC Content</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Original:</span>
                      <span className="font-medium">{optimizationStats.originalGC?.toFixed(1) || "N/A"}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Optimized:</span>
                      <span className="font-medium">{optimizationStats.optimizedGC?.toFixed(1) || "N/A"}%</span>
                    </div>
                     {typeof optimizationStats.originalGC === 'number' && typeof optimizationStats.optimizedGC === 'number' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Change:</span>
                      <span
                        className={`font-medium ${
                          optimizationStats.optimizedGC > optimizationStats.originalGC
                            ? "text-green-600"
                            : optimizationStats.optimizedGC < optimizationStats.originalGC
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {(optimizationStats.optimizedGC - optimizationStats.originalGC).toFixed(1)}%
                      </span>
                    </div>
                     )}
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Optimization Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{optimizationStats.changedCodons || 0}</div>
                      <div className="text-sm text-muted-foreground">Codons Changed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{optimizationStats.totalCodons || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Codons</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{optimizationStats.percentChanged?.toFixed(1) || 0}%</div>
                      <div className="text-sm text-muted-foreground">Percent Changed</div>
                    </div>
                  </div>
                </div>

                {/* Placeholder for codon usage comparison chart */}
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Codon Usage Comparison</h4>
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    (Visualization of codon usage changes would be implemented here)
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Chart Placeholder
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="changes" className="space-y-4 mt-4">
            {optimizationStats && optimizationStats.codonChanges && optimizationStats.codonChanges.length > 0 ? (
              <div className="border rounded-md overflow-hidden max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Position
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amino Acid
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Original Codon
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Optimized Codon
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {optimizationStats.codonChanges.map((change: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{change.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{change.aa}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{change.original}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-600">
                          {change.optimized}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isOptimizing ? "Loading changes..." : (optimizedSequence ? "No codon changes were made or details are unavailable." : "Optimize a sequence to see codon changes.")}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!optimizedSequence && sequence && !isOptimizing && (
        <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
          <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground">
            Click "Optimize Codons" to generate an optimized sequence for your target organism.
          </p>
        </div>
      )}

      {!sequence && (
        <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
          <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground">No sequence available for optimization.</p>
        </div>
      )}
    </div>
  )
}
