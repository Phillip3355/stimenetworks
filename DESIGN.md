# Stime Networks Living Archive Design System

## Intent

- Audience: Java·Bedrock Minecraft 플레이어, 커뮤니티 구성원, 문의 사용자, 서버 관리자.
- Primary user action: 서버 가입, 공개 STAGE 입장, 1:1 문의 중 현재 목적에 맞는 서비스로 이동.
- Design character: 실제 서버 월드를 전시처럼 보여주는 차분하고 몰입적인 디지털 아카이브.
- Reference observations: 전체 화면 이미지, 검정색 UI, 간결한 산세리프 타이포그래피, 절제된 내비게이션, 모바일 풀스크린 메뉴, 이미지에서 정보 영역으로 이어지는 명확한 전환.
- Deliberate adaptations: Refik Anadol의 브랜드 자산·카피·정확한 구성을 복제하지 않고, Stime의 실제 서버 스크린샷과 서비스 흐름에 맞춘 독자적인 편집 시스템으로 재구성한다.

## Foundations

- Canvas: `#050505`; raised surface: `#0a0a0a`; soft surface: `#111111`.
- Primary text: `#f2f1ec`; secondary text: `#a7a7a2`; muted text: `#787873`.
- Hairline: `rgba(255,255,255,.16)`; strong hairline: `rgba(255,255,255,.34)`.
- Accent: 흰색을 기본으로 사용하고 상태 색상은 성공·경고·오류에만 제한한다.
- Typography: Geist Sans를 기본으로 사용한다. 한국어 제목은 `word-break: keep-all`, `overflow-wrap: normal`, `text-wrap: balance`를 적용한다.
- Display sizes: desktop `clamp(3rem, 7vw, 7.5rem)`, mobile `clamp(2rem, 9vw, 3.2rem)`.
- Body sizes: desktop 15–17px, mobile 14–16px. 모바일 제목은 특별한 이유가 없으면 34px를 넘지 않는다.
- Spacing: 4/8/12/16/24/32/48/72/104px scale.
- Radius: 기본 0px, 폼·상태 칩에만 2–6px.
- Imagery: 실제 서버 이미지를 우선 사용한다. `object-fit: cover`와 장면별 `object-position`을 지정하며 모바일은 4:3 또는 16:10 비율을 사용한다.

## Layout and Content

- 공통 고정 내비게이션은 Stime Networks 이름, 주요 링크, 언어 선택, 메뉴 버튼을 제공한다.
- 1000px 초과에서는 전체 링크를 표시한다. 621–1000px에서는 링크를 메뉴 버튼으로 교체한다. 360–620px에서는 44px 컨트롤과 모바일 전용 구성을 사용한다.
- KO·EN 선택 영역은 동일한 너비와 높이의 두 칸으로 구성하고 텍스트를 수평·수직 중앙 정렬한다.
- 홈 페이지는 실제 월드 히어로 → 서버 특징 스크롤 서사 → 서비스 진입 → 운영 원칙 순서로 구성한다.
- 홈의 특징 카드는 다음 서비스로 연결한다.
  - Java와 Bedrock: `/join`
  - 평화로운 생존과 서버 구조: `/server-mechanism`
  - STAGE와 실시간 문의: `/support`
- 모든 `더 알아보기 / Learn more` 링크는 내부 라우팅을 사용하고 키보드 포커스를 제공한다.
- 정보 페이지는 인트로, 페이지 인덱스, 본문 섹션을 사용한다. 반복 카드만 나열하지 않고 번호와 경계선으로 읽기 순서를 만든다.
- 지원·관리·STAGE 화면은 같은 색상과 타이포그래피를 유지하면서 정보 밀도가 높은 작업 화면으로 전환한다.

## Desktop Composition

- Primary desktop: 1440px. 최대 콘텐츠 폭은 1360px.
- 히어로 이미지는 뷰포트의 72–88svh를 사용하되 핵심 CTA를 가리지 않는다.
- 서버 특징 카드는 이미지와 텍스트를 교차 배치하며 좌우에서 한 장씩 나타난다.
- 폼과 대시보드는 320–360px 목록 패널과 유동적인 상세 패널을 사용한다.

## Mobile Composition

- Target widths: 360px, 390px, 430px.
- 데스크톱을 축소하지 않는다. 이미지 → 제목과 CTA → 서비스 목록 순서로 재구성한다.
- 2열·3열 반복 콘텐츠는 한 열의 1→2→3 순서로 쌓는다.
- 모바일 이미지는 4:3 또는 16:10으로 제한하며 고정 픽셀 높이를 사용하지 않는다.
- 버튼은 너비 100%, 높이 44px 이상을 기본으로 한다.
- 문의 목록과 채팅은 기존 목록/상세 전환, 뒤로가기, 자동 스크롤을 보존한다.
- 고정 UI는 safe-area 여백을 포함하고 가상 키보드가 입력 영역을 가리지 않게 한다.

## Motion

- Framer Motion을 사용하되 상호작용 컴포넌트만 클라이언트로 격리한다.
- 화면 진입: opacity와 8–14px의 작은 y 이동, 0.45–0.7초.
- 서버 특징 카드: 좌우 28–40px에서 0.9–1.15초 동안 한 장씩 등장한다. 모바일 이동은 18–24px로 제한한다.
- 카드 모션은 뷰포트 진입 시 한 번만 실행하고 레이아웃 크기를 변경하지 않는다.
- 버튼과 링크: 120–220ms의 색상·opacity·2px 이내 transform 피드백.
- `prefers-reduced-motion`에서는 비필수 transform, 순차 지연, 이미지 정착 효과를 제거한다.

## Do Not

- Refik Anadol의 로고, 이미지, 문구, 정확한 화면 구성을 복제하지 않는다.
- AI 생성 이미지를 실제 서버 사진보다 우선하지 않는다.
- 한국어와 영어를 한 텍스트 블록 안에서 보조 라벨과 제목으로 혼합하지 않는다.
- 제목에 임의의 `<br>`를 넣지 않는다.
- 모바일에서 데스크톱 열을 가로로 압축하지 않는다.
- 필수 정보를 hover에서만 표시하지 않는다.
- 스크롤 재킹, 무한 루프 장식, 큰 패럴랙스, 레이아웃 이동 애니메이션을 사용하지 않는다.

