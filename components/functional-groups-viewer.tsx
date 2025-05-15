"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ZoomIn, ZoomOut, Camera, Maximize } from "lucide-react"

// Functional group definitions
const functionalGroups = {
  // DNA backbone groups
  phosphate: {
    name: "Phosphate Group",
    color: "#FF5722",
    pattern: "PO4",
    description: "Negatively charged phosphate groups in the DNA backbone",
    category: "backbone",
  },
  deoxyribose: {
    name: "Deoxyribose",
    color: "#8BC34A",
    pattern: "C5H10O4",
    description: "The sugar component of the DNA backbone",
    category: "backbone",
  },

  // Nucleobases
  adenine: {
    name: "Adenine",
    color: "#2196F3",
    pattern: "A",
    description: "Purine nucleobase that pairs with thymine",
    category: "nucleobase",
  },
  thymine: {
    name: "Thymine",
    color: "#F44336",
    pattern: "T",
    description: "Pyrimidine nucleobase that pairs with adenine",
    category: "nucleobase",
  },
  guanine: {
    name: "Guanine",
    color: "#4CAF50",
    pattern: "G",
    description: "Purine nucleobase that pairs with cytosine",
    category: "nucleobase",
  },
  cytosine: {
    name: "Cytosine",
    color: "#FFC107",
    pattern: "C",
    description: "Pyrimidine nucleobase that pairs with guanine",
    category: "nucleobase",
  },

  // Amino acid functional groups
  aminoGroup: {
    name: "Amino Group",
    color: "#9C27B0",
    pattern: "NH2",
    description: "Found in amino acids, responsible for protein synthesis",
    category: "amino",
  },
  carboxylGroup: {
    name: "Carboxyl Group",
    color: "#E91E63",
    pattern: "COOH",
    description: "Found in amino acids, responsible for protein synthesis",
    category: "amino",
  },

  // Other functional groups
  hydroxyl: {
    name: "Hydroxyl Group",
    color: "#00BCD4",
    pattern: "OH",
    description: "Polar group found in alcohols and sugars",
    category: "other",
  },
  methyl: {
    name: "Methyl Group",
    color: "#607D8B",
    pattern: "CH3",
    description: "Common in DNA methylation, affects gene expression",
    category: "other",
  },
  carbonyl: {
    name: "Carbonyl Group",
    color: "#FF9800",
    pattern: "C=O",
    description: "Found in aldehydes and ketones",
    category: "other",
  },
}

