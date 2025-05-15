"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type NodeTypes,
} from "reactflow"
import "reactflow/dist/style.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  FileDown,
  FileUp,
  Play,
  Pause,
  RotateCcw,
  Dna,
  Database,
  Share2,
  Plus,
  Settings,
  Layers,
  Folder,
  FolderOpen,
  CircleOff,
  TerminalIcon,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Microscope,
  Brain,
  Cpu,
  FlaskConical,
  Workflow,
  Beaker,
} from "lucide-react"

import ComponentLibrary from "@/components/component-library"
import PropertiesPanel from "@/components/properties-panel"
import SimulationPanel from "@/components/simulation-panel"
import { PromoterNode, GeneNode, TerminatorNode, RegulatoryNode } from "@/components/genetic-nodes"
import DatabaseSearch from "@/components/database-search"
import PlasmidViewer from "@/components/plasmid-viewer"
import SequenceValidator from "@/components/sequence-validator"
import CodonOptimizer from "@/components/codon-optimizer"
import GeneticTerminal from "@/components/genetic-terminal"
import PhysicalConstraints from "@/components/physical-constraints"
import FunctionalGroupsViewer from "@/components/functional-groups-viewer"
import ProteinModeler from "@/components/protein-modeler"
import AIAssistant from "@/components/ai-assistant"
import MLPipelineBuilder from "@/components/ml-pipeline-builder"
import LabAutomation from "@/components/lab-automation"
import OpenRouterIntegration from "@/components/openrouter-integration"
import AntibodyDesigner from "@/components/antibody-designer"
import ProteinExpressionWorkflow from "@/components/protein-expression-workflow"

// Define the node types
const nodeTypes: NodeTypes = {
  promoter: PromoterNode,
  gene: GeneNode,
  terminator: TerminatorNode,
  regulatory: RegulatoryNode,
}

