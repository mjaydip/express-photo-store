var fs = require('fs'),
    path = require('path'),
    sidebar = require('../helpers/sidebar'),
    Models = require('../models'),
    md5 = require('MD5'),
    aws= require('aws-sdk'),
    s3fs= require('s3fs');

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || "AKIAIMHGVLTK2473SPVQ";
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY || "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";
var S3_BUCKET = process.env.S3_BUCKET || "imguploader-assets" ;
var s3fsImpl = new s3fs(S3_BUCKET+'/temp-images', {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY
});
var s3handle=new aws.S3({
    "accessKeyId":  process.env.AWS_ACCESS_KEY || "AKIAIMHGVLTK2473SPVQ",
    "secretAccessKey" : process.env.AWS_SECRET_KEY || "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"
});
s3fsImpl.create();

module.exports = {
    index: function(req, res) {
        var viewModel = {
            image: {},
            comments: []
        };

        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (err) { throw err; }
                if (image) {
                    image.views = image.views + 1;
                    viewModel.image = image;
                    image.save();

                    Models.Comment.find(
                        { image_id: image._id},
                        {},
                        { sort: { 'timestamp': 1 }},
                        function(err, comments){
                            viewModel.comments = comments;
                            sidebar(viewModel, function(viewModel) {
                                res.render('image', viewModel);
                            });
                        }
                    );
                } else {
                    res.redirect('/');
                }
            });
    },
    create: function(req, res) {
        var saveImage = function() {
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                imgUrl = '';

            for(var i=0; i < 6; i+=1) {
                imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            Models.Image.find({ filename: imgUrl }, function(err, images) {
                if (images.length > 0) {
                    saveImage();
                } else {
                    var tempPath = req.files.file.path,
                        ext = path.extname(req.files.file.name).toLowerCase();
                        //targetPath = path.resolve('./public/upload/temp/' + imgUrl + ext);

                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        var readStream = fs.createReadStream(tempPath);
                        s3fsImpl.writeFile(imgUrl + ext, readStream,function () {
                            fs.unlink(tempPath, function (err) {
                                if (err) throw err;
                            });
                            var signedUrl = s3handle.getSignedUrl('getObject', {Bucket: S3_BUCKET+'/temp-images', Key: imgUrl + ext});
                            var newImg = new Models.Image({
                                title: req.body.title,
                                filename: imgUrl + ext,
                                description: req.body.description,
                                signedURL: signedUrl
                            });
                            newImg.save(function(err, image) {
                                console.log('Successfully inserted image: ' + image.filename);
                                res.redirect('/images/' + image.uniqueId);
                            });
                        });
                        //fs.rename(tempPath, targetPath, function(err) {
                        //    if (err) { throw err; }
                        //
                        //    var newImg = new Models.Image({
                        //        title: req.body.title,
                        //        filename: imgUrl + ext,
                        //        description: req.body.description
                        //    });
                        //    newImg.save(function(err, image) {
                        //        console.log('Successfully inserted image: ' + image.filename);
                        //        res.redirect('/images/' + image.uniqueId);
                        //    });
                        //});
                    } else {
                        fs.unlink(tempPath, function (err) {
                            if (err) throw err;

                            res.json(500, {error: 'Only image files are allowed.'});
                        });
                    }
                }
            });
        };

        saveImage();
    },
    like: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (!err && image) {
                    image.likes = image.likes + 1;
                    image.save(function(err) {
                        if (err) {
                            res.json(err);
                        } else {
                            res.json({ likes: image.likes });
                        }
                    });
                }
            });
    },
    comment: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (!err && image) {
                    var newComment = new Models.Comment(req.body);
                    newComment.gravatar = md5(newComment.email);
                    newComment.image_id = image._id;
                    newComment.save(function(err, comment) {
                        if (err) { throw err; }

                        res.redirect('/images/' + image.uniqueId + '#' + comment._id);
                    });
                } else {
                    res.redirect('/');
                }
            });
    },
    remove: function(req, res) {
        Models.Image.findOne({ filename: { $regex: req.params.image_id } },
            function(err, image) {
                if (err) { throw err; }
                console.log("Removing image:"+image.filename);
                s3fsImpl.unlink(image.filename,
                    function(err) {
                        if (err) { throw err; }

                        Models.Comment.remove({ image_id: image._id},
                            function(err) {
                                image.remove(function(err) {
                                    if (!err) {
                                        res.json(true);
                                    } else {
                                        res.json(false);
                                    }
                                });
                        });
                });
            });
    }
};
