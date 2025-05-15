"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Microscope,
  FlaskConical,
  Beaker,
  Settings,
  Play,
  Plus,
  Trash,
  Download,
  RotateCcw,
  Thermometer,
  Clock,
  Pipette,
  Shuffle,
  ArrowRight,
  Layers,
  Workflow,
  Loader,
} from "lucide-react"
import ExperimentalBadge from "./experimental-badge"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Lab systems
const LAB_SYSTEMS = [
  { id: "opentrons", name: "Opentrons", icon: Microscope },
  { id: "tecan", name: "Tecan", icon: FlaskConical },
  { id: "hamilton", name: "Hamilton", icon: Beaker },
  { id: "custom", name: "Custom System", icon: Settings },
]

// Protocol templates
const PROTOCOL_TEMPLATES = [
  {
    id: "pcr_setup",
    name: "PCR Setup",
    description: "Automated PCR reaction setup",
    system: "opentrons",
    steps: [
      {
        id: "step1",
        type: "pipette",
        name: "Add Master Mix",
        volume: 20,
        source: "A1",
        destination: "plate_1.wells_from_A1_to_H12",
      },
      {
        id: "step2",
        type: "pipette",
        name: "Add Primers",
        volume: 2.5,
        source: "B1",
        destination: "plate_1.wells_from_A1_to_H12",
      },
      {
        id: "step3",
        type: "pipette",
        name: "Add Template DNA",
        volume: 2.5,
        source: "C1",
        destination: "plate_1.wells_from_A1_to_H12",
      },
      {
        id: "step4",
        type: "mix",
        name: "Mix Reactions",
        volume: 15,
        repetitions: 3,
        destination: "plate_1.wells_from_A1_to_H12",
      },
    ],
  },
  {
    id: "transformation",
    name: "Bacterial Transformation",
    description: "Automated bacterial transformation protocol",
    system: "opentrons",
    steps: [
      {
        id: "step1",
        type: "pipette",
        name: "Add Competent Cells",
        volume: 50,
        source: "A1",
        destination: "plate_1.wells_from_A1_to_H3",
      },
      {
        id: "step2",
        type: "pipette",
        name: "Add Plasmid DNA",
        volume: 5,
        source: "B1",
        destination: "plate_1.wells_from_A1_to_H3",
      },
      { id: "step3", type: "incubate", name: "Incubate on Ice", temperature: 4, duration: 30 },
      { id: "step4", type: "incubate", name: "Heat Shock", temperature: 42, duration: 0.75 },
      { id: "step5", type: "incubate", name: "Return to Ice", temperature: 4, duration: 2 },
      {
        id: "step6",
        type: "pipette",
        name: "Add Recovery Media",
        volume: 950,
        source: "D1",
        destination: "plate_1.wells_from_A1_to_H3",
      },
      { id: "step7", type: "incubate", name: "Recovery Incubation", temperature: 37, duration: 60 },
    ],
  },
  {
    id: "plasmid_extraction",
    name: "Plasmid Extraction",
    description: "Automated plasmid miniprep protocol",
    system: "hamilton",
    steps: [
      {
        id: "step1",
        type: "pipette",
        name: "Add Resuspension Buffer",
        volume: 250,
        source: "A1",
        destination: "plate_1.wells_from_A1_to_H6",
      },
      {
        id: "step2",
        type: "mix",
        name: "Resuspend Pellet",
        volume: 200,
        repetitions: 5,
        destination: "plate_1.wells_from_A1_to_H6",
      },
      {
        id: "step3",
        type: "pipette",
        name: "Add Lysis Buffer",
        volume: 250,
        source: "B1",
        destination: "plate_1.wells_from_A1_to_H6",
      },
      { id: "step4", type: "wait", name: "Lysis Reaction", duration: 5 },
      {
        id: "step5",
        type: "pipette",
        name: "Add Neutralization Buffer",
        volume: 350,
        source: "C1",
        destination: "plate_1.wells_from_A1_to_H6",
      },
      {
        id: "step6",
        type: "mix",
        name: "Mix Solution",
        volume: 300,
        repetitions: 3,
        destination: "plate_1.wells_from_A1_to_H6",
      },
      { id: "step7", type: "centrifuge", name: "Centrifuge Samples", speed: 12000, duration: 10 },
    ],
  },
  {
    id: "gibson_assembly",
    name: "Gibson Assembly",
    description: "Automated Gibson assembly reaction setup",
    system: "tecan",
    steps: [
      {
        id: "step1",
        type: "pipette",
        name: "Add Gibson Master Mix",
        volume: 10,
        source: "A1",
        destination: "plate_1.wells_from_A1_to_D6",
      },
      {
        id: "step2",
        type: "pipette",
        name: "Add DNA Fragment 1",
        volume: 2,
        source: "B1",
        destination: "plate_1.wells_from_A1_to_D6",
      },
      {
        id: "step3",
        type: "pipette",
        name: "Add DNA Fragment 2",
        volume: 2,
        source: "C1",
        destination: "plate_1.wells_from_A1_to_D6",
      },
      {
        id: "step4",
        type: "pipette",
        name: "Add DNA Fragment 3",
        volume: 2,
        source: "D1",
        destination: "plate_1.wells_from_A1_to_D6",
      },
      {
        id: "step5",
        type: "pipette",
        name: "Add Water",
        volume: 4,
        source: "E1",
        destination: "plate_1.wells_from_A1_to_D6",
      },
      {
        id: "step6",
        type: "mix",
        name: "Mix Reactions",
        volume: 10,
        repetitions: 5,
        destination: "plate_1.wells_from_A1_to_D6",
      },
      { id: "step7", type: "incubate", name: "Incubate Reactions", temperature: 50, duration: 60 },
    ],
  },
]

