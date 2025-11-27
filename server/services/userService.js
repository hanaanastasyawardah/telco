// /server/services/userService.js

const db = require('./dbClient'); // Impor koneksi database (pool)
const bcrypt = require('bcrypt');
const saltRounds = 10; // Jumlah salt yang digunakan untuk hashing (standar)

async function registerUser(username, email, password) {
    try {
        // 1. Hash password secara asynchronous
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 2. Query INSERT ke tabel users
        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [username, email, password_hash]);
        
        // 3. Kembalikan ID user yang baru dibuat
        return result.insertId;

    } catch (error) {
        // Cek error duplikasi (misalnya username atau email sudah ada)
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Username atau Email sudah terdaftar.');
        }
        console.error('Error saat registrasi user:', error);
        throw new Error('Gagal menyimpan data user ke database.');
    }
}

/**
 * Mencari user berdasarkan username (untuk proses Login)
 */
async function findUserByUsername(username) {
    try {
        const query = 'SELECT * FROM users WHERE username = ? LIMIT 1';
        const [rows] = await db.execute(query, [username]);
        
        // rows[0] berisi objek user atau undefined jika tidak ditemukan
        return rows[0];

    } catch (error) {
        console.error('Error saat mencari user:', error);
        throw new Error('Gagal mengambil data user dari database.');
    }
}

/**
 * Membandingkan password yang dimasukkan saat login dengan hash di database
 */
async function comparePassword(passwordInput, passwordHash) {
    // Fungsi ini mengembalikan true jika cocok, false jika tidak
    return bcrypt.compare(passwordInput, passwordHash);
}


module.exports = {
    registerUser,
    findUserByUsername,
    comparePassword
};