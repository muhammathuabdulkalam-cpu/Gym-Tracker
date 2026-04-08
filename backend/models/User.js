const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  age: { type: Number },
  weight: { type: Number }, // in kg
  height: { type: Number }, // in cm
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  splitConfig: {
    type: [String],
    default: []
  },
  profileImage: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

