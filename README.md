# script_killing_game_webpage
剧本杀网页
>这是一个剧本杀静态网站示例

# 总体剧本基本数据`directory.json`
```json
{
  "data": [
    {
      "name": "DEMO1",
      "introduction": "这是一段剧本背景介绍示例",
      "hint": "这是一段参与剧本前的提示示例",
      "number_of_people": 4,
      "tag": ["推理", "新手"],
      "difficulty": 1,
      "location": 0.1,
      "time_required_for_game": 1.5,
      "last_time_played": 0,
      "id": 0
    },
    {
      "name": "敬请期待",
      "introduction": "",
      "hint": "",
      "number_of_people": 0,
      "tag": ["-"],
      "difficulty": 0,
      "location": -0.1,
      "time_required_for_game": 0,
      "last_time_played": 0,
      "id": -1
    }
  ],
  "tags": ["推理", "变格", "本格", "新本格", "校园", "都市", "新手", "古代", "情感", "硬核", "现代"]
}
```
## ["data"][obj]
- 剧本基本信息列表
  - name: 剧本名称
  - introduction: 剧本介绍
  - hint: 剧本提醒
  - number_of_people: 角色数量
  - tag: 剧本标签，["-"]代表全部标签
  - difficulty: 剧本难度（1~5）
  - location: 推荐程度，越大越靠前
  - time_required_for_game: 推荐游玩时长（小时）
  - last_time_played: 最后一次游玩时间，【无用字段，可以不要】
  - id: 剧本id
## ["tags"]
- 剧本所有的标签

# 用户信息`users.json`
```json
{
  "ordinary": [
    {
      "user": "demo",
      "password": "password"
    },
    {
      "user": "demo1",
      "password": "password"
    }
  ],
  "tourist": {
    "user": "tourist",
    "password": "password"
  }
}
```
## ["ordinary"][obj]
- obj: 注册用户信息
  - user: 用户名称
  - password: 用户密码
## ["tourist"]
- 游客账户密码

> 由于静态网页无法在服务器动态操作账户文件  
> 这里以明文预制，真实请使用哈希码等进行储存和比对以保证信息安全  

# 剧本文件夹目录结构
```base
剧本id*
  |__character.json
  |__cover.webp
  |__THE_TRUTH.txt
  |__角色id*
        |__avatar.png
        |__process.json
        |__choice
        |   |__抉择选项文件*.json
        |__clue
        |   |__场景名称*
        |       |__background.png
        |       |__clues.json
        |       |__线索物品名称*
        |           |__iconic.png
        |           |__线索名称*.png
        |__plot
        |   |__剧本章节名*.txt
        |   |__抉择章节文件夹*
        |       |__剧本章节名*.txt
        |__vote
            |__投票选项文件*.json
```
- 带`*`为可修改名称和可增删的文件或文件夹
# 文件介绍
- ## 剧本id*
  - 记录在`directory.json`文件中
  - > 使用id是为了防止重名
- ## 剧本id*/THE_TRUTH.txt
  - 剧本真相文本文件，在剧本结束时展示
- ## 剧本id*/cover.webp
  - 剧本封面
- ## 剧本id*/character.json
  - 剧本角色基础信息
      ```json
      {
        "角色名称": {
          "introduction": "角色简介",
          "id": "角色id*"
        },
        "角色2": {
          "introduction": "角色2的简介",
          "id": "c2"
        }
      }
      ```
- ## 剧本id*/角色id*
  - 记录在`剧本id/character.json`中
- ## 剧本id*/角色id*/avatar.png
  - 角色头像
- ## 剧本id*/角色id*/process.json
  - 角色剧本流程文件
      ```json
      {
        "data": [
          {
            "type": "plot",
            "name": "剧本章节名*"
          },
          {
            "type": "clue",
            "name": "场景名称*"
          },
          {
            "type": "vote",
            "name": "投票选项文件*"
          },
          {
            "type": "plot",
            "name": "剧本章节名*"
          },
          {
            "type": "choice",
            "name": "抉择选项文件*"
          },
          {
            "type": "plot",
            "name": "抉择章节文件夹*"
          }
        ]
      }    
      ```
    - 可以修改这里的流程，但是要注意准备好对应的文件，该角色的剧本会按照这个流程的顺序来走。
    - choice
      - choice流程的抉择提问来自`剧本id*/角色id*/choice`文件夹下与`name`相对应的`抉择选项文件*.json`中获取接下来分支plot流程文件名称
      - 经过了choice流程后的plot流程的name决定了choice流程选择的plot文件在哪个`剧本id/角色id/plot/抉择章节文件夹*`文件夹中
    - plot
      - plot流程是显示角色剧本，剧本文件放在`剧本id*/角色id*/plot`文件夹下与`name`相对应的`剧本章节名*.txt`
    - vote
      - vote流程是选项投票，选项来自`剧本id*/角色id*/vote`文件夹下与`name`相对应的`投票选项文件*.json`
    - clue
      - clue流程是查找线索`name`为线索场景名称，可在`剧本id*/角色id*/clue`下找到对应的线索物品文件夹`线索物品名称*`，
      - 每个线索物品可以有多个线索，在`剧本id/角色id/clue/clues.json`中有记录线索物品有哪些线索
