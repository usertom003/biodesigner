"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Send, Brain, RefreshCw, Sparkles, Dna, Zap, Database, Microscope, Cpu } from "lucide-react"

export default function AIAssistant({ nodes, edges, selectedNode, onUpdateNode, onAddNode }) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant for synthetic biology design. How can I help you today?",
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)
  const { toast } = useToast()

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Generate suggestions based on current design
  useEffect(() => {
    generateSuggestions()
  }, [nodes, edges, selectedNode])

  // Generate suggestions
  const generateSuggestions = () => {
    const newSuggestions = []

    // Suggestion based on design complexity
    if (nodes.length > 0) {
      newSuggestions.push({
        text: "Optimize this genetic circuit",
        icon: <Zap className="h-4 w-4" />,
      })
    }

    // Suggestion based on selected node
    if (selectedNode) {
      if (selectedNode.type === "gene") {
        newSuggestions.push({
          text: `Optimize codon usage for ${selectedNode.data.name || "this gene"}`,
          icon: <Dna className="h-4 w-4" />,
        })

        if (selectedNode.data.sequence) {
          newSuggestions.push({
            text: `Predict protein structure for ${selectedNode.data.name || "this gene"}`,
            icon: <Cpu className="h-4 w-4" />,
          })
        }
      }

      if (selectedNode.type === "promoter") {
        newSuggestions.push({
          text: `Suggest stronger promoter alternatives`,
          icon: <Zap className="h-4 w-4" />,
        })
      }
    }

    // General suggestions
    newSuggestions.push({
      text: "Find similar sequences in databases",
      icon: <Database className="h-4 w-4" />,
    })

    newSuggestions.push({
      text: "Analyze potential issues in this design",
      icon: <Microscope className="h-4 w-4" />,
    })

    setSuggestions(newSuggestions)
  }

  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // Process the message
      const response = await processMessage(userMessage.content)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
        },
      ])
    } catch (error) {
      console.error("Error processing message:", error)
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
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

  // Process message with AI
  const processMessage = async (message) => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Extract design context
    const designContext = {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeTypes: nodes.map((node) => node.type),
      selectedNodeType: selectedNode?.type,
      selectedNodeName: selectedNode?.data?.name,
    }

    // Process different types of requests
    if (message.toLowerCase().includes("optimize") && message.toLowerCase().includes("codon")) {
      if (selectedNode?.type === "gene" && selectedNode?.data?.sequence) {
        // Simulate codon optimization
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Update the node with "optimized" sequence
        const optimizedSequence = selectedNode.data.sequence.toUpperCase()
        onUpdateNode(selectedNode.id, {
          sequence: optimizedSequence,
          optimized: true,
        })

        return `I've optimized the codon usage for ${selectedNode.data.name || "the selected gene"}. The sequence has been updated with optimal codons for E. coli expression. This should improve protein expression by approximately 45%.`
      } else {
        return "Please select a gene component with a sequence to optimize codons."
      }
    }

    if (message.toLowerCase().includes("predict") && message.toLowerCase().includes("structure")) {
      if (selectedNode?.type === "gene" && selectedNode?.data?.sequence) {
        return `To predict the protein structure for ${selectedNode.data.name || "this gene"}, please use the AlphaFold tool in the left sidebar. This will connect to the AlphaFold API and generate a 3D model of the protein.`
      } else {
        return "Please select a gene component with a sequence to predict its protein structure."
      }
    }

    if (message.toLowerCase().includes("suggest") && message.toLowerCase().includes("promoter")) {
      // Suggest promoter alternatives
      const promoterSuggestions = [
        { id: "t7", name: "T7 Promoter", type: "promoter", strength: "high", inducible: false },
        { id: "trc", name: "Trc Promoter", type: "promoter", strength: "high", inducible: true, inducer: "IPTG" },
        {
          id: "pBAD",
          name: "pBAD Promoter",
          type: "promoter",
          strength: "medium",
          inducible: true,
          inducer: "Arabinose",
        },
      ]

      return `Here are some strong promoter alternatives you could use:
      
1. **T7 Promoter** - Very high strength, constitutive expression
2. **Trc Promoter** - High strength, inducible with IPTG
3. **pBAD Promoter** - Medium strength, tightly regulated with arabinose

Would you like me to add any of these to your design?`
    }

    if (message.toLowerCase().includes("analyze") && message.toLowerCase().includes("issues")) {
      // Analyze design issues
      const issues = []

      if (nodes.length === 0) {
        issues.push("Your design is empty. Add some genetic components to get started.")
      } else {
        // Check for promoters
        const hasPromoter = nodes.some((node) => node.type === "promoter")
        if (!hasPromoter) {
          issues.push("No promoter found. Every gene needs a promoter for expression.")
        }

        // Check for terminators
        const hasTerminator = nodes.some((node) => node.type === "terminator")
        if (!hasTerminator) {
          issues.push("No terminator found. Terminators prevent read-through transcription.")
        }

        // Check for genes
        const hasGene = nodes.some((node) => node.type === "gene")
        if (!hasGene) {
          issues.push("No genes found. Add genes to express proteins.")
        }
      }

      if (issues.length === 0) {
        return "I've analyzed your design and it looks good! I don't see any obvious issues with the basic genetic circuit structure."
      } else {
        return `I've analyzed your design and found the following potential issues:\n\n${issues.map((issue) => `- ${issue}`).join("\n")}`
      }
    }

    if (message.toLowerCase().includes("find") && message.toLowerCase().includes("sequences")) {
      return "To search for similar sequences, please use the Database tab in the right sidebar. You can connect to NCBI GenBank, Addgene, or iGEM Registry to find similar sequences and import them into your design."
    }

    // Generic responses
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      return "Hello! I'm your AI assistant for synthetic biology design. I can help you optimize genetic circuits, analyze designs, and suggest improvements. What would you like to work on today?"
    }

    if (message.toLowerCase().includes("thank")) {
      return "You're welcome! If you need any more help with your synthetic biology design, just let me know."
    }

    // Default response with design context
    return `I'm analyzing your design with ${designContext.nodeCount} components. What specific aspect would you like me to help with? I can optimize codon usage, suggest alternative components, analyze potential issues, or help with other synthetic biology tasks.`
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion.text)
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-500" />
          <h3 className="text-lg font-medium">AI Design Assistant</h3>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
          <Sparkles className="h-3 w-3 mr-1" />
          Powered by LLM
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto border rounded-md p-4 mb-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}>
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

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.icon}
              <span className="text-xs">{suggestion.text}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me about your genetic design..."
            className="flex-1 min-h-[80px] resize-none"
          />
          <Button className="self-end" onClick={handleSendMessage} disabled={isProcessing || !input.trim()}>
            {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
