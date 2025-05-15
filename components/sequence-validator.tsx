"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, AlertTriangle, Info, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Helper function to format type names for display
const formatTypeName = (type: string | undefined): string => {
  if (!type) return "Unknown Type";
  return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

export default function SequenceValidator({ sequence, type }: { sequence: string; type: string }) {
  const [validationResults, setValidationResults] = useState<any>(null) // Will hold SequenceValidationResult from backend
  const [isValidating, setIsValidating] = useState(false)
  const { toast } = useToast()

  // Validate sequence by calling the backend API
  const handleBackendValidateSequence = async () => {
    if (!sequence) {
      toast({
        title: "No sequence to validate",
        description: "Please provide a DNA sequence for validation.",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)
    setValidationResults(null) // Clear previous results

    const requestBody = {
      sequence: sequence,
      sequence_type: "dna", // Assuming DNA for now, this could be made more flexible
      component_type: type, // Pass the component type (e.g., 'gene', 'promoter')
    }

    try {
      const response = await fetch("/api/sequences/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to process validation request." }))
        throw new Error(errorData.detail || `Validation failed with status ${response.status}`)
      }

      const results = await response.json() // This is SequenceValidationResult from backend
      setValidationResults(results)

      // Show toast notification based on backend results
      if (!results.is_valid) {
        toast({
          title: "Validation Failed",
          description: results.errors[0]?.message || "The sequence contains errors that need to be fixed.",
          variant: "destructive",
        })
      } else if (results.warnings.length > 0) {
        toast({
          title: "Validation Completed with Warnings",
          description: `Found ${results.warnings.length} issues that may need attention.`,
          variant: "warning", // Or a custom variant if available
        })
      } else {
        toast({
          title: "Validation Successful",
          description: "The sequence passed all validation checks.",
        })
      }
    } catch (error: any) {
      console.error("Validation error:", error)
      toast({
        title: "Validation Error",
        description: error.message || "An error occurred during sequence validation.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  // All client-side validation helper functions (calculateGCContent, countInvalidBases, etc.) are REMOVED.
  // The backend now handles all this logic.

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Sequence Validator</h3>
        <Button onClick={handleBackendValidateSequence} disabled={isValidating || !sequence}>
          {isValidating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : "Validate Sequence"}
        </Button>
      </div>

      {validationResults && (
        <Tabs defaultValue="summary">
          <TabsList className="w-full">
            <TabsTrigger value="summary" className="flex-1">
              Summary
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1">
              Detailed Analysis
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <div
              className={`p-4 border rounded-md ${
                !validationResults.is_valid
                  ? "bg-red-50 border-red-200 text-red-700"
                  : validationResults.warnings.length > 0
                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                    : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {!validationResults.is_valid ? (
                  <AlertCircle className="h-5 w-5" />
                ) : validationResults.warnings.length > 0 ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {!validationResults.is_valid
                    ? "Validation Failed"
                    : validationResults.warnings.length > 0
                      ? "Validation Completed with Warnings"
                      : "Validation Successful"}
                </span>
              </div>
              <div className="mt-2 text-sm">
                {!validationResults.is_valid
                  ? validationResults.errors[0]?.message || "The sequence contains errors that need to be fixed."
                  : validationResults.warnings.length > 0
                    ? "The sequence has some issues that may need attention."
                    : "The sequence passed all validation checks."}
              </div>
            </div>

            <div className="space-y-2">
              {validationResults.errors && validationResults.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Errors ({validationResults.errors.length})</h4>
                  {validationResults.errors.map((error: any, index: number) => (
                    <Alert key={index} variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{formatTypeName(error.type)}</AlertTitle>
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {validationResults.warnings && validationResults.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">Warnings ({validationResults.warnings.length})</h4>
                  {validationResults.warnings.map((warning: any, index: number) => (
                    <Alert
                      key={index}
                      className="mb-2 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-300"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{formatTypeName(warning.type)}</AlertTitle>
                      <AlertDescription>{warning.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {validationResults.info && validationResults.info.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Information ({validationResults.info.length})</h4>
                  {validationResults.info.map((infoItem: any, index: number) => (
                    <Alert key={index} className="mb-2 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-300">
                      <Info className="h-4 w-4" />
                      <AlertTitle>{formatTypeName(infoItem.type)}</AlertTitle>
                      <AlertDescription>{infoItem.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Sequence Features</h4>
              <div className="space-y-4">
                {validationResults.stats?.open_reading_frames && validationResults.stats.open_reading_frames.length > 0 ? (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Open Reading Frames ({validationResults.stats.open_reading_frames.length})</h5>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {validationResults.stats.open_reading_frames.map((orf: any, index: number) => (
                        <div key={index} className="flex items-center justify-between border p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                          <div>
                            <span className="text-sm font-medium">ORF {index + 1}</span>
                            <div className="text-xs text-muted-foreground">
                              Position: {orf.start + 1}-{orf.end + 1} (Frame {orf.frame})
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Length: {orf.length} bp ({Math.floor(orf.length / 3)} codons)
                            </div>
                             <Textarea readOnly value={orf.sequence} className="font-mono text-xs h-auto mt-1 p-1 text-[10px]" rows={1} />
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50">
                            Frame {orf.frame}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No significant open reading frames detected.</div>
                )}

                {validationResults.stats?.repeats && validationResults.stats.repeats.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Repeated Sequences ({validationResults.stats.repeats.length})</h5>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {validationResults.stats.repeats.map((repeat: any, index: number) => (
                        <div key={index} className="flex items-center justify-between border p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                          <div>
                            <span className="text-sm font-medium font-mono">{repeat.sequence} ({repeat.count}x)</span>
                            <div className="text-xs text-muted-foreground">
                              Positions: {repeat.positions?.map((pos:number) => pos + 1).join(", ") || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">Length: {repeat.length} bp</div>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50">
                            Repeat
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationResults.stats?.palindromes && validationResults.stats.palindromes.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Palindromic Sequences ({validationResults.stats.palindromes.length})</h5>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {validationResults.stats.palindromes.map((palindrome: any, index: number) => (
                        <div key={index} className="flex items-center justify-between border p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                          <div>
                            <span className="text-sm font-medium font-mono">{palindrome.sequence}</span>
                            <div className="text-xs text-muted-foreground">
                              Position: {palindrome.position + 1}-{palindrome.position + palindrome.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Length: {palindrome.length} bp</div>
                          </div>
                          <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700/50">
                            Palindrome
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-4">
            {validationResults.stats && (
            <>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Basic Statistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Sequence Length:</span>
                    <span className="text-sm font-medium">{validationResults.stats.length || 0} bp</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">GC Content:</span>
                    <span className="text-sm font-medium">{(validationResults.stats.gc_content || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Invalid Bases:</span>
                    <span className="text-sm font-medium">{validationResults.stats.invalid_bases || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Start Codon:</span>
                    <span className="text-sm font-medium">
                      {validationResults.stats.start_codon ? "Present" : "Absent"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Stop Codon:</span>
                    <span className="text-sm font-medium">
                      {validationResults.stats.stop_codon ? "Present" : "Absent"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Feature Counts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Open Reading Frames:</span>
                    <span className="text-sm font-medium">{validationResults.stats.open_reading_frames?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Repeated Sequences:</span>
                    <span className="text-sm font-medium">{validationResults.stats.repeats?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Palindromic Sequences:</span>
                    <span className="text-sm font-medium">{validationResults.stats.palindromes?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Errors:</span>
                    <span className="text-sm font-medium">{validationResults.errors?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Warnings:</span>
                    <span className="text-sm font-medium">{validationResults.warnings?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Base Composition</h4>
              {(sequence && sequence.length > 0) ? (
                <div className="grid grid-cols-4 gap-4">
                  {["A", "T", "G", "C"].map((base) => {
                    const count = (sequence.toUpperCase().match(new RegExp(base, "g")) || []).length
                    const percentage = sequence.length > 0 ? (count / sequence.length) * 100 : 0;
                    return (
                      <div key={base} className="flex flex-col items-center">
                        <div className="text-lg font-bold">{base}</div>
                        <div className="text-sm">{count} bases</div>
                        <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 dark:bg-gray-700">
                          <div
                            className={`h-2.5 rounded-full ${
                              base === "A"
                                ? "bg-green-500"
                                : base === "T"
                                  ? "bg-red-500"
                                  : base === "G"
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No sequence provided for base composition analysis.</div>
              )}
            </div>
            </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!validationResults && sequence && !isValidating && (
        <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground">
            Click "Validate Sequence" to check for errors and analyze your sequence.
          </p>
        </div>
      )}

      {!sequence && (
        <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <p className="text-muted-foreground">No sequence available for validation.</p>
        </div>
      )}
    </div>
  )
}
