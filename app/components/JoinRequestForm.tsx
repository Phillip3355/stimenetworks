'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from './LanguageProvider';
import { supabase } from '../lib/supabase';
import { normalizeJoinRequest, validateJoinRequest } from '../lib/joinRequestPolicy.mjs';
import styles from '../styles/join-request.module.css';

type Edition = 'java' | 'bedrock';

interface JoinRequestDraft {
  edition: Edition;
  minecraftNickname: string;
  inviterName: string;
  contact: string;
  rulesAgreed: boolean;
  privacyAgreed: boolean;
}

const initialDraft: JoinRequestDraft = {
  edition: 'java',
  minecraftNickname: '',
  inviterName: '',
  contact: '',
  rulesAgreed: false,
  privacyAgreed: false,
};

export default function JoinRequestForm() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState<JoinRequestDraft>(initialDraft);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateDraft = <K extends keyof JoinRequestDraft>(key: K, value: JoinRequestDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setInvalidFields((current) => current.filter((field) => field !== key));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isSubmitted) return;

    const errors = validateJoinRequest(draft);
    setInvalidFields(errors);
    setFeedback('');

    if (errors.length > 0) {
      setFeedback(t('필수 입력 항목과 동의 여부를 다시 확인해주세요.', 'Please check every required field and consent item.'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('join_requests').insert([normalizeJoinRequest(draft)]);
      if (error) {
        if (error.code === '23505') {
          throw new Error(t('같은 에디션과 닉네임으로 접수된 요청이 이미 있습니다.', 'A request for this edition and nickname is already pending.'));
        }
        throw error;
      }

      setIsSubmitted(true);
    } catch (error: unknown) {
      console.error('Failed to submit join request:', error);
      setFeedback(
        error instanceof Error
          ? error.message
          : t('요청을 전송하지 못했습니다. 잠시 후 다시 시도해주세요.', 'Could not send the request. Please try again shortly.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        className={styles.success}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        role="status"
      >
        <span className={styles.successIndex}>REQUEST RECEIVED · 01</span>
        <h2>{t('가입 요청을 보냈습니다.', 'Your join request has been sent.')}</h2>
        <p>
          {t(
            '관리자가 내용을 확인한 뒤 화이트리스트에 등록합니다. 제출한 양식은 수정할 수 없으며, 변경이 필요하면 관리자에게 직접 알려주세요.',
            'An administrator will review the request and add you to the whitelist. Submitted forms cannot be edited; contact an administrator if something must change.',
          )}
        </p>
      </motion.div>
    );
  }

  const hasError = (field: keyof JoinRequestDraft) => invalidFields.includes(field);

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formIntro}>
        <div>
          <p className={styles.eyebrow}>ACCESS REQUEST · STIMEMC</p>
          <h2>{t('플레이어 정보를 알려주세요.', 'Tell us who will be joining.')}</h2>
        </div>
        <p>
          {t(
            '이 요청은 관리자가 직접 확인합니다. 제출한 뒤에는 내용을 수정할 수 없으니 닉네임과 연락처를 한 번 더 확인해주세요.',
            'An administrator reviews every request. You cannot edit it after submission, so check your nickname and contact details carefully.',
          )}
        </p>
      </div>

      <fieldset className={styles.editionFieldset} aria-invalid={hasError('edition')}>
        <legend>{t('접속 에디션', 'Edition')}</legend>
        <div className={styles.editionGrid}>
          {(['java', 'bedrock'] as Edition[]).map((edition) => (
            <label className={styles.editionOption} key={edition}>
              <input
                type="radio"
                name="edition"
                value={edition}
                checked={draft.edition === edition}
                onChange={() => updateDraft('edition', edition)}
              />
              <span>
                <strong>{edition === 'java' ? 'Java' : 'Bedrock'}</strong>
                <small>
                  {edition === 'java'
                    ? t('PC Java Edition', 'PC Java Edition')
                    : t('모바일 · Windows · 콘솔', 'Mobile · Windows · Console')}
                </small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span>{t('Minecraft 닉네임', 'Minecraft nickname')}</span>
          <input
            type="text"
            value={draft.minecraftNickname}
            onChange={(event) => updateDraft('minecraftNickname', event.target.value)}
            placeholder={draft.edition === 'java' ? 'Stime_Player' : 'Bedrock Player'}
            autoComplete="off"
            maxLength={32}
            aria-invalid={hasError('minecraftNickname')}
            required
          />
          <small>
            {draft.edition === 'java'
              ? t('Java 닉네임은 영문, 숫자, 밑줄 3–16자로 입력하세요.', 'Use 3–16 letters, numbers, or underscores for Java.')
              : t('게임에 표시되는 Bedrock 게이머태그를 정확히 입력하세요.', 'Enter your Bedrock gamertag exactly as shown in game.')}
          </small>
        </label>

        <label className={styles.field}>
          <span>{t('초대자 이름', 'Inviter name')}</span>
          <input
            type="text"
            value={draft.inviterName}
            onChange={(event) => updateDraft('inviterName', event.target.value)}
            placeholder={t('초대자가 없으면 “없음”', 'Enter “None” if there is no inviter')}
            maxLength={80}
            aria-invalid={hasError('inviterName')}
            required
          />
        </label>

        <label className={`${styles.field} ${styles.contactField}`}>
          <span>{t('연락 가능한 전화번호 또는 카카오톡 닉네임', 'Phone number or KakaoTalk nickname')}</span>
          <input
            type="text"
            value={draft.contact}
            onChange={(event) => updateDraft('contact', event.target.value)}
            placeholder={t('예: 010-0000-0000 / 카카오톡 StimePlayer', 'e.g. 010-0000-0000 / KakaoTalk StimePlayer')}
            maxLength={120}
            aria-invalid={hasError('contact')}
            required
          />
          <small>{t('가입 요청 확인이 필요할 때만 사용합니다.', 'Used only when we need to confirm your request.')}</small>
        </label>
      </div>

      <div className={styles.consentArea}>
        <label className={styles.consentRow}>
          <input
            type="checkbox"
            checked={draft.rulesAgreed}
            onChange={(event) => updateDraft('rulesAgreed', event.target.checked)}
            aria-invalid={hasError('rulesAgreed')}
            required
          />
          <span>
            {t('서버 규정을 확인했으며 이에 동의합니다.', 'I have read and agree to the server rules.')}{' '}
            <Link href="/rules">{t('규정 보기', 'View rules')}</Link>
          </span>
        </label>

        <label className={styles.consentRow}>
          <input
            type="checkbox"
            checked={draft.privacyAgreed}
            onChange={(event) => updateDraft('privacyAgreed', event.target.checked)}
            aria-invalid={hasError('privacyAgreed')}
            required
          />
          <span>{t('아래 개인정보 수집·이용 및 서버 접속 기록 안내에 동의합니다.', 'I agree to the privacy and server log notice below.')}</span>
        </label>

        <details className={styles.privacyDetails}>
          <summary>{t('개인정보 처리 안내 자세히 보기', 'Read the privacy notice')}</summary>
          <div>
            <p><strong>{t('수집 항목', 'Data collected')}</strong></p>
            <p>{t('에디션, Minecraft 닉네임, 초대자 이름, 전화번호 또는 카카오톡 닉네임, 신청 시각.', 'Edition, Minecraft nickname, inviter name, phone number or KakaoTalk nickname, and submission time.')}</p>
            <p><strong>{t('이용 목적', 'Purpose')}</strong></p>
            <p>{t('가입 요청 확인, 신청자 연락, 화이트리스트 등록 및 서버 운영 보안.', 'Reviewing requests, contacting applicants, whitelist registration, and server security.')}</p>
            <p><strong>{t('보유 기간', 'Retention')}</strong></p>
            <p>{t('가입 요청 정보는 관리자가 처리 후 삭제합니다. Minecraft 서버 접속 시 IP 주소, UUID/XUID, 접속 시각 등이 서버 로그에 자동 기록될 수 있으며 보안 대응을 위해 최대 30일 보관 후 삭제합니다.', 'Join request data is deleted after administrative processing. When connecting, IP address, UUID/XUID, and connection time may be recorded automatically in server logs and retained for up to 30 days for security before deletion.')}</p>
          </div>
        </details>
      </div>

      {feedback && <p className={styles.formError} role="alert">{feedback}</p>}

      <div className={styles.submitRow}>
        <p>{t('제출 후에는 양식을 수정할 수 없습니다.', 'This form cannot be edited after submission.')}</p>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('요청 보내는 중', 'Sending request') : t('가입 요청 제출하기', 'Submit join request')}
        </button>
      </div>
    </form>
  );
}