// Labware types
const LABWARE_TYPES = [
  { id: "plate_96", name: "96-well Plate", wells: 96, format: "8x12" },
  { id: "plate_384", name: "384-well Plate", wells: 384, format: "16x24" },
  { id: "plate_24", name: "24-well Plate", wells: 24, format: "4x6" },
  { id: "tube_rack_15ml", name: "15mL Tube Rack", wells: 15, format: "3x5" },
  { id: "tube_rack_50ml", name: "50mL Tube Rack", wells: 6, format: "2x3" },
  { id: "tube_rack_2ml", name: "2mL Tube Rack", wells: 24, format: "4x6" },
  { id: "reservoir_12", name: "12-channel Reservoir", wells: 12, format: "1x12" },
  { id: "tiprack_10ul", name: "10µL Tip Rack", wells: 96, format: "8x12" },
  { id: "tiprack_300ul", name: "300µL Tip Rack", wells: 96, format: "8x12" },
  { id: "tiprack_1000ul", name: "1000µL Tip Rack", wells: 96, format: "8x12" },
]

// Step types
const STEP_TYPES = [
  { id: "pipette", name: "Pipette", icon: Pipette, color: "blue" },
  { id: "mix", name: "Mix", icon: Shuffle, color: "green" },
  { id: "incubate", name: "Incubate", icon: Thermometer, color: "red" },
  { id: "wait", name: "Wait", icon: Clock, color: "yellow" },
  { id: "centrifuge", name: "Centrifuge", icon: RotateCcw, color: "purple" },
  { id: "transfer", name: "Transfer", icon: ArrowRight, color: "orange" },
  { id: "custom", name: "Custom", icon: Settings, color: "gray" },
]

