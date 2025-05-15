"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, FlaskConical, BrainCircuit, Workflow, Microscope, Dna, ArrowRight, Settings } from "lucide-react"
import Link from "next/link"
import ExperimentalBadge from "./experimental-badge"

export default function BioToolsDashboard() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Dna className="h-8 w-8 mr-2 text-emerald-500" />
            BioDesigner Tools
          </h1>
          <p className="text-muted-foreground">Advanced tools for synthetic biology design and automation</p>
        </div>
      </div>

      <Tabs defaultValue="ai">
        <TabsList className="mb-6">
          <TabsTrigger value="ai">AI Integration</TabsTrigger>
          <TabsTrigger value="ml">Machine Learning</TabsTrigger>
          <TabsTrigger value="lab">Lab Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  OpenRouter API Configuration
                  <ExperimentalBadge className="ml-2" />
                </CardTitle>
                <CardDescription>Connect to powerful AI models for synthetic biology assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure your OpenRouter API key to access models like Claude 3 Opus, GPT-4o, and Gemini 1.5 Pro for
                  advanced biological design assistance.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/components/openrouter-guide" passHref>
                  <Button>
                    Configure OpenRouter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  OpenRouter Integration
                </CardTitle>
                <CardDescription>Use AI models for synthetic biology tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access the OpenRouter integration to use powerful AI models for sequence analysis, experimental
                  design, and troubleshooting.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/components/openrouter-integration" passHref>
                  <Button>
                    Open Integration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ml">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="h-5 w-5 mr-2 text-blue-500" />
                  Easy ML Model Builder
                  <ExperimentalBadge className="ml-2" />
                </CardTitle>
                <CardDescription>Create custom ML models without coding</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build machine learning models for biological sequence analysis, gene expression prediction, and more
                  with an intuitive no-code interface.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/components/easy-ml-model-builder" passHref>
                  <Button>
                    Create ML Model
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Workflow className="h-5 w-5 mr-2 text-blue-500" />
                  ML Pipeline Builder
                </CardTitle>
                <CardDescription>Design and execute ML pipelines</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create complex machine learning pipelines for biological data analysis with a visual editor and code
                  generation.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/components/ml-pipeline-builder" passHref>
                  <Button>
                    Build ML Pipeline
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lab">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FlaskConical className="h-5 w-5 mr-2 text-green-500" />
                  Automated Experiment Designer
                  <ExperimentalBadge className="ml-2" />
                </CardTitle>
                <CardDescription>Design and automate laboratory protocols</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create detailed laboratory protocols for synthetic biology experiments and generate code for automated
                  lab equipment.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/components/automated-experiment-designer" passHref>
                  <Button>
                    Design Experiment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Microscope className="h-5 w-5 mr-2 text-green-500" />
                  Lab Automation Integration
                </CardTitle>
                <CardDescription>Connect to laboratory automation systems</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Integrate with Opentrons, Tecan, and other lab automation systems to execute your protocols
                  automatically.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/components/lab-automation" passHref>
                  <Button>
                    Open Lab Integration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Settings className="h-5 w-5 mr-2 text-gray-500" />
                Configure OpenRouter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start by configuring your OpenRouter API key to access powerful AI models for your synthetic biology
                work.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/components/openrouter-guide" passHref>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <BrainCircuit className="h-5 w-5 mr-2 text-gray-500" />
                Create a Custom ML Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Build a machine learning model to analyze your biological sequences or predict gene expression.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/components/easy-ml-model-builder" passHref>
                <Button variant="outline" size="sm">
                  Create Model
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <FlaskConical className="h-5 w-5 mr-2 text-gray-500" />
                Design an Automated Experiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Design a laboratory protocol and generate code for automated execution on lab equipment.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/components/automated-experiment-designer" passHref>
                <Button variant="outline" size="sm">
                  Design Experiment
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
