import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

const PHASES = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal', 'PMDD']
const SYMPTOMS = ['Cramps', 'Bloating', 'Breast Tenderness', 'Moodiness', 'Energy', 'Skin Changes']

const DEFAULT_LEVELS: Record<string, Record<string, number>> = {
  Cramps: { Menstrual: 3, Follicular: 0, Ovulation: 0, Luteal: 1, PMDD: 3 },
  Bloating: { Menstrual: 2, Follicular: 0, Ovulation: 1, Luteal: 2, PMDD: 3 },
  'Breast Tenderness': { Menstrual: 0, Follicular: 0, Ovulation: 1, Luteal: 2, PMDD: 2 },
  Moodiness: { Menstrual: 1, Follicular: 0, Ovulation: 0, Luteal: 2, PMDD: 3 },
  Energy: { Menstrual: 0, Follicular: 3, Ovulation: 3, Luteal: 1, PMDD: 0 },
  'Skin Changes': { Menstrual: 1, Follicular: 0, Ovulation: 0, Luteal: 2, PMDD: 2 },
}

function cycleLevel(level: number) {
  return (level + 1) % 4
}

export default function SymptomsByPhase() {
  const [levels, setLevels] = useLocalStorage('bodyweather.cycle.symptomsByPhase', DEFAULT_LEVELS)

  function bump(symptom: string, phase: string) {
    setLevels({
      ...levels,
      [symptom]: { ...levels[symptom], [phase]: cycleLevel(levels[symptom]?.[phase] ?? 0) },
    })
  }

  return (
    <Card icon="📈" title="5. Symptoms by Phase (What's typical for you)" wide surface="lilac">
      <div className="symptoms-phase-table-wrap">
        <table className="symptoms-phase-table">
          <thead>
            <tr>
              <th>Symptom</th>
              {PHASES.map((p) => (
                <th key={p}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SYMPTOMS.map((symptom) => (
              <tr key={symptom}>
                <td className="symptom-name">{symptom}</td>
                {PHASES.map((phase) => {
                  const level = levels[symptom]?.[phase] ?? 0
                  return (
                    <td key={phase}>
                      <button className="symptom-dots" onClick={() => bump(symptom, phase)} aria-label={`${symptom} in ${phase}`}>
                        {[0, 1, 2].map((i) => (
                          <span key={i} className={`symptom-dot level-${level} ${i < level ? 'filled' : ''}`} />
                        ))}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="symptoms-phase-legend">
        <span>
          <span className="symptom-dot-sample level-0" /> None
        </span>
        <span>
          <span className="symptom-dot-sample level-1" /> Mild
        </span>
        <span>
          <span className="symptom-dot-sample level-2" />
          <span className="symptom-dot-sample level-2" /> Moderate
        </span>
        <span>
          <span className="symptom-dot-sample level-3" />
          <span className="symptom-dot-sample level-3" />
          <span className="symptom-dot-sample level-3" /> High
        </span>
      </div>
    </Card>
  )
}
