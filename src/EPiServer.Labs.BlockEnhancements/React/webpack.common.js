const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  return {
    devtool: argv.mode === 'production' ? undefined : 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']      
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                         [
                         "@babel/env",
                         {
                           useBuiltIns: "entry"
                         }
                        ],
                        "@babel/react"
                      ]
                  }
            }
        },
        {
            test: /\.(woff|woff2)$/,
            use: {
                loader: "file-loader",
                options: {
                    context: path.resolve(__dirname, "./node_modules/optimizely-oui/dist")
                }
            }
        },
        {
          test: /\.s?css$/,
          use: [
            {
              loader: argv.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
            },
            {
              loader: 'css-loader',
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: ['node_modules'],
                },
              },
            },
          ],
          include: path.resolve(__dirname, "../"),
        },
      ],
    },
  };
};
