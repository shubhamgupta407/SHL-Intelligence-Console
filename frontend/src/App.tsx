import { useChat } from './hooks/useChat';
import { ConversationZone } from './components/ConversationZone';
import { ShortlistPanel } from './components/ShortlistPanel';
import styles from './App.module.css';

function App() {
  const chatState = useChat();
  const { healthStatus, shortlist } = chatState;

  // Determine health text
  let healthText = 'Checking Engine...';
  if (healthStatus === 'waking') healthText = 'Waking up the assessment engine...';
  if (healthStatus === 'ready') healthText = 'Engine Ready';
  if (healthStatus === 'error') healthText = 'Connection Error';

  return (
    <div className={styles.appContainer}>
      <div className={styles.healthBadge}>
        <span className={`${styles.statusIndicator} ${styles[healthStatus]}`}></span>
        {healthText}
      </div>

      <div className={styles.mainZone}>
        <ConversationZone {...chatState} />
      </div>

      {shortlist !== null && (
        <div className={styles.sideZone}>
          <ShortlistPanel recommendations={shortlist} />
        </div>
      )}
    </div>
  );
}

export default App;
