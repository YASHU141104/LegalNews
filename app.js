/* ===============================
   DARK MODE LOGIC
   =============================== */
const darkBtn = document.getElementById("darkToggleBtn");

function setDarkMode(state) {
  document.body.classList.toggle("dark-mode", state);
  localStorage.setItem("dark-mode", state ? "1" : "");
  darkBtn.textContent = state ? "Light Mode" : "Dark Mode";
}
darkBtn.onclick = () => setDarkMode(!document.body.classList.contains("dark-mode"));
(() => {
  if (localStorage.getItem("dark-mode")) setDarkMode(true);
})();

/* ===============================
   TABS & CATEGORY HANDLING
   =============================== */
const highCourtList = [
  { name: "Allahabad High Court" }, { name: "Andhra Pradesh High Court" }, { name: "Bombay High Court" },
  { name: "Calcutta High Court" }, { name: "Chhattisgarh High Court" }, { name: "Delhi High Court" },
  { name: "Gauhati High Court" }, { name: "Gujarat High Court" }, { name: "Himachal Pradesh High Court" },
  { name: "Jammu & Kashmir High Court" }, { name: "Jharkhand High Court" },
  { name: "Karnataka High Court" }, { name: "Kerala High Court" }, { name: "Madhya Pradesh High Court" },
  { name: "Madras High Court" }, { name: "Manipur High Court" }, { name: "Meghalaya High Court" },
  { name: "Orissa High Court" }, { name: "Patna High Court" }, { name: "Punjab & Haryana High Court" },
  { name: "Rajasthan High Court" }, { name: "Sikkim High Court" }, { name: "Telangana High Court" },
  { name: "Tripura High Court" }, { name: "Uttarakhand High Court" }
];
let selectedTab = "all";
let selectedHC = null;
function setTab(cat, hcName = null) {
  selectedTab = cat;
  selectedHC = cat === "high" ? hcName : null;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle("active", btn.dataset.category === cat));
  renderHighCourtTabs(cat === "high" ? hcName : null);
  renderApp();
}
function renderHighCourtTabs(active = null) {
  const hctabs = document.getElementById("highCourtTabs");
  if (selectedTab !== "high") { hctabs.style.display = "none"; return; }
  hctabs.style.display = 'flex';
  let html = '';
  highCourtList.forEach(hc => {
    html += `<button class="hc-btn${active === hc.name ? ' active' : ''}" data-hc="${hc.name}">${hc.name}</button>`;
  });
  hctabs.innerHTML = html;
  hctabs.querySelectorAll(".hc-btn").forEach(btn =>
    btn.onclick = () => {
      setTab("high", btn.dataset.hc);
    }
  );
}
document.getElementById("categoryTabs").querySelectorAll(".tab-btn").forEach(btn =>
  btn.onclick = () => setTab(btn.dataset.category)
);

/* ===============================
   DATA FETCHING & APP LOGIC
   =============================== */
const supabase_url = "https://xddssiompemprjbnxxlf.supabase.co";
const supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZHNzaW9tcGVtcHJqYm54eGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDczNzcsImV4cCI6MjA3Mzc4MzM3N30.QHjF8xdFYp6ex1YW2XV6GkKvPZXNp1biImoQIZdSMG4";
const supabase = window.supabase.createClient(supabase_url, supabase_key);
const feeds = [
  { url: "https://www.barandbench.com/feed" },
  { url: "https://www.livelaw.in/rss/law" },
  { url: "https://www.scconline.com/blog/post/category/news/feed/" },
  { url: "https://indialegallive.com/feed/" },
  { url: "https://lawbeat.in/rss.xml" },
  { url: "https://www.latestlaws.com/feed/" }
];
const rss2json = (url) => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
let allNews = [];
let currentSearch = "";

