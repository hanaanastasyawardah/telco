// /server/routes/auth.js

var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth.controller'); // Impor controller Auth

// Route: POST /auth/register
// Digunakan untuk mendaftarkan user baru (Customer atau Admin)
router.post('/register', authController.register);

// Route: POST /auth/login
// Digunakan untuk proses otentikasi user
router.post('/login', authController.login);

module.exports = router;