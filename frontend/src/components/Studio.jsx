import { useState, useRef, useEffect } from "react";
import "../styles/Studio.css";

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function GridSquareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

function ShowcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="3" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="21" />
      <line x1="3" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function ToolsSliderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
    </svg>
  );
}

function ColorGridIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="3" fill="#3b82f6" />
      <rect x="18" y="2" width="12" height="12" rx="3" fill="#e83cce" />
      <rect x="2" y="18" width="12" height="12" rx="3" fill="#f4a942" />
      <rect x="18" y="18" width="12" height="12" rx="3" fill="#2dc97e" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home",       label: "Home",            icon: <HomeIcon /> },
  { id: "new",        label: "New Projects",    icon: <PlusCircleIcon /> },
  { id: "projects",   label: "Projects",        icon: <GridSquareIcon /> },
  { id: "scheduled",  label: "Scheduled Tasks", icon: <CalendarIcon /> },
  { id: "showcase",   label: "Showcase",        icon: <ShowcaseIcon /> },
];

const TOOLS = [
  { id: "general",   label: "General",   cls: "ic-general",  type: "star" },
  { id: "images",    label: "Images",    cls: "ic-images",   type: "emoji", emoji: "🖼️",  badge: "New" },
  { id: "documents", label: "Documents", cls: "ic-docs",     type: "emoji", emoji: "📄" },
  { id: "slides",    label: "Slides",    cls: "ic-slides",   type: "emoji", emoji: "📊" },
  { id: "chat",      label: "Chat",      cls: "ic-chat",     type: "emoji", emoji: "💬",  clover: true },
  { id: "sheets",    label: "Sheets",    cls: "ic-sheets",   type: "emoji", emoji: "📋",  clover: true },
  { id: "websites",  label: "Websites",  cls: "ic-websites", type: "emoji", emoji: "🌐",  clover: true },
  { id: "videos",    label: "Videos",    cls: "ic-videos",   type: "emoji", emoji: "🎬",  clover: true },
  { id: "tools",     label: "Tools",     cls: "ic-tools",    type: "grid" },
];

const TABS = ["Trending Projects", "Recent Projects"];

// ── Component 
function Studio() {
  const [activeNav,  setActiveNav]  = useState("home");
  const [activeTool, setActiveTool] = useState("general");
  const [inputVal,   setInputVal]   = useState("");
  const textareaRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [inputVal]);

  return (
    <div className="studio-root">

      {/* ────── Sidebar ────── */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? "nav-active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ────── Main ────── */}
      <main className="studio-main">
        <div className="main-inner">

          {/* Heading */}
          <h1 className="studio-heading">
            One <span className="highlight">General</span> Workspace Handling Multi-Step Tasks
          </h1>

          {/* ── Input Card ── */}
          <div className="input-card">

            {/* Row 1: agent tag + placeholder textarea */}
            <div className="input-row1">
              <div className="agent-tag">
                <span className="agent-icon-box"><AgentIcon /></span>
                <span className="agent-word">Agent</span>
                <span className="agent-pipe">|</span>
                <span className="agent-mode">General</span>
              </div>
              <textarea
                ref={textareaRef}
                className="input-field"
                rows={1}
                placeholder="Please enter the requirements, type @ to reference a file"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </div>

            {/* Row 2: actions */}
            <div className="input-row2">
              <div className="row2-left">
                <button className="btn-add" aria-label="Add">+</button>
                <button className="btn-tools">
                  <ToolsSliderIcon />
                  <span>Tools</span>
                </button>
              </div>
              <div className="row2-right">
                <button className="mode-btn">
                  Free Mode <ChevronDownIcon />
                </button>
                <button className="send-btn" aria-label="Send">
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>

          {/* ── Tool Icons Row ── */}
          <div className="tools-row">
            {TOOLS.map((tool, i) => (
              <button
                key={tool.id}
                className={`tool-item ${activeTool === tool.id ? "tool-active" : ""}`}
                onClick={() => setActiveTool(tool.id)}
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <div className={`tool-icon ${tool.cls}`}>
                  {tool.type === "star" && <span className="icon-star">✦</span>}
                  {tool.type === "emoji" && <span className="icon-emoji">{tool.emoji}</span>}
                  {tool.type === "grid" && <ColorGridIcon />}
                  {tool.badge  && <span className="badge-new">{tool.badge}</span>}
                  {tool.clover && <span className="badge-clover">👑</span>}
                </div>
                <span className="tool-label">{tool.label}</span>
                {activeTool === tool.id && <span className="active-bar" />}
              </button>
            ))}

            <services />
          </div>
        </div>
      </main>
    </div>
  );
}


export default Studio;