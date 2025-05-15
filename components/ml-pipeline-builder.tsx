"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  Save,
  Plus,
  Trash,
  FileCode,
  Settings,
  Database,
  BrainCircuit,
  Share2,
  Download,
  BarChart,
  Layers,
  GitBranch,
  Workflow,
  Code,
} from "lucide-react"
import ExperimentalBadge from "./experimental-badge"
import { cn } from "@/lib/utils"

// ML Pipeline Node Types
const ML_NODE_TYPES = {
  DATA_SOURCE: "data_source",
  PREPROCESSING: "preprocessing",
  FEATURE_ENGINEERING: "feature_engineering",
  MODEL: "model",
  TRAINING: "training",
  EVALUATION: "evaluation",
  DEPLOYMENT: "deployment",
  CUSTOM: "custom",
}

// ML Models
const ML_MODELS = {
  REGRESSION: [
    { id: "linear_regression", name: "Linear Regression", type: "regression" },
    { id: "random_forest_regressor", name: "Random Forest Regressor", type: "regression" },
    { id: "gradient_boosting_regressor", name: "Gradient Boosting Regressor", type: "regression" },
    { id: "svr", name: "Support Vector Regressor", type: "regression" },
  ],
  CLASSIFICATION: [
    { id: "logistic_regression", name: "Logistic Regression", type: "classification" },
    { id: "random_forest_classifier", name: "Random Forest Classifier", type: "classification" },
    { id: "gradient_boosting_classifier", name: "Gradient Boosting Classifier", type: "classification" },
    { id: "svc", name: "Support Vector Classifier", type: "classification" },
  ],
  CLUSTERING: [
    { id: "kmeans", name: "K-Means", type: "clustering" },
    { id: "dbscan", name: "DBSCAN", type: "clustering" },
    { id: "hierarchical", name: "Hierarchical Clustering", type: "clustering" },
  ],
  DEEP_LEARNING: [
    { id: "mlp", name: "Multi-layer Perceptron", type: "deep_learning" },
    { id: "cnn", name: "Convolutional Neural Network", type: "deep_learning" },
    { id: "rnn", name: "Recurrent Neural Network", type: "deep_learning" },
    { id: "lstm", name: "Long Short-Term Memory", type: "deep_learning" },
    { id: "transformer", name: "Transformer", type: "deep_learning" },
  ],
  BIO_SPECIFIC: [
    { id: "sequence_cnn", name: "Sequence CNN", type: "bio_specific" },
    { id: "protein_bert", name: "ProteinBERT", type: "bio_specific" },
    { id: "dna_bert", name: "DNA-BERT", type: "bio_specific" },
    { id: "alphafold_inspired", name: "AlphaFold-Inspired", type: "bio_specific" },
  ],
}

// Preprocessing methods
const PREPROCESSING_METHODS = [
  { id: "normalization", name: "Normalization" },
  { id: "standardization", name: "Standardization" },
  { id: "missing_values", name: "Missing Values Imputation" },
  { id: "outlier_detection", name: "Outlier Detection" },
  { id: "dimensionality_reduction", name: "Dimensionality Reduction" },
  { id: "sequence_alignment", name: "Sequence Alignment" },
  { id: "one_hot_encoding", name: "One-Hot Encoding" },
  { id: "sequence_embedding", name: "Sequence Embedding" },
]

// Feature engineering methods
const FEATURE_ENGINEERING_METHODS = [
  { id: "polynomial_features", name: "Polynomial Features" },
  { id: "interaction_features", name: "Interaction Features" },
  { id: "pca", name: "Principal Component Analysis" },
  { id: "kmers", name: "k-mer Extraction" },
  { id: "motif_detection", name: "Motif Detection" },
  { id: "structure_features", name: "Structural Features" },
  { id: "physicochemical_properties", name: "Physicochemical Properties" },
  { id: "custom_feature", name: "Custom Feature Extraction" },
]

// Evaluation metrics
const EVALUATION_METRICS = {
  REGRESSION: [
    { id: "mse", name: "Mean Squared Error" },
    { id: "rmse", name: "Root Mean Squared Error" },
    { id: "mae", name: "Mean Absolute Error" },
    { id: "r2", name: "R² Score" },
  ],
  CLASSIFICATION: [
    { id: "accuracy", name: "Accuracy" },
    { id: "precision", name: "Precision" },
    { id: "recall", name: "Recall" },
    { id: "f1", name: "F1 Score" },
    { id: "auc", name: "AUC-ROC" },
  ],
  CLUSTERING: [
    { id: "silhouette", name: "Silhouette Score" },
    { id: "davies_bouldin", name: "Davies-Bouldin Index" },
    { id: "calinski_harabasz", name: "Calinski-Harabasz Index" },
  ],
}

