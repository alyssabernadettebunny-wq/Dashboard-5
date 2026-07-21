import GirlAppointments from '../widgets/GirlAppointments'
import GirlMemories from '../widgets/GirlMemories'
import ChecklistCard from '../widgets/ChecklistCard'
import SubTabs from '../components/SubTabs'

const DAUGHTERS = [
  { key: 'winnie', name: 'Winnie', icon: '🎀', birthdate: '2011-08-19' },
  { key: 'amy', name: 'Amy', icon: '⭐', birthdate: '2014-08-22' },
  { key: 'holly', name: 'Holly', icon: '🌸', birthdate: '2017-04-08' },
]

export default function GirlsPage() {
  return (
    <>
      <img className="page-title-img" src="/Dashboard-5/images/tab-titles/girls.png" alt="Girls" />
      <SubTabs
        storageKey="girls.subtab"
        tabs={DAUGHTERS.map((d) => ({
          key: d.key,
          label: d.name,
          icon: d.icon,
          content: (
            <div className="grid">
              <GirlAppointments name={d.name} storageKey={`girls.${d.key}.appointments`} birthdate={d.birthdate} />
              <ChecklistCard icon="⭐" title={`${d.name}'s Chores`} storageKey={`girls.${d.key}.chores`} placeholder={`Add a task for ${d.name}...`} />
              <GirlMemories name={d.name} storageKey={`girls.${d.key}`} />
            </div>
          ),
        }))}
      />
    </>
  )
}
