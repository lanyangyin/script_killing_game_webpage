// 全局变量
let allScripts = [];
let filteredScripts = [];
let allTags = [];

// 在 home.js 开头添加验证
document.addEventListener('DOMContentLoaded', async function() {
    // 验证用户
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

    // 验证通过，继续原有逻辑
    loadScriptsData();

    // 设置事件监听器
    document.getElementById('search-btn').addEventListener('click', filterScripts);
    document.getElementById('search-input').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterScripts();
        }
    });

    document.getElementById('tag-filter').addEventListener('change', filterScripts);
    document.getElementById('difficulty-filter').addEventListener('change', filterScripts);
    document.getElementById('sort-by').addEventListener('change', filterScripts);
});

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载剧本数据
    loadScriptsData();

    // 设置事件监听器
    document.getElementById('search-btn').addEventListener('click', filterScripts);
    document.getElementById('search-input').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterScripts();
        }
    });

    document.getElementById('tag-filter').addEventListener('change', filterScripts);
    document.getElementById('difficulty-filter').addEventListener('change', filterScripts);
    document.getElementById('sort-by').addEventListener('change', filterScripts);
});

// 加载剧本数据
async function loadScriptsData() {
    try {
        const response = await fetch('directory.json');
        const data = await response.json();

        allScripts = data.data;
        allTags = data.tags;

        // 填充标签筛选器
        populateTagFilter();

        // 初始显示所有剧本
        filteredScripts = [...allScripts];
        displayScripts();
    } catch (error) {
        console.error('加载剧本数据失败:', error);
        document.getElementById('scripts-container').innerHTML =
            '<p class="error-message">加载剧本数据失败，请稍后重试。</p>';
    }
}

// 填充标签筛选器
function populateTagFilter() {
    const tagFilter = document.getElementById('tag-filter');

    allTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
}

// 筛选剧本
function filterScripts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const selectedTag = document.getElementById('tag-filter').value;
    const selectedDifficulty = document.getElementById('difficulty-filter').value;
    const sortBy = document.getElementById('sort-by').value;

    // 应用筛选条件
    filteredScripts = allScripts.filter(script => {
        // 搜索条件
        const matchesSearch = script.name.toLowerCase().includes(searchTerm) ||
                             script.introduction.toLowerCase().includes(searchTerm);

        // 标签条件
        let matchesTag = true;
        if (selectedTag !== 'all') {
            matchesTag = script.tag.includes(selectedTag) || script.tag.includes('-');
        }

        // 难度条件
        let matchesDifficulty = true;
        if (selectedDifficulty !== 'all') {
            matchesDifficulty = script.difficulty == selectedDifficulty;
        }

        return matchesSearch && matchesTag && matchesDifficulty;
    });

    // 应用排序
    sortScripts(sortBy);

    // 显示筛选后的剧本
    displayScripts();
}

// 剧本排序
function sortScripts(sortBy) {
    switch(sortBy) {
        case 'location':
            filteredScripts.sort((a, b) => b.location - a.location);
            break;
        case 'name':
            filteredScripts.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
            break;
        case 'difficulty':
            filteredScripts.sort((a, b) => b.difficulty - a.difficulty);
            break;
        default:
            filteredScripts.sort((a, b) => b.location - a.location);
    }
}

// 显示剧本
function displayScripts() {
    const container = document.getElementById('scripts-container');

    if (filteredScripts.length === 0) {
        container.innerHTML = '<p class="no-results">没有找到匹配的剧本，请尝试其他筛选条件。</p>';
        return;
    }

    container.innerHTML = filteredScripts.map(script => createScriptCard(script)).join('');
}

// 创建剧本卡片
// 在 createScriptCard 函数中，为卡片添加点击事件
function createScriptCard(script) {
    // 生成难度星级
    const difficultyStars = '★'.repeat(script.difficulty) + '☆'.repeat(5 - script.difficulty);

    // 处理标签
    const tags = script.tag.includes('-') ? allTags : script.tag;

    return `
        <div class="script-card" data-id="${script.id}">
            <div class="script-cover" style="background-image: url('${script.id}/cover.webp')"></div>
            <div class="script-content">
                <div class="script-header">
                    <div>
                        <h3 class="script-name">${script.name}</h3>
                    </div>
                </div>

                <div class="script-meta">
                    <div class="meta-item">
                        <span>${script.number_of_people}人</span>
                    </div>
                    <div class="meta-item">
                        <span>${script.time_required_for_game}小时</span>
                    </div>
                    <div class="meta-item">
                        <span>难度:</span>
                        <span class="difficulty-stars">${difficultyStars}</span>
                    </div>
                </div>

                <div class="script-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>

                <div class="script-description">
                    ${script.introduction || '暂无剧本介绍'}
                </div>

                ${script.hint ? `<div class="script-hint">提示: ${script.hint}</div>` : ''}
            </div>
        </div>
    `;
}

// 在 displayScripts 函数后添加事件监听
// 修改 displayScripts 函数中的跳转逻辑
function displayScripts() {
    const container = document.getElementById('scripts-container');

    if (filteredScripts.length === 0) {
        container.innerHTML = '<p class="no-results">没有找到匹配的剧本，请尝试其他筛选条件。</p>';
        return;
    }

    container.innerHTML = filteredScripts.map(script => createScriptCard(script)).join('');

    // 添加点击事件
    const cards = document.querySelectorAll('.script-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const scriptId = this.getAttribute('data-id');
            const url = addUserParamsToUrl(`prepare.html?id=${scriptId}`);
            window.location.href = url;
        });
    });
}