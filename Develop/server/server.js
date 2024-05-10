const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

// Setup Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        // Run the auth middleware to extract user data from the token
        const modifiedReq = authMiddleware({ req });
        return { user: modifiedReq.user }; // Make user data available in GraphQL resolvers
    }
});

// Function to start the Apollo Server and apply it to the Express app
async function startApolloServer() {
    // Start the Apollo Server
    await server.start();
    
    // Apply Apollo GraphQL middleware and set the path to /graphql
    server.applyMiddleware({ app, path: '/graphql' });

    // Start listening once the database is open
    db.once('open', () => {
        app.listen(PORT, () => {
            console.log(`🌍 Now listening on localhost:${PORT}`);
            console.log(`🚀 GraphQL ready at http://localhost:${PORT}${server.graphqlPath}`);
        });
    });
}

startApolloServer();
