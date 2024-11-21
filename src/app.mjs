import MongoConnection from "./mongo/MongoConnection.mjs";
const DB_NAME = 'sample_mflix';
const COLLECTION_MOVIES_NAME = "movies";
const COLLECTION_COMMENTS_NAME = "comments";
const mongoConnection = new MongoConnection(process.env.MONGO_URI, DB_NAME);
const collectionMovies = mongoConnection.getCollection(COLLECTION_MOVIES_NAME);
const collectionComments = mongoConnection.getCollection(COLLECTION_COMMENTS_NAME);

collectionMovies.aggregate([
  {
    $facet: {
      avgRating: [
        {
          $group: {
            _id: null, 
            avgRating: { $avg: "$imdb.rating" }, 
          },
        },
      ],
      
      filteredMovies: [
        {
          $match: {
            year: 2010, 
            genres: "Comedy", 
          },
        },
        {
          $project: {
            title: 1, 
            imdbRating: "$imdb.rating", 
          },
        },
      ],
    },
  },
  {
    $project: {
      avgRating: { $arrayElemAt: ["$avgRating.avgRating", 0] }, 
      filteredMovies: 1, 
    },
  },
  {
    $project: {
      filteredMovies: {
        $filter: {
          input: "$filteredMovies", 
          as: "movie",
          cond: { $gt: ["$$movie.imdbRating", "$avgRating"] }, 
        },
      },
    },
  },
]).toArray()
  .then(data => {
    console.log("Filtered movies:", data[0].filteredMovies);
  })

collectionComments.aggregate([
  {
    $lookup: {
      from: 'movies', 
      localField: 'movie_id', 
      foreignField: '_id', 
      as: 'movieDetails', 
    },
  },
  {
    $project: {
      name: 1,
      email: 1, 
      text: 1, 
      title: { $arrayElemAt: ['$movieDetails.title', 0] }, 
    },
  },
  {
    $limit: 5, 
  },
]).toArray()
  .then(data => {
    console.log('Comments with movie titles:', data);
  })
  .catch(err => console.error(err));


