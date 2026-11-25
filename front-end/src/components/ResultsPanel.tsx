import { useEffect, useState } from 'react';
import type { Part } from '../lib/types';

interface Results {
  volume: number;
  mass: number;
  'cross-section': number;
  stress: number;
  safety: number;
  is_safe: boolean;
}

interface ResultsPanelProps {
  selectedPart: Part | null;
}

// results (or an error) for the part they were requested for
interface Outcome {
  part: Part;
  results: Results | null;
  error: string | null;
}

export function ResultsPanel({ selectedPart }: ResultsPanelProps) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    if (!selectedPart) return;

    const controller = new AbortController();
    const partData = {
      shape: selectedPart.shape,
      scale: {
        x: selectedPart.scale.x,
        y: selectedPart.scale.y,
        z: selectedPart.scale.z,
      },
      material: selectedPart.materialName,
    };

    fetch('http://127.0.0.1:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partData),
      signal: controller.signal,
    })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Could not calculate results');
        return data as Results;
      })
      .then(data => {
        setOutcome({ part: selectedPart, results: data, error: null });
      })
      .catch(reason => {
        if (reason.name !== 'AbortError') {
          const message = reason instanceof Error ? reason.message : 'Could not calculate results';
          setOutcome({ part: selectedPart, results: null, error: message });
        }
      });

    return () => controller.abort();
  }, [selectedPart]);

  // only show an outcome if it belongs to the part that's selected now
  const current = outcome && outcome.part === selectedPart ? outcome : null;
  const results = current?.results;

  return <section className="results-panel">
    <div>
      {!selectedPart && <p>Select a shape to view results.</p>}
      {selectedPart && !current && <p>Calculating...</p>}
      {current?.error && <p>{current.error}</p>}
      {results && <>
        <p>Volume: {results.volume.toFixed(2)} cm³</p>
        <p>Mass: {results.mass.toFixed(2)} g</p>
        <p>Cross-sectional Area: {results['cross-section'].toFixed(2)} cm²</p>
        <p>Stress: {results.stress.toFixed(4)} MPa</p>
        <p>Safety Factor: {results.safety.toFixed(2)}</p>
        <p>Status: {results.is_safe ? 'Safe' : 'Not safe'}</p>
      </>}
    </div>
  </section>;
}
