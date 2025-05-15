from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from scipy.integrate import solve_ivp
import logging
import math
import random
from datetime import datetime

from server.models.simulation import (
    SimulationMethod,
    SimulationParameter,
    TimeSeries,
    SimulationResults
)
from server.models.genetic_design import Node, Edge


logger = logging.getLogger(__name__)


class SimulationEngine:
    """
    Motore di simulazione per circuiti genetici.
    """
    
    @staticmethod
    def simulate_circuit(
        nodes: List[Node],
        edges: List[Edge],
        method: SimulationMethod,
        parameters: List[SimulationParameter],
        simulation_time: float = 100.0,
        time_points: int = 1000
    ) -> SimulationResults:
        """
        Simula un circuito genetico con il metodo specificato.
        
        Args:
            nodes: I nodi del circuito (promotori, geni, terminatori, ecc.)
            edges: Le connessioni tra i nodi
            method: Il metodo di simulazione (ODE, SSA, ecc.)
            parameters: I parametri della simulazione
            simulation_time: Il tempo totale di simulazione
            time_points: Il numero di punti temporali da registrare
            
        Returns:
            I risultati della simulazione
        """
        logger.info(f"Starting circuit simulation with method: {method}")
        
        # Converti i parametri in un dizionario
        param_dict = {p.name: p.value for p in parameters}
        
        # Seleziona il metodo di simulazione appropriato
        if method == SimulationMethod.ODE:
            time_series = SimulationEngine._simulate_ode(nodes, edges, param_dict, simulation_time, time_points)
        elif method == SimulationMethod.SSA:
            time_series = SimulationEngine._simulate_ssa(nodes, edges, param_dict, simulation_time, time_points)
        elif method == SimulationMethod.HYBRID:
            time_series = SimulationEngine._simulate_hybrid(nodes, edges, param_dict, simulation_time, time_points)
        elif method == SimulationMethod.FBA:
            time_series = SimulationEngine._simulate_fba(nodes, edges, param_dict, simulation_time, time_points)
        else:
            raise ValueError(f"Metodo di simulazione non supportato: {method}")
        
        # Calcola gli stati stazionari (ultimi 10% dei punti temporali)
        steady_states = {}
        time_values = time_series.time
        n_steady = max(1, int(len(time_values) * 0.1))
        
        for species, values in time_series.values.items():
            if len(values) >= n_steady:
                steady_states[species] = float(np.mean(values[-n_steady:]))
        
        # Calcola metriche aggiuntive
        metrics = SimulationEngine._calculate_metrics(time_series, nodes, edges)
        
        return SimulationResults(
            time_series=time_series,
            steady_states=steady_states,
            metrics=metrics
        )
    
    @staticmethod
    def _simulate_ode(
        nodes: List[Node],
        edges: List[Edge],
        parameters: Dict[str, float],
        simulation_time: float,
        time_points: int
    ) -> TimeSeries:
        """
        Simula il circuito utilizzando equazioni differenziali ordinarie.
        """
        # Estrai i componenti principali dal circuito
        promoters = [node for node in nodes if node.type == "promoter"]
        genes = [node for node in nodes if node.type == "gene"]
        regulators = [node for node in nodes if node.type == "regulatory"]
        
        # Crea un dizionario per tenere traccia delle connessioni
        connections = {}
        for edge in edges:
            if edge.target not in connections:
                connections[edge.target] = []
            connections[edge.target].append(edge.source)
        
        # Crea un elenco di specie per la simulazione
        species = []
        for gene in genes:
            species.append(f"mRNA_{gene.id}")
            species.append(f"Protein_{gene.id}")
        
        # Parametri di default che possono essere sovrascritti
        default_params = {
            "transcription_rate": 0.1,  # Tasso di trascrizione base
            "translation_rate": 0.1,    # Tasso di traduzione
            "mrna_degradation": 0.05,   # Tasso di degradazione mRNA
            "protein_degradation": 0.01, # Tasso di degradazione proteica
            "hill_coefficient": 2.0,    # Coefficiente di Hill per funzioni di regolazione
        }
        
        # Applica i parametri forniti, usando i valori di default per quelli mancanti
        sim_params = {**default_params, **parameters}
        
        # Stato iniziale (concentrazioni iniziali di tutte le specie)
        y0 = np.zeros(len(species))
        
        # Funzione per calcolare le derivate
        def circuit_ode(t, y):
            dydt = np.zeros_like(y)
            
            species_dict = {species[i]: y[i] for i in range(len(species))}
            
            # Calcola le derivate per ogni specie
            species_index = 0
            for gene in genes:
                # Indici per mRNA e proteina di questo gene
                mrna_idx = species_index
                protein_idx = species_index + 1
                
                # Calcola il tasso di trascrizione in base ai promotori e regolatori collegati
                transcription_rate = sim_params["transcription_rate"]
                
                # Verifica se il gene è connesso a un promotore
                if gene.id in connections:
                    for source_id in connections[gene.id]:
                        # Trova il nodo sorgente
                        source_node = next((n for n in nodes if n.id == source_id), None)
                        
                        if source_node and source_node.type == "promoter":
                            # Moltiplica il tasso di trascrizione per la forza del promotore
                            promoter_strength = {
                                "low": 0.3,
                                "medium": 1.0,
                                "high": 3.0,
                                "very high": 10.0
                            }.get(source_node.data.get("strength", "medium"), 1.0)
                            
                            transcription_rate *= promoter_strength
                            
                            # Se il promotore è inducibile, verifica la presenza di induttori
                            if source_node.data.get("inducible", False):
                                # Qui si potrebbe aggiungere la logica per gli induttori
                                pass
                
                # Calcola l'effetto dei regolatori
                regulation_factor = 1.0
                for regulator in regulators:
                    if gene.id in connections and regulator.id in connections[gene.id]:
                        regulator_type = regulator.data.get("function", "")
                        strength = regulator.data.get("strengthValue", 50) / 100.0
                        
                        if regulator_type == "activation":
                            # Attivatore: aumenta la trascrizione
                            regulation_factor *= (1.0 + strength)
                        elif regulator_type == "repression":
                            # Repressore: diminuisce la trascrizione
                            regulation_factor *= (1.0 - strength)
                
                # Equazione per mRNA: produzione - degradazione
                mrna_conc = y[mrna_idx]
                dydt[mrna_idx] = transcription_rate * regulation_factor - sim_params["mrna_degradation"] * mrna_conc
                
                # Equazione per proteina: traduzione di mRNA - degradazione
                protein_conc = y[protein_idx]
                dydt[protein_idx] = sim_params["translation_rate"] * mrna_conc - sim_params["protein_degradation"] * protein_conc
                
                species_index += 2
            
            return dydt
        
        # Risolvi le ODE
        t_eval = np.linspace(0, simulation_time, time_points)
        sol = solve_ivp(
            circuit_ode,
            (0, simulation_time),
            y0,
            method="RK45",
            t_eval=t_eval,
            rtol=1e-6,
            atol=1e-9
        )
        
        # Crea la serie temporale dai risultati
        time_values = sol.t.tolist()
        values_dict = {}
        
        for i, species_name in enumerate(species):
            values_dict[species_name] = sol.y[i].tolist()
        
        # Aggiungi anche concentrazioni solo per le proteine reporter
        for gene in genes:
            if gene.data.get("function") == "reporter":
                reporter_name = gene.data.get("name", gene.id)
                protein_idx = species.index(f"Protein_{gene.id}")
                values_dict[reporter_name] = sol.y[protein_idx].tolist()
        
        return TimeSeries(time=time_values, values=values_dict)
    
    @staticmethod
    def _simulate_ssa(
        nodes: List[Node],
        edges: List[Edge],
        parameters: Dict[str, float],
        simulation_time: float,
        time_points: int
    ) -> TimeSeries:
        """
        Simula il circuito utilizzando l'algoritmo di simulazione stocastica (Gillespie).
        """
        # Per ora utilizziamo una versione semplificata che aggiunge rumore alla simulazione ODE
        ode_result = SimulationEngine._simulate_ode(nodes, edges, parameters, simulation_time, time_points)
        
        # Aggiungi rumore alle traiettorie
        noisy_values = {}
        
        for species, values in ode_result.values.items():
            # Calcola il livello di rumore (proporzionale alla radice quadrata della concentrazione)
            noise_level = [max(0.1, math.sqrt(max(0.1, v))) * 0.1 for v in values]
            
            # Aggiungi rumore a ogni punto
            noisy_values[species] = [
                max(0, v + random.gauss(0, noise) * (1.0 + 0.1 * random.random()))
                for v, noise in zip(values, noise_level)
            ]
        
        return TimeSeries(time=ode_result.time, values=noisy_values)
    
    @staticmethod
    def _simulate_hybrid(
        nodes: List[Node],
        edges: List[Edge],
        parameters: Dict[str, float],
        simulation_time: float,
        time_points: int
    ) -> TimeSeries:
        """
        Simula il circuito utilizzando un approccio ibrido (ODE per specie abbondanti, SSA per specie rare).
        """
        # Per semplicità, per ora utilizziamo una combinazione delle simulazioni ODE e SSA
        ode_result = SimulationEngine._simulate_ode(nodes, edges, parameters, simulation_time, time_points)
        ssa_result = SimulationEngine._simulate_ssa(nodes, edges, parameters, simulation_time, time_points)
        
        # Combina i risultati per creare un effetto ibrido
        hybrid_values = {}
        
        for species in ode_result.values.keys():
            ode_values = ode_result.values[species]
            ssa_values = ssa_result.values[species]
            
            # Usa ODE per concentrazioni alte e SSA per concentrazioni basse
            threshold = np.mean(ode_values) * 0.5
            hybrid_values[species] = [
                ssa_v if ode_v < threshold else ode_v
                for ode_v, ssa_v in zip(ode_values, ssa_values)
            ]
        
        return TimeSeries(time=ode_result.time, values=hybrid_values)
    
    @staticmethod
    def _simulate_fba(
        nodes: List[Node],
        edges: List[Edge],
        parameters: Dict[str, float],
        simulation_time: float,
        time_points: int
    ) -> TimeSeries:
        """
        Simula il circuito utilizzando l'analisi del bilancio dei flussi (FBA).
        """
        # FBA è più adatto per network metabolici, per ora usiamo un approccio semplificato
        # che simula uno stato stazionario con piccole variazioni
        
        # Simula uno stato stazionario con ODE
        ode_result = SimulationEngine._simulate_ode(nodes, edges, parameters, simulation_time, time_points // 10)
        
        # Estendi il risultato per coprire tutti i punti temporali richiesti
        time_values = np.linspace(0, simulation_time, time_points).tolist()
        extended_values = {}
        
        for species, values in ode_result.values.items():
            # Estrai l'ultimo valore (stato stazionario)
            steady_value = values[-1]
            
            # Crea piccole fluttuazioni attorno allo stato stazionario
            extended_values[species] = [
                max(0, steady_value * (1.0 + random.gauss(0, 0.05)))
                for _ in range(time_points)
            ]
        
        return TimeSeries(time=time_values, values=extended_values)
    
    @staticmethod
    def _calculate_metrics(time_series: TimeSeries, nodes: List[Node], edges: List[Edge]) -> Dict[str, Any]:
        """
        Calcola metriche aggiuntive dai risultati della simulazione.
        """
        metrics = {}
        
        # Estrai i geni reporter dal circuito
        reporter_genes = [node for node in nodes if node.type == "gene" and node.data.get("function") == "reporter"]
        
        if reporter_genes:
            # Calcola metriche per ogni gene reporter
            reporter_metrics = {}
            
            for gene in reporter_genes:
                reporter_name = gene.data.get("name", gene.id)
                
                # Cerca il reporter nei valori della serie temporale
                if reporter_name in time_series.values:
                    values = time_series.values[reporter_name]
                    
                    # Calcola statistiche di base
                    reporter_metrics[reporter_name] = {
                        "max": max(values),
                        "min": min(values),
                        "mean": sum(values) / len(values),
                        "final": values[-1],
                        "rise_time": SimulationEngine._calculate_rise_time(time_series.time, values),
                        "settling_time": SimulationEngine._calculate_settling_time(time_series.time, values),
                    }
            
            metrics["reporters"] = reporter_metrics
        
        # Calcola la complessità del circuito
        metrics["circuit_complexity"] = {
            "node_count": len(nodes),
            "edge_count": len(edges),
            "promoter_count": len([n for n in nodes if n.type == "promoter"]),
            "gene_count": len([n for n in nodes if n.type == "gene"]),
            "regulatory_count": len([n for n in nodes if n.type == "regulatory"]),
        }
        
        return metrics
    
    @staticmethod
    def _calculate_rise_time(time: List[float], values: List[float]) -> float:
        """
        Calcola il tempo di salita (10% -> 90% del valore finale).
        """
        if not values or max(values) - min(values) < 1e-6:
            return 0.0
        
        final_value = values[-1]
        initial_value = values[0]
        value_range = final_value - initial_value
        
        if abs(value_range) < 1e-6:
            return 0.0
        
        threshold_10 = initial_value + 0.1 * value_range
        threshold_90 = initial_value + 0.9 * value_range
        
        t_10 = next((time[i] for i in range(len(values)) if values[i] >= threshold_10), time[-1])
        t_90 = next((time[i] for i in range(len(values)) if values[i] >= threshold_90), time[-1])
        
        return t_90 - t_10
    
    @staticmethod
    def _calculate_settling_time(time: List[float], values: List[float], threshold: float = 0.05) -> float:
        """
        Calcola il tempo di assestamento (quando il valore rimane entro il 5% del valore finale).
        """
        if not values:
            return 0.0
        
        final_value = values[-1]
        threshold_value = threshold * abs(final_value)
        
        # Vai all'indietro per trovare il primo punto che è fuori dalla banda di tolleranza
        for i in range(len(values) - 1, 0, -1):
            if abs(values[i] - final_value) > threshold_value:
                return time[i + 1] if i + 1 < len(time) else time[-1]
        
        return time[0] 