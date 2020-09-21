# 前端热点技术之 Serverless



### 什么是 Serverless


“无服务器”的意思，所谓无服务器并非脱离服务器的 Web 离线应用，
也不是说前端页面绕过服务端直接读写数据库，而是开发者不用再考虑服务器环境搭建和维护等问题，只需要专注于开发即可。


### Serverless 从何而来




### Serverless 的组成



Serverless 架构由两部分组成，即 FaaS 和 BaaS。

#### FaaS（Function-as-a-Service）函数即服务，
一个函数就是一个服务，函数可以由任何语言编写，除此之外不需要关心任何运维细节，比如计算资源、弹性扩容，而且还可以按量计费，且支持事件驱动。


#### BaaS（Backend-as-a-Service）后端即服务，集成了许多中间件技术，比如数据即服务（数据库服务）、缓存、网关等。



### Serverless 的特点


#### 免维护


Serverless 不仅提供了运行代码的环境，还能自动实现负载均衡、弹性伸缩这类高级功能，
极大地降低了服务搭建的复杂性，有效提升开发和迭代的速度。



#### 费用




#### 深度绑定


通常使用某个云厂商的 Serverless 产品时，可能会包括多种产品，如函数计算、对象存储、数据库等，而这些产品和云厂商又深度绑定，所以如果要进行迁移，成本相对于部署在服务器而言会增加很多。



#### 运行时长限制


通常云厂商对于 Serverless 中的函数执行时间是有限制的，如阿里云的函数计算产品，
最大执行时长为 10 分钟，如果执行长时间任务，还需要单独申请调整时长上限，
或者自行将超时函数拆分成粒度更小的函数，但是这种方式会增加一定的开发成本。




#### 冷启动


由于函数是按需执行的，首次执行时会创建运行容器，一般这个创建环境的时间在几百毫秒，
在延迟敏感的业务场景下需要进行优化，比如定时触发函数或者设置预留实例。




### Serverless 的应用场景

### 事件函数。

事件函数的执行方式有两种，一种是通过 SDK 提供的 API 函数调用它，基于此可以进行一些轻量计算操作，
比如对图片进行压缩、格式转换，又或者执行一些 AI 训练任务；另一种是通过配置时间和间隔，让其自动执行，
一些常见的自动执行场景包括文件备份、数据统计等。

### HTTP 函数。
每一个 HTTP 函数都有特定的域名来供外部访问，当这个域名被访问时，函数将会被创建并执行。
可以使用 HTTP 函数为前后端分离架构的 Web 应用提供后端数据支撑，
比如提供获取天气 API 查看实时天气，或者提供 API 来读写数据库。



### Serverless 实例

首先是 HTTP 函数负责接收 GitHub 发出的 webhook 请求，
当收到请求后使用内部模块调用一个事件函数，在这个事件函数中执行具体的操作。
虽然理论上一个 HTTP 函数可以实现，
但拆解成两个函数可以有效避免函数执行时间过长导致的 webhook 请求超时报错。


#### HTTP 函数源码：


```js
/**
 * ACCOUNT_ID 主账号ID
 * ACCESS_KEY_ID 访问 bucket 所需要的 key
 * ACCESS_KEY_SECRET 访问 bucket 所需要的 secret
 * REGION bucket 所在的 region
 * BUCKET 用于存储配置文件的 bucket
 */
const {
  ACCOUNT_ID,
  ACCESS_KEY_ID,
  ACCESS_KEY_SECRET,
  REGION,
  BUCKET
} = process.env
const FCClient = require('@alicloud/fc2');
const OSS = require('ali-oss')
const getRawBody = require('raw-body')
/**
 * 
 * @param {string} filePath 函数计算配置文件路径
 */
const getOSSConfigFile = async (filePath) => {
  try {
    const client = new OSS({
      region: REGION,
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: ACCESS_KEY_SECRET,
      bucket: BUCKET
    });
    const result = await client.get(filePath);
    const content = result.content ? result.content.toString() : '{}'
    return JSON.parse(content)
  } catch(e) {
    console.error(e)
    return {}
  }
}

exports.handler = (req, resp) => {
  getRawBody(req, async (e, payload) => {
    const body = JSON.parse(payload)
    if (e) {
      console.error(e)
      resp.setStatusCode(400)
      resp.send('请求体解析失败')
      return
    }
    let cfg
    try {
      let config
      config = await getOSSConfigFile(`/config/${body.repository.name}.json`) || {}
      cfg = config.action[body.action]
      if (!cfg) {
        console.error(config.action, body.action)
        throw Error('未找到对应仓库的配置信息.')
      }
    } catch (e) {
      console.error(e)
      resp.setStatusCode(500)
      resp.send(e.message)
      return
    }
    if (cfg) {
      const client = new FCClient(ACCOUNT_ID, {
        accessKeyID: ACCESS_KEY_ID,
        accessKeySecret: ACCESS_KEY_SECRET,
        region: cfg.region
      });
      client.invokeFunction(cfg.service, cfg.name, JSON.stringify(cfg)).catch(console.error)
      resp.send(`client.invokeFunction(${cfg.service}, ${cfg.name}, ${JSON.stringify(cfg)})`)
    }
  })
}


```


