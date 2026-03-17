const PRIORITY_ORDER = ['TODAY', 'TOMORROW', 'THIS WEEK', 'UPCOMING', 'FUTURE'];

function priorityRank(priority) {
  const idx = PRIORITY_ORDER.indexOf(priority);
  return idx === -1 ? PRIORITY_ORDER.length : idx;
}

/**
 * Get all tasks across all meetings, sorted by priority.
 */
export function getAllTasks(meetings) {
  const tasks = [];
  for (const meeting of meetings) {
    if (!meeting.extracted?.tasks) continue;
    for (const task of meeting.extracted.tasks) {
      tasks.push({
        ...task,
        meetingTitle: meeting.extracted.meta?.title || meeting.name || 'Untitled',
        meetingDate: meeting.extracted.meta?.date || meeting.date || '',
        meetingId: meeting.id,
      });
    }
  }
  tasks.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
  return tasks;
}

/**
 * Get all open (not done) tasks across all meetings, sorted by priority.
 */
export function getOpenTasks(meetings) {
  return getAllTasks(meetings).filter((t) => !t.done);
}

/**
 * Get all decisions across all meetings, with meeting metadata attached.
 */
export function getAllDecisions(meetings) {
  const decisions = [];
  for (const meeting of meetings) {
    if (!meeting.extracted?.decisions) continue;
    const meetingTitle = meeting.extracted.meta?.title || meeting.name || 'Untitled';
    const meetingDate = meeting.extracted.meta?.date || meeting.date || '';
    for (const decision of meeting.extracted.decisions) {
      decisions.push({
        ...decision,
        meetingTitle,
        meetingDate,
        meetingId: meeting.id,
      });
    }
  }
  return decisions;
}

/**
 * Get projects that appear in 2 or more meetings, with mention count.
 * Projects are matched by lowercase name.
 */
export function getActiveProjects(meetings) {
  const projectMap = new Map();

  for (const meeting of meetings) {
    if (!meeting.extracted?.projects) continue;
    for (const project of meeting.extracted.projects) {
      const key = project.name.toLowerCase();
      if (!projectMap.has(key)) {
        projectMap.set(key, {
          ...project,
          mentionCount: 1,
          meetings: [meeting.id],
        });
      } else {
        const existing = projectMap.get(key);
        existing.mentionCount += 1;
        existing.meetings.push(meeting.id);
        // Keep the most recent version's data by overwriting
        // (assumes meetings are in chronological order)
        Object.assign(existing, {
          ...project,
          mentionCount: existing.mentionCount,
          meetings: existing.meetings,
        });
      }
    }
  }

  return Array.from(projectMap.values()).filter((p) => p.mentionCount >= 2);
}

/**
 * Search across all meetings' tasks, projects, decisions, and references.
 * Returns matches as [{ type, meeting, item }].
 */
export function searchAll(meetings, query) {
  if (!query || !query.trim()) return [];

  const q = query.toLowerCase();
  const results = [];

  for (const meeting of meetings) {
    const ext = meeting.extracted;
    if (!ext) continue;

    const meetingInfo = {
      id: meeting.id,
      title: ext.meta?.title || meeting.name || 'Untitled',
      date: ext.meta?.date || meeting.date || '',
    };

    // Search tasks
    if (ext.tasks) {
      for (const task of ext.tasks) {
        if (
          task.title?.toLowerCase().includes(q) ||
          task.detail?.toLowerCase().includes(q) ||
          task.owner?.toLowerCase().includes(q) ||
          task.tags?.some((t) => t.toLowerCase().includes(q))
        ) {
          results.push({ type: 'task', meeting: meetingInfo, item: task });
        }
      }
    }

    // Search projects
    if (ext.projects) {
      for (const project of ext.projects) {
        if (
          project.name?.toLowerCase().includes(q) ||
          project.summary?.toLowerCase().includes(q) ||
          project.context?.toLowerCase().includes(q)
        ) {
          results.push({ type: 'project', meeting: meetingInfo, item: project });
        }
      }
    }

    // Search decisions
    if (ext.decisions) {
      for (const decision of ext.decisions) {
        if (
          decision.title?.toLowerCase().includes(q) ||
          decision.reason?.toLowerCase().includes(q)
        ) {
          results.push({ type: 'decision', meeting: meetingInfo, item: decision });
        }
      }
    }

    // Search references
    if (ext.references) {
      for (const ref of ext.references) {
        if (
          ref.label?.toLowerCase().includes(q) ||
          ref.desc?.toLowerCase().includes(q) ||
          ref.tag?.toLowerCase().includes(q)
        ) {
          results.push({ type: 'reference', meeting: meetingInfo, item: ref });
        }
      }
    }
  }

  return results;
}
