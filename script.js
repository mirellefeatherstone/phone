// 1. 实时时钟逻辑 (保留原来的)
function runClock() {
    const now = new Date();
    const s = now.getSeconds();
    const m = now.getMinutes();
    const h = now.getHours();

    const sDeg = (s / 60) * 360;
    const mDeg = (m / 60) * 360 + (s / 60) * 6;
    const hDeg = (h / 12) * 360 + (m / 60) * 30;

    const secHand = document.getElementById('secHand');
    const minHand = document.getElementById('minHand');
    const hourHand = document.getElementById('hourHand');

    if (secHand) secHand.style.transform = `translateX(-50%) rotate(${sDeg}deg)`;
    if (minHand) minHand.style.transform = `translateX(-50%) rotate(${mDeg}deg)`;
    if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${hDeg}deg)`;
}

setInterval(runClock, 1000);
runClock();

// 2. 更换头像 (保留原来的)
function changeAvatar(event) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('avatarImg').src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// 3. 编辑环绕文字 (保留原来的)
const ringTextElement = document.querySelector('.ring-text');
if (ringTextElement) {
    ringTextElement.addEventListener('click', function() {
        const nextText = prompt("编辑环绕文字:", this.textContent.trim());
        if (nextText) {
            this.textContent = nextText.toUpperCase() + " • ";
        }
    });
}

// ----------------------------------------------------
// 4. 新增：每次回到主屏幕时，读取美化设置并应用
// ----------------------------------------------------
function applyCustomizations() {
    // 读取并替换所有 APP 的图标和名字
    const appIds = ['app1', 'app2', 'app3', 'app4', 'dock1', 'dock2', 'dock3', 'dock4'];
    
    appIds.forEach(id => {
        const appElement = document.getElementById(id);
        if (!appElement) return;

        const customIcon = localStorage.getItem(`customize_icon_${id}`);
        const customName = localStorage.getItem(`customize_name_${id}`);

        // 替换图标
        if (customIcon) {
            const img = appElement.querySelector('.app-icon img');
            if (img) img.src = customIcon;
        }

        // 替换名称
        if (customName) {
            const label = appElement.querySelector('.app-label');
            if (label) label.textContent = customName;
        }
    });

    // 读取并注入自定义 CSS 代码 和 字体大小
    const customCss = localStorage.getItem('customize_global_css') || '';
    const fontSize = localStorage.getItem('customize_font_size');
    
    let injectedCSS = customCss;
    
    if (fontSize) {
        const sizeNum = parseInt(fontSize);
        injectedCSS += `
            /* 动态覆盖字体大小 */
            .app-label { font-size: ${Math.max(9, sizeNum - 3)}px !important; }
            .info-group h1 { font-size: ${sizeNum + 6}px !important; }
            .info-group p { font-size: ${Math.max(10, sizeNum - 2)}px !important; }
        `;
    }

    if (injectedCSS) {
        let styleTag = document.getElementById('custom-theme-css');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'custom-theme-css';
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = injectedCSS;
    }
}

// 页面加载完毕后，自动执行美化函数
document.addEventListener('DOMContentLoaded', applyCustomizations);
