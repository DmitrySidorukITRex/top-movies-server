const graphql = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Movies = require('../models/movie');
const Directors = require('../models/director');
const Users = require('../models/user');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLBoolean,
} = graphql;

const MovieType = new GraphQLObjectType({
  name: 'Movie',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    genre: { type: new GraphQLNonNull(GraphQLString) },
    rate: { type: new GraphQLNonNull(GraphQLFloat) },
    year: { type: new GraphQLNonNull(GraphQLInt) },
    imgSrc: { type: new GraphQLNonNull(GraphQLString) },
    trailerId: { type: GraphQLString },
    description: { type: GraphQLString },
    director: {
      type: DirectorType,
      resolve({ directorId }, args) {
        return Directors.findById(directorId);
      },
    },
  }),
});

const DirectorType = new GraphQLObjectType({
  name: 'Director',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    age: { type: new GraphQLNonNull(GraphQLInt) },
    imgSrc: { type: new GraphQLNonNull(GraphQLString) },
    born: { type: GraphQLString },
    bornPlace: { type: GraphQLString },
    career: { type: GraphQLString },
    genres: { type: GraphQLString },
    height: { type: GraphQLFloat },
    imdbSrc: { type: GraphQLString },
    moviesCount: { type: GraphQLInt },
    moviesYears: { type: GraphQLString },
    movies: {
      type: new GraphQLList(MovieType),
      resolve({ id }, args) {
        return Movies.find({ directorId: id });
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    email: { type: GraphQLString },
    password: { type: new GraphQLNonNull(GraphQLString) },
    isAdmin: { type: GraphQLBoolean },
    id: { type: GraphQLID },
  }),
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addDirector: {
      type: DirectorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        imgSrc: { type: new GraphQLNonNull(GraphQLString) },
        born: { type: GraphQLString },
        bornPlace: { type: GraphQLString },
        career: { type: GraphQLString },
        genres: { type: GraphQLString },
        height: { type: GraphQLFloat },
        imdbSrc: { type: GraphQLString },
        moviesCount: { type: GraphQLInt },
        moviesYears: { type: GraphQLString },
      },
      resolve(
        parent,
        {
          name,
          age,
          imgSrc,
          born,
          bornPlace,
          career,
          genres,
          height,
          imdbSrc,
          moviesCount,
          moviesYears,
        }
      ) {
        const director = new Directors({
          name,
          age,
          imgSrc,
          born,
          bornPlace,
          career,
          genres,
          height,
          imdbSrc,
          moviesCount,
          moviesYears,
        });
        return director.save();
      },
    },
    addMovie: {
      type: MovieType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        rate: { type: new GraphQLNonNull(GraphQLFloat) },
        year: { type: new GraphQLNonNull(GraphQLInt) },
        imgSrc: { type: new GraphQLNonNull(GraphQLString) },
        trailerId: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        directorId: { type: GraphQLString },
      },
      resolve(
        parent,
        { name, genre, rate, year, imgSrc, trailerId, description, directorId }
      ) {
        const movie = new Movies({
          name,
          genre,
          rate,
          year,
          imgSrc,
          trailerId,
          description,
          directorId,
        });
        return movie.save();
      },
    },
    deleteDirector: {
      type: DirectorType,
      args: {
        id: { type: GraphQLID },
      },
      resolve(parent, { id }) {
        return Directors.findByIdAndRemove(id);
      },
    },
    deleteMovie: {
      type: MovieType,
      args: {
        id: { type: GraphQLID },
      },
      resolve(parent, { id }) {
        return Movies.findByIdAndRemove(id);
      },
    },
    updateDirector: {
      type: DirectorType,
      args: {
        id: { type: GraphQLID },
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        imgSrc: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, { id, name, age, imgSrc }) {
        return Directors.findByIdAndUpdate(
          id,
          { $set: { name, age, imgSrc } },
          { new: true }
        );
      },
    },
    updateMovie: {
      type: MovieType,
      args: {
        id: { type: GraphQLID },
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        rate: { type: new GraphQLNonNull(GraphQLFloat) },
        year: { type: new GraphQLNonNull(GraphQLInt) },
        imgSrc: { type: new GraphQLNonNull(GraphQLString) },
        directorId: { type: GraphQLString },
      },
      resolve(parent, { id, name, genre, rate, year, imgSrc, directorId }) {
        return Movies.findByIdAndUpdate(
          id,
          { $set: { name, genre, rate, year, imgSrc, directorId } },
          { new: true }
        );
      },
    },
    login: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, { email, password }) {
        const login = async () => {
          const candidate = await Users.findOne({ email });

          if (candidate) {
            const passwordResult = bcrypt.compareSync(
              password,
              candidate.password
            );

            if (passwordResult) {
              const token = jwt.sign(
                {
                  email: candidate.email,
                  id: candidate._id,
                },
                process.env.JWT,
                { expiresIn: 3600 }
              );

              return {
                token: `Bearer ${token}`,
                email: candidate.email,
                isAdmin: candidate.isAdmin,
                id: candidate._id,
              };
            } else {
              throw new Error('Invalid email or password. Try again.');
            }
          } else {
            throw new Error('User with this email not found.');
          }
        };
        const data = login();
        return data;
      },
    },
    signUp: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, { email, password }) {
        const signUp = async () => {
          const candidate = await Users.findOne({ email: email });

          if (candidate) {
            throw new Error('This email is already taken. Try another one.');
          } else {
            const salt = bcrypt.genSaltSync(10);
            const user = new Users({
              email: email,
              password: bcrypt.hashSync(password, salt),
              isAdmin: true,
            });

            return user.save();
          }
        };

        const data = signUp();
        return data;
      },
    },
  },
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    movie: {
      type: MovieType,
      args: { id: { type: GraphQLID } },
      resolve(parent, { id }) {
        return Movies.findById(id);
      },
    },
    director: {
      type: DirectorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, { id }) {
        return Directors.findById(id);
      },
    },
    movies: {
      type: new GraphQLList(MovieType),
      args: { offset: { type: GraphQLInt }, limit: { type: GraphQLInt } },
      resolve(parent, { offset, limit }) {
        if (!limit) return Movies.find({});

        const getMovies = async () => {
          const movies = await Movies.find({});
          return movies.splice(offset, limit);
        };
        const data = getMovies();
        return data;
      },
    },
    directors: {
      type: new GraphQLList(DirectorType),
      resolve(parent, args) {
        return Directors.find({});
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