function setStatus(msg) {
  document.getElementById("statusMsg").textContent = msg || "";
}
function cleanDesc(desc) {
  if (!desc) return "";
  const text = desc.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return text.length > 180 ? text.slice(0, 180) + "..." : text;
}
function getImg(item) {
  return item.thumbnail || (item.enclosure && item.enclosure.link) || "";
}
function getWeekStories(news) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  const startDate = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return news.filter((item) => {
    if (!item.pubdate) return false;
    const d = new Date(item.pubdate);
    return d >= startDate && d < endDate;
  });
}
function formatPubDate(pubdate) {
  if (!pubdate) return "";
  let d = new Date(pubdate);
  return d.toLocaleString();
}
function renderTopCarousel(topStories) {
  const container = document.getElementById("top-carousel");
  if (!topStories || !topStories.length) {
    container.innerHTML = "";
    return;
  }
  let slideIdx = 0;
  function showSlide(n) {
    const story = topStories[n];
    let img = getImg(story);
    container.innerHTML = `
      <div class="top-story-slide">
        ${
          img
            ? `<img src="${img}" style="width:120px;height:120px;object-fit:cover;border-radius:1em;border:1.7px solid #eee;flex-shrink:0;">`
            : ""
        }
        <div style="flex:1">
          <div style="color:#B30348; font-weight:700; font-size:1.14em;margin-bottom:0.17em;">This Week's Top Story</div>
          <a href="${story.link}" target="_blank" style="color:#244e86;font-size:1.3em;font-weight:700;text-decoration:underline;display:block;">
            ${story.title}
          </a>
          <div style="font-size:0.85em; color:#666;">${formatPubDate(story.pubdate)}</div>
          <div style="color:#212121;font-size:1.04em;margin-top:0.25em;">
            ${cleanDesc(story.description || story.content || "")}
          </div>
        </div>
      </div>
    `;
  }
  showSlide(slideIdx);
  if (topStories.length > 1) {
    setInterval(() => {
      slideIdx = (slideIdx + 1) % topStories.length;
      showSlide(slideIdx);
    }, 50000);
  }
}
function filterNews(all, searchStr) {
  let weekNews = getWeekStories(all);
  let filtered = weekNews;
  if (selectedTab === "supreme") {
    filtered = filtered.filter(item =>
      (item.title || "").toLowerCase().includes("supreme court")
    );
  }
  else if (selectedTab === "high") {
    filtered = filtered.filter(item =>
      (item.title || "").toLowerCase().includes("high court")
    );
    if (selectedHC) {
      filtered = filtered.filter(item =>
        (item.title || "").toLowerCase().includes(selectedHC.toLowerCase())
      );
    }
  }
  else if (selectedTab === "other") {
    filtered = filtered.filter(item =>
      !(item.title || "").toLowerCase().includes("high court") &&
      !(item.title || "").toLowerCase().includes("supreme court")
    );
  }
  if (searchStr) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(searchStr)) {
      filtered = filtered.filter((item) => {
        if (!item.pubdate) return false;
        const d = new Date(item.pubdate);
        const ymd = d.toISOString().split("T")[0];
        return ymd === searchStr;
      });
    } else {
      const q = searchStr.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
  }
  return filtered.sort((a, b) => new Date(b.pubdate) - new Date(a.pubdate));
}

function renderGroupedNews(news) {
  let articles = [], supreme_court_cases = [], high_court_cases = [];
  news.forEach((item) => {
    const h = (item.title || "").toLowerCase();
    if (h.includes("supreme court")) {
      supreme_court_cases.push(item);
    } else if (h.includes("high court") || h.includes("hc")) {
      high_court_cases.push(item);
    } else {
      articles.push(item);
    }
  });

  function renderSection(title, group) {
    if (!group.length) return "";
    let html = `<h2>${title}</h2>`;

    // --- Find the latest news item by pubdate in this group ---
    const latestNews = group.reduce((latest, item) => {
      if (!latest) return item;
      if (new Date(item.pubdate) > new Date(latest.pubdate)) return item;
      return latest;
    }, null);

    group.forEach((item) => {
      const img = getImg(item);
      // "Breaking" if within last 5 hours on current day
      const isBreakingNews = isBreaking(item); // Use new function below
      const breakingMark = isBreakingNews ? '<span class="badge">Breaking</span>' : '';
      html += `<div class="news-card${isBreakingNews ? ' breaking' : ''}">
        ${breakingMark}
        ${img ? `<img class="news-img" src="${img}" loading="lazy" alt="news photo">` : ""}
        <div class="news-content">
          <a href="${item.link}" target="_blank">${item.title}</a>
          <div style="font-size:0.85em; color:#666;">${formatPubDate(item.pubdate)}</div>
          <div class="desc">${cleanDesc(item.description || item.content || "")}</div>
        </div>
      </div>`;
    });

    return html;
  }

  let html = '';
  if (selectedTab === "all") {
    html =
      renderSection("Supreme Court Cases", supreme_court_cases) +
      renderSection("High Court Cases", high_court_cases) +
      renderSection("Other Articles", articles);
  } else {
    html = renderSection(
      selectedTab === "supreme" ? "Supreme Court Cases"
        : selectedTab === "high" ? (selectedHC ? selectedHC + " News" : "High Court Cases")
          : "Other Articles",
      news
    );
  }
  if (!html.trim()) html = "<p>No news found for your selection.</p>";
  document.getElementById("law-news").innerHTML = html;
}

