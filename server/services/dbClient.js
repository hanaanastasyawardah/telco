const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Memuat variabel lingkungan dari .env
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Fungsi untuk menguji koneksi saat server start
async function testConnection() {
    try {
        await pool.getConnection();
        console.log('✅ MySQL Database connected successfully!');
        } catch (error) {
            console.error('❌ Failed to connect to MySQL Database:', error.message);
            // Hentikan aplikasi jika koneksi gagal total
            process.exit(1); 
        }
}

// Uji koneksi saat file ini dimuat
testConnection();

// Mengekspor pool agar dapat digunakan oleh UserService, ProductService, dll.
module.exports = pool;