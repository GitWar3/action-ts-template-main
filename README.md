## 自动推送

### 更新脚本命令

`npm run all`

### 原理

抓取 gitee 的 commit，只会抓取下列格式

(售后中心): 新增 xxx 模块

```bash

feat(模块名/页面名称): 提交信息

refactor(模块名/页面名称): 提交信息

fix(模块名/页面名称): 提交信息

perf(模块名/页面名称): 提交信息


```

文件名是代码的文件名称或者模块如：

```bash
feat
```

建议在 vscode 安装 https://marketplace.visualstudio.com/items?itemName=redjue.git-commit-plugin 这个插件用来写 commit 信息

### 推送方式

周一到周六 下午 6 点左右会触发一次推送，也可以在 issue 里面添加新的 label 来手动触发。


