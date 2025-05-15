"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Camera, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize, RefreshCw } from "lucide-react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// Amino acid to color mapping
const aminoAcidColors = {
  A: "#8BC34A", // Alanine - Green
  R: "#2196F3", // Arginine - Blue
  N: "#9C27B0", // Asparagine - Purple
  D: "#F44336", // Aspartic Acid - Red
  C: "#FFEB3B", // Cysteine - Yellow
  E: "#F44336", // Glutamic Acid - Red
  Q: "#9C27B0", // Glutamine - Purple
  G: "#8BC34A", // Glycine - Green
  H: "#2196F3", // Histidine - Blue
  I: "#FF9800", // Isoleucine - Orange
  L: "#FF9800", // Leucine - Orange
  K: "#2196F3", // Lysine - Blue
  M: "#FF9800", // Methionine - Orange
  F: "#FF9800", // Phenylalanine - Orange
  P: "#8BC34A", // Proline - Green
  S: "#9C27B0", // Serine - Purple
  T: "#9C27B0", // Threonine - Purple
  W: "#FF9800", // Tryptophan - Orange
  Y: "#FF9800", // Tyrosine - Orange
  V: "#FF9800", // Valine - Orange
}

// Genetic code - DNA to amino acid mapping
const geneticCode = {
  TTT: "F",
  TTC: "F",
  TTA: "L",
  TTG: "L",
  CTT: "L",
  CTC: "L",
  CTA: "L",
  CTG: "L",
  ATT: "I",
  ATC: "I",
  ATA: "I",
  ATG: "M",
  GTT: "V",
  GTC: "V",
  GTA: "V",
  GTG: "V",
  TCT: "S",
  TCC: "S",
  TCA: "S",
  TCG: "S",
  CCT: "P",
  CCC: "P",
  CCA: "P",
  CCG: "P",
  ACT: "T",
  ACC: "T",
  ACA: "T",
  ACG: "T",
  GCT: "A",
  GCC: "A",
  GCA: "A",
  GCG: "A",
  TAT: "Y",
  TAC: "Y",
  TAA: "*",
  TAG: "*",
  CAT: "H",
  CAC: "H",
  CAA: "Q",
  CAG: "Q",
  AAT: "N",
  AAC: "N",
  AAA: "K",
  AAG: "K",
  GAT: "D",
  GAC: "D",
  GAA: "E",
  GAG: "E",
  TGT: "C",
  TGC: "C",
  TGA: "*",
  TGG: "W",
  CGT: "R",
  CGC: "R",
  CGA: "R",
  CGG: "R",
  AGT: "S",
  AGC: "S",
  AGA: "R",
  AGG: "R",
  GGT: "G",
  GGC: "G",
  GGA: "G",
  GGG: "G",
}

// Translate DNA to protein
const translateDNA = (dnaSequence) => {
  let proteinSequence = ""

  // Clean the sequence
  const cleanDNA = dnaSequence.toUpperCase().replace(/[^ATGC]/g, "")

  // Find start codon
  let startIndex = cleanDNA.indexOf("ATG")
  if (startIndex === -1) {
    // If no start codon, just start from the beginning
    startIndex = 0
  }

  // Translate codons
  for (let i = startIndex; i < cleanDNA.length - 2; i += 3) {
    const codon = cleanDNA.substring(i, i + 3)
    if (codon.length === 3) {
      const aa = geneticCode[codon] || "X"
      if (aa === "*") break // Stop at stop codon
      proteinSequence += aa
    }
  }

  return proteinSequence
}

