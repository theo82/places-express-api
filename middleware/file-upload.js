const multer = require('multer');

const MIME_TYPE; _MAP = {
    'image/png': 'png',
    'image/jpeg': 'png',
    'image/jpg': 'jpg',
};
const fileUpload = multer({
    limits: 5000000,
    storage: multer.diskStorage({
        destination: (req, file, cb) => {

        },
        filename: (req, file, cb) => {}
    })
});

module.exports = fileUpload;