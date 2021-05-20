module.exports = {
    publicPath: './',
    configureWebpack: config => {
        config.externals = {
            'vue': 'Vue'
        }
    }
}