export default function BioDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationTime, setSimulationTime] = useState(0)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [activeRightPanel, setActiveRightPanel] = useState("properties")
  const [activeBottomPanel, setActiveBottomPanel] = useState(null)
  const [activeLeftPanel, setActiveLeftPanel] = useState("components")
  const reactFlowWrapper = useRef(null)
  const { toast } = useToast()

  // Fix for the React error - use useEffect to update simulation time
  const simulationRef = useRef({ time: 0, isRunning: false, speed: 1 })

  useEffect(() => {
    simulationRef.current.time = simulationTime
    simulationRef.current.isRunning = isSimulating
    simulationRef.current.speed = simulationSpeed
  }, [simulationTime, isSimulating, simulationSpeed])

  // Animation frame for simulation
  useEffect(() => {
    let animationFrameId

    const updateSimulation = () => {
      if (simulationRef.current.isRunning) {
        setSimulationTime((time) => time + 0.1 * simulationRef.current.speed)
        animationFrameId = requestAnimationFrame(updateSimulation)
      }
    }

    if (isSimulating) {
      animationFrameId = requestAnimationFrame(updateSimulation)
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isSimulating])

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")

      // Check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      // Get component data from the drag event
      const componentData = JSON.parse(event.dataTransfer.getData("application/bioComponent"))

      // Create a new node
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          ...componentData,
          label: componentData.name || `${type.charAt(0).toUpperCase() + type.slice(1)}`,
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes],
  )

  const startSimulation = () => {
    if (nodes.length === 0) {
      toast({
        title: "No components to simulate",
        description: "Add some genetic components to your design first.",
        variant: "destructive",
      })
      return
    }

    setIsSimulating(true)
    setSimulationTime(0)

    toast({
      title: "Simulation started",
      description: "Running genetic circuit simulation...",
    })
  }

  const stopSimulation = () => {
    setIsSimulating(false)
    toast({
      title: "Simulation paused",
      description: "You can continue or reset the simulation.",
    })
  }

  const resetSimulation = () => {
    setIsSimulating(false)
    setSimulationTime(0)
    toast({
      title: "Simulation reset",
      description: "The simulation has been reset to initial conditions.",
    })
  }

  const exportDesign = () => {
    const designData = {
      nodes,
      edges,
    }

    const dataStr = JSON.stringify(designData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `biodesign-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Design exported",
      description: "Your genetic circuit design has been exported as JSON.",
    })
  }

  const saveProject = () => {
    toast({
      title: "Project saved",
      description: "Your project has been saved successfully.",
    })
  }

  const handleAddComponentFromDatabase = (component) => {
    // Create a new node from the database component
    const newNode = {
      id: `${component.type}-${Date.now()}`,
      type: component.type,
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        ...component,
        label: component.name,
      },
    }

    setNodes((nds) => nds.concat(newNode))
  }

  const validateSequences = () => {
    setActiveBottomPanel("validator")
    toast({
      title: "Sequence validation initiated",
      description: "Analyzing sequences for errors and issues...",
    })
  }

  const optimizeCodons = () => {
    if (!selectedNode || selectedNode.type !== "gene") {
      toast({
        title: "No gene selected",
        description: "Please select a gene component for codon optimization.",
        variant: "destructive",
      })
      return
    }

    setActiveBottomPanel("optimizer")
    toast({
      title: "Codon optimization initiated",
      description: "Preparing to optimize codons for the selected gene...",
    })
  }

  const analyzePhysicalConstraints = () => {
    setActiveBottomPanel("constraints")
    toast({
      title: "Physical constraints analysis initiated",
      description: "Analyzing design for physical constraints and issues...",
    })
  }

  const viewFunctionalGroups = () => {
    if (!selectedNode || !selectedNode.data.sequence) {
      toast({
        title: "No sequence selected",
        description: "Please select a component with a sequence to view functional groups.",
        variant: "destructive",
      })
      return
    }

    setActiveBottomPanel("functional")
    toast({
      title: "Functional groups analysis initiated",
      description: "Analyzing sequence for functional groups...",
    })
  }

  const openTerminal = () => {
    setActiveBottomPanel("terminal")
  }

  const viewPlasmid = () => {
    setActiveBottomPanel("plasmid")
    toast({
      title: "Plasmid visualization initiated",
      description: "Generating plasmid map from your design...",
    })
  }

  const modelProtein = () => {
    if (!selectedNode || selectedNode.type !== "gene" || !selectedNode.data.sequence) {
      toast({
        title: "No valid gene selected",
        description: "Please select a gene component with a sequence for protein modeling.",
        variant: "destructive",
      })
      return
    }

    setActiveBottomPanel("protein")
    toast({
      title: "Protein modeling initiated",
      description: "Connecting to AlphaFold API for protein structure prediction...",
    })
  }

  const openAIAssistant = () => {
    setActiveBottomPanel("ai")
    toast({
      title: "AI Assistant activated",
      description: "Connecting to LLM for autonomous design assistance...",
    })
  }

  const closeBottomPanel = () => {
    setActiveBottomPanel(null)
  }

  const openMLPipelineBuilder = () => {
    setActiveBottomPanel("mlpipeline")
    toast({
      title: "ML Pipeline Builder activated",
      description: "Building machine learning pipelines for your data...",
    })
  }

  const openLabAutomation = () => {
    setActiveBottomPanel("labautomation")
    toast({
      title: "Lab Automation Integration activated",
      description: "Connecting to lab automation systems...",
    })
  }

  const openOpenRouterIntegration = () => {
    setActiveBottomPanel("openrouter")
    toast({
      title: "OpenRouter Integration activated",
      description: "Connecting to OpenRouter for LLM access...",
    })
  }

  const openAntibodyDesigner = () => {
    setActiveBottomPanel("antibody")
    toast({
      title: "Antibody Designer activated",
      description: "Design and analyze antibody sequences for therapeutic development",
    })
  }

  const openProteinExpression = () => {
    setActiveBottomPanel("expression")
    toast({
      title: "Protein Expression Workflow activated",
      description: "Setup, monitor, and analyze protein expression runs",
    })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b bg-background p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="h-6 w-6 text-emerald-500" />
            <h1 className="text-xl font-bold">BioDesigner IDE</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={saveProject}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={exportDesign}>
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <FileUp className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Component Library */}
        <div className="w-64 border-r bg-background p-4 overflow-y-auto">
          <Tabs defaultValue="components">
            <TabsList className="w-full">
              <TabsTrigger value="components" className="flex-1">
                <Layers className="mr-2 h-4 w-4" />
                Components
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex-1">
                <Folder className="mr-2 h-4 w-4" />
                Projects
              </TabsTrigger>
            </TabsList>
            <TabsContent value="components" className="mt-4">
              <ComponentLibrary />
            </TabsContent>
            <TabsContent value="projects" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">Recent Projects</h3>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border p-2 hover:bg-muted cursor-pointer">
                    <div className="flex items-center">
                      <FolderOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Repressilator</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2d ago</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-2 hover:bg-muted cursor-pointer">
                    <div className="flex items-center">
                      <FolderOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Toggle Switch</span>
                    </div>
                    <span className="text-xs text-muted-foreground">5d ago</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-2 hover:bg-muted cursor-pointer">
                    <div className="flex items-center">
                      <FolderOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">GFP Expression</span>
                    </div>
                    <span className="text-xs text-muted-foreground">1w ago</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Tools Section */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={validateSequences}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Validate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={optimizeCodons}
                disabled={!selectedNode || selectedNode.type !== "gene"}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Optimize
              </Button>
              <Button variant="outline" size="sm" onClick={viewPlasmid}>
                <Dna className="mr-2 h-4 w-4" />
                Plasmid
              </Button>
              <Button variant="outline" size="sm" onClick={analyzePhysicalConstraints}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Constraints
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={viewFunctionalGroups}
                disabled={!selectedNode || !selectedNode.data.sequence}
              >
                <Microscope className="mr-2 h-4 w-4" />
                Groups
              </Button>
              <Button variant="outline" size="sm" onClick={openTerminal}>
                <TerminalIcon className="mr-2 h-4 w-4" />
                Terminal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={modelProtein}
                disabled={!selectedNode || selectedNode.type !== "gene" || !selectedNode.data.sequence}
              >
                <Cpu className="mr-2 h-4 w-4" />
                AlphaFold
              </Button>
              <Button variant="outline" size="sm" onClick={openAIAssistant}>
                <Brain className="mr-2 h-4 w-4" />
                AI Assistant
              </Button>
              <Button variant="outline" size="sm" onClick={openMLPipelineBuilder}>
                <Workflow className="mr-2 h-4 w-4" />
                ML Pipeline
              </Button>
              <Button variant="outline" size="sm" onClick={openLabAutomation}>
                <FlaskConical className="mr-2 h-4 w-4" />
                Lab Automation
              </Button>
              <Button variant="outline" size="sm" onClick={openOpenRouterIntegration}>
                <Brain className="mr-2 h-4 w-4" />
                OpenRouter
              </Button>
              <Button variant="outline" size="sm" onClick={openAntibodyDesigner}>
                <Beaker className="mr-2 h-4 w-4" />
                Antibody
              </Button>
              <Button variant="outline" size="sm" onClick={openProteinExpression}>
                <FlaskConical className="mr-2 h-4 w-4" />
                Expression
              </Button>
            </div>
          </div>
        </div>

        {/* Main workspace */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                onDragOver={onDragOver}
                onDrop={onDrop}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />
                <Panel position="top-center">
                  <div className="flex items-center gap-2 bg-background border rounded-md p-2 shadow-sm">
                    {!isSimulating ? (
                      <Button size="sm" onClick={startSimulation}>
                        <Play className="mr-2 h-4 w-4" />
                        Run Simulation
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={stopSimulation}>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={resetSimulation}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    {isSimulating && (
                      <div className="flex items-center gap-2 ml-2">
                        <Label className="text-xs">Speed:</Label>
                        <Slider
                          value={[simulationSpeed]}
                          min={0.1}
                          max={5}
                          step={0.1}
                          className="w-24"
                          onValueChange={(value) => setSimulationSpeed(value[0])}
                        />
                        <span className="text-xs">{simulationSpeed}x</span>
                      </div>
                    )}
                  </div>
                </Panel>
              </ReactFlow>
            </ReactFlowProvider>
          </div>

          {/* Bottom panel - Tools */}
          {activeBottomPanel && (
            <div className="h-96 border-t bg-background p-4 overflow-y-auto relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={closeBottomPanel}
              >
                <CircleOff className="h-4 w-4" />
              </Button>

              {activeBottomPanel === "validator" && (
                <SequenceValidator sequence={selectedNode?.data?.sequence || ""} type={selectedNode?.type || ""} />
              )}

              {activeBottomPanel === "optimizer" && (
                <CodonOptimizer sequence={selectedNode?.data?.sequence || ""} type={selectedNode?.type || ""} />
              )}

              {activeBottomPanel === "plasmid" && <PlasmidViewer nodes={nodes} edges={edges} />}

              {activeBottomPanel === "terminal" && <GeneticTerminal nodes={nodes} edges={edges} />}

              {activeBottomPanel === "constraints" && <PhysicalConstraints nodes={nodes} edges={edges} />}

              {activeBottomPanel === "functional" && (
                <FunctionalGroupsViewer sequence={selectedNode?.data?.sequence || ""} type={selectedNode?.type || ""} />
              )}

              {activeBottomPanel === "protein" && (
                <ProteinModeler
                  sequence={selectedNode?.data?.sequence || ""}
                  geneName={selectedNode?.data?.name || "Unknown Gene"}
                />
              )}

              {activeBottomPanel === "ai" && (
                <AIAssistant
                  nodes={nodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  onUpdateNode={(id, data) => {
                    setNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === id) {
                          return { ...node, data: { ...node.data, ...data } }
                        }
                        return node
                      }),
                    )
                  }}
                  onAddNode={handleAddComponentFromDatabase}
                />
              )}

              {activeBottomPanel === "mlpipeline" && (
                <MLPipelineBuilder
                  nodes={nodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  onUpdateNode={(id, data) => {
                    setNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === id) {
                          return { ...node, data: { ...node.data, ...data } }
                        }
                        return node
                      }),
                    )
                  }}
                  onAddNode={handleAddComponentFromDatabase}
                />
              )}

              {activeBottomPanel === "labautomation" && (
                <LabAutomation
                  nodes={nodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  onUpdateNode={(id, data) => {
                    setNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === id) {
                          return { ...node, data: { ...node.data, ...data } }
                        }
                        return node
                      }),
                    )
                  }}
                  onAddNode={handleAddComponentFromDatabase}
                />
              )}

              {activeBottomPanel === "openrouter" && (
                <OpenRouterIntegration
                  nodes={nodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  onUpdateNode={(id, data) => {
                    setNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === id) {
                          return { ...node, data: { ...node.data, ...data } }
                        }
                        return node
                      }),
                    )
                  }}
                  onAddNode={handleAddComponentFromDatabase}
                />
              )}

              {activeBottomPanel === "antibody" && <AntibodyDesigner />}

              {activeBottomPanel === "expression" && <ProteinExpressionWorkflow />}
            </div>
          )}

          {/* Bottom panel - Simulation results */}
          {isSimulating && !activeBottomPanel && (
            <div className="h-64 border-t bg-background p-4 overflow-y-auto">
              <SimulationPanel
                nodes={nodes}
                edges={edges}
                time={simulationTime}
                speed={simulationSpeed}
                isRunning={isSimulating}
              />
            </div>
          )}
        </div>

        {/* Right sidebar - Properties */}
        <div className="w-80 border-l bg-background p-4 overflow-y-auto">
          <Tabs value={activeRightPanel} onValueChange={setActiveRightPanel}>
            <TabsList className="w-full">
              <TabsTrigger value="properties" className="flex-1">
                <Settings className="mr-2 h-4 w-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="database" className="flex-1">
                <Database className="mr-2 h-4 w-4" />
                Database
              </TabsTrigger>
            </TabsList>
            <TabsContent value="properties" className="mt-4">
              {selectedNode ? (
                <PropertiesPanel
                  node={selectedNode}
                  updateNode={(id, data) => {
                    setNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === id) {
                          return { ...node, data: { ...node.data, ...data } }
                        }
                        return node
                      }),
                    )
                  }}
                  deleteNode={(id) => {
                    setNodes((nds) => nds.filter((node) => node.id !== id))
                    setSelectedNode(null)
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                  <Settings className="h-12 w-12 mb-4 opacity-20" />
                  <p>Select a component to view and edit its properties</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="database" className="mt-4">
              <DatabaseSearch onAddComponent={handleAddComponentFromDatabase} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
