const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Webpack entry points. Mapping from resulting bundle name to the source file entry.
const entries = {};

// Loop through subfolders in the "SprintReview" folder and add an entry for each one
const SprintReviewDir = path.join(__dirname, "src/SprintReview");
fs.readdirSync(SprintReviewDir).filter(dir => {
    if (fs.statSync(path.join(SprintReviewDir, dir)).isDirectory()) {
        entries[dir] = "./" + path.relative(process.cwd(), path.join(SprintReviewDir, dir, dir));
    }
});

module.exports = {
    target: "web",
    entry: entries,
    output: {
        filename: "[name]/[name].js",
        publicPath: "/dist/"
    },
    devtool: "inline-source-map",
    devServer: {
        https: true,
        port: 3000
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
        },
    },
    stats: {
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "azure-devops-ui/buildScripts/css-variables-loader", "sass-loader"]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.woff$/,
                use: [{
                    loader: 'base64-inline-loader'
                }]
            },
            {
                test: /\.html$/,
                loader: "file-loader"
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([ { from: "**/*.html", context: "src/SprintReview" }])
    ]
};
