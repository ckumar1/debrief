import React, { useState } from 'react';
import {
  getOpenTasks,
  getAllDecisions,
  getActiveProjects,
  searchAll,
} from '../lib/merge.js';

const styles = {
  container: {
    fontFamily: 'IBM Plex Mono, monospace',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#e2e8f0',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '10px 12px',
    background: '#0d1117',
    border: '1px solid #1a2030',
    borderRadius: '6px',
    userSelect: 'none',
  },
  sectionContent: {
    padding: '8px 12px 12px',
    background: '#0d1117',
    border: '1px solid #1a2030',
    borderTop: 'none',
    borderRadius: '0 0 6px 6px',
    marginTop: '-8px',
  },
  chevron: {
    color: '#94a3b8',
    fontSize: '12px',
    width: '16px',
  },
  taskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 0',
    borderBottom: '1px solid #1a2030',
    fontSize: '13px',
  },
  priorityBadge: {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    background: '#1a2030',
    color: '#f59e0b',
    whiteSpace: 'nowrap',
  },
  owner: {
    color: '#94a3b8',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  taskTitle: {
    color: '#e2e8f0',
    flex: 1,
  },
  decisionRow: {
    padding: '6px 0',
    borderBottom: '1px solid #1a2030',
    fontSize: '13px',
  },
  decisionText: {
    color: '#e2e8f0',
  },
  tag: {
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    background: '#1a2030',
    color: '#94a3b8',
    marginRight: '8px',
  },
  projectRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #1a2030',
    fontSize: '13px',
    color: '#e2e8f0',
  },
  mentionBadge: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    background: '#f59e0b',
    color: '#07090f',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px',
    background: '#07090f',
    border: '1px solid #1a2030',
    borderRadius: '6px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'IBM Plex Mono, monospace',
    outline: 'none',
    boxSizing: 'border-box',
  },
  resultGroup: {
    marginTop: '10px',
  },
  resultType: {
    color: '#f59e0b',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  resultItem: {
    color: '#e2e8f0',
    fontSize: '13px',
    padding: '4px 0',
    borderBottom: '1px solid #1a2030',
  },
  empty: {
    color: '#334155',
    fontSize: '13px',
    padding: '8px 0',
  },
};

const priorityLabels = ['P0', 'P1', 'P2', 'P3', 'P4'];

function Section({ title, defaultExpanded = true, children }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div>
      <div style={styles.sectionHeader} onClick={() => setExpanded(!expanded)}>
        <span style={styles.chevron}>{expanded ? '\u25BC' : '\u25B6'}</span>
        {title}
      </div>
      {expanded && <div style={styles.sectionContent}>{children}</div>}
    </div>
  );
}

export default function CrossMeeting({ meetings }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!meetings || meetings.length < 2) return null;

  const openTasks = getOpenTasks(meetings);
  const decisions = getAllDecisions(meetings);
  const activeProjects = getActiveProjects(meetings);
  const searchResults = searchQuery.trim() ? searchAll(meetings, searchQuery) : null;

  return (
    <div style={styles.container}>
      <Section title="Open Tasks">
        {openTasks.length === 0 ? (
          <div style={styles.empty}>No open tasks</div>
        ) : (
          openTasks.map((task, i) => (
            <div key={i} style={styles.taskRow}>
              <span style={styles.priorityBadge}>
                {priorityLabels[task.priority] || 'P2'}
              </span>
              {task.owner && <span style={styles.owner}>{task.owner}</span>}
              <span style={styles.taskTitle}>{task.title}</span>
            </div>
          ))
        )}
      </Section>

      <Section title="Decision Log">
        {decisions.length === 0 ? (
          <div style={styles.empty}>No decisions recorded</div>
        ) : (
          decisions.map((d, i) => (
            <div key={i} style={styles.decisionRow}>
              <span style={styles.tag}>
                {d.meetingName} {d.date ? `\u00B7 ${d.date}` : ''}
              </span>
              <span style={styles.decisionText}>{d.text}</span>
            </div>
          ))
        )}
      </Section>

      <Section title="Active Projects">
        {activeProjects.length === 0 ? (
          <div style={styles.empty}>No active projects</div>
        ) : (
          activeProjects.map((p, i) => (
            <div key={i} style={styles.projectRow}>
              <span>{p.name}</span>
              <span style={styles.mentionBadge}>{p.mentionCount} mentions</span>
            </div>
          ))
        )}
      </Section>

      <Section title="Search">
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search across all meetings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults && Object.keys(searchResults).length === 0 && (
          <div style={styles.empty}>No results found</div>
        )}
        {searchResults &&
          Object.entries(searchResults).map(([type, items]) => (
            <div key={type} style={styles.resultGroup}>
              <div style={styles.resultType}>{type}</div>
              {items.map((item, i) => (
                <div key={i} style={styles.resultItem}>
                  {item.text || item.title || JSON.stringify(item)}
                </div>
              ))}
            </div>
          ))}
      </Section>
    </div>
  );
}
