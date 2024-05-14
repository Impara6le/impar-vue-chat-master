const express = require('express')
const router = express.Router()
const message = require('../API/message')
const usersinfo = require('../API/usersinfo')
const userlog = require('../API/userlog')
const feedback = require('../API/feedback')
const uploadpic = require('../API/uploadpic')
const emoji = require('../API/emoji')



router.get('/message/all', message.all)
router.get('/message/get', message.get)
router.get('/message/add', message.add)
router.get('/message/update', message.update)
router.get('/message/del', message.del)

router.get('/usersinfo/all', usersinfo.all)
router.get('/usersinfo/get', usersinfo.get)
router.get('/usersinfo/add', usersinfo.add)
router.get('/usersinfo/update', usersinfo.update)
router.get('/usersinfo/del', usersinfo.del)

router.get('/userlog/all', userlog.all)
router.get('/userlog/get', userlog.get)

router.get('/feedback/all', feedback.all)
router.get('/feedback/get', feedback.get)
router.get('/feedback/toreply', feedback.toreply)
router.get('/feedback/delreply', feedback.delreply)

router.get('/uploadpic/all', uploadpic.all)
router.get('/uploadpic/get', uploadpic.get)
router.get('/uploadpic/del', uploadpic.del)

router.get('/emoji/all', emoji.all)

module.exports = router
