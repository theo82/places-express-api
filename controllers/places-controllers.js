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

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;

    try{
      place = await Place.findById(placeId);
    } catch(err) {
        const error =  new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }
   
    if(!place || place.length === 0) {
        return next(
            new HttpError('Coulot not find places for the provided place id', 404)
        );
    }

    res.json({ place: place.toObject({ getters: true }) });
}


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
  
    let places;
    try {
      places = await Place.find({ creator: userId });
    } catch (err) {
      const error = new HttpError(
        'Fetching places failed, please try again later',
        500
      );
      return next(error);
    }
  
    if (!places || places.length === 0) {
      return next(
        new HttpError('Could not find places for the provided user id.', 404)
      );
    }
  
    res.json({ places: places.map(place => place.toObject({ getters: true })) });
  };

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

const updatePlace = async (req, res, next) => {


    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('Invalid inputs passed, please check your data', 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;


    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find place.!', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place.!', 500);
        return next(error);
    }    
    res.status(200).json({ place: place.toObject({ getters: true })});
       
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err){
        const error = new HttpError('Could not find place', 500);
        return next(error);
    }   

    try {
        await Place.remove();
    } catch (err){
        const error = new HttpError('Could not delete place', 500);
        return next(error);
    }

    res.status(200).json({message: 'Deleted place.'});
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;