// Sample pipeline templates
const PIPELINE_TEMPLATES = [
  {
    id: "gene_expression_classifier",
    name: "Gene Expression Classifier",
    description: "Classify gene expression data using Random Forest",
    nodes: [
      { id: "data_1", type: ML_NODE_TYPES.DATA_SOURCE, name: "Gene Expression Data", config: { source: "csv_upload" } },
      {
        id: "preproc_1",
        type: ML_NODE_TYPES.PREPROCESSING,
        name: "Normalization",
        config: { method: "standardization" },
      },
      {
        id: "feat_1",
        type: ML_NODE_TYPES.FEATURE_ENGINEERING,
        name: "Feature Selection",
        config: { method: "pca", n_components: 10 },
      },
      {
        id: "model_1",
        type: ML_NODE_TYPES.MODEL,
        name: "Random Forest",
        config: { model_type: "random_forest_classifier", params: { n_estimators: 100 } },
      },
      { id: "train_1", type: ML_NODE_TYPES.TRAINING, name: "Model Training", config: { test_size: 0.2, cv_folds: 5 } },
      {
        id: "eval_1",
        type: ML_NODE_TYPES.EVALUATION,
        name: "Model Evaluation",
        config: { metrics: ["accuracy", "f1"] },
      },
    ],
    edges: [
      { source: "data_1", target: "preproc_1" },
      { source: "preproc_1", target: "feat_1" },
      { source: "feat_1", target: "model_1" },
      { source: "model_1", target: "train_1" },
      { source: "train_1", target: "eval_1" },
    ],
  },
  {
    id: "protein_structure_prediction",
    name: "Protein Structure Prediction",
    description: "Predict protein structure using deep learning",
    nodes: [
      { id: "data_1", type: ML_NODE_TYPES.DATA_SOURCE, name: "Protein Sequence Data", config: { source: "database" } },
      {
        id: "preproc_1",
        type: ML_NODE_TYPES.PREPROCESSING,
        name: "Sequence Embedding",
        config: { method: "sequence_embedding" },
      },
      {
        id: "model_1",
        type: ML_NODE_TYPES.MODEL,
        name: "CNN-LSTM Model",
        config: { model_type: "custom_deep_learning" },
      },
      { id: "train_1", type: ML_NODE_TYPES.TRAINING, name: "Model Training", config: { test_size: 0.2, cv_folds: 3 } },
      { id: "eval_1", type: ML_NODE_TYPES.EVALUATION, name: "Model Evaluation", config: { metrics: ["rmse"] } },
    ],
    edges: [
      { source: "data_1", target: "preproc_1" },
      { source: "preproc_1", target: "model_1" },
      { source: "model_1", target: "train_1" },
      { source: "train_1", target: "eval_1" },
    ],
  },
  {
    id: "dna_sequence_classification",
    name: "DNA Sequence Classification",
    description: "Classify DNA sequences using k-mer features",
    nodes: [
      { id: "data_1", type: ML_NODE_TYPES.DATA_SOURCE, name: "DNA Sequences", config: { source: "fasta_upload" } },
      {
        id: "feat_1",
        type: ML_NODE_TYPES.FEATURE_ENGINEERING,
        name: "k-mer Extraction",
        config: { method: "kmers", k: 3 },
      },
      {
        id: "model_1",
        type: ML_NODE_TYPES.MODEL,
        name: "SVM Classifier",
        config: { model_type: "svc", params: { kernel: "rbf" } },
      },
      { id: "train_1", type: ML_NODE_TYPES.TRAINING, name: "Model Training", config: { test_size: 0.3, cv_folds: 5 } },
      {
        id: "eval_1",
        type: ML_NODE_TYPES.EVALUATION,
        name: "Model Evaluation",
        config: { metrics: ["accuracy", "precision", "recall"] },
      },
    ],
    edges: [
      { source: "data_1", target: "feat_1" },
      { source: "feat_1", target: "model_1" },
      { source: "model_1", target: "train_1" },
      { source: "train_1", target: "eval_1" },
    ],
  },
]

