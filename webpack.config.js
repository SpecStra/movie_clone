const path = require("path")
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const BASE_JS = "./src/client/js/"

module.exports = {
    entry:
        {
            main :`${BASE_JS}main.js`,
            videoPlayer : `${BASE_JS}videoPlayer.js`,
            commentSection : `${BASE_JS}commentSection.js`,
        },
    plugins: [new MiniCssExtractPlugin({
        filename: "css/styles.css"
    })],
    mode : "development",
    // watch를 하고있으면, 아웃풋 파일에 변경이 생길 경우 즉시 바꿔줍니다. 다만 해당 콘솔은 계속 켜둬야 합니다.
    watch: true,
    output : {
        filename: "js/[name].js",
        path: path.resolve(__dirname, "assets"),
        clean: true,
    },
    module: {
        rules: [
            {
                // 해당 확장자의 모든 파일에 적용할게요. 라는 뜻
                test: /\.js$/,
                use : {
                    loader : `babel-loader`,
                    options: {
                        presets : [
                            [`@babel/preset-env`, {targets : "defaults"}]
                        ]
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    // 아래 모듈을 사용하면, css를 별도의 파일로 분류시켜줍니다. 그냥 style-loader를 쓰면 js에 css가 같이 들어갑니다.
                    MiniCssExtractPlugin.loader,
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            }
        ]
    }
}