import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Contact {
  id: string
  name: string
  relation: string
  phone: string
}

interface SizeNote {
  id: string
  person: string
  note: string
}

interface DateEntry {
  id: string
  name: string
  date: string
  occasion: string
}

export default function ReferenceInfo() {
  const [contacts, setContacts] = useLocalStorage<Contact[]>('reference.contacts', [])
  const [sizes, setSizes] = useLocalStorage<SizeNote[]>('reference.sizes', [])
  const [dates, setDates] = useLocalStorage<DateEntry[]>('reference.dates', [])

  const [contactName, setContactName] = useState('')
  const [contactRelation, setContactRelation] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const [sizePerson, setSizePerson] = useState('')
  const [sizeNote, setSizeNote] = useState('')

  const [dateName, setDateName] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [dateOccasion, setDateOccasion] = useState('')

  function addContact() {
    if (!contactName.trim()) return
    setContacts([...contacts, { id: crypto.randomUUID(), name: contactName.trim(), relation: contactRelation.trim(), phone: contactPhone.trim() }])
    setContactName('')
    setContactRelation('')
    setContactPhone('')
  }

  function addSize() {
    if (!sizePerson.trim() || !sizeNote.trim()) return
    setSizes([...sizes, { id: crypto.randomUUID(), person: sizePerson.trim(), note: sizeNote.trim() }])
    setSizePerson('')
    setSizeNote('')
  }

  function addDate() {
    if (!dateName.trim()) return
    setDates(
      [...dates, { id: crypto.randomUUID(), name: dateName.trim(), date: dateValue, occasion: dateOccasion.trim() }].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    )
    setDateName('')
    setDateValue('')
    setDateOccasion('')
  }

  return (
    <Card icon="📇" title="Reference Info" wide>
      <div className="status-cols">
        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            Important Contacts
          </p>
          <div className="c-input-row" style={{ flexDirection: 'column' }}>
            <input type="text" placeholder="Name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            <input type="text" placeholder="Relation (doctor, school...)" value={contactRelation} onChange={(e) => setContactRelation(e.target.value)} />
            <input type="text" placeholder="Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            <button onClick={addContact}>Add</button>
          </div>
          <ul className="c-list">
            {contacts.length === 0 && <li className="c-empty">No contacts saved yet</li>}
            {contacts.map((c) => (
              <li key={c.id} className="c-list-item">
                <div>
                  <strong style={{ fontSize: 12 }}>{c.name}</strong>
                  {c.relation && <span className="sub" style={{ marginLeft: 6 }}>{c.relation}</span>}
                  {c.phone && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{c.phone}</p>}
                </div>
                <button className="remove" onClick={() => setContacts(contacts.filter((x) => x.id !== c.id))} aria-label="Remove">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            Sizes & Preferences
          </p>
          <div className="c-input-row">
            <input type="text" placeholder="Who" value={sizePerson} onChange={(e) => setSizePerson(e.target.value)} style={{ maxWidth: 90 }} />
            <input type="text" placeholder="Size, allergy, favorite color..." value={sizeNote} onChange={(e) => setSizeNote(e.target.value)} />
            <button onClick={addSize}>Add</button>
          </div>
          <ul className="c-list">
            {sizes.length === 0 && <li className="c-empty">Nothing saved yet</li>}
            {sizes.map((s) => (
              <li key={s.id} className="c-list-item">
                <strong style={{ fontSize: 12 }}>{s.person}:</strong>
                <span>{s.note}</span>
                <button className="remove" onClick={() => setSizes(sizes.filter((x) => x.id !== s.id))} aria-label="Remove">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            Important Dates
          </p>
          <div className="c-input-row" style={{ flexDirection: 'column' }}>
            <input type="text" placeholder="Name" value={dateName} onChange={(e) => setDateName(e.target.value)} />
            <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} />
            <input type="text" placeholder="Occasion (birthday, anniversary...)" value={dateOccasion} onChange={(e) => setDateOccasion(e.target.value)} />
            <button onClick={addDate}>Add</button>
          </div>
          <ul className="c-list">
            {dates.length === 0 && <li className="c-empty">No dates saved yet</li>}
            {dates.map((d) => (
              <li key={d.id} className="c-list-item">
                <strong style={{ fontSize: 12 }}>{d.name}</strong>
                {d.date && <span className="sub" style={{ marginLeft: 0 }}>{d.date}</span>}
                {d.occasion && <span>{d.occasion}</span>}
                <button className="remove" onClick={() => setDates(dates.filter((x) => x.id !== d.id))} aria-label="Remove">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
