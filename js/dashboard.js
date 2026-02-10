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

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();

    // 30초마다 자동 새로고침
    setInterval(() => {
        loadDashboardData();
    }, 30000);
});