function renderApp() {
  let topNews = filterNews(allNews, "").slice(0, 3);
  renderTopCarousel(topNews);
  const filtered = filterNews(allNews, currentSearch);
  renderGroupedNews(filtered);
  setStatus(""); // Clear status
}

async function getAllNews() {
  setStatus("Loading archive...");
  let { data: news, error } = await supabase
    .from("news")
    .select("*")
    .order("pubdate", { ascending: false })
    .limit(300);
  if (error) {
    setStatus("Supabase error: " + error.message);
    news = [];
  } else if (!news) {
    setStatus("No news found in database.");
    news = [];
  }
  allNews = news;
  renderApp();
}

async function insertLatestNews(newsArray) {
  for (const item of newsArray) {
    let { data: existing } = await supabase
      .from("news")
      .select("id")
      .eq("link", item.link)
      .maybeSingle();
    if (!existing) {
      let { error } = await supabase.from("news").insert([item]);
      if (error) {
        setStatus("Insert error: " + error.message);
      }
    }
  }
}

async function fetchAndStoreNews() {
  setStatus("Fetching latest news feeds...");
  try {
    const results = await Promise.all(
      feeds.map((feed) =>
        fetch(rss2json(feed.url))
          .then((res) => res.json())
          .then((data) =>
            (data.items || []).map((item) => ({
              title: item.title,
              link: item.link,
              description: item.description || item.content || "",
              pubdate: item.pubDate || null,
              thumbnail: item.thumbnail || "",
              enclosure: item.enclosure || null,
            }))
          )
          .catch(() => [])
      )
    );
    const freshNews = results.flat();
    await insertLatestNews(freshNews);
    await getAllNews();
  } catch (e) {
    setStatus("Failed news fetch: " + e);
    document.getElementById("law-news").innerHTML = "Failed: " + e;
  }
}

getAllNews();
fetchAndStoreNews();
setInterval(fetchAndStoreNews, 300000);

document.getElementById("searchBar").addEventListener("input", function () {
  currentSearch = this.value.trim().toLowerCase();
  renderApp();
});

/* ===============================
   BREAKING NEWS LOGIC
   =============================== */
/**
 * Returns true if article was published within the last 5 hours today
 */
function isBreaking(item) {
  if (!item.pubdate) return false;
  const now = new Date();
  const pub = new Date(item.pubdate);

  // Only if published today
  const today = now.toISOString().slice(0, 10);
  const itemDate = pub.toISOString().slice(0, 10);
  if (itemDate !== today) return false;

  // Only if published within last 5 hours
  const diffMs = now - pub;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= 5;
}

/* ===============================
   WEB PUSH & PWA LOGIC
   =============================== */
if ("Notification" in window && Notification.permission !== "denied") {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      new Notification("New Legal News Arrived!", {
        body: "Click to view the latest legal stories.",
        icon: "favicon.ico"
      });
    }
  });
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("Service Worker Registered!"))
    .catch(err => console.error("Service Worker Registration Failed:", err));
}
