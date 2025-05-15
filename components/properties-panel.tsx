"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import SequenceLabeler from "@/components/sequence-labeler"
import ExperimentalBadge from "@/components/experimental-badge"

export default function PropertiesPanel({ node, updateNode, deleteNode }) {
  const [localData, setLocalData] = useState(node.data)

  useEffect(() => {
    setLocalData(node.data)
  }, [node.data])

  const handleChange = (key, value) => {
    const newData = { ...localData, [key]: value }
    setLocalData(newData)
    updateNode(node.id, { [key]: value })
  }

  const renderPropertiesByType = () => {
    switch (node.type) {
      case "promoter":
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={localData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strength">Promoter Strength</Label>
                <Select
                  value={localData.strength || "medium"}
                  onValueChange={(value) => handleChange("strength", value)}
                >
                  <SelectTrigger id="strength">
                    <SelectValue placeholder="Select strength" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="very high">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="inducible"
                  checked={localData.inducible || false}
                  onCheckedChange={(checked) => handleChange("inducible", checked)}
                />
                <Label htmlFor="inducible">Inducible</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="experimental"
                  checked={localData.experimental || false}
                  onCheckedChange={(checked) => handleChange("experimental", checked)}
                />
                <Label htmlFor="experimental">Experimental/In Development</Label>
              </div>

              {localData.inducible && (
                <div className="space-y-2">
                  <Label htmlFor="inducer">Inducer</Label>
                  <Input
                    id="inducer"
                    value={localData.inducer || ""}
                    onChange={(e) => handleChange("inducer", e.target.value)}
                    placeholder="e.g., IPTG, aTc"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sequence">DNA Sequence</Label>
                <Textarea
                  id="sequence"
                  value={localData.sequence || ""}
                  onChange={(e) => handleChange("sequence", e.target.value)}
                  placeholder="TATAAT..."
                  className="font-mono text-xs"
                />
              </div>

              {localData.sequence && (
                <div className="space-y-2 mt-4">
                  <Label>Sequence Annotation</Label>
                  <SequenceLabeler
                    sequence={localData.sequence}
                    onSaveLabels={(labels) => handleChange("sequenceLabels", labels)}
                  />
                </div>
              )}
            </div>
          </>
        )

      case "gene":
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={localData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="function">Function</Label>
                <Select
                  value={localData.function || "reporter"}
                  onValueChange={(value) => handleChange("function", value)}
                >
                  <SelectTrigger id="function">
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reporter">Reporter</SelectItem>
                    <SelectItem value="repressor">Repressor</SelectItem>
                    <SelectItem value="activator">Activator</SelectItem>
                    <SelectItem value="enzyme">Enzyme</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="experimental"
                  checked={localData.experimental || false}
                  onCheckedChange={(checked) => handleChange("experimental", checked)}
                />
                <Label htmlFor="experimental">Experimental/In Development</Label>
              </div>

              {localData.function === "reporter" && (
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Select value={localData.color || "green"} onValueChange={(value) => handleChange("color", value)}>
                    <SelectTrigger id="color">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Green (GFP)</SelectItem>
                      <SelectItem value="red">Red (RFP)</SelectItem>
                      <SelectItem value="yellow">Yellow (YFP)</SelectItem>
                      <SelectItem value="blue">Blue (BFP)</SelectItem>
                      <SelectItem value="cyan">Cyan (CFP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(localData.function === "repressor" || localData.function === "activator") && (
                <div className="space-y-2">
                  <Label>Targets</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {localData.targets &&
                      localData.targets.map((target, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {target}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => {
                              const newTargets = [...localData.targets]
                              newTargets.splice(index, 1)
                              handleChange("targets", newTargets)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    <Input
                      placeholder="Add target..."
                      className="w-24 h-7 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value) {
                          const newTargets = [...(localData.targets || []), e.target.value]
                          handleChange("targets", newTargets)
                          e.target.value = ""
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sequence">DNA Sequence</Label>
                <Textarea
                  id="sequence"
                  value={localData.sequence || ""}
                  onChange={(e) => handleChange("sequence", e.target.value)}
                  placeholder="ATGCGTAAAGGAGAAGAACTTTTCACTGGAGTTGTC..."
                  className="font-mono text-xs"
                />
              </div>

              {localData.sequence && (
                <div className="space-y-2 mt-4">
                  <Label>Sequence Annotation</Label>
                  <SequenceLabeler
                    sequence={localData.sequence}
                    onSaveLabels={(labels) => handleChange("sequenceLabels", labels)}
                  />
                </div>
              )}
            </div>
          </>
        )

      case "terminator":
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={localData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="efficiency">Termination Efficiency</Label>
                <Select
                  value={localData.efficiency || "medium"}
                  onValueChange={(value) => handleChange("efficiency", value)}
                >
                  <SelectTrigger id="efficiency">
                    <SelectValue placeholder="Select efficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="very high">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="experimental"
                  checked={localData.experimental || false}
                  onCheckedChange={(checked) => handleChange("experimental", checked)}
                />
                <Label htmlFor="experimental">Experimental/In Development</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sequence">DNA Sequence</Label>
                <Textarea
                  id="sequence"
                  value={localData.sequence || ""}
                  onChange={(e) => handleChange("sequence", e.target.value)}
                  placeholder="CCAGGCATCAAATAAAACGAAAGGCTCAGTCGAAAGACTGGGC..."
                  className="font-mono text-xs"
                />
              </div>

              {localData.sequence && (
                <div className="space-y-2 mt-4">
                  <Label>Sequence Annotation</Label>
                  <SequenceLabeler
                    sequence={localData.sequence}
                    onSaveLabels={(labels) => handleChange("sequenceLabels", labels)}
                  />
                </div>
              )}
            </div>
          </>
        )

      case "regulatory":
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={localData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="function">Function</Label>
                <Select
                  value={localData.function || "binding"}
                  onValueChange={(value) => handleChange("function", value)}
                >
                  <SelectTrigger id="function">
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binding">Binding Site</SelectItem>
                    <SelectItem value="translation">Translation Control</SelectItem>
                    <SelectItem value="activation">Activation</SelectItem>
                    <SelectItem value="repression">Repression</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="experimental"
                  checked={localData.experimental || false}
                  onCheckedChange={(checked) => handleChange("experimental", checked)}
                />
                <Label htmlFor="experimental">Experimental/In Development</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strength">Strength</Label>
                <Slider
                  id="strength"
                  min={0}
                  max={100}
                  step={1}
                  value={[localData.strengthValue || 50]}
                  onValueChange={(value) => handleChange("strengthValue", value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Weak</span>
                  <span>{localData.strengthValue || 50}%</span>
                  <span>Strong</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sequence">DNA Sequence</Label>
                <Textarea
                  id="sequence"
                  value={localData.sequence || ""}
                  onChange={(e) => handleChange("sequence", e.target.value)}
                  placeholder="AGGAGG..."
                  className="font-mono text-xs"
                />
              </div>

              {localData.sequence && (
                <div className="space-y-2 mt-4">
                  <Label>Sequence Annotation</Label>
                  <SequenceLabeler
                    sequence={localData.sequence}
                    onSaveLabels={(labels) => handleChange("sequenceLabels", labels)}
                  />
                </div>
              )}
            </div>
          </>
        )

      default:
        return (
          <div className="text-center text-muted-foreground py-4">No properties available for this component type.</div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{localData.name || "Component Properties"}</h3>
          {localData.experimental && <ExperimentalBadge className="ml-2" />}
          <p className="text-sm text-muted-foreground">
            {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Component
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => deleteNode(node.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      {renderPropertiesByType()}

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={localData.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Add notes about this component..."
        />
      </div>
    </div>
  )
}
