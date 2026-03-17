const jwt = require('jsonwebtoken');
const user = require('../models/user');
const key = '12345'

async function generateToken(user, res) {
    try {
        const token = jwt.sign(
            {
                _id: user._id,
            }, key)



        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 7 days
        });
    } catch (error) {
        console.error("Error generating token:", error);
        throw new Error("Token generation failed");
    }
}
async function verifyToken(token) {
    try {


        const decoded = jwt.verify(token, key);
        const findeduser = await user.findById(decoded._id);
        return findeduser;

    } catch (error) {
        console.error("Error verifying token:", error);
        throw new Error("Token verification failed");
    }
}
module.exports = {
    generateToken,
    verifyToken
};