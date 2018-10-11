const models = require('./models');
const multipleUpload = require('../services/multipleUpload');
const accounts = require('../accounts/models');
const fs = require('fs');

function createPost(req, res) {
    const post = new models.Post({
        title: req.body.title,
        content: req.body.text,
        image: req.files[0].filename,
        user_id: req.user.attributes.id
    });
    post.save().then(() => {
        return res.status(201).send({post});
    }).catch(err => {
        return res.status(400).send(err)
    })
}

function getPosts(req, res) {
    models.Post.forge().fetchAll({ columns: ['image', 'title', 'id'] }).then(posts => {
        if(!posts) {
            return res.status(404).send('Not Found');
        }
        const ids = posts.map((post) => {return post.id})
        return res.status(200).send({posts, meta: ids})
    });
}

function getPost(req, res) {
    models.Post.forge({id: req.query.id}).fetch({ withRelated: ['user_id'] }).then(post => {
        if(!post) {
            return res.status(404).send('Not Found');
        }
        models.Comment.where({post_id: post.id}).query('orderBy', 'created').fetchAll({ columns: ['text', 'created', 'user_id', 'id'], withRelated: ['user_id', 'post_id'] }).then(result => {
            if (!result) {
            return res.status(200).send({post, comments: []})
            }
            const comments = result.map((comment) => {
                return {
                    id: comment.attributes.id,
                    text: comment.attributes.text,
                    created: comment.attributes.created,
                    email: comment.relations.user_id.attributes.email
                }
            });
            return res.status(200).send({post, comments: comments})
        });
    });
}

function createComment(req, res) {
    const comment = new models.Comment({
        text: req.body.text,
        user_id: req.user.attributes.id,
        post_id: req.body.id
    });
    comment.save().then(() => {
        return res.status(201).send({comment: {
            id: comment.attributes.id,
            text: comment.attributes.text,
            created: new Date(),
            email: req.user.attributes.email
        }});
    }).catch(err => {
        return res.status(400).send(err)
    })
}

function updateComment(req, res) {
    models.Comment.where({id: req.body.id}).save({text: req.body.text}, {patch: true})
    .then((comment) => {
        return res.status(201).send({comment});
    }).catch(err => {
        return res.status(400).send(err)
    })
}

function deleteComment(req, res) {
    models.Comment.where({id: req.body.id}).destroy().then(() => {
      return res.status(200).send({success: 'ok'})
    }).catch((err) => {
      return res.status(404).send({err})
    });
}

function deletePost(req, res) {
    models.Post.forge({id: req.body.id}).fetch().then(function (post) {
        fs.unlink(`public/${post.get('image')}`, () => {});
        models.Post.where({id: req.body.id}).destroy().then(() => {
            return res.status(200).send({success: 'ok'})
        }).catch((err) => {
            return res.status(404).send({err})
        });
    })
}

function updatePost(req, res) {
    const body = req.body;
    const postId = req.body.id;
    models.Post.forge({id: postId}).fetch().then(function (post) {
    multipleUpload(req, res, (err) => {
        if (err) {
            return res.send({success: false});
        } else {
            let data = {image: post.attributes.image, content: body.content, title: body.title};
            if (req.files.length) {
                fs.unlink(`public/${post.get('image')}`, () => {});
                data['image'] = req.files[0].filename
            }
            models.Post.where({id: postId}).save(data, {patch: true})
               .then((result) => {
                 return res.status(201).send({result});
               }).catch(err => {
                 return res.status(400).send(err)
               });
            }
        })
    });
}
    
module.exports = {createPost, getPosts, getPost, createComment, updateComment, deleteComment, deletePost, updatePost};
