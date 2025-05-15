"use client"

import { Badge } from "@/components/ui/badge"
import { Beaker } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ExperimentalBadge({ className = "" }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`bg-yellow-100 text-yellow-800 border-yellow-200 ${className}`}>
            <Beaker className="h-3 w-3 mr-1" />
            Experimental
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">
            This component is experimental or in development. It may have limited validation or functionality that is
            not fully tested.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
