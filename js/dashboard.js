// 대시보드 페이지 스크립트

let dashboardData = {
    users: [],
    attendance: [],
    todayAttendance: []
};

// 대시보드 데이터 로드
async function loadDashboardData() {
    try {
        // 사용자 데이터 로드
        const usersResponse = await fetchUsers(1, 1000);
        dashboardData.users = usersResponse.data || [];

        // 출석 데이터 로드
        const attendanceResponse = await fetchAttendance(1, 1000);
        dashboardData.attendance = attendanceResponse.data || [];

        // 오늘 출석 필터링
        const today = formatDate(new Date());
        dashboardData.todayAttendance = dashboardData.attendance.filter(record => {
            const recordDate = formatDate(new Date(record.check_in_time));
            return recordDate === today;
        });

        updateStats();
        displayRecentAttendance();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('대시보드 데이터를 불러오는데 실패했습니다.', 'error');
    }
}

// 통계 업데이트
function updateStats() {
    const totalUsers = dashboardData.users.length;
    const todayCount = dashboardData.todayAttendance.length;
    const totalAttendance = dashboardData.attendance.length;
    const attendanceRate = totalUsers > 0 ? Math.round((todayCount / totalUsers) * 100) : 0;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('todayAttendance').textContent = todayCount;
    document.getElementById('totalAttendance').textContent = totalAttendance;
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';

    // 애니메이션 효과
    animateValue('totalUsers', 0, totalUsers, 1000);
    animateValue('todayAttendance', 0, todayCount, 1000);
    animateValue('totalAttendance', 0, totalAttendance, 1000);
}

// 숫자 애니메이션
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        if (id === 'attendanceRate') {
            element.textContent = Math.round(current) + '%';
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// 최근 출석 기록 표시
function displayRecentAttendance() {
    const container = document.getElementById('recentAttendance');
    if (!container) return;

    const recentRecords = dashboardData.attendance
        .sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time))
        .slice(0, 10);

    if (recentRecords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>아직 출석 기록이 없습니다</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recentRecords.map(record => `
        <div class="recent-item">
            <div class="recent-avatar">
                ${getInitials(record.user_name)}
            </div>
            <div class="recent-info">
                <h4>${record.user_name}</h4>
                <p>
                    <i class="fas fa-calendar-alt"></i> ${record.event_name || '일반 출석'}
                    ${record.location ? `<i class="fas fa-map-marker-alt"></i> ${record.location}` : ''}
                </p>
            </div>
            <div class="recent-time">
                ${getRelativeTime(record.check_in_time)}
            </div>
        </div>
    `).join('');
}

// 사용자 목록 로드 및 표시
async function loadUserList() {
    const container = document.getElementById('userListContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 로딩 중...</div>';

    try {
        const usersResponse = await fetchUsers(1, 1000);
        const users = usersResponse.data || [];

        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-slash"></i>
                    <p>등록된 사용자가 없습니다</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="overflow-x: auto;">
                <table class="user-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                            <th style="padding: 12px; text-align: left;">이름</th>
                            <th style="padding: 12px; text-align: left;">이메일</th>
                            <th style="padding: 12px; text-align: left;">전화번호</th>
                            <th style="padding: 12px; text-align: left;">부서</th>
                            <th style="padding: 12px; text-align: center;">등록일</th>
                            <th style="padding: 12px; text-align: center;">작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 12px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                                            ${getInitials(user.name)}
                                        </div>
                                        <strong>${user.name}</strong>
                                    </div>
                                </td>
                                <td style="padding: 12px;">${user.email || '-'}</td>
                                <td style="padding: 12px;">${user.phone || '-'}</td>
                                <td style="padding: 12px;">${user.department || '-'}</td>
                                <td style="padding: 12px; text-align: center;">
                                    <small style="color: #666;">
                                        ${new Date(user.created_at).toLocaleDateString('ko-KR')}
                                    </small>
                                </td>
                                <td style="padding: 12px; text-align: center;">
                                    <button 
                                        onclick="deleteIndividualUser('${user.id}', '${user.name}')" 
                                        class="btn" 
                                        style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 14px;">
                                        <i class="fas fa-trash"></i> 삭제
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading user list:', error);
        container.innerHTML = `
            <div class="empty-state" style="color: #dc3545;">
                <i class="fas fa-exclamation-circle"></i>
                <p>사용자 목록을 불러오는데 실패했습니다</p>
                <button onclick="loadUserList()" class="btn" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                    <i class="fas fa-sync-alt"></i> 다시 시도
                </button>
            </div>
        `;
    }
}

// 개별 사용자 삭제
async function deleteIndividualUser(userId, userName) {
    const confirm1 = confirm(`정말로 "${userName}" 사용자를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`);
    if (!confirm1) return;

    const confirm2 = confirm(`마지막 확인:\n\n"${userName}" 사용자와 관련된 모든 출석 기록도 함께 삭제됩니다.\n\n계속하시겠습니까?`);
    if (!confirm2) return;

    try {
        console.log(`🗑️ Deleting user: ${userName} (ID: ${userId})`);
        await deleteUser(userId);
        console.log(`✅ User deleted: ${userId}`);

        const attendanceResponse = await fetchAttendance(1, 10000);
        const userAttendance = attendanceResponse.data.filter(a => a.user_id === userId);
        
        for (const record of userAttendance) {
            await deleteAttendance(record.id);
            console.log(`✅ Attendance record deleted: ${record.id}`);
        }

        alert(`✅ "${userName}" 사용자가 삭제되었습니다.\n삭제된 출석 기록: ${userAttendance.length}건`);
        
        await loadDashboardData();
        await loadUserList();
        
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        alert(`❌ 사용자 삭제 실패!\n\n에러: ${error.message}`);
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    loadUserList();

    // 30초마다 자동 새로고침
    setInterval(() => {
        loadDashboardData();
    }, 30000);
});