解决了比较麻烦的身份认证和终端交互问题之后，剩下的逻辑就比较简单了，
执行 git clone 命令拉取仓库代码就行，为了加快速下载速度，
可以通过设置 --depth 1 这个参数来指定只拉取最新提交的代码。


```js
const OSS = require('ali-oss')
const cp = require('child_process')
const { BUCKET, REGION, ACCESS_KEY_ID, ACCESS_KEY_SECRET } = process.env
const shellFile = 'ssh.sh'
/**
 * 
 * @param {string} repoURL 代码仓库地址
 * @param {string} repoKey 访问代码仓库所需要的密钥文件路径
 * @param {string} branch  分支名称
 */
const downloadRepo = async ({repoURL, repoKey, branch='master'}, retryTimes = 0) => {
  try {
    console.log(`Download repo ${repoURL}`);
    process.chdir(global.workDir)
    const client = new OSS({
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: ACCESS_KEY_SECRET,
      region: REGION,
      bucket: BUCKET
    });
    await client.get(repoKey, `./id_rsa`);
    await client.get(shellFile, `./${shellFile}`);
    cp.execSync(`chmod 0600 ./id_rsa`);
    cp.execSync(`chmod +x ./${shellFile}`);
    cp.execSync(`GIT_SSH="./${shellFile}" git clone -b ${branch} --depth 1 ${repoURL}`);
    console.log('downloaded');
  } catch (e) {
    console.error(e);
    if (retryTimes < 2) {
      downloadRepo({repoURL, repoKey, branch}, retryTimes++);
    } else {
      throw e
    }
  }
};
module.exports = downloadRepo

```


安装依赖并构建这个步骤没有太多复杂的地方，通过子进程调用 yarn install --check-files 命令，
然后执行 package.json 文件中配置的脚本任务即可。具体代码如下：


```js

const cp = require('child_process')

const install = (repoName, retryTimes = 0) => {
  try {
    console.log('Install dependencies.');
    cp.execSync(`yarn install --check-files`);
    console.log('Installed.');
    retryTimes = 0
  } catch (e) {
    console.error(e.message);
    if (retryTimes < 2) {
      console.log('Retry install...');
      install(repoName, ++retryTimes);
    } else {
      throw e
    }
  }
}
const build = (command, retryTimes = 0) => {
  try {
    console.log('Build code.')
    cp.execSync(`${command}`);
    console.log('Built.');
  } catch (e) {
    console.error(e.message);
    if (retryTimes < 2) {
      console.log('Retry build...');
      build(command, ++retryTimes);
    } else {
      throw e
    }
  }
};

module.exports = ({
  repoName,
  command
}) => {
  const {
    workDir
  } = global
  process.chdir(`${workDir}/${repoName}`)
  install(repoName)
  build(command)
}

```




最后上传部署可以根据不同的场景编写不同的模块，比如有的可能部署在 OSS 存储上，
会需要调用 OSS 对应的 SDK 进行上传，有的可能部署在某台服务器上，需要通过 scp 命令来传输。



```js

const path = require('path');
const OSS = require('ali-oss');
// 遍历函数
const traverse = (dirPath, arr = []) => {
  var filesList = fs.readdirSync(dirPath);
  for (var i = 0; i < filesList.length; i++) {
    var fileObj = {};
    fileObj.name = path.join(dirPath, filesList[i]);
    var filePath = path.join(dirPath, filesList[i]);
    var stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      traverse(filePath, arr);
    } else {
      fileObj.type = path.extname(filesList[i]).substring(1);
      arr.push(fileObj);
    }
  }
  return arr
}
/**
 * 
 * @param {string} repoName
 * 
 */
const deploy = ({ dist = '', source, region, accessKeyId, accessKeySecret, bucket, repoName }, retryTimes = 0) => new Promise(async (res) => {
  const { workDir } = global
  console.log('Deploy.');
  try {
    const client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket
    });
    process.chdir(`${workDir}/${repoName}`)
    const root = path.join(process.cwd(), source)
    let files = traverse(root, []);
    await Promise.all(files.map(({ name }, index) => {
      const remotePath = path.join(dist, name.replace(root + '/', ''));
      console.log(`[${index}] uploaded ${name} to ${remotePath}`);
      return client.put(remotePath, name);
    }));
    res();
    console.log('Deployed.');
  } catch (e) {
    console.error(e);
    if (retryTimes < 2) {
      console.log('Retry deploy.');
      deploy({ dist, source, region, accessKeyId, accessKeySecret, bucket }, ++retryTimes);
    } else {
      throw e
    }
  }
})
module.exports = deploy

```

