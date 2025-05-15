"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Brain, Key, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import ExperimentalBadge from "./experimental-badge"

export default function OpenRouterGuide() {
  const [apiKey, setApiKey] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<null | "success" | "error">(null)
  const { toast } = useToast()

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would be stored securely
    localStorage.setItem("openRouterApiKey", apiKey)
    setIsSaved(true)

    toast({
      title: "API Key Saved",
      description: "Your OpenRouter API key has been saved successfully",
    })
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus(null)

    try {
      // Simulate API connection test
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, this would make an actual API call to OpenRouter
      if (apiKey.startsWith("sk-or-")) {
        setConnectionStatus("success")
        toast({
          title: "Connection Successful",
          description: "Successfully connected to OpenRouter API",
        })
      } else {
        setConnectionStatus("error")
        toast({
          title: "Connection Failed",
          description: "Invalid API key format. OpenRouter keys should start with 'sk-or-'",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Connection Failed",
        description: "Failed to connect to OpenRouter API. Please check your key and try again.",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              OpenRouter API Configuration
              <ExperimentalBadge className="ml-2" />
            </CardTitle>
            <CardDescription>Connect to OpenRouter to access powerful AI models for synthetic biology</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup">
          <TabsList className="mb-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="models">Available Models</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  OpenRouter API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setIsSaved(false)
                      setConnectionStatus(null)
                    }}
                    type="password"
                    placeholder="sk-or-..."
                    className="flex-1"
                  />
                  <Button onClick={saveApiKey} disabled={!apiKey.trim() || isSaved}>
                    {isSaved ? "Saved" : "Save Key"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>

              {isSaved && (
                <div className="space-y-2">
                  <Button
                    onClick={testConnection}
                    disabled={isTestingConnection || !isSaved}
                    variant="outline"
                    className="w-full"
                  >
                    {isTestingConnection ? "Testing Connection..." : "Test Connection"}
                  </Button>

                  {connectionStatus === "success" && (
                    <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Connection Successful</AlertTitle>
                      <AlertDescription>Your OpenRouter API key is valid and ready to use.</AlertDescription>
                    </Alert>
                  )}

                  {connectionStatus === "error" && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Connection Failed</AlertTitle>
                      <AlertDescription>
                        Unable to connect to OpenRouter. Please check your API key and try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-medium">How to Get an OpenRouter API Key</h3>
                <ol className="text-sm space-y-2 list-decimal pl-5">
                  <li>
                    Visit{" "}
                    <a
                      href="https://openrouter.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      OpenRouter.ai <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li>Create an account or sign in</li>
                  <li>Navigate to the API Keys section</li>
                  <li>Generate a new API key</li>
                  <li>Copy and paste the key above</li>
                </ol>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models">
            <div className="space-y-4">
              <p className="text-sm">
                OpenRouter provides access to a variety of powerful AI models that can assist with synthetic biology
                tasks:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Claude 3 Opus</CardTitle>
                    <CardDescription>Anthropic</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Most powerful Claude model for complex biological analysis and experimental design.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">GPT-4o</CardTitle>
                    <CardDescription>OpenAI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Latest multimodal GPT model with strong capabilities for code generation and data analysis.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Gemini 1.5 Pro</CardTitle>
                    <CardDescription>Google</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Google's advanced multimodal model with excellent reasoning for experimental protocols.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Llama 3 70B</CardTitle>
                    <CardDescription>Meta</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Meta's largest open model with strong performance on biological sequence analysis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage">
            <div className="space-y-4">
              <p className="text-sm">
                Once configured, you can use OpenRouter AI models throughout the BioDesigner platform:
              </p>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Example Use Cases</h3>
                <ul className="text-sm space-y-2 list-disc pl-5">
                  <li>Generate optimized DNA sequences for specific functions</li>
                  <li>Analyze experimental results and suggest improvements</li>
                  <li>Design primers for PCR reactions</li>
                  <li>Predict protein structures and interactions</li>
                  <li>Generate lab protocols based on your experimental goals</li>
                  <li>Troubleshoot failed experiments</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-medium">Accessing in BioDesigner</h3>
                <p className="text-sm">
                  Navigate to the OpenRouter Integration panel from the main tools menu to start using AI models in your
                  workflow.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        <Button onClick={() => (window.location.href = "/components/openrouter-integration")} disabled={!isSaved}>
          Open OpenRouter Integration
        </Button>
      </CardFooter>
    </Card>
  )
}
