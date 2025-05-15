"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { BrainCircuit, FileUp, Play, Download, Database } from "lucide-react"
import ExperimentalBadge from "./experimental-badge"

// Model types
const MODEL_TYPES = [
  { id: "sequence_classifier", name: "DNA/RNA Sequence Classifier", description: "Classify sequences into categories" },
  { id: "gene_expression", name: "Gene Expression Predictor", description: "Predict gene expression levels" },
  {
    id: "protein_function",
    name: "Protein Function Predictor",
    description: "Predict protein functions from sequences",
  },
  {
    id: "binding_affinity",
    name: "Binding Affinity Predictor",
    description: "Predict binding affinity between molecules",
  },
  { id: "promoter_strength", name: "Promoter Strength Predictor", description: "Predict promoter strength" },
]

// Feature extraction methods
const FEATURE_METHODS = [
  { id: "one_hot", name: "One-Hot Encoding", description: "Convert sequences to binary vectors" },
  { id: "kmer", name: "k-mer Frequencies", description: "Count k-mer occurrences in sequences" },
  { id: "embedding", name: "Sequence Embedding", description: "Use pre-trained embeddings (e.g., ESM, ProtBERT)" },
  {
    id: "physicochemical",
    name: "Physicochemical Properties",
    description: "Extract physical and chemical properties",
  },
]

// Model algorithms
const MODEL_ALGORITHMS = [
  { id: "random_forest", name: "Random Forest", description: "Ensemble of decision trees" },
  { id: "svm", name: "Support Vector Machine", description: "Powerful classifier with kernel methods" },
  { id: "cnn", name: "Convolutional Neural Network", description: "Deep learning for sequence patterns" },
  { id: "lstm", name: "LSTM Network", description: "Recurrent neural network for sequential data" },
  { id: "transformer", name: "Transformer", description: "Attention-based model for sequences" },
]

