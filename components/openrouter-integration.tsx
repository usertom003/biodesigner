"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Brain,
  Send,
  RefreshCw,
  Sparkles,
  Settings,
  Key,
  Save,
  Dna,
  Microscope,
  Beaker,
  FlaskConical,
  Code,
  MessageSquare,
  Workflow,
  Zap,
} from "lucide-react"

// Sample models
const availableModels = [
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    capabilities: ["text", "vision", "reasoning"],
    description: "Most powerful Claude model for complex tasks",
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    capabilities: ["text", "vision", "reasoning"],
    description: "Balanced Claude model for most tasks",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    capabilities: ["text", "vision", "reasoning"],
    description: "Fast and efficient Claude model",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    capabilities: ["text", "vision", "reasoning", "code"],
    description: "Latest multimodal GPT model",
  },
  {
    id: "google/gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    capabilities: ["text", "vision", "reasoning", "code"],
    description: "Google's advanced multimodal model",
  },
  {
    id: "meta-llama/llama-3-70b-instruct",
    name: "Llama 3 70B",
    provider: "Meta",
    capabilities: ["text", "reasoning", "code"],
    description: "Meta's largest open model",
  },
]

// Sample tools
const availableTools = [
  {
    id: "dna-analysis",
    name: "DNA Analysis",
    description: "Analyze DNA sequences for patterns and features",
    category: "bio",
    icon: <Dna className="h-4 w-4" />,
  },
  {
    id: "protein-structure",
    name: "Protein Structure",
    description: "Predict protein structure from amino acid sequence",
    category: "bio",
    icon: <Microscope className="h-4 w-4" />,
  },
  {
    id: "lab-automation",
    name: "Lab Automation",
    description: "Generate protocols for lab automation systems",
    category: "lab",
    icon: <FlaskConical className="h-4 w-4" />,
  },
  {
    id: "experiment-design",
    name: "Experiment Design",
    description: "Design scientific experiments with proper controls",
    category: "lab",
    icon: <Beaker className="h-4 w-4" />,
  },
  {
    id: "code-generation",
    name: "Code Generation",
    description: "Generate Python code for data analysis",
    category: "code",
    icon: <Code className="h-4 w-4" />,
  },
  {
    id: "ml-pipeline",
    name: "ML Pipeline",
    description: "Create machine learning pipelines for biological data",
    category: "ml",
    icon: <Workflow className="h-4 w-4" />,
  },
]

