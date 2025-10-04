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
let isShowingTruth = false;
let processHistory = []; // 用于存储已完成的流程
let choiceHistory = {}; // 存储每个choice流程的选择结果
let isReviewingHistory = false; // 标记是否正在回顾历史流程
let reviewingProcessIndex = null; // 正在回顾的流程索引

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', async function() {
    // 获取URL参数中的剧本ID和角色ID
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');
    const pwd = urlParams.get('pwd');

    if (!user || !pwd) {
        redirectToLogin();
        return;
    }

    const isValid = await validateCredentials(user, pwd);
    if (!isValid) {
        redirectToLogin();
        return;
    }

    scriptId = urlParams.get('id');
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

    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('clue-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 监听窗口大小变化，重新定位线索物品
    window.addEventListener('resize', function() {
        if (processData && processData.data[currentProcessIndex] &&
            processData.data[currentProcessIndex].type === 'clue') {
            repositionClueItems();
        }
    });
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
                <img src="${scriptId}/${data.id}/avatar.png" alt="${name}头像" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Lq6PC90ZXh0Pjwvc3ZnPg=='">
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
    // 重置回顾状态
    isReviewingHistory = false;
    reviewingProcessIndex = null;

    if (isShowingTruth) {
        showTruth();
        return;
    }

    if (currentProcessIndex >= processData.data.length) {
        // 所有流程已完成，显示真相
        showTruth();
        return;
    }

    const currentProcess = processData.data[currentProcessIndex];

    // 记录操作日志
    addActionLog(`进入${currentProcess.name}`);

    // 更新流程历史
    addToProcessHistory(currentProcess);

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

    // 更新按钮
    updateNextButton();
}

// 添加到流程历史
function addToProcessHistory(process) {
    // 检查是否已经存在相同的流程
    const existingIndex = processHistory.findIndex(p => p.index === currentProcessIndex);

    if (existingIndex === -1) {
        // 如果不存在，添加新流程
        processHistory.push({
            name: process.name,
            type: process.type,
            index: currentProcessIndex
        });
    } else {
        // 如果已存在，更新流程信息
        processHistory[existingIndex] = {
            name: process.name,
            type: process.type,
            index: currentProcessIndex
        };
    }

    updateProcessHistory();
}

// 更新流程历史
function updateProcessHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    // 添加普通流程历史
    processHistory.forEach((process, index) => {
        const historyItem = document.createElement('div');

        // 判断是否为当前流程
        const isCurrent = !isReviewingHistory && !isShowingTruth && index === processHistory.length - 1;
        // 判断是否为正在回顾的流程
        const isReviewing = isReviewingHistory && process.index === reviewingProcessIndex;

        historyItem.className = `history-item ${isCurrent ? 'current' : ''} ${isReviewing ? 'reviewing' : ''}`;
        historyItem.textContent = `${process.name} (${process.type})`;

        // 为plot流程添加点击事件
        if (process.type === 'plot') {
            historyItem.classList.add('clickable');
            historyItem.dataset.processIndex = process.index;
            historyItem.addEventListener('click', function() {
                replayPlotProcess(this.dataset.processIndex);
            });
        }

        historyList.appendChild(historyItem);
    });

    // 如果正在显示真相，添加真相到流程历史
    if (isShowingTruth) {
        const truthItem = document.createElement('div');
        truthItem.className = 'history-item truth-item current';
        truthItem.textContent = '真相 (truth)';
        truthItem.classList.add('clickable');
        truthItem.addEventListener('click', function() {
            showTruth();
        });
        historyList.appendChild(truthItem);
    }

    // 滚动到底部
    historyList.scrollTop = historyList.scrollHeight;
}

