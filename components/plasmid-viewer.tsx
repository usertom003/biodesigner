"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Color palette for different feature types
const featureColors = {
  promoter: "#FFD700", // Gold
  gene: "#4CAF50", // Green
  terminator: "#F44336", // Red
  regulatory: "#9C27B0", // Purple
  origin: "#2196F3", // Blue
  marker: "#FF9800", // Orange
  misc: "#607D8B", // Blue Grey
}

export default function PlasmidViewer({ nodes, edges }) {
  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showLabels, setShowLabels] = useState(true)
  const [showFeatures, setShowFeatures] = useState(true)
  const [showRestrictionSites, setShowRestrictionSites] = useState(true)
  const [selectedEnzymes, setSelectedEnzymes] = useState(["EcoRI", "BamHI", "HindIII"])
  const [plasmidSize, setPlasmidSize] = useState(0)
  const [activeTab, setActiveTab] = useState("circular")
  const { toast } = useToast()

  // Common restriction enzymes
  const restrictionEnzymes = [
    { name: "EcoRI", sequence: "GAATTC", position: 120 },
    { name: "BamHI", sequence: "GGATCC", position: 350 },
    { name: "HindIII", sequence: "AAGCTT", position: 780 },
    { name: "XbaI", sequence: "TCTAGA", position: 1200 },
    { name: "PstI", sequence: "CTGCAG", position: 1500 },
    { name: "SalI", sequence: "GTCGAC", position: 1800 },
    { name: "SmaI", sequence: "CCCGGG", position: 2100 },
    { name: "KpnI", sequence: "GGTACC", position: 2400 },
    { name: "SacI", sequence: "GAGCTC", position: 2700 },
    { name: "XhoI", sequence: "CTCGAG", position: 3000 },
  ]

  // Calculate plasmid size based on nodes
  useEffect(() => {
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
    setPlasmidSize(size)
  }, [nodes])

  // Draw plasmid
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext("2d")
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35 * zoom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Save context state
    ctx.save()

    // Apply rotation
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    // Draw plasmid backbone
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw scale markers
    if (plasmidSize > 0) {
      const markerCount = 8
      for (let i = 0; i < markerCount; i++) {
        const angle = (i * 2 * Math.PI) / markerCount
        const markerX = centerX + Math.cos(angle) * (radius + 15)
        const markerY = centerY + Math.sin(angle) * (radius + 15)
        const bp = Math.round((i * plasmidSize) / markerCount)

        ctx.beginPath()
        ctx.moveTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius)
        ctx.lineTo(centerX + Math.cos(angle) * (radius + 10), centerY + Math.sin(angle) * (radius + 10))
        ctx.strokeStyle = "#666"
        ctx.lineWidth = 1
        ctx.stroke()

        if (showLabels) {
          ctx.fillStyle = "#666"
          ctx.font = "10px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(`${bp} bp`, markerX, markerY)
        }
      }
    }

    // Draw features
    if (showFeatures && nodes.length > 0) {
      let currentPosition = 0
      const totalLength = plasmidSize

      nodes.forEach((node, index) => {
        const nodeLength = node.data.sequence ? node.data.sequence.length : getEstimatedLength(node.type)
        const startAngle = (currentPosition / totalLength) * 2 * Math.PI
        const endAngle = ((currentPosition + nodeLength) / totalLength) * 2 * Math.PI

        // Draw feature arc
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.strokeStyle = featureColors[node.type] || featureColors.misc
        ctx.lineWidth = 10
        ctx.stroke()

        // Draw feature label
        if (showLabels) {
          const midAngle = (startAngle + endAngle) / 2
          const labelRadius = radius + 25
          const labelX = centerX + Math.cos(midAngle) * labelRadius
          const labelY = centerY + Math.sin(midAngle) * labelRadius

          // Adjust text rotation based on position
          ctx.save()
          ctx.translate(labelX, labelY)
          if (midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2) {
            ctx.rotate(midAngle + Math.PI)
          } else {
            ctx.rotate(midAngle)
          }
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillStyle = "#000"
          ctx.font = "bold 12px Arial"
          ctx.fillText(node.data.name || node.data.label, 0, 0)
          ctx.restore()
        }

        currentPosition += nodeLength
      })
    }

    // Draw restriction sites
    if (showRestrictionSites) {
      restrictionEnzymes
        .filter((enzyme) => selectedEnzymes.includes(enzyme.name))
        .forEach((enzyme) => {
          const angle = (enzyme.position / plasmidSize) * 2 * Math.PI
          const siteX = centerX + Math.cos(angle) * radius
          const siteY = centerY + Math.sin(angle) * radius

          // Draw site marker
          ctx.beginPath()
          ctx.arc(siteX, siteY, 5, 0, 2 * Math.PI)
          ctx.fillStyle = "#FF0000"
          ctx.fill()

          // Draw site label
          if (showLabels) {
            const labelRadius = radius - 20
            const labelX = centerX + Math.cos(angle) * labelRadius
            const labelY = centerY + Math.sin(angle) * labelRadius

            ctx.save()
            ctx.translate(labelX, labelY)
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillStyle = "#FF0000"
            ctx.font = "10px Arial"
            ctx.fillText(enzyme.name, 0, 0)
            ctx.restore()
          }
        })
    }

    // Restore context state
    ctx.restore()
  }, [nodes, edges, zoom, rotation, showLabels, showFeatures, showRestrictionSites, selectedEnzymes, plasmidSize])

  // Helper function to estimate length for nodes without sequence
  const getEstimatedLength = (type) => {
    switch (type) {
      case "promoter":
        return 100
      case "gene":
        return 1000
      case "terminator":
        return 50
      case "regulatory":
        return 30
      default:
        return 100
    }
  }

  // Export plasmid as image
  const exportPlasmid = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = `plasmid-${new Date().toISOString().slice(0, 10)}.png`
    link.click()

    toast({
      title: "Plasmid exported",
      description: "Your plasmid map has been exported as a PNG image.",
    })
  }

  // Toggle enzyme selection
  const toggleEnzyme = (enzyme) => {
    if (selectedEnzymes.includes(enzyme)) {
      setSelectedEnzymes(selectedEnzymes.filter((e) => e !== enzyme))
    } else {
      setSelectedEnzymes([...selectedEnzymes, enzyme])
    }
  }

  // Reset view
  const resetView = () => {
    setZoom(1)
    setRotation(0)
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="circular" className="flex-1">
            Circular Map
          </TabsTrigger>
          <TabsTrigger value="linear" className="flex-1">
            Linear Map
          </TabsTrigger>
          <TabsTrigger value="sites" className="flex-1">
            Restriction Sites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="circular" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              Plasmid Size: <span className="font-bold">{plasmidSize.toLocaleString()} bp</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(zoom + 0.1, 2))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRotation((rotation + 15) % 360)}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRotation((rotation - 15) % 360)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border rounded-md p-4 flex justify-center bg-white">
            <canvas ref={canvasRef} width={600} height={600} className="max-w-full" />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                <Label htmlFor="show-labels">Labels</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="show-features" checked={showFeatures} onCheckedChange={setShowFeatures} />
                <Label htmlFor="show-features">Features</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="show-sites" checked={showRestrictionSites} onCheckedChange={setShowRestrictionSites} />
                <Label htmlFor="show-sites">Restriction Sites</Label>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={exportPlasmid}>
              <Camera className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-2 mt-2">
            {featureColors &&
              Object.entries(featureColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                  <span className="text-xs capitalize">{type}</span>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="linear" className="space-y-4">
          <div className="border rounded-md p-4 bg-white">
            <div className="w-full h-[300px] flex items-center justify-center">
              <div className="w-full relative h-20">
                {/* Linear backbone */}
                <div className="absolute top-10 left-0 right-0 h-1 bg-black"></div>

                {/* Features */}
                {nodes.map((node, index) => {
                  const nodeLength = node.data.sequence ? node.data.sequence.length : getEstimatedLength(node.type)
                  const totalLength = plasmidSize
                  const startPercent =
                    (index === 0
                      ? 0
                      : nodes
                          .slice(0, index)
                          .reduce(
                            (acc, n) => acc + (n.data.sequence ? n.data.sequence.length : getEstimatedLength(n.type)),
                            0,
                          ) / totalLength) * 100
                  const widthPercent = (nodeLength / totalLength) * 100

                  return (
                    <div
                      key={node.id}
                      className="absolute h-8 flex items-center justify-center"
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                        top: "0px",
                        backgroundColor: featureColors[node.type] || featureColors.misc,
                        borderRadius: "4px",
                      }}
                    >
                      {widthPercent > 5 && (
                        <span className="text-xs text-white font-bold truncate px-1">
                          {node.data.name || node.data.label}
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Scale markers */}
                {Array.from({ length: 11 }).map((_, i) => {
                  const position = i * 10
                  return (
                    <div key={i} className="absolute" style={{ left: `${position}%` }}>
                      <div className="h-3 w-0.5 bg-gray-500 absolute top-[42px]"></div>
                      <div
                        className="absolute top-[60px] text-xs text-gray-500"
                        style={{ transform: "translateX(-50%)" }}
                      >
                        {Math.round((position / 100) * plasmidSize).toLocaleString()} bp
                      </div>
                    </div>
                  )
                })}

                {/* Restriction sites */}
                {showRestrictionSites &&
                  restrictionEnzymes
                    .filter((enzyme) => selectedEnzymes.includes(enzyme.name))
                    .map((enzyme) => {
                      const position = (enzyme.position / plasmidSize) * 100
                      return (
                        <div key={enzyme.name} className="absolute" style={{ left: `${position}%` }}>
                          <div className="h-4 w-0.5 bg-red-500 absolute top-[38px]"></div>
                          <div
                            className="absolute top-[20px] text-xs text-red-500 font-bold"
                            style={{ transform: "translateX(-50%)" }}
                          >
                            {enzyme.name}
                          </div>
                        </div>
                      )
                    })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <div className="border rounded-md p-4">
            <div className="grid grid-cols-2 gap-4">
              {restrictionEnzymes.map((enzyme) => (
                <div key={enzyme.name} className="flex items-center justify-between border p-2 rounded-md">
                  <div>
                    <div className="font-medium">{enzyme.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{enzyme.sequence}</div>
                    <div className="text-xs text-muted-foreground">Position: {enzyme.position} bp</div>
                  </div>
                  <Switch
                    checked={selectedEnzymes.includes(enzyme.name)}
                    onCheckedChange={() => toggleEnzyme(enzyme.name)}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
