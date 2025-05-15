"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  FlaskConical,
  Microscope,
  Beaker,
  Pipette,
  Thermometer,
  Clock,
  RotateCcw,
  Save,
  Download,
  Play,
  Trash,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import ExperimentalBadge from "./experimental-badge"

// Experiment types
const EXPERIMENT_TYPES = [
  { id: "pcr", name: "PCR Reaction", icon: FlaskConical },
  { id: "transformation", name: "Bacterial Transformation", icon: Beaker },
  { id: "plasmid_prep", name: "Plasmid Preparation", icon: Microscope },
  { id: "restriction_digest", name: "Restriction Digest", icon: Beaker },
  { id: "gibson_assembly", name: "Gibson Assembly", icon: FlaskConical },
  { id: "custom", name: "Custom Protocol", icon: Beaker },
]

// Lab systems
const LAB_SYSTEMS = [
  { id: "opentrons", name: "Opentrons", icon: Microscope },
  { id: "tecan", name: "Tecan", icon: FlaskConical },
  { id: "hamilton", name: "Hamilton", icon: Beaker },
  { id: "manual", name: "Manual Protocol", icon: Pipette },
]

// Step types
const STEP_TYPES = [
  { id: "pipette", name: "Pipette", icon: Pipette, color: "blue" },
  { id: "incubate", name: "Incubate", icon: Thermometer, color: "red" },
  { id: "wait", name: "Wait", icon: Clock, color: "yellow" },
  { id: "centrifuge", name: "Centrifuge", icon: RotateCcw, color: "purple" },
  { id: "custom", name: "Custom Step", icon: Beaker, color: "gray" },
]