// 重新观看plot流程
async function replayPlotProcess(processIndex) {
    try {
        const process = processData.data[processIndex];

        // 设置回顾状态
        isReviewingHistory = true;
        reviewingProcessIndex = parseInt(processIndex);

        // 加载剧情文本
        let plotPath = `${scriptId}/${characterId}/plot/${process.name}.txt`;

        // 检查是否是choice后的plot流程
        if (processIndex > 0) {
            const previousProcess = processData.data[processIndex - 1];
            if (previousProcess.type === 'choice') {
                // 使用之前存储的选择结果
                const choiceProcessName = previousProcess.name;
                if (choiceHistory[choiceProcessName]) {
                    plotPath = `${scriptId}/${characterId}/plot/${process.name}/${choiceHistory[choiceProcessName]}.txt`;
                } else {
                    // 如果没有存储选择结果，使用默认文本
                    plotPath = `${scriptId}/${characterId}/plot/${process.name}.txt`;
                }
            }
        }

        const response = await fetch(plotPath);
        const plotText = await response.text();

        // 显示剧情内容和返回按钮
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">${plotText}</div>
            <div class="review-controls">
                <button id="return-to-current-btn" class="return-btn">返回当前流程</button>
            </div>
        `;

        // 添加返回按钮事件
        document.getElementById('return-to-current-btn').addEventListener('click', returnToCurrentProcess);

        // 更新流程历史显示
        updateProcessHistory();

        // 记录操作日志
        addActionLog(`重新观看: ${process.name}`);

        // 更新流程控制按钮
        updateReviewButton();

    } catch (error) {
        console.error('重新加载剧情失败:', error);
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">剧情内容加载失败。</div>
            <div class="review-controls">
                <button id="return-to-current-btn" class="return-btn">返回当前流程</button>
            </div>
        `;

        // 添加返回按钮事件
        document.getElementById('return-to-current-btn').addEventListener('click', returnToCurrentProcess);

        // 更新流程控制按钮
        updateReviewButton();
    }
}

// 返回当前流程
function returnToCurrentProcess() {
    // 重置回顾状态
    isReviewingHistory = false;
    reviewingProcessIndex = null;

    // 显示当前流程
    if (isShowingTruth) {
        showTruth();
    } else {
        showCurrentProcess();
    }

    // 记录操作日志
    addActionLog(`返回当前流程`);
}

// 更新回顾状态下的按钮
function updateReviewButton() {
    const nextButton = document.getElementById('next-process-btn');

    if (isReviewingHistory) {
        nextButton.disabled = true;
        nextButton.textContent = '回顾中...';
    } else {
        updateNextButton();
    }
}

// 显示剧情流程
async function showPlotProcess(process) {
    try {
        // 加载剧情文本
        let plotPath = `${scriptId}/${characterId}/plot/${process.name}.txt`;

        // 检查上一个流程是否为choice流程
        if (currentProcessIndex > 0) {
            const previousProcess = processData.data[currentProcessIndex - 1];
            if (previousProcess.type === 'choice' && choiceAnswer) {
                // 使用choice流程中选择的选项对应的文本
                plotPath = `${scriptId}/${characterId}/plot/${process.name}/${choiceAnswer}.txt`;

                // 存储选择结果，用于重新观看
                choiceHistory[previousProcess.name] = choiceAnswer;

                // 重置choiceAnswer，避免影响后续流程
                choiceAnswer = null;
            }
        }

        const response = await fetch(plotPath);
        const plotText = await response.text();

        // 显示剧情内容
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">${plotText}</div>
        `;

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

        // 初始状态下禁用按钮
        const nextButton = document.getElementById('next-process-btn');
        nextButton.disabled = true;
        nextButton.textContent = '未完成';

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

                // 记录操作日志
                const questionText = document.querySelectorAll('.vote-question')[qIndex].textContent;
                const selectedOption = this.textContent;
                addActionLog(`投票选择: ${questionText} -> ${selectedOption}`);

                // 检查是否所有问题都已回答
                checkVoteCompletion();
            });
        });

    } catch (error) {
        console.error('加载投票失败:', error);
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">投票内容加载失败。</div>
        `;

        // 出错时也确保按钮状态正确
        const nextButton = document.getElementById('next-process-btn');
        nextButton.disabled = false;
        nextButton.textContent = getNextButtonText();
    }
}

