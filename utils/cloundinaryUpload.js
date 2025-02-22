// utils/cloudinaryUpload.js
const cloudinary = require('cloudinary').v2;

const cloudinaryUpload = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
        stream.end(buffer);
    });
};

module.exports = cloudinaryUpload;