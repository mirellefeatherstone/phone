// 定义我们的系统默认应用
const APPS_CONFIG = [
    { id: 'app1', defaultName: 'Photos', defaultIcon: 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png' },
    { id: 'app2', defaultName: 'Google', defaultIcon: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' },
    { id: 'app3', defaultName: 'YouTube', defaultIcon: 'https://cdn-icons-png.flaticon.com/512/174/174883.png' },
    { id: 'app4', defaultName: 'Maps', defaultIcon: 'https://cdn-icons-png.flaticon.com/512/5968/5968841.png' },
    { id: 'dock1', defaultName: 'Phone', defaultIcon: 'https://cdn-icons-png.flaticon.com/512/174/174848.png' },
    { id: 'dock2', defaultName: 'Messages', defaultIcon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png' },
    { id: 'dock3', defaultName: 'Beautify', defaultIcon: 'https://cdn-icons-png.flaticon.com/512/174/174872.png' },
    { id: 'dock4', defaultName: 'Settings', defaultIcon: 'https://cdn-icons-png.flaticon.com/512/3524/3524659.png' }
];

document.addEventListener('DOMContentLoaded', () => {
    initAppIconList();
    initAppNameList();
    loadOtherSettings();
});

// 手风琴折叠逻辑
function toggleAccordion(headerElement) {
    const content = headerElement.nextElementSibling;
    const isActive = headerElement.classList.contains('active');
    
    // 关闭所有其他面板 (可选，如果你想保持像手风琴一样只能开一个)
    // document.querySelectorAll('.accordion-header').forEach(h => {
    //     h.classList.remove('active');
    //     h.nextElementSibling.style.maxHeight = null;
    // });

    if (!isActive) {
        headerElement.classList.add('active');
        content.style.maxHeight = content.scrollHeight + "px";
    } else {
        headerElement.classList.remove('active');
        content.style.maxHeight = null;
    }
}

// 1. 生成图标自定义列表
function initAppIconList() {
    const container = document.getElementById('iconSettingsList');
    APPS_CONFIG.forEach(app => {
        // 读取存储的自定义图标，如果没有就用默认的
        const customIcon = localStorage.getItem(`customize_icon_${app.id}`) || app.defaultIcon;
        
        const row = document.createElement('div');
        row.className = 'app-edit-row';
        row.innerHTML = `
            <img src="${customIcon}" class="app-thumb" id="thumb_${app.id}">
            <div class="app-info">
                <span class="app-name-static">${app.defaultName}</span>
                <input type="text" id="url_${app.id}" placeholder="图片URL或点击相机上传" value="${customIcon !== app.defaultIcon ? customIcon : ''}">
            </div>
            <button class="text-btn" onclick="document.getElementById('file_${app.id}').click()">📷</button>
            <input type="file" id="file_${app.id}" hidden accept="image/*" onchange="uploadIcon(event, '${app.id}')">
            <button class="text-btn danger" onclick="resetIcon('${app.id}', '${app.defaultIcon}')">重置</button>
            <button class="text-btn" onclick="saveIconUrl('${app.id}')">保存</button>
        `;
        container.appendChild(row);
    });
}

// 2. 生成名称自定义列表
function initAppNameList() {
    const container = document.getElementById('nameSettingsList');
    APPS_CONFIG.forEach(app => {
        const customName = localStorage.getItem(`customize_name_${app.id}`) || app.defaultName;
        
        const row = document.createElement('div');
        row.className = 'app-edit-row';
        row.innerHTML = `
            <div class="app-info" style="flex-direction: row; align-items: center;">
                <span class="app-name-static" style="width: 80px;">${app.defaultName}</span>
                <input type="text" id="nameInput_${app.id}" value="${customName !== app.defaultName ? customName : ''}" placeholder="自定义名称">
            </div>
            <button class="text-btn danger" onclick="resetName('${app.id}', '${app.defaultName}')">重置</button>
            <button class="text-btn" onclick="saveName('${app.id}')">保存</button>
        `;
        container.appendChild(row);
    });
}

// 图标处理函数
function uploadIcon(event, appId) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Url = e.target.result;
        document.getElementById(`thumb_${appId}`).src = base64Url;
        document.getElementById(`url_${appId}`).value = '已选择本地图片'; // 仅作视觉提示
        localStorage.setItem(`customize_icon_${appId}`, base64Url);
        alert('图标已保存！返回主页查看效果。');
    };
    reader.readAsDataURL(file);
}

function saveIconUrl(appId) {
    const url = document.getElementById(`url_${appId}`).value.trim();
    if (url) {
        document.getElementById(`thumb_${appId}`).src = url;
        localStorage.setItem(`customize_icon_${appId}`, url);
        alert('图标已保存！');
    }
}

function resetIcon(appId, defaultUrl) {
    document.getElementById(`thumb_${appId}`).src = defaultUrl;
    document.getElementById(`url_${appId}`).value = '';
    localStorage.removeItem(`customize_icon_${appId}`);
}

// 名称处理函数
function saveName(appId) {
    const newName = document.getElementById(`nameInput_${appId}`).value.trim();
    if (newName) {
        localStorage.setItem(`customize_name_${appId}`, newName);
        alert('名称已保存！');
    }
}

function resetName(appId) {
    document.getElementById(`nameInput_${appId}`).value = '';
    localStorage.removeItem(`customize_name_${appId}`);
}

// --- 以下是全局设置逻辑 ---

function loadOtherSettings() {
    // 1. 新增：加载壁纸预览
    const savedWallpaper = localStorage.getItem('customize_wallpaper');
    if (savedWallpaper) {
        document.getElementById('wallpaperUrlInput').value = savedWallpaper.startsWith('data:image') ? '已选择本地图片' : savedWallpaper;
        document.getElementById('wallpaperPreview').src = savedWallpaper;
        document.getElementById('wallpaperPreview').style.display = 'block';
    }

    // 2. 原有的：字体加载
    const fontSize = localStorage.getItem('customize_font_size') || '14';
    document.getElementById('fontSizeSlider').value = fontSize;
    document.getElementById('fontSizeValue').textContent = fontSize + 'px';
    
    document.getElementById('fontSizeSlider').addEventListener('input', (e) => {
        document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
        localStorage.setItem('customize_font_size', e.target.value);
    });

    // 3. 原有的：CSS加载
    const customCss = localStorage.getItem('customize_global_css') || '';
    document.getElementById('customCssInput').value = customCss;
}

function handleFontUpload(event) {
    const file = event.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
        alert("文件太大，请不要超过 5MB");
        return;
    }
    // 实际项目中由于字体太大，通常转 Base64 存 localStorage 容易爆掉配额(5M)
    // 这里做演示，真机最好传 URL
    alert("已选择字体：" + file.name + "\n注意：本地字体文件过大可能无法存入缓存，建议填 URL！");
}

