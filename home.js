// 全局变量
let allScripts = [];
let filteredScripts = [];
let allTags = [];

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadScriptsData();

    // 事件监听
    document.getElementById('search-btn').addEventListener('click', applyFilters);
    document.getElementById('search-input').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            applyFilters();
        }
    });

    document.getElementById('tag-filter').addEventListener('change', applyFilters);
    document.getElementById('sort-by').addEventListener('change', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
});

// 加载剧本数据
async function loadScriptsData() {
    try {
        const response = await fetch('/directory.json');
        const data = await response.json();

        allScripts = data.data;
        allTags = data.tags;

        // 初始化标签筛选器
        populateTagFilter();

        // 显示所有剧本
        filteredScripts = [...allScripts];
        displayScripts();
    } catch (error) {
        console.error('加载剧本数据失败:', error);
        document.getElementById('scripts-grid').innerHTML =
            '<div class="no-results"><p>加载剧本数据失败，请稍后重试</p></div>';
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

// 应用筛选条件
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const selectedTag = document.getElementById('tag-filter').value;
    const sortBy = document.getElementById('sort-by').value;

    // 筛选剧本
    filteredScripts = allScripts.filter(script => {
        // 搜索条件
        const matchesSearch = script.name.toLowerCase().includes(searchTerm) ||
                             script.introduction.toLowerCase().includes(searchTerm);

        // 标签条件
        let matchesTag = true;
        if (selectedTag !== 'all') {
            // 如果剧本标签为["-"]，则包含所有标签
            if (script.tag[0] === '-') {
                matchesTag = true;
            } else {
                matchesTag = script.tag.includes(selectedTag);
            }
        }

        return matchesSearch && matchesTag;
    });

    // 排序剧本
    sortScripts(sortBy);

    // 显示结果
    displayScripts();
}

// 排序剧本
function sortScripts(sortBy) {
    switch(sortBy) {
        case 'location':
            filteredScripts.sort((a, b) => b.location - a.location);
            break;
        case 'difficulty':
            filteredScripts.sort((a, b) => a.difficulty - b.difficulty);
            break;
        case 'difficulty-desc':
            filteredScripts.sort((a, b) => b.difficulty - a.difficulty);
            break;
        case 'time':
            filteredScripts.sort((a, b) => a.time_required_for_game - b.time_required_for_game);
            break;
        default:
            filteredScripts.sort((a, b) => b.location - a.location);
    }
}

// 显示剧本
function displayScripts() {
    const scriptsGrid = document.getElementById('scripts-grid');
    const noResults = document.getElementById('no-results');

    if (filteredScripts.length === 0) {
        scriptsGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    scriptsGrid.innerHTML = filteredScripts.map(script => {
        // 处理难度显示（星级）
        const difficultyStars = Array(5).fill(0).map((_, index) => {
            return index < script.difficulty ?
                '<span class="star">★</span>' :
                '<span class="star empty">★</span>';
        }).join('');

        // 处理标签显示
        const tags = script.tag[0] === '-' ?
            allTags.map(tag => `<span class="tag">${tag}</span>`).join('') :
            script.tag.map(tag => `<span class="tag">${tag}</span>`).join('');

        // 处理封面图片
        const coverUrl = `${script.id}/cover.webp`;

        return `
            <div class="script-card">
                <div class="script-cover">
                    ${script.id >= 0 ?
                        `<img src="${coverUrl}" alt="${script.name}封面" onerror="this.style.display='none'; this.parentNode.innerHTML='封面图片加载失败';">` :
                        '暂无封面'
                    }
                </div>
                <div class="script-content">
                    <h3 class="script-title">${script.name}</h3>
                    <div class="script-meta">
                        <div class="difficulty">
                            难度: ${difficultyStars}
                        </div>
                        <div class="time">${script.time_required_for_game}小时</div>
                    </div>
                    <div class="script-tags">
                        ${tags}
                    </div>
                    ${script.introduction ? `<p class="script-intro">${script.introduction}</p>` : ''}
                    ${script.hint ? `<div class="script-hint">参前提示: ${script.hint}</div>` : ''}
                    <div class="script-footer">
                        <div class="players">${script.number_of_people}人本</div>
                        <div class="last-played">${script.last_time_played ? `上次游玩: ${script.last_time_played}天前` : '尚未游玩'}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 重置筛选条件
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('tag-filter').value = 'all';
    document.getElementById('sort-by').value = 'location';

    filteredScripts = [...allScripts];
    sortScripts('location');
    displayScripts();
}