(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============ 全局翻译函数供动态代码调用 ============ */
  window.t = function(text) {
    if (window.activeDict && window.activeDict[text]) return window.activeDict[text];
    return text;
  };

  function hideLoader() {
    const loader = document.getElementById('i18n-loader');
    if (loader && loader.style.display !== 'none') {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  }

  /* =========================================
     1. 页面原有交互
     ========================================= */
  const topbar = document.getElementById("topbar");
  const langSwitchWrap = document.querySelector(".lang-switch-wrap");
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
      if(topbar) topbar.classList.add("scrolled");
      if(langSwitchWrap) langSwitchWrap.classList.add("scrolled");
    } else {
      if(topbar) topbar.classList.remove("scrolled");
      if(langSwitchWrap) langSwitchWrap.classList.remove("scrolled");
    }
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
    el.innerHTML = '<div class="ucard-quote">' + item.q + '</div><div class="ucard-foot"><div class="ucard-avatar">' + item.name.charAt(0) + '</div><div class="ucard-meta"><strong>' + item.name + '</strong>' + item.tag + '</div></div>';
    return el;
  }
  
  const cRow1 = document.getElementById("communityRow1");
  const cRow2 = document.getElementById("communityRow2");
  if (cRow1 && cRow2) {
    const half = Math.ceil(communityCards.length / 2);
    communityCards.slice(0, half).concat(communityCards.slice(0, half)).forEach((item) => cRow1.appendChild(makeUCard(item)));
    communityCards.slice(half).concat(communityCards.slice(half)).forEach((item) => cRow2.appendChild(makeUCard(item)));
    
    if (window.activeDict) {
      setTimeout(() => window.applyTranslation(window.activeDict), 50);
    }
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

  /* =========================================
     2. 国际化 (i18n) - 终极容错匹配版
     ========================================= */
  let currentLangs = [];
  window.activeDict = null;

  async function fetchLangsFromServer() {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      currentLangs = data.langs || [];
      renderLangMenu();
    } catch(e) {
      console.warn("后端请求失败，请确保已运行 server.js");
    }
  }

  function renderLangMenu() {
    const dropdown = document.getElementById("langDropdown");
    if (!dropdown) return;
    
    let html = `<a href="#" onclick="changeLang('zh', event)">简体中文</a>`;
    currentLangs.forEach(l => {
      if (l.code !== 'zh' && l.status !== false && l.dict && Object.keys(l.dict).length > 0) {
        html += `<a href="#" onclick="changeLang('${l.code}', event)">${l.name}</a>`;
      }
    });
    dropdown.innerHTML = html;
  }

  // 核心翻译执行器
  window.applyTranslation = function(dict) {
    if (!dict) {
      hideLoader();
      return;
    }
    window.activeDict = dict;

    // 构建两套字典用于容错匹配：
    // 1. 单空格版（兼容英文）
    // 2. 无空格版（兼容中文换行导致的匹配失败）
    const dictMapSpace = {};
    const dictMapNoSpace = {};

    for (const key in dict) {
      if (!dict[key] || !dict[key].trim()) continue;
      const rawKey = key.trim();
      
      const keyWithSpace = rawKey.replace(/\s+/g, ' ');
      dictMapSpace[keyWithSpace] = dict[key];
      
      const keyNoSpace = rawKey.replace(/\s+/g, '');
      if (keyNoSpace) {
        dictMapNoSpace[keyNoSpace] = dict[key];
      }
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE') continue;
      
      const rawTxt = node.nodeValue;
      if (!rawTxt || !rawTxt.trim()) continue;

      const nodeTxtWithSpace = rawTxt.replace(/\s+/g, ' ').trim();
      const nodeTxtNoSpace = rawTxt.replace(/\s+/g, '');

      let translated = null;

      // 优先匹配单空格版，兜底匹配无空格版
      if (dictMapSpace[nodeTxtWithSpace]) {
        translated = dictMapSpace[nodeTxtWithSpace];
      } else if (dictMapNoSpace[nodeTxtNoSpace]) {
        translated = dictMapNoSpace[nodeTxtNoSpace];
      }

      if (translated !== null) {
        // 保留原有的首尾空白，防止破坏原来的 HTML 排版
        const leadingSpace = rawTxt.match(/^\s*/)[0];
        const trailingSpace = rawTxt.match(/\s*$/)[0];
        node.nodeValue = leadingSpace + translated + trailingSpace;
      }
    }

    // 翻译 Placeholder
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      const t = el.getAttribute('placeholder');
      if (!t) return;
      const cleanWithSpace = t.replace(/\s+/g, ' ').trim();
      const cleanNoSpace = t.replace(/\s+/g, '');
      
      if (dictMapSpace[cleanWithSpace]) {
        el.setAttribute('placeholder', dictMapSpace[cleanWithSpace]);
      } else if (dictMapNoSpace[cleanNoSpace]) {
        el.setAttribute('placeholder', dictMapNoSpace[cleanNoSpace]);
      }
    });

    // 翻译 Select 选项
    document.querySelectorAll('option').forEach(el => {
      const t = el.textContent;
      if (!t) return;
      const cleanWithSpace = t.replace(/\s+/g, ' ').trim();
      const cleanNoSpace = t.replace(/\s+/g, '');
      
      if (dictMapSpace[cleanWithSpace]) {
        el.textContent = dictMapSpace[cleanWithSpace];
      } else if (dictMapNoSpace[cleanNoSpace]) {
        el.textContent = dictMapNoSpace[cleanNoSpace];
      }
    });

    // 翻译 Title 属性
    document.querySelectorAll('[title]').forEach(el => {
      const t = el.getAttribute('title');
      if (!t) return;
      const cleanWithSpace = t.replace(/\s+/g, ' ').trim();
      const cleanNoSpace = t.replace(/\s+/g, '');
      
      if (dictMapSpace[cleanWithSpace]) {
        el.setAttribute('title', dictMapSpace[cleanWithSpace]);
      } else if (dictMapNoSpace[cleanNoSpace]) {
        el.setAttribute('title', dictMapNoSpace[cleanNoSpace]);
      }
    });

    // 翻译网页 Title
    if (dict['领取虚拟卡'] && document.title.includes('领取虚拟卡')) {
      document.title = document.title.replace('领取虚拟卡', dict['领取虚拟卡']);
    } else if (dict['你的 USDC，不卖也能花'] && document.title.includes('你的 USDC')) {
       document.title = dict['你的 USDC，不卖也能花'];
    }

    hideLoader();
  };

  window.triggerRetranslate = function() {
    if (window.activeDict) {
      window.applyTranslation(window.activeDict);
    }
  };

  window.changeLang = function(lang, e) {
    if (e) e.preventDefault();
    document.getElementById("langDropdown").classList.remove("show");
    localStorage.setItem('nexa_manual_lang', lang);
    
    if (lang === 'zh') {
      location.reload();
    } else {
      const target = currentLangs.find(l => l.code === lang);
      if (target && target.dict) {
        window.applyTranslation(target.dict);
      } else {
        hideLoader();
      }
    }
  };

  window.toggleLangMenu = function(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropdown = document.getElementById("langDropdown");
    if(dropdown) dropdown.classList.toggle("show");
  };

  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("langDropdown");
    if (dropdown && dropdown.classList.contains("show")) {
      if (!e.target.closest(".lang-switch-wrap")) dropdown.classList.remove("show");
    }
  });

  fetchLangsFromServer().then(() => {
    let lang = localStorage.getItem('nexa_manual_lang');
    if (lang && lang !== 'zh') {
      const target = currentLangs.find(l => l.code === lang);
      if (target && target.dict) {
        setTimeout(() => {
          window.applyTranslation(target.dict);
          
          if (window.startGenerate) {
            const origGenerate = window.startGenerate;
            window.startGenerate = function() {
              origGenerate();
              setTimeout(window.triggerRetranslate, 100);
            };
          }
          
          setTimeout(window.triggerRetranslate, 300);
          
        }, 50);
      } else {
        hideLoader();
      }
    } else {
      hideLoader();
    }
  });

})();