// Step component
const ProtocolStep = ({ step, index, onEdit, onDelete }) => {
  const getStepIcon = () => {
    const stepType = STEP_TYPES.find((t) => t.id === step.type)
    if (stepType) {
      const Icon = stepType.icon
      return <Icon className="h-4 w-4 mr-2" style={{ color: `var(--${stepType.color}-500)` }} />
    }
    return <Settings className="h-4 w-4 mr-2" />
  }

  return (
    <div className="flex items-center justify-between p-3 mb-2 rounded-md border hover:border-primary/50">
      <div className="flex items-center">
        <Badge variant="outline" className="mr-3 w-6 h-6 rounded-full flex items-center justify-center p-0">
          {index + 1}
        </Badge>
        {getStepIcon()}
        <span>{step.name}</span>
      </div>
      <div className="flex space-x-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(step.id)}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(step.id)}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Labware component
const LabwareItem = ({ labware, position, onEdit, onDelete }) => {
  const labwareType = LABWARE_TYPES.find((l) => l.id === labware.type)

  return (
    <div className="flex items-center justify-between p-3 mb-2 rounded-md border hover:border-primary/50">
      <div className="flex items-center">
        <Badge variant="outline" className="mr-3 w-6 h-6 rounded-full flex items-center justify-center p-0">
          {position}
        </Badge>
        <Layers className="h-4 w-4 mr-2" />
        <span>
          {labware.name} ({labwareType?.name || "Custom"})
        </span>
      </div>
      <div className="flex space-x-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(labware.id)}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(labware.id)}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Protocol visualization
const ProtocolVisualization = ({ protocol }) => {
  return (
    <div className="border rounded-md p-4 bg-background/50">
      <div className="flex flex-col space-y-4">
        <h3 className="text-sm font-medium">Protocol Flow</h3>

        <div className="flex flex-wrap justify-center">
          {protocol.steps.map((step, index) => {
            const stepType = STEP_TYPES.find((t) => t.id === step.type)
            const Icon = stepType?.icon || Settings

            return (
              <div key={step.id} className="flex flex-col items-center mx-2 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center bg-${stepType?.color || "gray"}-100 border border-${stepType?.color || "gray"}-200`}
                >
                  <Icon className={`h-6 w-6 text-${stepType?.color || "gray"}-500`} />
                </div>
                <div className="text-xs mt-1 text-center max-w-[80px] truncate">{step.name}</div>
                {index < protocol.steps.length - 1 && (
                  <div className="w-8 h-4 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Deck Layout</h3>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => {
              const position = i + 1
              const labware = protocol.labware?.find((l) => l.position === position)

              return (
                <div
                  key={i}
                  className={`aspect-square border rounded-md flex flex-col items-center justify-center p-2 ${labware ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}
                >
                  <div className="text-xs font-medium mb-1">Position {position}</div>
                  {labware ? (
                    <>
                      <Layers className="h-5 w-5 text-blue-500 mb-1" />
                      <div className="text-xs text-center">{labware.name}</div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">Empty</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Generate Python code for Opentrons
const generateOpentronsCode = (protocol) => {
  let code = `# Opentrons Protocol
from opentrons import protocol_api

# metadata
metadata = {
    'protocolName': '${protocol.name}',
    'author': 'BioDesigner',
    'description': '${protocol.description}',
    'apiLevel': '2.11'
}

def run(protocol: protocol_api.ProtocolContext):
    # Load labware\n`

  // Add labware
  if (protocol.labware && protocol.labware.length > 0) {
    protocol.labware.forEach((labware) => {
      const labwareType = LABWARE_TYPES.find((l) => l.id === labware.type)
      if (labwareType) {
        const labwareId = labware.type.replace("_", "_")
        code += `    ${labware.id} = protocol.load_labware('${labwareId}', ${labware.position}, '${labware.name}')\n`
      }
    })
  } else {
    code += `    plate_1 = protocol.load_labware('corning_96_wellplate_360ul_flat', 1, 'Plate')\n`
    code += `    reservoir = protocol.load_labware('usascientific_12_reservoir_22ml', 2, 'Reservoir')\n`
  }

  // Add pipettes
  code += `\n    # Load pipettes\n`
  code += `    p300 = protocol.load_instrument('p300_single_gen2', 'right', tip_racks=[protocol.load_labware('opentrons_96_tiprack_300ul', 3)])\n`

  // Add steps
  code += `\n    # Protocol steps\n`
  protocol.steps.forEach((step, index) => {
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

      case "mix":
        code += `    p300.pick_up_tip()\n`
        if (step.destination.includes("wells_from")) {
          const [start, end] = step.destination.split("wells_from_")[1].split("_to_")
          code += `    for well in plate_1.wells_from('${start}', to='${end}'):\n`
          code += `        p300.mix(${step.repetitions}, ${step.volume}, well)\n`
        } else {
          code += `    p300.mix(${step.repetitions}, ${step.volume}, plate_1['${step.destination}'])\n`
        }
        code += `    p300.drop_tip()\n`
        break

      case "incubate":
        code += `    protocol.comment('Incubate at ${step.temperature}°C for ${step.duration} minutes')\n`
        if (protocol.system === "opentrons" && step.temperature) {
          code += `    protocol.temperature_module.set_temperature(${step.temperature})\n`
          code += `    protocol.delay(minutes=${step.duration})\n`
          code += `    protocol.temperature_module.deactivate()\n`
        } else {
          code += `    protocol.pause('Please incubate at ${step.temperature}°C for ${step.duration} minutes, then resume')\n`
        }
        break

      case "wait":
        code += `    protocol.delay(minutes=${step.duration})\n`
        break

      case "centrifuge":
        code += `    protocol.pause('Please centrifuge samples at ${step.speed} rpm for ${step.duration} minutes, then resume')\n`
        break

      case "transfer":
        code += `    p300.transfer(${step.volume}, plate_1['${step.source}'], plate_1['${step.destination}'])\n`
        break

      case "custom":
        code += `    # Custom step: ${step.code || "No code provided"}\n`
        if (step.code) {
          const indentedCode = step.code
            .split("\n")
            .map((line) => `    ${line}`)
            .join("\n")
          code += indentedCode + "\n"
        }
        break
    }

    code += "\n"
  })

  return code
}

export default function LabAutomation() {
  const [activeTab, setActiveTab] = useState("protocols")
  const [selectedSystem, setSelectedSystem] = useState("opentrons")
  const [protocols, setProtocols] = useState(PROTOCOL_TEMPLATES)
  const [selectedProtocolId, setSelectedProtocolId] = useState(null)
  const [isEditingStep, setIsEditingStep] = useState(false)
  const [currentStep, setCurrentStep] = useState(null)
  const [isEditingLabware, setIsEditingLabware] = useState(false)
  const [currentLabware, setCurrentLabware] = useState(null)
  const [isAddingProtocol, setIsAddingProtocol] = useState(false)
  const [newProtocol, setNewProtocol] = useState({
    name: "",
    description: "",
    system: "opentrons",
    steps: [],
    labware: [],
  })
  const [isRunning, setIsRunning] = useState(false)
  const [runProgress, setRunProgress] = useState(0)
  const { toast } = useToast()

  // Get selected protocol
  const selectedProtocol = protocols.find((p) => p.id === selectedProtocolId) || null

  // Add a new protocol
  const addProtocol = () => {
    const id = `protocol_${Date.now()}`
    const protocol = {
      ...newProtocol,
      id,
      steps: [],
      labware: [],
    }

    setProtocols([...protocols, protocol])
    setSelectedProtocolId(id)
    setIsAddingProtocol(false)
    setNewProtocol({
      name: "",
      description: "",
      system: "opentrons",
      steps: [],
      labware: [],
    })

    toast({
      title: "Protocol Created",
      description: `New protocol "${protocol.name}" has been created.`,
    })
  }

  // Add a step to the protocol
  const addStep = (type) => {
    if (!selectedProtocolId) return

    const stepId = `step_${Date.now()}`
    const stepType = STEP_TYPES.find((t) => t.id === type)

    let newStep = {
      id: stepId,
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
      case "mix":
        newStep = {
          ...newStep,
          volume: 100,
          repetitions: 3,
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
      case "transfer":
        newStep = {
          ...newStep,
          volume: 100,
          source: "A1",
          destination: "B1",
        }
        break
      case "custom":
        newStep = {
          ...newStep,
          code: "# Add your custom code here\n",
        }
        break
    }

    setProtocols(
      protocols.map((p) => {
        if (p.id === selectedProtocolId) {
          return {
            ...p,
            steps: [...p.steps, newStep],
          }
        }
        return p
      }),
    )

    setCurrentStep(newStep)
    setIsEditingStep(true)
  }

  // Edit a step
  const editStep = (stepId) => {
    if (!selectedProtocol) return

    const step = selectedProtocol.steps.find((s) => s.id === stepId)
    if (step) {
      setCurrentStep(step)
      setIsEditingStep(true)
    }
  }

  // Update a step
  const updateStep = (updatedStep) => {
    setProtocols(
      protocols.map((p) => {
        if (p.id === selectedProtocolId) {
          return {
            ...p,
            steps: p.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
          }
        }
        return p
      }),
    )

    setIsEditingStep(false)
    setCurrentStep(null)
  }

  // Delete a step
  const deleteStep = (stepId) => {
    setProtocols(
      protocols.map((p) => {
        if (p.id === selectedProtocolId) {
          return {
            ...p,
            steps: p.steps.filter((s) => s.id !== stepId),
          }
        }
        return p
      }),
    )
  }

  // Add labware to the protocol
  const addLabware = (type) => {
    if (!selectedProtocolId) return

    const labwareId = `labware_${Date.now()}`
    const labwareType = LABWARE_TYPES.find((l) => l.id === type)

    const newLabware = {
      id: labwareId,
      type,
      name: labwareType?.name || "Custom Labware",
      position: 1, // Default position
    }

    setProtocols(
      protocols.map((p) => {
        if (p.id === selectedProtocolId) {
          return {
            ...p,
            labware: [...p.labware, newLabware],
          }
        }
        return p
      }),
    )

    setCurrentLabware(newLabware)
    setIsEditingLabware(true)
  }

  // Edit labware
  const editLabware = (labwareId) => {
    if (!selectedProtocol) return

    const labware = selectedProtocol.labware.find((l) => l.id === labwareId)
    if (labware) {
      setCurrentLabware(labware)
      setIsEditingLabware(true)
    }
  }

  // Update labware
  const updateLabware = (updatedLabware) => {
    setProtocols(
      protocols.map((p) => {
        if (p.id === selectedProtocolId) {
          return {
            ...p,
            labware: p.labware.map((l) => (l.id === updatedLabware.id ? updatedLabware : l)),
          }
        }
        return p
      }),
    )

    setIsEditingLabware(false)
    setCurrentLabware(null)
  }

  // Delete labware
  const deleteLabware = (labwareId) => {
    setProtocols(
      protocols.map((p) => {
        if (p.id === selectedProtocolId) {
          return {
            ...p,
            labware: p.labware.filter((l) => l.id !== labwareId),
          }
        }
        return p
      }),
    )
  }

  // Run the protocol
  const runProtocol = () => {
    if (!selectedProtocol) return

    setIsRunning(true)
    setRunProgress(0)

    // Simulate protocol execution
    const totalSteps = selectedProtocol.steps.length
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      const progress = Math.round((currentStep / totalSteps) * 100)
      setRunProgress(progress)

      if (currentStep >= totalSteps) {
        clearInterval(interval)
        setIsRunning(false)

        toast({
          title: "Protocol Completed",
          description: `Protocol "${selectedProtocol.name}" has been executed successfully.`,
        })
      }
    }, 1000)
  }

  // Export protocol
  const exportProtocol = () => {
    if (!selectedProtocol) return

    let code = ""

    switch (selectedProtocol.system) {
      case "opentrons":
        code = generateOpentronsCode(selectedProtocol)
        break
      default:
        code = JSON.stringify(selectedProtocol, null, 2)
    }

    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedProtocol.name.toLowerCase().replace(/\s+/g, "_")}_protocol.py`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Protocol Exported",
      description: `Protocol "${selectedProtocol.name}" has been exported.`,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <FlaskConical className="h-5 w-5 mr-2" />
              Lab Automation Integration
              <ExperimentalBadge className="ml-2" />
            </CardTitle>
            <CardDescription>Design and execute automated protocols for laboratory equipment</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedSystem} onValueChange={setSelectedSystem}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select system" />
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
            <Button variant="outline" size="sm" onClick={() => setIsAddingProtocol(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Protocol
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="protocols">Protocols</TabsTrigger>
            <TabsTrigger value="editor">Protocol Editor</TabsTrigger>
            <TabsTrigger value="code">Code View</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
          </TabsList>

          <TabsContent value="protocols" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {protocols
                .filter((p) => p.system === selectedSystem)
                .map((protocol) => (
                  <Card
                    key={protocol.id}
                    className={`cursor-pointer hover:border-primary/50 ${selectedProtocolId === protocol.id ? "border-primary" : ""}`}
                    onClick={() => setSelectedProtocolId(protocol.id)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{protocol.name}</CardTitle>
                      <CardDescription>{protocol.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Workflow className="h-4 w-4 mr-2" />
                        {protocol.steps.length} steps
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="editor">
            {selectedProtocol ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left sidebar - Steps */}
                <div className="md:col-span-1 border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Protocol Steps</h3>
                    <div className="relative">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {STEP_TYPES.map((type) => (
                            <DropdownMenuItem key={type.id} onClick={() => addStep(type.id)}>
                              <type.icon className="h-4 w-4 mr-2" style={{ color: `var(--${type.color}-500)` }} />
                              {type.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <ScrollArea className="h-[400px]">
                    {selectedProtocol.steps.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No steps added yet</p>
                        <p className="text-sm mt-2">Click + to add a step</p>
                      </div>
                    ) : (
                      selectedProtocol.steps.map((step, index) => (
                        <ProtocolStep key={step.id} step={step} index={index} onEdit={editStep} onDelete={deleteStep} />
                      ))
                    )}
                  </ScrollArea>

                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium mb-4">Labware</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingLabware(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Labware
                      </Button>
                    </div>

                    {selectedProtocol.labware && selectedProtocol.labware.length > 0 ? (
                      selectedProtocol.labware.map((labware) => (
                        <LabwareItem
                          key={labware.id}
                          labware={labware}
                          position={labware.position}
                          onEdit={editLabware}
                          onDelete={deleteLabware}
                        />
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No labware added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center - Protocol visualization */}
                <div className="md:col-span-2">
                  <ProtocolVisualization protocol={selectedProtocol} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No protocol selected</p>
                <p className="text-sm mt-2">Select a protocol from the Protocols tab or create a new one</p>
                <Button className="mt-4" onClick={() => setIsAddingProtocol(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Protocol
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code">
            {selectedProtocol ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Generated Code</h3>
                  <Button variant="outline" size="sm" onClick={exportProtocol}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="relative">
                  <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-auto max-h-[500px]">
                    <code>{generateOpentronsCode(selectedProtocol)}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      navigator.clipboard.writeText(generateOpentronsCode(selectedProtocol))
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
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No protocol selected</p>
                <p className="text-sm mt-2">Select a protocol to view its code</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="execution">
            {selectedProtocol ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Protocol Execution</h3>
                  <Button disabled={isRunning} onClick={runProtocol}>
                    {isRunning ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Protocol
                      </>
                    )}
                  </Button>
                </div>

                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{runProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${runProgress}%` }}></div>
                    </div>
                  </div>
                )}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="steps">
                    <AccordionTrigger>Protocol Steps</AccordionTrigger>
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
                          {selectedProtocol.steps.map((step, index) => (
                            <TableRow key={step.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{step.name}</TableCell>
                              <TableCell>{STEP_TYPES.find((t) => t.id === step.type)?.name || "Custom"}</TableCell>
                              <TableCell>
                                {step.type === "pipette" &&
                                  `${step.volume}µL from ${step.source} to ${step.destination}`}
                                {step.type === "mix" && `${step.repetitions}x ${step.volume}µL in ${step.destination}`}
                                {step.type === "incubate" && `${step.temperature}°C for ${step.duration} min`}
                                {step.type === "wait" && `${step.duration} min`}
                                {step.type === "centrifuge" && `${step.speed} rpm for ${step.duration} min`}
                                {step.type === "transfer" &&
                                  `${step.volume}µL from ${step.source} to ${step.destination}`}
                                {step.type === "custom" && "Custom code"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="labware">
                    <AccordionTrigger>Labware Setup</AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Position</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProtocol.labware && selectedProtocol.labware.length > 0 ? (
                            selectedProtocol.labware.map((labware) => (
                              <TableRow key={labware.id}>
                                <TableCell>{labware.position}</TableCell>
                                <TableCell>{labware.name}</TableCell>
                                <TableCell>
                                  {LABWARE_TYPES.find((l) => l.id === labware.type)?.name || "Custom"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center">
                                No labware defined
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="logs">
                    <AccordionTrigger>Execution Logs</AccordionTrigger>
                    <AccordionContent>
                      <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-auto max-h-[200px]">
                        {isRunning ? (
                          <code>
                            {selectedProtocol.steps
                              .slice(0, Math.ceil((selectedProtocol.steps.length * runProgress) / 100))
                              .map(
                                (step, index) =>
                                  `[${new Date().toISOString()}] Executing step ${index + 1}: ${step.name}\n`,
                              )}
                          </code>
                        ) : (
                          <code>Run the protocol to see execution logs</code>
                        )}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No protocol selected</p>
                <p className="text-sm mt-2">Select a protocol to execute it</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Add Protocol Dialog */}
      <Dialog open={isAddingProtocol} onOpenChange={setIsAddingProtocol}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Protocol</DialogTitle>
            <DialogDescription>Enter the details for your new lab automation protocol</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="protocol-name">Protocol Name</Label>
              <Input
                id="protocol-name"
                value={newProtocol.name}
                onChange={(e) => setNewProtocol({ ...newProtocol, name: e.target.value })}
                placeholder="e.g., PCR Setup"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol-description">Description</Label>
              <Textarea
                id="protocol-description"
                value={newProtocol.description}
                onChange={(e) => setNewProtocol({ ...newProtocol, description: e.target.value })}
                placeholder="Describe what this protocol does"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol-system">Lab System</Label>
              <Select
                value={newProtocol.system}
                onValueChange={(value) => setNewProtocol({ ...newProtocol, system: value })}
              >
                <SelectTrigger id="protocol-system">
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingProtocol(false)}>
              Cancel
            </Button>
            <Button onClick={addProtocol} disabled={!newProtocol.name}>
              Create Protocol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Step Dialog */}
      <Dialog open={isEditingStep} onOpenChange={setIsEditingStep}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentStep?.id.startsWith("step_") ? "Add Step" : "Edit Step"}</DialogTitle>
            <DialogDescription>Configure the parameters for this protocol step</DialogDescription>
          </DialogHeader>

          {currentStep && (
            <div className="grid gap-4 py-4">
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
                    <Label htmlFor="step-volume">Volume (µL)</Label>
                    <Input
                      id="step-volume"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={currentStep.volume}
                      onChange={(e) => setCurrentStep({ ...currentStep, volume: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-source">Source Well</Label>
                    <Input
                      id="step-source"
                      value={currentStep.source}
                      onChange={(e) => setCurrentStep({ ...currentStep, source: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-destination">Destination Well</Label>
                    <Input
                      id="step-destination"
                      value={currentStep.destination}
                      onChange={(e) => setCurrentStep({ ...currentStep, destination: e.target.value })}
                    />
                  </div>
                </>
              )}

              {currentStep.type === "mix" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="step-volume">Volume (µL)</Label>
                    <Input
                      id="step-volume"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={currentStep.volume}
                      onChange={(e) => setCurrentStep({ ...currentStep, volume: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-repetitions">Repetitions</Label>
                    <Input
                      id="step-repetitions"
                      type="number"
                      min="1"
                      value={currentStep.repetitions}
                      onChange={(e) => setCurrentStep({ ...currentStep, repetitions: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-destination">Well</Label>
                    <Input
                      id="step-destination"
                      value={currentStep.destination}
                      onChange={(e) => setCurrentStep({ ...currentStep, destination: e.target.value })}
                    />
                  </div>
                </>
              )}

              {currentStep.type === "incubate" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="step-temperature">Temperature (°C)</Label>
                    <Input
                      id="step-temperature"
                      type="number"
                      min="4"
                      max="100"
                      value={currentStep.temperature}
                      onChange={(e) => setCurrentStep({ ...currentStep, temperature: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-duration">Duration (minutes)</Label>
                    <Input
                      id="step-duration"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={currentStep.duration}
                      onChange={(e) => setCurrentStep({ ...currentStep, duration: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {currentStep.type === "wait" && (
                <div className="space-y-2">
                  <Label htmlFor="step-duration">Duration (minutes)</Label>
                  <Input
                    id="step-duration"
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
                    <Label htmlFor="step-speed">Speed (rpm)</Label>
                    <Input
                      id="step-speed"
                      type="number"
                      min="100"
                      step="100"
                      value={currentStep.speed}
                      onChange={(e) => setCurrentStep({ ...currentStep, speed: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-duration">Duration (minutes)</Label>
                    <Input
                      id="step-duration"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={currentStep.duration}
                      onChange={(e) => setCurrentStep({ ...currentStep, duration: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {currentStep.type === "transfer" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="step-volume">Volume (µL)</Label>
                    <Input
                      id="step-volume"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={currentStep.volume}
                      onChange={(e) => setCurrentStep({ ...currentStep, volume: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-source">Source Well</Label>
                    <Input
                      id="step-source"
                      value={currentStep.source}
                      onChange={(e) => setCurrentStep({ ...currentStep, source: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-destination">Destination Well</Label>
                    <Input
                      id="step-destination"
                      value={currentStep.destination}
                      onChange={(e) => setCurrentStep({ ...currentStep, destination: e.target.value })}
                    />
                  </div>
                </>
              )}

              {currentStep.type === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="step-code">Custom Code</Label>
                  <Textarea
                    id="step-code"
                    className="font-mono h-40"
                    value={currentStep.code}
                    onChange={(e) => setCurrentStep({ ...currentStep, code: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingStep(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateStep(currentStep)}>Save Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Labware Dialog */}
      <Dialog open={isEditingLabware} onOpenChange={setIsEditingLabware}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentLabware ? "Edit Labware" : "Add Labware"}</DialogTitle>
            <DialogDescription>Configure the labware for your protocol</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!currentLabware ? (
              <div className="grid grid-cols-2 gap-2">
                {LABWARE_TYPES.map((labware) => (
                  <Card
                    key={labware.id}
                    className="cursor-pointer hover:border-primary/50"
                    onClick={() => addLabware(labware.id)}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <Layers className="h-8 w-8 mb-2 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-medium">{labware.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {labware.format}, {labware.wells} wells
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="labware-name">Labware Name</Label>
                  <Input
                    id="labware-name"
                    value={currentLabware.name}
                    onChange={(e) => setCurrentLabware({ ...currentLabware, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labware-position">Deck Position (1-9)</Label>
                  <Input
                    id="labware-position"
                    type="number"
                    min="1"
                    max="9"
                    value={currentLabware.position}
                    onChange={(e) => setCurrentLabware({ ...currentLabware, position: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labware-type">Labware Type</Label>
                  <Select
                    value={currentLabware.type}
                    onValueChange={(value) => setCurrentLabware({ ...currentLabware, type: value })}
                  >
                    <SelectTrigger id="labware-type">
                      <SelectValue placeholder="Select labware type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LABWARE_TYPES.map((labware) => (
                        <SelectItem key={labware.id} value={labware.id}>
                          {labware.name} ({labware.format})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditingLabware(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => updateLabware(currentLabware)}>Save Labware</Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
