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

export function ResultsPanel({ selectedPart }: ResultsPanelProps) {
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPart) {
      setResults(null);
      setError(null);
      return;
    }

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
        setResults(data);
        setError(null);
      })
      .catch(reason => {
        if (reason.name !== 'AbortError') {
          setResults(null);
          setError(reason instanceof Error ? reason.message : 'Could not calculate results');
        }
      });

    return () => controller.abort();
  }, [selectedPart]);

  return <section className="results-panel">
    <div>
      {error && <p>{error}</p>}
      {!selectedPart && <p>Select a shape to view results.</p>}
      {results && <>
        <p>Volume: {results.volume}</p>
        <p>Mass: {results.mass}</p>
        <p>Cross-sectional Area: {results['cross-section']}</p>
        <p>Stress: {results.stress}</p>
        <p>Safety Factor: {results.safety}</p>
      </>}
    </div>
  </section>;
}