export default function EasyMLModelBuilder() {
  const [activeTab, setActiveTab] = useState("setup")
  const [modelName, setModelName] = useState("My Sequence Model")
  const [modelType, setModelType] = useState("sequence_classifier")
  const [featureMethod, setFeatureMethod] = useState("kmer")
  const [algorithm, setAlgorithm] = useState("random_forest")
  const [dataFile, setDataFile] = useState<File | null>(null)
  const [kmerSize, setKmerSize] = useState(3)
  const [useAdvancedOptions, setUseAdvancedOptions] = useState(false)
  const [hyperparams, setHyperparams] = useState({
    testSize: 0.2,
    randomState: 42,
    nEstimators: 100,
    maxDepth: 10,
    learningRate: 0.01,
    epochs: 10,
    batchSize: 32,
  })
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [modelTrained, setModelTrained] = useState(false)
  const [modelMetrics, setModelMetrics] = useState<null | {
    accuracy: number
    precision: number
    recall: number
    f1: number
  }>(null)

  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDataFile(e.target.files[0])
    }
  }

  const updateHyperparam = (key: string, value: number) => {
    setHyperparams((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const trainModel = () => {
    if (!dataFile) {
      toast({
        title: "Data Required",
        description: "Please upload a dataset file first",
        variant: "destructive",
      })
      return
    }

    setIsTraining(true)
    setTrainingProgress(0)
    setModelTrained(false)
    setModelMetrics(null)

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)

          // Simulate completion
          setTimeout(() => {
            setIsTraining(false)
            setModelTrained(true)

            // Generate random metrics for demo
            setModelMetrics({
              accuracy: 0.85 + Math.random() * 0.1,
              precision: 0.82 + Math.random() * 0.1,
              recall: 0.79 + Math.random() * 0.1,
              f1: 0.81 + Math.random() * 0.1,
            })

            toast({
              title: "Model Training Complete",
              description: "Your model has been successfully trained and is ready to use",
            })
          }, 500)

          return 100
        }
        return newProgress
      })
    }, 300)
  }

  const generatePythonCode = () => {
    // Generate Python code based on selected options
    const code = `# Generated ML Model for ${modelName}
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
${algorithm === "random_forest" ? "from sklearn.ensemble import RandomForestClassifier" : ""}
${algorithm === "svm" ? "from sklearn.svm import SVC" : ""}
${algorithm === "cnn" || algorithm === "lstm" || algorithm === "transformer" ? "import tensorflow as tf" : ""}
${featureMethod === "kmer" ? "from Bio import SeqIO" : ""}
${featureMethod === "kmer" ? "from sklearn.feature_extraction.text import CountVectorizer" : ""}

# Load and preprocess data
${
  featureMethod === "kmer"
    ? `
def extract_kmers(sequences, k=${kmerSize}):
    """Extract k-mer features from sequences"""
    # Convert sequences to k-mer representation
    kmer_seqs = []
    for seq in sequences:
        kmers = [seq[i:i+k] for i in range(len(seq) - k + 1)]
        kmer_seqs.append(' '.join(kmers))
    
    # Create k-mer vocabulary and count vectors
    vectorizer = CountVectorizer(analyzer='word')
    X = vectorizer.fit_transform(kmer_seqs)
    return X, vectorizer

# Load sequences from FASTA or CSV
# Assuming format: sequence in first column, label in second column
data = pd.read_csv("${dataFile?.name || "data.csv"}")
sequences = data.iloc[:, 0].tolist()
labels = data.iloc[:, 1].tolist()

# Extract features
X, vectorizer = extract_kmers(sequences)
y = np.array(labels)
`
    : "# Load your data and extract features here"
}

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=${hyperparams.testSize}, random_state=${hyperparams.randomState}
)

# Define and train model
${
  algorithm === "random_forest"
    ? `
model = RandomForestClassifier(
    n_estimators=${hyperparams.nEstimators},
    max_depth=${hyperparams.maxDepth},
    random_state=${hyperparams.randomState}
)
model.fit(X_train, y_train)
`
    : ""
}

${
  algorithm === "svm"
    ? `
model = SVC(probability=True, random_state=${hyperparams.randomState})
model.fit(X_train, y_train)
`
    : ""
}

${
  algorithm === "cnn"
    ? `
# Reshape data for CNN
X_train = X_train.toarray().reshape(X_train.shape[0], X_train.shape[1], 1)
X_test = X_test.toarray().reshape(X_test.shape[0], X_test.shape[1], 1)

# Define CNN model
model = tf.keras.Sequential([
    tf.keras.layers.Conv1D(filters=64, kernel_size=3, activation='relu', input_shape=(X_train.shape[1], 1)),
    tf.keras.layers.MaxPooling1D(pool_size=2),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(len(np.unique(y)), activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=${hyperparams.learningRate}),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train model
model.fit(
    X_train, y_train,
    epochs=${hyperparams.epochs},
    batch_size=${hyperparams.batchSize},
    validation_split=0.2
)
`
    : ""
}

# Evaluate model
y_pred = model.predict(X_test)
${algorithm === "cnn" || algorithm === "lstm" || algorithm === "transformer" ? "y_pred = np.argmax(y_pred, axis=1)" : ""}

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')

print(f"Accuracy: {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1 Score: {f1:.4f}")

# Save model
import joblib
joblib.dump(model, "${modelName.toLowerCase().replace(/\s+/g, "_")}.pkl")
${featureMethod === "kmer" ? 'joblib.dump(vectorizer, "kmer_vectorizer.pkl")' : ""}

# Example prediction function
def predict_sequence(sequence):
    """Predict class for a new sequence"""
    ${
      featureMethod === "kmer"
        ? `
    # Convert to k-mer representation
    kmers = [sequence[i:i+${kmerSize}] for i in range(len(sequence) - ${kmerSize} + 1)]
    kmer_seq = ' '.join(kmers)
    
    # Transform using the same vectorizer
    X_new = vectorizer.transform([kmer_seq])
    `
        : "# Extract features from sequence"
    }
    
    ${
      algorithm === "cnn"
        ? `
    X_new = X_new.toarray().reshape(1, X_new.shape[1], 1)
    prediction = model.predict(X_new)
    return np.argmax(prediction, axis=1)[0]
    `
        : "return model.predict(X_new)[0]"
    }

# Example usage
# new_sequence = "ATGCGTAAAGGAGAAGAACTTTTCACTGGAGTTGTCCCAATTCTTGTTGAAT"
# prediction = predict_sequence(new_sequence)
# print(f"Predicted class: {prediction}")
`

    return code
  }

  const downloadModel = () => {
    if (!modelTrained) {
      toast({
        title: "Model Not Trained",
        description: "Please train your model first before downloading",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would download the actual model file
    // For this demo, we'll just download the Python code
    const code = generatePythonCode()
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${modelName.toLowerCase().replace(/\s+/g, "_")}_model.py`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Code Downloaded",
      description: "Python code for your model has been downloaded",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2" />
              Easy ML Model Builder
              <ExperimentalBadge className="ml-2" />
            </CardTitle>
            <CardDescription>
              Create custom machine learning models for biological sequences without coding
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="train">Train</TabsTrigger>
            <TabsTrigger value="evaluate" disabled={!modelTrained}>
              Evaluate
            </TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Enter a name for your model"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-type">Model Type</Label>
                <Select value={modelType} onValueChange={setModelType}>
                  <SelectTrigger id="model-type">
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {MODEL_TYPES.find((t) => t.id === modelType)?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature-method">Feature Extraction Method</Label>
                <Select value={featureMethod} onValueChange={setFeatureMethod}>
                  <SelectTrigger id="feature-method">
                    <SelectValue placeholder="Select feature extraction method" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURE_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {FEATURE_METHODS.find((m) => m.id === featureMethod)?.description}
                </p>
              </div>

              {featureMethod === "kmer" && (
                <div className="space-y-2">
                  <Label htmlFor="kmer-size">k-mer Size: {kmerSize}</Label>
                  <Slider
                    id="kmer-size"
                    min={2}
                    max={7}
                    step={1}
                    value={[kmerSize]}
                    onValueChange={([value]) => setKmerSize(value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Smaller k-mers capture local patterns, larger k-mers capture more specific motifs
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger id="algorithm">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_ALGORITHMS.map((alg) => (
                      <SelectItem key={alg.id} value={alg.id}>
                        {alg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {MODEL_ALGORITHMS.find((a) => a.id === algorithm)?.description}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="advanced-options" checked={useAdvancedOptions} onCheckedChange={setUseAdvancedOptions} />
                <Label htmlFor="advanced-options">Show Advanced Options</Label>
              </div>

              {useAdvancedOptions && (
                <div className="space-y-4 p-4 border rounded-md">
                  <h3 className="text-sm font-medium">Advanced Options</h3>

                  <div className="space-y-2">
                    <Label htmlFor="test-size">Test Size: {hyperparams.testSize}</Label>
                    <Slider
                      id="test-size"
                      min={0.1}
                      max={0.5}
                      step={0.05}
                      value={[hyperparams.testSize]}
                      onValueChange={([value]) => updateHyperparam("testSize", value)}
                    />
                  </div>

                  {algorithm === "random_forest" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="n-estimators">Number of Trees: {hyperparams.nEstimators}</Label>
                        <Slider
                          id="n-estimators"
                          min={10}
                          max={500}
                          step={10}
                          value={[hyperparams.nEstimators]}
                          onValueChange={([value]) => updateHyperparam("nEstimators", value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-depth">Max Tree Depth: {hyperparams.maxDepth}</Label>
                        <Slider
                          id="max-depth"
                          min={2}
                          max={30}
                          step={1}
                          value={[hyperparams.maxDepth]}
                          onValueChange={([value]) => updateHyperparam("maxDepth", value)}
                        />
                      </div>
                    </>
                  )}

                  {(algorithm === "cnn" || algorithm === "lstm" || algorithm === "transformer") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="learning-rate">Learning Rate: {hyperparams.learningRate}</Label>
                        <Slider
                          id="learning-rate"
                          min={0.0001}
                          max={0.1}
                          step={0.0001}
                          value={[hyperparams.learningRate]}
                          onValueChange={([value]) => updateHyperparam("learningRate", value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="epochs">Epochs: {hyperparams.epochs}</Label>
                        <Slider
                          id="epochs"
                          min={1}
                          max={100}
                          step={1}
                          value={[hyperparams.epochs]}
                          onValueChange={([value]) => updateHyperparam("epochs", value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="batch-size">Batch Size: {hyperparams.batchSize}</Label>
                        <Slider
                          id="batch-size"
                          min={8}
                          max={128}
                          step={8}
                          value={[hyperparams.batchSize]}
                          onValueChange={([value]) => updateHyperparam("batchSize", value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="train">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="data-file">Upload Dataset</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="data-file"
                    type="file"
                    accept=".csv,.fasta,.fa,.txt"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <FileUp className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a CSV file with sequences and labels, or a FASTA file with labeled sequences
                </p>
              </div>

              {dataFile && (
                <div className="p-4 border rounded-md bg-muted">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{dataFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(dataFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <Database className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button onClick={trainModel} disabled={!dataFile || isTraining} className="w-full">
                  {isTraining ? "Training..." : "Train Model"}
                  {!isTraining && <Play className="ml-2 h-4 w-4" />}
                </Button>

                {isTraining && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Training Progress</span>
                      <span>{Math.round(trainingProgress)}%</span>
                    </div>
                    <Progress value={trainingProgress} />
                  </div>
                )}

                {modelTrained && (
                  <div className="p-4 border rounded-md bg-green-50 text-green-800">
                    <p className="font-medium">Model Training Complete!</p>
                    <p className="text-sm">Your model has been successfully trained and is ready to use.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evaluate">
            <div className="space-y-6">
              {modelMetrics && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Accuracy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{(modelMetrics.accuracy * 100).toFixed(2)}%</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">F1 Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{(modelMetrics.f1 * 100).toFixed(2)}%</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Precision</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{(modelMetrics.precision * 100).toFixed(2)}%</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recall</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{(modelMetrics.recall * 100).toFixed(2)}%</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-sequence">Test a Sequence</Label>
                    <Textarea
                      id="test-sequence"
                      placeholder="Enter a DNA/RNA/protein sequence to test"
                      className="font-mono"
                    />
                    <Button className="w-full">Predict</Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Generated Python Code</h3>
                <Button variant="outline" size="sm" onClick={downloadModel}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-auto max-h-[400px]">
                  <code>{generatePythonCode()}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    navigator.clipboard.writeText(generatePythonCode())
                    toast({
                      title: "Code Copied",
                      description: "Python code has been copied to clipboard",
                    })
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
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        <Button
          onClick={() =>
            setActiveTab(
              activeTab === "setup"
                ? "train"
                : activeTab === "train"
                  ? "evaluate"
                  : activeTab === "evaluate"
                    ? "code"
                    : "setup",
            )
          }
          disabled={activeTab === "evaluate" && !modelTrained}
        >
          {activeTab === "code" ? "Start Over" : "Next Step"}
        </Button>
      </CardFooter>
    </Card>
  )
}
