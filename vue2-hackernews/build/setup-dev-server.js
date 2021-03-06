const path = require('path')
const webpack = require('webpack')
const MFS = require('memory-fs')
const clientConfig = require('./webpack.client.config');
const serverConfig = require('./webpack.server.config');

module.exports = function setupDevServer(app, onUpdate){

  // 客户端编译
  clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  )

  const clientCompiler = webpack(clientConfig)
  app.use(require('webpack-dev-middleware')(clientCompiler,{
    publicPath: clientConfig.output.publicPath,
    stats:{
      color:true,
      chunk: false
    }
  }))
  app.use(require('webpack-hot-middleware')(clientCompiler))

  // 服务端编译
  const serverCompiler = webpack(serverConfig)
  const mfs = new MFS()
  const outputPath = path.join(serverConfig.output.path, serverConfig.output.filename)
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, (err, stats)=>{
    if(err) throw err
    stats = stats.toJson()
    stats.errors.forEach(err => console.log(err))
    stats.warnings.forEach(err => console.log(err))
    onUpdate(mfs.readFileSync(outputPath, 'utf-8'))
  })

}
