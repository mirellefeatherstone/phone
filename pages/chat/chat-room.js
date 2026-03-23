let currentTargetId = '';
let chatHistory = []; 
let isGenerating = false; 

document.addEventListener('DOMContentLoaded', () => {
    loadChatTarget();
    loadChatHistory();
    setupInputActions();
});

// 1. 加载当前聊天对象的基础信息 (顶部栏)
function loadChatTarget() {
    currentTargetId = localStorage.getItem('current_chat_target') || 'default_role';
    const chars = JSON.parse(localStorage.getItem('chat_characters')) || [];
    const target = chars.find(c => c.id === currentTargetId);
    if (target) {
        document.getElementById('chatName').textContent = target.name.replace(' ⭐️', ''); 
        document.getElementById('chatAvatar').src = target.avatar;
    }
}

// 2. 初始化加载历史聊天记录
function loadChatHistory() {
    const messageArea = document.getElementById('messageArea');
    const historyKey = `vivre_chat_history_${currentTargetId}`;
    
    chatHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

    messageArea.innerHTML = ''; // 清空屏幕
    chatHistory.forEach(msg => {
        messageArea.appendChild(createMessageElement({ type: msg.role === 'user' ? 'user' : 'ai', text: msg.content }));
    });
    
    scrollToBottom();
}

// 3. 保存单条消息到本地
function saveMessageToHistory(role, content) {
    const historyKey = `vivre_chat_history_${currentTargetId}`;
    const timestamp = new Date().toISOString();
    
    chatHistory.push({ role, content, timestamp });
    localStorage.setItem(historyKey, JSON.stringify(chatHistory));

    // 同步更新外部列表的"最后一条消息"预览
    const chars = JSON.parse(localStorage.getItem('chat_characters')) || [];
    const targetIndex = chars.findIndex(c => c.id === currentTargetId);
    if (targetIndex > -1) {
        chars[targetIndex].lastMessage = content;
        localStorage.setItem('chat_characters', JSON.stringify(chars));
    }
}

// 4. 输入框及按钮交互
function setupInputActions() {
    const input = document.getElementById('msgInput');
    const actionBtn = document.getElementById('actionBtn');

    // 监听输入，切换状态
    input.addEventListener('input', () => {
        if (isGenerating) return;
        actionBtn.textContent = input.value.trim().length > 0 ? '⬆️' : '✨';
    });

    // 点击按钮
    actionBtn.addEventListener('click', () => {
        if (isGenerating) return;
        const text = input.value.trim();
        if (text.length > 0) {
            handleUserSend(text); // 发送用户消息并触发 AI
        } else {
            triggerAIResponse(); // 空文本直接召唤 AI
        }
    });

    // 键盘监听：Enter 发送，Shift+Enter 换行
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 阻止默认换行
            if (isGenerating) return;
            const text = input.value.trim();
            if (text.length > 0) handleUserSend(text);
        }
    });
}

// 5. 发送用户消息
async function handleUserSend(text) {
    const messageArea = document.getElementById('messageArea');
    const input = document.getElementById('msgInput');
    const actionBtn = document.getElementById('actionBtn');

    // 清空输入并上锁
    input.value = '';
    actionBtn.textContent = '⏳'; // loading 状态
    
    // 渲染并保存用户消息
    messageArea.appendChild(createMessageElement({ type: 'user', text: text }));
    saveMessageToHistory('user', text);
    scrollToBottom();

    // 立即触发 AI 回复
    await triggerAIResponse();
}

// 6. 核心：调用 API 并处理回复
async function triggerAIResponse() {
    if (isGenerating) return;
    isGenerating = true;

    const messageArea = document.getElementById('messageArea');
    const actionBtn = document.getElementById('actionBtn');
    actionBtn.textContent = '⏳'; // 禁用状态显示

    // 读取 API 设置
    const apiConfig = JSON.parse(localStorage.getItem('vivre_api_settings'));
    if (!apiConfig || !apiConfig.apiKey || !apiConfig.apiUrl) {
        showSystemError("请先在设置中配置 API 地址和密钥 (vivre_api_settings)。");
        unlockInput();
        return;
    }

    // 读取角色设定
    const roleConfig = JSON.parse(localStorage.getItem('vivre_chat_settings')) || {};
    const charName = roleConfig.characterName || 'AI';
    const charPersona = roleConfig.characterPersona || '你是一个有灵魂的数字伴侣。';
    const userName = roleConfig.userName || '用户';
    const userPersona = roleConfig.userPersona || '';

    // 构建 System Prompt
    const systemPrompt = `你是${charName}。${charPersona}\n\n用户信息：${userName}。${userPersona}`;

    // 构建上下文 Messages
    const messagesPayload = [{ role: 'system', content: systemPrompt }];
    // 取最后 20 条防止 Token 爆炸
    const recentHistory = chatHistory.slice(-20);
    recentHistory.forEach(m => {
        messagesPayload.push({ role: m.role, content: m.content });
    });

    // 生成 AI 等待气泡
    let aiBubble = createMessageElement({ type: 'ai', text: '...' });
    messageArea.appendChild(aiBubble);
    let contentNode = aiBubble.querySelector('.msg-content');
    scrollToBottom();

    try {
        const response = await fetch(apiConfig.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: apiConfig.model || 'gpt-3.5-turbo',
                messages: messagesPayload,
                temperature: parseFloat(apiConfig.temperature ?? 0.7),
                stream: apiConfig.stream ?? true
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `API 请求失败 (Status: ${response.status})`);
        }

        contentNode.textContent = ""; // 清空 "..."

        if (apiConfig.stream) {
            // --- 流式输出解析 (Stream: true) ---
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullReply = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const parsed = JSON.parse(line.substring(6));
                            const delta = parsed.choices[0].delta.content || "";
                            fullReply += delta;
                            contentNode.textContent = fullReply;
                            scrollToBottom();
                        } catch (e) { /* 忽略解析错误 */ }
                    }
                }
            }
            saveMessageToHistory('assistant', fullReply);

        } else {
            // --- 非流式输出解析 (Stream: false) ---
            const data = await response.json();
            const reply = data.choices[0].message.content || "";
            contentNode.textContent = reply;
            saveMessageToHistory('assistant', reply);
            scrollToBottom();
        }

    } catch (error) {
        console.error(error);
        aiBubble.remove(); // 移除 "..." 气泡
        showSystemError(`出错了: ${error.message}`);
    }

    unlockInput();
}

// 解锁输入区
function unlockInput() {
    isGenerating = false;
    const input = document.getElementById('msgInput');
    const actionBtn = document.getElementById('actionBtn');
    actionBtn.textContent = input.value.trim().length > 0 ? '⬆️' : '✨';
}

// 显示红色系统错误气泡
function showSystemError(errorMsg) {
    const messageArea = document.getElementById('messageArea');
    const errDiv = createMessageElement({ type: 'error', text: errorMsg });
    messageArea.appendChild(errDiv);
    scrollToBottom();
}

// 极简版气泡创建工具
function createMessageElement(data) {
    const div = document.createElement('div');
    // 如果是 error，添加额外 class
    div.className = `msg-row ${data.type === 'error' ? 'error' : data.type}`;
    div.innerHTML = `
        <div class="bubble">
            <div class="msg-content">${data.text}</div>
        </div>
    `;
    return div;
}

function scrollToBottom() {
    const messageArea = document.getElementById('messageArea');
    messageArea.scrollTop = messageArea.scrollHeight;
}


