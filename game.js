// 全局变量
let scriptId = null;
let characterId = null;
let characterData = null;
let processData = null;
let currentProcessIndex = 0;
let collectedClues = [];
let actionLog = [];
let voteAnswers = {};
let choiceAnswer = null;
let truthContent = null;

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数中的剧本ID和角色ID
    const urlParams = new URLSearchParams(window.location.search);
    scriptId = urlParams.get('sid');
    characterId = urlParams.get('cid');

    if (scriptId && characterId) {
        // 初始化游戏
        initGame();
    } else {
        // 如果没有参数，显示错误信息
        document.querySelector('.game-container').innerHTML = `
            <div class="error-container">
                <h2>错误</h2>
                <p>缺少必要的游戏参数，请返回重新选择。</p>
                <a href="index.html" class="back-btn">返回首页</a>
            </div>
        `;
    }

    // 设置模态框关闭事件
    document.getElementById('close-modal').addEventListener('click', function() {
        document.getElementById('clue-modal').style.display = 'none';
    });

    // 设置流程控制按钮事件
    document.getElementById('next-process-btn').addEventListener('click', nextProcess);
});

// 初始化游戏
async function initGame() {
    try {
        // 加载角色数据
        await loadCharacterData();

        // 加载流程数据
        await loadProcessData();

        // 加载真相内容
        await loadTruthContent();

        // 显示当前流程
        showCurrentProcess();

    } catch (error) {
        console.error('初始化游戏失败:', error);
        document.querySelector('.game-container').innerHTML = `
            <div class="error-container">
                <h2>加载失败</h2>
                <p>初始化游戏时出错，请稍后重试。</p>
                <a href="index.html" class="back-btn">返回首页</a>
            </div>
        `;
    }
}

// 加载角色数据
async function loadCharacterData() {
    const response = await fetch(`${scriptId}/character.json`);
    characterData = await response.json();

    // 更新玩家信息
    updatePlayerInfo();

    // 更新所有角色列表
    updateAllCharacters();
}

// 更新玩家信息
function updatePlayerInfo() {
    // 查找当前角色
    const characterName = Object.keys(characterData).find(
        name => characterData[name].id === characterId
    );

    if (characterName) {
        // 更新玩家头像
        document.getElementById('player-avatar').src = `${scriptId}/${characterId}/avatar.png`;
        // 更新玩家名称
        document.getElementById('player-name').textContent = characterName;
    }
}

// 更新所有角色列表
function updateAllCharacters() {
    const charactersList = document.getElementById('characters-list');
    charactersList.innerHTML = '';

    Object.entries(characterData).forEach(([name, data]) => {
        const characterItem = document.createElement('div');
        characterItem.className = 'character-item';

        characterItem.innerHTML = `
            <div class="character-avatar-small">
                <img src="${scriptId}/${data.id}/avatar.png" alt="${name}头像">
            </div>
            <div class="character-name-small">${name}</div>
            <div class="character-tooltip">
                <strong>${name}</strong><br>
                ${data.introduction || '暂无角色介绍'}
            </div>
        `;

        charactersList.appendChild(characterItem);
    });
}

// 加载流程数据
async function loadProcessData() {
    const response = await fetch(`${scriptId}/${characterId}/process.json`);
    processData = await response.json();
}

// 加载真相内容
async function loadTruthContent() {
    try {
        const response = await fetch(`${scriptId}/THE_TRUTH.txt`);
        truthContent = await response.text();
    } catch (error) {
        console.error('加载真相内容失败:', error);
        truthContent = '真相内容加载失败。';
    }
}

// 显示当前流程
function showCurrentProcess() {
    if (currentProcessIndex >= processData.data.length) {
        // 所有流程已完成，显示真相
        showTruth();
        return;
    }

    const currentProcess = processData.data[currentProcessIndex];

    // 记录操作日志
    addActionLog(`进入${currentProcess.name}`);

    // 更新流程历史
    updateProcessHistory();

    // 根据流程类型显示不同内容
    switch (currentProcess.type) {
        case 'plot':
            showPlotProcess(currentProcess);
            break;
        case 'vote':
            showVoteProcess(currentProcess);
            break;
        case 'choice':
            showChoiceProcess(currentProcess);
            break;
        case 'clue':
            showClueProcess(currentProcess);
            break;
    }
}

