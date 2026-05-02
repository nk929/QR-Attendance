// 사용자 등록 페이지 스크립트 (동적 필드 관리 포함)

let currentQRCode = null;
let currentUser = null;

// 기본 입력 필드 정의
let formFields = [
    {
        id: 'name',
        label: '이름',
        icon: 'fa-user',
        type: 'text',
        placeholder: '홍길동',
        required: true,
        enabled: true
    },
    {
        id: 'email',
        label: '이메일',
        icon: 'fa-envelope',
        type: 'email',
        placeholder: 'user@example.com',
        required: false,
        enabled: true
    },
    {
        id: 'phone',
        label: '전화번호',
        icon: 'fa-phone',
        type: 'tel',
        placeholder: '010-1234-5678',
        required: false,
        enabled: true
    },
    {
        id: 'department',
        label: '부서/학과',
        icon: 'fa-building',
        type: 'text',
        placeholder: '컴퓨터공학과',
        required: false,
        enabled: true
    }
];

// 로컬 스토리지에서 필드 설정 로드
function loadFieldSettings() {
    const saved = localStorage.getItem('registrationFields');
    if (saved) {
        try {
            formFields = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load field settings:', e);
        }
    }
}

// 로컬 스토리지에 필드 설정 저장
function saveFieldSettings() {
    localStorage.setItem('registrationFields', JSON.stringify(formFields));
}

// 폼 필드 렌더링 (활성화된 필드만)
function renderFormFields() {
    const container = document.getElementById('dynamicFormFields');
    const enabledFields = formFields.filter(field => field.enabled);
    container.innerHTML = enabledFields.map(field => `
        <div class="form-group">
            <label for="${field.id}">
                <i class="fas ${field.icon}"></i> ${field.label} ${field.required ? '*' : ''}
            </label>
            <input 
                type="${field.type}" 
                id="${field.id}" 
                name="${field.id}" 
                ${field.required ? 'required' : ''} 
                placeholder="${field.placeholder}">
        </div>
    `).join('');
}

