'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from './LanguageProvider';
import { supabase } from '../lib/supabase';
import { buildWhitelistCommand } from '../lib/joinRequestPolicy.mjs';
import styles from '../styles/join-admin.module.css';

interface JoinRequestRecord {
  id: string;
  edition: 'java' | 'bedrock';
  minecraft_nickname: string;
  inviter_name: string;
  contact: string;
  rules_agreed: boolean;
  privacy_agreed: boolean;
  created_at: string;
}

export default function AdminJoinRequests() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [requests, setRequests] = useState<JoinRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setFeedback('');

    const { data, error } = await supabase
      .from('join_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load join requests:', error);
      setFeedback(t('가입 요청을 불러오지 못했습니다. SQL 설정을 확인해주세요.', 'Could not load join requests. Check the SQL setup.'));
    } else {
      setRequests((data ?? []) as JoinRequestRecord[]);
    }

    setIsLoading(false);
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    void supabase
      .from('join_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;

        if (error) {
          console.error('Failed to load join requests:', error);
          setFeedback(t('가입 요청을 불러오지 못했습니다. SQL 설정을 확인해주세요.', 'Could not load join requests. Check the SQL setup.'));
        } else {
          setRequests((data ?? []) as JoinRequestRecord[]);
        }
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  const copyCommand = async (request: JoinRequestRecord) => {
    const command = buildWhitelistCommand(request.edition, request.minecraft_nickname);

    try {
      await navigator.clipboard.writeText(command);
      setCopiedId(request.id);
      window.setTimeout(() => setCopiedId((current) => current === request.id ? null : current), 1800);
    } catch (error) {
      console.error('Failed to copy whitelist command:', error);
      setFeedback(t(`명령어를 복사하지 못했습니다: ${command}`, `Could not copy the command: ${command}`));
    }
  };

  const deleteRequest = async (request: JoinRequestRecord) => {
    const confirmed = window.confirm(
      t(
        `${request.minecraft_nickname} 플레이어를 화이트리스트에 등록했습니까? 확인을 누르면 가입 요청이 완전히 삭제됩니다.`,
        `Did you add ${request.minecraft_nickname} to the whitelist? Confirming permanently deletes this request.`,
      ),
    );
    if (!confirmed) return;

    setDeletingId(request.id);
    setFeedback('');

    const { error } = await supabase.from('join_requests').delete().eq('id', request.id);

    if (error) {
      console.error('Failed to delete join request:', error);
      setFeedback(t('요청을 삭제하지 못했습니다.', 'Could not delete the request.'));
    } else {
      setRequests((current) => current.filter((item) => item.id !== request.id));
    }

    setDeletingId(null);
  };

  return (
    <section className={styles.panel} aria-labelledby="join-requests-title">
      <header className={styles.header}>
        <div>
          <p>PLAYER ACCESS · PENDING</p>
          <h2 id="join-requests-title">{t('가입 요청', 'Join requests')} <span>{requests.length}</span></h2>
        </div>
        <button type="button" onClick={() => void loadRequests()} disabled={isLoading}>
          {isLoading ? t('불러오는 중', 'Loading') : t('새로고침', 'Refresh')}
        </button>
      </header>

      {feedback && <p className={styles.feedback} role="alert">{feedback}</p>}

      {isLoading ? (
        <p className={styles.empty}>{t('가입 요청을 불러오고 있습니다.', 'Loading join requests.')}</p>
      ) : requests.length === 0 ? (
        <p className={styles.empty}>{t('대기 중인 가입 요청이 없습니다.', 'There are no pending join requests.')}</p>
      ) : (
        <div className={styles.requestList}>
          {requests.map((request, index) => {
            const command = buildWhitelistCommand(request.edition, request.minecraft_nickname);
            return (
              <motion.article
                className={styles.request}
                key={request.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.36, delay: reduceMotion ? 0 : index * 0.035 }}
              >
                <div className={styles.requestIndex}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{request.edition}</strong>
                </div>

                <div className={styles.requestBody}>
                  <div className={styles.requestTitle}>
                    <h3>{request.minecraft_nickname}</h3>
                    <time dateTime={request.created_at}>{new Date(request.created_at).toLocaleString()}</time>
                  </div>

                  <dl className={styles.details}>
                    <div>
                      <dt>{t('초대자', 'Inviter')}</dt>
                      <dd>{request.inviter_name}</dd>
                    </div>
                    <div>
                      <dt>{t('연락처', 'Contact')}</dt>
                      <dd>{request.contact}</dd>
                    </div>
                    <div>
                      <dt>{t('동의', 'Consent')}</dt>
                      <dd>{request.rules_agreed && request.privacy_agreed ? t('규정 · 개인정보 동의 완료', 'Rules · Privacy accepted') : t('확인 필요', 'Review needed')}</dd>
                    </div>
                  </dl>

                  <code className={styles.command}>{command}</code>

                  <div className={styles.actions}>
                    <button type="button" onClick={() => void copyCommand(request)}>
                      {copiedId === request.id ? t('복사됨', 'Copied') : t('화이트리스트 명령어 복사', 'Copy whitelist command')}
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => void deleteRequest(request)}
                      disabled={deletingId === request.id}
                    >
                      {deletingId === request.id ? t('삭제 중', 'Deleting') : t('처리 완료 및 삭제', 'Complete and delete')}
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
