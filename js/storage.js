// 로컬 스토리지 기반 데이터 관리 (서버 없이 작동)

// 데이터 저장소
const STORAGE_KEYS = {
    USERS: 'qr_attendance_users',
    ATTENDANCE: 'qr_attendance_records'
};

// 데이터 내보내기
function exportData() {
    try {
        const data = {
            users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
            attendance: JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-attendance-backup-${formatDate(new Date())}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Export error:', error);
        return false;
    }
}

// 데이터 가져오기
function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.users || !data.attendance) {
                    throw new Error('잘못된 데이터 형식입니다.');
                }
                
                // 기존 데이터와 병합
                const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
                const existingAttendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
                
                // 중복 제거 (ID 기준)
                const mergedUsers = [...existingUsers];
                data.users.forEach(user => {
                    if (!mergedUsers.find(u => u.id === user.id)) {
                        mergedUsers.push(user);
                    }
                });
                
                const mergedAttendance = [...existingAttendance];
                data.attendance.forEach(record => {
                    if (!mergedAttendance.find(r => r.id === record.id)) {
                        mergedAttendance.push(record);
                    }
                });
                
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mergedUsers));
                localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(mergedAttendance));
                
                resolve({
                    usersImported: data.users.length,
                    attendanceImported: data.attendance.length
                });
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsText(file);
    });
}

// 로컬 스토리지 초기화
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    }
}

// 사용자 관련 함수들
async function fetchUsers(page = 1, limit = 1000) {
    try {
        initializeStorage();
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        
        // 정렬 및 페이지네이션
        const sorted = users.sort((a, b) => b.created_at - a.created_at);
        const start = (page - 1) * limit;
        const data = sorted.slice(start, start + limit);
        
        return {
            data: data,
            total: users.length,
            page: page,
            limit: limit
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { data: [], total: 0, page: 1, limit: limit };
    }
}

async function fetchUserById(userId) {
    try {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        return users.find(u => u.id === userId) || null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

async function createUser(userData) {
    try {
        initializeStorage();
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        
        const newUser = {
            ...userData,
            id: userData.id || generateUUID(),
            created_at: Date.now(),
            updated_at: Date.now()
        };
        
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        showNotification('사용자 등록에 실패했습니다.', 'error');
        return null;
    }
}

async function deleteUser(userId) {
    try {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const filtered = users.filter(u => u.id !== userId);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('사용자 삭제에 실패했습니다.', 'error');
        return false;
    }
}

// 출석 관련 함수들
async function fetchAttendance(page = 1, limit = 1000) {
    try {
        initializeStorage();
        const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
        
        // 정렬 및 페이지네이션
        const sorted = attendance.sort((a, b) => 
            new Date(b.check_in_time) - new Date(a.check_in_time)
        );
        const start = (page - 1) * limit;
        const data = sorted.slice(start, start + limit);
        
        return {
            data: data,
            total: attendance.length,
            page: page,
            limit: limit
        };
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return { data: [], total: 0, page: 1, limit: limit };
    }
}

async function createAttendance(attendanceData) {
    try {
        initializeStorage();
        const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
        
        const newRecord = {
            ...attendanceData,
            id: generateUUID(),
            created_at: Date.now(),
            updated_at: Date.now()
        };
        
        attendance.push(newRecord);
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
        
        return newRecord;
    } catch (error) {
        console.error('Error creating attendance:', error);
        showNotification('출석 체크에 실패했습니다.', 'error');
        return null;
    }
}

async function deleteAttendance(attendanceId) {
    try {
        const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
        const filtered = attendance.filter(a => a.id !== attendanceId);
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting attendance:', error);
        showNotification('출석 기록 삭제에 실패했습니다.', 'error');
        return false;
    }
}

// 데이터 내보내기 (백업용)
function exportData() {
    const data = {
        users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
        attendance: JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-attendance-backup-${formatDate(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('데이터가 백업되었습니다.', 'success');
}

// 데이터 가져오기 (복원용)
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.users && data.attendance) {
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
                localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
                showNotification('데이터가 복원되었습니다.', 'success');
                location.reload();
            } else {
                showNotification('잘못된 파일 형식입니다.', 'error');
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('데이터 복원에 실패했습니다.', 'error');
        }
    };
    reader.readAsText(file);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
});
