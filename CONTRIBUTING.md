# 기여 가이드

QR 출석 관리 시스템에 기여해 주셔서 감사합니다! 🎉

## 기여 방법

### 1. 버그 리포트

버그를 발견하셨나요? 다음 정보를 포함하여 이슈를 생성해주세요:

- 버그 설명
- 재현 단계
- 예상 동작
- 실제 동작
- 스크린샷 (가능한 경우)
- 브라우저 및 버전 정보

### 2. 기능 제안

새로운 기능을 제안하고 싶으신가요?

- Discussions에서 먼저 논의해주세요
- 제안하는 기능의 목적과 사용 사례를 설명해주세요
- 가능하다면 UI/UX 목업을 첨부해주세요

### 3. 코드 기여

#### Pull Request 프로세스

1. **Fork 하기**
   ```bash
   git clone https://github.com/your-username/qr-attendance-system.git
   ```

2. **브랜치 생성**
   ```bash
   git checkout -b feature/your-feature-name
   # 또는
   git checkout -b fix/your-bug-fix
   ```

3. **코드 작성**
   - 일관된 코드 스타일 유지
   - 주석 추가 (특히 복잡한 로직)
   - 기존 기능이 정상 작동하는지 확인

4. **커밋**
   ```bash
   git add .
   git commit -m "feat: 새로운 기능 추가"
   # 또는
   git commit -m "fix: 버그 수정"
   ```

5. **Push**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Pull Request 생성**
   - PR 제목을 명확하게 작성
   - 변경 사항을 상세히 설명
   - 관련 이슈가 있다면 링크

### 커밋 메시지 규칙

- `feat:` - 새로운 기능 추가
- `fix:` - 버그 수정
- `docs:` - 문서 수정
- `style:` - 코드 포맷팅, 세미콜론 등
- `refactor:` - 코드 리팩토링
- `test:` - 테스트 코드 추가
- `chore:` - 빌드 프로세스, 보조 도구 수정

예시:
```
feat: 사용자 프로필 사진 업로드 기능 추가
fix: QR 스캔 시 중복 체크 버그 수정
docs: README에 설치 방법 추가
```

## 코드 스타일 가이드

### HTML
- 들여쓰기: 4 spaces
- 속성은 항상 쌍따옴표 사용
- 시맨틱 태그 사용 권장

### CSS
- 들여쓰기: 4 spaces
- 클래스명: kebab-case
- 주석으로 섹션 구분

### JavaScript
- 들여쓰기: 4 spaces
- 변수명: camelCase
- 상수: UPPER_CASE
- 함수는 명확한 이름 사용
- async/await 사용 권장

## 테스트

PR을 제출하기 전에:

1. 모든 페이지가 정상적으로 로드되는지 확인
2. 사용자 등록 → QR 생성 → 스캔 → 기록 확인 전체 플로우 테스트
3. 다양한 브라우저에서 테스트 (Chrome, Firefox, Safari)
4. 모바일 화면에서도 확인

## 질문이 있으신가요?

- Discussions에서 질문하기
- 이슈 생성하기
- 기존 이슈와 PR 검색하기

## 행동 강령

- 서로 존중하고 배려하기
- 건설적인 피드백 제공하기
- 다양한 의견과 경험 환영하기
- 프로젝트와 커뮤니티에 집중하기

감사합니다! 🙏
