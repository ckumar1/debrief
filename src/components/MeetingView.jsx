import React, { useState } from 'react';
import Tasks from './tabs/Tasks';
import Projects from './tabs/Projects';
import Architecture from './tabs/Architecture';
import Decisions from './tabs/Decisions';
import References from './tabs/References';
import MindMap from './tabs/MindMap';
import { getParticipantStyle, getParticipantInitials } from '../lib/colors.js';

const TABS = ['Tasks', 'Projects', 'Architecture', 'Decisions', 'References', 'Mind Map'];

const styles = {
  container: {
    fontFamily: 'IBM Plex Mono, monospace',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    fontFamily: 'IBM Plex Mono, monospace',
    cursor: 'pointer',
    padding: '0 0 16px',
    display: 'inline-block',
  },
  title: {
    color: '#e2e8f0',
    fontSize: '22px',
    fontWeight: 700,
    margin: '0 0 4px',
  },
  meta: {
    color: '#94a3b8',
    fontSize: '13px',
    margin: '0 0 20px',
  },
  quickStart: {
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '14px 16px',
    marginBottom: '24px',
    color: '#f59e0b',
    fontSize: '14px',
    lineHeight: '1.5',
    background: 'rgba(245, 158, 11, 0.05)',
  },
  tabBar: {
    display: 'flex',
    gap: '0',
    borderBottom: '1px solid #1a2030',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#94a3b8',
    fontSize: '13px',
    fontFamily: 'IBM Plex Mono, monospace',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid #f59e0b',
    color: '#f59e0b',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'IBM Plex Mono, monospace',
    cursor: 'pointer',
  },
};

const TAB_COMPONENTS = {
  Tasks,
  Projects,
  Architecture,
  Decisions,
  References,
  'Mind Map': MindMap,
};

export default function MeetingView({ meeting, onBack, onToggleTask, onReprocess }) {
  const [activeTab, setActiveTab] = useState('Tasks');

  const extracted = meeting.extracted || {};
  const meta = extracted.meta || {};
  const title = meta.title || meeting.fileName || 'Untitled Meeting';
  const date = meeting.importedAt
    ? new Date(meeting.importedAt).toLocaleDateString()
    : '';
  const participants = (meta.participants || []).join(', ');
  const quickStart = extracted.quickStart;

  const TabComponent = TAB_COMPONENTS[activeTab];

  const summary = extracted.summary;

  const tabProps = {
    Tasks: { tasks: extracted.tasks || [], onToggleTask },
    Projects: { projects: extracted.projects || [] },
    Architecture: { architecture: extracted.architecture || {} },
    Decisions: { decisions: extracted.decisions || [] },
    References: { references: extracted.references || [] },
    'Mind Map': { extracted },
  };

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={onBack}>
        &larr; Library
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ ...styles.title, flex: 1 }}>{title}</h1>
        {onReprocess && (
          <button
            onClick={() => onReprocess(meeting.id)}
            disabled={meeting.status === 'processing'}
            style={{
              background: 'transparent',
              border: '1px solid #1a2030',
              borderRadius: 6,
              padding: '6px 12px',
              color: meeting.status === 'processing' ? '#334155' : '#94a3b8',
              fontSize: 12,
              fontFamily: 'IBM Plex Mono, monospace',
              cursor: meeting.status === 'processing' ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
            }}
            title="Re-run Claude extraction on the original transcript"
          >
            {meeting.status === 'processing' ? '⟳ Processing...' : '⟳ Re-process'}
          </button>
        )}
      </div>
      <div style={{ ...styles.meta, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span>{date}</span>
        {(meta.participants || []).length > 0 && (
          <>
            <span>{'\u00B7'}</span>
            <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
              {(meta.participants || []).map((name) => (
                <span key={name} style={getParticipantStyle(name)} title={name}>
                  {getParticipantInitials(name)}
                </span>
              ))}
            </span>
            <span>{participants}</span>
          </>
        )}
      </div>

      {summary && (
        <div style={{
          background: '#0d1117',
          border: '1px solid #1a2030',
          borderRadius: 8,
          padding: '16px 18px',
          marginBottom: 16,
          color: '#94a3b8',
          fontSize: 13,
          lineHeight: 1.6,
        }}>
          <div style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Summary</div>
          {summary}
        </div>
      )}

      {quickStart && (
        <div style={styles.quickStart}>
          <span style={{ fontWeight: 600 }}>Next action: </span>{quickStart}
        </div>
      )}

      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab}
            style={activeTab === tab ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {TabComponent && <TabComponent {...tabProps[activeTab]} />}
    </div>
  );
}
