// 全局变量
let scriptData = null;
let characterData = null;
let selectedCharacter = null;

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数中的剧本ID
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get('id');

    if (scriptId) {
        // 加载剧本数据
        loadScriptData(scriptId);
    } else {
        // 如果没有剧本ID，显示错误信息
        document.querySelector('main').innerHTML = `
            <div class="error-container">
                <h2>错误</h2>
                <p>未找到指定的剧本，请返回主页重新选择。</p>
                <a href="index.html" class="back-btn">返回主页</a>
            </div>
        `;
    }
});

// 加载剧本数据
async function loadScriptData(scriptId) {
    try {
        // 加载剧本目录数据
        const response = await fetch('directory.json');
        const directoryData = await response.json();

        // 查找对应的剧本
        scriptData = directoryData.data.find(script => script.id == scriptId);

        if (!scriptData) {
            throw new Error('未找到剧本数据');
        }

        // 更新页面标题和剧本信息
        updateScriptInfo();

        // 加载角色数据
        await loadCharacterData(scriptId);

    } catch (error) {
        console.error('加载剧本数据失败:', error);
        document.querySelector('main').innerHTML = `
            <div class="error-container">
                <h2>加载失败</h2>
                <p>加载剧本数据时出错，请稍后重试。</p>
                <a href="index.html" class="back-btn">返回主页</a>
            </div>
        `;
    }
}

// 更新剧本信息
function updateScriptInfo() {
    // 更新页面标题
    document.title = `${scriptData.name} - 剧本杀收藏馆`;
    document.getElementById('script-name').textContent = scriptData.name;

    // 更新封面
    const coverElement = document.querySelector('.script-cover-large');
    coverElement.style.backgroundImage = `url('${scriptData.id}/cover.webp')`;

    // 更新元数据
    document.getElementById('player-count').textContent = `${scriptData.number_of_people}人`;
    document.getElementById('game-time').textContent = `${scriptData.time_required_for_game}小时`;

    // 更新难度
    const difficultyStars = '★'.repeat(scriptData.difficulty) + '☆'.repeat(5 - scriptData.difficulty);
    document.getElementById('difficulty').textContent = difficultyStars;

    // 更新标签
    const tagsContainer = document.getElementById('script-tags');
    if (scriptData.tag.includes('-')) {
        // 如果标签为["-"]，则显示所有标签
        tagsContainer.innerHTML = '<span class="tag">所有类型</span>';
    } else {
        tagsContainer.innerHTML = scriptData.tag.map(tag => `<span class="tag">${tag}</span>`).join('');
    }

    // 更新剧本介绍
    document.getElementById('script-introduction').textContent =
        scriptData.introduction || '暂无剧本介绍';

    // 更新提示
    document.getElementById('script-hint').textContent =
        scriptData.hint || '暂无提示信息';
}

// 加载角色数据
async function loadCharacterData(scriptId) {
    try {
        const response = await fetch(`${scriptId}/character.json`);
        characterData = await response.json();

        // 显示角色
        displayCharacters();

    } catch (error) {
        console.error('加载角色数据失败:', error);
        document.getElementById('characters-container').innerHTML = `
            <div class="error-message">
                <p>加载角色数据失败，请稍后重试。</p>
            </div>
        `;
    }
}

// 显示角色
function displayCharacters() {
    const container = document.getElementById('characters-container');

    if (!characterData || Object.keys(characterData).length === 0) {
        container.innerHTML = '<p class="no-characters">暂无角色信息</p>';
        return;
    }

    container.innerHTML = Object.entries(characterData).map(([name, data]) =>
        createCharacterCard(name, data)
    ).join('');

    // 添加角色选择事件
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', function() {
            selectCharacter(this);
        });
    });
}

// 创建角色卡片
function createCharacterCard(name, data) {
    return `
        <div class="character-card" data-character-id="${data.id}">
            <div class="character-avatar" style="background-image: url('${scriptData.id}/${data.id}/avatar.png')"></div>
            <div class="character-info">
                <h3 class="character-name">${name}</h3>
                <p class="character-intro">${data.introduction || '暂无角色介绍'}</p>
            </div>
        </div>
    `;
}

// 选择角色
function selectCharacter(card) {
    // 移除之前的选择
    document.querySelectorAll('.character-card').forEach(c => {
        c.classList.remove('selected');
    });

    // 标记当前选择的角色
    card.classList.add('selected');
    selectedCharacter = card.dataset.characterId;

    // 启用开始游戏按钮
    const startBtn = document.getElementById('start-game-btn');
    startBtn.disabled = false;

    // 更新提示
    document.querySelector('.hint').textContent = '已选择角色，可以开始游戏';
}

// 开始游戏按钮事件
document.getElementById('start-game-btn').addEventListener('click', function() {
    if (!selectedCharacter) {
        alert('请先选择一个角色');
        return;
    }

    // 这里可以添加开始游戏的逻辑
    alert(`开始游戏！您选择的角色ID是: ${selectedCharacter}`);

    // 在实际应用中，这里可能会跳转到游戏页面或执行其他操作
    // window.location.href = `game.html?script=${scriptData.id}&character=${selectedCharacter}`;
});