// ML Pipeline Node Component
const MLPipelineNode = ({ node, onEdit, onDelete, isSelected, onClick }) => {
  const getNodeIcon = () => {
    switch (node.type) {
      case ML_NODE_TYPES.DATA_SOURCE:
        return <Database className="h-4 w-4 mr-2" />
      case ML_NODE_TYPES.PREPROCESSING:
        return <Layers className="h-4 w-4 mr-2" />
      case ML_NODE_TYPES.FEATURE_ENGINEERING:
        return <GitBranch className="h-4 w-4 mr-2" />
      case ML_NODE_TYPES.MODEL:
        return <BrainCircuit className="h-4 w-4 mr-2" />
      case ML_NODE_TYPES.TRAINING:
        return <Play className="h-4 w-4 mr-2" />
      case ML_NODE_TYPES.EVALUATION:
        return <BarChart className="h-4 w-4 mr-2" />
      case ML_NODE_TYPES.DEPLOYMENT:
        return <Share2 className="h-4 w-4 mr-2" />
      case ML_NODE_TYPES.CUSTOM:
        return <Code className="h-4 w-4 mr-2" />
      default:
        return <Workflow className="h-4 w-4 mr-2" />
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 mb-2 rounded-md border cursor-pointer",
        isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
      )}
      onClick={() => onClick(node.id)}
    >
      <div className="flex items-center">
        {getNodeIcon()}
        <span>{node.name}</span>
      </div>
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(node.id)
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(node.id)
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ML Pipeline Canvas
const MLPipelineCanvas = ({ nodes, edges, selectedNodeId, onNodeSelect }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()

    // Set canvas size
    canvas.width = rect.width
    canvas.height = rect.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw edges
    ctx.strokeStyle = "#94a3b8"
    ctx.lineWidth = 2

    edges.forEach((edge) => {
      const sourceNode = document.getElementById(`node-${edge.source}`)
      const targetNode = document.getElementById(`node-${edge.target}`)

      if (sourceNode && targetNode) {
        const sourceRect = sourceNode.getBoundingClientRect()
        const targetRect = targetNode.getBoundingClientRect()

        const startX = (sourceRect.left + sourceRect.right) / 2 - rect.left
        const startY = (sourceRect.top + sourceRect.bottom) / 2 - rect.top
        const endX = (targetRect.left + targetRect.right) / 2 - rect.left
        const endY = (targetRect.top + targetRect.bottom) / 2 - rect.top

        // Draw arrow
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()

        // Draw arrow head
        const angle = Math.atan2(endY - startY, endX - startX)
        const arrowLength = 10

        ctx.beginPath()
        ctx.moveTo(endX, endY)
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle - Math.PI / 6),
          endY - arrowLength * Math.sin(angle - Math.PI / 6),
        )
        ctx.lineTo(
          endX - arrowLength * Math.cos(angle + Math.PI / 6),
          endY - arrowLength * Math.sin(angle + Math.PI / 6),
        )
        ctx.closePath()
        ctx.fillStyle = "#94a3b8"
        ctx.fill()
      }
    })
  }, [nodes, edges])

  return (
    <div className="relative w-full h-[400px] border rounded-md bg-background/50 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="relative z-10 p-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className={cn(
              "absolute p-3 rounded-md border shadow-sm bg-card",
              selectedNodeId === node.id ? "border-primary ring-1 ring-primary" : "border-border",
            )}
            style={{
              left: `${node.position?.x || Math.random() * 60 + 10}%`,
              top: `${node.position?.y || Math.random() * 60 + 10}%`,
              transform: "translate(-50%, -50%)",
              minWidth: "120px",
            }}
            onClick={() => onNodeSelect(node.id)}
          >
            <div className="flex items-center justify-center text-sm font-medium">{node.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Node Configuration Panel
const NodeConfigPanel = ({ node, onUpdate }) => {
  const [config, setConfig] = useState(node.config || {})

  const handleChange = (key, value) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onUpdate({ ...node, config: newConfig })
  }

  const renderConfigFields = () => {
    switch (node.type) {
      case ML_NODE_TYPES.DATA_SOURCE:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="source">Data Source</Label>
              <Select value={config.source || "csv_upload"} onValueChange={(value) => handleChange("source", value)}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv_upload">CSV Upload</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="fasta_upload">FASTA Upload</SelectItem>
                  <SelectItem value="api">External API</SelectItem>
                  <SelectItem value="synthetic">Synthetic Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.source === "database" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="database">Database</Label>
                <Select defaultValue="ncbi">
                  <SelectTrigger id="database">
                    <SelectValue placeholder="Select database" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ncbi">NCBI</SelectItem>
                    <SelectItem value="uniprot">UniProt</SelectItem>
                    <SelectItem value="pdb">PDB</SelectItem>
                    <SelectItem value="custom">Custom Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.source === "api" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="api_url">API URL</Label>
                <Input
                  id="api_url"
                  placeholder="https://api.example.com/data"
                  value={config.api_url || ""}
                  onChange={(e) => handleChange("api_url", e.target.value)}
                />
              </div>
            )}
          </>
        )

      case ML_NODE_TYPES.PREPROCESSING:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="method">Preprocessing Method</Label>
              <Select
                value={config.method || "standardization"}
                onValueChange={(value) => handleChange("method", value)}
              >
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PREPROCESSING_METHODS.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.method === "missing_values" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="strategy">Imputation Strategy</Label>
                <Select value={config.strategy || "mean"} onValueChange={(value) => handleChange("strategy", value)}>
                  <SelectTrigger id="strategy">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mean">Mean</SelectItem>
                    <SelectItem value="median">Median</SelectItem>
                    <SelectItem value="most_frequent">Most Frequent</SelectItem>
                    <SelectItem value="constant">Constant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.method === "dimensionality_reduction" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="n_components">Number of Components</Label>
                <Input
                  id="n_components"
                  type="number"
                  min="1"
                  value={config.n_components || 2}
                  onChange={(e) => handleChange("n_components", Number.parseInt(e.target.value))}
                />
              </div>
            )}
          </>
        )

      case ML_NODE_TYPES.FEATURE_ENGINEERING:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="method">Feature Engineering Method</Label>
              <Select value={config.method || "pca"} onValueChange={(value) => handleChange("method", value)}>
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {FEATURE_ENGINEERING_METHODS.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.method === "kmers" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="k">k-mer Size</Label>
                <Input
                  id="k"
                  type="number"
                  min="1"
                  max="10"
                  value={config.k || 3}
                  onChange={(e) => handleChange("k", Number.parseInt(e.target.value))}
                />
              </div>
            )}

            {config.method === "pca" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="n_components">Number of Components</Label>
                <Input
                  id="n_components"
                  type="number"
                  min="1"
                  value={config.n_components || 10}
                  onChange={(e) => handleChange("n_components", Number.parseInt(e.target.value))}
                />
              </div>
            )}
          </>
        )

      case ML_NODE_TYPES.MODEL:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="model_category">Model Category</Label>
              <Select
                value={config.model_category || "CLASSIFICATION"}
                onValueChange={(value) => handleChange("model_category", value)}
              >
                <SelectTrigger id="model_category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGRESSION">Regression</SelectItem>
                  <SelectItem value="CLASSIFICATION">Classification</SelectItem>
                  <SelectItem value="CLUSTERING">Clustering</SelectItem>
                  <SelectItem value="DEEP_LEARNING">Deep Learning</SelectItem>
                  <SelectItem value="BIO_SPECIFIC">Bio-specific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="model_type">Model Type</Label>
              <Select value={config.model_type || ""} onValueChange={(value) => handleChange("model_type", value)}>
                <SelectTrigger id="model_type">
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  {(ML_MODELS[config.model_category || "CLASSIFICATION"] || []).map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.model_type === "random_forest_classifier" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="n_estimators">Number of Estimators</Label>
                <Input
                  id="n_estimators"
                  type="number"
                  min="1"
                  value={config.params?.n_estimators || 100}
                  onChange={(e) =>
                    handleChange("params", { ...config.params, n_estimators: Number.parseInt(e.target.value) })
                  }
                />
              </div>
            )}

            {config.model_type === "svc" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="kernel">Kernel</Label>
                <Select
                  value={config.params?.kernel || "rbf"}
                  onValueChange={(value) => handleChange("params", { ...config.params, kernel: value })}
                >
                  <SelectTrigger id="kernel">
                    <SelectValue placeholder="Select kernel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="poly">Polynomial</SelectItem>
                    <SelectItem value="rbf">RBF</SelectItem>
                    <SelectItem value="sigmoid">Sigmoid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )

      case ML_NODE_TYPES.TRAINING:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="test_size">Test Size</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="test_size"
                  min={0.1}
                  max={0.5}
                  step={0.05}
                  value={[config.test_size || 0.2]}
                  onValueChange={([value]) => handleChange("test_size", value)}
                />
                <span className="w-12 text-center">{config.test_size || 0.2}</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="cv_folds">Cross-Validation Folds</Label>
              <Input
                id="cv_folds"
                type="number"
                min="2"
                max="10"
                value={config.cv_folds || 5}
                onChange={(e) => handleChange("cv_folds", Number.parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="early_stopping"
                checked={config.early_stopping || false}
                onCheckedChange={(checked) => handleChange("early_stopping", checked)}
              />
              <Label htmlFor="early_stopping">Early Stopping</Label>
            </div>
          </>
        )

      case ML_NODE_TYPES.EVALUATION:
        return (
          <>
            <div className="space-y-2">
              <Label>Evaluation Metrics</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(
                  EVALUATION_METRICS[config.metric_category || "CLASSIFICATION"] || EVALUATION_METRICS.CLASSIFICATION
                ).map((metric) => (
                  <div key={metric.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={metric.id}
                      checked={(config.metrics || []).includes(metric.id)}
                      onChange={(e) => {
                        const metrics = config.metrics || []
                        if (e.target.checked) {
                          handleChange("metrics", [...metrics, metric.id])
                        } else {
                          handleChange(
                            "metrics",
                            metrics.filter((m) => m !== metric.id),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={metric.id}>{metric.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="metric_category">Metric Category</Label>
              <Select
                value={config.metric_category || "CLASSIFICATION"}
                onValueChange={(value) => handleChange("metric_category", value)}
              >
                <SelectTrigger id="metric_category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGRESSION">Regression</SelectItem>
                  <SelectItem value="CLASSIFICATION">Classification</SelectItem>
                  <SelectItem value="CLUSTERING">Clustering</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case ML_NODE_TYPES.DEPLOYMENT:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="deployment_type">Deployment Type</Label>
              <Select
                value={config.deployment_type || "api"}
                onValueChange={(value) => handleChange("deployment_type", value)}
              >
                <SelectTrigger id="deployment_type">
                  <SelectValue placeholder="Select deployment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">REST API</SelectItem>
                  <SelectItem value="batch">Batch Processing</SelectItem>
                  <SelectItem value="embedded">Embedded Model</SelectItem>
                  <SelectItem value="lab_automation">Lab Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.deployment_type === "api" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  placeholder="/api/predict"
                  value={config.api_endpoint || ""}
                  onChange={(e) => handleChange("api_endpoint", e.target.value)}
                />
              </div>
            )}

            {config.deployment_type === "lab_automation" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="lab_system">Lab System</Label>
                <Select
                  value={config.lab_system || "generic"}
                  onValueChange={(value) => handleChange("lab_system", value)}
                >
                  <SelectTrigger id="lab_system">
                    <SelectValue placeholder="Select lab system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Generic Protocol</SelectItem>
                    <SelectItem value="opentrons">Opentrons</SelectItem>
                    <SelectItem value="tecan">Tecan</SelectItem>
                    <SelectItem value="hamilton">Hamilton</SelectItem>
                    <SelectItem value="custom">Custom System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )

      case ML_NODE_TYPES.CUSTOM:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="code">Custom Code</Label>
              <Textarea
                id="code"
                placeholder="# Python code here"
                className="font-mono h-40"
                value={config.code || ""}
                onChange={(e) => handleChange("code", e.target.value)}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="language">Language</Label>
              <Select value={config.language || "python"} onValueChange={(value) => handleChange("language", value)}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="r">R</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      default:
        return <p>No configuration options available for this node type.</p>
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="node_name">Node Name</Label>
        <Input id="node_name" value={node.name} onChange={(e) => onUpdate({ ...node, name: e.target.value })} />
      </div>

      {renderConfigFields()}
    </div>
  )
}

// Code View Component
const CodeView = ({ pipeline }) => {
  const generatePythonCode = () => {
    let code = `# Generated ML Pipeline Code
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error
import matplotlib.pyplot as plt
import seaborn as sns

# Initialize pipeline components
`

    // Find data source node
    const dataNode = pipeline.nodes.find((node) => node.type === ML_NODE_TYPES.DATA_SOURCE)
    if (dataNode) {
      code += `# Data loading
`
      if (dataNode.config?.source === "csv_upload") {
        code += `data = pd.read_csv('data.csv')
X = data.drop('target', axis=1)  # Replace 'target' with your target column
y = data['target']
`
      } else if (dataNode.config?.source === "fasta_upload") {
        code += `from Bio import SeqIO

# Load sequences from FASTA file
sequences = []
labels = []
for record in SeqIO.parse('sequences.fasta', 'fasta'):
    sequences.append(str(record.seq))
    # Extract label from description if available
    label = record.description.split('|')[-1] if '|' in record.description else 'unknown'
    labels.append(label)
`
      }
    }

    // Find preprocessing node
    const preprocNode = pipeline.nodes.find((node) => node.type === ML_NODE_TYPES.PREPROCESSING)
    if (preprocNode) {
      code += `
# Preprocessing
`
      if (preprocNode.config?.method === "standardization") {
        code += `scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
`
      } else if (preprocNode.config?.method === "sequence_embedding") {
        code += `# Convert sequences to numerical features
from sklearn.feature_extraction.text import CountVectorizer

# Use k-mer based vectorization
vectorizer = CountVectorizer(analyzer='char', ngram_range=(3, 3))
X = vectorizer.fit_transform(sequences)
`
      }
    }

    // Find feature engineering node
    const featureNode = pipeline.nodes.find((node) => node.type === ML_NODE_TYPES.FEATURE_ENGINEERING)
    if (featureNode) {
      code += `
# Feature engineering
`
      if (featureNode.config?.method === "pca") {
        code += `from sklearn.decomposition import PCA

pca = PCA(n_components=${featureNode.config?.n_components || 10})
X_pca = pca.fit_transform(X_scaled)
X = X_pca  # Use PCA features
`
      } else if (featureNode.config?.method === "kmers") {
        code += `# K-mer extraction already handled in preprocessing
`
      }
    }

    // Find model node
    const modelNode = pipeline.nodes.find((node) => node.type === ML_NODE_TYPES.MODEL)
    if (modelNode) {
      code += `
# Model definition
`
      if (modelNode.config?.model_type === "random_forest_classifier") {
        code += `from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=${modelNode.config?.params?.n_estimators || 100},
    random_state=42
)
`
      } else if (modelNode.config?.model_type === "svc") {
        code += `from sklearn.svm import SVC

model = SVC(
    kernel='${modelNode.config?.params?.kernel || "rbf"}',
    probability=True,
    random_state=42
)
`
      } else if (modelNode.config?.model_type?.includes("cnn")) {
        code += `import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, Dense, Flatten, Dropout

# Define CNN model for sequence data
model = Sequential([
    Conv1D(filters=64, kernel_size=3, activation='relu', input_shape=(X.shape[1], 1)),
    MaxPooling1D(pool_size=2),
    Conv1D(filters=32, kernel_size=3, activation='relu'),
    MaxPooling1D(pool_size=2),
    Flatten(),
    Dense(64, activation='relu'),
    Dropout(0.5),
    Dense(1, activation='sigmoid')  # Binary classification
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
`
      }
    }

    // Find training node
    const trainingNode = pipeline.nodes.find((node) => node.type === ML_NODE_TYPES.TRAINING)
    if (trainingNode) {
      code += `
# Model training
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=${trainingNode.config?.test_size || 0.2}, random_state=42
)

# Train the model
model.fit(X_train, y_train)

# Cross-validation
cv_scores = cross_val_score(
    model, X, y, cv=${trainingNode.config?.cv_folds || 5}, scoring='accuracy'
)
print(f"Cross-validation scores: {cv_scores}")
print(f"Mean CV score: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
`
    }

    // Find evaluation node
    const evalNode = pipeline.nodes.find((node) => node.type === ML_NODE_TYPES.EVALUATION)
    if (evalNode) {
      code += `
# Model evaluation
y_pred = model.predict(X_test)
`

      if (evalNode.config?.metrics?.includes("accuracy")) {
        code += `accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")
`
      }

      if (evalNode.config?.metrics?.includes("f1")) {
        code += `f1 = f1_score(y_test, y_pred, average='weighted')
print(f"F1 Score: {f1:.4f}")
`
      }

      code += `
# Visualization
plt.figure(figsize=(10, 6))
sns.heatmap(pd.DataFrame(confusion_matrix(y_test, y_pred)), annot=True, cmap='Blues', fmt='d')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.show()
`
    }

    // Find deployment node
    const deployNode = pipeline.nodes.find((node) => node.type === ML_NODE_TYPES.DEPLOYMENT)
    if (deployNode) {
      code += `
# Model deployment
import joblib

# Save the model
joblib.dump(model, 'model.pkl')
`

      if (deployNode.config?.deployment_type === "api") {
        code += `
# Example Flask API for model deployment
'''
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load('model.pkl')

@app.route('${deployNode.config?.api_endpoint || "/api/predict"}', methods=['POST'])
def predict():
    data = request.json
    # Preprocess input data
    # ...
    prediction = model.predict([data])
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(debug=True)
'''
`
      } else if (deployNode.config?.deployment_type === "lab_automation") {
        code += `
# Example lab automation integration
'''
# This is a template for lab automation integration
# Modify according to your specific lab system

import opentrons.execute  # For Opentrons integration

# Define protocol
def run_experiment(prediction_results):
    # Setup labware
    plate = protocol.load_labware('corning_96_wellplate_360ul_flat', '1')
    tiprack = protocol.load_labware('opentrons_96_tiprack_300ul', '2')
    
    # Setup instruments
    pipette = protocol.load_instrument('p300_single', 'right', tip_racks=[tiprack])
    
    # Execute experiment based on model predictions
    for i, result in enumerate(prediction_results):
        if result > 0.5:  # Threshold for positive prediction
            pipette.pick_up_tip()
            pipette.aspirate(100, plate['A1'])
            pipette.dispense(100, plate[f'A{i+1}'])
            pipette.drop_tip()

# Call this function with your model predictions
'''
`
      }
    }

    return code
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Generated Code</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
      <div className="relative">
        <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-auto max-h-[500px]">
          <code>{generatePythonCode()}</code>
        </pre>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => {
            navigator.clipboard.writeText(generatePythonCode())
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-copy"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

// ML Pipeline Builder Component
export default function MLPipelineBuilder() {
  const [activeTab, setActiveTab] = useState("visual")
  const [pipeline, setPipeline] = useState({
    name: "New Pipeline",
    description: "ML pipeline for biological data analysis",
    nodes: [],
    edges: [],
  })
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [isAddingNode, setIsAddingNode] = useState(false)
  const [newNodeType, setNewNodeType] = useState(ML_NODE_TYPES.DATA_SOURCE)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)

  // Get selected node
  const selectedNode = pipeline.nodes.find((node) => node.id === selectedNodeId)

  // Add a new node
  const addNode = (type) => {
    const newNodeId = `node_${Date.now()}`
    const newNode = {
      id: newNodeId,
      type,
      name: getDefaultNodeName(type),
      config: getDefaultConfig(type),
    }

    setPipeline((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }))

    setSelectedNodeId(newNodeId)
    setIsAddingNode(false)
  }

  // Get default node name based on type
  const getDefaultNodeName = (type) => {
    switch (type) {
      case ML_NODE_TYPES.DATA_SOURCE:
        return "Data Source"
      case ML_NODE_TYPES.PREPROCESSING:
        return "Preprocessing"
      case ML_NODE_TYPES.FEATURE_ENGINEERING:
        return "Feature Engineering"
      case ML_NODE_TYPES.MODEL:
        return "Model"
      case ML_NODE_TYPES.TRAINING:
        return "Training"
      case ML_NODE_TYPES.EVALUATION:
        return "Evaluation"
      case ML_NODE_TYPES.DEPLOYMENT:
        return "Deployment"
      case ML_NODE_TYPES.CUSTOM:
        return "Custom Node"
      default:
        return "New Node"
    }
  }

  // Get default config based on node type
  const getDefaultConfig = (type) => {
    switch (type) {
      case ML_NODE_TYPES.DATA_SOURCE:
        return { source: "csv_upload" }
      case ML_NODE_TYPES.PREPROCESSING:
        return { method: "standardization" }
      case ML_NODE_TYPES.FEATURE_ENGINEERING:
        return { method: "pca", n_components: 10 }
      case ML_NODE_TYPES.MODEL:
        return {
          model_category: "CLASSIFICATION",
          model_type: "random_forest_classifier",
          params: { n_estimators: 100 },
        }
      case ML_NODE_TYPES.TRAINING:
        return { test_size: 0.2, cv_folds: 5 }
      case ML_NODE_TYPES.EVALUATION:
        return {
          metric_category: "CLASSIFICATION",
          metrics: ["accuracy", "f1"],
        }
      case ML_NODE_TYPES.DEPLOYMENT:
        return { deployment_type: "api" }
      case ML_NODE_TYPES.CUSTOM:
        return { language: "python", code: "# Custom code here\n" }
      default:
        return {}
    }
  }

  // Update a node
  const updateNode = (updatedNode) => {
    setPipeline((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) => (node.id === updatedNode.id ? updatedNode : node)),
    }))
  }

  // Delete a node
  const deleteNode = (nodeId) => {
    setPipeline((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((node) => node.id !== nodeId),
      edges: prev.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    }))

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null)
    }
  }

  // Add an edge between nodes
  const addEdge = (sourceId, targetId) => {
    // Check if edge already exists
    const edgeExists = pipeline.edges.some((edge) => edge.source === sourceId && edge.target === targetId)

    if (!edgeExists && sourceId !== targetId) {
      setPipeline((prev) => ({
        ...prev,
        edges: [...prev.edges, { source: sourceId, target: targetId }],
      }))
    }
  }

  // Connect selected node to another node
  const connectNodes = (targetId) => {
    if (selectedNodeId && targetId !== selectedNodeId) {
      addEdge(selectedNodeId, targetId)
    }
  }

  // Load a template pipeline
  const loadTemplate = (templateId) => {
    const template = PIPELINE_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setPipeline({
        name: template.name,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges,
      })
      setShowTemplateDialog(false)
    }
  }

  // Run the pipeline
  const runPipeline = () => {
    console.log("Running pipeline:", pipeline)
    // In a real implementation, this would send the pipeline to a backend service
    // for execution and return results
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2" />
              Machine Learning Pipeline Builder
              <ExperimentalBadge className="ml-2" />
            </CardTitle>
            <CardDescription>
              Design and execute machine learning pipelines for biological data analysis
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
              <FileCode className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" onClick={runPipeline}>
              <Play className="h-4 w-4 mr-2" />
              Run Pipeline
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
            <TabsTrigger value="code">Code View</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Left sidebar - Node list */}
              <div className="md:col-span-1 border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium">Pipeline Nodes</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => addNode(ML_NODE_TYPES.DATA_SOURCE)}>
                        <Database className="h-4 w-4 mr-2" />
                        Data Source
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNode(ML_NODE_TYPES.PREPROCESSING)}>
                        <Layers className="h-4 w-4 mr-2" />
                        Preprocessing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNode(ML_NODE_TYPES.FEATURE_ENGINEERING)}>
                        <GitBranch className="h-4 w-4 mr-2" />
                        Feature Engineering
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNode(ML_NODE_TYPES.MODEL)}>
                        <BrainCircuit className="h-4 w-4 mr-2" />
                        Model
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNode(ML_NODE_TYPES.TRAINING)}>
                        <Play className="h-4 w-4 mr-2" />
                        Training
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNode(ML_NODE_TYPES.EVALUATION)}>
                        <BarChart className="h-4 w-4 mr-2" />
                        Evaluation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNode(ML_NODE_TYPES.DEPLOYMENT)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Deployment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addNode(ML_NODE_TYPES.CUSTOM)}>
                        <Code className="h-4 w-4 mr-2" />
                        Custom Node
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <ScrollArea className="h-[400px]">
                  {pipeline.nodes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No nodes added yet</p>
                      <p className="text-sm mt-2">Click + to add a node</p>
                    </div>
                  ) : (
                    pipeline.nodes.map((node) => (
                      <MLPipelineNode
                        key={node.id}
                        node={node}
                        isSelected={selectedNodeId === node.id}
                        onClick={setSelectedNodeId}
                        onEdit={setSelectedNodeId}
                        onDelete={deleteNode}
                      />
                    ))
                  )}
                </ScrollArea>
              </div>

              {/* Center - Pipeline canvas */}
              <div className="md:col-span-2">
                <MLPipelineCanvas
                  nodes={pipeline.nodes}
                  edges={pipeline.edges}
                  selectedNodeId={selectedNodeId}
                  onNodeSelect={setSelectedNodeId}
                />
              </div>

              {/* Right sidebar - Node configuration */}
              <div className="md:col-span-1 border rounded-md p-4">
                <h3 className="text-sm font-medium mb-4">Node Configuration</h3>

                {selectedNode ? (
                  <NodeConfigPanel node={selectedNode} onUpdate={updateNode} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No node selected</p>
                    <p className="text-sm mt-2">Select a node to configure it</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code">
            <CodeView pipeline={pipeline} />
          </TabsContent>

          <TabsContent value="results">
            <div className="text-center py-12 text-muted-foreground">
              <p>Run the pipeline to see results</p>
              <Button className="mt-4" onClick={runPipeline}>
                <Play className="h-4 w-4 mr-2" />
                Run Pipeline
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Template selection dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Template</DialogTitle>
            <DialogDescription>Choose a pre-configured pipeline template to get started quickly</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {PIPELINE_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => loadTemplate(template.id)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