- ## 剧本id*/角色id*/choice
  - 抉择流程所需的文件
- ## 剧本id*/角色id*/choice/抉择选项文件*.json
  - 记录在`剧本id*/角色id*/process.json`文件中
  - 抉择流程中的抉择标题和选项，以及抉择完成后下一个plot流程中会到哪一个章节
      ```json
      {
        "这里是抉择标题": [
          {
            "index": "抉择一",
            "go_to_the_scene": "剧本章节名*"
          },
          {
            "index": "抉择二",
            "go_to_the_scene": "choice1章节1"
          }
        ]
      }
      ```
    - 抉择只能有一个题目，可以有多个选项
    - "index"字段记录选项的内容
    - "go_to_the_scene"字段记录选择这个抉择选项后在下一个plot流程会走向哪一个章节
    - > 注意：choice流程后面必须接着plot流程
- ## 剧本id*/角色id*/clue
  - 线索流程所需的文件
- ## 剧本id*/角色id*/clue/场景名称*
  - 记录在`剧本id*/角色id*/process.json`文件中
  - 在线索流程中以场景划分
- ## 剧本id*/角色id*/clue/场景名称*/background.png
  - 场景的背景图片，会在线索流程中进入该场景时展示出来
- ## 剧本id*/角色id*/clue/场景名称*/clues.json
  - 记录了该场景下的物品有哪些线索的文件
      ```json
      {
        "线索物品名称*": [
          {"线索名称*": "线索内容"},
          {"线索2": "线索二内容"}
        ],
        "物品2": [
          {"线索a": "线索一内容"},
          {"线索b": "线索二内容"}
        ]
      }
      ```
    - 包含了物品名称，和该物品所携带的线索名称及其线索内容
- ## 剧本id*/角色id*/clue/场景名称*/线索物品名称*
  - 记录在了`剧本id*/角色id*/clue/场景名称*/clues.json`
  - 存放了物品的图片和物品所携带的线索的图片
- ## 剧本id*/角色id*/clue/场景名称*/线索物品名称*/iconic.png
  - 线索物品的图片
- ## 剧本id*/角色id*/clue/场景名称*/线索物品名称*/线索名称*.png
  - 记录在了`剧本id*/角色id*/clue/场景名称*/clues.json`
  - 线索的图片
- ## 剧本id*/角色id*/plot
  - 角色剧情流程所需文件
- ## 剧本id*/角色id*/plot/剧本章节名*.txt
  - 记录在`剧本id*/角色id*/process.json`文件中
  - 角色的剧本
- ## 剧本id*/角色id*/plot/抉择章节文件夹*
  - **记录在角色剧情流程文件`剧本id*/角色id*/process.json`中，而不是抉择文件中**
  - choice流程后所跳转到的章节存放处
- ## 剧本id*/角色id*/plot/抉择章节文件夹*/剧本章节名*.txt
  - 记录在抉择文件`剧本id*/角色id*/choice/抉择选项文件*.json`中
  - choice流程后所跳转到的章节
- ## 剧本id*/角色id*/vote
  - 投票剧情所需的文件
- ## 剧本id*/角色id*/vote/投票选项文件*.json
  - 记录在`剧本id*/角色id*/process.json`文件中
  - 在投票流程中展示的投票标题和选项
      ```json
      {
        "data": [
          {
            "question": "第一个问题",
            "options": ["选项一", "选项二", "选项三"]
          },
          {
            "question": "第2问",
            "options": ["选项一", "选项二", "选项三"]
          }
        ]
      }
      ```

# 使用说明
## 添加剧本信息
-  向`directory.json`文件中添加剧本信息，具体文件格式请去上方查找
## 创建剧本文件夹
-  剧本文件夹的名称为在`directory.json`文件中添加剧本信息时，剧本的id
-  剧本文件夹数量只能比`directory.json`中的剧本多
-  在`directory.json`中有的角色，必须有相应的剧本文件夹
## 在剧本文件夹中添加剧本封面文件`cover.webp`
-  注意此文件名不可更改
-  剧本文件夹中此文件不可缺失
## 在剧本文件夹中添加剧本封面文件`THE_TRUTH.txt`
-  注意此文件名不可更改
-  剧本文件夹中此文件不可缺失
## 在剧本文件夹中添加剧本角色基本信息文件`character.json`
-  注意此文件名不可更改
-  具体文件格式请去上方查找
-  剧本文件夹中此文件不可缺失
## 在剧本文件夹中添加角色文件夹
-  角色文件夹名称为当前剧本文件夹中的角色基本信息文件`character.json`中角色对应的角色id
-  角色文件夹数量只能比`character.json`中的角色多
-  在`character.json`中有的角色，必须在剧本文件夹中有相应的角色文件夹
## 在角色文件夹中添加角色头像文件`avatar.png`
-  注意此文件名不可更改
-  角色文件夹中此文件不可缺失
## 在角色文件夹中添加角色流程文件`process.json`
-  具体文件格式请去上方查找
-  角色文件夹中此文件不可缺失


