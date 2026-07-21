import JournalEntries from '../widgets/JournalEntries'
import NoteCategories from '../widgets/NoteCategories'
import ChecklistCard from '../widgets/ChecklistCard'
import SubTabs from '../components/SubTabs'

export default function NotesPage() {
  return (
    <>
      <img className="page-title-img" src="/Dashboard-5/images/tab-titles/notes.png" alt="Notes" />
      <SubTabs
        storageKey="notes.subtab"
        tabs={[
          {
            key: 'journal',
            label: 'Journal',
            icon: '📖',
            content: (
              <div className="grid">
                <JournalEntries />
              </div>
            ),
          },
          {
            key: 'categories',
            label: 'Categories',
            icon: '📂',
            content: (
              <div className="grid">
                <NoteCategories />
              </div>
            ),
          },
          {
            key: 'lists',
            label: 'Lists',
            icon: '📝',
            content: (
              <div className="grid">
                <ChecklistCard icon="🎁" title="Gift Ideas" storageKey="notes.lists.gifts" placeholder="Idea + who it's for..." />
                <ChecklistCard icon="🎬" title="Movies & Shows to Watch" storageKey="notes.lists.watch" placeholder="Add a title..." />
                <ChecklistCard icon="📚" title="Books to Read" storageKey="notes.lists.books" placeholder="Add a title..." />
              </div>
            ),
          },
        ]}
      />
    </>
  )
}