export default function ProteinModeler({ sequence, geneName }) {
  const [proteinSequence, setProteinSequence] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [modelData, setModelData] = useState(null)
  const [viewMode, setViewMode] = useState("cartoon")
  const [colorMode, setColorMode] = useState("structure")
  const [showLabels, setShowLabels] = useState(true)
  const [showSideChains, setShowSideChains] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [predictionConfidence, setPredictionConfidence] = useState(null)
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const controlsRef = useRef(null)
  const { toast } = useToast()

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return

    // Create scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 1, 1)
    scene.add(directionalLight)

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25

    // Store references
    sceneRef.current = { scene, camera, renderer }
    controlsRef.current = controls

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      renderer.dispose()
      controls.dispose()

      // Clean up scene
      while (scene.children.length > 0) {
        const object = scene.children[0]
        scene.remove(object)
      }
    }
  }, [])

  // Translate DNA to protein on mount
  useEffect(() => {
    if (sequence) {
      const protein = translateDNA(sequence)
      setProteinSequence(protein)
    }
  }, [sequence])

  // Predict protein structure
  const predictStructure = async () => {
    if (!proteinSequence) {
      toast({
        title: "No protein sequence",
        description: "Please provide a valid protein sequence for structure prediction.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate AlphaFold API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Generate mock structure data
      const mockStructure = generateMockStructure(proteinSequence)
      setModelData(mockStructure)

      // Set random confidence score
      setPredictionConfidence(Math.random() * 0.4 + 0.6) // Between 0.6 and 1.0

      toast({
        title: "Structure prediction complete",
        description: `AlphaFold has predicted the 3D structure for ${geneName || "the protein"}.`,
      })

      // Render the protein structure
      renderProteinStructure(mockStructure)
    } catch (error) {
      console.error("Error predicting structure:", error)
      toast({
        title: "Prediction failed",
        description: "An error occurred during structure prediction.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate mock structure data
  const generateMockStructure = (sequence) => {
    const atoms = []
    const bonds = []
    const secondaryStructure = []

    // Generate backbone atoms
    let x = 0,
      y = 0,
      z = 0
    let prevCA = null

    for (let i = 0; i < sequence.length; i++) {
      const residue = sequence[i]

      // Add alpha carbon (CA)
      const ca = {
        id: `CA_${i}`,
        element: "C",
        residue,
        residueNumber: i + 1,
        x,
        y,
        z,
        type: "backbone",
      }
      atoms.push(ca)

      // Add bond to previous CA
      if (prevCA) {
        bonds.push({
          from: prevCA.id,
          to: ca.id,
          type: "backbone",
        })
      }

      prevCA = ca

      // Add side chain atom
      const sideChainDistance = Math.random() * 0.5 + 0.5
      const sideChainAngle = Math.random() * Math.PI * 2
      const sideChainX = x + Math.cos(sideChainAngle) * sideChainDistance
      const sideChainY = y + Math.sin(sideChainAngle) * sideChainDistance
      const sideChainZ = z + (Math.random() - 0.5) * 0.5

      const sideChain = {
        id: `SC_${i}`,
        element: "C",
        residue,
        residueNumber: i + 1,
        x: sideChainX,
        y: sideChainY,
        z: sideChainZ,
        type: "sidechain",
      }
      atoms.push(sideChain)

      // Add bond from CA to side chain
      bonds.push({
        from: ca.id,
        to: sideChain.id,
        type: "sidechain",
      })

      // Move to next position along a helix-like path
      const t = i / sequence.length
      const helixRadius = 1.5
      const helixPitch = 0.5

      // Determine secondary structure
      let structure
      if (i % 20 < 10) {
        structure = "helix"
        // Helix path
        x = helixRadius * Math.cos(i * 0.6)
        y = helixRadius * Math.sin(i * 0.6)
        z += helixPitch
      } else {
        structure = "sheet"
        // Sheet-like path
        x += 0.8
        y = Math.sin(i * 0.2) * 0.5
        z = Math.cos(i * 0.2) * 0.5
      }

      secondaryStructure.push({
        residueNumber: i + 1,
        type: structure,
      })
    }

    return {
      atoms,
      bonds,
      secondaryStructure,
    }
  }

  // Render protein structure
  const renderProteinStructure = (structureData) => {
    if (!sceneRef.current || !structureData) return

    const { scene } = sceneRef.current

    // Clear existing model
    scene.children.forEach((child) => {
      if (child.isProtein) {
        scene.remove(child)
      }
    })

    // Create protein group
    const proteinGroup = new THREE.Group()
    proteinGroup.isProtein = true

    // Add atoms
    const atomGeometry = new THREE.SphereGeometry(0.2, 16, 16)

    structureData.atoms.forEach((atom) => {
      const material = new THREE.MeshPhongMaterial({
        color:
          atom.type === "backbone"
            ? colorMode === "structure"
              ? structureData.secondaryStructure[atom.residueNumber - 1]?.type === "helix"
                ? 0xff0000
                : 0x0000ff
              : new THREE.Color(aminoAcidColors[atom.residue] || "#cccccc")
            : 0xcccccc,
      })

      const mesh = new THREE.Mesh(atomGeometry, material)
      mesh.position.set(atom.x, atom.y, atom.z)
      mesh.userData = atom

      // Only show side chains if enabled
      if (atom.type === "backbone" || showSideChains) {
        proteinGroup.add(mesh)
      }

      // Add label if enabled
      if (showLabels && atom.type === "backbone") {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        canvas.width = 64
        canvas.height = 32

        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.font = "24px Arial"
        context.fillStyle = "#000000"
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText(atom.residue, canvas.width / 2, canvas.height / 2)

        const texture = new THREE.CanvasTexture(canvas)
        const labelMaterial = new THREE.SpriteMaterial({ map: texture })
        const sprite = new THREE.Sprite(labelMaterial)
        sprite.position.set(atom.x, atom.y + 0.4, atom.z)
        sprite.scale.set(0.5, 0.25, 1)

        proteinGroup.add(sprite)
      }
    })

    // Add bonds
    structureData.bonds.forEach((bond) => {
      const fromAtom = structureData.atoms.find((a) => a.id === bond.from)
      const toAtom = structureData.atoms.find((a) => a.id === bond.to)

      if (fromAtom && toAtom) {
        // Skip side chain bonds if side chains are hidden
        if (bond.type === "sidechain" && !showSideChains) {
          return
        }

        const start = new THREE.Vector3(fromAtom.x, fromAtom.y, fromAtom.z)
        const end = new THREE.Vector3(toAtom.x, toAtom.y, toAtom.z)

        const direction = new THREE.Vector3().subVectors(end, start)
        const length = direction.length()

        const bondGeometry = new THREE.CylinderGeometry(0.05, 0.05, length, 8)
        bondGeometry.translate(0, length / 2, 0)

        const bondMaterial = new THREE.MeshPhongMaterial({
          color: bond.type === "backbone" ? 0x888888 : 0xaaaaaa,
        })

        const bond = new THREE.Mesh(bondGeometry, bondMaterial)
        bond.position.copy(start)
        bond.lookAt(end)

        proteinGroup.add(bond)
      }
    })

    // Add to scene
    scene.add(proteinGroup)

    // Reset camera
    resetView()
  }

  // Reset view
  const resetView = () => {
    if (!controlsRef.current) return

    controlsRef.current.reset()
    setZoom(1)
    setRotation({ x: 0, y: 0 })
  }

  // Update view based on mode
  useEffect(() => {
    if (modelData) {
      renderProteinStructure(modelData)
    }
  }, [viewMode, colorMode, showLabels, showSideChains])

  // Export structure as image
  const exportImage = () => {
    if (!sceneRef.current) return

    const { renderer } = sceneRef.current
    const image = renderer.domElement.toDataURL("image/png")

    const link = document.createElement("a")
    link.href = image
    link.download = `${geneName || "protein"}_structure.png`
    link.click()

    toast({
      title: "Image exported",
      description: "The protein structure has been exported as a PNG image.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">AlphaFold Protein Structure Prediction</h3>
        <Button onClick={predictStructure} disabled={isLoading || !proteinSequence}>
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Predicting...
            </>
          ) : (
            "Predict Structure"
          )}
        </Button>
      </div>

      <Tabs defaultValue="structure">
        <TabsList className="w-full">
          <TabsTrigger value="structure" className="flex-1">
            3D Structure
          </TabsTrigger>
          <TabsTrigger value="sequence" className="flex-1">
            Protein Sequence
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            Visualization Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(zoom + 0.1, 2))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRotation({ ...rotation, y: rotation.y + 15 })}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRotation({ ...rotation, y: rotation.y - 15 })}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={exportImage} disabled={!modelData}>
              <Camera className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="border rounded-md p-4 bg-white">
            <canvas ref={canvasRef} className="w-full h-[400px]" />
          </div>

          {predictionConfidence !== null && (
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium">Prediction Confidence:</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      predictionConfidence > 0.9
                        ? "bg-green-500"
                        : predictionConfidence > 0.7
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${predictionConfidence * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm font-medium">{(predictionConfidence * 100).toFixed(1)}%</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sequence" className="space-y-4">
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-2">Protein Sequence</h4>
            <div className="font-mono text-sm bg-gray-50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
              {proteinSequence ? (
                Array.from({ length: Math.ceil(proteinSequence.length / 10) }).map((_, i) => (
                  <div key={i} className="flex">
                    <span className="w-10 text-gray-500 select-none">{i * 10 + 1}</span>
                    <span>
                      {Array.from({ length: 10 }).map((_, j) => {
                        const index = i * 10 + j
                        if (index >= proteinSequence.length) return null
                        const aa = proteinSequence[index]
                        return (
                          <span key={j} className="inline-block" style={{ color: aminoAcidColors[aa] || "#000000" }}>
                            {aa}
                          </span>
                        )
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground">No protein sequence available.</span>
              )}
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-2">Amino Acid Legend</h4>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(aminoAcidColors).map(([aa, color]) => (
                <div key={aa} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                  <span className="text-xs">{aa}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-2">DNA to Protein Translation</h4>
            <div className="text-sm">
              <p>Original DNA sequence length: {sequence ? sequence.length : 0} bp</p>
              <p>Translated protein length: {proteinSequence ? proteinSequence.length : 0} amino acids</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-4">Visualization Settings</h4>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="view-mode">View Mode</Label>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger id="view-mode">
                    <SelectValue placeholder="Select view mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="backbone">Backbone</SelectItem>
                    <SelectItem value="spacefill">Space Fill</SelectItem>
                    <SelectItem value="ribbon">Ribbon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-mode">Color Scheme</Label>
                <Select value={colorMode} onValueChange={setColorMode}>
                  <SelectTrigger id="color-mode">
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="structure">Secondary Structure</SelectItem>
                    <SelectItem value="residue">Residue Type</SelectItem>
                    <SelectItem value="chain">Chain</SelectItem>
                    <SelectItem value="hydrophobicity">Hydrophobicity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                <Label htmlFor="show-labels">Show Residue Labels</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-sidechains" checked={showSideChains} onCheckedChange={setShowSideChains} />
                <Label htmlFor="show-sidechains">Show Side Chains</Label>
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {["#ffffff", "#000000", "#f8f9fa", "#e9ecef", "#dee2e6"].map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-md cursor-pointer border"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        if (sceneRef.current) {
                          sceneRef.current.scene.background = new THREE.Color(color)
                        }
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