export default function FunctionalGroupsViewer({ sequence, type }) {
  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [selectedGroups, setSelectedGroups] = useState(Object.keys(functionalGroups))
  const [viewMode, setViewMode] = useState("2d")
  const [showLabels, setShowLabels] = useState(true)
  const [highlightMode, setHighlightMode] = useState("all")
  const [groupCounts, setGroupCounts] = useState({})
  const { toast } = useToast()

  // Analyze sequence for functional groups
  useEffect(() => {
    if (!sequence) return

    const counts = {}
    Object.keys(functionalGroups).forEach((group) => {
      counts[group] = 0
    })

    // Count nucleobases
    const upperSeq = sequence.toUpperCase()
    for (let i = 0; i < upperSeq.length; i++) {
      const base = upperSeq[i]
      if (base === "A") counts.adenine++
      else if (base === "T") counts.thymine++
      else if (base === "G") counts.guanine++
      else if (base === "C") counts.cytosine++
    }

    // Estimate other groups based on sequence
    counts.phosphate = Math.max(0, sequence.length - 1) // One less than bases
    counts.deoxyribose = sequence.length

    // Estimate amino groups (if protein-coding)
    if (type === "gene") {
      counts.aminoGroup = Math.floor(sequence.length / 3) // Approximate one per codon
      counts.carboxylGroup = Math.floor(sequence.length / 3)
    }

    // Estimate methylation sites (CpG islands)
    let methylCount = 0
    for (let i = 0; i < upperSeq.length - 1; i++) {
      if (upperSeq[i] === "C" && upperSeq[i + 1] === "G") {
        methylCount++
      }
    }
    counts.methyl = methylCount

    // Estimate hydroxyl groups
    counts.hydroxyl = sequence.length // One per nucleotide

    // Estimate carbonyl groups
    counts.carbonyl = Math.floor(sequence.length * 0.5) // Rough estimate

    setGroupCounts(counts)
  }, [sequence, type])

  // Draw functional groups visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !sequence) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, width, height)

    // Apply zoom
    const effectiveWidth = width * zoom
    const effectiveHeight = height * zoom

    if (viewMode === "2d") {
      draw2DView(ctx, width, height, effectiveWidth, effectiveHeight)
    } else {
      draw3DView(ctx, width, height, effectiveWidth, effectiveHeight)
    }
  }, [sequence, zoom, selectedGroups, viewMode, showLabels, highlightMode])

  // Draw 2D view of functional groups
  const draw2DView = (ctx, width, height, effectiveWidth, effectiveHeight) => {
    if (!sequence) return

    const baseWidth = 30 * zoom
    const baseHeight = 30 * zoom
    const basesPerRow = Math.floor(effectiveWidth / baseWidth)
    const rows = Math.ceil(sequence.length / basesPerRow)

    // Draw sequence with highlighted functional groups
    for (let i = 0; i < sequence.length; i++) {
      const base = sequence[i].toUpperCase()
      const row = Math.floor(i / basesPerRow)
      const col = i % basesPerRow

      const x = col * baseWidth + 10
      const y = row * baseHeight + 10

      // Draw base background
      let baseColor = "#EEEEEE"
      if (base === "A" && selectedGroups.includes("adenine")) baseColor = functionalGroups.adenine.color + "40"
      else if (base === "T" && selectedGroups.includes("thymine")) baseColor = functionalGroups.thymine.color + "40"
      else if (base === "G" && selectedGroups.includes("guanine")) baseColor = functionalGroups.guanine.color + "40"
      else if (base === "C" && selectedGroups.includes("cytosine")) baseColor = functionalGroups.cytosine.color + "40"

      ctx.fillStyle = baseColor
      ctx.fillRect(x, y, baseWidth - 2, baseHeight - 2)

      // Draw base letter
      ctx.fillStyle = "#000000"
      ctx.font = `${14 * zoom}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(base, x + baseWidth / 2, y + baseHeight / 2)

      // Draw functional group indicators
      if (i < sequence.length - 1 && selectedGroups.includes("phosphate")) {
        // Phosphate group between bases
        ctx.fillStyle = functionalGroups.phosphate.color
        ctx.beginPath()
        ctx.arc(x + baseWidth, y + baseHeight / 2, 3 * zoom, 0, 2 * Math.PI)
        ctx.fill()

        if (showLabels && zoom > 0.8) {
          ctx.fillStyle = functionalGroups.phosphate.color
          ctx.font = `${8 * zoom}px Arial`
          ctx.fillText("P", x + baseWidth, y + baseHeight / 2 - 8 * zoom)
        }
      }

      if (selectedGroups.includes("deoxyribose")) {
        // Deoxyribose for each base
        ctx.fillStyle = functionalGroups.deoxyribose.color
        ctx.beginPath()
        ctx.arc(x + baseWidth / 2, y + baseHeight - 5 * zoom, 3 * zoom, 0, 2 * Math.PI)
        ctx.fill()

        if (showLabels && zoom > 0.8) {
          ctx.fillStyle = functionalGroups.deoxyribose.color
          ctx.font = `${8 * zoom}px Arial`
          ctx.fillText("D", x + baseWidth / 2, y + baseHeight - 5 * zoom - 8 * zoom)
        }
      }

      // Special case for CpG (potential methylation site)
      if (
        i < sequence.length - 1 &&
        sequence[i].toUpperCase() === "C" &&
        sequence[i + 1].toUpperCase() === "G" &&
        selectedGroups.includes("methyl")
      ) {
        ctx.fillStyle = functionalGroups.methyl.color
        ctx.beginPath()
        ctx.arc(x + baseWidth - 5 * zoom, y + 5 * zoom, 4 * zoom, 0, 2 * Math.PI)
        ctx.fill()

        if (showLabels && zoom > 0.8) {
          ctx.fillStyle = functionalGroups.methyl.color
          ctx.font = `${8 * zoom}px Arial`
          ctx.fillText("CH3", x + baseWidth - 5 * zoom, y + 5 * zoom - 8 * zoom)
        }
      }
    }

    // Draw legend if zoomed enough
    if (zoom >= 0.6) {
      const legendX = 10
      const legendY = rows * baseHeight + 30

      ctx.fillStyle = "#000000"
      ctx.font = `${12 * zoom}px Arial bold`
      ctx.textAlign = "left"
      ctx.fillText("Functional Groups Legend:", legendX, legendY)

      let legendItemX = legendX
      let legendItemY = legendY + 20

      selectedGroups.forEach((groupKey) => {
        const group = functionalGroups[groupKey]

        // Draw color box
        ctx.fillStyle = group.color
        ctx.fillRect(legendItemX, legendItemY, 15 * zoom, 15 * zoom)

        // Draw label
        ctx.fillStyle = "#000000"
        ctx.font = `${10 * zoom}px Arial`
        ctx.fillText(group.name, legendItemX + 20 * zoom, legendItemY + 10 * zoom)

        legendItemX += 150 * zoom
        if (legendItemX > width - 150 * zoom) {
          legendItemX = legendX
          legendItemY += 25 * zoom
        }
      })
    }
  }

  // Draw 3D view of functional groups (simplified)
  const draw3DView = (ctx, width, height, effectiveWidth, effectiveHeight) => {
    if (!sequence) return

    ctx.fillStyle = "#000000"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.fillText("3D View - Simplified Representation", width / 2, 30)

    // Draw double helix backbone
    const centerX = width / 2
    const startY = 60
    const endY = height - 60
    const radius = 100 * zoom
    const turns = Math.min(10, Math.max(3, sequence.length / 10))
    const pointsPerTurn = 20

    // Draw first strand
    ctx.strokeStyle = selectedGroups.includes("phosphate") ? functionalGroups.phosphate.color : "#CCCCCC"
    ctx.lineWidth = 4 * zoom
    ctx.beginPath()

    for (let i = 0; i <= turns * pointsPerTurn; i++) {
      const t = i / pointsPerTurn
      const angle = t * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = startY + (endY - startY) * (t / turns)

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)

      // Draw nucleobases at intervals
      if (i % 2 === 0 && i / 2 < sequence.length) {
        const baseIndex = i / 2
        const base = sequence[baseIndex].toUpperCase()
        let baseColor = "#999999"

        if (base === "A" && selectedGroups.includes("adenine")) baseColor = functionalGroups.adenine.color
        else if (base === "T" && selectedGroups.includes("thymine")) baseColor = functionalGroups.thymine.color
        else if (base === "G" && selectedGroups.includes("guanine")) baseColor = functionalGroups.guanine.color
        else if (base === "C" && selectedGroups.includes("cytosine")) baseColor = functionalGroups.cytosine.color

        // Draw base
        ctx.save()
        ctx.fillStyle = baseColor
        ctx.beginPath()
        ctx.arc(x, y, 6 * zoom, 0, 2 * Math.PI)
        ctx.fill()

        if (showLabels && zoom > 0.8) {
          ctx.fillStyle = "#FFFFFF"
          ctx.font = `${10 * zoom}px Arial bold`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(base, x, y)
        }
        ctx.restore()
      }
    }
    ctx.stroke()

    // Draw second strand
    ctx.strokeStyle = selectedGroups.includes("phosphate") ? functionalGroups.phosphate.color : "#CCCCCC"
    ctx.lineWidth = 4 * zoom
    ctx.beginPath()

    for (let i = 0; i <= turns * pointsPerTurn; i++) {
      const t = i / pointsPerTurn
      const angle = t * Math.PI * 2 + Math.PI
      const x = centerX + Math.cos(angle) * radius
      const y = startY + (endY - startY) * (t / turns)

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)

      // Draw complementary bases at intervals
      if (i % 2 === 0 && i / 2 < sequence.length) {
        const baseIndex = i / 2
        let base = "A"
        if (baseIndex < sequence.length) {
          const originalBase = sequence[baseIndex].toUpperCase()
          if (originalBase === "A") base = "T"
          else if (originalBase === "T") base = "A"
          else if (originalBase === "G") base = "C"
          else if (originalBase === "C") base = "G"
        }

        let baseColor = "#999999"
        if (base === "A" && selectedGroups.includes("adenine")) baseColor = functionalGroups.adenine.color
        else if (base === "T" && selectedGroups.includes("thymine")) baseColor = functionalGroups.thymine.color
        else if (base === "G" && selectedGroups.includes("guanine")) baseColor = functionalGroups.guanine.color
        else if (base === "C" && selectedGroups.includes("cytosine")) baseColor = functionalGroups.cytosine.color

        // Draw base
        ctx.save()
        ctx.fillStyle = baseColor
        ctx.beginPath()
        ctx.arc(x, y, 6 * zoom, 0, 2 * Math.PI)
        ctx.fill()

        if (showLabels && zoom > 0.8) {
          ctx.fillStyle = "#FFFFFF"
          ctx.font = `${10 * zoom}px Arial bold`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(base, x, y)
        }
        ctx.restore()
      }
    }
    ctx.stroke()

    // Draw hydrogen bonds between base pairs
    if (selectedGroups.includes("hydroxyl")) {
      ctx.strokeStyle = functionalGroups.hydroxyl.color
      ctx.lineWidth = 1 * zoom

      for (let i = 0; i <= turns * pointsPerTurn; i += 2) {
        if (i / 2 >= sequence.length) break

        const t = i / pointsPerTurn
        const angle1 = t * Math.PI * 2
        const angle2 = t * Math.PI * 2 + Math.PI
        const x1 = centerX + Math.cos(angle1) * radius
        const y1 = startY + (endY - startY) * (t / turns)
        const x2 = centerX + Math.cos(angle2) * radius
        const y2 = startY + (endY - startY) * (t / turns)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }

    // Draw deoxyribose groups if selected
    if (selectedGroups.includes("deoxyribose")) {
      ctx.fillStyle = functionalGroups.deoxyribose.color

      for (let i = 0; i <= turns * pointsPerTurn; i += 2) {
        if (i / 2 >= sequence.length) break

        const t = i / pointsPerTurn

        // First strand
        const angle1 = t * Math.PI * 2
        const x1 = centerX + Math.cos(angle1) * (radius - 15 * zoom)
        const y1 = startY + (endY - startY) * (t / turns)

        ctx.beginPath()
        ctx.arc(x1, y1, 4 * zoom, 0, 2 * Math.PI)
        ctx.fill()

        // Second strand
        const angle2 = t * Math.PI * 2 + Math.PI
        const x2 = centerX + Math.cos(angle2) * (radius - 15 * zoom)
        const y2 = startY + (endY - startY) * (t / turns)

        ctx.beginPath()
        ctx.arc(x2, y2, 4 * zoom, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  }

  // Toggle functional group selection
  const toggleGroup = (group) => {
    if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter((g) => g !== group))
    } else {
      setSelectedGroups([...selectedGroups, group])
    }
  }

  // Select groups by category
  const selectGroupsByCategory = (category) => {
    const groupsInCategory = Object.keys(functionalGroups).filter((key) => functionalGroups[key].category === category)
    setSelectedGroups(groupsInCategory)
  }

  // Select all groups
  const selectAllGroups = () => {
    setSelectedGroups(Object.keys(functionalGroups))
  }

  // Clear all selected groups
  const clearAllGroups = () => {
    setSelectedGroups([])
  }

  // Export visualization as image
  const exportImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = `functional-groups-${new Date().toISOString().slice(0, 10)}.png`
    link.click()

    toast({
      title: "Image exported",
      description: "The functional groups visualization has been exported as a PNG image.",
    })
  }

  // Reset view
  const resetView = () => {
    setZoom(1)
    setSelectedGroups(Object.keys(functionalGroups))
    setShowLabels(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Functional Groups Viewer</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "2d" ? "3d" : "2d")}>
            Switch to {viewMode === "2d" ? "3D" : "2D"} View
          </Button>
          <Button variant="outline" size="sm" onClick={exportImage}>
            <Camera className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="viewer">
        <TabsList className="w-full">
          <TabsTrigger value="viewer" className="flex-1">
            Visualization
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">
            Functional Groups
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viewer" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(zoom + 0.1, 2))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
              <Label htmlFor="show-labels">Show Labels</Label>
            </div>
          </div>

          <div className="border rounded-md p-4 bg-white overflow-auto">
            {sequence ? (
              <canvas ref={canvasRef} width={800} height={600} className="max-w-full" />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                No sequence available for functional group analysis.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllGroups}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllGroups}>
                Clear All
              </Button>
            </div>
            <Select
              value={highlightMode}
              onValueChange={(value) => {
                setHighlightMode(value)
                if (value !== "all") {
                  selectGroupsByCategory(value)
                } else {
                  selectAllGroups()
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="backbone">DNA Backbone</SelectItem>
                <SelectItem value="nucleobase">Nucleobases</SelectItem>
                <SelectItem value="amino">Amino Acid Groups</SelectItem>
                <SelectItem value="other">Other Groups</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(functionalGroups).map(([key, group]) => (
              <div
                key={key}
                className={`flex items-center justify-between border rounded-md p-3 cursor-pointer ${
                  selectedGroups.includes(key) ? "bg-gray-100 border-gray-400" : ""
                }`}
                onClick={() => toggleGroup(key)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }}></div>
                  <div>
                    <div className="font-medium">{group.name}</div>
                    <div className="text-xs text-muted-foreground">{group.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {group.category}
                  </Badge>
                  <div className="w-5 h-5 rounded-full border flex items-center justify-center">
                    {selectedGroups.includes(key) && <div className="w-3 h-3 rounded-full bg-black"></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-4">Functional Group Distribution</h4>

            {sequence ? (
              <div className="space-y-4">
                {Object.entries(functionalGroups).map(([key, group]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></div>
                        <span className="font-medium">{group.name}</span>
                      </div>
                      <span>{groupCounts[key] || 0} occurrences</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, ((groupCounts[key] || 0) / sequence.length) * 100)}%`,
                          backgroundColor: group.color,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(((groupCounts[key] || 0) / sequence.length) * 100).toFixed(1)}% of sequence
                    </div>
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t">
                  <h5 className="font-medium mb-2">Summary Statistics</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-3">
                      <div className="text-sm font-medium">Nucleobase Ratio</div>
                      <div className="text-2xl font-bold mt-1">
                        {((groupCounts.guanine || 0) + (groupCounts.cytosine || 0)) /
                          ((groupCounts.adenine || 0) + (groupCounts.thymine || 0) + 0.001).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">GC:AT ratio</div>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="text-sm font-medium">Potential Methylation Sites</div>
                      <div className="text-2xl font-bold mt-1">{groupCounts.methyl || 0}</div>
                      <div className="text-xs text-muted-foreground">CpG sites</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sequence available for statistical analysis.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
