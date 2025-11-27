const axios = require('axios');

async function predict(data) {
  try {
    const response = await axios.post(`${process.env.PYTHON_HOST}/predict`, data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  predict
}