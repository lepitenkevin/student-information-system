const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const studentController = require('../controllers/studentController');

router.get('/', studentController.getAll);
router.post('/', upload.single('profilePic'), studentController.create);
router.get('/search', studentController.search);
router.get('/:id', studentController.getOne);
router.put('/:id', upload.single('profile'), studentController.update);
router.delete('/:id', studentController.remove);

module.exports = router;
