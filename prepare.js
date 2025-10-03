// 全局变量
let scriptData = null;
let characterData = null;

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get('id');

    if (!scriptId) {
        displayError('未指定剧本ID');
        return;
    }

    // 加载剧本数据
    loadScriptData(scriptId);
});

// 加载剧本数据
async function loadScriptData(scriptId) {
    try {
        // 显示加载状态
        document.getElementById('script-info').innerHTML = '<div class="loading">加载剧本信息中...</div>';
        document.getElementById('characters-container').innerHTML = '<div class="loading">加载角色信息中...</div>';

        // 加载剧本列表数据
        const scriptsResponse = await fetch('directory.json');
        const scriptsData = await scriptsResponse.json();

        // 查找对应ID的剧本
        scriptData = scriptsData.data.find(script => script.id == scriptId);

        if (!scriptData) {
            displayError('未找到对应的剧本信息');
            return;
        }

        // 更新页面标题
        document.getElementById('script-title').textContent = scriptData.name;

        // 显示剧本信息
        displayScriptInfo();

        // 加载角色信息
        await loadCharacterData(scriptId);

    } catch (error) {
        console.error('加载剧本数据失败:', error);
        displayError('加载剧本数据失败，请稍后重试。');
    }
}

// 显示剧本信息
function displayScriptInfo() {
    // 生成难度星级
    const difficultyStars = '★'.repeat(scriptData.difficulty) + '☆'.repeat(5 - scriptData.difficulty);

    // 处理标签
    const tags = scriptData.tag.includes('-') ? [] : scriptData.tag;

    const scriptInfoHTML = `
        <div class="script-cover-large" style="background-image: url('${scriptData.id}/cover.webp')"></div>
        <div class="script-details">
            <h1 class="script-name">${scriptData.name}</h1>

            <div class="script-meta">
                <div class="meta-item">
                    <span>${scriptData.number_of_people}人剧本</span>
                </div>
                <div class="meta-item">
                    <span>预计时长: ${scriptData.time_required_for_game}小时</span>
                </div>
                <div class="meta-item">
                    <span>难度:</span>
                    <span class="difficulty-stars">${difficultyStars}</span>
                </div>
            </div>

            ${tags.length > 0 ? `
                <div class="script-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}

            ${scriptData.introduction ? `
                <div class="script-description">
                    <h3>剧本背景</h3>
                    <p>${scriptData.introduction}</p>
                </div>
            ` : ''}

            ${scriptData.hint ? `
                <div class="script-hint">
                    <h3>参与提示</h3>
                    <p>${scriptData.hint}</p>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('script-info').innerHTML = scriptInfoHTML;
}

// 加载角色数据
async function loadCharacterData(scriptId) {
    try {
        const response = await fetch(`${scriptId}/character.json`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        characterData = await response.json();

        // 显示角色信息
        displayCharacters();

    } catch (error) {
        console.error('加载角色数据失败:', error);
        document.getElementById('characters-container').innerHTML =
            '<div class="error-message">加载角色信息失败，请稍后重试。</div>';
    }
}

// 显示角色信息
function displayCharacters() {
    if (!characterData || Object.keys(characterData).length === 0) {
        document.getElementById('characters-container').innerHTML =
            '<div class="error-message">暂无角色信息。</div>';
        return;
    }

    const charactersHTML = Object.keys(characterData).map(characterName => {
        const character = characterData[characterName];

        return `
            <div class="character-card">
                <div class="character-header">
                    <h3 class="character-name">${characterName}</h3>
                </div>
                <div class="character-content">
                    <div class="character-intro">
                        ${character.introduction || '暂无角色介绍'}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('characters-container').innerHTML = charactersHTML;
}

// 显示错误信息
function displayError(message) {
    document.getElementById('script-info').innerHTML =
        `<div class="error-message">${message}</div>`;
}