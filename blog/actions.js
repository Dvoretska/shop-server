const models = require('./models');

function createPost(req, res) {
    const post = new models.Post({
        title: req.body.title,
        content: req.body.text,
        image: req.file.filename,
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
    models.Post.forge({id: req.query.id}).fetch().then(post => {
        if(!post) {
            return res.status(404).send('Not Found');
        }
        models.Comment.where({post_id: post.id}).fetchAll({ columns: ['text', 'created', 'user_id'], withRelated: ['user_id', 'post_id'] }).then(result => {
            if (!result) {
            return res.status(200).send({post, comments: []})
            }
            const comments = result.map((comment) => {
                return {
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
        post_id: req.body.post_id
    });
    comment.save().then(() => {
        return res.status(201).send({comment: {
            text: comment.attributes.text,
            created: new Date(),
            email: req.user.attributes.email
        }, user: req.user});
    }).catch(err => {
        return res.status(400).send(err)
    })
}
    
module.exports = {createPost, getPosts, getPost, createComment};