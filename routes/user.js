const express = require('express');
const { registerUser, loginUser, updateuser, check, logout, getusersforsidebar, admin, getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    searchCustomers,
    sendEmailToCustomer } = require('../controllers/user');
const router = express.Router();
const { checkauth } = require("../middlewares/checkauth")






router.get('/customers', checkauth, getAllCustomers);
router.get('/customers/stats', checkauth, getCustomerStats);
router.get('/customers/search', checkauth, searchCustomers);
router.get('/customers/:customerId', checkauth, getCustomerById);
router.put('/customers/:customerId', checkauth, updateCustomer);
router.delete('/customers/:customerId', checkauth, deleteCustomer);
router.post('/customers/:customerId/email', checkauth, sendEmailToCustomer);



router.post('/update', checkauth, updateuser)
router.post('/sign-up', registerUser)
router.post('/login', loginUser);
router.get('/logout', logout);
router.get("/check", checkauth, check)
router.get("/getusers", checkauth, getusersforsidebar)
router.post("/admin-register", admin)



module.exports = router;