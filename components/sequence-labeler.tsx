"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Save, Trash2 } from "lucide-react"

export default function SequenceLabeler({ sequence, onSaveLabels }) {
  const [labels, setLabels] = useState([])
  const [newLabelStart, setNewLabelStart] = useState("")
  const [newLabelEnd, setNewLabelEnd] = useState("")
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelColor, setNewLabelColor] = useState("#10b981")
  const [highlightedSequence, setHighlightedSequence] = useState("")

  useEffect(() => {
    updateHighlightedSequence()
  }, [sequence, labels])

  const addLabel = () => {
    if (!newLabelName || !newLabelStart || !newLabelEnd) return

    const start = Number.parseInt(newLabelStart)
    const end = Number.parseInt(newLabelEnd)

    if (isNaN(start) || isNaN(end) || start < 0 || end > sequence.length || start >= end) {
      return
    }

    const newLabel = {
      id: Date.now().toString(),
      name: newLabelName,
      start,
      end,
      color: newLabelColor,
    }

    const updatedLabels = [...labels, newLabel]
    setLabels(updatedLabels)

    // Reset form
    setNewLabelName("")
    setNewLabelStart("")
    setNewLabelEnd("")

    if (onSaveLabels) {
      onSaveLabels(updatedLabels)
    }
  }

  const removeLabel = (id) => {
    const updatedLabels = labels.filter((label) => label.id !== id)
    setLabels(updatedLabels)

    if (onSaveLabels) {
      onSaveLabels(updatedLabels)
    }
  }

  const updateHighlightedSequence = () => {
    if (!sequence) {
      setHighlightedSequence("")
      return
    }

    // Sort labels by start position
    const sortedLabels = [...labels].sort((a, b) => a.start - b.start)

    const result = []
    let currentPos = 0

    // Add each segment with appropriate highlighting
    for (const label of sortedLabels) {
      // Add unhighlighted segment before this label
      if (label.start > currentPos) {
        result.push(
          <span key={`plain-${currentPos}`} className="font-mono">
            {sequence.substring(currentPos, label.start)}
          </span>,
        )
      }

      // Add highlighted segment
      result.push(
        <span
          key={`label-${label.id}`}
          className="font-mono font-bold"
          style={{ backgroundColor: label.color, padding: "0 2px", borderRadius: "2px" }}
          title={label.name}
        >
          {sequence.substring(label.start, label.end)}
        </span>,
      )

      currentPos = label.end
    }

    // Add remaining unhighlighted segment
    if (currentPos < sequence.length) {
      result.push(
        <span key={`plain-end`} className="font-mono">
          {sequence.substring(currentPos)}
        </span>,
      )
    }

    setHighlightedSequence(result)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="view">
        <TabsList className="w-full">
          <TabsTrigger value="view" className="flex-1">
            Labeled Sequence
          </TabsTrigger>
          <TabsTrigger value="add" className="flex-1">
            Add Labels
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex-1">
            Manage Labels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <div className="border rounded-md p-3 bg-muted overflow-x-auto whitespace-pre-wrap break-all">
            {highlightedSequence || <span className="text-muted-foreground">No sequence available</span>}
          </div>

          {labels.length > 0 && (
            <div className="space-y-2">
              <Label>Legend:</Label>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <Badge key={label.id} style={{ backgroundColor: label.color, color: "#fff" }}>
                    {label.name} ({label.start}-{label.end})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="labelName">Label Name</Label>
              <Input
                id="labelName"
                placeholder="e.g., Binding Site, CDS, RBS"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labelColor">Label Color</Label>
              <div className="flex gap-2">
                <Input
                  id="labelColor"
                  type="color"
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="w-12 p-1 h-10"
                />
                <div className="flex-1 rounded-md border" style={{ backgroundColor: newLabelColor }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startPos">Start Position</Label>
              <Input
                id="startPos"
                type="number"
                placeholder="0"
                min="0"
                max={sequence ? sequence.length - 1 : 0}
                value={newLabelStart}
                onChange={(e) => setNewLabelStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endPos">End Position</Label>
              <Input
                id="endPos"
                type="number"
                placeholder={sequence ? sequence.length : 0}
                min="1"
                max={sequence ? sequence.length : 0}
                value={newLabelEnd}
                onChange={(e) => setNewLabelEnd(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={addLabel} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Label
          </Button>

          <div className="border rounded-md p-3 text-sm">
            <p className="font-medium">Sequence Preview:</p>
            <div className="mt-2 overflow-x-auto whitespace-pre font-mono text-xs">
              {sequence ? (
                <>
                  {sequence.substring(0, 50)}
                  {sequence.length > 50 ? "..." : ""}
                </>
              ) : (
                <span className="text-muted-foreground">No sequence available</span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Total length: {sequence ? sequence.length : 0} bp</p>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {labels.length > 0 ? (
            <div className="space-y-2">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }}></div>
                    <span className="font-medium">{label.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Positions {label.start}-{label.end} ({label.end - label.start} bp)
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeLabel(label.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-4" onClick={() => onSaveLabels && onSaveLabels(labels)}>
                <Save className="mr-2 h-4 w-4" />
                Save All Labels
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No labels created yet. Add some labels to annotate your sequence.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