function applyCustomCSS() {
    const css = document.getElementById('customCssInput').value;
    localStorage.setItem('customize_global_css', css);
    alert('CSS 已保存，返回主页生效！');
}

function clearCustomCSS() {
    document.getElementById('customCssInput').value = '';
    localStorage.removeItem('customize_global_css');
}

function copySnippet(btn) {
    const code = btn.parentElement.nextElementSibling.innerText;
    navigator.clipboard.writeText(code).then(() => {
        const oldText = btn.innerText;
        btn.innerText = '已复制';
        setTimeout(() => btn.innerText = oldText, 2000);
    });
}

// 主题导出导入
function exportTheme() {
    const themeData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('customize_')) {
            themeData[key] = localStorage.getItem(key);
        }
    }
    const blob = new Blob([JSON.stringify(themeData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aiphone_theme.json';
    a.click();
}

function importTheme(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            Object.keys(data).forEach(key => {
                if(key.startsWith('customize_')) {
                    localStorage.setItem(key, data[key]);
                }
            });
            alert('导入成功！请刷新页面或返回主页。');
            location.reload();
        } catch(err) {
            alert('无效的主题文件！');
        }
    };
    reader.readAsText(file);
}

function resetAllCustomize() {
    if(confirm('确定要清除所有美化设置，恢复默认吗？')) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('customize_')) keysToRemove.push(key);
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        alert('已恢复默认配置！');
        location.reload();
    }
}
// --- 新增：壁纸处理逻辑 ---

// 1. 本地上传壁纸
function uploadWallpaper(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 如果图片太大，可能会超出浏览器缓存限制，给个小提示
    if (file.size > 2 * 1024 * 1024) {
        alert("提示：图片较大，如果保存失败请尽量使用图片 URL 链接~");
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Url = e.target.result;
        document.getElementById('wallpaperPreview').src = base64Url;
        document.getElementById('wallpaperPreview').style.display = 'block';
        document.getElementById('wallpaperUrlInput').value = '已选择本地图片';
        
        localStorage.setItem('customize_wallpaper', base64Url);
        alert('壁纸已应用！返回主页查看效果。');
    };
    reader.readAsDataURL(file);
}

// 2. 保存网络图片链接为壁纸
function saveWallpaper() {
    const url = document.getElementById('wallpaperUrlInput').value.trim();
    if (url && url !== '已选择本地图片') {
        document.getElementById('wallpaperPreview').src = url;
        document.getElementById('wallpaperPreview').style.display = 'block';
        localStorage.setItem('customize_wallpaper', url);
        alert('壁纸已保存并应用！');
    }
}

// 3. 恢复默认壁纸
function resetWallpaper() {
    document.getElementById('wallpaperUrlInput').value = '';
    document.getElementById('wallpaperPreview').src = '';
    document.getElementById('wallpaperPreview').style.display = 'none';
    localStorage.removeItem('customize_wallpaper');
    alert('已恢复默认壁纸！');
}

// 4. (非常重要) 在 loadOtherSettings 函数里，加上加载壁纸的代码：
// 请在你的代码里找到 loadOtherSettings() 这个函数，在它的大括号 {} 里面加上这几行：
/*
    const savedWallpaper = localStorage.getItem('customize_wallpaper');
    if (savedWallpaper) {
        document.getElementById('wallpaperUrlInput').value = savedWallpaper.startsWith('data:image') ? '已选择本地图片' : savedWallpaper;
        document.getElementById('wallpaperPreview').src = savedWallpaper;
        document.getElementById('wallpaperPreview').style.display = 'block';
    }
*/
