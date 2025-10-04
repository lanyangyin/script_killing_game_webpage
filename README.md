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
- 注册用户信息
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
        |   |__抉择章节*
        |       |__剧本章节名*.txt
        |__vote
            |__投票选项文件*.json
```
- 带`*`为可修改可添加文件或文件夹
## 剧本id
- 记录在`directory.json`文件中
- > 使用id是为了防止重名
## 剧本id/THE_TRUTH.txt
- 剧本真相文本文件，在剧本结束时展示
## 剧本id/cover.webp
- 剧本封面
## 剧本id/character.json
- 剧本角色基础信息
    ```json
    {
      "角色名称": {
        "introduction": "角色简介",
        "id": "角色id"
      },
      "角色2": {
        "introduction": "角色2的简介",
        "id": "c2"
      }
    }
    ```
## 剧本id/角色id
- 记录在`剧本id/character.json`中
## 剧本id/角色id/avatar.png
- 角色头像
## 剧本id/角色id/process.json
- 角色剧本流程文件
    ```json
    {
      "data": [
        {
          "type": "plot",
          "name": "序章"
        },
        {
          "type": "clue",
          "name": "scene1"
        },
        {
          "type": "vote",
          "name": "vote1"
        },
        {
          "type": "plot",
          "name": "第一章"
        },
        {
          "type": "choice",
          "name": "choice1"
        },
        {
          "type": "plot",
          "name": "choice1章节"
        }
      ]
    }    
    ```
  - 剧本会按照这个流程的顺序来走
  - choice
    - choice流程的抉择提问来自`剧本id/角色id/choice`文件夹下与`name`相对应的`抉择选项文件*.json`中获取接下来分支plot流程文件名称
    - 经过了choice流程后的plot流程的name决定了choice流程选择的plot文件在哪个`剧本id/角色id/plot/抉择章节*`文件夹中
  - plot
    - plot流程是显示角色剧本，剧本文件放在`剧本id/角色id/plot`文件夹下与`name`相对应的`剧本章节名*.txt`
  - vote
    - vote流程是选项投票，选项来自`剧本id/角色id/vote`文件夹下与`name`相对应的`投票选项文件*.json`
  - clue流程是查找线索`name`为线索场景名称，可在`剧本id/角色id/clue`下找到对应的线索物品文件夹`线索物品名称*`