export default function OpenRouterIntegration() {
  const [apiKey, setApiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-3-sonnet")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant for synthetic biology. How can I help you today?",
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedTools, setSelectedTools] = useState([])
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [systemPrompt, setSystemPrompt] = useState(
    "You are an AI assistant specialized in synthetic biology, genetic engineering, and laboratory automation. Help the user design experiments, analyze biological data, and solve scientific problems.",
  )
  const messagesEndRef = useRef(null)
  const { toast } = useToast()

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Save API key
  const saveApiKey = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would be stored securely
    localStorage.setItem("openRouterApiKey", apiKey)

    toast({
      title: "API Key Saved",
      description: "Your OpenRouter API key has been saved",
    })
  }

  // Toggle tool selection
  const toggleTool = (toolId) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter((id) => id !== toolId))
    } else {
      setSelectedTools([...selectedTools, toolId])
    }
  }

  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim()) return
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key in the Settings tab",
        variant: "destructive",
      })
      return
    }

    const userMessage = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // In a real implementation, this would call the OpenRouter API
      // For this demo, we'll simulate a response
      await simulateApiCall(userMessage.content)
    } catch (error) {
      console.error("Error processing message:", error)
      toast({
        title: "Error",
        description: "Failed to process your message. Please check your API key and try again.",
        variant: "destructive",
      })

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulate API call
  const simulateApiCall = async (userMessage) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a response based on the user message and selected tools
    let response = ""

    if (userMessage.toLowerCase().includes("dna") || userMessage.toLowerCase().includes("sequence")) {
      response = `I can help you with DNA sequence analysis. 

Based on your query, I'd recommend analyzing the sequence for:
1. Open reading frames (ORFs)
2. Restriction enzyme cut sites
3. GC content and codon optimization

Would you like me to perform any of these analyses on your sequence? If so, please provide the DNA sequence you'd like to analyze.`
    } else if (
      userMessage.toLowerCase().includes("protein") ||
      userMessage.toLowerCase().includes("structure") ||
      userMessage.toLowerCase().includes("fold")
    ) {
      response = `For protein structure prediction, I can help you connect to AlphaFold or other structure prediction tools.

To get the best results, I'll need:
1. The amino acid sequence of your protein
2. Any known structural homologs
3. Information about the protein's function

Would you like me to proceed with a structure prediction workflow?`
    } else if (
      userMessage.toLowerCase().includes("experiment") ||
      userMessage.toLowerCase().includes("design") ||
      userMessage.toLowerCase().includes("protocol")
    ) {
      response = `I can help design an experiment for your research question. Let's break this down:

1. Research question: What specific hypothesis are you testing?
2. Variables: What are your independent and dependent variables?
3. Controls: What positive and negative controls will you include?
4. Methods: What techniques will you use for measurement?

Once we have these details, I can help you design a rigorous experimental protocol with proper statistical power.`
    } else if (
      userMessage.toLowerCase().includes("code") ||
      userMessage.toLowerCase().includes("python") ||
      userMessage.toLowerCase().includes("script")
    ) {
      response = `Here's a Python code snippet for basic DNA sequence analysis:

\`\`\`python
from Bio import SeqIO
from Bio.Seq import Seq

# Load DNA sequence
sequence = Seq("ATGCGTAAAGGAGAAGAACTTTTCACTGGAGTTGTCCCAATTCTTGTTGAATTAGATGGTGATGTTAATGGGCAC")

# Basic analysis
print(f"Sequence length: {len(sequence)} bp")
print(f"GC content: {(sequence.count('G') + sequence.count('C')) / len(sequence) * 100:.2f}%")

# Translate to protein
protein = sequence.translate()
print(f"Protein sequence: {protein}")

# Find open reading frames
for i in range(3):
    orf = sequence[i:].translate(to_stop=True)
    print(f"ORF {i+1}: {orf}")
\`\`\`

Would you like me to explain any part of this code or modify it for your specific needs?`
    } else if (
      userMessage.toLowerCase().includes("machine learning") ||
      userMessage.toLowerCase().includes("ml") ||
      userMessage.toLowerCase().includes("model")
    ) {
      response = `For machine learning in synthetic biology, I recommend a pipeline with these components:

1. Data preprocessing: Clean and normalize your biological data
2. Feature extraction: Extract relevant features from sequences or structures
3. Model selection: Random forests work well for many bio problems, or deep learning for sequence data
4. Validation: Use cross-validation with appropriate metrics

Would you like me to help you build a specific ML pipeline for your data? I can generate code for data preprocessing, feature extraction, and model training.`
    } else if (userMessage.toLowerCase().includes("lab") || userMessage.toLowerCase().includes("automation")) {
      response = `For lab automation, I can help you:

1. Design protocols for liquid handling robots (Opentrons, Hamilton, etc.)
2. Optimize workflows for high-throughput experiments
3. Generate code for controlling lab equipment
4. Design plate layouts for efficient experimentation

What specific lab automation task are you working on? I can provide more targeted assistance once I know your setup and goals.`
    } else {
      response = `I'm here to help with your synthetic biology questions. I can assist with:

- DNA and protein sequence analysis
- Experimental design and protocol development
- Machine learning for biological data
- Lab automation and high-throughput methods
- Code generation for data analysis

Please let me know what specific aspect of your research I can help with!`
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: response,
      },
    ])
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-500" />
            OpenRouter AI Integration
          </h2>
          <p className="text-sm text-muted-foreground">
            Connect to powerful AI models for synthetic biology assistance
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
          <Sparkles className="h-3 w-3 mr-1" />
          {availableModels.find((model) => model.id === selectedModel)?.name || "Select Model"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="chat" className="flex-1">
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex-1">
            <Zap className="mr-2 h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto border rounded-md p-4 mb-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-white border text-gray-800"
                  }`}
                >
                  {message.content.split("\n").map((line, i) => (
                    <div key={i}>{line || <br />}</div>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about synthetic biology, genetic engineering, or lab automation..."
              className="flex-1 min-h-[80px] resize-none"
            />
            <Button className="self-end" onClick={handleSendMessage} disabled={isProcessing || !input.trim()}>
              {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="flex-1">
          <div className="grid grid-cols-3 gap-4">
            {availableTools.map((tool) => (
              <Card
                key={tool.id}
                className={`cursor-pointer hover:border-blue-200 ${
                  selectedTools.includes(tool.id) ? "border-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => toggleTool(tool.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium flex items-center">
                      {tool.icon}
                      <span className="ml-2">{tool.name}</span>
                    </CardTitle>
                    <Switch checked={selectedTools.includes(tool.id)} />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Selected Tools</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTools.length > 0 ? (
                selectedTools.map((toolId) => {
                  const tool = availableTools.find((t) => t.id === toolId)
                  return (
                    <Badge key={toolId} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {tool?.icon}
                      <span className="ml-1">{tool?.name}</span>
                    </Badge>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tools selected. Select tools to enhance AI capabilities.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Configuration</CardTitle>
                <CardDescription>Configure your OpenRouter API access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    OpenRouter API Key
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      type="password"
                      placeholder="sk-or-..."
                      className="flex-1"
                    />
                    <Button onClick={saveApiKey}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Key
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Model Selection</CardTitle>
                <CardDescription>Choose which AI model to use</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedModel && (
                  <div className="border rounded-md p-3 bg-gray-50">
                    <h4 className="text-sm font-medium mb-1">
                      {availableModels.find((model) => model.id === selectedModel)?.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {availableModels.find((model) => model.id === selectedModel)?.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {availableModels
                        .find((model) => model.id === selectedModel)
                        ?.capabilities.map((capability) => (
                          <Badge key={capability} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Settings</CardTitle>
                <CardDescription>Configure model parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="temperature">Temperature: {temperature}</Label>
                    <span className="text-xs text-muted-foreground">
                      {temperature < 0.3 ? "More deterministic" : temperature > 0.7 ? "More creative" : "Balanced"}
                    </span>
                  </div>
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens: {maxTokens}</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    This prompt guides the AI's behavior and expertise focus.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
