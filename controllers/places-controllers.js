const HttpError = require("../models/http-error");
const getCoordsForAddress = require('../utils/location');
const { validationResult } = require('express-validator');
const Place = require("../models/place");
let DUMMY_PLACES = [
    {
      id: 'p1',
      title: 'Empire State Building',
      description: 'One of the most famous sky scrapers in the world!',
      location: {
        lat: 40.7484474,
        lng: -73.9871516
      },
      address: '20 W 34th St, New York, NY 10001',
      creator: 'u1'
    }
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;

    const place = DUMMY_PLACES.find((p) => {
        return p.id === placeId;
    });

    if(!place) {
        throw new HttpError('Could not find a place for the provided id.', 404);
    }
    res.json({ place });
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;

    const places = DUMMY_PLACES.filter((p) => {
        return p.creator === userId;
    });

    if(!places || places.length === 0) {
        return next(
            new HttpError('Coulot not find places for the provided user id', 404)
        );
    }
    res.json({ places });
}

const createPlace = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors);
        next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { title, description, address, creator } = req.body;
    const {v4 : uuidv4} = require('uuid');

    let coordinates
    try{
     coordinates = await getCoordsForAddress(address);
    }catch(error){
       return next(error)
    }
    const createdPlace = new Place({
        id: uuidv4(),
        title,
        description,
        location: coordinates,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg',
        creator
    });

    try {
        await createdPlace.save();
    } catch(err) {
        const error = new HttpError('Could not create a place', 500);
        return next(error);

    }

    res.status(201).json({place: createdPlace});
};

const updatePlace = (req, res, next) => {


    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('Invalid inputs passed, please check your data', 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatePlace = {...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatePlace.title = title;
    updatePlace.description = description;

    DUMMY_PLACES[placeIndex] = updatePlace;

    res.status(200).json({ place: updatePlace});
       
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;

    if(!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError('Could not find a place for that id.', 404);
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({message: 'Deleted place.'});
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;