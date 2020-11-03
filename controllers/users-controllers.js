const HttpError = require('../models/http-error');
const  { validationResult } = require('express-validator');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;
    try{
       users = await User.find({}, '-password');
    }catch(err) {
       const error = new HttpError(
           'Fetching users failed, please try again later', 
           500
       )
       return next(error);
    }
    res.json({ users: users.map(user => user.toObject({ getters: true}))});

};

const signup = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors);
        return next(
            new HttpError('Invalid inputs passed, please check your data', 422)
        );
    }

    const { name, email, password } = req.body;
    const {v4 : uuidv4} = require('uuid');

    let existingUser;
    try{
        existingUser = await User.findOne({ email: email })
    }catch(err) {
        const error = new HttpError(
            'Signing up faild, prease try again later.',
            500
        );
        return next(error);
    }

    if(existingUser) {
        const error = new HttpError(
            'User exists already, please login instead',
            422
        );
        return next(error);
    }

    const createUser = new User({
        id: uuidv4(),
        name,
        email,
        image: req.file.path,
        password,
        places: []
    })
    
    try {
        await createUser.save();
    } catch(err) {
        const error = new HttpError(
            'Signing up failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ user: createUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({ email: email })
    }catch(err) {
        const error = new HttpError(
            'Logging in failed, prease try again later.',
            500
        );
        return next(error);
    }

    if(!existingUser || existingUser.password !== password) {
        const error = new HttpError(
            'Invalid credentials, could not log in!',
            401
        );
        return next(error);
    }
    
    res.json({ message: 'Logged in!', user: existingUser.toObject({ getters: true })});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;