import React, { useEffect, useState } from 'react';
import type { Recommendation } from '../types';
import styles from './ShortlistPanel.module.css';

interface Props {
  recommendations: Recommendation[];
}

export const ShortlistPanel: React.FC<Props> = ({ recommendations }) => {
  const [prevUrls, setPrevUrls] = useState<Set<string>>(new Set());
  const [newUrls, setNewUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (recommendations) {
      const currentUrls = new Set(recommendations.map(r => r.url));
      
      // Find URLs that are in current but not in prev
      if (prevUrls.size > 0) {
        const newlyAdded = new Set<string>();
        currentUrls.forEach(url => {
          if (!prevUrls.has(url)) {
            newlyAdded.add(url);
          }
        });
        setNewUrls(newlyAdded);
      }
      
      setPrevUrls(currentUrls);
    }
  }, [recommendations]);
  if (!recommendations || recommendations.length === 0) {
    return null; // Empty array handled by agent, but as a fallback
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.header}>Recommended Assessments</h2>
      
      <div className={styles.cardList}>
        {recommendations.map((rec, idx) => {
          const isNew = newUrls.has(rec.url);
          return (
            <div 
              key={`${rec.url}-${idx}`} 
              className={`${styles.card} ${isNew ? styles.pulseHighlight : ''}`}
            >
            
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
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                View Test
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

            {rec.reasoning && (
              <div className={styles.reasoning}>
                <strong>Matched because:</strong> {rec.reasoning}
              </div>
            )}

          </div>
        )})}
      </div>
    </div>
  );
};
