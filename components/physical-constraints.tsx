"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, CheckCircle, AlertCircle, RefreshCw, Info } from "lucide-react"

export default function PhysicalConstraints({ nodes, edges }) {
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  // Analyze physical constraints
  const analyzeConstraints = () => {
    if (nodes.length === 0) {
      toast({
        title: "No components to analyze",
        description: "Add some genetic components to your design first.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    // Simulate analysis process
    setTimeout(() => {
      const results = {
        isValid: true,
        errors: [],
        warnings: [],
        info: [],
        constraints: {
          size: calculateTotalSize(nodes),
          topology: "circular", // or "linear"
          gcContent: calculateGCContent(nodes),
          repeats: findRepeats(nodes),
          inversions: findInversions(nodes),
          stericHindrances: findStericHindrances(nodes, edges),
          torsionalStress: calculateTorsionalStress(nodes, edges),
        },
      }

      // Check size constraints
      if (results.constraints.size > 15000) {
        results.warnings.push({
          type: "large_plasmid",
          message: `Plasmid size (${results.constraints.size.toLocaleString()} bp) is large and may have reduced transformation efficiency.`,
        })
      }

      // Check GC content
      if (results.constraints.gcContent < 30) {
        results.warnings.push({
          type: "low_gc_content",
          message: `Low GC content (${results.constraints.gcContent.toFixed(1)}%) may affect DNA stability and replication.`,
        })
      } else if (results.constraints.gcContent > 70) {
        results.warnings.push({
          type: "high_gc_content",
          message: `High GC content (${results.constraints.gcContent.toFixed(1)}%) may cause difficulties in PCR and sequencing.`,
        })
      }

      // Check for repeats
      if (results.constraints.repeats.length > 0) {
        results.warnings.push({
          type: "direct_repeats",
          message: `Found ${results.constraints.repeats.length} direct repeats that may cause recombination and instability.`,
        })
      }

      // Check for inversions
      if (results.constraints.inversions.length > 0) {
        results.warnings.push({
          type: "inversions",
          message: `Found ${results.constraints.inversions.length} inverted repeats that may form secondary structures.`,
        })
      }

      // Check for steric hindrances
      if (results.constraints.stericHindrances.length > 0) {
        results.errors.push({
          type: "steric_hindrance",
          message: `Found ${results.constraints.stericHindrances.length} potential steric hindrances between components.`,
          hindrances: results.constraints.stericHindrances,
        })
        results.isValid = false
      }

      // Check for torsional stress
      if (results.constraints.torsionalStress > 0.7) {
        results.warnings.push({
          type: "torsional_stress",
          message: `High torsional stress (${results.constraints.torsionalStress.toFixed(2)}) may affect DNA accessibility and gene expression.`,
        })
      }

      // Check component order and orientation
      const orderIssues = checkComponentOrder(nodes, edges)
      if (orderIssues.length > 0) {
        results.errors.push({
          type: "component_order",
          message: `Found ${orderIssues.length} issues with component order or orientation.`,
          issues: orderIssues,
        })
        results.isValid = false
      }

      // Check for missing essential components
      const missingComponents = checkMissingComponents(nodes)
      if (missingComponents.length > 0) {
        results.warnings.push({
          type: "missing_components",
          message: `Missing essential components: ${missingComponents.join(", ")}.`,
        })
      }

      setAnalysisResults(results)
      setIsAnalyzing(false)

      // Show toast notification
      if (!results.isValid) {
        toast({
          title: "Physical constraints violated",
          description: "The design contains errors that need to be fixed.",
          variant: "destructive",
        })
      } else if (results.warnings.length > 0) {
        toast({
          title: "Analysis completed with warnings",
          description: `Found ${results.warnings.length} issues that may need attention.`,
          variant: "warning",
        })
      } else {
        toast({
          title: "Analysis successful",
          description: "The design passed all physical constraint checks.",
        })
      }
    }, 1500)
  }

  // Calculate total size of the construct
  const calculateTotalSize = (nodes) => {
    let size = 0
    nodes.forEach((node) => {
      if (node.data.sequence) {
        size += node.data.sequence.length
      } else {
        // Estimate size for nodes without sequence
        switch (node.type) {
          case "promoter":
            size += 100
            break
          case "gene":
            size += 1000
            break
          case "terminator":
            size += 50
            break
          case "regulatory":
            size += 30
            break
          default:
            size += 100
        }
      }
    })
    return size
  }

  // Calculate GC content
  const calculateGCContent = (nodes) => {
    let totalLength = 0
    let gcCount = 0

    nodes.forEach((node) => {
      if (node.data.sequence) {
        const seq = node.data.sequence.toUpperCase()
        totalLength += seq.length
        gcCount += (seq.match(/[GC]/g) || []).length
      }
    })

    return totalLength > 0 ? (gcCount / totalLength) * 100 : 50
  }

  // Find direct repeats
  const findRepeats = (nodes) => {
    // Simplified implementation - in a real system this would analyze sequences
    // for direct repeats that could cause recombination
    const repeats = []

    // Simulate finding 0-2 repeats based on number of nodes
    const repeatCount = Math.min(2, Math.floor(nodes.length / 3))

    for (let i = 0; i < repeatCount; i++) {
      repeats.push({
        type: "direct_repeat",
        length: 20 + Math.floor(Math.random() * 80),
        position1: Math.floor(Math.random() * 1000),
        position2: Math.floor(Math.random() * 1000) + 1500,
      })
    }

    return repeats
  }

  // Find inverted repeats
  const findInversions = (nodes) => {
    // Simplified implementation - in a real system this would analyze sequences
    // for inverted repeats that could form secondary structures
    const inversions = []

    // Simulate finding 0-1 inversions based on number of nodes
    const inversionCount = Math.min(1, Math.floor(nodes.length / 4))

    for (let i = 0; i < inversionCount; i++) {
      inversions.push({
        type: "inverted_repeat",
        length: 10 + Math.floor(Math.random() * 40),
        position1: Math.floor(Math.random() * 1000),
        position2: Math.floor(Math.random() * 1000) + 1500,
      })
    }

    return inversions
  }

  // Find potential steric hindrances
  const findStericHindrances = (nodes, edges) => {
    // Simplified implementation - in a real system this would analyze
    // the 3D structure and potential steric clashes
    const hindrances = []

    // Check for components that are too close to each other
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNode = nodes.find((n) => n.id === edge.target)

      if (sourceNode && targetNode) {
        // Simulate finding hindrances based on node types
        if (sourceNode.type === "regulatory" && targetNode.type === "regulatory") {
          hindrances.push({
            type: "regulatory_interference",
            component1: sourceNode.data.name || sourceNode.data.label,
            component2: targetNode.data.name || targetNode.data.label,
            severity: "medium",
          })
        }
      }
    }

    return hindrances
  }

  // Calculate torsional stress
  const calculateTorsionalStress = (nodes, edges) => {
    // Simplified implementation - in a real system this would calculate
    // the torsional stress based on DNA supercoiling and component placement

    // Simulate torsional stress based on number of components and connections
    const baseStress = 0.3
    const componentFactor = nodes.length * 0.05
    const edgeFactor = edges.length * 0.03

    return Math.min(1.0, baseStress + componentFactor + edgeFactor)
  }

  // Check component order and orientation
  const checkComponentOrder = (nodes, edges) => {
    // Simplified implementation - in a real system this would check
    // if components are in the correct order and orientation
    const issues = []

    // Check if promoters are followed by genes
    const connectedPairs = edges.map((edge) => {
      const source = nodes.find((n) => n.id === edge.source)
      const target = nodes.find((n) => n.id === edge.target)
      return { source, target }
    })

    // Simulate finding issues based on connections
    connectedPairs.forEach((pair) => {
      if (pair.source && pair.target) {
        if (pair.source.type === "terminator" && pair.target.type === "gene") {
          issues.push({
            type: "incorrect_order",
            message: `Terminator (${pair.source.data.name || pair.source.data.label}) should not be followed by gene (${pair.target.data.name || pair.target.data.label})`,
            severity: "high",
          })
        }

        if (pair.source.type === "gene" && pair.target.type === "promoter") {
          issues.push({
            type: "incorrect_order",
            message: `Gene (${pair.source.data.name || pair.source.data.label}) should not be followed by promoter (${pair.target.data.name || pair.target.data.label}) without a terminator`,
            severity: "medium",
          })
        }
      }
    })

    return issues
  }

  // Check for missing essential components
  const checkMissingComponents = (nodes) => {
    const missingComponents = []

    // Check for essential component types
    const hasPromoter = nodes.some((node) => node.type === "promoter")
    const hasGene = nodes.some((node) => node.type === "gene")
    const hasTerminator = nodes.some((node) => node.type === "terminator")

    if (!hasPromoter) missingComponents.push("Promoter")
    if (!hasGene) missingComponents.push("Gene")
    if (!hasTerminator) missingComponents.push("Terminator")

    return missingComponents
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Physical Constraints Analysis</h3>
        <Button onClick={analyzeConstraints} disabled={isAnalyzing || nodes.length === 0}>
          {isAnalyzing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Constraints"
          )}
        </Button>
      </div>

      {analysisResults && (
        <Tabs defaultValue="summary">
          <TabsList className="w-full">
            <TabsTrigger value="summary" className="flex-1">
              Summary
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1">
              Detailed Analysis
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex-1">
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <div
              className={`p-4 border rounded-md ${
                !analysisResults.isValid
                  ? "bg-red-50 border-red-200"
                  : analysisResults.warnings.length > 0
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {!analysisResults.isValid ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : analysisResults.warnings.length > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className="font-medium">
                  {!analysisResults.isValid
                    ? "Physical Constraints Violated"
                    : analysisResults.warnings.length > 0
                      ? "Potential Physical Issues Detected"
                      : "Design Physically Valid"}
                </span>
              </div>
              <div className="mt-2 text-sm">
                {!analysisResults.isValid
                  ? "The design contains physical constraints that are violated and need to be fixed."
                  : analysisResults.warnings.length > 0
                    ? "The design has some physical issues that may need attention."
                    : "The design passed all physical constraint checks."}
              </div>
            </div>

            <div className="space-y-2">
              {analysisResults.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Physical Errors</h4>
                  {analysisResults.errors.map((error, index) => (
                    <Alert key={index} variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{error.type.replace(/_/g, " ")}</AlertTitle>
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {analysisResults.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">Physical Warnings</h4>
                  {analysisResults.warnings.map((warning, index) => (
                    <Alert
                      key={index}
                      variant="warning"
                      className="mb-2 bg-yellow-50 border-yellow-200 text-yellow-800"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{warning.type.replace(/_/g, " ")}</AlertTitle>
                      <AlertDescription>{warning.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {analysisResults.info.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Information</h4>
                  {analysisResults.info.map((info, index) => (
                    <Alert key={index} className="mb-2 bg-blue-50 border-blue-200 text-blue-800">
                      <Info className="h-4 w-4" />
                      <AlertTitle>{info.type.replace(/_/g, " ")}</AlertTitle>
                      <AlertDescription>{info.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Basic Properties</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Size:</span>
                    <span className="text-sm font-medium">{analysisResults.constraints.size.toLocaleString()} bp</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Topology:</span>
                    <span className="text-sm font-medium capitalize">{analysisResults.constraints.topology}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">GC Content:</span>
                    <span className="text-sm font-medium">{analysisResults.constraints.gcContent.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Torsional Stress:</span>
                    <span
                      className={`text-sm font-medium ${
                        analysisResults.constraints.torsionalStress > 0.7
                          ? "text-red-600"
                          : analysisResults.constraints.torsionalStress > 0.4
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {analysisResults.constraints.torsionalStress.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Structural Features</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Direct Repeats:</span>
                    <span className="text-sm font-medium">{analysisResults.constraints.repeats.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Inverted Repeats:</span>
                    <span className="text-sm font-medium">{analysisResults.constraints.inversions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Steric Hindrances:</span>
                    <span
                      className={`text-sm font-medium ${
                        analysisResults.constraints.stericHindrances.length > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {analysisResults.constraints.stericHindrances.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {analysisResults.constraints.repeats.length > 0 && (
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Direct Repeats</h4>
                <div className="space-y-2">
                  {analysisResults.constraints.repeats.map((repeat, index) => (
                    <div key={index} className="flex items-center justify-between border p-2 rounded-md bg-gray-50">
                      <div>
                        <span className="text-sm font-medium">Repeat {index + 1}</span>
                        <div className="text-xs text-muted-foreground">
                          {repeat.length} bp repeat at positions {repeat.position1} and {repeat.position2}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                        Potential Recombination
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResults.constraints.stericHindrances.length > 0 && (
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Steric Hindrances</h4>
                <div className="space-y-2">
                  {analysisResults.constraints.stericHindrances.map((hindrance, index) => (
                    <div key={index} className="flex items-center justify-between border p-2 rounded-md bg-gray-50">
                      <div>
                        <span className="text-sm font-medium">{hindrance.type.replace(/_/g, " ")}</span>
                        <div className="text-xs text-muted-foreground">
                          Between {hindrance.component1} and {hindrance.component2}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 capitalize">
                        {hindrance.severity} severity
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4 mt-4">
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-4">Recommendations to Improve Design</h4>

              <div className="space-y-4">
                {analysisResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-red-600">Critical Issues to Fix</h5>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysisResults.errors.map((error, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">{error.type.replace(/_/g, " ")}:</span>{" "}
                          {error.type === "steric_hindrance" ? (
                            <>
                              Increase the distance between components or reorient them to reduce steric hindrance.
                              {error.hindrances &&
                                error.hindrances.map((h, i) => (
                                  <div key={i} className="text-xs text-muted-foreground mt-1 ml-4">
                                    • Separate {h.component1} and {h.component2}
                                  </div>
                                ))}
                            </>
                          ) : error.type === "component_order" ? (
                            <>
                              Rearrange components to follow the correct genetic logic.
                              {error.issues &&
                                error.issues.map((issue, i) => (
                                  <div key={i} className="text-xs text-muted-foreground mt-1 ml-4">
                                    • {issue.message}
                                  </div>
                                ))}
                            </>
                          ) : (
                            "Fix the issue to ensure proper functioning of the genetic circuit."
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResults.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-yellow-600">Suggested Improvements</h5>
                    <ul className="list-disc pl-5 space-y-2">
                      {analysisResults.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">{warning.type.replace(/_/g, " ")}:</span>{" "}
                          {warning.type === "large_plasmid"
                            ? "Consider splitting the design into smaller plasmids or removing non-essential elements to improve transformation efficiency."
                            : warning.type === "low_gc_content"
                              ? "Consider codon optimization to increase GC content for better stability."
                              : warning.type === "high_gc_content"
                                ? "Consider codon optimization to decrease GC content for easier manipulation."
                                : warning.type === "direct_repeats"
                                  ? "Modify sequences to reduce direct repeats and minimize recombination risk."
                                  : warning.type === "missing_components"
                                    ? `Add the missing components: ${warning.message.split(": ")[1]}`
                                    : "Address this issue to improve the design's stability and performance."}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResults.errors.length === 0 && analysisResults.warnings.length === 0 && (
                  <div className="text-center text-green-600">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-80" />
                    <p>No issues found! Your design meets all physical constraints.</p>
                  </div>
                )}

                <div className="space-y-2 mt-6">
                  <h5 className="text-sm font-medium text-blue-600">General Best Practices</h5>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Maintain GC content between 40-60% for optimal stability and manipulation.</li>
                    <li>Avoid direct repeats longer than 20 bp to prevent recombination.</li>
                    <li>Ensure proper spacing between genetic elements (promoters, RBSs, genes).</li>
                    <li>Consider codon optimization for your expression host.</li>
                    <li>Add transcriptional terminators after each gene to prevent read-through.</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!analysisResults && (
        <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground">
            Click "Analyze Constraints" to check your design for physical constraints and issues.
          </p>
        </div>
      )}
    </div>
  )
}
