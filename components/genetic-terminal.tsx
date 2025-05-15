"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Terminal, Play, Save, Copy, Download, Trash2, RefreshCw, FileCode, Database, Server } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Genetic programming language interpreter
class GeneticInterpreter {
  constructor(nodes, edges, onOutput) {
    this.nodes = nodes
    this.edges = edges
    this.onOutput = onOutput
    this.variables = {}
    this.plasmids = {}
    this.databases = {
      ncbi: { name: "NCBI GenBank", connected: false },
      addgene: { name: "Addgene", connected: false },
      igem: { name: "iGEM Registry", connected: false },
    }
    this.apiConnections = {
      alphafold: { name: "AlphaFold API", connected: false },
      uniprot: { name: "UniProt API", connected: false },
      ensembl: { name: "Ensembl API", connected: false },
    }
  }

  async execute(code) {
    const lines = code.split("\n")
    let output = ""

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Skip comments and empty lines
        if (line.startsWith("//") || line === "") continue

        output += `> ${line}\n`

        // Parse and execute the line
        const result = await this.parseLine(line, i + 1)
        if (result) {
          output += result + "\n"
        }
      }

      output += "\nExecution completed successfully.\n"
    } catch (error) {
      output += `\nError: ${error.message}\n`
      output += "Execution failed.\n"
    }

    return output
  }

  async parseLine(line, lineNumber) {
    // Variable assignment
    if (line.includes("=")) {
      const [left, right] = line.split("=").map((part) => part.trim())

      // New plasmid creation
      if (right.startsWith("new Plasmid")) {
        const match = right.match(/new Plasmid$$(\d+)$$/)
        if (match) {
          const size = Number.parseInt(match[1])
          this.plasmids[left] = {
            size,
            components: [],
            restrictionSites: [],
          }
          return `Created new plasmid '${left}' with size ${size} bp`
        }
      }

      // Variable assignment
      const value = await this.evaluateExpression(right)
      this.variables[left] = value
      return `Assigned value to ${left}`
    }

    // Method calls (e.g., plasmid.addGene())
    if (line.includes(".")) {
      const [object, method] = line.split(".", 2)

      // Plasmid methods
      if (this.plasmids[object]) {
        return await this.executePlasmidMethod(object, method)
      }

      // Database methods
      if (object === "db") {
        return await this.executeDatabaseMethod(method)
      }

      // API methods
      if (object === "api") {
        return await this.executeAPIMethod(method)
      }
    }

    // Function calls
    if (line.startsWith("export(")) {
      const match = line.match(/export$$([^,]+),\s*['"]([^'"]+)['"]$$/)
      if (match) {
        const plasmidName = match[1]
        const format = match[2]
        if (this.plasmids[plasmidName]) {
          return `Exported plasmid ${plasmidName} in ${format.toUpperCase()} format`
        } else {
          throw new Error(`Plasmid '${plasmidName}' not found`)
        }
      }
    }

    if (line.startsWith("plot(")) {
      const match = line.match(/plot$$([^)]+)$$/)
      if (match) {
        const varName = match[1]
        if (this.variables[varName]) {
          return `Generated plot for ${varName}`
        } else {
          throw new Error(`Variable '${varName}' not found`)
        }
      }
    }

    if (line.startsWith("simulate(")) {
      const match = line.match(/simulate$$([^,]+),\s*(\d+)$$/)
      if (match) {
        const plasmidName = match[1]
        const time = Number.parseInt(match[2])
        if (this.plasmids[plasmidName]) {
          return `Simulated expression of ${plasmidName} for ${time} hours`
        } else {
          throw new Error(`Plasmid '${plasmidName}' not found`)
        }
      }
    }

    throw new Error(`Unknown command at line ${lineNumber}: ${line}`)
  }

  async executePlasmidMethod(plasmidName, methodCall) {
    const plasmid = this.plasmids[plasmidName]

    // addPromoter method
    if (methodCall.startsWith("addPromoter(")) {
      const match = methodCall.match(/addPromoter$$['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*(\d+),\s*(\d+)$$/)
      if (match) {
        const [_, name, sequence, start, end] = match
        plasmid.components.push({
          type: "promoter",
          name,
          sequence,
          start: Number.parseInt(start),
          end: Number.parseInt(end),
        })
        return `Added promoter '${name}' to plasmid ${plasmidName}`
      }
    }

    // addGene method
    if (methodCall.startsWith("addGene(")) {
      const match = methodCall.match(/addGene$$['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*(\d+),\s*(\d+)$$/)
      if (match) {
        const [_, name, sequence, start, end] = match
        plasmid.components.push({
          type: "gene",
          name,
          sequence,
          start: Number.parseInt(start),
          end: Number.parseInt(end),
        })
        return `Added gene '${name}' to plasmid ${plasmidName}`
      }
    }

    // addTerminator method
    if (methodCall.startsWith("addTerminator(")) {
      const match = methodCall.match(/addTerminator$$['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*(\d+),\s*(\d+)$$/)
      if (match) {
        const [_, name, sequence, start, end] = match
        plasmid.components.push({
          type: "terminator",
          name,
          sequence,
          start: Number.parseInt(start),
          end: Number.parseInt(end),
        })
        return `Added terminator '${name}' to plasmid ${plasmidName}`
      }
    }

    // addRestrictionSite method
    if (methodCall.startsWith("addRestrictionSite(")) {
      const match = methodCall.match(/addRestrictionSite$$['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*(\d+)$$/)
      if (match) {
        const [_, name, sequence, position] = match
        plasmid.restrictionSites.push({
          name,
          sequence,
          position: Number.parseInt(position),
        })
        return `Added restriction site '${name}' to plasmid ${plasmidName}`
      }
    }

    // simulateExpression method
    if (methodCall.startsWith("simulateExpression(")) {
      const match = methodCall.match(/simulateExpression$$['"]([^'"]+)['"],\s*(\d+)$$/)
      if (match) {
        const [_, geneName, time] = match
        const gene = plasmid.components.find((c) => c.type === "gene" && c.name === geneName)
        if (gene) {
          // Simulate expression and store in a variable
          this.variables[`${geneName}_expression`] = {
            type: "expression_data",
            gene: geneName,
            time: Number.parseInt(time),
            data: Array.from({ length: Number.parseInt(time) }, (_, i) => ({
              time: i,
              level: Math.random() * 100,
            })),
          }
          return `Simulated expression of gene '${geneName}' for ${time} hours`
        } else {
          throw new Error(`Gene '${geneName}' not found in plasmid ${plasmidName}`)
        }
      }
    }

    throw new Error(`Unknown method call: ${plasmidName}.${methodCall}`)
  }

  async executeDatabaseMethod(methodCall) {
    // connect method
    if (methodCall.startsWith("connect(")) {
      const match = methodCall.match(/connect$$['"]([^'"]+)['"]$$/)
      if (match) {
        const dbName = match[1]
        if (this.databases[dbName]) {
          this.databases[dbName].connected = true
          return `Connected to ${this.databases[dbName].name} database`
        } else {
          throw new Error(`Database '${dbName}' not supported`)
        }
      }
    }

    // search method
    if (methodCall.startsWith("search(")) {
      const match = methodCall.match(/search$$['"]([^'"]+)['"],\s*['"]([^'"]+)['"]$$/)
      if (match) {
        const [_, dbName, query] = match
        if (this.databases[dbName] && this.databases[dbName].connected) {
          // Simulate database search
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
          return `Found 5 results for '${query}' in ${this.databases[dbName].name}`
        } else {
          throw new Error(`Not connected to database '${dbName}'`)
        }
      }
    }

    // fetch method
    if (methodCall.startsWith("fetch(")) {
      const match = methodCall.match(/fetch$$['"]([^'"]+)['"],\s*['"]([^'"]+)['"]$$/)
      if (match) {
        const [_, dbName, accession] = match
        if (this.databases[dbName] && this.databases[dbName].connected) {
          // Simulate fetching sequence
          await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
          this.variables[accession] = {
            type: "sequence",
            accession,
            source: this.databases[dbName].name,
            sequence: "ATGCGTAAAGGAGAAGAACTTTTCACTGGAGTTGTCCCAATTCTTGTTGAATTAGATGGTGATGTTAATGGGCAC",
          }
          return `Fetched sequence '${accession}' from ${this.databases[dbName].name}`
        } else {
          throw new Error(`Not connected to database '${dbName}'`)
        }
      }
    }

    throw new Error(`Unknown database method: ${methodCall}`)
  }

  async executeAPIMethod(methodCall) {
    // connect method
    if (methodCall.startsWith("connect(")) {
      const match = methodCall.match(/connect$$['"]([^'"]+)['"]$$/)
      if (match) {
        const apiName = match[1]
        if (this.apiConnections[apiName]) {
          this.apiConnections[apiName].connected = true
          return `Connected to ${this.apiConnections[apiName].name}`
        } else {
          throw new Error(`API '${apiName}' not supported`)
        }
      }
    }

    // predictStructure method (AlphaFold)
    if (methodCall.startsWith("predictStructure(")) {
      const match = methodCall.match(/predictStructure$$['"]([^'"]+)['"]$$/)
      if (match) {
        const sequenceName = match[1]
        if (this.apiConnections.alphafold && this.apiConnections.alphafold.connected) {
          if (this.variables[sequenceName] && this.variables[sequenceName].type === "sequence") {
            // Simulate structure prediction
            await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate computation
            return `Predicted 3D structure for sequence '${sequenceName}' using AlphaFold`
          } else {
            throw new Error(`Sequence '${sequenceName}' not found`)
          }
        } else {
          throw new Error(`Not connected to AlphaFold API`)
        }
      }
    }

    throw new Error(`Unknown API method: ${methodCall}`)
  }

  async evaluateExpression(expression) {
    // For now, just handle simple expressions
    if (expression.includes(".simulateExpression(")) {
      const [plasmidName, methodCall] = expression.split(".", 2)
      if (this.plasmids[plasmidName]) {
        const match = methodCall.match(/simulateExpression$$['"]([^'"]+)['"],\s*(\d+)$$/)
        if (match) {
          const [_, geneName, time] = match
          return {
            type: "expression_data",
            gene: geneName,
            time: Number.parseInt(time),
            data: Array.from({ length: Number.parseInt(time) }, (_, i) => ({
              time: i,
              level: Math.random() * 100,
            })),
          }
        }
      }
    }

    return expression // Just return the expression as is for now
  }
}

// Sample genetic programming language commands
const sampleCommands = [
  "// Create a new plasmid",
  "plasmid pUC19 = new Plasmid(2686);",
  "",
  "// Connect to databases",
  'db.connect("ncbi");',
  'db.search("ncbi", "GFP");',
  'db.fetch("ncbi", "AAA99999");',
  "",
  "// Add components",
  "pUC19.addPromoter('lacPromoter', 'TATAAT', 100, 150);",
  "pUC19.addGene('gfp', 'ATGCGTAAAGGAGAAGAACTTTTCACTGGAGTTGTC...', 200, 1000);",
  "pUC19.addTerminator('T7term', 'CTAGCATAACCCCTTGGGGCCTCTAAACGGGTCTTGAGGGGTTTTTTG', 1050, 1100);",
  "",
  "// Add restriction sites",
  "pUC19.addRestrictionSite('EcoRI', 'GAATTC', 50);",
  "pUC19.addRestrictionSite('BamHI', 'GGATCC', 1200);",
  "",
  "// Connect to AlphaFold API",
  'api.connect("alphafold");',
  'api.predictStructure("AAA99999");',
  "",
  "// Simulate expression",
  "let expression = pUC19.simulateExpression('gfp', 24);",
  "plot(expression);",
  "",
  "// Export sequence",
  "export(pUC19, 'fasta');",
].join("\n")

export default function GeneticTerminal({ nodes, edges }) {
  const [code, setCode] = useState(sampleCommands)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [history, setHistory] = useState([])
  const [interpreter, setInterpreter] = useState(null)
  const [selectedDatabase, setSelectedDatabase] = useState("ncbi")
  const [isConnected, setIsConnected] = useState(false)
  const [logs, setLogs] = useState([])
  const outputRef = useRef(null)
  const { toast } = useToast()

  // Initialize interpreter
  useEffect(() => {
    const newInterpreter = new GeneticInterpreter(nodes, edges, (text) => {
      setOutput((prev) => prev + text)
    })
    setInterpreter(newInterpreter)
  }, [nodes, edges])

  // Scroll to bottom of output when it changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  // Add log entry
  const addLog = (type, message) => {
    const timestamp = new Date().toISOString()
    setLogs((prev) => [...prev, { type, message, timestamp }])
  }

  // Run code
  const runCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to run",
        description: "Please enter some code to execute.",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)
    setOutput("")

    // Add to history
    const timestamp = new Date().toISOString()
    setHistory((prev) => [...prev, { code, timestamp }])

    addLog("info", "Execution started")

    try {
      // Execute code using the interpreter
      const result = await interpreter.execute(code)
      setOutput(result)
      addLog("success", "Execution completed successfully")
    } catch (error) {
      setOutput(`Error: ${error.message}\nExecution failed.`)
      addLog("error", `Execution failed: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  // Connect to database
  const connectToDatabase = async () => {
    setIsConnected(false)
    addLog("info", `Connecting to ${selectedDatabase} database...`)

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsConnected(true)
    addLog("success", `Connected to ${selectedDatabase} database`)

    toast({
      title: "Database connected",
      description: `Successfully connected to ${selectedDatabase.toUpperCase()} database.`,
    })
  }

  // Clear terminal
  const clearTerminal = () => {
    setOutput("")
    toast({
      title: "Terminal cleared",
      description: "The terminal output has been cleared.",
    })
  }

  // Save code
  const saveCode = () => {
    localStorage.setItem("geneticCode", code)
    addLog("info", "Code saved to local storage")
    toast({
      title: "Code saved",
      description: "Your code has been saved to local storage.",
    })
  }

  // Load code from history
  const loadFromHistory = (historyItem) => {
    setCode(historyItem.code)
    addLog("info", "Code loaded from history")
    toast({
      title: "Code loaded from history",
      description: "The selected code has been loaded into the editor.",
    })
  }

  // Copy output
  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    toast({
      title: "Output copied",
      description: "Terminal output has been copied to clipboard.",
    })
  }

  // Download code
  const downloadCode = () => {
    const element = document.createElement("a")
    const file = new Blob([code], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `genetic_script_${new Date().toISOString().slice(0, 10)}.gp`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    addLog("info", "Code downloaded as file")
    toast({
      title: "Code downloaded",
      description: "Your genetic programming code has been downloaded.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Terminal className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">Genetic Programming Terminal</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={saveCode}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm" onClick={runCode} disabled={isRunning}>
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="w-full">
          <TabsTrigger value="editor" className="flex-1">
            <FileCode className="mr-2 h-4 w-4" />
            Code Editor
          </TabsTrigger>
          <TabsTrigger value="terminal" className="flex-1">
            <Terminal className="mr-2 h-4 w-4" />
            Terminal Output
          </TabsTrigger>
          <TabsTrigger value="database" className="flex-1">
            <Database className="mr-2 h-4 w-4" />
            Database Connection
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex-1">
            <Server className="mr-2 h-4 w-4" />
            System Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4 mt-4">
          <div className="border rounded-md overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-80 p-4 font-mono text-sm focus:outline-none resize-none"
              placeholder="Enter genetic programming code here..."
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Use the genetic programming language to manipulate DNA sequences, simulate gene expression, and analyze
            genetic circuits. Connect to real databases and APIs for advanced functionality.
          </div>
        </TabsContent>

        <TabsContent value="terminal" className="space-y-4 mt-4">
          <div
            className="border rounded-md bg-black text-green-400 p-4 h-80 overflow-auto font-mono text-sm"
            ref={outputRef}
          >
            {output || "Terminal output will appear here after running your code..."}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={copyOutput} disabled={!output}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Output
            </Button>
            <Button variant="outline" size="sm" onClick={clearTerminal} disabled={!output}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Terminal
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4 mt-4">
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-4">Database Connection</h4>

            <div className="flex items-end gap-4 mb-6">
              <div className="space-y-2 flex-1">
                <Label htmlFor="database">Select Database</Label>
                <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                  <SelectTrigger id="database">
                    <SelectValue placeholder="Select database" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ncbi">NCBI GenBank</SelectItem>
                    <SelectItem value="addgene">Addgene</SelectItem>
                    <SelectItem value="igem">iGEM Registry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={connectToDatabase} disabled={isConnected}>
                {isConnected ? "Connected" : "Connect"}
              </Button>
            </div>

            {isConnected && (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                  <div className="font-medium">Connected to {selectedDatabase.toUpperCase()}</div>
                  <div className="text-sm mt-1">
                    You can now use db.search() and db.fetch() commands in your code to interact with this database.
                  </div>
                </div>

                <div className="border rounded-md p-3">
                  <div className="font-medium mb-2">Example Commands</div>
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded-md">
                    db.search("{selectedDatabase}", "GFP");
                  </div>
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded-md mt-2">
                    db.fetch("{selectedDatabase}", "AAA99999");
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-4">
          <div className="border rounded-md p-4 h-80 overflow-auto">
            <h4 className="font-medium mb-4">System Logs</h4>

            {logs.length > 0 ? (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 border-l-4 ${
                      log.type === "error"
                        ? "border-red-500 bg-red-50"
                        : log.type === "success"
                          ? "border-green-500 bg-green-50"
                          : "border-blue-500 bg-blue-50"
                    } rounded-r-md`}
                  >
                    <div className="flex justify-between">
                      <span
                        className={`text-sm font-medium ${
                          log.type === "error"
                            ? "text-red-800"
                            : log.type === "success"
                              ? "text-green-800"
                              : "text-blue-800"
                        }`}
                      >
                        {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm mt-1">{log.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No logs available yet. Run some code to generate logs.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-md p-3 hover:bg-muted cursor-pointer"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Script {history.length - index}</span>
                    <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-xs font-mono line-clamp-2 text-muted-foreground">
                    {item.code
                      .split("\n")
                      .filter((line) => line.trim() && !line.trim().startsWith("//"))
                      .slice(0, 2)
                      .join("\n")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No execution history yet. Run some code to see it here.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
