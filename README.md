## CSS 属性书写顺序(重点)

1. 布局定位属性：display / position / float / clear / visibility / overflow（建议 display 第一个写，毕竟关系到模式）
1. 自身属性：width / height / margin / padding / border / background
1. 文本属性：color / font / text-decoration / text-align / vertical-align / white- space / break-word
1. 其他属性（CSS3）：content / cursor / border-radius / box-shadow / text-shadow / background:linear-gradient

## 页面布局分析

1. 必须确定页面的版心（可视区），我们测量可得知。
1. 分析页面中的行模块，以及每个行模块中的列模块。其实页面布局，就是一行行罗列而成的。
1. 制作 HTML 结构。我们还是遵循，先有结构，后有样式的原则。结构永远最重要。
1. 开始运用盒子模型的原理，通过 DIV+CSS 布局来控制网页的各个模块。

## CSS 样式命名规则和规范

1. class、id 都需小写
1. 命名使用英文，禁止使用特殊字符
1. 样式名不能包含 ad、guanggao、ads、gg 是广告含义的关键词，避免元素被网页拓展、插件屏蔽
1. 名称间隔使用-符号
1. 涉及数据、交互等需要联调的部分，禁止通过 id 选择器定义样式，以免开发过程中 id 名变化，引起页局错乱

### 类名命名需要语义化

```
/* 外层容器 */
.wrap {
}
/* 模块容器 */
.mod-box {
}
/* 开始 */
.btn-start {
}
/* ios下载 */
.btn-download-ios {
}
/* 安卓下载 */
.btn-download-andriod {
}
/* 头部导航链接1 */
.btn-head-nav1 {
}
/* 更多新闻 */
.btn-news-more {
}
/* 播放视频 */
.btn-play {
}
/* 按钮ico */
.btn-ico {
}
/* 开始抽奖 */
.btn-lottery {
}
/* 侧栏导航 */
.side-nav {
}
/* 侧栏导航-链接1 */
.side-nav-btn1 {
}
/* 更多 */
.btn-more {
}
```

## 图片命名

1. 图片名称必须小写，禁止使用特殊字符、中文
1. 使用英文或拼音缩写，禁止特殊字符
1. 名称间隔使用-符号
1. 命名需要能体现图片的大概用途
1. 禁止文件名和实际图片内容不符

文件上传统一处理
开发环境：code=dc-bip2-dev-bucket
http://127.0.0.1:2888/api/blade-resource/oss/endpoint/put-file?code=dc-bip2-dev-bucket
测试环境：code=dc-bip2-test-bucket
http://127.0.0.1:2888/api/blade-resource/oss/endpoint/put-file?code=dc-bip2-test-bucket
正式环境 code=dc-bip2-prod-bucket
http://127.0.0.1:2888/api/blade-resource/oss/endpoint/put-file?code=dc-bip2-prod-bucket

## 修改镜像源

npm --registry https://mirrors.cloud.tencent.com/npm/

## 安装依赖

npm i

## 启动服务

npm run dev

## 测试环境打包

npm run build:test

## 生产环境打包

npm run build:prod

- 构建工具 ：使用 Vite ( `vite.config.js` )
- 框架 ：Vue.js (存在 `App.vue` 和 `main.js` )
- 路由 ：Vue Router ( `router` )
- 状态管理 ：Vuex ( `store` )
- 样式解决方案 ：Tailwind CSS ( `tailwind.config.js` ) 和 SCSS
- HTTP 客户端 ：Axios ( `axios.js` )

### 核心目录结构

1. src/ ：源代码主目录

   - api/ ：接口请求模块，包含各业务模块的 API 调用
   - components/ ：通用组件库
   - router/ ：路由配置
   - store/ ：状态管理
   - utils/ ：工具函数，包括日期处理、格式化、权限控制等
   - views/ ：页面组件，按业务模块划分（如 dashboard、flow、system 等）
   - permission.js ：权限控制相关逻辑

2. public/ ：静态资源目录

   - 包含 CSS、图片、字体和第三方 JS 库（如 G6 图表库）

3. build/ ：构建相关文件

### 功能特点

- 权限管理 ：有专门的 `permission.js` 和权限相关 mixin
- 多语言支持 ： `lang` 目录包含中英文配置
- 图表功能 ：引入了 G6 图表库和甘特图相关功能
- 响应式设计 ：包含 media.scss 等响应式样式文件
