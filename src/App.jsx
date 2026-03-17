import { useState, useEffect, useCallback } from 'react'
import { load, save, addMeeting, updateMeeting } from './lib/storage'
import { extractTranscript } from './lib/claude'
import Library from './components/Library'
import MeetingView from './components/MeetingView'
import ImportPaste from './components/ImportPaste'
import ImportDrive from './components/ImportDrive'
import './index.css'

function App() {
  const [data, setData] = useState(() => load())
  const [screen, setScreen] = useState('library')
  const [selectedMeetingId, setSelectedMeetingId] = useState(null)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [showDriveModal, setShowDriveModal] = useState(false)

  useEffect(() => {
    save(data)
  }, [data])

  const processMeeting = useCallback(async (meetingId, rawText) => {
    try {
      const extracted = await extractTranscript(rawText)
      setData(prev => {
        const updated = { ...prev, meetings: prev.meetings.map(m =>
          m.id === meetingId ? { ...m, status: 'done', extracted } : m
        )}
        return updated
      })
    } catch (err) {
      setData(prev => {
        const updated = { ...prev, meetings: prev.meetings.map(m =>
          m.id === meetingId ? { ...m, status: 'error', error: err.message } : m
        )}
        return updated
      })
    }
  }, [])

  const handlePasteImport = useCallback((text, fileName) => {
    const meeting = {
      id: crypto.randomUUID(),
      importedAt: new Date().toISOString(),
      source: 'paste',
      fileName: fileName || 'Untitled Meeting',
      raw: text,
      status: 'processing',
      extracted: null,
    }
    setData(prev => ({ ...prev, meetings: [...prev.meetings, meeting] }))
    setShowPasteModal(false)
    processMeeting(meeting.id, text)
  }, [processMeeting])

  const handleDriveImport = useCallback((text, fileName, driveFileId) => {
    const meeting = {
      id: crypto.randomUUID(),
      importedAt: new Date().toISOString(),
      source: 'drive',
      fileName: fileName || 'Drive Import',
      driveFileId,
      raw: text,
      status: 'processing',
      extracted: null,
    }
    setData(prev => ({ ...prev, meetings: [...prev.meetings, meeting] }))
    setShowDriveModal(false)
    processMeeting(meeting.id, text)
  }, [processMeeting])

  const handleToggleTask = useCallback((taskId) => {
    setData(prev => {
      const updated = { ...prev, meetings: prev.meetings.map(m => {
        if (!m.extracted?.tasks) return m
        const taskIdx = m.extracted.tasks.findIndex(t => t.id === taskId)
        if (taskIdx === -1) return m
        const newTasks = [...m.extracted.tasks]
        newTasks[taskIdx] = { ...newTasks[taskIdx], done: !newTasks[taskIdx].done }
        return { ...m, extracted: { ...m.extracted, tasks: newTasks } }
      })}
      return updated
    })
  }, [])

  const handleReprocess = useCallback((meetingId) => {
    const meeting = data.meetings.find(m => m.id === meetingId)
    if (!meeting?.raw) return
    setData(prev => ({
      ...prev,
      meetings: prev.meetings.map(m =>
        m.id === meetingId ? { ...m, status: 'processing', error: undefined } : m
      ),
    }))
    processMeeting(meetingId, meeting.raw)
  }, [data.meetings, processMeeting])

  const selectedMeeting = data.meetings.find(m => m.id === selectedMeetingId)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      {screen === 'library' && (
        <>
          <Library
            meetings={data.meetings}
            onSelectMeeting={(id) => {
              setSelectedMeetingId(id)
              setScreen('meeting')
            }}
            onImportPaste={() => setShowPasteModal(true)}
            onImportDrive={() => setShowDriveModal(true)}
          />
          {showPasteModal && (
            <ImportPaste
              onImport={handlePasteImport}
              onClose={() => setShowPasteModal(false)}
            />
          )}
          {showDriveModal && (
            <ImportDrive
              onImport={handleDriveImport}
              onClose={() => setShowDriveModal(false)}
            />
          )}
        </>
      )}
      {screen === 'meeting' && selectedMeeting && (
        <MeetingView
          meeting={selectedMeeting}
          onBack={() => {
            setScreen('library')
            setSelectedMeetingId(null)
          }}
          onToggleTask={handleToggleTask}
          onReprocess={handleReprocess}
        />
      )}
    </div>
  )
}

export default App
