"use client"

import { useState, useEffect, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Camera } from "lucide-react"

// Simple stochastic simulation of gene expression
const simulateGeneExpression = (nodes, edges, time) => {
  // Find reporter genes (GFP, RFP, etc.)
  const reporters = nodes.filter((node) => node.type === "gene" && node.data.function === "reporter")

  // Find repressors
  const repressors = nodes.filter((node) => node.type === "gene" && node.data.function === "repressor")

  // Find promoters
  const promoters = nodes.filter((node) => node.type === "promoter")

  // Create a map of connections
  const connections = {}
  edges.forEach((edge) => {
    if (!connections[edge.target]) {
      connections[edge.target] = []
    }
    connections[edge.target].push(edge.source)
  })

  // Generate data for each reporter
  const data = {}

  reporters.forEach((reporter) => {
    const reporterName = reporter.data.name
    const reporterColor = reporter.data.color || "green"

    // Find if this reporter is connected to a promoter
    let connectedPromoter = null
    if (connections[reporter.id]) {
      const sourceIds = connections[reporter.id]
      connectedPromoter = promoters.find((p) => sourceIds.includes(p.id))
    }

    // Calculate expression level based on promoter strength and time
    let expressionLevel = 0

    if (connectedPromoter) {
      const baseStrength = {
        low: 20,
        medium: 50,
        high: 80,
        "very high": 100,
      }[connectedPromoter.data.strength || "medium"]

      // Add some noise and time-dependent behavior
      const noise = Math.sin(time * 0.1) * 10 + Math.random() * 5
      expressionLevel = baseStrength + noise

      // If the promoter is inducible, check if it's being repressed
      if (connectedPromoter.data.inducible) {
        // Find if any repressor targets this promoter
        const repressorsTargetingThisPromoter = repressors.filter(
          (repressor) => repressor.data.targets && repressor.data.targets.includes(connectedPromoter.data.id),
        )

        if (repressorsTargetingThisPromoter.length > 0) {
          // Apply repression
          expressionLevel *= 0.3
        }
      }

      // Ensure expression level is within bounds
      expressionLevel = Math.max(0, Math.min(100, expressionLevel))
    }

    data[reporterName] = {
      color: reporterColor,
      value: expressionLevel,
    }
  })

  return data
}

export default function SimulationPanel({ nodes, edges, time, speed, isRunning }) {
  const [simulationData, setSimulationData] = useState([])
  const [chartData, setChartData] = useState([])
  const animationRef = useRef(null)

  // Run simulation - this is now controlled by the parent component
  useEffect(() => {
    // Only update data when time changes
    if (isRunning) {
      // Run simulation for this time point
      const newData = simulateGeneExpression(nodes, edges, time)

      // Add to simulation data history
      setSimulationData((prev) => {
        const newSimData = [...prev, { time, ...newData }]
        // Keep only the last 100 data points
        if (newSimData.length > 100) {
          return newSimData.slice(-100)
        }
        return newSimData
      })
    }
  }, [time, nodes, edges, isRunning])

  // Format data for chart
  useEffect(() => {
    if (simulationData.length > 0) {
      // Extract all protein names from the latest data point
      const latestDataPoint = simulationData[simulationData.length - 1]
      const proteinNames = Object.keys(latestDataPoint).filter((key) => key !== "time")

      // Format data for the chart
      const formattedData = simulationData.map((dataPoint) => {
        const chartPoint = { time: dataPoint.time.toFixed(1) }

        proteinNames.forEach((protein) => {
          if (dataPoint[protein]) {
            chartPoint[protein] = dataPoint[protein].value
          }
        })

        return chartPoint
      })

      setChartData(formattedData)
    }
  }, [simulationData])

  // Get colors for chart lines
  const getLineColors = () => {
    const colors = {}

    if (simulationData.length > 0) {
      const latestDataPoint = simulationData[simulationData.length - 1]

      Object.keys(latestDataPoint).forEach((key) => {
        if (key !== "time" && latestDataPoint[key].color) {
          switch (latestDataPoint[key].color) {
            case "green":
              colors[key] = "#10b981"
              break
            case "red":
              colors[key] = "#ef4444"
              break
            case "yellow":
              colors[key] = "#eab308"
              break
            case "blue":
              colors[key] = "#3b82f6"
              break
            case "cyan":
              colors[key] = "#06b6d4"
              break
            default:
              colors[key] = "#6366f1"
          }
        }
      })
    }

    return colors
  }

  const lineColors = getLineColors()

  // Get current expression levels
  const getCurrentLevels = () => {
    if (simulationData.length === 0) return []

    const latestDataPoint = simulationData[simulationData.length - 1]
    const proteins = Object.keys(latestDataPoint).filter((key) => key !== "time")

    return proteins.map((protein) => ({
      name: protein,
      value: latestDataPoint[protein].value.toFixed(1),
      color: latestDataPoint[protein].color,
    }))
  }

  const currentLevels = getCurrentLevels()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Simulation Results</h3>
        <div className="text-sm text-muted-foreground">Time: {time.toFixed(1)} s</div>
      </div>

      <Tabs defaultValue="chart">
        <TabsList className="w-full">
          <TabsTrigger value="chart" className="flex-1">
            Expression Chart
          </TabsTrigger>
          <TabsTrigger value="current" className="flex-1">
            Current Levels
          </TabsTrigger>
          <TabsTrigger value="sequence" className="flex-1">
            Sequence View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="h-40">
          {chartData.length > 0 ? (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottomRight", offset: -5 }} />
                  <YAxis label={{ value: "Expression Level", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {Object.keys(lineColors).map((protein) => (
                    <Line
                      key={protein}
                      type="monotone"
                      dataKey={protein}
                      stroke={lineColors[protein]}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available yet. Run the simulation longer to see results.
            </div>
          )}
        </TabsContent>

        <TabsContent value="current">
          {currentLevels.length > 0 ? (
            <div className="space-y-4">
              {currentLevels.map((protein) => (
                <div key={protein.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{protein.name}</span>
                    <span>{protein.value} units</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${protein.value}%`,
                        backgroundColor: lineColors[protein.name],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No expression data available yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="sequence">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Construct Sequence</h4>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export FASTA
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto whitespace-nowrap">
              {nodes.length > 0 ? (
                <>
                  <span className="text-emerald-600">{">"}</span>
                  <span className="text-emerald-600">Synthetic_Construct</span>
                  <br />
                  <span className="text-blue-600">
                    ATGCGTAAAGGAGAAGAACTTTTCACTGGAGTTGTCCCAATTCTTGTTGAATTAGATGGTGATGTTAATGGGCAC
                  </span>
                  <br />
                  <span className="text-blue-600">
                    AAATTTTCTGTCAGTGGAGAGGGTGAAGGTGATGCAACATACGGAAAACTTACCCTTAAATTTATTTGCACTACT
                  </span>
                  <br />
                  <span className="text-blue-600">
                    GGAAAACTACCTGTTCCATGGCCAACACTTGTCACTACTTTCGGTTATGGTGTTCAATGCTTTGCGAGATACCC
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">No sequence data available.</span>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button variant="outline" size="sm">
          <Camera className="mr-2 h-4 w-4" />
          Capture Results
        </Button>
      </div>
    </div>
  )
}