// 更新流程历史
function updateProcessHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    processData.data.forEach((process, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${index === currentProcessIndex ? 'current' : ''}`;
        historyItem.textContent = `${process.name} (${process.type})`;
        historyList.appendChild(historyItem);
    });
}

// 显示剧情流程
async function showPlotProcess(process) {
    try {
        // 加载剧情文本
        let plotPath = `${scriptId}/${characterId}/plot/${process.name}.txt`;

        // 如果是选择后的剧情，使用选择的结果
        if (choiceAnswer && process.name === processData.data[currentProcessIndex - 1]?.name) {
            plotPath = `${scriptId}/${characterId}/plot/${process.name}/${choiceAnswer}.txt`;
            choiceAnswer = null; // 重置选择
        }

        const response = await fetch(plotPath);
        const plotText = await response.text();

        // 显示剧情内容
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">${plotText}</div>
        `;

        // 更新按钮
        updateNextButton();

    } catch (error) {
        console.error('加载剧情失败:', error);
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">剧情内容加载失败。</div>
        `;
    }
}

// 显示投票流程
async function showVoteProcess(process) {
    try {
        // 加载投票数据
        const response = await fetch(`${scriptId}/${characterId}/vote/${process.name}.json`);
        const voteData = await response.json();

        // 重置投票答案
        voteAnswers = {};

        // 显示投票内容
        let voteHTML = '<div class="vote-container">';

        voteData.data.forEach((question, qIndex) => {
            voteHTML += `
                <div class="vote-question">${question.question}</div>
                <div class="vote-options">
            `;

            question.options.forEach((option, oIndex) => {
                voteHTML += `
                    <div class="vote-option" data-qindex="${qIndex}" data-oindex="${oIndex}">
                        ${option}
                    </div>
                `;
            });

            voteHTML += '</div>';
        });

        voteHTML += '</div>';

        document.getElementById('content-container').innerHTML = voteHTML;

        // 添加选项点击事件
        document.querySelectorAll('.vote-option').forEach(option => {
            option.addEventListener('click', function() {
                const qIndex = parseInt(this.dataset.qindex);
                const oIndex = parseInt(this.dataset.oindex);

                // 移除同问题的其他选项选中状态
                document.querySelectorAll(`.vote-option[data-qindex="${qIndex}"]`).forEach(el => {
                    el.classList.remove('selected');
                });

                // 设置当前选项为选中状态
                this.classList.add('selected');

                // 记录答案
                voteAnswers[qIndex] = oIndex;

                // 检查是否所有问题都已回答
                checkVoteCompletion();
            });
        });

        // 更新按钮
        updateNextButton();

    } catch (error) {
        console.error('加载投票失败:', error);
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">投票内容加载失败。</div>
        `;
    }
}

// 检查投票是否完成
function checkVoteCompletion() {
    const voteDataLength = JSON.parse(
        document.querySelector('.vote-container').innerHTML.includes('vote-question') ?
        document.querySelectorAll('.vote-question').length : 0
    );

    const nextButton = document.getElementById('next-process-btn');

    if (Object.keys(voteAnswers).length === voteDataLength) {
        nextButton.disabled = false;
        nextButton.textContent = getNextButtonText();
    } else {
        nextButton.disabled = true;
        nextButton.textContent = '未完成';
    }
}

