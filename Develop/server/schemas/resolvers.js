const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) {
                throw new AuthenticationError("Not logged in");
            }
            return await User.findById(user._id);
        },
    },

    Mutation: {
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError("Incorrect credentials");
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError("Incorrect credentials");
            }

            const token = signToken(user);
            return { token, user };
        },

        addUser: async (_, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (_, { bookData }, { user }) => {
            if (!user) {
                throw new AuthenticationError("You need to be logged in!");
            }
            return await User.findByIdAndUpdate(
                user._id,
                { $addToSet: { savedBooks: bookData } },
                { new: true }
            );
        },

        removeBook: async (_, { bookId }, { user }) => {
            if (!user) {
                throw new AuthenticationError("You need to be logged in!");
            }
            return await User.findByIdAndUpdate(
                user._id,
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
        },
    },
};

module.exports = resolvers;