// 检查投票是否完成
function checkVoteCompletion() {
    const voteDataLength = document.querySelectorAll('.vote-question').length;
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
                    <div class="choice-option" data-goto="${option.go_to_the_scene}" data-index="${option.index}">
                        ${option.index}
                    </div>
                `;
            });

            choiceHTML += '</div>';
        });

        choiceHTML += '</div>';

        document.getElementById('content-container').innerHTML = choiceHTML;

        // 初始状态下禁用按钮
        const nextButton = document.getElementById('next-process-btn');
        nextButton.disabled = true;
        nextButton.textContent = '未完成';

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

                // 记录操作日志
                const choiceTitle = document.querySelector('.choice-title').textContent;
                const selectedOption = this.dataset.index;
                addActionLog(`抉择选择: ${choiceTitle} -> ${selectedOption}`);

                // 更新按钮
                updateNextButton();
            });
        });

    } catch (error) {
        console.error('加载选择失败:', error);
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">选择内容加载失败。</div>
        `;

        // 出错时也确保按钮状态正确
        const nextButton = document.getElementById('next-process-btn');
        nextButton.disabled = false;
        nextButton.textContent = getNextButtonText();
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
                <div class="clue-items-container"></div>
            </div>
        `;

        document.getElementById('content-container').innerHTML = clueHTML;

        // 添加线索物品到场景
        const sceneElement = document.querySelector('.clue-scene');
        const backgroundImg = document.querySelector('.scene-background');
        const clueItemsContainer = document.querySelector('.clue-items-container');

        // 等待图片加载完成
        backgroundImg.onload = function() {
            // 放置线索物品
            placeClueItems(clueItemsContainer, cluesData, sceneElement, backgroundImg);
        };

    } catch (error) {
        console.error('加载线索失败:', error);
        document.getElementById('content-container').innerHTML = `
            <div class="plot-text">线索内容加载失败。</div>
        `;
    }
}

// 放置线索物品
function placeClueItems(container, cluesData, sceneElement, backgroundImg) {
    container.innerHTML = '';

    // 获取场景图片的尺寸
    const sceneWidth = sceneElement.offsetWidth;
    const sceneHeight = sceneElement.offsetHeight;

    // 线索物品尺寸
    const clueItemSize = Math.min(60, sceneWidth * 0.08, sceneHeight * 0.08);

    // 确保线索物品不会超出场景边界
    const maxX = sceneWidth - clueItemSize - 10; // 减去边距
    const maxY = sceneHeight - clueItemSize - 10;

    Object.keys(cluesData).forEach((itemName, index) => {
        // 计算随机位置，确保在场景范围内
        const randomX = Math.max(10, Math.min(maxX, Math.floor(Math.random() * maxX)));
        const randomY = Math.max(10, Math.min(maxY, Math.floor(Math.random() * maxY)));

        // 创建线索物品
        const clueItem = document.createElement('div');
        clueItem.className = 'clue-item-on-scene';
        clueItem.style.width = `${clueItemSize}px`;
        clueItem.style.height = `${clueItemSize}px`;
        clueItem.style.left = `${randomX}px`;
        clueItem.style.top = `${randomY}px`;
        clueItem.dataset.itemName = itemName;
        clueItem.dataset.clues = JSON.stringify(cluesData[itemName]);

        // 设置线索物品图标
        clueItem.style.backgroundImage = `url('${scriptId}/${characterId}/clue/${processData.data[currentProcessIndex].name}/${itemName}/iconic.png')`;
        clueItem.style.backgroundSize = 'cover';

        // 显示剩余线索数
        const remainingClues = cluesData[itemName].length;
        clueItem.innerHTML = `<div class="clue-item-count">${remainingClues}</div>`;

        // 添加点击事件
        clueItem.addEventListener('click', function() {
            showClueDetails(this);
        });

        container.appendChild(clueItem);
    });
}

// 重新定位线索物品
function repositionClueItems() {
    const sceneElement = document.querySelector('.clue-scene');
    const backgroundImg = document.querySelector('.scene-background');
    const clueItemsContainer = document.querySelector('.clue-items-container');

    if (!sceneElement || !clueItemsContainer) return;

    // 获取所有线索物品
    const clueItems = document.querySelectorAll('.clue-item-on-scene');

    // 获取场景图片的尺寸
    const sceneWidth = sceneElement.offsetWidth;
    const sceneHeight = sceneElement.offsetHeight;

    // 线索物品尺寸
    const clueItemSize = Math.min(60, sceneWidth * 0.08, sceneHeight * 0.08);

    // 确保线索物品不会超出场景边界
    const maxX = sceneWidth - clueItemSize - 10; // 减去边距
    const maxY = sceneHeight - clueItemSize - 10;

    clueItems.forEach(item => {
        // 获取当前相对位置
        const currentX = parseInt(item.style.left);
        const currentY = parseInt(item.style.top);

        // 计算新的相对位置（保持相对比例）
        const newX = Math.max(10, Math.min(maxX, (currentX / sceneWidth) * maxX));
        const newY = Math.max(10, Math.min(maxY, (currentY / sceneHeight) * maxY));

        // 更新位置和尺寸
        item.style.width = `${clueItemSize}px`;
        item.style.height = `${clueItemSize}px`;
        item.style.left = `${newX}px`;
        item.style.top = `${newY}px`;
    });
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

        // 尝试加载线索图片，如果失败则使用默认图片
        const clueImage = document.getElementById('clue-modal-image');
        clueImage.src = `${scriptId}/${characterId}/clue/${processData.data[currentProcessIndex].name}/${itemName}/${clueKey}.png`;
        clueImage.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7mnKrlm77niYc8L3RleHQ+PC9zdmc+';
        };

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

        // 如果该物品的所有线索都已收集，禁用该物品
        if (remainingClues === 0) {
            clueItem.style.opacity = '0.5';
            clueItem.style.pointerEvents = 'none';
        }

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

            const clueImage = document.getElementById('clue-modal-image');
            clueImage.src = `${scriptId}/${characterId}/clue/${processData.data[currentProcessIndex].name}/${clue.item}/${clue.clue}.png`;
            clueImage.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7mnKrlm77niYc8L3RleHQ+PC9zdmc+';
            };

            document.getElementById('clue-modal').style.display = 'block';
        });

        cluesList.appendChild(clueItem);
    });

    // 滚动到底部
    cluesList.scrollTop = cluesList.scrollHeight;
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
    isShowingTruth = true;

    // 显示真相内容
    document.getElementById('content-container').innerHTML = `
        <div class="truth-content">${truthContent}</div>
        ${isReviewingHistory ? '<div class="review-controls"><button id="return-to-current-btn" class="return-btn">返回当前流程</button></div>' : ''}
    `;

    // 如果是在回顾状态下显示真相，添加返回按钮事件
    if (isReviewingHistory) {
        document.getElementById('return-to-current-btn').addEventListener('click', returnToCurrentProcess);
    }

    // 更新按钮
    const nextButton = document.getElementById('next-process-btn');
    nextButton.disabled = false;
    nextButton.textContent = '返回首页';

    // 更新流程历史
    updateProcessHistory();

    // 记录操作日志
    addActionLog('查看真相');
}

// 更新下一步按钮
function updateNextButton() {
    const nextButton = document.getElementById('next-process-btn');

    if (isReviewingHistory) {
        nextButton.disabled = true;
        nextButton.textContent = '回顾中...';
        return;
    }

    const currentProcess = processData.data[currentProcessIndex];

    // 根据流程类型设置按钮状态
    switch (currentProcess.type) {
        case 'plot':
            nextButton.disabled = false;
            break;
        case 'vote':
            const voteQuestions = document.querySelectorAll('.vote-question');
            nextButton.disabled = Object.keys(voteAnswers).length < voteQuestions.length;
            break;
        case 'choice':
            nextButton.disabled = !choiceAnswer;
            break;
        case 'clue':
            // 在checkCluesCompletion中处理
            // 初始状态下禁用按钮
            if (!nextButton.disabled) {
                nextButton.disabled = true;
                nextButton.textContent = '未完成';
            }
            break;
    }

    nextButton.textContent = getNextButtonText();
}

// 获取下一步按钮文本
function getNextButtonText() {
    if (isShowingTruth) {
        return '返回首页';
    }

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

    // 如果当前是真相页面，返回首页
    if (isShowingTruth) {
        window.location.href = addUserParamsToUrl('index.html');
        return;
    }

    // 如果当前是最后一个流程，显示真相
    if (currentProcessIndex >= processData.data.length - 1) {
        if (nextButton.textContent === '查看真相') {
            showTruth();
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