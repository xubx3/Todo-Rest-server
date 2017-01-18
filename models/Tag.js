/**
 * Created by AI on 16/12/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TagSchema = new Schema({
    uid: {type: ObjectId, ref: 'User'},
    name: {type: String, trim: true, default: ''}
});

mongoose.model('Tag', TagSchema);