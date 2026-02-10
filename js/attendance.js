// 출석 기록 관리 페이지 스크립트

let allAttendanceRecords = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 50;

document.addEventListener('DOMContentLoaded', () => {
    const filterDateInput = document.getElementById('filterDate');
    const filterUserInput = document.getElementById('filterUser');
    const filterEventInput = document.getElementById('filterEvent');
    const applyFilterBtn = document.getElementById('applyFilter');
    const resetFilterBtn = document.getElementById('resetFilter');
    const refreshListBtn = document.getElementById('refreshList');
    const exportCSVBtn = document.getElementById('exportCSV');
    const exportExcelBtn = document.getElementById('exportExcel');
    const removeDuplicatesBtn = document.getElementById('removeDuplicates');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    // 출석 기록 로드
    async function loadAttendanceRecords() {
        const container = document.getElementById('attendanceList');
        container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 로딩 중...</div>';

        const response = await fetchAttendance(1, 10000);
        allAttendanceRecords = response.data || [];
        filteredRecords = [...allAttendanceRecords];

        document.getElementById('totalRecords').textContent = `전체 ${allAttendanceRecords.length}건`;

        displayAttendanceRecords();
    }

    // 출석 기록 표시
    function displayAttendanceRecords() {
        const container = document.getElementById('attendanceList');
        const pagination = document.getElementById('pagination');

        if (filteredRecords.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>출석 기록이 없습니다</p>
                </div>
            `;
            pagination.classList.add('hidden');
            return;
        }

        // 페이지네이션 계산
        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, filteredRecords.length);
        const pageRecords = filteredRecords.slice(startIndex, endIndex);

        // 테이블 생성
        container.innerHTML = `
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th>이름</th>
                        <th>행사/수업명</th>
                        <th>출석 시간</th>
                        <th>위치</th>
                        <th>작업</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageRecords.map(record => `
                        <tr>
                            <td><strong>${record.user_name}</strong></td>
                            <td>${record.event_name || '-'}</td>
                            <td>${formatDateTime(record.check_in_time)}</td>
                            <td>${record.location || '-'}</td>
                            <td>
                                <button class="icon-btn delete-record-btn" 
                                        data-record-id="${record.id}" 
                                        data-user-name="${record.user_name}"
                                        title="삭제">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // 삭제 버튼 이벤트
        document.querySelectorAll('.delete-record-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const recordId = btn.dataset.recordId;
                const userName = btn.dataset.userName;

                if (confirm(`${userName}님의 출석 기록을 삭제하시겠습니까?`)) {
                    const success = await deleteAttendance(recordId);
                    if (success) {
                        showNotification('출석 기록이 삭제되었습니다.', 'success');
                        loadAttendanceRecords();
                    }
                }
            });
        });

        // 페이지네이션 업데이트
        pagination.classList.remove('hidden');
        document.getElementById('pageInfo').textContent = `${currentPage} / ${totalPages} 페이지`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // 필터 적용
    function applyFilters() {
        const dateFilter = filterDateInput.value;
        const userFilter = filterUserInput.value.toLowerCase().trim();
        const eventFilter = filterEventInput.value.toLowerCase().trim();

        filteredRecords = allAttendanceRecords.filter(record => {
            // 날짜 필터
            if (dateFilter) {
                const recordDate = formatDate(new Date(record.check_in_time));
                if (recordDate !== dateFilter) return false;
            }

            // 사용자 이름 필터
            if (userFilter) {
                if (!record.user_name.toLowerCase().includes(userFilter)) return false;
            }

            // 행사명 필터
            if (eventFilter) {
                const eventName = record.event_name || '';
                if (!eventName.toLowerCase().includes(eventFilter)) return false;
            }

            return true;
        });

        currentPage = 1;
        displayAttendanceRecords();
        
        document.getElementById('totalRecords').textContent = 
            `검색 결과 ${filteredRecords.length}건 / 전체 ${allAttendanceRecords.length}건`;
    }

    // 필터 초기화
    function resetFilters() {
        filterDateInput.value = '';
        filterUserInput.value = '';
        filterEventInput.value = '';
        filteredRecords = [...allAttendanceRecords];
        currentPage = 1;
        displayAttendanceRecords();
        document.getElementById('totalRecords').textContent = `전체 ${allAttendanceRecords.length}건`;
        showNotification('필터가 초기화되었습니다.', 'info');
    }

    // CSV 다운로드
    function exportToCSV() {
        if (filteredRecords.length === 0) {
            showNotification('다운로드할 데이터가 없습니다.', 'error');
            return;
        }

        const headers = ['이름', '행사/수업명', '출석 시간', '위치'];
        const csvContent = [
            headers.join(','),
            ...filteredRecords.map(record => [
                `"${record.user_name}"`,
                `"${record.event_name || ''}"`,
                `"${formatDateTime(record.check_in_time)}"`,
                `"${record.location || ''}"`
            ].join(','))
        ].join('\n');

        // BOM 추가 (한글 깨짐 방지)
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `출석기록_${formatDate(new Date())}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('CSV 파일이 다운로드되었습니다.', 'success');
    }

    // 엑셀 다운로드
    async function exportToExcel() {
        if (filteredRecords.length === 0) {
            showNotification('다운로드할 데이터가 없습니다.', 'error');
            return;
        }

        // 동적 필드 정보 가져오기
        const savedFields = localStorage.getItem('registrationFields');
        let formFields = [];
        if (savedFields) {
            try {
                formFields = JSON.parse(savedFields);
            } catch (e) {
                console.error('Failed to load field settings:', e);
            }
        }

        // 사용자 정보와 출석 기록 매핑
        const usersResponse = await fetchUsers(1, 10000);
        const users = usersResponse.data || [];
        const userMap = {};
        users.forEach(user => {
            userMap[user.id] = user;
        });

        // 워크시트 데이터 생성
        const worksheetData = [
            ['출석 기록 리포트'],
            [`생성일시: ${formatDateTime(new Date())}`],
            [`총 기록 수: ${filteredRecords.length}건`],
            [], // 빈 행
        ];

        // 동적 헤더 생성
        const headers = ['번호', '이름'];
        formFields.forEach(field => {
            if (field.id !== 'name') {
                headers.push(field.label);
            }
        });
        headers.push('행사/수업명', '출석 시간', '출석 날짜', '출석 시각', '위치');
        worksheetData.push(headers);

        // 데이터 추가
        filteredRecords.forEach((record, index) => {
            const checkInDate = new Date(record.check_in_time);
            const user = userMap[record.user_id] || {};
            
            const row = [
                index + 1,
                record.user_name
            ];

            // 동적 필드 데이터 추가
            formFields.forEach(field => {
                if (field.id !== 'name') {
                    row.push(user[field.id] || '-');
                }
            });

            row.push(
                record.event_name || '-',
                formatDateTime(record.check_in_time),
                formatDate(checkInDate),
                formatTime(checkInDate),
                record.location || '-'
            );

            worksheetData.push(row);
        });

        // 통계 추가
        worksheetData.push([]);
        worksheetData.push(['통계 정보']);
        
        // 날짜별 출석 통계
        const dateStats = {};
        filteredRecords.forEach(record => {
            const date = formatDate(new Date(record.check_in_time));
            dateStats[date] = (dateStats[date] || 0) + 1;
        });

        worksheetData.push([]);
        worksheetData.push(['날짜별 출석 현황']);
        Object.entries(dateStats).sort().forEach(([date, count]) => {
            worksheetData.push([date, `${count}명`]);
        });

        // 행사별 출석 통계
        const eventStats = {};
        filteredRecords.forEach(record => {
            const event = record.event_name || '일반 출석';
            eventStats[event] = (eventStats[event] || 0) + 1;
        });

        worksheetData.push([]);
        worksheetData.push(['행사별 출석 현황']);
        Object.entries(eventStats).sort((a, b) => b[1] - a[1]).forEach(([event, count]) => {
            worksheetData.push([event, `${count}명`]);
        });

        // 워크북 생성
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // 열 너비 설정 (동적)
        const colWidths = [
            { wch: 8 },  // 번호
            { wch: 15 }  // 이름
        ];
        formFields.forEach(field => {
            if (field.id !== 'name') {
                colWidths.push({ wch: 15 });
            }
        });
        colWidths.push(
            { wch: 25 }, // 행사명
            { wch: 20 }, // 출석 시간
            { wch: 12 }, // 출석 날짜
            { wch: 10 }, // 출석 시각
            { wch: 15 }  // 위치
        );
        ws['!cols'] = colWidths;

        // 워크시트 추가
        XLSX.utils.book_append_sheet(wb, ws, '출석 기록');

        // 파일 다운로드
        const fileName = `출석기록_${formatDate(new Date())}.xlsx`;
        XLSX.writeFile(wb, fileName);

        showNotification('엑셀 파일이 다운로드되었습니다.', 'success');
    }

    // 페이지네이션 버튼
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayAttendanceRecords();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayAttendanceRecords();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // 이벤트 리스너
    applyFilterBtn.addEventListener('click', () => {
        applyFilters();
        showNotification('필터가 적용되었습니다.', 'info');
    });

    resetFilterBtn.addEventListener('click', resetFilters);

    refreshListBtn.addEventListener('click', () => {
        loadAttendanceRecords();
        showNotification('출석 기록을 새로고침했습니다.', 'info');
    });

    exportCSVBtn.addEventListener('click', exportToCSV);

    exportExcelBtn.addEventListener('click', exportToExcel);

    // 중복 제거 버튼
    removeDuplicatesBtn.addEventListener('click', async () => {
        await removeDuplicateAttendance();
    });

    // 중복 출석 기록 제거
    async function removeDuplicateAttendance() {
        if (allAttendanceRecords.length === 0) {
            showNotification('출석 기록이 없습니다.', 'error');
            return;
        }

        // 중복 찾기 (같은 날, 같은 사용자, 같은 이벤트)
        const duplicateMap = {};
        const duplicateIds = [];

        allAttendanceRecords.forEach(record => {
            const date = formatDate(new Date(record.check_in_time));
            const key = `${record.user_id}_${record.event_name}_${date}`;
            
            if (!duplicateMap[key]) {
                duplicateMap[key] = [];
            }
            duplicateMap[key].push(record);
        });

        // 각 그룹에서 가장 먼저 체크한 것만 남기고 나머지는 중복으로 표시
        Object.values(duplicateMap).forEach(records => {
            if (records.length > 1) {
                // 시간순 정렬
                records.sort((a, b) => new Date(a.check_in_time) - new Date(b.check_in_time));
                // 첫 번째를 제외한 나머지는 삭제 대상
                for (let i = 1; i < records.length; i++) {
                    duplicateIds.push(records[i].id);
                }
            }
        });

        if (duplicateIds.length === 0) {
            showNotification('중복된 출석 기록이 없습니다.', 'info');
            return;
        }

        const confirmMsg = `총 ${duplicateIds.length}건의 중복 출석 기록을 삭제하시겠습니까?\n(같은 날, 같은 사용자, 같은 이벤트의 중복 기록)`;
        
        if (!confirm(confirmMsg)) {
            return;
        }

        // 중복 기록 삭제
        let deletedCount = 0;
        for (const id of duplicateIds) {
            const success = await deleteAttendance(id);
            if (success) {
                deletedCount++;
            }
        }

        showNotification(`${deletedCount}건의 중복 기록이 삭제되었습니다.`, 'success');
        loadAttendanceRecords();
    }

    // Enter 키로 검색
    [filterDateInput, filterUserInput, filterEventInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    });

    // 초기 로드
    loadAttendanceRecords();
});
