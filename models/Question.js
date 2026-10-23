const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (values) {
        return values.length >= 2 &&
          values.every(value => value.trim().length > 0);
      },
      message: 'Phải có ít nhất 2 lựa chọn không rỗng'
    }
  },
  keywords: {
    type: [String],
    default: []
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return Number.isInteger(value) &&
          value >= 0 &&
          value < this.options.length;
      },
      message: 'Vị trí đáp án đúng không hợp lệ'
    }
  }
});

module.exports = mongoose.model('Question', questionSchema);