// 显示选择流程
async function showChoiceProcess(process) {
    try {
        // 加载选择数据
        const response = await fetch(`${scriptId}/${characterId}/choice/${process.name}.json`);
        const choiceData = await response.json();

        // 重置选择答案
        choiceAnswer = null;

        // 显示选择内容
        let choiceHTML = '<div class="choice-container">';

        Object.entries(choiceData).forEach(([title, options]) => {
            choiceHTML += `<div class="choice-title">${title}</div>`;
            choiceHTML += '<div class="choice-options">';

            options.forEach((option, index) => {
                choiceHTML += `
                    <div class="choice-option" data-goto="${option.go_to_the_scene}">
                        ${option.index}
                    </div>
                `;
            });

            choiceHTML += '</div>';
        });

        choiceHTML += '</div>';

        document.getElementById('content-container').innerHTML = choiceHTML;

        // 添加选项点击事件
        document.querySelectorAll('.choice-option').forEach(option => {
            option.addEventListener('click', function() {
                // 移除其他选项选中状态
                document.querySelectorAll('.choice-option').forEach(el => {
                    el.classList.remove('selected');
                });

                // 设置当前选项为选中状态
                this.classList.add('selected');

                // 记录答案
                choiceAnswer = this.dataset.goto;

                // 更新按钮
                updateNextButton();
            });
        });

        // 更新按钮
        updateNextButton();

    } catch (error) {
        console.error('加载选择失败:', error);
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">选择内容加载失败。</div>
        `;
    }
}

// 显示线索流程
async function showClueProcess(process) {
    try {
        // 加载线索数据
        const response = await fetch(`${scriptId}/${characterId}/clue/${process.name}/clues.json`);
        const cluesData = await response.json();

        // 显示场景和线索
        let clueHTML = `
            <div class="clue-scene">
                <img class="scene-background" src="${scriptId}/${characterId}/clue/${process.name}/background.png" alt="场景背景">
            </div>
        `;

        document.getElementById('content-container').innerHTML = clueHTML;

        // 添加线索物品到场景
        const sceneElement = document.querySelector('.clue-scene');
        const backgroundImg = document.querySelector('.scene-background');

        // 等待图片加载完成
        backgroundImg.onload = function() {
            Object.keys(cluesData).forEach((itemName, index) => {
                // 计算随机位置
                const maxX = backgroundImg.offsetWidth - 60;
                const maxY = backgroundImg.offsetHeight - 60;
                const randomX = Math.floor(Math.random() * maxX);
                const randomY = Math.floor(Math.random() * maxY);

                // 创建线索物品
                const clueItem = document.createElement('div');
                clueItem.className = 'clue-item-on-scene';
                clueItem.style.left = `${randomX}px`;
                clueItem.style.top = `${randomY}px`;
                clueItem.dataset.itemName = itemName;
                clueItem.dataset.clues = JSON.stringify(cluesData[itemName]);

                // 设置线索物品图标
                clueItem.style.backgroundImage = `url('${scriptId}/${characterId}/clue/${process.name}/${itemName}/iconic.png')`;
                clueItem.style.backgroundSize = 'cover';

                // 显示剩余线索数
                const remainingClues = cluesData[itemName].length;
                clueItem.innerHTML = `<div class="clue-item-count">${remainingClues}</div>`;

                // 添加点击事件
                clueItem.addEventListener('click', function() {
                    showClueDetails(this);
                });

                sceneElement.appendChild(clueItem);
            });
        };

        // 更新按钮
        updateNextButton();

    } catch (error) {
        console.error('加载线索失败:', error);
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">线索内容加载失败。</div>
        `;
    }
}

// 显示线索详情
function showClueDetails(clueItem) {
    const itemName = clueItem.dataset.itemName;
    const clues = JSON.parse(clueItem.dataset.clues);

    // 获取第一个未收集的线索
    const uncollectedClue = clues.find(clue => {
        const clueKey = Object.keys(clue)[0];
        return !collectedClues.some(c => c.item === itemName && c.clue === clueKey);
    });

    if (uncollectedClue) {
        const clueKey = Object.keys(uncollectedClue)[0];
        const clueValue = uncollectedClue[clueKey];

        // 显示线索模态框
        document.getElementById('clue-modal-title').textContent = `${itemName} - ${clueKey}`;
        document.getElementById('clue-modal-text').textContent = clueValue;
        document.getElementById('clue-modal-image').src =
            `${scriptId}/${characterId}/clue/${processData.data[currentProcessIndex].name}/${itemName}/${clueKey}.png`;

        document.getElementById('clue-modal').style.display = 'block';

        // 记录已收集的线索
        collectedClues.push({
            item: itemName,
            clue: clueKey,
            value: clueValue
        });

        // 更新线索列表
        updateCluesList();

        // 更新线索物品上的数字
        const remainingClues = clues.length - collectedClues.filter(c => c.item === itemName).length;
        clueItem.querySelector('.clue-item-count').textContent = remainingClues;

        // 检查是否所有线索都已收集
        checkCluesCompletion();

        // 记录操作日志
        addActionLog(`获得线索: ${itemName} - ${clueKey}`);
    }
}

