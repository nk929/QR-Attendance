# GitHub 업로드 가이드 📤

## 📂 GitHub에 올릴 파일 목록

### ✅ 필수 파일 (모두 포함)

```
qr-attendance-system/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 자동 배포 설정
├── css/
│   └── style.css              # 전체 스타일시트
├── js/
│   ├── main.js                # 공통 유틸리티 함수
│   ├── dashboard.js           # 대시보드 로직
│   ├── register-new.js        # 사용자 등록 (동적 필드)
│   ├── scanner.js             # QR 스캐너 로직
│   └── attendance.js          # 출석 기록 관리
├── index.html                 # 메인 대시보드
├── register.html              # 사용자 등록 페이지
├── scanner.html               # QR 스캐너 페이지
├── attendance.html            # 출석 기록 페이지
├── README.md                  # 프로젝트 문서
├── LICENSE                    # MIT 라이선스
├── CONTRIBUTING.md            # 기여 가이드
└── .gitignore                 # Git 제외 파일 설정
```

### ❌ 제외된 파일

- `js/register.js` - 이전 버전 (사용 안 함)

---

## 🚀 GitHub 업로드 방법

### 방법 1: GitHub Desktop (초보자 추천)

1. **GitHub Desktop 설치**
   - https://desktop.github.com/ 에서 다운로드

2. **새 저장소 생성**
   - File → New Repository
   - Name: `qr-attendance-system`
   - Local Path: 프로젝트 폴더 선택
   - Initialize this repository with a README: 체크 해제

3. **파일 커밋**
   - 좌측에 변경된 파일 목록 확인
   - Summary: "Initial commit - QR Attendance System"
   - Commit to main

4. **GitHub에 푸시**
   - Publish repository
   - GitHub.com 계정 선택
   - Public/Private 선택
   - Publish repository

---

### 방법 2: Git 명령어 (개발자용)

1. **GitHub에서 새 저장소 생성**
   - https://github.com/new 접속
   - Repository name: `qr-attendance-system`
   - Public 선택
   - README, .gitignore, license 추가 안 함

2. **로컬에서 Git 초기화**
```bash
# 프로젝트 폴더로 이동
cd qr-attendance-system

# Git 초기화
git init

# 원격 저장소 연결
git remote add origin https://github.com/your-username/qr-attendance-system.git

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit - QR Attendance Management System v1.2.0"

# GitHub에 푸시
git branch -M main
git push -u origin main
```

---

## 🌐 GitHub Pages 설정 (무료 호스팅)

### 자동 배포 활성화

1. **GitHub 저장소 페이지 접속**

2. **Settings → Pages**
   - Source: GitHub Actions 선택
   - 자동으로 `.github/workflows/deploy.yml` 감지

3. **배포 확인**
   - Actions 탭에서 배포 진행 상황 확인
   - 완료 후 `https://your-username.github.io/qr-attendance-system/` 접속

---

## 📝 업로드 체크리스트

### 업로드 전 확인사항

- [ ] 모든 HTML 파일이 정상 작동하는지 확인
- [ ] README.md에 GitHub 사용자명 업데이트
- [ ] LICENSE 파일 저작권 정보 확인
- [ ] .gitignore에 불필요한 파일 추가 확인
- [ ] 민감한 정보(API 키 등) 포함 여부 확인

### 업로드 후 확인사항

- [ ] GitHub 저장소에 모든 파일 확인
- [ ] README.md가 제대로 렌더링되는지 확인
- [ ] GitHub Pages 배포 성공 확인
- [ ] 배포된 사이트 접속 테스트
- [ ] 모든 기능 정상 작동 확인

---

## 🔧 문제 해결

### 파일이 업로드되지 않는 경우

```bash
# 캐시 삭제
git rm -r --cached .
git add .
git commit -m "Clear cache and re-add files"
git push
```

### GitHub Pages가 작동하지 않는 경우

1. Settings → Pages에서 Source 확인
2. Actions 탭에서 빌드 로그 확인
3. index.html이 루트 디렉토리에 있는지 확인

### 대용량 파일 문제

```bash
# 100MB 이상 파일은 Git LFS 사용
git lfs install
git lfs track "*.mp4"
git add .gitattributes
```

---

## 📌 추가 팁

### 1. Repository 설명 추가
- GitHub 저장소 페이지 상단 "About" 클릭
- Description: "QR 코드 기반 출석 관리 시스템"
- Website: GitHub Pages URL 추가
- Topics: `qr-code`, `attendance`, `web-app`, `javascript`

### 2. README 뱃지 추가
README.md 상단에 다음 정보 업데이트:
- `your-username`을 실제 GitHub 사용자명으로 변경

### 3. Social Preview 설정
- Settings → Options → Social preview
- 스크린샷 이미지 업로드 (1280x640px 권장)

### 4. 보안 설정
- Settings → Security
- Dependabot alerts 활성화
- Code scanning 활성화 (선택사항)

---

## 🎉 완료!

이제 프로젝트가 GitHub에 올라가고 전 세계 누구나 접속 가능합니다!

**저장소 URL**: `https://github.com/your-username/qr-attendance-system`  
**배포 URL**: `https://your-username.github.io/qr-attendance-system/`

### 다음 단계

1. **README에 라이브 데모 링크 추가**
2. **스크린샷 추가** (Screenshots 폴더 생성)
3. **Issues 탭 활용** (버그 리포트, 기능 요청)
4. **Wiki 작성** (상세 사용 설명서)
5. **Release 생성** (v1.2.0 태그)

---

**궁금한 점이 있으시면 GitHub Issues에 남겨주세요!** 🙋‍♂️
