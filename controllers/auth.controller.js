// /server/controllers/auth.controller.js

const userService = require('../server/services/userService');

async function register(req, res) {
    const { username, email, password, role } = req.body; // role bisa dikosongkan (default customer)

    // Validasi input sederhana
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Semua field (username, email, password) wajib diisi.' });
    }

    try {
        // Memanggil service untuk mendaftarkan user
        const userId = await userService.registerUser(username, email, password, role);

        return res.status(201).json({ 
            message: 'Registrasi berhasil!', 
            userId: userId,
            // Di sini Anda mungkin ingin langsung login dan membuat token sesi (JWT)
        });

    } catch (error) {
        // Menangani error duplikasi dari service layer
        if (error.message.includes('sudah terdaftar')) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Terjadi kesalahan server saat registrasi.', error: error.message });
    }
}

// ===================================
// 2. Controller untuk Login User
// ===================================
async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan Password wajib diisi.' });
    }

    try {
        const user = await userService.findUserByUsername(username);

        // 1. Cek apakah user ditemukan
        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // 2. Bandingkan password yang dimasukkan dengan hash di database
        const isMatch = await userService.comparePassword(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // 3. Login Berhasil!
        // Di sini seharusnya dibuat JSON Web Token (JWT) untuk sesi
        /*
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );
        */

        // Jika tidak menggunakan JWT (hanya mengirim data dasar):
        return res.status(200).json({ 
            message: 'Login berhasil!',
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            // token: token // Jika menggunakan JWT
        });

    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan server saat login.', error: error.message });
    }
}


module.exports = {
    register,
    login
};