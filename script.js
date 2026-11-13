(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================
     1. 页面原有交互（滚动、光斑、动画等）
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

  // 余额与收益动画
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

  // 动态渲染合作伙伴
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

  // 社区卡片渲染
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

  // FAQ 手风琴
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
     2. 国际化 (i18n) 字典替换引擎
     ========================================= */
  
  // 获取后台保存的语言配置
  function getLangs() {
    return JSON.parse(localStorage.getItem('nexa_langs') || '[]');
  }

  // 动态渲染悬浮球菜单
  function renderLangMenu() {
    const dropdown = document.getElementById("langDropdown");
    if (!dropdown) return;
    
    const langs = getLangs();
    // 默认带有中文
    let html = `<a href="#" onclick="changeLang('zh', event)">简体中文</a>`;
    
    langs.forEach(l => {
      // 只有当后台配置了该语言，且字典不为空时才显示
      if (l.code !== 'zh' && l.status !== false && l.dict && Object.keys(l.dict).length > 0) {
        html += `<a href="#" onclick="changeLang('${l.code}', event)">${l.name}</a>`;
      }
    });
    
    dropdown.innerHTML = html;
  }

  // 核心逻辑：遍历 DOM 文本并根据字典替换
  function applyTranslation(dict) {
    if (!dict) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE') continue;
      
      const txt = node.nodeValue.trim();
      // 如果字典里包含这段中文原文，直接替换
      if (txt && dict[txt]) {
        node.nodeValue = node.nodeValue.replace(txt, dict[txt]);
      }
    }
  }

  // 切换语言触发器
  window.changeLang = function(lang, e) {
    if (e) e.preventDefault();
    document.getElementById("langDropdown").classList.remove("show");
    localStorage.setItem('nexa_manual_lang', lang); // 记录用户选择
    
    if (lang === 'zh') {
      location.reload(); // 切回中文直接刷新，恢复初始 HTML
    } else {
      const langs = getLangs();
      const target = langs.find(l => l.code === lang);
      if (target && target.dict) {
        applyTranslation(target.dict);
      } else {
        console.warn("当前语言缺少字典数据，请去后台生成");
      }
    }
  };

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

  // 初始化入口：优先手动 > IP > 浏览器 > 英文
  async function initI18n() {
    renderLangMenu(); // 先渲染菜单

    let lang = localStorage.getItem('nexa_manual_lang');
    if (lang === 'zh') return; // 如果是中文不需要做任何处理

    if (!lang) {
      // IP 判断
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const map = {'CN':'zh', 'TW':'zh-TW', 'HK':'zh-TW', 'US':'en', 'GB':'en', 'JP':'ja', 'KR':'ko', 'VN':'vi', 'DE':'de', 'FR':'fr', 'ES':'es', 'PT':'pt', 'IT':'it', 'RU':'ru', 'TR':'tr', 'TH':'th', 'ID':'id', 'NL':'nl', 'PL':'pl', 'SE':'sv'};
        lang = map[data.country_code];
      } catch(e) {}
    }
    
    // 浏览器降级
    if (!lang) {
      const navLang = (navigator.language || '').toLowerCase();
      if (navLang.startsWith('zh')) lang = 'zh';
      else if (navLang.startsWith('en')) lang = 'en';
      else lang = navLang.split('-')[0];
    }

    // 默认英文
    if (!lang) lang = 'en';

    // 应用翻译
    if (lang !== 'zh') {
      const langs = getLangs();
      const target = langs.find(l => l.code === lang || l.code.startsWith(lang));
      if (target && target.dict) {
        // 稍微延迟等待其他 DOM 渲染完毕
        setTimeout(() => applyTranslation(target.dict), 300);
      }
    }
  }

  initI18n();
})();
