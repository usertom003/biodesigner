"use client"

import { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from "react"
import { Search, Database, Download, ExternalLink, Plus, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

// Definizione dei tipi per i dati dal backend (da allineare con i modelli Pydantic)
interface ExternalDatabase {
  id: string;
  name: string;
}

interface ExternalComponentSearchResult {
  id: string;
  name: string;
  type: string; // e.g., promoter, gene, terminator
  database: string; // e.g., IGEM, ADDGENE
  description?: string;
  preview?: string; // Short sequence preview or identifier
  properties?: Record<string, any>; // e.g. strength, inducible
}

interface GeneticComponentCreatePayload {
  name: string;
  component_type: string; // Deve corrispondere a ComponentType enum del backend
  sequence?: string;
  description?: string;
  properties: Record<string, any>;
}

interface GeneticComponentResponse {
  id: string;
  name: string;
  component_type: string;
  sequence?: string;
  description?: string;
  properties: Record<string, any>;
  created_at: string; // DateTime string
  updated_at: string; // DateTime string
}

// Rimuoviamo mockDatabases e mockSearchResults, verranno caricati dal backend

// Mock recent imports - questo verrà gestito in una fase successiva
const recentImportsMock = [
  {
    id: "custom_prom1",
    name: "Custom Inducible Promoter",
    type: "promoter",
    source: "Lab Notebook",
    date: "2025-05-10",
    experimental: true,
  },
  // ... (altri recent imports mockati)
]

interface ComponentTypeOption {
    value: string;
    label: string;
}

const COMPONENT_TYPES: ComponentTypeOption[] = [
  { value: "all", label: "All Types" },
  { value: "promoter", label: "Promoter" },
  { value: "gene", label: "Gene" },
  { value: "terminator", label: "Terminator" },
  { value: "regulatory", label: "Regulatory" },
  // Aggiungere altri tipi se necessario, allineati con l'enum ComponentType del backend
];

export default function DatabaseSearch({ onAddComponent }: { onAddComponent: (component: GeneticComponentResponse | ExternalComponentSearchResult) => void }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDatabase, setSelectedDatabase] = useState("all")
  const [availableDatabases, setAvailableDatabases] = useState<ExternalDatabase[]>([])
  const [searchResults, setSearchResults] = useState<ExternalComponentSearchResult[]>([])
  const [activeTab, setActiveTab] = useState("search")
  const [selectedType, setSelectedType] = useState("all") // Per filtrare la ricerca per tipo
  
  const [importName, setImportName] = useState("")
  const [importType, setImportType] = useState("gene") // Default per il tab "Import Sequence"
  const [importSequence, setImportSequence] = useState("")
  const [importDescription, setImportDescription] = useState("")
  const [importExperimental, setImportExperimental] = useState(false)
  const [isImportingCustom, setIsImportingCustom] = useState(false)

  const [recentImports, setRecentImports] = useState<GeneticComponentResponse[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)

  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [isImportingExternal, setIsImportingExternal] = useState<Record<string, boolean>>({}) // Per tracciare l'import per ID

  const { toast } = useToast()

  // Carica i database disponibili al mount del componente
  useEffect(() => {
    const fetchDatabases = async () => {
      setIsLoadingDatabases(true)
      try {
        const response = await fetch("/api/search/databases")
        if (!response.ok) {
          throw new Error("Failed to fetch databases")
        }
        const data: ExternalDatabase[] = await response.json()
        setAvailableDatabases(data)
      } catch (error) {
        console.error("Error fetching databases:", error)
        toast({
          title: "Error fetching databases",
          description: (error as Error).message || "Could not load database list.",
          variant: "destructive",
        })
      }
      setIsLoadingDatabases(false)
    }
    fetchDatabases()
  }, [toast])

  // Fetch recent imports when the "recent" tab is active or after a successful import/creation
  const fetchRecentImports = useCallback(async () => {
    setIsLoadingRecent(true)
    try {
      // TODO: Aggiungere ordinamento per created_at DESC nel backend se possibile
      const response = await fetch("/api/components/?limit=5")
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || "Failed to fetch recent imports")
      }
      const data: GeneticComponentResponse[] = await response.json()
      setRecentImports(data)
    } catch (error) {
      console.error("Error fetching recent imports:", error)
      toast({
        title: "Error Fetching Recent Imports",
        description: (error as Error).message,
        variant: "destructive",
      })
      setRecentImports([]) // Pulisce in caso di errore
    } finally {
      setIsLoadingRecent(false)
    }
  }, [toast])

  useEffect(() => {
    if (activeTab === 'recent') {
      fetchRecentImports()
    }
  }, [activeTab, fetchRecentImports])

  // Handle search - chiama API backend
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a search term",
        variant: "destructive",
      })
      return
    }
    setIsLoadingResults(true)
    setSearchResults([]) // Clear previous results
    try {
      const params = new URLSearchParams({
        query: searchTerm,
        limit: "20", // O un valore configurabile
      })
      if (selectedDatabase !== "all") {
        params.append("database", selectedDatabase)
      }
      if (selectedType !== "all") {
        params.append("type", selectedType)
      }
      const response = await fetch(`/api/search/external?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Search request failed")
      }
      const data: ExternalComponentSearchResult[] = await response.json()
      setSearchResults(data)
      if (data.length === 0) {
        toast({
          title: "No Results",
          description: "Your search did not match any components.",
        })
      }
    } catch (error) {
      console.error("Error searching external databases:", error)
      toast({
        title: "Search Error",
        description: (error as Error).message || "An error occurred during the search.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingResults(false)
    }
  }, [searchTerm, selectedDatabase, selectedType, toast])

  // Handle import component from external search - chiama API backend
  const handleImportFromExternal = async (component: ExternalComponentSearchResult) => {
    setIsImportingExternal((prev: Record<string, boolean>) => ({ ...prev, [component.id]: true }))
    try {
      const response = await fetch("/api/search/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_id: component.id,
          database: component.database,
          type: component.type, // Assicura che questo 'type' sia quello atteso dal backend (es. promoter, gene)
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to import component")
      }
      const importedComponent: GeneticComponentResponse = await response.json()
      onAddComponent(importedComponent) // Passa il componente importato (dal nostro DB) al BioDesigner
      toast({
        title: "Component Imported",
        description: `${importedComponent.name} has been added to your workspace.`,
      })
      if (activeTab === 'recent') fetchRecentImports() // Aggiorna i recenti se il tab è attivo
      else if (recentImports.length > 0 || Object.keys(isImportingExternal).length > 0) fetchRecentImports() // O se ci sono stati import di recente
    } catch (error) {
      console.error("Error importing component:", error)
      toast({
        title: "Import Error",
        description: (error as Error).message || "Could not import the selected component.",
        variant: "destructive",
      })
    } finally {
      setIsImportingExternal((prev: Record<string, boolean>) => ({ ...prev, [component.id]: false }))
    }
  }

  // Handle import custom component - Tab "Import Sequence"
  const handleImportCustom = async () => {
    if (!importName.trim() || !importSequence.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and sequence for your custom component.",
        variant: "destructive",
      })
      return
    }
    setIsImportingCustom(true)
    try {
      const payload: GeneticComponentCreatePayload = {
        name: importName,
        component_type: importType, // Assicurarsi che questo valore sia uno di ComponentType enum del backend
        sequence: importSequence,
        description: importDescription.trim() || undefined, // Invia solo se c'è una descrizione
        properties: {
          experimental: importExperimental,
          // Aggiungere altre proprietà specifiche del tipo se necessario
          // es. if (importType === 'promoter') properties.strength = 'medium'; 
        },
      }

      const response = await fetch("/api/components/", { // Endpoint per creare componenti
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to create custom component")
      }

      const newComponent: GeneticComponentResponse = await response.json()
      onAddComponent(newComponent)
      toast({
        title: "Custom Component Created",
        description: `${newComponent.name} has been added to your workspace.`,
      })
      
      // Reset form fields
      setImportName("")
      setImportSequence("")
      setImportType("gene") // Reset to default type
      setImportDescription("")
      setImportExperimental(false)
      if (activeTab === 'recent') fetchRecentImports() // Aggiorna i recenti se il tab è attivo
      else fetchRecentImports() // Aggiorna sempre dopo una creazione custom

    } catch (error) {
      console.error("Error creating custom component:", error)
      toast({
        title: "Creation Error",
        description: (error as Error).message || "Could not create the custom component.",
        variant: "destructive",
      })
    } finally {
      setIsImportingCustom(false)
    }
  }

  // Helper per formattare la data
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric' 
      });
    } catch (e) {
      return dateString; // Fallback
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="search">Search Databases</TabsTrigger>
        <TabsTrigger value="import">Import Sequence</TabsTrigger>
        <TabsTrigger value="recent">Recent Imports</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="mt-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Search by name, ID, or keyword..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="flex-grow"
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
            />
            <Select value={selectedDatabase} onValueChange={setSelectedDatabase} disabled={isLoadingDatabases}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Database" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Databases</SelectItem>
                {availableDatabases.map((db: ExternalDatabase) => (
                  <SelectItem key={db.id} value={db.id}>{db.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                    {COMPONENT_TYPES.map((typeOption: ComponentTypeOption) => (
                        <SelectItem key={typeOption.value} value={typeOption.value}>{typeOption.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoadingResults || !searchTerm.trim()}>
              {isLoadingResults ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Search
            </Button>
          </div>

          {isLoadingResults && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Searching external databases...</p>
            </div>
          )}

          {!isLoadingResults && searchResults.length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Database</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((result: ExternalComponentSearchResult) => (
                    <TableRow key={`${result.database}-${result.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           {result.name}
                           {result.properties?.verified && <Badge variant="outline" className="text-green-600 border-green-600">Verified</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">ID: {result.id}</div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{result.type}</Badge></TableCell>
                      <TableCell>{result.database}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-default">{result.description || "N/A"}</span>
                            </TooltipTrigger>
                            {result.description && result.description.length > 50 && (
                               <TooltipContent side="bottom" className="max-w-md">
                                <p>{result.description}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleImportFromExternal(result)}
                                disabled={isImportingExternal[result.id]}
                              >
                                {isImportingExternal[result.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Add to Workspace</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* Questo link dovrebbe puntare alla pagina effettiva del componente nel database esterno */}
                              <a 
                                href={`#external-db/${result.database}/${result.id}`} // Placeholder Link
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="icon">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View on {result.database}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoadingResults && searchResults.length === 0 && searchTerm.trim() && (
             <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-semibold">No Results Found</h3>
                <p className="text-muted-foreground">
                    Your search for "{searchTerm}"
                    {selectedDatabase !== 'all' ? ` in ${availableDatabases.find((db: ExternalDatabase) => db.id === selectedDatabase)?.name}` : ''}
                    {selectedType !== 'all' ? ` for type "${selectedType}"` : ''}
                    did not return any results. Try a different query or broaden your filters.
                </p>
             </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="import" className="mt-4">
        <div className="space-y-4 max-w-lg mx-auto">
          <h3 className="text-lg font-medium">Import Custom Sequence</h3>
          <div>
            <Label htmlFor="import-name">Component Name</Label>
            <Input id="import-name" value={importName} onChange={(e: ChangeEvent<HTMLInputElement>) => setImportName(e.target.value)} placeholder="e.g., My Custom Promoter" disabled={isImportingCustom} />
          </div>
          <div>
            <Label htmlFor="import-type">Component Type</Label>
            <Select value={importType} onValueChange={setImportType} disabled={isImportingCustom}>
              <SelectTrigger id="import-type">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {COMPONENT_TYPES.filter(t => t.value !== 'all').map((typeOption: ComponentTypeOption) => (
                  <SelectItem key={typeOption.value} value={typeOption.value}>{typeOption.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="import-sequence">Sequence (DNA/RNA/Protein)</Label>
            <Textarea id="import-sequence" value={importSequence} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setImportSequence(e.target.value)} placeholder="Enter or paste sequence here..." rows={6} className="font-mono" disabled={isImportingCustom}/>
          </div>
          <div>
            <Label htmlFor="import-description">Description (Optional)</Label>
            <Textarea id="import-description" value={importDescription} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setImportDescription(e.target.value)} placeholder="Brief description of the component..." rows={3} disabled={isImportingCustom}/>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="import-experimental" checked={importExperimental} onCheckedChange={setImportExperimental} disabled={isImportingCustom} />
            <Label htmlFor="import-experimental">Mark as Experimental</Label>
          </div>
          <Button onClick={handleImportCustom} className="w-full" disabled={!importName.trim() || !importSequence.trim() || isImportingCustom}>
            {isImportingCustom ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} 
            Create and Add Component
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="recent" className="mt-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recently Added Components</h3>
            <Button variant="outline" size="sm" onClick={fetchRecentImports} disabled={isLoadingRecent}>
                {isLoadingRecent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh
            </Button>
          </div>
          
          {isLoadingRecent && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading recent components...</p>
            </div>
          )}

          {!isLoadingRecent && recentImports.length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    {/* <TableHead>Source</TableHead> // Potrebbe non essere disponibile direttamente */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentImports.map((item: GeneticComponentResponse) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.name} 
                        {item.properties?.experimental && <Badge variant="outline" className="ml-2">Experimental</Badge>}
                      </TableCell>
                      <TableCell><Badge variant="secondary">{item.component_type}</Badge></TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                      {/* <TableCell>{item.properties?.source || "N/A"}</TableCell> */}
                      <TableCell className="text-right">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => onAddComponent(item)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Add to Workspace</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoadingRecent && recentImports.length === 0 && (
            <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No components have been added recently.</p>
                <p className="text-xs text-muted-foreground mt-2">Try importing from external databases or creating a custom sequence.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