## **_添加流程类型文件夹_**
### 在剧本文件夹内添加plot流程文件夹`plot`
-  注意此文夹名称不可更改
-  如果流程文件`process.json`中["type"]字段没有plot可以没有此文件夹
#### 在plot流程文件夹内添加当前剧本的角色剧本文本文件`剧本章节名*.txt`
-  文本文件格式为txt
-  文本文件的名称在流程文件`process.json`中被 没有和choice流程绑定的 plot流程指定
-  在`process.json`中被 没有和choice流程绑定plot流程指定 的文本文件必须存在在这个文件夹下
#### 在plot流程文件夹内添加当前剧本存放角色的抉择支线文本文件的抉择文本文件夹`抉择章节文件夹*`
- 抉择文本文件夹的名称被在流程文件`process.json`中被 choice流程绑定的 plot流程指定
- 在流程文件`process.json`中被 choice流程绑定的 plot流程指定的抉择文本文件夹必须存在
#### 在plot流程文件夹内添加抉择文件夹中的抉择支线文本文件`抉择章节文件夹*/剧本章节名*.txt`
- 抉择文本文件夹 中的 支线文本文件名称 被在流程文件`process.json`中被 绑定了plot流程的choice流程指定的`抉择选项文件*.json`中的 抉择选项 指定

### 在剧本文件夹内添加choice流程文件夹`choice`
- 注意此文件夹名称不可修改
- 如果流程文件`process.json`中["type"]字段没有choice可以没有此文件夹
#### 在choice流程文件夹里添加抉择选项文件`抉择选项文件*.json`
-  具体文件格式请去上方查找
- 此文件的名称在流程文件`process.json`中被choice流程指定

### 在剧本文件夹内添加clue线索文件夹`clue`
- 注意此文件夹名称不可修改
- 如果流程文件`process.json`中["type"]字段没有clue可以没有此文件夹
### 添加场景文件夹`场景名称*`
- 场景文件夹的名称被在流程文件`process.json`中被 clue流程指定
### 在场景文件夹内添加场景背景`background.png`
- 此文件在场景文件夹中不可缺失
### 在场景文件夹内添加线索文件`clues.json`
- 具体文件格式请去上方查找
- 此文件在场景文件夹中不可缺失
### 添加线索物品文件夹`线索物品名称*`
- 此文件夹名称在线索文件`clues.json`中被指定
- 在线索文件`clues.json`中存在的线索物品必须有此文件夹
### 在线索物品文件夹中添加线索物品图片`iconic.png`
- 注意此文件名称不可更改
- 此文件在线索物品文件夹中不可缺失
### 在线索物品文件夹中添加线索物品对应的线索图片`线索名称*.png`
- 此文件夹名称在线索文件`clues.json`中被指定
- 在线索文件`clues.json`中的线索物品存在的线索必须有此文件 

### 在剧本文件夹内添加clue线索文件夹`vote`
- 注意此文件夹名称不可修改
- 如果流程文件`process.json`中["type"]字段没有vote可以没有此文件夹
#### 在choice流程文件夹里添加抉择选项文件`投票选项文件*.json`
- 具体文件格式请去上方查找
- 此文件的名称在流程文件`process.json`中被vote流程指定

# 部署
## 直接在浏览器打开
- 在终端使用参数 `--allow-file-access-from-files`，打开浏览器后再拖入index.hml文件
  - # Windows
    - start [chrom浏览器路径] --allow-file-access-from-files
    - start "C:\Users\Public\Desktop\Google Chrome.lnk" --allow-file-access-from-files
    - start "C:\Program Files\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files
  - # Mac
    - open -a "Google Chrome" --args --allow-file-access-from-files
## pyton
- 终端使用python参数`-m http.server 8000`
  - # Windows
    - 先到python官网下载python并安装，然后在下面两种方法中选一个
      1. 打开这个项目的文件夹，在项目根目录右键选择`在终端中输入
         - `python -m http.server 8080`
         - 在浏览器地址栏输入`http://localhost:8080/`
      2. 在文件夹的地址栏直接运行服务
         - 打开项目文件夹
         - 在地址栏`python -m http.server 8080`
         - 在浏览器地址栏输入`http://localhost:8080/`
  - # Mac
    - 直接打开终端执行`python3 -m http.server 8080`
    - 在浏览器地址栏输入`http://localhost:8080/`



