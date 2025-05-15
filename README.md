# BioDesigner: Synthetic Biology Design Tool

BioDesigner è uno strumento avanzato per la progettazione, simulazione e ottimizzazione di circuiti genetici. Questa applicazione fornisce un'interfaccia utente intuitiva per creare e testare nuovi design genetici, con potenti strumenti di analisi delle sequenze.

## Architettura

L'applicazione è composta da:

- **Frontend**: Un'interfaccia utente sviluppata con Next.js e React, che offre un ambiente di design visuale per i circuiti genetici
- **Backend**: Un server Python sviluppato con FastAPI che fornisce API per la gestione dei componenti, design, simulazioni e analisi di sequenze

## Funzionalità principali

- **Design visuale di circuiti genetici**: Interfaccia drag-and-drop per la composizione di circuiti genetici
- **Simulazione di circuiti**: Simulazione dinamica del comportamento dei circuiti genetici
- **Validazione di sequenze**: Analisi di sequenze genetiche per rilevare potenziali problemi
- **Ottimizzazione codoni**: Ottimizzazione delle sequenze di DNA per diversi organismi ospiti
- **Database di componenti**: Libreria di componenti genetici riutilizzabili

## Requisiti

- Python 3.8+
- MongoDB
- Node.js 18+ (per il frontend)

## Installazione

### Backend Python

1. Installa le dipendenze Python:

```bash
pip install -r requirements.txt
```

2. Avvia il server:

```bash
python -m server.main
```

Il server sarà disponibile all'indirizzo http://localhost:8000 e la documentazione API sarà accessibile all'indirizzo http://localhost:8000/api/docs.

### Frontend

1. Installa le dipendenze:

```bash
npm install
```

2. Avvia il server di sviluppo:

```bash
npm run dev
```

L'interfaccia utente sarà disponibile all'indirizzo http://localhost:3000.

## Struttura del progetto

### Backend

```
server/
  ├── config/            # Configurazione (database, settings)
  ├── controllers/       # API endpoints
  ├── models/            # Modelli di dati e schemi
  ├── repositories/      # Accesso al database
  ├── services/          # Logica di business
  └── main.py            # Entry point dell'applicazione
```

### Frontend

```
app/                     # Componenti Next.js 
components/              # Componenti React riutilizzabili
public/                  # File statici
styles/                  # Stili CSS
```

## API

Il backend espone le seguenti API principali:

- `/api/components` - Gestione dei componenti genetici
- `/api/designs` - Gestione dei design genetici
- `/api/simulations` - Simulazioni di circuiti genetici
- `/api/sequences` - Analisi e ottimizzazione di sequenze

 