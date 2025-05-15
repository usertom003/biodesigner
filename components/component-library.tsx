"use client"

import { useState } from "react"
import { Dna, Microscope, Zap, X, ArrowRight, Sigma } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"

// Component categories and their items
const componentCategories = [
  {
    id: "promoters",
    name: "Promoters",
    icon: <Zap className="h-4 w-4 text-yellow-500" />,
    items: [
      { id: "constitutive", name: "Constitutive Promoter", type: "promoter", strength: "medium", inducible: false },
      { id: "t7", name: "T7 Promoter", type: "promoter", strength: "high", inducible: false },
      { id: "lac", name: "Lac Promoter", type: "promoter", strength: "medium", inducible: true, inducer: "IPTG" },
      { id: "tet", name: "Tet Promoter", type: "promoter", strength: "medium", inducible: true, inducer: "aTc" },
      {
        id: "ara",
        name: "Arabinose Promoter",
        type: "promoter",
        strength: "medium",
        inducible: true,
        inducer: "Arabinose",
      },
    ],
  },
  {
    id: "genes",
    name: "Genes & Reporters",
    icon: <Dna className="h-4 w-4 text-emerald-500" />,
    items: [
      { id: "gfp", name: "GFP", type: "gene", function: "reporter", color: "green" },
      { id: "rfp", name: "RFP", type: "gene", function: "reporter", color: "red" },
      { id: "yfp", name: "YFP", type: "gene", function: "reporter", color: "yellow" },
      { id: "laci", name: "LacI", type: "gene", function: "repressor", targets: ["lac"] },
      { id: "tetr", name: "TetR", type: "gene", function: "repressor", targets: ["tet"] },
      { id: "arac", name: "AraC", type: "gene", function: "activator", targets: ["ara"] },
    ],
  },
  {
    id: "terminators",
    name: "Terminators",
    icon: <X className="h-4 w-4 text-red-500" />,
    items: [
      { id: "t7term", name: "T7 Terminator", type: "terminator", efficiency: "high" },
      { id: "rrnb", name: "rrnB Terminator", type: "terminator", efficiency: "medium" },
      { id: "double", name: "Double Terminator", type: "terminator", efficiency: "very high" },
    ],
  },
  {
    id: "regulatory",
    name: "Regulatory Elements",
    icon: <Sigma className="h-4 w-4 text-purple-500" />,
    items: [
      { id: "rbs", name: "Ribosome Binding Site", type: "regulatory", function: "translation", strength: "medium" },
      { id: "operator", name: "Operator Site", type: "regulatory", function: "binding", targets: ["repressors"] },
      { id: "enhancer", name: "Enhancer", type: "regulatory", function: "activation", strength: "medium" },
    ],
  },
]

export default function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState("")

  const onDragStart = (event, componentType, componentData) => {
    event.dataTransfer.setData("application/reactflow", componentType)
    event.dataTransfer.setData("application/bioComponent", JSON.stringify(componentData))
    event.dataTransfer.effectAllowed = "move"
  }

  const filteredCategories = componentCategories
    .map((category) => {
      const filteredItems = category.items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      return {
        ...category,
        items: filteredItems,
        hasMatches: filteredItems.length > 0,
      }
    })
    .filter((category) => category.hasMatches || searchTerm === "")

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search components..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />

      <Accordion type="multiple" defaultValue={["promoters", "genes"]}>
        {filteredCategories.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border p-2 cursor-grab hover:bg-muted transition-colors"
                    draggable
                    onDragStart={(event) => onDragStart(event, item.type, item)}
                  >
                    <div className="flex items-center">
                      <Microscope className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
