const Dotenv = require('dotenv-webpack');

module.exports = {
    plugins: [
        new Dotenv({
            path: '.env',
            safe: true
        })
    ],
    resolve: {
        fallback: {
            "ws": require.resolve("ws")
        }
    }
};