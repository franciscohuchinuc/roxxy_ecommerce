require('dotenv').config()

const mongoose = require('mongoose')
const app = require('./app')

const port = process.env.PORT || 5000

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_KEY, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(err => {
    console.log(err)
  })

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}`)
})