// 更新线索列表
function updateCluesList() {
    const cluesList = document.getElementById('clues-list');
    cluesList.innerHTML = '';

    collectedClues.forEach(clue => {
        const clueItem = document.createElement('div');
        clueItem.className = 'clue-item';
        clueItem.textContent = `${clue.item} - ${clue.clue}`;
        clueItem.addEventListener('click', function() {
            // 点击线索可以再次查看详情
            document.getElementById('clue-modal-title').textContent = `${clue.item} - ${clue.clue}`;
            document.getElementById('clue-modal-text').textContent = clue.value;
            document.getElementById('clue-modal-image').src =
                `${scriptId}/${characterId}/clue/${processData.data[currentProcessIndex].name}/${clue.item}/${clue.clue}.png`;
            document.getElementById('clue-modal').style.display = 'block';
        });

        cluesList.appendChild(clueItem);
    });
}

// 检查线索是否全部收集
function checkCluesCompletion() {
    const currentProcess = processData.data[currentProcessIndex];

    if (currentProcess.type === 'clue') {
        try {
            // 获取所有线索物品
            const clueItems = document.querySelectorAll('.clue-item-on-scene');
            let allCollected = true;

            clueItems.forEach(item => {
                const itemName = item.dataset.itemName;
                const clues = JSON.parse(item.dataset.clues);
                const collectedCount = collectedClues.filter(c => c.item === itemName).length;

                if (collectedCount < clues.length) {
                    allCollected = false;
                }
            });

            // 更新按钮状态
            const nextButton = document.getElementById('next-process-btn');
            nextButton.disabled = !allCollected;

            if (allCollected) {
                nextButton.textContent = getNextButtonText();
            } else {
                nextButton.textContent = '未完成';
            }
        } catch (error) {
            console.error('检查线索完成状态失败:', error);
        }
    }
}

// 显示真相
function showTruth() {
    document.getElementById('content-container').innerHTML = `
        <div class="truth-content">${truthContent}</div>
    `;

    // 更新按钮
    const nextButton = document.getElementById('next-process-btn');
    nextButton.disabled = false;
    nextButton.textContent = '返回首页';

    // 记录操作日志
    addActionLog('查看真相');
}

// 更新下一步按钮
function updateNextButton() {
    const nextButton = document.getElementById('next-process-btn');
    const currentProcess = processData.data[currentProcessIndex];

    // 根据流程类型设置按钮状态
    switch (currentProcess.type) {
        case 'plot':
            nextButton.disabled = false;
            break;
        case 'vote':
            nextButton.disabled = Object.keys(voteAnswers).length <
                document.querySelectorAll('.vote-question').length;
            break;
        case 'choice':
            nextButton.disabled = !choiceAnswer;
            break;
        case 'clue':
            // 在checkCluesCompletion中处理
            break;
    }

    nextButton.textContent = getNextButtonText();
}

// 获取下一步按钮文本
function getNextButtonText() {
    if (currentProcessIndex >= processData.data.length - 1) {
        return '查看真相';
    } else {
        const nextProcess = processData.data[currentProcessIndex + 1];
        return `进入${nextProcess.name}`;
    }
}

// 下一步流程
function nextProcess() {
    const nextButton = document.getElementById('next-process-btn');

    // 如果当前是最后一个流程，显示真相
    if (currentProcessIndex >= processData.data.length - 1) {
        if (nextButton.textContent === '查看真相') {
            showTruth();
        } else if (nextButton.textContent === '返回首页') {
            window.location.href = 'index.html';
        }
        return;
    }

    // 进入下一个流程
    currentProcessIndex++;
    showCurrentProcess();
}

// 添加操作日志
function addActionLog(action) {
    actionLog.push(action);

    const logList = document.getElementById('log-list');
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.textContent = action;
    logList.appendChild(logItem);

    // 滚动到底部
    logList.scrollTop = logList.scrollHeight;
}