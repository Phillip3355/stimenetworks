# StimeMC 홈페이지

Next.js, React, Supabase 기반 홈페이지입니다. Google 로그인, 회원·비회원 문의,
실시간 답장, 관리자 문의 처리, Markdown 보고서와 텔레그램 알림을 제공합니다.

## 코드 구조

| 위치 | 책임 |
| --- | --- |
| `app/**/page.tsx`, `app/components`, `app/styles` | 페이지, 화면 상태와 스타일 |
| `app/client` | 브라우저 인증과 공개 키를 사용하는 데이터 접근 |
| `app/server` | 서버 전용 조회, 알림 요청 검증, 텔레그램 전송 |
| `app/shared` | 공통 입력 검증과 화면 표시 규칙. 비밀키 사용 금지 |
| `app/api` | HTTP 진입점. 서버 서비스에 위임 |
| `database` | 테이블, RLS 권한, RPC, 요청 제한과 변경 SQL |
| `tests` | 기능·보안 테스트와 Postgres 엔진 기반 권한 검증 |

실제 인증·권한·입력 제한은 Postgres RLS, 열 권한, RPC와 트리거에서 검사합니다.
별도 서버 배포 없이 Next.js 서버와 Supabase가 백엔드를 담당합니다.
서버 전용 코드는 `server-only`, 브라우저 클라이언트는 `client-only`로 구분합니다.

## 설정

`.env.example`의 변수 이름을 참고해 배포 환경에 설정합니다.
자동 작업은 프로젝트 지침에 따라 `.env.local`을 읽거나 수정하지 않습니다.

- `NEXT_PUBLIC_SUPABASE_URL`: 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 공개 anon/publishable 키만 허용
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 알림 처리 키
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`: 서버 전용 알림 설정
- `SITE_URL`: 실제 사이트의 HTTPS 주소

관리자는 DB의 `public.support_admins`가 유일한 기준입니다.
`NEXT_PUBLIC_ADMIN_EMAILS`는 더 이상 사용하지 않습니다.
주소가 등록되어 있고 `auth.users`에서 이메일 인증이 완료된 계정만 허용합니다.
Google OAuth 허용 리다이렉트에는 실제 도메인의 `/auth/callback`을 등록합니다.

관리자 추가는 SQL 콘솔에서 수행합니다. 브라우저에는 목록 변경 권한이 없습니다.

```sql
INSERT INTO public.support_admins(email)
VALUES ('extra-admin@example.com') ON CONFLICT (email) DO NOTHING;
```

## 기존 운영 DB 적용 순서

저장소 수정만으로 운영 DB 권한은 바뀌지 않습니다. 이번 작업은 운영 DB에
접속하거나 배포하지 않았습니다.

1. 백업을 확보하고 [사전 검사](database/preflight.sql)를 실행합니다.
2. [보안 변경 SQL](database/migrations/20260907_security_hardening.sql)을 SQL Editor에서
   전체 실행합니다. 기존 데이터를 삭제하지 않으며 하나의 트랜잭션으로 적용됩니다.
   기존 support 테이블과 Telegram RPC가 설치된 DB를 전제로 합니다.
3. [실시간 구독 설정](database/realtime.sql)을 실행합니다. 기존 publication을
   삭제하지 않고 필요한 테이블만 추가합니다.
4. 새 홈페이지를 배포합니다. 권한을 먼저 강화하므로 이전 브라우저의 회원 문의
   생성은 새 페이지로 새로고침하기 전까지 실패할 수 있습니다.
5. 회원·비회원 문의, 관리자 답장·보고서 발행과 실제 텔레그램 수신을 확인합니다.

## 서버 가입 요청 기능 제거

가입 요청 입력 양식과 관리자 가입 요청 탭은 제거했습니다. 서버 접속 안내는 `/join`에서 제공합니다.
기존 DB에서는 [가입 요청 삭제 SQL](database/migrations/20261005_remove_join_requests.sql)을
Supabase SQL Editor에서 전체 실행하세요. 저장된 가입 신청 데이터도 영구 삭제됩니다.
문의, 보고서, 관리자 계정 데이터는 유지합니다. 운영 DB에는 자동으로 실행하지 않습니다.

이전 루트의 네 `supabase_*.sql` 파일은 `database`로 통합했습니다.
과거 스크립트를 다시 실행하면 권한을 약화시킬 수 있으므로 사용하지 마세요.
새 제약은 기존 비정상 데이터를 자동 수정하지 않습니다. 사전 검사에서 발견된
오래된 닉네임/상태는 확인이 필요하며, 해당 행의 수정이 새 제약에 걸릴 수 있습니다.

## 새 DB 설치

[database/schema.sql](database/schema.sql)을 전체 실행합니다.
테이블, 보안 정책, RPC와 실시간 구독이 함께 설치됩니다.
원본인 `foundation.sql`, `migrations`, `realtime.sql`을 수정했다면
`npm run db:schema`로 다시 생성합니다. `foundation.sql`만 단독 적용하지 마세요.

## 실행과 검증

Node.js 24에서 검증했습니다.

```sh
npm ci
npm run dev
npm test
npm run lint
npm audit
npm run security:scan -- --history
npm run verify:build
```

테스트는 PGlite의 Postgres 엔진에서 Supabase 역할을 구성하며 운영 DB나
텔레그램에 접근하지 않습니다. `verify:build`는 환경 파일이 없는 임시 폴더에서
가짜 공개 설정으로 빌드·타입 검사를 수행합니다. 일반 배포 빌드는 `npm run build`입니다.

`security:scan -- --history`는 과거 `.env.example`의 Telegram 토큰 후보 1개로 인해
실패 상태를 반환합니다. 현재 파일에서 삭제됐어도 실제 토큰의 폐기·재발급 여부는
별도로 확인해야 합니다. 발견 사실을 숨기기 위한 예외 처리는 추가하지 않았습니다.

발견 사항과 한계는 [보안 점검 기록](docs/security-review-2026-09-07.md)을 참고하세요.
