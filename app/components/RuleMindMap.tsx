'use client';

import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { useState } from 'react';
import useMotionPreference from './useMotionPreference';
import { getRuleDetail, ruleMindMap } from '../shared/siteContent.mjs';
import styles from '../styles/rule-mind-map.module.css';

type Language = 'ko' | 'en';

function RuleDetail({ ruleId, language, compact = false }: { ruleId: string; language: Language; compact?: boolean }) {
  const detail = getRuleDetail(ruleId, language);
  const isPresent = useIsPresent();
  return <div
    className={compact ? styles.mobileDetailInner : styles.detailInner}
    aria-hidden={!isPresent || undefined}
  >
    <p className={styles.detailIndex}>{detail.index} / RULE DETAIL</p>
    <h3>{detail.title}</h3>
    <p className={styles.detailDescription}>{detail.description}</p>
    <div className={styles.exampleBlock}>
      <p>{language === 'ko' ? '금지 예시' : 'Examples'}</p>
      <ul>{detail.examples.map((example: string) => <li key={example}>{example}</li>)}</ul>
    </div>
  </div>;
}

export default function RuleMindMap({ language }: { language: Language }) {
  const [activeRuleId, setActiveRuleId] = useState(ruleMindMap.nodes[0].id);
  const reduceMotion = useMotionPreference();
  const detailTransition = { duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] as const };
  const rootTitle = language === 'ko' ? ruleMindMap.root.titleKo : ruleMindMap.root.titleEn;
  const rootDescription = language === 'ko' ? ruleMindMap.root.descriptionKo : ruleMindMap.root.descriptionEn;
  return <div className={styles.explorer}>
    <div className={styles.rootNode}><strong>{rootTitle}</strong><p>{rootDescription}</p></div>
    <div className={styles.mindMap}>
      <nav className={styles.graph} aria-label={rootTitle}>
        {ruleMindMap.nodes.map(rule => {
          const selected = rule.id === activeRuleId;
          const title = language === 'ko' ? rule.titleKo : rule.titleEn;
          return <div key={rule.id} className={styles.branchSlot}>
            <button type="button" className={styles.ruleNode} data-active={selected ? 'true' : 'false'} aria-pressed={selected} aria-expanded={selected} onClick={() => setActiveRuleId(rule.id)}>
              <span>{rule.index}</span><strong>{title}</strong><i aria-hidden="true">{selected ? '−' : '+'}</i>
            </button>
            <AnimatePresence initial={false}>
              {selected ? <motion.div
                key={`${rule.id}-${language}`}
                className={styles.mobileDetail}
                aria-live="polite"
                initial={reduceMotion ? false : { height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={detailTransition}
              >
                <motion.div initial={reduceMotion ? false : { opacity: 0.65, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={detailTransition}>
                  <RuleDetail ruleId={rule.id} language={language} compact />
                </motion.div>
              </motion.div> : null}
            </AnimatePresence>
          </div>;
        })}
      </nav>
      <aside id="rule-detail-panel" className={styles.desktopDetail} aria-live="polite" aria-atomic="true">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={`${activeRuleId}-${language}`}
            className={styles.detailTransition}
            initial={reduceMotion ? false : { opacity: 0.65, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.1 } }}
            transition={detailTransition}
          ><RuleDetail ruleId={activeRuleId} language={language} /></motion.div>
        </AnimatePresence>
      </aside>
    </div>
  </div>;
}
