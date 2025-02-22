const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: "dkhtoamfb",
    api_key: 644752513959816,
    api_secret: "Q-tR7pVUmz23i57YZStwnLXO-jY"
});

console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

module.exports = cloudinary;
