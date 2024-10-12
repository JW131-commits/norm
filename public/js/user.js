const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  iconUrl: { type: String, default: "" }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
