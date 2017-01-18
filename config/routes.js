/**
 * Routes module for parsing requests
 */
var restify = require('restify'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Todo = mongoose.model('Todo'),
    Tag = mongoose.model('Tag'),
    config = require('./config'),
    config_path = config.root + '/config',
    util = require("../util/utility"),
    qs = require("qs");

module.exports = function (app) {
    /**
     * Pre handler filters and modifies (if required) the incoming requests
     * @param path
     * @param request
     * @param response
     * @param next method in chain
     */
    app.pre(function (req, res, next) {
        if (req.url === '/') {
            req.url = '/index.html';
        }
        return next();
    });

    /**
     * get static content
     * @param path
     * @param request
     * @param response
     */
    app.get(/\/?.(html|css|js|png|jpg|gif|font)/, restify.serveStatic({
        directory: './public',
        default: 'index.html'
    }));
    app.get("/", restify.serveStatic({
        directory: './public',
        default: 'index.html'
    }));

    /**
     * 添加用户
     */
    app.post('/addUser', function (req, res, next) {
        let params = qs.parse(req.body),
            mobile = params.mobile,
            name = params.name;

        if(!mobile || !name){
            res.send(util.error('缺失参数！'));
            return next();
        }

        User.findOne({mobile: mobile}).exec().then(user => {
            if(user){
                res.send(util.error('已经存在改用户'));
            } else {
                new User({
                    mobile: mobile,
                    name: name
                }).save((err, data) => {
                    if(err){
                        res.send(util.dbErr(err));
                        return next();
                    }
                    res.send(util.success(data));
                });
            }
        }, err => {
            res.send(util.dbErr(err));
            return next();
        });
    });

    /**
     * 添加标签
     */
    app.post('/addTag', function (req, res, next) {
        let name = qs.parse(req.body).name,
            mobile = qs.parse(req.body).mobile;
        if(!name){
            res.send(util.error('缺少参数'));
            return next();
        }
        User.findOne({mobile: mobile}).exec().then(user => {
            if(user){
                Tag.findOne({uid: user._id, name: name}, (err, tag) => {
                    if(err){
                        res.send(util.dbErr(err));
                        return next();
                    }
                    if(tag){
                        res.send(util.error('该tag已存在'));
                        return next();
                    } else {
                        new Tag({
                            uid: user._id,
                            name: name
                        }).save((err, data) => {
                            if(err){
                                res.send(util.dbErr(err));
                                return next();
                            }
                            res.send(util.success(data));
                        });
                    }
                });
            } else {
                res.send(util.error('用户不存在'));
            }
        }, err => {
            res.send(util.dbErr(err));
            return next();
        });

    });

    /**
     * 添加Todo
     */
    app.post('/addTodo', function (req, res, next) {
        let params = qs.parse(req.body),
            mobile = params.mobile,
            title = params.title,
            description = params.description || '',
            tagId = params.tagId;

        if(!mobile || !title){
            res.send(util.error('缺少参数'));
            return next();
        }
        User.findOne({mobile: mobile}).exec().then(user => {
            if(user){
                new Todo({
                    uid: user._id,
                    title: title,
                    description: description,
                    tag: tagId
                }).save((err, data) => {
                   if(err){
                       res.send(util.dbErr(err));
                       return next();
                   }
                   res.send(util.success(data));
                });
            } else {
                res.send(util.error('查找不到该用户'));
            }
        }, err => {
            res.send(util.dbErr(err));
            return next();
        });
    });

    /**
     * 获取Todo列表
     */
    app.get('/getTodoList', function(req, res, next) {
        let mobile = req.params.mobile,
            tagId = req.params.tagId,
            query;

        if(!mobile){
            res.send(util.error('缺少参数mobile'));
        }

        User.findOne({mobile: mobile}, (err, user) => {
            if(err){
                res.send(util.dbErr(err));
                return next();
            }
            if(user){
                if(tagId){
                    query = {
                        uid: user._id,
                        tag: tagId
                    }
                } else {
                    query = {
                        uid: user._id
                    }
                }
                Todo.find(query)
                    .populate('tag')
                    .exec((err, data) => {
                        if(err){
                            res.send(util.dbErr(err));
                            return next();
                        }
                        res.send(util.success(data));
                    });
            } else {
                res.send(util.error('查找不到该用户'));
            }
        });
    });

    /**
     * 获取标签列表
     */
    app.get('/getTagList', function (req, res, next) {
        let mobile = req.params.mobile;

        User.findOne({mobile: mobile}).exec().then(user => {
            if(user){
                Tag.find({uid: user._id}, (err, data) => {
                    res.send(util.success(data));
                });
            } else {
                res.send(util.error('查找不到该用户'));
                return next();
            }
        }, err => {
            res.send(util.dbErr(err));
            return next();
        });
    });

    /**
     * 删除Todo
     */
    app.post('/removeTodo', function (req, res, next) {
        let id = qs.parse(req.body).id;

        Todo.findByIdAndRemove(id, (err, data) => {
            if(err){
                res.send(util.dbErr(err));
                return next();
            }
            res.send(util.success(data));
        });
    });

    /**
     * 删除Tag
     */
    app.post('/removeTag', function (req, res, next) {
        let id = qs.parse(req.body).id;

        Tag.findByIdAndRemove(id, (err, data) => {
            if(err){
                res.send(util.dbErr(err));
                return next();
            }
            res.send(util.success(data));
        });
    });
};
