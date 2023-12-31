const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/getUsers/:page', userController.getUsers);
router.get('/getById/:userId', userController.getById);
router.post('/createUser', userController.createUser);
router.put('/updateUser/:userId', userController.updateUser);
router.delete('/deleteUser/:userId',userController.deleteUser)

module.exports = router;