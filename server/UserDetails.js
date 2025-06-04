const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true }, 
  password: { type: String, required: true },
  city: { type: String, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  age: { type: Number }
});

const User = mongoose.model("UserInfo", UserSchema);

module.exports = User;
