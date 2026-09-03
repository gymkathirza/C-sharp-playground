import { useState } from "react";
import { LESSONS, type Lesson } from "../lib/lessons";

type Props = {
  activeLesson: string | null;
  onSelectLesson: (lesson: Lesson) => void;
};

export function LessonsPanel({ activeLesson, onSelectLesson }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="lessons" aria-labelledby="lessons-h">
      <div className="lessons-header">
        <h2 id="lessons-h">Lessons</h2>
        <button
          type="button"
          className="collapsible-toggle"
          aria-label={collapsed ? "Expand lessons" : "Collapse lessons"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "▶" : "▼"}
        </button>
      </div>
      {!collapsed && (
        <div role="list" aria-label="Learning lessons">
          {LESSONS.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              className={`lesson-btn ${activeLesson === lesson.id ? "active" : ""}`}
              role="listitem"
              aria-current={activeLesson === lesson.id ? "true" : undefined}
              onClick={() => onSelectLesson(lesson)}
              title={lesson.description}
            >
              {lesson.title}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
