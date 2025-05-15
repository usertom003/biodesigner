"use client"

import { memo } from "react"
import { Handle, Position } from "reactflow"
import { Dna, Zap, X, Sigma, Beaker } from "lucide-react"

// Promoter Node
export const PromoterNode = memo(({ data, selected }) => {
  const strengthColors = {
    low: "bg-yellow-100",
    medium: "bg-yellow-200",
    high: "bg-yellow-300",
    "very high": "bg-yellow-400",
  }

  const strengthColor = strengthColors[data.strength] || "bg-yellow-200"

  return (
    <div
      className={`relative rounded-md border-2 ${selected ? "border-black" : "border-gray-300"} p-3 shadow-sm bg-white w-48`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full ${strengthColor}`}>
          <Zap className="h-4 w-4 text-yellow-700" />
        </div>
        <div className="text-sm font-medium truncate">{data.label}</div>
        {data.experimental && (
          <div className="absolute top-1 right-1">
            <Beaker className="h-3 w-3 text-yellow-600" />
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {data.strength && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs">{data.strength}</span>
        )}
        {data.inducible && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
            inducible
          </span>
        )}
        {data.inducer && (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
            {data.inducer}
          </span>
        )}
        {data.id && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-mono">
            {data.id}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: "#555" }} />
    </div>
  )
})

PromoterNode.displayName = "PromoterNode"

// Gene Node
export const GeneNode = memo(({ data, selected }) => {
  const functionColors = {
    reporter: "bg-emerald-100",
    repressor: "bg-red-100",
    activator: "bg-blue-100",
    enzyme: "bg-purple-100",
    other: "bg-gray-100",
  }

  const functionColor = functionColors[data.function] || "bg-emerald-100"

  return (
    <div
      className={`relative rounded-md border-2 ${selected ? "border-black" : "border-gray-300"} p-3 shadow-sm bg-white w-48`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full ${functionColor}`}>
          <Dna className="h-4 w-4 text-emerald-700" />
        </div>
        <div className="text-sm font-medium truncate">{data.label}</div>
        {data.experimental && (
          <div className="absolute top-1 right-1">
            <Beaker className="h-3 w-3 text-yellow-600" />
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {data.function && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs">{data.function}</span>
        )}
        {data.color && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
              data.color === "green"
                ? "bg-green-100 text-green-800"
                : data.color === "red"
                  ? "bg-red-100 text-red-800"
                  : data.color === "yellow"
                    ? "bg-yellow-100 text-yellow-800"
                    : data.color === "blue"
                      ? "bg-blue-100 text-blue-800"
                      : data.color === "cyan"
                        ? "bg-cyan-100 text-cyan-800"
                        : "bg-gray-100 text-gray-800"
            }`}
          >
            {data.color}
          </span>
        )}
        {data.id && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-mono">
            {data.id}
          </span>
        )}
      </div>

      <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#555" }} />
    </div>
  )
})

GeneNode.displayName = "GeneNode"

// Terminator Node
export const TerminatorNode = memo(({ data, selected }) => {
  const efficiencyColors = {
    low: "bg-red-100",
    medium: "bg-red-200",
    high: "bg-red-300",
    "very high": "bg-red-400",
  }

  const efficiencyColor = efficiencyColors[data.efficiency] || "bg-red-200"

  return (
    <div
      className={`relative rounded-md border-2 ${selected ? "border-black" : "border-gray-300"} p-3 shadow-sm bg-white w-48`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full ${efficiencyColor}`}>
          <X className="h-4 w-4 text-red-700" />
        </div>
        <div className="text-sm font-medium truncate">{data.label}</div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {data.efficiency && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs">
            {data.efficiency}
          </span>
        )}
      </div>

      <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
    </div>
  )
})

TerminatorNode.displayName = "TerminatorNode"

// Regulatory Node
export const RegulatoryNode = memo(({ data, selected }) => {
  const functionColors = {
    binding: "bg-purple-100",
    translation: "bg-blue-100",
    activation: "bg-green-100",
    repression: "bg-red-100",
  }

  const functionColor = functionColors[data.function] || "bg-purple-100"

  return (
    <div
      className={`relative rounded-md border-2 ${selected ? "border-black" : "border-gray-300"} p-3 shadow-sm bg-white w-48`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full ${functionColor}`}>
          <Sigma className="h-4 w-4 text-purple-700" />
        </div>
        <div className="text-sm font-medium truncate">{data.label}</div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {data.function && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs">{data.function}</span>
        )}
        {data.strengthValue && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
            {data.strengthValue}% strength
          </span>
        )}
      </div>

      <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#555" }} />
    </div>
  )
})

RegulatoryNode.displayName = "RegulatoryNode"
