const router = require('express').Router()
const CryptoJS = require('crypto-js')

const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken')
const User = require('../models/user')

// Update a user
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.JWT_SECRET_KEY
    ).toString()
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    )
    res.status(200).json(updatedUser)
  } catch (err) {
    res.status(500).json(err)
  }
})

// Delete a user
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "User deleted" })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

// Get one users by id
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    const { password, ...others } = user._doc

    res.status(200).json(others)
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

// Get all users and new users
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new
  try {
    const users = query ? await User.find().sort({ _id: -1 }).limit(5) : await User.find()
    res.status(200).json(users)
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

// Get user stats
router.get("/stats", verifyTokenAndAuthorization, async (req, res) => {
  const date = new Date()
  const lastYear = new Date(date.setFullYear(date.getDate() - 1))

  try {

    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        }
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        }
      }
    ])
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

module.exports = router
