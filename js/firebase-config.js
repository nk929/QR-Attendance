// Firebase 설정 파일
// Firebase Console에서 제공받은 설정값

const firebaseConfig = {
    apiKey: "AIzaSyDgwr8FMaK33hSUvqkQPnbKljN3orOfJ08",
    authDomain: "qr-attendance-system-71bff.firebaseapp.com",
    projectId: "qr-attendance-system-71bff",
    storageBucket: "qr-attendance-system-71bff.firebasestorage.app",
    messagingSenderId: "949718324955",
    appId: "1:949718324955:web:6751ed5eaf2529a6151efe",
    measurementId: "G-GL3KBG29VB"
};

// Firebase SDK 로드 대기 후 초기화
(function() {
    // Firebase SDK가 로드될 때까지 대기
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK가 로드되지 않았습니다!');
        console.error('HTML에서 Firebase SDK 스크립트를 먼저 로드해야 합니다.');
        return;
    }

    try {
        // Firebase 초기화
        firebase.initializeApp(firebaseConfig);

        // Firestore 인스턴스 생성
        window.db = firebase.firestore();

        // 개발 환경 로그
        console.log('🔥 Firebase 초기화 완료!');
        console.log('📦 프로젝트 ID:', firebaseConfig.projectId);
    } catch (error) {
        console.error('❌ Firebase 초기화 실패:', error);
    }
})();