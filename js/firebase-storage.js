/**
 * Firebase Firestore 기반 스토리지
 * Last updated: 2026-05-02 (Fixed deleted filter)
 */

const USERS_COLLECTION = 'users';
const ATTENDANCE_COLLECTION = 'attendance';

async function fetchUsers(page = 1, limit = 1000) {
    try {
        console.log(`📥 Fetching users (page: ${page}, limit: ${limit})...`);
        const snapshot = await db.collection(USERS_COLLECTION).get();
        const allUsers = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.deleted === false) {
                allUsers.push({ id: doc.id, ...data });
            }
        });
        allUsers.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        const total = allUsers.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = allUsers.slice(startIndex, endIndex);
        console.log(`✅ Fetched ${paginatedUsers.length} users (total: ${total})`);
        return { data: paginatedUsers, total: total, page: page, limit: limit };
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
    }
}

async function fetchUserById(userId) {
    try {
        console.log(`📥 Fetching user by ID: ${userId}...`);
        const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
        if (doc.exists && !doc.data().deleted) {
            console.log(`✅ User found:`, doc.data().name);
            return { id: doc.id, ...doc.data() };
        } else {
            console.warn(`⚠️ User not found: ${userId}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching user by ID:', error);
        return null;
    }
}

async function fetchUserByQRCode(qrCode) {
    try {
        console.log(`📥 Fetching user by QR code: ${qrCode}...`);
        const snapshot = await db.collection(USERS_COLLECTION)
            .where('qr_code', '==', qrCode)
            .where('deleted', '==', false)
            .limit(1)
            .get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            console.log(`✅ User found:`, doc.data().name);
            return { id: doc.id, ...doc.data() };
        } else {
            console.warn(`⚠️ User not found with QR code: ${qrCode}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching user by QR code:', error);
        return null;
    }
}

async function createUser(userData) {
    try {
        console.log(`📤 Creating user:`, userData.name);
        if (!db) {
            throw new Error('Firestore is not initialized');
        }
        const timestamp = Date.now();
        const newUser = { ...userData, created_at: timestamp, updated_at: timestamp, deleted: false };
        console.log('💾 Saving to Firestore...');
        const docRef = await db.collection(USERS_COLLECTION).add(newUser);
        console.log(`✅ User created with ID: ${docRef.id}`);
        return { id: docRef.id, ...newUser };
    } catch (error) {
        console.error('❌ Error creating user:', error);
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        console.log(`🗑️ Deleting user: ${userId}...`);
        await db.collection(USERS_COLLECTION).doc(userId).update({ deleted: true, updated_at: Date.now() });
        console.log(`✅ User deleted: ${userId}`);
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        throw error;
    }
}

async function fetchAttendance(page = 1, limit = 10000) {
    try {
        console.log(`📥 Fetching attendance (page: ${page}, limit: ${limit})...`);
        const snapshot = await db.collection(ATTENDANCE_COLLECTION).get();
        const allRecords = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.deleted) {
                allRecords.push({ id: doc.id, ...data });
            }
        });
        allRecords.sort((a, b) => {
            const timeA = new Date(a.check_in_time).getTime();
            const timeB = new Date(b.check_in_time).getTime();
            return timeB - timeA;
        });
        const total = allRecords.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRecords = allRecords.slice(startIndex, endIndex);
        console.log(`✅ Fetched ${paginatedRecords.length} records (total: ${total})`);
        return { data: paginatedRecords, total: total, page: page, limit: limit };
    } catch (error) {
        console.error('❌ Error fetching attendance:', error);
        throw error;
    }
}

async function createAttendance(attendanceData) {
    try {
        console.log(`📤 Creating attendance for:`, attendanceData.user_id);
        const timestamp = Date.now();
        const newAttendance = { ...attendanceData, created_at: timestamp, updated_at: timestamp, deleted: false };
        const docRef = await db.collection(ATTENDANCE_COLLECTION).add(newAttendance);
        console.log(`✅ Attendance created: ${docRef.id}`);
        return { id: docRef.id, ...newAttendance };
    } catch (error) {
        console.error('❌ Error creating attendance:', error);
        throw error;
    }
}

async function deleteAttendance(attendanceId) {
    try {
        console.log(`🗑️ Deleting attendance: ${attendanceId}...`);
        await db.collection(ATTENDANCE_COLLECTION).doc(attendanceId).update({ deleted: true, updated_at: Date.now() });
        console.log(`✅ Attendance deleted: ${attendanceId}`);
    } catch (error) {
        console.error('❌ Error deleting attendance:', error);
        throw error;
    }
}

async function exportAllData() {
    try {
        console.log('📦 Exporting all data...');
        const usersResult = await fetchUsers(1, 10000);
        const attendanceResult = await fetchAttendance(1, 10000);
        const exportData = {
            users: usersResult.data,
            attendance: attendanceResult.data,
            exportDate: new Date().toISOString(),
            version: '2.0',
            source: 'firebase'
        };
        console.log(`✅ Export complete: ${exportData.users.length} users, ${exportData.attendance.length} records`);
        return exportData;
    } catch (error) {
        console.error('❌ Error exporting data:', error);
        throw error;
    }
}

async function importAllData(importData) {
    try {
        console.log('📥 Importing data...');
        let usersImported = 0;
        let attendanceImported = 0;
        if (importData.users && Array.isArray(importData.users)) {
            for (const user of importData.users) {
                const existing = await fetchUserByQRCode(user.qr_code);
                if (!existing) {
                    const userData = { ...user };
                    delete userData.id;
                    await createUser(userData);
                    usersImported++;
                }
            }
        }
        if (importData.attendance && Array.isArray(importData.attendance)) {
            for (const record of importData.attendance) {
                const snapshot = await db.collection(ATTENDANCE_COLLECTION)
                    .where('user_id', '==', record.user_id)
                    .where('event_name', '==', record.event_name)
                    .where('check_in_time', '==', record.check_in_time)
                    .where('deleted', '==', false)
                    .limit(1)
                    .get();
                if (snapshot.empty) {
                    const attendanceData = { ...record };
                    delete attendanceData.id;
                    await createAttendance(attendanceData);
                    attendanceImported++;
                }
            }
        }
        console.log(`✅ Import complete: ${usersImported} users, ${attendanceImported} records`);
        return { usersImported, attendanceImported };
    } catch (error) {
        console.error('❌ Error importing data:', error);
        throw error;
    }
}

console.log('🔥 Firebase Storage 모듈 로드 완료!');
