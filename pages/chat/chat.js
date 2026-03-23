// --- 数据初始化 ---
const defaultProfile = {
    name: 'vivre_',
    avatar: 'https://via.placeholder.com/150',
    bio: 'a love like war',
    posts: 0,
    followers: 14,
    following: 14
};

const defaultHighlights = [
    { id: 'h1', title: '#*❤', cover: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=100&auto=format&fit=crop' },
    { id: 'h2', title: 'sea', cover: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=100&auto=format&fit=crop' }
];

const mockCharacters = [
    { id: 'c1', name: 'VIVRE ⭐️', avatar: 'https://via.placeholder.com/100', signature: 'Digital Persona', lastMessage: 'See you tomorrow!', lastTime: '22:21', pinned: true },
    { id: 'c2', name: 'Alice', avatar: 'https://via.placeholder.com/100/ffbbcc', signature: 'Living in the moment', lastMessage: 'Got it, thanks.', lastTime: 'Yesterday', pinned: false }
];

document.addEventListener('DOMContentLoaded', () => {
    initData();
    renderChats();
    renderFriends();
    renderProfile();
});

function initData() {
    if (!localStorage.getItem('chat_profile')) localStorage.setItem('chat_profile', JSON.stringify(defaultProfile));
    if (!localStorage.getItem('chat_highlights')) localStorage.setItem('chat_highlights', JSON.stringify(defaultHighlights));
    if (!localStorage.getItem('chat_characters')) localStorage.setItem('chat_characters', JSON.stringify(mockCharacters));
}

// --- 底部 Tab 切换 ---
function switchTab(viewId, element) {
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    element.classList.add('active');
}

// --- 渲染页面 ---
function renderChats() {
    const container = document.getElementById('chatListContainer');
    const chars = JSON.parse(localStorage.getItem('chat_characters'));
    
    container.innerHTML = chars.map(c => `
        <div class="chat-row" onclick="openChatRoom('${c.id}')">
            <img src="${c.avatar}" class="chat-avatar">
            <div class="chat-info">
                <div class="chat-text">
                    <span class="chat-name">${c.name}</span>
                    <span class="chat-msg">${c.lastMessage}</span>
                </div>
                <div class="chat-meta">
                    <span class="chat-time">${c.lastTime}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderFriends() {
    const profile = JSON.parse(localStorage.getItem('chat_profile'));
    document.getElementById('myMiniAvatar').src = profile.avatar;
    document.getElementById('myMiniName').textContent = profile.name;

    const container = document.getElementById('friendListContainer');
    const chars = JSON.parse(localStorage.getItem('chat_characters'));
    document.getElementById('friendCount').textContent = chars.length;

    container.innerHTML = chars.map(c => `
        <div class="chat-row" onclick="openChatRoom('${c.id}')">
            <img src="${c.avatar}" class="chat-avatar">
            <div class="chat-info">
                <div class="chat-text">
                    <span class="chat-name">${c.name}</span>
                    <span class="chat-msg">${c.signature}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProfile() {
    const p = JSON.parse(localStorage.getItem('chat_profile'));
    
    // 注意：这里的 ID 改成了 igUsernameSide，因为名字移到了头像右边
    document.getElementById('igUsernameSide').textContent = p.name;
    document.getElementById('igAvatar').src = p.avatar;
    document.getElementById('igPosts').textContent = p.posts;
    document.getElementById('igFollowers').textContent = p.followers;
    document.getElementById('igFollowing').textContent = p.following;
    document.getElementById('igBioText').textContent = p.bio;

    const highlights = JSON.parse(localStorage.getItem('chat_highlights'));
    const container = document.getElementById('igHighlightsContainer');
    
    let html = `
        <div class="highlight-item" onclick="addNewHighlight()">
            <div class="highlight-cover new-btn">+</div>
            <span class="highlight-title">New</span>
        </div>
    `;
    
    html += highlights.map(h => `
        <div class="highlight-item">
            <img src="${h.cover}" class="highlight-cover">
            <span class="highlight-title">${h.title}</span>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// --- Instagram 编辑逻辑 ---
function openEditProfile() {
    const p = JSON.parse(localStorage.getItem('chat_profile'));
    document.getElementById('editAvatarPreview').src = p.avatar;
    document.getElementById('editName').value = p.name;
    document.getElementById('editBio').value = p.bio;
    document.getElementById('editPosts').value = p.posts;
    document.getElementById('editFollowers').value = p.followers;
    document.getElementById('editFollowing').value = p.following;
    document.getElementById('editProfilePanel').classList.add('active');
}

function closeEditProfile() {
    document.getElementById('editProfilePanel').classList.remove('active');
}

let tempAvatar = null;
function previewAvatar(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        tempAvatar = evt.target.result;
        document.getElementById('editAvatarPreview').src = tempAvatar;
    };
    reader.readAsDataURL(file);
}

function saveProfile() {
    const p = JSON.parse(localStorage.getItem('chat_profile'));
    if(tempAvatar) p.avatar = tempAvatar;
    p.name = document.getElementById('editName').value;
    p.bio = document.getElementById('editBio').value;
    p.posts = document.getElementById('editPosts').value;
    p.followers = document.getElementById('editFollowers').value;
    p.following = document.getElementById('editFollowing').value;
    
    localStorage.setItem('chat_profile', JSON.stringify(p));
    renderProfile();
    renderFriends();
    closeEditProfile();
}

function addNewHighlight() {
    const title = prompt("请输入精选标题：", "New Story");
    if(title) {
        const highlights = JSON.parse(localStorage.getItem('chat_highlights'));
        highlights.push({
            id: 'h' + Date.now(),
            title: title,
            cover: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
        });
        localStorage.setItem('chat_highlights', JSON.stringify(highlights));
        renderProfile();
    }
}

function openChatRoom(characterId) {
    localStorage.setItem('current_chat_target', characterId);
    window.location.href = 'chat-room.html';
}
