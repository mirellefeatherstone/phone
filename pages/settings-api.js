document.addEventListener('DOMContentLoaded', () => {
    // 元素获取
    const elements = {
        provider: document.getElementById('provider'),
        endpoint: document.getElementById('apiEndpoint'),
        key: document.getElementById('apiKey'),
        modelSelect: document.getElementById('modelSelect'),
        stream: document.getElementById('streamToggle'),
        fastReply: document.getElementById('fastReply'),
        tempRange: document.getElementById('tempRange'),
        tempValue: document.getElementById('tempValue'),
        saveBtn: document.getElementById('saveBtn'),
        fetchBtn: document.getElementById('fetchModels')
    };

    // 1. 初始化时加载本地存储的数据
    function loadConfig() {
        const config = JSON.parse(localStorage.getItem('ai_api_config')) || {};
        
        elements.provider.value = config.provider || 'openai';
        elements.endpoint.value = config.endpoint || '';
        elements.key.value = config.key || '';
        elements.stream.checked = config.stream !== false;
        elements.fastReply.checked = config.fastReply || false;
        elements.tempRange.value = config.temp || 1.0;
        elements.tempValue.textContent = config.temp || 1.0;

        if (config.models && config.models.length > 0) {
            updateModelDropdown(config.models, config.selectedModel);
        }
    }

    // 2. 滑块数值联动
    elements.tempRange.addEventListener('input', (e) => {
        elements.tempValue.textContent = e.target.value;
    });

    // 3. 保存配置到 localStorage
    elements.saveBtn.addEventListener('click', () => {
        const config = {
            provider: elements.provider.value,
            endpoint: elements.endpoint.value,
            key: elements.key.value,
            stream: elements.stream.checked,
            fastReply: elements.fastReply.checked,
            temp: elements.tempRange.value,
            selectedModel: elements.modelSelect.value,
            models: Array.from(elements.modelSelect.options).map(opt => opt.value).filter(v => v)
        };

        localStorage.setItem('ai_api_config', JSON.stringify(config));
        alert('设置已保存！');
    });

        // 4. 真正联网拉取模型列表
    elements.fetchBtn.addEventListener('click', async () => {
        // 先获取你输入框里的地址和密钥
        let endpointUrl = elements.endpoint.value.trim();
        const apiKey = elements.key.value.trim();

        // 检查有没有填必填项
        if (!apiKey) {
            alert('请先填写 API 密钥 (Key)！');
            return;
        }
        
        // 如果没填地址，默认使用 OpenAI 的官方地址
        if (!endpointUrl) {
            endpointUrl = 'https://api.openai.com/v1';
        }

        // 改变按钮状态，防止重复点击
        const originalText = elements.fetchBtn.textContent;
        elements.fetchBtn.textContent = '拉取中...';
        elements.fetchBtn.disabled = true;

        try {
            // 拼接正确的拉取模型地址 (确保是以 /models 结尾)
            // 比如 https://api.openai.com/v1 变成 https://api.openai.com/v1/models
            let fetchUrl = endpointUrl;
            if (!fetchUrl.endsWith('/models')) {
                // 去掉末尾可能多余的斜杠，再加上 /models
                fetchUrl = fetchUrl.replace(/\/+$/, '') + '/models';
            }

            // 发送真正的网络请求到你的 API 平台
            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            // 如果请求失败（比如密钥填错了，或者地址不对）
            if (!response.ok) {
                throw new Error(`请求失败 (状态码: ${response.status})`);
            }

            // 解析返回的数据
            const data = await response.json();
            
            // OpenAI 兼容格式的数据通常放在 data.data 数组里
            if (data && data.data && Array.isArray(data.data)) {
                // 提取所有模型的 id（名字），并按字母排序
                const models = data.data.map(model => model.id).sort();
                
                // 更新下拉菜单
                updateModelDropdown(models);
                
                // 自动选中第一个模型并保存到 localStorage，防止下拉框为空
                elements.modelSelect.value = models[0];
                alert(`成功拉取到 ${models.length} 个模型！请记得点击底部"保存配置"`);
            } else {
                throw new Error('API 返回的数据格式不支持');
            }

        } catch (error) {
            console.error('拉取模型错误:', error);
            alert('拉取失败，请检查以下几点：\n1. API 地址是否正确\n2. 密钥是否有效\n3. 你的网络是否允许跨域访问该接口\n\n详细报错: ' + error.message);
        } finally {
            // 恢复按钮状态
            elements.fetchBtn.textContent = originalText;
            elements.fetchBtn.disabled = false;
        }
    });

    // 更新下拉列表的辅助函数
    function updateModelDropdown(models, selected) {
        elements.modelSelect.innerHTML = ''; // 清空之前的列表
        
        if (models.length === 0) {
            elements.modelSelect.innerHTML = '<option value="">暂无可用模型</option>';
            return;
        }

        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            if (m === selected) opt.selected = true;
            elements.modelSelect.appendChild(opt);
        });
    }

    // 页面加载时执行一次数据读取
    loadConfig();
});
