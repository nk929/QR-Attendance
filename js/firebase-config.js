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

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firestore 인스턴스 생성
const db = firebase.firestore();

// 개발 환경 로그
console.log('🔥 Firebase 초기화 완료!');
console.log('📦 프로젝트 ID:', firebaseConfig.projectId);