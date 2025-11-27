// routes/predicts.js
var express = require('express');
var router = express.Router();
var axios = require('axios'); // Import axios

// URL dasar tempat FastAPI Anda berjalan (sesuai log Uvicorn)
const FASTAPI_URL = 'http://127.0.0.1:8000';
const FASTAPI_ENDPOINT = '/recommend_cbf';

/* POST /predicts: Menerima data dan mem-proxy ke FastAPI */
router.post('/', async function(req, res, next) {
    const body = req.body;
    
    // Periksa apakah body permintaan ada
    if (!body) {
        return res.status(400).json({ message: 'Error: Request body is missing.' });
    }

    try {
        // Panggil endpoint FastAPI /recommend_cbf
        const response = await axios.post(`${FASTAPI_URL}${FASTAPI_ENDPOINT}`, body);

        // Kembalikan hasil yang diterima dari FastAPI
        res.status(200).json({ 
            message: 'Success fetching recommendation from FastAPI!',
            data: response.data,
        });
    } catch (error) {
        console.error("Error communicating with FastAPI:", error.message);
        
        // Cek jika error berasal dari FastAPI (misalnya, validasi data)
        const fastApiError = error.response ? error.response.data : null;

        res.status(500).json({ 
            message: 'Error communicating with the recommendation engine.',
            error: fastApiError || error.message
        });
    }
});

module.exports = router;