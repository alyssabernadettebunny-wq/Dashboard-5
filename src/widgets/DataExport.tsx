import Card from '../components/Card'

function downloadBackup() {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    try {
      data[key] = JSON.parse(localStorage.getItem(key) as string)
    } catch {
      data[key] = localStorage.getItem(key)
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `alyssa-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function DataExport() {
  return (
    <Card icon="💾" title="Data Backup">
      <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
        Everything on this dashboard lives in your browser only. Download a backup file every so often so you never
        lose it — especially before clearing your browser data or switching devices.
      </p>
      <button className="card-footer-btn" onClick={downloadBackup}>
        Download my data ♡
      </button>
    </Card>
  )
}
