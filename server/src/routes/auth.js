const router = require('express').Router()
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body
  const passwordHash = CryptoJS.AES.encrypt(password, process.env.PASS_SECRET_KEY).toString()

  const user = new User({ username, email, password: passwordHash })

  try {
    const savedUser = await user.save()
    res.status(201).json(savedUser)
  } catch (err) {
    res.status(500).json(err)
  }
})

// Login a user
router.post('/login', async (req, res) => {
  const { username } = req.body

  try {
    const user = await User.findOne({ username })
    !user && res.status(401).json({ message: 'Invalid credentials!' })

    const hashPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET_KEY)
    const originalPassword = hashPassword.toString(CryptoJS.enc.Utf8)

    originalPassword !== req.body.password && res.status(401).json({ message: 'Invalid credentials!' })

    const accessToken = jwt.sign({
      id: user._id,
      isAdmin: user.isAdmin
    }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })

    const { password, ...others } = user._doc

    res.status(200).json({ ...others, accessToken })
  } catch (err) {
    console.error(err)
  }
})

module.exports = router
