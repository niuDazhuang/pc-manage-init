const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const CFG = require('./config')

const rootdir = __dirname.replace(/node_modules.+$/, '')

Object.defineProperty(global, '__stack', {
  get () {
    var orig = Error.prepareStackTrace
    Error.prepareStackTrace = function (_, stack) { return stack }
    var err = new Error()
    Error.captureStackTrace(err, arguments.callee)
    var stack = err.stack
    Error.prepareStackTrace = orig
    return stack
  }
})
Object.defineProperty(global, '__line', {
  get () {
    return __stack[1].getLineNumber()
  }
})

module.exports = class Tool {
  // 文件相关任务失败处理
  static dieif (err, errDir, line) {
    if (err) {
      Tool.error('文件名:' + path.basename(errDir))
      Tool.error('行数:' + line)
      throw Error(err)
    }
  }
  // 控制台任务进度打印
  static success (info) {
    console.log(chalk.green(`=> ${info} \n`))
  }
  // 错误提示打印
  static error (info, next) {
    console.log(chalk.red(`=> ${info} ！！=>\n`))
    next && console.log(chalk.red(`=> ${next} ！！=>\n`))
  }
  // 从项目根目录下找文件
  static find (filename) {
    return path.join(rootdir, filename)
  }
  // 获取配置信息
  static getConfig () {
    let config = require(this.find(path.join(CFG['dirname'], CFG['filename'])))
    let routes = {}
    Object.keys(config.ROUTES).forEach(first => {
      // 统一为数组
      routes[first] = config.ROUTES[first].map(page => Array.isArray(page) ? page : [page])
    })
    config.ROUTES = routes
    config.UP_PRE = this.capitalize(config.PRE)
    return config
  }
  // 首字母大写
  static capitalize (str) {
    return str[0].toUpperCase() + str.slice(1)
  }
  // 判断不存在则创建目录
  static createDir (dirname, callback) {
    const dir = this.find(path.join('src', dirname))
    fs.access(dir, err => {
      if (err) {
        fs.mkdir(dir, err => {
          this.dieif(err, __filename, __line)
          callback(dir)
          this.success(`写入${dirname}成功！`)
        })
      }
    })
  }
  // fill 任务
  static taskFill (list) {
    if (!Array.isArray(list)) throw Error('参数必须数组！')
    list.forEach(dir => Tool.createDir(dir, dirname => {
      require(`./task/fill_${dir}`)(dirname)
    }))
  }
  // 复制 from 下所有文件(夹)到 to, 不覆盖
  static copyDir (from, to) {
    fs.readdir(from, (err, children) => {
      this.dieif(err, __filename, __line)
      children.forEach(child => {
        let childFrom = path.join(from, child)
        let childTo = path.join(to, child)
        fs.stat(childFrom, (err, stat) => {
          this.dieif(err, __filename, __line)
          if (stat.isFile()) {
            fs.access(childTo, err => {
              if (!err) return
              this.copyFile(childFrom, childTo)
            })
          } else {
            fs.access(childTo, err => {
              if (!err) return
              fs.mkdir(childTo, err => {
                this.dieif(err, __filename, __line)
                this.copyDir(childFrom, childTo)
              })
            })
          }
        })
      })
    })
  }
  // 复制文件 from 到 to
  static copyFile (from, to) {
    let readable = fs.createReadStream(from)
    let writable = fs.createWriteStream(to)
    readable.pipe(writable)
  }
  // 若target存在, 将list添加到target中
  static addTo (target, list) {
    if (!Array.isArray(list)) list = [list]
    fs.access(target, err => {
      if (!err) {
        fs.readFile(target, (err, res) => {
          Tool.dieif(err)
          let data = res.toString()
          list.forEach((str, index) => {
            if (!data.includes(str)) {
              fs.appendFile(target, `${index ? '' : '\n'}${str}\n`, err => {
                Tool.dieif(err)
                Tool.success(`add ${str} to ${path.basename(target)}!`)
              })
            }
          })
        })
      }
    })
  }
}
