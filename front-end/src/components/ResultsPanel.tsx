import results from '../../../back-end/dummy.json'

export function ResultsPanel() {
  return <section className="results-panel">
    <div>
    <p>Volume: {results['volume']}</p>
    <p>Mass: {results['mass']}</p>
    <p>Cross-sectional Area: {results['cross-section']}</p>
    <p>Stress: {results['stress']}</p>
    <p>Safety Factor: {results['safety']}</p>
    </div>
    </section>
}
