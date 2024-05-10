const { gql } = require("apollo-server-express");

const typeDefs = gql`
    type Query {
        hello: String
    }
`;

const resolvers = {
    Query: {
        hello: () => "Hello world!",
    },
};

module.exports = { typeDefs, resolvers };