// 필드 목록 렌더링
function renderFieldList() {
    const container = document.getElementById('fieldList');
    container.innerHTML = formFields.map((field, index) => `
        <div class="field-item ${field.required ? 'required' : ''} ${!field.enabled ? 'disabled' : ''}" data-index="${index}">
            <div class="field-drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="field-info">
                <h4>
                    <i class="fas ${field.icon}"></i> ${field.label}
                    <span class="field-badge ${field.required ? 'required' : 'optional'}">
                        ${field.required ? '필수' : '선택'}
                    </span>
                    <span class="field-badge ${field.enabled ? 'enabled' : 'disabled-badge'}">
                        ${field.enabled ? '사용' : '미사용'}
                    </span>
                </h4>
                <p>타입: ${field.type} | ID: ${field.id}</p>
            </div>
            <div class="field-actions">
                <label class="toggle-switch" title="${field.enabled ? '사용 중' : '미사용'}">
                    <input type="checkbox" class="field-toggle" data-index="${index}" ${field.enabled ? 'checked' : ''} ${field.id === 'name' ? 'disabled' : ''}>
                    <span class="toggle-slider"></span>
                </label>
                <button class="field-edit-btn" data-index="${index}" title="수정">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="field-delete-btn" data-index="${index}" ${field.id === 'name' ? 'disabled' : ''} title="${field.id === 'name' ? '이름은 필수 항목입니다' : '삭제'}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // 토글 이벤트 리스너
    document.querySelectorAll('.field-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const index = parseInt(toggle.dataset.index);
            toggleField(index, e.target.checked);
        });
    });

    // 이벤트 리스너 추가
    document.querySelectorAll('.field-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            openFieldModal(index);
        });
    });

    document.querySelectorAll('.field-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            deleteField(index);
        });
    });
}

// 필드 활성화/비활성화 토글
function toggleField(index, enabled) {
    const field = formFields[index];
    
    if (field.id === 'name') {
        showNotification('이름 항목은 항상 사용되어야 합니다.', 'error');
        renderFieldList();
        return;
    }
    
    formFields[index].enabled = enabled;
    saveFieldSettings();
    renderFormFields();
    renderFieldList();
    
    showNotification(
        `"${field.label}" 항목이 ${enabled ? '활성화' : '비활성화'}되었습니다.`,
        enabled ? 'success' : 'info'
    );
}

// 필드 추가/수정 모달 열기
function openFieldModal(editIndex = null) {
    const isEdit = editIndex !== null;
    const field = isEdit ? formFields[editIndex] : {
        id: '',
        label: '',
        icon: 'fa-text',
        type: 'text',
        placeholder: '',
        required: false,
        enabled: true
    };

    const modalHTML = `
        <div class="modal-overlay" id="fieldModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i>
                        ${isEdit ? '항목 수정' : '새 항목 추가'}
                    </h3>
                    <button class="modal-close" onclick="closeFieldModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="fieldForm" class="form">
                        <div class="form-group">
                            <label for="fieldLabel">
                                <i class="fas fa-tag"></i> 항목 이름 *
                            </label>
                            <input type="text" id="fieldLabel" value="${field.label}" required placeholder="예: 학번">
                        </div>

                        <div class="form-group">
                            <label for="fieldId">
                                <i class="fas fa-key"></i> 필드 ID *
                            </label>
                            <input type="text" id="fieldId" value="${field.id}" ${isEdit ? 'readonly' : ''} required placeholder="영문_소문자 (예: student_id)">
                            <small style="color: #999;">영문, 숫자, 언더스코어(_)만 사용 가능</small>
                        </div>

                        <div class="form-group">
                            <label for="fieldType">
                                <i class="fas fa-list"></i> 입력 타입 *
                            </label>
                            <select id="fieldType" required>
                                <option value="text" ${field.type === 'text' ? 'selected' : ''}>텍스트</option>
                                <option value="email" ${field.type === 'email' ? 'selected' : ''}>이메일</option>
                                <option value="tel" ${field.type === 'tel' ? 'selected' : ''}>전화번호</option>
                                <option value="number" ${field.type === 'number' ? 'selected' : ''}>숫자</option>
                                <option value="date" ${field.type === 'date' ? 'selected' : ''}>날짜</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="fieldIcon">
                                <i class="fas fa-icons"></i> 아이콘
                            </label>
                            <select id="fieldIcon">
                                <option value="fa-user" ${field.icon === 'fa-user' ? 'selected' : ''}>👤 사용자</option>
                                <option value="fa-envelope" ${field.icon === 'fa-envelope' ? 'selected' : ''}>✉️ 이메일</option>
                                <option value="fa-phone" ${field.icon === 'fa-phone' ? 'selected' : ''}>📞 전화</option>
                                <option value="fa-building" ${field.icon === 'fa-building' ? 'selected' : ''}>🏢 건물</option>
                                <option value="fa-id-card" ${field.icon === 'fa-id-card' ? 'selected' : ''}>🪪 신분증</option>
                                <option value="fa-graduation-cap" ${field.icon === 'fa-graduation-cap' ? 'selected' : ''}>🎓 학생</option>
                                <option value="fa-calendar" ${field.icon === 'fa-calendar' ? 'selected' : ''}>📅 날짜</option>
                                <option value="fa-map-marker-alt" ${field.icon === 'fa-map-marker-alt' ? 'selected' : ''}>📍 위치</option>
                                <option value="fa-text" ${field.icon === 'fa-text' ? 'selected' : ''}>📝 텍스트</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="fieldPlaceholder">
                                <i class="fas fa-comment"></i> 안내 문구
                            </label>
                            <input type="text" id="fieldPlaceholder" value="${field.placeholder}" placeholder="예: 학번을 입력하세요">
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="fieldRequired" ${field.required ? 'checked' : ''} style="width: auto;">
                                <span>필수 입력 항목</span>
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeFieldModal()">
                        <i class="fas fa-times"></i> 취소
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveField(${editIndex})">
                        <i class="fas fa-check"></i> ${isEdit ? '수정' : '추가'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 필드 저장
function saveField(editIndex) {
    const label = document.getElementById('fieldLabel').value.trim();
    const id = document.getElementById('fieldId').value.trim();
    const type = document.getElementById('fieldType').value;
    const icon = document.getElementById('fieldIcon').value;
    const placeholder = document.getElementById('fieldPlaceholder').value.trim();
    const required = document.getElementById('fieldRequired').checked;

    if (!label || !id) {
        showNotification('항목 이름과 필드 ID는 필수입니다.', 'error');
        return;
    }

    // ID 유효성 검사
    if (!/^[a-z0-9_]+$/.test(id)) {
        showNotification('필드 ID는 영문 소문자, 숫자, 언더스코어(_)만 사용 가능합니다.', 'error');
        return;
    }

    // 중복 ID 체크 (수정이 아닌 경우)
    if (editIndex === null && formFields.some(f => f.id === id)) {
        showNotification('이미 사용 중인 필드 ID입니다.', 'error');
        return;
    }

    const fieldData = { 
        id, 
        label, 
        icon, 
        type, 
        placeholder, 
        required,
        enabled: editIndex !== null ? formFields[editIndex].enabled : true
    };

    if (editIndex !== null) {
        formFields[editIndex] = fieldData;
        showNotification('항목이 수정되었습니다.', 'success');
    } else {
        formFields.push(fieldData);
        showNotification('새 항목이 추가되었습니다.', 'success');
    }

    saveFieldSettings();
    renderFormFields();
    renderFieldList();
    closeFieldModal();
}

// 필드 삭제
function deleteField(index) {
    const field = formFields[index];
    
    if (field.id === 'name' && field.required) {
        showNotification('이름 항목은 삭제할 수 없습니다.', 'error');
        return;
    }

    if (confirm(`"${field.label}" 항목을 삭제하시겠습니까?`)) {
        formFields.splice(index, 1);
        saveFieldSettings();
        renderFormFields();
        renderFieldList();
        showNotification('항목이 삭제되었습니다.', 'success');
    }
}

// 모달 닫기
function closeFieldModal() {
    const modal = document.getElementById('fieldModal');
    if (modal) {
        modal.remove();
    }
}

// 사용자 등록 폼 처리
document.addEventListener('DOMContentLoaded', () => {
    // 필드 설정 로드
    loadFieldSettings();
    renderFormFields();
    renderFieldList();

    const registerForm = document.getElementById('registerForm');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const qrResult = document.getElementById('qrResult');
    const downloadQRBtn = document.getElementById('downloadQR');
    const printQRBtn = document.getElementById('printQR');
    const refreshUsersBtn = document.getElementById('refreshUsers');
    const searchInput = document.getElementById('searchInput');
    const addFieldBtn = document.getElementById('addFieldBtn');
    
    // 데이터 동기화 버튼
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const importFileInput = document.getElementById('importFileInput');

    // 새 항목 추가 버튼
    addFieldBtn.addEventListener('click', () => {
        openFieldModal();
    });
    
    // 데이터 내보내기
    exportDataBtn.addEventListener('click', () => {
        if (exportData()) {
            showNotification('데이터가 성공적으로 내보내졌습니다! 파일을 모바일로 전송하세요.', 'success');
        } else {
            showNotification('데이터 내보내기에 실패했습니다.', 'error');
        }
    });
    
    // 데이터 가져오기
    importDataBtn.addEventListener('click', () => {
        importFileInput.click();
    });
    
    importFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const result = await importData(file);
            showNotification(
                `데이터 가져오기 완료!\n사용자: ${result.usersImported}명\n출석기록: ${result.attendanceImported}건`,
                'success'
            );
            loadUsersList();
        } catch (error) {
            showNotification(`가져오기 실패: ${error.message}`, 'error');
        }
        
        // 파일 입력 초기화
        importFileInput.value = '';
    });

    // 폼 제출 처리
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 동적으로 폼 데이터 수집
        const formData = {
            qr_code: generateUUID(),
            status: 'active'
        };

        formFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                formData[field.id] = input.value.trim();
            }
        });

        // 사용자 등록
        const user = await createUser(formData);
        if (user) {
            currentUser = user;
            showNotification('사용자가 성공적으로 등록되었습니다!', 'success');
            generateQRCode(user);
            registerForm.reset();
            loadUsersList();
        }
    });

    // QR 코드 생성
    function generateQRCode(user) {
        qrPlaceholder.classList.add('hidden');
        qrResult.classList.remove('hidden');

        document.getElementById('registeredName').textContent = `${user.name}님의 QR 코드`;
        
        const qrDisplay = document.getElementById('qrCodeDisplay');
        qrDisplay.innerHTML = '';

        currentQRCode = new QRCode(qrDisplay, {
            text: user.qr_code,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // QR 코드 다운로드
    downloadQRBtn.addEventListener('click', () => {
        if (!currentUser) return;

        const canvas = document.querySelector('#qrCodeDisplay canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `QR_${currentUser.name}_${currentUser.qr_code.substring(0, 8)}.png`;
            link.href = canvas.toDataURL();
            link.click();
            showNotification('QR 코드가 다운로드되었습니다!', 'success');
        }
    });

    // QR 코드 인쇄
    printQRBtn.addEventListener('click', () => {
        if (!currentUser) return;
        openPrintOptionsModal();
    });

    // 사용자 목록 로드
    async function loadUsersList() {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 로딩 중...</div>';

        const response = await fetchUsers(1, 1000);
        const users = response.data || [];

        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>등록된 사용자가 없습니다</p>
                </div>
            `;
            return;
        }

        displayUsers(users);
    }

    // 사용자 목록 표시
    function displayUsers(users) {
        const usersList = document.getElementById('usersList');
        
        usersList.innerHTML = users.map(user => {
            let detailsHTML = '';
            formFields.forEach(field => {
                if (field.id !== 'name' && user[field.id]) {
                    detailsHTML += `<p><i class="fas ${field.icon}"></i> ${user[field.id]}</p>`;
                }
            });

            return `
                <div class="user-item" data-user-id="${user.id}">
                    <div class="user-avatar">
                        ${getInitials(user.name)}
                    </div>
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        ${detailsHTML}
                        <p style="font-size: 0.85rem; color: #999;">
                            <i class="fas fa-clock"></i> 등록일: ${formatDateTime(user.created_at)}
                        </p>
                    </div>
                    <div class="user-actions">
                        <button class="icon-btn view-qr-btn" title="QR 코드 보기" data-user-id="${user.id}">

                            <i class="fas fa-qrcode"></i>
                        </button>
                        <button class="icon-btn delete-user-btn" title="삭제" data-user-id="${user.id}" data-user-name="${user.name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

               // QR 코드 보기 버튼 이벤트
        document.querySelectorAll('.view-qr-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.dataset.userId;
                console.log('🔍 QR 보기 클릭 - 사용자 ID:', userId);
                
                // Firestore에서 최신 데이터 다시 조회
                try {
                    const user = await fetchUserById(userId);
                    if (user) {
                        console.log('✅ Firestore에서 사용자 조회 성공');
                        console.log('   이름:', user.name);
                        console.log('   QR 코드:', user.qr_code);
                        currentUser = user;
                        generateQRCode(user);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        showNotification('사용자를 찾을 수 없습니다.', 'error');
                    }
                } catch (error) {
                    console.error('❌ 사용자 조회 실패:', error);
                    showNotification('사용자 정보를 불러오는데 실패했습니다.', 'error');
                }
            });
        });


        // 삭제 버튼 이벤트
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.dataset.userId;
                const userName = btn.dataset.userName;
                
                if (confirm(`${userName}님을 정말 삭제하시겠습니까?`)) {
                    const success = await deleteUser(userId);
                    if (success) {
                        showNotification('사용자가 삭제되었습니다.', 'success');
                        loadUsersList();
                    }
                }
            });
        });
    }

    // 검색 기능
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            loadUsersList();
            return;
        }

        const response = await fetchUsers(1, 1000);
        const users = response.data || [];
        
        const filteredUsers = users.filter(user => {
            // 모든 필드에서 검색
            return formFields.some(field => {
                const value = user[field.id];
                return value && value.toString().toLowerCase().includes(searchTerm);
            });
        });

        displayUsers(filteredUsers);
    });

    // 새로고침 버튼
    refreshUsersBtn.addEventListener('click', () => {
        loadUsersList();
        showNotification('사용자 목록을 새로고침했습니다.', 'info');
    });

    // 초기 로드
    loadUsersList();
});

