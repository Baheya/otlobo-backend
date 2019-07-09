exports.signUp = (User) =>{
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (user) {
            return res.status(400).json({
                msg: "this email is exist"
            });
        }
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                return res.status(400).json({
                    message: "error"
                });
            }
            User.create({
                name: req.body.name,
                email: req.body.email,
                password: hash
            })
                .then(user => {
                    var token = jwt.sign(
                        {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        },
                        SECRET
                    );
                    res.status(200).json({
                        message: "success",
                        name: user.name,
                        access_token: "Bearer " + token
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json({
                        msg: "error"
                    });
                });
        });
    });
}

exports.login = (User) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (!user) {
            return res.status(400).json({
                msg: "email is wrong"
            })
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (err) {
                return res.status(400).json({
                    msg: "Error"
                });
            }
            if (result) {
                const token = jwt.sign({
                    id: user.id,
                    name: user.name,
                    email: user.email
                }, SECRET);
                res.status(200).json({
                    msg: "user logged in successfully",
                    access_token: "Bearer " + token
                })
            } else {
                return res.status(400).json({
                    msg: "password is wrong"
                })
            }
        });
    })
}