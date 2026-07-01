import { useChat } from './hooks/useChat';
import { ConversationZone } from './components/ConversationZone';
import { ShortlistPanel } from './components/ShortlistPanel';
import styles from './App.module.css';

function App() {
  const chatState = useChat();
  const { healthStatus, shortlist, isEnded, resetChat } = chatState;

  // Determine health text
  let healthText = 'Connecting...';
  if (healthStatus === 'waking') healthText = 'Waking Engine...';
  if (healthStatus === 'ready') healthText = 'Connected';
  if (healthStatus === 'error') healthText = 'Offline';

  return (
    <div className={styles.appContainer}>
      
      {/* Left Navigation Sidebar */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>SHL</div>
          <span className={styles.workspaceName}>Intelligence</span>
        </div>
        
        <div className={styles.navActions}>
          <button className={styles.newChatBtn} onClick={resetChat}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Search
          </button>
        </div>
        
        <div className={styles.sidebarFooter}>
          <div className={styles.healthStatus}>
            <span className={`${styles.statusDot} ${styles[healthStatus]}`}></span>
            {healthText}
          </div>
        </div>
      </nav>

      {/* Main Conversation Zone */}
      <main className={styles.mainContent}>
        <ConversationZone {...chatState} />
      </main>

      {/* Right Assessment Panel */}
      {shortlist !== null && (
        <aside className={styles.rightPanel}>
          <ShortlistPanel recommendations={shortlist} />
        </aside>
      )}

    </div>
  );
}

export default App;