// QR 인쇄 옵션 모달
function openPrintOptionsModal() {
    const enabledFields = formFields.filter(f => f.enabled);
    
    const modalHTML = `
        <div class="modal-overlay" id="printOptionsModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-print"></i>
                        QR 코드 인쇄 옵션
                    </h3>
                    <button class="modal-close" onclick="closePrintOptionsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 20px; color: #666;">
                        <i class="fas fa-info-circle"></i> 
                        QR 코드와 함께 인쇄할 정보를 선택하세요
                    </p>
                    
                    <div class="form">
                        <div class="form-group">
                            <label style="font-weight: 600; margin-bottom: 15px; display: block;">
                                인쇄할 항목 선택
                            </label>
                            ${enabledFields.map(field => `
                                <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.2s;" 
                                       onmouseover="this.style.background='#f5f5f5'" 
                                       onmouseout="this.style.background='transparent'">
                                    <input type="checkbox" 
                                           class="print-field-checkbox" 
                                           data-field-id="${field.id}" 
                                           ${field.id === 'name' ? 'checked disabled' : 'checked'}
                                           style="width: 18px; height: 18px; cursor: pointer;">
                                    <i class="fas ${field.icon}" style="color: #666;"></i>
                                    <span style="flex: 1;">${field.label}</span>
                                    ${field.id === 'name' ? '<span style="font-size: 0.75rem; color: #999;">(필수)</span>' : ''}
                                </label>
                            `).join('')}
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="printDate" checked style="width: 18px; height: 18px;">
                                <span>인쇄 날짜 포함</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="printLogo" checked style="width: 18px; height: 18px;">
                                <span>시스템 로고/이름 포함</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label for="printSize">QR 코드 크기</label>
                            <select id="printSize" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                                <option value="small">작게 (200x200px)</option>
                                <option value="medium" selected>보통 (300x300px)</option>
                                <option value="large">크게 (400x400px)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closePrintOptionsModal()">
                        <i class="fas fa-times"></i> 취소
                    </button>
                    <button type="button" class="btn btn-primary" onclick="executePrint()">
                        <i class="fas fa-print"></i> 인쇄하기
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 인쇄 실행
function executePrint() {
    const canvas = document.querySelector('#qrCodeDisplay canvas');
    if (!canvas) return;

    // 선택된 필드 확인
    const selectedFields = [];
    document.querySelectorAll('.print-field-checkbox:checked').forEach(checkbox => {
        const fieldId = checkbox.dataset.fieldId;
        const field = formFields.find(f => f.id === fieldId);
        if (field && currentUser[fieldId]) {
            selectedFields.push({
                label: field.label,
                icon: field.icon,
                value: currentUser[fieldId]
            });
        }
    });

    // 옵션 확인
    const printDate = document.getElementById('printDate').checked;
    const printLogo = document.getElementById('printLogo').checked;
    const printSize = document.getElementById('printSize').value;

    // QR 코드 크기 설정
    const qrSizes = {
        small: '200px',
        medium: '300px',
        large: '400px'
    };
    const qrSize = qrSizes[printSize];

    // 사용자 정보 HTML 생성
    let userInfoHTML = '';
    selectedFields.forEach(field => {
        if (field.label === '이름') {
            userInfoHTML += `<h1 style="font-size: 2rem; margin-bottom: 20px; color: #333;">${field.value}</h1>`;
        } else {
            userInfoHTML += `
                <p style="margin: 8px 0; font-size: 1.1rem; color: #666;">
                    <i class="fas ${field.icon}" style="margin-right: 8px; color: #999;"></i>
                    <strong>${field.label}:</strong> ${field.value}
                </p>
            `;
        }
    });

    // 인쇄 창 생성
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>QR 코드 - ${currentUser.name}</title>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', 'Malgun Gothic', Arial, sans-serif;
                    text-align: center;
                    padding: 40px;
                    background: white;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 30px;
                    border: 2px solid #ddd;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                ${printLogo ? `
                .header {
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #667eea;
                }
                .header h2 {
                    color: #667eea;
                    font-size: 1.8rem;
                    margin-bottom: 5px;
                }
                .header p {
                    color: #999;
                    font-size: 0.9rem;
                }
                ` : ''}
                .user-info {
                    margin: 20px 0;
                }
                .qr-code {
                    margin: 30px 0;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 12px;
                }
                .qr-code img {
                    width: ${qrSize};
                    height: ${qrSize};
                    border: 3px solid #333;
                    border-radius: 8px;
                    padding: 15px;
                    background: white;
                }
                ${printDate ? `
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #ddd;
                    color: #999;
                    font-size: 0.9rem;
                }
                ` : ''}
                .instruction {
                    margin-top: 20px;
                    padding: 15px;
                    background: #E3F2FD;
                    border-radius: 8px;
                    color: #1976D2;
                    font-size: 0.95rem;
                }
                @media print {
                    body {
                        padding: 20px;
                    }
                    .container {
                        border: 1px solid #ddd;
                        box-shadow: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                ${printLogo ? `
                <div class="header">
                    <h2><i class="fas fa-qrcode"></i> QR 출석 관리 시스템</h2>
                    <p>개인 출석 확인용 QR 코드</p>
                </div>
                ` : ''}
                
                <div class="user-info">
                    ${userInfoHTML}
                </div>

                <div class="qr-code">
                    <img src="${canvas.toDataURL()}" alt="QR Code" />
                </div>

                <div class="instruction">
                    <i class="fas fa-info-circle"></i>
                    출석 체크 시 이 QR 코드를 스캐너에 보여주세요
                </div>

                ${printDate ? `
                <div class="footer">
                    <p><i class="fas fa-calendar"></i> 발급일: ${formatDate(new Date())}</p>
                    <p style="margin-top: 5px;">본인 확인용이므로 타인에게 양도할 수 없습니다</p>
                </div>
                ` : ''}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);

    closePrintOptionsModal();
    showNotification('인쇄 대화상자가 열렸습니다.', 'success');
}

// 인쇄 옵션 모달 닫기
function closePrintOptionsModal() {
    const modal = document.getElementById('printOptionsModal');
    if (modal) {
        modal.remove();
    }
}

// 전역 함수로 export (모달에서 사용)
window.saveField = saveField;
window.closeFieldModal = closeFieldModal;
window.closePrintOptionsModal = closePrintOptionsModal;
window.executePrint = executePrint;