export default function AutomatedExperimentDesigner() {
  const [activeTab, setActiveTab] = useState("setup")
  const [experimentName, setExperimentName] = useState("My PCR Protocol")
  const [experimentType, setExperimentType] = useState("pcr")
  const [experimentDescription, setExperimentDescription] = useState("")
  const [labSystem, setLabSystem] = useState("opentrons")
  const [steps, setSteps] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState<any>(null)
  const [isEditingStep, setIsEditingStep] = useState(false)
  const { toast } = useToast()

  // Load template based on experiment type
  const loadTemplate = () => {
    let templateSteps = []

    switch (experimentType) {
      case "pcr":
        setExperimentName("PCR Amplification Protocol")
        setExperimentDescription("Standard PCR protocol for DNA amplification")
        templateSteps = [
          {
            id: `step_${Date.now()}_1`,
            type: "pipette",
            name: "Add Master Mix",
            volume: 25,
            source: "A1",
            destination: "plate_1.wells_from_A1_to_H12",
          },
          {
            id: `step_${Date.now()}_2`,
            type: "pipette",
            name: "Add Forward Primer",
            volume: 2.5,
            source: "B1",
            destination: "plate_1.wells_from_A1_to_H12",
          },
          {
            id: `step_${Date.now()}_3`,
            type: "pipette",
            name: "Add Reverse Primer",
            volume: 2.5,
            source: "C1",
            destination: "plate_1.wells_from_A1_to_H12",
          },
          {
            id: `step_${Date.now()}_4`,
            type: "pipette",
            name: "Add Template DNA",
            volume: 1,
            source: "D1",
            destination: "plate_1.wells_from_A1_to_H12",
          },
          {
            id: `step_${Date.now()}_5`,
            type: "pipette",
            name: "Add Water",
            volume: 19,
            source: "E1",
            destination: "plate_1.wells_from_A1_to_H12",
          },
          {
            id: `step_${Date.now()}_6`,
            type: "incubate",
            name: "Initial Denaturation",
            temperature: 95,
            duration: 3,
          },
          {
            id: `step_${Date.now()}_7`,
            type: "incubate",
            name: "Denaturation",
            temperature: 95,
            duration: 0.5,
            cycles: 30,
          },
          {
            id: `step_${Date.now()}_8`,
            type: "incubate",
            name: "Annealing",
            temperature: 55,
            duration: 0.5,
            cycles: 30,
          },
          {
            id: `step_${Date.now()}_9`,
            type: "incubate",
            name: "Extension",
            temperature: 72,
            duration: 1,
            cycles: 30,
          },
          {
            id: `step_${Date.now()}_10`,
            type: "incubate",
            name: "Final Extension",
            temperature: 72,
            duration: 5,
          },
          {
            id: `step_${Date.now()}_11`,
            type: "incubate",
            name: "Hold",
            temperature: 4,
            duration: 0,
            indefinite: true,
          },
        ]
        break

      case "transformation":
        setExperimentName("Bacterial Transformation Protocol")
        setExperimentDescription("Standard protocol for transforming competent E. coli cells")
        templateSteps = [
          {
            id: `step_${Date.now()}_1`,
            type: "pipette",
            name: "Add Competent Cells",
            volume: 50,
            source: "A1",
            destination: "plate_1.wells_from_A1_to_H3",
          },
          {
            id: `step_${Date.now()}_2`,
            type: "pipette",
            name: "Add Plasmid DNA",
            volume: 5,
            source: "B1",
            destination: "plate_1.wells_from_A1_to_H3",
          },
          {
            id: `step_${Date.now()}_3`,
            type: "incubate",
            name: "Incubate on Ice",
            temperature: 4,
            duration: 30,
          },
          {
            id: `step_${Date.now()}_4`,
            type: "incubate",
            name: "Heat Shock",
            temperature: 42,
            duration: 0.75,
          },
          {
            id: `step_${Date.now()}_5`,
            type: "incubate",
            name: "Return to Ice",
            temperature: 4,
            duration: 2,
          },
          {
            id: `step_${Date.now()}_6`,
            type: "pipette",
            name: "Add Recovery Media",
            volume: 950,
            source: "D1",
            destination: "plate_1.wells_from_A1_to_H3",
          },
          {
            id: `step_${Date.now()}_7`,
            type: "incubate",
            name: "Recovery Incubation",
            temperature: 37,
            duration: 60,
          },
        ]
        break

      // Add more templates as needed

      default:
        templateSteps = []
    }

    setSteps(templateSteps)

    toast({
      title: "Template Loaded",
      description: `${EXPERIMENT_TYPES.find((t) => t.id === experimentType)?.name} template has been loaded`,
    })
  }

  // Add a new step
  const addStep = (type: string) => {
    const stepType = STEP_TYPES.find((t) => t.id === type)

    let newStep = {
      id: `step_${Date.now()}`,
      type,
      name: `New ${stepType?.name || "Step"}`,
    }

    // Add default values based on step type
    switch (type) {
      case "pipette":
        newStep = {
          ...newStep,
          volume: 100,
          source: "A1",
          destination: "A1",
        }
        break
      case "incubate":
        newStep = {
          ...newStep,
          temperature: 37,
          duration: 30,
        }
        break
      case "wait":
        newStep = {
          ...newStep,
          duration: 5,
        }
        break
      case "centrifuge":
        newStep = {
          ...newStep,
          speed: 10000,
          duration: 5,
        }
        break
      case "custom":
        newStep = {
          ...newStep,
          description: "",
        }
        break
    }

    setCurrentStep(newStep)
    setIsEditingStep(true)
  }

  // Save step
  const saveStep = () => {
    if (!currentStep) return

    if (currentStep.id.includes("_new_")) {
      // Add new step
      setSteps([...steps, { ...currentStep, id: `step_${Date.now()}` }])
    } else {
      // Update existing step
      setSteps(steps.map((step) => (step.id === currentStep.id ? currentStep : step)))
    }

    setIsEditingStep(false)
    setCurrentStep(null)

    toast({
      title: "Step Saved",
      description: "Protocol step has been saved successfully",
    })
  }

  // Edit step
  const editStep = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId)
    if (step) {
      setCurrentStep(step)
      setIsEditingStep(true)
    }
  }

  // Delete step
  const deleteStep = (stepId: string) => {
    setSteps(steps.filter((step) => step.id !== stepId))

    toast({
      title: "Step Deleted",
      description: "Protocol step has been removed",
    })
  }

  // Generate protocol code
  const generateProtocolCode = () => {
    let code = ""

    switch (labSystem) {
      case "opentrons":
        code = `# Opentrons Protocol for ${experimentName}
from opentrons import protocol_api

# metadata
metadata = {
    'protocolName': '${experimentName}',
    'author': 'BioDesigner',
    'description': '${experimentDescription}',
    'apiLevel': '2.11'
}

def run(protocol: protocol_api.ProtocolContext):
    # Load labware
    plate_1 = protocol.load_labware('corning_96_wellplate_360ul_flat', 1, 'Plate')
    reservoir = protocol.load_labware('usascientific_12_reservoir_22ml', 2, 'Reservoir')
    
    # Load pipettes
    p300 = protocol.load_instrument('p300_single_gen2', 'right', tip_racks=[protocol.load_labware('opentrons_96_tiprack_300ul', 3)])
    
    # Protocol steps
`

        steps.forEach((step, index) => {
          code += `    # Step ${index + 1}: ${step.name}\n`

          switch (step.type) {
            case "pipette":
              code += `    p300.pick_up_tip()\n`
              code += `    p300.aspirate(${step.volume}, reservoir['${step.source}'])\n`
              if (step.destination.includes("wells_from")) {
                const [start, end] = step.destination.split("wells_from_")[1].split("_to_")
                code += `    for well in plate_1.wells_from('${start}', to='${end}'):\n`
                code += `        p300.dispense(${step.volume}, well)\n`
              } else {
                code += `    p300.dispense(${step.volume}, plate_1['${step.destination}'])\n`
              }
              code += `    p300.drop_tip()\n`
              break

            case "incubate":
              code += `    protocol.comment('Incubate at ${step.temperature}°C for ${step.duration} minutes')\n`
              if (step.cycles) {
                code += `    # Repeat for ${step.cycles} cycles\n`
                code += `    for cycle in range(${step.cycles}):\n`
                code += `        protocol.comment(f'Cycle {cycle+1} of ${step.cycles}')\n`
                code += `        protocol.temperature_module.set_temperature(${step.temperature})\n`
                code += `        protocol.delay(minutes=${step.duration})\n`
              } else if (step.indefinite) {
                code += `    protocol.temperature_module.set_temperature(${step.temperature})\n`
                code += `    protocol.pause('Protocol complete. Samples are being held at ${step.temperature}°C')\n`
              } else {
                code += `    protocol.temperature_module.set_temperature(${step.temperature})\n`
                code += `    protocol.delay(minutes=${step.duration})\n`
              }
              break

            case "wait":
              code += `    protocol.delay(minutes=${step.duration})\n`
              break

            case "centrifuge":
              code += `    protocol.pause('Please centrifuge samples at ${step.speed} rpm for ${step.duration} minutes, then resume')\n`
              break

            case "custom":
              code += `    protocol.comment('${step.description}')\n`
              break
          }

          code += "\n"
        })

        break

      case "manual":
        code = `# Manual Protocol: ${experimentName}
# ${experimentDescription}

MATERIALS:
- PCR tubes or plate
- Pipettes and tips
- Reagents as specified

PROCEDURE:
`
        steps.forEach((step, index) => {
          code += `${index + 1}. ${step.name}\n`

          switch (step.type) {
            case "pipette":
              code += `   Add ${step.volume} µL from ${step.source} to ${step.destination}\n`
              break

            case "incubate":
              if (step.cycles) {
                code += `   Incubate at ${step.temperature}°C for ${step.duration} minutes (repeat for ${step.cycles} cycles)\n`
              } else if (step.indefinite) {
                code += `   Hold at ${step.temperature}°C until ready for next step\n`
              } else {
                code += `   Incubate at ${step.temperature}°C for ${step.duration} minutes\n`
              }
              break

            case "wait":
              code += `   Wait for ${step.duration} minutes\n`
              break

            case "centrifuge":
              code += `   Centrifuge at ${step.speed} rpm for ${step.duration} minutes\n`
              break

            case "custom":
              code += `   ${step.description}\n`
              break
          }

          code += "\n"
        })

        break

      // Add more lab systems as needed

      default:
        code = "# No protocol code generated"
    }

    return code
  }

  // Download protocol
  const downloadProtocol = () => {
    const code = generateProtocolCode()
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${experimentName.toLowerCase().replace(/\s+/g, "_")}_protocol.py`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Protocol Downloaded",
      description: "Your protocol has been downloaded successfully",
    })
  }

  // Save protocol
  const saveProtocol = () => {
    // In a real app, this would save to a database
    toast({
      title: "Protocol Saved",
      description: "Your protocol has been saved successfully",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <FlaskConical className="h-5 w-5 mr-2" />
              Automated Experiment Designer
              <ExperimentalBadge className="ml-2" />
            </CardTitle>
            <CardDescription>
              Design and automate laboratory protocols for synthetic biology experiments
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="steps">Protocol Steps</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="experiment-name">Experiment Name</Label>
                <Input
                  id="experiment-name"
                  value={experimentName}
                  onChange={(e) => setExperimentName(e.target.value)}
                  placeholder="Enter a name for your experiment"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experiment-type">Experiment Type</Label>
                <Select value={experimentType} onValueChange={setExperimentType}>
                  <SelectTrigger id="experiment-type">
                    <SelectValue placeholder="Select experiment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIMENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 mr-2" />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experiment-description">Description</Label>
                <Textarea
                  id="experiment-description"
                  value={experimentDescription}
                  onChange={(e) => setExperimentDescription(e.target.value)}
                  placeholder="Describe the purpose and details of your experiment"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lab-system">Lab System</Label>
                <Select value={labSystem} onValueChange={setLabSystem}>
                  <SelectTrigger id="lab-system">
                    <SelectValue placeholder="Select lab system" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAB_SYSTEMS.map((system) => (
                      <SelectItem key={system.id} value={system.id}>
                        <div className="flex items-center">
                          <system.icon className="h-4 w-4 mr-2" />
                          {system.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={loadTemplate} className="w-full">
                Load Template Protocol
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="steps">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Protocol Steps</h3>
                <Select onValueChange={addStep} value="">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Add Step" />
                  </SelectTrigger>
                  <SelectContent>
                    {STEP_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 mr-2" style={{ color: `var(--${type.color}-500)` }} />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No steps added yet</p>
                  <p className="text-sm mt-2">Select a step type from the dropdown to add a step</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const stepType = STEP_TYPES.find((t) => t.id === step.type)
                    const StepIcon = stepType?.icon || Beaker

                    return (
                      <div
                        key={step.id}
                        className="flex items-center justify-between p-3 mb-2 rounded-md border hover:border-primary/50"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            {index + 1}
                          </div>
                          <StepIcon
                            className="h-4 w-4 mr-2"
                            style={{ color: `var(--${stepType?.color || "gray"}-500)` }}
                          />
                          <span>{step.name}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => editStep(step.id)}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-pencil"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteStep(step.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {isEditingStep && currentStep && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h3 className="text-lg font-medium mb-4">
                      {currentStep.id.includes("_new_") ? "Add Step" : "Edit Step"}
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="step-name">Step Name</Label>
                        <Input
                          id="step-name"
                          value={currentStep.name}
                          onChange={(e) => setCurrentStep({ ...currentStep, name: e.target.value })}
                        />
                      </div>

                      {currentStep.type === "pipette" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="volume">Volume (µL)</Label>
                            <Input
                              id="volume"
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={currentStep.volume}
                              onChange={(e) => setCurrentStep({ ...currentStep, volume: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="source">Source Well</Label>
                            <Input
                              id="source"
                              value={currentStep.source}
                              onChange={(e) => setCurrentStep({ ...currentStep, source: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="destination">Destination Well</Label>
                            <Input
                              id="destination"
                              value={currentStep.destination}
                              onChange={(e) => setCurrentStep({ ...currentStep, destination: e.target.value })}
                            />
                          </div>
                        </>
                      )}

                      {currentStep.type === "incubate" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="temperature">Temperature (°C)</Label>
                            <Input
                              id="temperature"
                              type="number"
                              min="4"
                              max="100"
                              value={currentStep.temperature}
                              onChange={(e) => setCurrentStep({ ...currentStep, temperature: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={currentStep.duration}
                              onChange={(e) => setCurrentStep({ ...currentStep, duration: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cycles">Cycles (optional)</Label>
                            <Input
                              id="cycles"
                              type="number"
                              min="0"
                              step="1"
                              value={currentStep.cycles || ""}
                              onChange={(e) => {
                                const value = e.target.value === "" ? undefined : Number(e.target.value)
                                setCurrentStep({ ...currentStep, cycles: value })
                              }}
                              placeholder="Leave empty for no cycling"
                            />
                          </div>
                        </>
                      )}

                      {currentStep.type === "wait" && (
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={currentStep.duration}
                            onChange={(e) => setCurrentStep({ ...currentStep, duration: Number(e.target.value) })}
                          />
                        </div>
                      )}

                      {currentStep.type === "centrifuge" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="speed">Speed (rpm)</Label>
                            <Input
                              id="speed"
                              type="number"
                              min="100"
                              step="100"
                              value={currentStep.speed}
                              onChange={(e) => setCurrentStep({ ...currentStep, speed: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={currentStep.duration}
                              onChange={(e) => setCurrentStep({ ...currentStep, duration: Number(e.target.value) })}
                            />
                          </div>
                        </>
                      )}

                      {currentStep.type === "custom" && (
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={currentStep.description}
                            onChange={(e) => setCurrentStep({ ...currentStep, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingStep(false)
                          setCurrentStep(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={saveStep}>Save Step</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-6">
              <div className="flex flex-col space-y-4">
                <h3 className="text-sm font-medium">Protocol Flow</h3>

                {steps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No steps added yet</p>
                    <p className="text-sm mt-2">Add steps to preview your protocol</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap justify-center">
                      {steps.map((step, index) => {
                        const stepType = STEP_TYPES.find((t) => t.id === step.type)
                        const StepIcon = stepType?.icon || Beaker

                        return (
                          <div key={step.id} className="flex flex-col items-center mx-2 mb-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center bg-${stepType?.color || "gray"}-100 border border-${stepType?.color || "gray"}-200`}
                            >
                              <StepIcon className={`h-6 w-6 text-${stepType?.color || "gray"}-500`} />
                            </div>
                            <div className="text-xs mt-1 text-center max-w-[80px] truncate">{step.name}</div>
                            {index < steps.length - 1 && (
                              <div className="w-8 h-4 flex items-center justify-center">
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="steps">
                        <AccordionTrigger>Protocol Details</AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Step</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Parameters</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {steps.map((step, index) => (
                                <TableRow key={step.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>{step.name}</TableCell>
                                  <TableCell>{STEP_TYPES.find((t) => t.id === step.type)?.name || "Custom"}</TableCell>
                                  <TableCell>
                                    {step.type === "pipette" &&
                                      `${step.volume}µL from ${step.source} to ${step.destination}`}
                                    {step.type === "incubate" &&
                                      `${step.temperature}°C for ${step.duration} min${step.cycles ? ` (${step.cycles} cycles)` : ""}`}
                                    {step.type === "wait" && `${step.duration} min`}
                                    {step.type === "centrifuge" && `${step.speed} rpm for ${step.duration} min`}
                                    {step.type === "custom" && step.description}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setActiveTab("steps")}>
                  Edit Steps
                </Button>
                <Button onClick={() => setActiveTab("code")} disabled={steps.length === 0}>
                  Generate Code
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Generated Protocol Code</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={saveProtocol}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadProtocol}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No steps added yet</p>
                  <p className="text-sm mt-2">Add steps to generate protocol code</p>
                </div>
              ) : (
                <div className="relative">
                  <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-auto max-h-[400px]">
                    <code>{generateProtocolCode()}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      navigator.clipboard.writeText(generateProtocolCode())
                      toast({
                        title: "Code Copied",
                        description: "Protocol code has been copied to clipboard",
                      })
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-copy"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </Button>
                </div>
              )}

              <div className="p-4 border rounded-md bg-green-50 text-green-800 mt-4">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Ready to Run</p>
                    <p className="text-sm">
                      This protocol is ready to be executed on your {LAB_SYSTEMS.find((s) => s.id === labSystem)?.name}{" "}
                      system.
                    </p>
                    <Button
                      className="mt-2"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Protocol Execution",
                          description: "Protocol has been sent to the lab system for execution",
                        })
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Protocol
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        <Button onClick={saveProtocol} disabled={steps.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          Save Protocol
        </Button>
      </CardFooter>
    </Card>
  )
}
