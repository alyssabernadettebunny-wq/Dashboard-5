import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Bill {
  id: string
  name: string
  amount: string
  dueDate: string
  paid: boolean
  autopay: boolean
  recurring: boolean
}

export default function BillsTracker() {
  const [bills, setBills] = useLocalStorage<Bill[]>('money.bills', [])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recurring, setRecurring] = useState(true)

  function addBill() {
    if (!name.trim()) return
    setBills(
      [...bills, { id: crypto.randomUUID(), name: name.trim(), amount, dueDate, paid: false, autopay: false, recurring }].sort(
        (a, b) => a.dueDate.localeCompare(b.dueDate)
      )
    )
    setName('')
    setAmount('')
    setDueDate('')
    setRecurring(true)
  }

  function updateBill(id: string, patch: Partial<Bill>) {
    setBills(bills.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function removeBill(id: string) {
    setBills(bills.filter((b) => b.id !== id))
  }

  const unpaidCount = bills.filter((b) => !b.paid).length

  return (
    <Card icon="🧾" title="Bills & Due Dates" meta={bills.length ? `${unpaidCount} unpaid` : undefined} wide>
      <div className="c-input-row">
        <input type="text" placeholder="Bill name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="$ Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ maxWidth: 100 }} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} /> Recurring
        </label>
        <button onClick={addBill}>Add</button>
      </div>
      <ul className="c-list">
        {bills.length === 0 && <li className="c-empty">No bills tracked yet</li>}
        {bills.map((b) => (
          <li key={b.id} className={`c-list-item ${b.paid ? 'struck' : ''}`}>
            <input type="checkbox" checked={b.paid} onChange={(e) => updateBill(b.id, { paid: e.target.checked })} />
            <span style={{ minWidth: 100 }}>{b.name}</span>
            {b.amount && <span className="sub" style={{ marginLeft: 0 }}>${b.amount}</span>}
            {b.dueDate && <span className="sub" style={{ marginLeft: 0 }}>Due {b.dueDate}</span>}
            {b.recurring && <span className="sub" style={{ marginLeft: 0 }}>↻ recurring</span>}
            <label style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: 'var(--text-muted)', marginLeft: 'auto' }}>
              <input type="checkbox" checked={b.autopay} onChange={(e) => updateBill(b.id, { autopay: e.target.checked })} /> autopay
            </label>
            <button className="remove" onClick={() => removeBill(b.id)} aria-label="Remove">
              ×
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
