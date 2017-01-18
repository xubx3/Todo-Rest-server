/**
 * Created by AI on 16/12/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TodoSchema = new Schema({
    uid: {type: ObjectId, ref: 'User'},
    title: {type: String, trim: true},
    description: {type: String},
    tag: {type: ObjectId, ref: 'Tag'},
    createAt: { type:Date, default:Date.now}
});

mongoose.model('Todo', TodoSchema);