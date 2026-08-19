'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { getRuleDetail, ruleMindMap } from '../lib/siteContent.mjs';
import styles from '../styles/rule-mind-map.module.css';

type Language = 'ko' | 'en';

function RuleDetail({
  ruleId,
  language,
  compact = false,
}: {
  ruleId: string;
  language: Language;
  compact?: boolean;
}) {
  const detail = getRuleDetail(ruleId, language);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={`${detail.id}-${language}`}
      className={compact ? styles.mobileDetailInner : styles.detailInner}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 0.75, 0.2, 1] }}
    >
      <p className={styles.detailIndex}>{detail.index} · RULE DETAIL</p>
      <h3>{detail.title}</h3>
      <p className={styles.detailDescription}>{detail.description}</p>
      <div className={styles.exampleBlock}>
        <p>{language === 'ko' ? '금지 예시' : 'Examples'}</p>
        <ul>
          {detail.examples.map((example: string) => (
            <li key={example}>{example}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function RuleMindMap({ language }: { language: Language }) {
  const [activeRuleId, setActiveRuleId] = useState(ruleMindMap.nodes[0].id);
  const reduceMotion = useReducedMotion();
  const activeIndex = ruleMindMap.nodes.findIndex((rule) => rule.id === activeRuleId);
  const activeRow = Math.floor(activeIndex / 2);
  const activeColumn = activeIndex % 2;
  const rowY = [13, 38, 63, 88][activeRow] ?? 13;
  const endX = activeColumn === 0 ? 44 : 70;
  const rootTitle = language === 'ko' ? ruleMindMap.root.titleKo : ruleMindMap.root.titleEn;
  const rootDescription =
    language === 'ko'
      ? ruleMindMap.root.descriptionKo
      : ruleMindMap.root.descriptionEn;

  return (
    <div className={styles.mindMap}>
      <div className={styles.graph} aria-label={rootTitle}>
        <svg
          className={styles.connectors}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path className={styles.connectorBase} d="M24 50 H31 M31 13 V88" />
          {[13, 38, 63, 88].map((y) => (
            <path
              key={y}
              className={styles.connectorBase}
              d={`M31 ${y} H70`}
            />
          ))}
          <motion.path
            key={activeRuleId}
            className={styles.connectorActive}
            d={`M24 50 H31 V${rowY} H${endX}`}
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 0.42,
              ease: [0.22, 0.75, 0.2, 1],
            }}
          />
        </svg>

        <div className={styles.rootNode}>
          <span>ROOT / 00</span>
          <strong>{rootTitle}</strong>
          <p>{rootDescription}</p>
        </div>

        <div className={styles.branchGrid}>
          {ruleMindMap.nodes.map((rule) => {
            const selected = rule.id === activeRuleId;
            const title = language === 'ko' ? rule.titleKo : rule.titleEn;

            return (
              <div key={rule.id} className={styles.branchSlot}>
                <button
                  type="button"
                  className={styles.ruleNode}
                  data-active={selected ? 'true' : 'false'}
                  aria-pressed={selected}
                  aria-expanded={selected}
                  onClick={() => setActiveRuleId(rule.id)}
                >
                  <span>{rule.index}</span>
                  <strong>{title}</strong>
                  <i aria-hidden="true">{selected ? '−' : '+'}</i>
                </button>

                <AnimatePresence initial={false} mode="wait">
                  {selected ? (
                    <div className={styles.mobileDetail}>
                      <RuleDetail ruleId={activeRuleId} language={language} compact />
                    </div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <aside
        id="rule-detail-panel"
        className={styles.desktopDetail}
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence initial={false} mode="wait">
          <RuleDetail ruleId={activeRuleId} language={language} />
        </AnimatePresence>
      </aside>
    </div>
  );
}
