const HttpError = require('../models/http-error');
const  { validationResult } = require('express-validator');
const User = require('../models/user');

const DUMMY_USERS = [{
    id: 'u1',
    name: 'Max Schwarz',
    email: 'test@test.com',
    password: 'testers'
}];

const getUsers = (req, res, next) => {
    res.json({ users: DUMMY_USERS })
};

const signup = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors);
        return next(
            new HttpError('Invalid inputs passed, please check your data', 422)
        );
    }

    const { name, email, password, places } = req.body;
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
        image: 'data:image/jpeg;base64,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',
        password,
        places
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
            'Invalid credentials, could not log yo in!',
            401
        );
        return next(error);
    }
    
    res.json({ message: 'Logged in!'});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;