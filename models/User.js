/**
 * Created by AI on 16/12/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  name: {type: String, trim: true, default: ''},
  mobile: {type: String, trim: true},
  createAt: { type:Date, default:Date.now}
});

UserSchema.methods = {
  findByMobile: function (mobile) {
    return User.findOne({mobile: mobile}).exec();
  }
};

mongoose.model('User', UserSchema);
