let currentTargetId = '';

document.addEventListener('DOMContentLoaded', () => {
    loadSettingsData();
});

// 1. Tab 切换逻辑
function switchTab(tabId, btnElement) {
    // 移除所有激活状态
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // 激活被点击的
    btnElement.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// 2. 页面加载时，读取本地数据
function loadSettingsData() {
    // 拿当前聊天的角色 ID
    currentTargetId = localStorage.getItem('current_chat_target');
    
    // A. 顶部头像和名字
    const chars = JSON.parse(localStorage.getItem('chat_characters')) || [];
    const target = chars.find(c => c.id === currentTargetId);
    if (target) {
        document.getElementById('settingAvatar').src = target.avatar;
        document.getElementById('settingName').textContent = target.name.replace(' ⭐️', '');
    }

    // B. 读取"我的"信息 (从个人主页的 profile 里拿)
    const myProfile = JSON.parse(localStorage.getItem('chat_profile')) || {};
    document.getElementById('myAvatar').src = myProfile.avatar || 'https://via.placeholder.com/50';
    document.getElementById('myName').value = myProfile.name || '';

    // C. 读取这个角色专属的高级设定 (新建一个表来存)
    const advancedSettings = JSON.parse(localStorage.getItem(`persona_settings_${currentTargetId}`)) || {};
    
    document.getElementById('roleRealName').value = advancedSettings.realName || '';
    document.getElementById('roleAlias').value = advancedSettings.alias || '';
    document.getElementById('rolePersona').value = advancedSettings.rolePersona || '';
    document.getElementById('myPersona').value = advancedSettings.myPersona || '';
}

// 3. 点击底部的“保存所有更改”
// 3. 点击底部的“保存所有更改”
function saveAllSettings() {
    // A. 收集输入框里的值
    const newRealName = document.getElementById('roleRealName').value.trim();
    const newAlias = document.getElementById('roleAlias').value.trim();
    const newRolePersona = document.getElementById('rolePersona').value.trim();
    
    const newMyName = document.getElementById('myName').value.trim();
    const newMyPersona = document.getElementById('myPersona').value.trim();

    // B. 保存角色专属高级设定
    const advancedSettings = {
        realName: newRealName,
        alias: newAlias,
        rolePersona: newRolePersona,
        myPersona: newMyPersona
    };
    localStorage.setItem(`persona_settings_${currentTargetId}`, JSON.stringify(advancedSettings));

    // C. 同步更新角色列表数据 (名字和角色头像)
    const chars = JSON.parse(localStorage.getItem('chat_characters')) || [];
    const targetIndex = chars.findIndex(c => c.id === currentTargetId);
    
    if (targetIndex > -1) {
        // 如果改了名字/备注，存进去
        if (newAlias || newRealName) {
            chars[targetIndex].name = newAlias || newRealName;
        }
        // 如果换了角色头像，存进去
        if (tempRoleAvatar) {
            chars[targetIndex].avatar = tempRoleAvatar;
        }
        localStorage.setItem('chat_characters', JSON.stringify(chars));
    }

    // D. 同步更新"我的"数据到个人主页 (名字和我的头像)
    const myProfile = JSON.parse(localStorage.getItem('chat_profile')) || {};
    if (newMyName) {
        myProfile.name = newMyName;
    }
    if (tempMyAvatar) {
        myProfile.avatar = tempMyAvatar;
    }
    localStorage.setItem('chat_profile', JSON.stringify(myProfile));

    // 视觉反馈：变成成功绿
    const saveBtn = document.querySelector('.save-all-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '保存成功 ✓';
    saveBtn.style.background = '#34c759'; 
    saveBtn.style.color = '#fff';

    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = 'var(--light-blue)';
        saveBtn.style.color = 'var(--blue)';
    }, 1500);
}
// --- 新增：头像上传与更换逻辑 ---

// 用于临时存储还没按"保存"的头像数据
let tempRoleAvatar = null;
let tempMyAvatar = null;

// 处理图片上传
function uploadAvatar(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    // 文件大小限制提示 (Base64 存太多会导致 localStorage 爆掉)
    if (file.size > 2 * 1024 * 1024) {
        alert("图片较大，建议上传 2MB 以内的头像。");
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;

        if (type === 'role') {
            // 更换上方角色大头像的预览
            document.getElementById('settingAvatar').src = base64Image;
            tempRoleAvatar = base64Image; // 暂存
        } else if (type === 'my') {
            // 更换下方我的小头像的预览
            document.getElementById('myAvatar').src = base64Image;
            tempMyAvatar = base64Image; // 暂存
        }
    };
    reader.readAsDataURL(file);
}
// --- 新增：美化面板交互逻辑 ---

// 监听头像圆角滑块的拖动
document.addEventListener('DOMContentLoaded', () => {
    const radiusSlider = document.getElementById('avatarRadius');
    const radiusVal = document.getElementById('avatarRadiusVal');
    
    if (radiusSlider && radiusVal) {
        radiusSlider.addEventListener('input', (e) => {
            radiusVal.textContent = e.target.value + '%';
        });
    }
});
// --- 拓展 Tab：头像识别系统 折叠面板控制 ---

function toggleExtAccordion(headerElement) {
    const content = headerElement.nextElementSibling;
    const isActive = headerElement.classList.contains('active');
    
    if (!isActive) {
        // 展开：标记激活状态，把最大高度设为内容真实高度
        headerElement.classList.add('active');
        content.style.maxHeight = content.scrollHeight + "px";
    } else {
        // 收起：取消激活，把高度清零
        headerElement.classList.remove('active');
        content.style.maxHeight = null;
    }
}
