// QR 코드 스캐너 페이지 스크립트

let videoStream = null;
let scannerActive = false;
let scannedUsers = new Set();
let todayScans = [];

document.addEventListener('DOMContentLoaded', () => {
    const startScannerBtn = document.getElementById('startScanner');
    const stopScannerBtn = document.getElementById('stopScanner');
    const scannerContainer = document.getElementById('scannerContainer');
    const scannerPlaceholder = document.getElementById('scannerPlaceholder');
    const eventNameInput = document.getElementById('eventName');
    const refreshTodayBtn = document.getElementById('refreshToday');
    const video = document.getElementById('qrVideo');
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    
    // 데이터 가져오기 (스캐너 페이지)
    const importDataBtnScanner = document.getElementById('importDataBtnScanner');
    const importFileInputScanner = document.getElementById('importFileInputScanner');
    
    if (importDataBtnScanner) {
        importDataBtnScanner.addEventListener('click', () => {
            importFileInputScanner.click();
        });
        
        importFileInputScanner.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const result = await importData(file);
                showNotification(
                    `✅ 데이터 가져오기 완료!\n👥 사용자: ${result.usersImported}명\n📋 출석기록: ${result.attendanceImported}건\n\n이제 QR 스캔이 가능합니다!`,
                    'success'
                );
            } catch (error) {
                showNotification(`❌ 가져오기 실패: ${error.message}`, 'error');
            }
            
            importFileInputScanner.value = '';
        });
    }

    // 기본 이벤트명 설정
    eventNameInput.value = `${formatDate(new Date())} 출석`;

    // 스캐너 시작
    startScannerBtn.addEventListener('click', async () => {
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            video.srcObject = videoStream;
            video.setAttribute('playsinline', true);
            video.play();

            scannerPlaceholder.classList.add('hidden');
            scannerContainer.classList.remove('hidden');
            startScannerBtn.classList.add('hidden');
            stopScannerBtn.classList.remove('hidden');
            scannerActive = true;

            showNotification('스캐너가 시작되었습니다.', 'success');
            requestAnimationFrame(scanQRCode);
        } catch (error) {
            console.error('Camera error:', error);
            showNotification('카메라에 접근할 수 없습니다. 권한을 확인해주세요.', 'error');
        }
    });

    // 스캐너 중지
    stopScannerBtn.addEventListener('click', () => {
        stopScanner();
    });

    function stopScanner() {
        scannerActive = false;
        
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }

        scannerContainer.classList.add('hidden');
        scannerPlaceholder.classList.remove('hidden');
        startScannerBtn.classList.remove('hidden');
        stopScannerBtn.classList.add('hidden');

        showNotification('스캐너가 중지되었습니다.', 'info');
    }

    // QR 코드 스캔
    async function scanQRCode() {
        if (!scannerActive) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert'
            });

            if (code && code.data) {
                await handleQRCodeDetected(code.data);
            }
        }

        if (scannerActive) {
            requestAnimationFrame(scanQRCode);
        }
    }

    // QR 코드 감지 처리
    async function handleQRCodeDetected(qrData) {
        // 중복 스캔 방지 (3초)
        if (scannedUsers.has(qrData)) {
            return;
        }

        scannedUsers.add(qrData);
        setTimeout(() => scannedUsers.delete(qrData), 3000);

        // 사용자 찾기
        const usersResponse = await fetchUsers(1, 1000);
        const users = usersResponse.data || [];
        const user = users.find(u => u.qr_code === qrData);

        if (!user) {
            showNotification('등록되지 않은 QR 코드입니다.', 'error');
            return;
        }

        // 출석 체크
        const eventName = eventNameInput.value.trim() || `${formatDate(new Date())} 출석`;
        
        // 오늘 이미 같은 이벤트에 출석했는지 확인
        const today = formatDate(new Date());
        const attendanceResponse = await fetchAttendance(1, 10000);
        const allAttendance = attendanceResponse.data || [];
        
        const duplicateCheck = allAttendance.find(record => {
            const recordDate = formatDate(new Date(record.check_in_time));
            return record.user_id === user.id && 
                   record.event_name === eventName && 
                   recordDate === today;
        });

        if (duplicateCheck) {
            showNotification(
                `${user.name}님은 이미 "${eventName}" 출석이 완료되었습니다. (${formatTime(duplicateCheck.check_in_time)})`,
                'error'
            );
            return;
        }

        const attendanceData = {
            user_id: user.id,
            user_name: user.name,
            check_in_time: new Date().toISOString(),
            location: '스캐너',
            event_name: eventName
        };

        const attendance = await createAttendance(attendanceData);
        if (attendance) {
            showNotification(`${user.name}님 출석 완료!`, 'success');
            displayScanResult(user, attendance);
            updateScanCount();
            loadTodayAttendance();
        }
    }

    // 스캔 결과 표시
    function displayScanResult(user, attendance) {
        const scanResults = document.getElementById('scanResults');
        const emptyState = scanResults.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const scanItem = document.createElement('div');
        scanItem.className = 'scan-item';
        scanItem.innerHTML = `
            <h4>
                <i class="fas fa-check-circle success-icon"></i>
                ${user.name}
            </h4>
            <p><i class="fas fa-calendar-alt"></i> ${attendance.event_name}</p>
            <p><i class="fas fa-clock"></i> ${formatDateTime(attendance.check_in_time)}</p>
            ${user.department ? `<p><i class="fas fa-building"></i> ${user.department}</p>` : ''}
        `;

        scanResults.insertBefore(scanItem, scanResults.firstChild);
    }

    // 스캔 카운트 업데이트
    function updateScanCount() {
        const scanCount = document.getElementById('scanCount');
        const count = document.querySelectorAll('.scan-item').length;
        scanCount.textContent = `${count}명 출석`;
    }

    // 오늘 출석 현황 로드
    async function loadTodayAttendance() {
        const container = document.getElementById('todayAttendanceList');
        container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 로딩 중...</div>';

        const response = await fetchAttendance(1, 1000);
        const allAttendance = response.data || [];

        const today = formatDate(new Date());
        todayScans = allAttendance.filter(record => {
            const recordDate = formatDate(new Date(record.check_in_time));
            return recordDate === today;
        }).sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time));

        if (todayScans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>오늘 출석 기록이 없습니다</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th>이름</th>
                        <th>행사명</th>
                        <th>시간</th>
                        <th>위치</th>
                    </tr>
                </thead>
                <tbody>
                    ${todayScans.map(record => `
                        <tr>
                            <td><strong>${record.user_name}</strong></td>
                            <td>${record.event_name || '-'}</td>
                            <td>${formatTime(record.check_in_time)}</td>
                            <td>${record.location || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // 새로고침 버튼
    refreshTodayBtn.addEventListener('click', () => {
        loadTodayAttendance();
        showNotification('출석 현황을 새로고침했습니다.', 'info');
    });

    // 초기 로드
    loadTodayAttendance();
});
