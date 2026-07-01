import React from 'react';
import type { Recommendation } from '../types';
import styles from './ShortlistPanel.module.css';

interface Props {
  recommendations: Recommendation[];
}

export const ShortlistPanel: React.FC<Props> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null; // Empty array handled by agent, but as a fallback
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.header}>Recommended Assessments</h2>
      
      <div className={styles.cardList}>
        {recommendations.map((rec, idx) => (
          <div key={`${rec.url}-${idx}`} className={styles.card}>
            
            <div className={styles.cardHeader}>
              <div className={styles.name}>{rec.name}</div>
              <a 
                href={rec.url} 
                target="_blank" 
                rel="noreferrer" 
                className={styles.verifiedLink}
                title="View in SHL Catalog"
              >
                <svg className={styles.verifiedIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verified
              </a>
            </div>

            <div className={styles.metadata}>
              {rec.test_type && (
                <span className={styles.badge}>
                  Type: {rec.test_type}
                </span>
              )}
              {rec.duration && (
                <span>⏱ {rec.duration}</span>
              )}
              {rec.languages && rec.languages.length > 0 && (
                <span>🌐 {rec.languages.length} Languages</span>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
