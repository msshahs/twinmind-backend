// 📁 server/firebase.js
const admin = require("firebase-admin");


const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_CRED, 'base64').toString('utf-8')
);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
