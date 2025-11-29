const mongoose = require('mongoose');

//Schema: User
const userSchema = new mongoose.Schema({
  email: {
    type: String,   
    required: true,   
    unique: true     
  },
  password: {
    type: String,    
    required: true   
  },
  role: {
    type: String,     
    required: true,   
    default: 'patient'
  }
});


const User = mongoose.model('User', userSchema);

module.exports = User;