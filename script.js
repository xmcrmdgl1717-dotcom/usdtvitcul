(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================
     1. 原有交互：滚动导航、鼠标光斑、卡片跳动等
     ========================================= */
  const topbar = document.getElementById("topbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) topbar.classList.add("scrolled");
    else topbar.classList.remove("scrolled");
  });

  const glow = document.getElementById("cursorGlow");
  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let raf = null;
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add("has-pointer");
      if (!raf) raf = requestAnimationFrame(loop);
    });
    function loop() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      glow.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf = requestAnimationFrame(loop);
      else raf = null;
    }
  }

  const revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  const balanceEl = document.getElementById("ccBalance");
  if (balanceEl && !reduceMotion) {
    let base = 8420.5;
    setInterval(() => {
      base += Math.random() * 0.12;
      balanceEl.textContent = base.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }, 3200);
  }

  const earnAmountEl = document.getElementById("earnAmount");
  const earnMonthlyEl = document.getElementById("earnMonthly");
  const sparkFill = document.getElementById("sparkFill");
  const sparkVal = document.getElementById("sparkVal");
  const earnTimeEl = document.getElementById("earnTime");

  if (earnAmountEl && !reduceMotion) {
    let earn = 641.00, monthly = 3842.61, daySeconds = 16 * 3600 + 29 * 60;
    setInterval(() => {
      earn += Math.random() * 0.42 + 0.08;
      monthly += Math.random() * 0.05 + 0.02;
      daySeconds = (daySeconds + 1) % 86400;
      const hours = Math.floor(daySeconds / 3600);
      const mins = Math.floor((daySeconds % 3600) / 60);
      earnAmountEl.textContent = "+$" + earn.toFixed(2);
      earnMonthlyEl.textContent = "+$" + monthly.toFixed(2);
      if (earnTimeEl) earnTimeEl.textContent = String(hours).padStart(2, "0") + ":" + String(mins).padStart(2, "0");
      const pct = (daySeconds / 86400) * 100;
      if (sparkFill) sparkFill.style.width = pct + "%";
      if (sparkVal) sparkVal.textContent = String(hours).padStart(2, "0") + ":" + String(mins).padStart(2, "0") + " / 24:00";
    }, 1000);
  }

  const partners = ["Visa", "Mastercard", "Circle", "Stripe", "Coinbase", "Bitget", "Binance", "OKX", "Tether", "Solana", "Ethereum", "Chainlink", "Aave", "Uniswap", "Fireblocks", "Chainalysis", "Elliptic", "Lead Bank"];
  const partnersTrack = document.getElementById("partnersTrack");
  if (partnersTrack) {
    partners.concat(partners).forEach((name) => {
      const chip = document.createElement("div");
      chip.className = "partner-chip";
      chip.innerHTML = '<span class="partner-mark">' + name.charAt(0) + '</span><span>' + name + '</span>';
      partnersTrack.appendChild(chip);
    });
  }

  const communityCards = [
    { q: "刷卡前不用卖币，余额一直在生息。这是我等了三年的产品。", name: "Alex", tag: "自由设计师 · 新加坡", accent: "rgba(0, 240, 255, 0.2)" },
    { q: "以前每次收 USDT 都要先提到交易所，现在直接刷卡消费。", name: "Mia", tag: "远程工程师 · 曼谷", accent: "rgba(43, 214, 123, 0.2)" },
    { q: "清算窗口能看到钱去哪了，这是我信任它的原因。", name: "Kevin", tag: "跨境电商 · 吉隆坡", accent: "rgba(0, 240, 255, 0.2)" },
    { q: "汇率不是卡商说了算，是我第一次感觉到透明。", name: "Lena", tag: "自由撰稿人 · 台北", accent: "rgba(43, 214, 123, 0.2)" },
    { q: "自动生息的收益比我过去买的货币基金高，而且随取随用。", name: "David", tag: "独立开发者 · 香港", accent: "rgba(0, 240, 255, 0.2)" },
    { q: "P2P 入金零手续费，这一步就省了我不少钱。", name: "Nina", tag: "海外务工 · 迪拜", accent: "rgba(43, 214, 123, 0.2)" },
    { q: "虚拟卡 20 秒出，Apple Pay 绑定直接能用。", name: "Ryan", tag: "产品经理 · 东京", accent: "rgba(0, 240, 255, 0.2)" },
    { q: "客服 24 小时在线，这在加密领域真的少见。", name: "Sophie", tag: "内容创作者 · 悉尼", accent: "rgba(43, 214, 123, 0.2)" }
  ];
  function makeUCard(item) {
    const el = document.createElement("div");
    el.className = "ucard";
    el.style.setProperty("--accent", item.accent);
    el.innerHTML = '<div class="ucard-quote">"' + item.q + '"</div><div class="ucard-foot"><div class="ucard-avatar">' + item.name.charAt(0) + '</div><div class="ucard-meta"><strong>' + item.name + '</strong>' + item.tag + '</div></div>';
    return el;
  }
  const cRow1 = document.getElementById("communityRow1");
  const cRow2 = document.getElementById("communityRow2");
  if (cRow1 && cRow2) {
    const half = Math.ceil(communityCards.length / 2);
    communityCards.slice(0, half).concat(communityCards.slice(0, half)).forEach((item) => cRow1.appendChild(makeUCard(item)));
    communityCards.slice(half).concat(communityCards.slice(half)).forEach((item) => cRow2.appendChild(makeUCard(item)));
  }

  document.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const ans = item.querySelector(".faq-a");
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((it) => {
        it.classList.remove("open");
        it.querySelector(".faq-a").style.maxHeight = "0";
      });
      if (!isOpen) {
        item.classList.add("open");
        ans.style.maxHeight = ans.scrollHeight + 40 + "px";
      }
    });
  });

  const quotaEls = document.querySelectorAll("#quotaText, .final-note strong");
  if (quotaEls.length && !reduceMotion) {
    let quota = 312;
    setInterval(() => {
      if (quota > 180 && Math.random() > 0.55) {
        quota -= 1;
        quotaEls.forEach((el) => (el.textContent = quota));
      }
    }, 9000);
  }

  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo) heroVideo.addEventListener("error", () => { heroVideo.style.display = "none"; });


  /* =========================================
     2. 全站翻译引擎 (核心)
     ========================================= */
  // 缓存机制：存储当前页面已翻译的文本字典
  let translateCache = JSON.parse(localStorage.getItem('nexa_trans_cache') || '{}');
  
  // 百度 / Google 免费翻译接口 (纯前端跨域调用)
  async function fetchTranslate(text, targetLang) {
    // 排除纯数字和符号
    if (!text.trim() || !/[\u4e00-\u9fa5]/.test(text)) return text; 
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0].map(item => item[0]).join('');
    } catch(e) {
      console.warn("翻译请求失败:", text);
      return text;
    }
  }

  // 递归遍历页面所有文字节点并替换
  async function translateDOM(targetLang) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToTranslate = [];

    while (node = walker.nextNode()) {
      if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE') continue;
      const txt = node.nodeValue.trim();
      // 只抓取包含中文的节点
      if (txt && /[\u4e00-\u9fa5]/.test(txt)) {
        nodesToTranslate.push({ node: node, text: txt });
      }
    }

    // 逐个翻译（避免并发过高被封IP，实际业务中可将文本拼装成数组批量请求）
    for (let i = 0; i < nodesToTranslate.length; i++) {
      const item = nodesToTranslate[i];
      if (translateCache[item.text]) {
        // 走缓存
        item.node.nodeValue = item.node.nodeValue.replace(item.text, translateCache[item.text]);
      } else {
        // 真实请求
        const translatedText = await fetchTranslate(item.text, targetLang);
        if (translatedText !== item.text) {
          translateCache[item.text] = translatedText;
          item.node.nodeValue = item.node.nodeValue.replace(item.text, translatedText);
        }
      }
    }
    // 保存缓存
    localStorage.setItem('nexa_trans_cache', JSON.stringify(translateCache));
  }

  /* =========================================
     3. 语言优先逻辑与切换器
     ========================================= */
  window.toggleLangMenu = function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById("langDropdown").classList.toggle("show");
  };

  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("langDropdown");
    if (dropdown && dropdown.classList.contains("show")) {
      if (!e.target.closest(".lang-float-wrap")) dropdown.classList.remove("show");
    }
  });

  window.changeLang = function(lang, e) {
    if (e) e.preventDefault();
    document.getElementById("langDropdown").classList.remove("show");
    localStorage.setItem('nexa_manual_lang', lang); // 记录手动选择
    
    if (lang === 'zh') {
      // 如果切回中文，直接重载页面恢复原样
      location.reload();
    } else {
      // 调用翻译引擎
      translateDOM(lang);
    }
  };

  // 初始化语言判断逻辑：手动 > IP > 浏览器 > 默认英文
  async function initAutoLang() {
    // 1. 检查手动设置
    let manualLang = localStorage.getItem('nexa_manual_lang');
    if (manualLang) {
      if (manualLang !== 'zh') translateDOM(manualLang);
      return;
    }

    let detectedLang = '';

    // 2. 尝试 IP 定位 (调用公开 API)
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData = await ipRes.json();
      const countryMap = {
        'CN': 'zh', 'TW': 'zh-TW', 'HK': 'zh-TW', 'US': 'en', 'GB': 'en', 
        'JP': 'ja', 'KR': 'ko', 'VN': 'vi', 'DE': 'de', 'FR': 'fr', 
        'ES': 'es', 'PT': 'pt', 'IT': 'it', 'RU': 'ru', 'TR': 'tr',
        'TH': 'th', 'ID': 'id', 'NL': 'nl', 'PL': 'pl', 'SE': 'sv'
      };
      if (ipData.country_code && countryMap[ipData.country_code]) {
        detectedLang = countryMap[ipData.country_code];
      }
    } catch (e) {
      console.log("IP 获取失败，降级使用浏览器语言");
    }

    // 3. 降级使用浏览器语言
    if (!detectedLang) {
      const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang.startsWith('zh')) detectedLang = 'zh';
      else if (navLang.startsWith('en')) detectedLang = 'en';
      else if (navLang.startsWith('ja')) detectedLang = 'ja';
      else if (navLang.startsWith('ko')) detectedLang = 'ko';
      else if (navLang.startsWith('vi')) detectedLang = 'vi';
      else detectedLang = 'en'; // 4. 默认英语
    }

    // 只要不是中文，就执行翻译
    if (detectedLang && detectedLang !== 'zh') {
      setTimeout(() => translateDOM(detectedLang), 800); // 延迟等待DOM渲染完
    }
  }

  // 触发自动识别
  initAutoLang();

})();
