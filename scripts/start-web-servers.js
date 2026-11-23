const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = process.env.HOST || '0.0.0.0';

// Helper to create HTML web server for an app
function createWebDevServer(port, appName, appColor, role, customBody) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (typeof customBody === 'string' && customBody.trim().startsWith('<!DOCTYPE')) {
      res.end(customBody);
      return;
    }
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { -webkit-tap-highlight-color: transparent; }
    body {
      background-color: #E2E8F0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
    }
    .theme-yellow { background-color: #FFC727; }
    .text-theme-yellow { color: #FFC727; }
    .border-theme-yellow { border-color: #FFC727; }
    .theme-dark { background-color: #1E1E1E; }
    .strikethrough-coral { color: #FF5E7E; text-decoration: line-through; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .phone-shadow {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 12px #222226;
    }
    .card-shadow {
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.06);
    }
    .active-nav-dot {
      width: 4px;
      height: 4px;
      border-radius: 9999px;
      background-color: #1E1E1E;
      margin: 2px auto 0;
    }

    /* ===================================================
       1. BORDER BEAM ANIMATION (border-beam-search.tsx)
       Orbiting colorful light beam around the search container
       =================================================== */
    @keyframes spin-beam {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .border-beam-wrapper {
      position: relative;
      padding: 2.5px;
      border-radius: 20px;
      overflow: hidden;
      background: #F1F5F9;
    }
    .border-beam-wrapper::before {
      content: '';
      position: absolute;
      top: -100%;
      left: -100%;
      width: 300%;
      height: 300%;
      background: conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #FFC727 300deg, #EC4899 330deg, #38BDF8 360deg);
      animation: spin-beam 3.1s linear infinite;
      z-index: 0;
    }
    .border-beam-inner {
      position: relative;
      z-index: 1;
      background: #FFFFFF;
      border-radius: 17.5px;
    }

    /* ===================================================
       2. OTP INPUT ANIMATIONS & STYLES (otp-input.tsx)
       Spring shake on error, smooth transitions
       =================================================== */
    @keyframes otp-shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
    .otp-error-shake {
      animation: otp-shake 0.35s cubic-bezier(0.23, 1, 0.32, 1);
    }
  </style>
</head>
<body class="min-h-screen py-0 md:py-8 flex items-center justify-center">
  ${customBody}
</body>
</html>`);
  });

  server.listen(port, HOST, () => {
    console.log(`[CraveCart Dev Server] ${appName} listening on http://${HOST}:${port}`);
  });
}

// Helper to serve a compiled SPA application with static assets and SPA fallback
function createStaticSpaServer(port, appName, distDir) {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  };

  const server = http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      let reqPath = decodeURIComponent(parsedUrl.pathname);
      if (reqPath === '/' || reqPath === '') {
        reqPath = '/index.html';
      }

      let filePath = path.join(distDir, reqPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(content);
      });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error: ' + err.message);
    }
  });

  server.listen(port, HOST, () => {
    console.log(`[CraveCart Dev Server] ${appName} listening on http://${HOST}:${port}`);
  });
}

// ==========================================
// 1. FULLY FUNCTIONAL CUSTOMER APP (Port 8081)
// Styled to the provided UI Theme with
// Food Item, Feedo Meat & Feedo Mart sections
// ==========================================
const customerHTML = `
  <div class="w-full max-w-md bg-[#FBFBFC] min-h-screen md:min-h-[880px] md:rounded-[48px] phone-shadow relative overflow-hidden flex flex-col justify-between">
    
    <!-- Dynamic Island / Top Phone Notch -->
    <div class="w-full pt-3 px-6 flex justify-between items-center bg-[#FBFBFC] z-30 select-none">
      <span class="text-xs font-bold text-gray-800">9:41</span>
      <div class="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 space-x-1">
        <span class="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping opacity-75"></span>
        <span class="w-2 h-2 bg-yellow-400 rounded-full"></span>
      </div>
      <div class="flex items-center space-x-1.5 text-xs text-gray-700">
        <span>5G</span>
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>

    <!-- Top App Bar with Pill Title & Round Action Buttons -->
    <div class="px-5 pt-2 pb-3 bg-[#FBFBFC] flex items-center justify-between z-20">
      <!-- Left Back / Menu Round Button -->
      <button onclick="handleBackAction()" class="w-10 h-10 rounded-full bg-white border border-gray-100 card-shadow flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
      </button>

      <!-- Center Title Capsule Pill -->
      <div id="topHeaderPill" class="px-6 py-2 bg-white border border-gray-100 rounded-full card-shadow flex items-center space-x-2">
        <span id="topHeaderTitle" class="text-xs font-extrabold tracking-wide text-gray-900">Food Offer</span>
      </div>

      <!-- Right Action Round Buttons -->
      <div class="flex items-center space-x-2">
        <button onclick="openOtpModal()" title="Security Verification" class="w-10 h-10 rounded-full bg-yellow-50 border border-yellow-200 card-shadow flex items-center justify-center text-gray-800 hover:bg-yellow-100 active:scale-95 transition relative">
          <span class="text-sm">🔐</span>
        </button>
        <button onclick="openCartModal()" class="w-10 h-10 rounded-full bg-white border border-gray-100 card-shadow flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition relative">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <span id="cartBadgeCount" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">0</span>
        </button>
      </div>
    </div>

    <!-- Main Scrollable Content Container -->
    <div id="mainScrollContainer" class="flex-1 overflow-y-auto hide-scrollbar px-5 pb-28">
      
      <!-- ================= HOME VIEW ================= -->
      <div id="viewHome" class="space-y-5">
        
        <!-- ==============================================
             SECTION 1: BORDER BEAM SEARCH BAR
             ============================================== -->
        <div class="flex items-center space-x-3 pt-1">
          <div class="relative flex-1 border-beam-wrapper card-shadow">
            <div class="border-beam-inner flex items-center px-3.5 py-2.5 bg-white rounded-2xl relative z-10">
              <svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                id="searchInput" 
                type="text" 
                placeholder="Search food, meat cuts, mart..." 
                oninput="handleSearch(this.value)"
                class="w-full bg-transparent text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <span class="text-[9px] bg-yellow-100 text-yellow-800 font-extrabold px-1.5 py-0.5 rounded ml-1 tracking-wider uppercase flex-shrink-0">BEAM</span>
            </div>
          </div>
          
          <!-- Yellow Slider Filter Button -->
          <button onclick="toggleFilterDrawer()" class="w-11 h-11 rounded-2xl bg-[#FFC727] flex items-center justify-center text-gray-900 shadow-md hover:bg-yellow-400 active:scale-95 transition flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          </button>
        </div>

        <!-- Delicious Savings Promotional Hero Banner -->
        <div onclick="applyPromoCode('SAVINGS30')" class="cursor-pointer relative overflow-hidden rounded-3xl bg-[#1C1917] text-white p-5 card-shadow flex items-center justify-between group transform transition active:scale-[0.98]">
          <!-- Colored Accent Wing Tabs -->
          <div class="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-14 bg-pink-500 rounded-r-full"></div>
          <div class="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-14 bg-blue-400 rounded-l-full"></div>

          <div class="z-10 pl-2">
            <span class="text-[11px] font-semibold text-gray-400 tracking-wide block">Delicious Savings</span>
            <div class="flex items-baseline space-x-1.5 mt-0.5">
              <span class="text-xs font-bold text-gray-300">UPTO</span>
              <span class="text-3xl font-extrabold text-white tracking-tight">30%</span>
              <span class="text-xs bg-[#FF5E7E] text-white font-extrabold px-1.5 py-0.5 rounded-md">Off</span>
            </div>
            <div class="mt-2 flex items-center space-x-1 text-[11px] font-bold text-[#FFC727]">
              <span>Use code <b>SAVINGS30</b></span>
              <svg class="w-3.5 h-3.5 inline animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </div>

          <!-- Hero Graphic -->
          <div class="relative w-32 h-28 flex items-center justify-center">
            <img 
              id="heroBannerImage"
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" 
              alt="Promo" 
              class="w-28 h-28 object-contain drop-shadow-2xl transform group-hover:scale-105 transition duration-300"
            />
          </div>
        </div>

        <!-- Category Horizontal Pills (Dynamic according to active tab) -->
        <div>
          <div class="flex items-center justify-between mb-2.5">
            <h3 class="text-sm font-extrabold text-gray-900">Category</h3>
            <button onclick="setCategoryFilter('All')" class="text-xs font-bold text-gray-400 hover:text-gray-700">See All</button>
          </div>
          
          <div id="categoryPillContainer" class="flex space-x-2.5 overflow-x-auto hide-scrollbar pb-1">
            <!-- Dynamically populated by JS -->
          </div>
        </div>

        <!-- ==============================================
             SUB-CATEGORY SEGMENTED TABS
             Food Item | Feedo Meat | Feedo Mart
             ============================================== -->
        <div class="flex items-center space-x-2 pt-1">
          <button 
            id="typeTabFood" 
            onclick="setTypeTab('food')" 
            class="flex-1 py-2 rounded-full text-xs font-extrabold bg-[#FFC727] text-gray-950 card-shadow transition text-center whitespace-nowrap"
          >
            Food Item
          </button>
          <button 
            id="typeTabMeat" 
            onclick="setTypeTab('meat')" 
            class="flex-1 py-2 rounded-full text-xs font-bold bg-white border border-gray-100 text-gray-500 card-shadow transition text-center hover:bg-gray-50 whitespace-nowrap"
          >
            Feedo Meat
          </button>
          <button 
            id="typeTabMart" 
            onclick="setTypeTab('mart')" 
            class="flex-1 py-2 rounded-full text-xs font-bold bg-white border border-gray-100 text-gray-500 card-shadow transition text-center hover:bg-gray-50 whitespace-nowrap"
          >
            Feedo Mart
          </button>
        </div>

        <!-- 2-Column Product Grid -->
        <div id="productGrid" class="grid grid-cols-2 gap-3.5">
          <!-- Dynamically populated from JS catalog -->
        </div>

      </div>

      <!-- ================= ORDER HISTORY / LIVE VIEW ================= -->
      <div id="viewOrders" class="hidden space-y-4 pt-1">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-extrabold text-gray-900">Your Orders</h2>
          <span id="activeOrderBadge" class="text-xs bg-green-100 text-green-700 font-extrabold px-2.5 py-1 rounded-full">1 Active</span>
        </div>

        <!-- Ongoing Active Delivery Tracking Card -->
        <div id="activeTrackingCard" class="bg-white rounded-3xl p-5 border border-yellow-200 card-shadow space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[10px] font-extrabold text-yellow-600 tracking-wider">LIVE STATUS</span>
              <h3 id="trackingOrderNumber" class="text-base font-extrabold text-gray-900 mt-0.5">Order #CC-8821-492</h3>
              <p class="text-xs text-gray-500">Spice Junction • 2 items</p>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center text-lg animate-bounce">
              🚴
            </div>
          </div>

          <!-- Progress Stepper -->
          <div class="relative pt-2">
            <div class="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
              <div id="trackingProgressBar" style="width: 60%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#FFC727] transition-all duration-500"></div>
            </div>
            <div class="flex justify-between text-[11px] font-bold text-gray-600">
              <span id="stepPlaced" class="text-green-600">✓ Placed</span>
              <span id="stepKitchen" class="text-green-600">✓ Preparing</span>
              <span id="stepRider" class="text-yellow-600 font-extrabold">● On the way</span>
              <span id="stepDelivered" class="text-gray-400">Delivered</span>
            </div>
          </div>

          <!-- Rider Info -->
          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">RK</div>
              <div>
                <h4 class="text-xs font-bold text-gray-900">Rahul Kumar (4.9 ★)</h4>
                <p class="text-[10px] text-gray-400">Hero Electric • 12 mins away</p>
              </div>
            </div>
            <button onclick="advanceOrderStatus()" class="bg-[#1E1E1E] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl hover:bg-black transition">
              Simulate ➔
            </button>
          </div>
        </div>

        <!-- Past Order History List -->
        <h3 class="text-xs font-bold text-gray-400 tracking-wider pt-2">PAST DELIVERIES</h3>
        <div id="pastOrdersList" class="space-y-3">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- ================= OFFERS & REWARDS VIEW ================= -->
      <div id="viewOffers" class="hidden space-y-4 pt-1">
        <h2 class="text-base font-extrabold text-gray-900">Available Coupons & Offers</h2>
        <div class="space-y-3">
          <div class="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl p-5 card-shadow flex justify-between items-center">
            <div>
              <span class="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg">NEW USER</span>
              <h3 class="text-lg font-extrabold mt-1.5">50% Off First Order</h3>
              <p class="text-xs text-red-100 mt-0.5">Up to ₹100 / $10 on orders above $15</p>
              <span class="inline-block mt-2 font-mono font-bold text-xs bg-black/20 px-2 py-1 rounded-lg">WELCOME50</span>
            </div>
            <button onclick="applyPromoCode('WELCOME50')" class="bg-white text-red-600 font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow hover:bg-gray-100 active:scale-95 transition">Apply</button>
          </div>

          <div class="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 rounded-3xl p-5 card-shadow flex justify-between items-center">
            <div>
              <span class="bg-black/10 text-gray-900 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">SPECIAL</span>
              <h3 class="text-lg font-extrabold mt-1.5">30% Delicious Savings</h3>
              <p class="text-xs text-gray-800 mt-0.5">Valid on all Food, Feedo Meat & Mart orders</p>
              <span class="inline-block mt-2 font-mono font-bold text-xs bg-black/10 px-2 py-1 rounded-lg">SAVINGS30</span>
            </div>
            <button onclick="applyPromoCode('SAVINGS30')" class="bg-[#1E1E1E] text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow hover:bg-black active:scale-95 transition">Apply</button>
          </div>

          <div class="bg-white border border-gray-100 text-gray-900 rounded-3xl p-5 card-shadow flex justify-between items-center">
            <div>
              <span class="bg-green-100 text-green-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">FREE DELIVERY</span>
              <h3 class="text-base font-extrabold mt-1.5">Zero Delivery Fee</h3>
              <p class="text-xs text-gray-500 mt-0.5">Orders over $25 get free priority shipping</p>
              <span class="inline-block mt-2 font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-lg">FREEDEL</span>
            </div>
            <button onclick="applyPromoCode('FREEDEL')" class="bg-gray-100 text-gray-900 font-extrabold text-xs px-4 py-2.5 rounded-2xl hover:bg-gray-200 active:scale-95 transition">Apply</button>
          </div>
        </div>
      </div>

      <!-- ================= PROFILE VIEW ================= -->
      <div id="viewProfile" class="hidden space-y-5 pt-1">
        <div class="bg-white rounded-3xl p-5 border border-gray-100 card-shadow flex items-center space-x-4">
          <div class="w-16 h-16 rounded-full bg-[#FFC727] text-gray-950 flex items-center justify-center font-extrabold text-xl shadow">
            AJ
          </div>
          <div>
            <h3 class="text-base font-extrabold text-gray-900">Alex Johnson</h3>
            <p class="text-xs text-gray-500">+91 98765 43210 • alex.j@example.com</p>
            <span class="inline-block mt-1 text-[10px] bg-yellow-100 text-yellow-800 font-extrabold px-2 py-0.5 rounded-md">⭐ CraveCart Gold Member</span>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-2 border border-gray-100 card-shadow divide-y divide-gray-50 text-xs font-bold text-gray-700">
          <div onclick="openOtpModal()" class="p-3.5 flex justify-between items-center cursor-pointer hover:bg-yellow-50 rounded-2xl text-yellow-800">
            <span class="flex items-center space-x-3"><span>🔐</span><span>Test 6-Digit OTP Verification (Code: 204815)</span></span>
            <span class="text-yellow-600">➔</span>
          </div>
          <div class="p-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-2xl">
            <span class="flex items-center space-x-3"><span>📍</span><span>Saved Addresses (Home, Office)</span></span>
            <span class="text-gray-400">➔</span>
          </div>
          <div class="p-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-2xl">
            <span class="flex items-center space-x-3"><span>💳</span><span>Payment Modes (UPI, Cards)</span></span>
            <span class="text-gray-400">➔</span>
          </div>
          <div class="p-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-2xl">
            <span class="flex items-center space-x-3"><span>❤️</span><span>My Favorites & Wishlist</span></span>
            <span class="text-gray-400">➔</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Floating Curved Bottom Navigation Bar -->
    <div class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-30 shadow-2xl md:rounded-b-[48px]">
      <!-- Home Tab -->
      <button onclick="switchTab('home')" class="nav-btn flex flex-col items-center justify-center text-gray-900 focus:outline-none">
        <svg id="navIconHome" class="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span class="text-[10px] font-bold mt-0.5 text-gray-900">Home</span>
        <div id="navDotHome" class="active-nav-dot"></div>
      </button>

      <!-- Order Tab -->
      <button onclick="switchTab('orders')" class="nav-btn flex flex-col items-center justify-center text-gray-400 hover:text-gray-900 focus:outline-none relative">
        <svg id="navIconOrders" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        <span class="text-[10px] font-bold mt-0.5 text-gray-500">Order</span>
        <div id="navDotOrders" class="active-nav-dot hidden"></div>
      </button>

      <!-- Offer Tab -->
      <button onclick="switchTab('offers')" class="nav-btn flex flex-col items-center justify-center text-gray-400 hover:text-gray-900 focus:outline-none">
        <svg id="navIconOffers" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
        <span class="text-[10px] font-bold mt-0.5 text-gray-500">Offer</span>
        <div id="navDotOffers" class="active-nav-dot hidden"></div>
      </button>

      <!-- Cart Tab -->
      <button onclick="openCartModal()" class="nav-btn flex flex-col items-center justify-center text-gray-400 hover:text-gray-900 focus:outline-none relative">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        <span class="text-[10px] font-bold mt-0.5 text-gray-500">Cart</span>
        <span id="navCartCount" class="hidden absolute -top-1 -right-1 bg-[#FFC727] text-gray-950 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">0</span>
      </button>

      <!-- Profile Tab -->
      <button onclick="switchTab('profile')" class="nav-btn flex flex-col items-center justify-center text-gray-400 hover:text-gray-900 focus:outline-none">
        <svg id="navIconProfile" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <span class="text-[10px] font-bold mt-0.5 text-gray-500">Profile</span>
        <div id="navDotProfile" class="active-nav-dot hidden"></div>
      </button>
    </div>

    <!-- ================= MODALS & DRAWERS ================= -->

    <!-- 1. CART / BAG DRAWER MODAL -->
    <div id="cartModal" class="hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div class="w-full max-w-md bg-white rounded-t-[36px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        <!-- Header -->
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-extrabold text-gray-900">Your Cart</h3>
            <p id="cartItemsSubtitle" class="text-xs text-gray-500">0 items selected</p>
          </div>
          <button onclick="closeCartModal()" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold hover:bg-gray-200">✕</button>
        </div>

        <!-- Items Scroll List -->
        <div id="cartItemsList" class="flex-1 overflow-y-auto p-5 space-y-3.5 hide-scrollbar">
          <!-- Populated by JS -->
        </div>

        <!-- Bill Summary & Checkout Footer -->
        <div class="p-5 bg-[#FBFBFC] border-t border-gray-100 space-y-3">
          
          <!-- Promo Code Input -->
          <div class="flex space-x-2">
            <input id="cartCouponInput" type="text" placeholder="Promo code (e.g. SAVINGS30)" class="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#FFC727]">
            <button onclick="applyCartCoupon()" class="bg-[#1E1E1E] text-white px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-black">Apply</button>
          </div>

          <!-- Price Calculation Lines -->
          <div class="space-y-1.5 text-xs text-gray-600 font-semibold pt-1">
            <div class="flex justify-between"><span>Subtotal</span><span id="billSubtotal">$0.00</span></div>
            <div id="billDiscountRow" class="hidden justify-between text-green-600 font-bold"><span>Promo Discount</span><span id="billDiscount">-$0.00</span></div>
            <div class="flex justify-between"><span>Delivery Fee</span><span id="billDelivery">$0.00</span></div>
            <div class="flex justify-between"><span>Taxes & GST (5%)</span><span id="billTax">$0.00</span></div>
            <div class="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
              <span>Total Pay</span>
              <span id="billTotal" class="text-base text-gray-950 font-black">$0.00</span>
            </div>
          </div>

          <!-- Checkout Action -->
          <button onclick="proceedToCheckout()" class="w-full bg-[#FFC727] text-gray-950 py-3.5 rounded-2xl font-extrabold text-xs shadow-lg hover:bg-yellow-400 active:scale-98 transition flex items-center justify-center space-x-2">
            <span>Proceed to Checkout</span>
            <span>➔</span>
          </button>
        </div>

      </div>
    </div>

    <!-- 2. CHECKOUT MODAL -->
    <div id="checkoutModal" class="hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white rounded-t-[36px] max-h-[85vh] p-6 space-y-4 shadow-2xl flex flex-col justify-between">
        <div class="space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-base font-extrabold text-gray-900">Confirm Order</h3>
            <button onclick="closeCheckoutModal()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
          </div>

          <!-- Delivery Address -->
          <div class="space-y-2">
            <span class="text-xs font-bold text-gray-400">DELIVER TO</span>
            <div class="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex items-center space-x-3">
              <span class="text-xl">📍</span>
              <div class="flex-1">
                <h4 class="text-xs font-extrabold text-gray-900">Home • Indiranagar</h4>
                <p class="text-[11px] text-gray-500">42 MG Road, Bengaluru 560038</p>
              </div>
              <button class="text-[11px] font-bold text-[#FFC727]">Change</button>
            </div>
          </div>

          <!-- Payment Options -->
          <div class="space-y-2">
            <span class="text-xs font-bold text-gray-400">PAYMENT METHOD</span>
            <div class="space-y-2">
              <label class="flex items-center space-x-3 p-3 rounded-2xl border border-yellow-400 bg-yellow-50/50 cursor-pointer">
                <input type="radio" name="paymentMethod" value="UPI / Online" checked class="text-[#FFC727] focus:ring-[#FFC727]">
                <div class="flex-1 text-xs">
                  <span class="font-bold text-gray-900">Instant UPI / Razorpay (Verified)</span>
                  <p class="text-[10px] text-gray-500">Google Pay, PhonePe, Cards</p>
                </div>
                <span class="text-xs font-bold text-green-600">Fast</span>
              </label>
              <label class="flex items-center space-x-3 p-3 rounded-2xl border border-gray-200 bg-white cursor-pointer">
                <input type="radio" name="paymentMethod" value="Cash On Delivery" class="text-gray-900">
                <div class="flex-1 text-xs">
                  <span class="font-bold text-gray-900">Cash on Delivery (COD)</span>
                  <p class="text-[10px] text-gray-500">Pay cash or QR upon arrival</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <button onclick="initiateCheckoutWithOtp()" class="w-full bg-[#1E1E1E] text-white py-4 rounded-2xl font-extrabold text-xs shadow-xl hover:bg-black active:scale-95 transition">
          Confirm & Verify With OTP <span id="checkoutPayAmount">$0.00</span> ➔
        </button>
      </div>
    </div>

    <!-- ==============================================
         SECTION 2: OTP INPUT VERIFICATION MODAL
         ============================================== -->
    <div id="otpModal" class="hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white rounded-t-[36px] max-h-[85vh] p-6 space-y-4 shadow-2xl flex flex-col justify-between animate-in slide-in-from-bottom duration-300">
        <div class="space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <h3 class="text-base font-black text-gray-900">Verification Code</h3>
              <p class="text-[11px] text-gray-500">Confirm your mobile & order placement</p>
            </div>
            <button onclick="closeOtpModal()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200">✕</button>
          </div>

          <div class="text-center py-1">
            <span class="inline-block p-3 rounded-full bg-yellow-100 text-yellow-800 text-xl mb-1">🔐</span>
            <p class="text-xs text-gray-600 font-semibold">Enter the 6-digit code sent to</p>
            <p class="text-xs font-black text-gray-900 mt-0.5">+91 98765 43210</p>
          </div>

          <!-- 6-Cell Animated OTP Input -->
          <div class="flex justify-center py-2">
            <div id="otpContainer" class="flex gap-2 items-center transition-transform duration-200">
              <input type="text" maxlength="1" id="otp-0" oninput="handleOtpInput(0, this)" onkeydown="handleOtpKey(0, event)" class="otp-cell w-10 h-12 rounded-[10px] border-2 border-stone-200 text-center font-mono text-[16px] font-bold text-gray-800 bg-stone-50 focus:border-[#4568FF] focus:bg-white outline-none transition duration-150">
              <input type="text" maxlength="1" id="otp-1" oninput="handleOtpInput(1, this)" onkeydown="handleOtpKey(1, event)" class="otp-cell w-10 h-12 rounded-[10px] border-2 border-stone-200 text-center font-mono text-[16px] font-bold text-gray-800 bg-stone-50 focus:border-[#4568FF] focus:bg-white outline-none transition duration-150">
              <input type="text" maxlength="1" id="otp-2" oninput="handleOtpInput(2, this)" onkeydown="handleOtpKey(2, event)" class="otp-cell w-10 h-12 rounded-[10px] border-2 border-stone-200 text-center font-mono text-[16px] font-bold text-gray-800 bg-stone-50 focus:border-[#4568FF] focus:bg-white outline-none transition duration-150">
              
              <!-- 3-character group divider -->
              <span class="w-1.5 h-1.5 rounded-full bg-stone-300 mx-0.5"></span>
              
              <input type="text" maxlength="1" id="otp-3" oninput="handleOtpInput(3, this)" onkeydown="handleOtpKey(3, event)" class="otp-cell w-10 h-12 rounded-[10px] border-2 border-stone-200 text-center font-mono text-[16px] font-bold text-gray-800 bg-stone-50 focus:border-[#4568FF] focus:bg-white outline-none transition duration-150">
              <input type="text" maxlength="1" id="otp-4" oninput="handleOtpInput(4, this)" onkeydown="handleOtpKey(4, event)" class="otp-cell w-10 h-12 rounded-[10px] border-2 border-stone-200 text-center font-mono text-[16px] font-bold text-gray-800 bg-stone-50 focus:border-[#4568FF] focus:bg-white outline-none transition duration-150">
              <input type="text" maxlength="1" id="otp-5" oninput="handleOtpInput(5, this)" onkeydown="handleOtpKey(5, event)" class="otp-cell w-10 h-12 rounded-[10px] border-2 border-stone-200 text-center font-mono text-[16px] font-bold text-gray-800 bg-stone-50 focus:border-[#4568FF] focus:bg-white outline-none transition duration-150">
            </div>
          </div>

          <!-- Dynamic Status Message matching demo.tsx -->
          <div class="text-center h-5">
            <p id="otpStatusMessage" class="text-[11.5px] font-semibold text-stone-500">
              Try <span class="font-mono font-bold text-stone-700">204815</span>, or anything else.
            </p>
          </div>

          <!-- Helper Autocomplete Button -->
          <div class="flex justify-center">
            <button onclick="autofillOtp('204815')" class="text-[11px] font-bold text-[#FFC727] bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200 hover:bg-yellow-100 transition">
              ⚡ Tap to autofill demo code 204815
            </button>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button onclick="submitOtpVerification()" class="w-full bg-[#1E1E1E] text-white py-3.5 rounded-2xl font-extrabold text-xs shadow-xl hover:bg-black active:scale-95 transition">
            Verify & Confirm Order ➔
          </button>
          <button onclick="closeOtpModal()" class="w-full text-xs font-bold text-gray-400 py-1 hover:text-gray-700">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- 4. ITEM CUSTOMIZATION MODAL -->
    <div id="customModal" class="hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white rounded-t-[36px] max-h-[85vh] p-6 space-y-4 shadow-2xl flex flex-col justify-between overflow-y-auto hide-scrollbar">
        <div>
          <div class="flex justify-between items-start mb-2">
            <div class="w-full pr-4">
              <span id="modalCategoryTag" class="text-[10px] font-extrabold text-[#FFC727] uppercase">Category</span>
              <h3 id="modalItemTitle" class="text-lg font-black text-gray-900">Item Title</h3>
              <p id="modalItemDesc" class="text-xs text-gray-500 mt-1">Freshly prepared with premium quality standards.</p>
            </div>
            <button onclick="closeCustomModal()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">✕</button>
          </div>

          <div class="my-3">
            <img id="modalItemImage" src="" class="w-full h-44 object-cover rounded-2xl shadow-sm">
          </div>

          <!-- Dynamic Options Section -->
          <div id="modalDynamicOptions" class="space-y-3 pt-2">
            <!-- Populated dynamically based on food/meat/mart -->
          </div>
        </div>

        <div class="pt-4 flex items-center space-x-3">
          <div class="flex items-center space-x-3 bg-gray-100 px-3 py-2.5 rounded-2xl">
            <button onclick="changeModalQty(-1)" class="w-6 h-6 rounded-lg bg-white font-extrabold text-xs shadow-sm">-</button>
            <span id="modalQtyDisplay" class="text-xs font-black text-gray-900">1</span>
            <button onclick="changeModalQty(1)" class="w-6 h-6 rounded-lg bg-white font-extrabold text-xs shadow-sm">+</button>
          </div>
          <button onclick="confirmModalAddToCart()" class="flex-1 bg-[#FFC727] text-gray-950 py-3.5 rounded-2xl font-extrabold text-xs shadow-lg hover:bg-yellow-400 active:scale-95 transition">
            Add to Cart • <span id="modalAddPrice">$0.00</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Toast -->
    <div id="toastNotification" class="fixed top-12 left-1/2 -translate-x-1/2 bg-[#1E1E1E] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl z-50 transform -translate-y-20 opacity-0 transition-all duration-300 flex items-center space-x-2">
      <span id="toastIcon">✨</span>
      <span id="toastMessage">Item added to cart!</span>
    </div>

  </div>

  <script>
    // =====================================
    // STATE & CATALOG DATA
    // Supports: Food Item | Feedo Meat | Feedo Mart
    // =====================================
    const CATALOG = [
      // 1. Food Items (Screen 1 & 2)
      {
        id: 'food-1',
        type: 'food',
        category: 'Biryani',
        name: 'Hyderabadi Biryani',
        price: 22.50,
        originalPrice: 30.50,
        rating: 4.8,
        distance: '2.5km',
        deliveryTime: '30 min delivery',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
        desc: 'Slow-cooked royal aromatic basmati rice layered with succulent marinated pieces & saffron.'
      },
      {
        id: 'food-2',
        type: 'food',
        category: 'Noodles',
        name: 'Chicken Noodles',
        price: 12.12,
        originalPrice: 22.12,
        rating: 4.5,
        distance: '2.5km',
        deliveryTime: '40 min delivery',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
        desc: 'Wok-tossed noodles with tender chicken cuts, bok choy, scallions and spicy chili sauce.'
      },
      {
        id: 'food-3',
        type: 'food',
        category: 'Sushi',
        name: 'Buddha Bowl Rice',
        price: 22.50,
        originalPrice: 30.50,
        rating: 4.6,
        distance: '2.0km',
        deliveryTime: '15 min delivery',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
        desc: 'Healthy nutrient bowl with organic brown rice, edamame, avocado, and toasted sesame.'
      },
      {
        id: 'food-4',
        type: 'food',
        category: 'Burger',
        name: 'Bef Cheese Burger',
        price: 10.20,
        originalPrice: 20.20,
        rating: 4.4,
        distance: '2.5km',
        deliveryTime: '20 min delivery',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
        desc: 'Smashed prime patty with double melted American cheddar, crispy lettuce and secret sauce.'
      },
      {
        id: 'food-5',
        type: 'food',
        category: 'Burger',
        name: 'Cheeseburger Special',
        price: 12.12,
        originalPrice: 26.12,
        rating: 4.8,
        distance: '1.8km',
        deliveryTime: '31 min delivery',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
        desc: 'Signature brioche bun with smoked bacon, caramelized onions, pickles and secret relish.'
      },
      {
        id: 'food-6',
        type: 'food',
        category: 'Pizza',
        name: 'Margherita Pizza',
        price: 15.50,
        originalPrice: 24.00,
        rating: 4.7,
        distance: '3.0km',
        deliveryTime: '25 min delivery',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80',
        desc: 'Wood-fired Italian dough, San Marzano tomato sauce, fresh mozzarella di bufala and basil.'
      },

      // 2. Feedo Meat Items (Fresh, Antibiotic-Free Meat & Poultry)
      {
        id: 'meat-1',
        type: 'meat',
        category: 'Chicken',
        name: 'Fresh Chicken Breast',
        price: 7.50,
        originalPrice: 10.50,
        rating: 4.9,
        distance: '2.0km',
        deliveryTime: '15 min delivery',
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&q=80',
        desc: 'Tender antibiotic-free farm fresh chicken breast boneless cuts, neatly trimmed and high in lean protein.'
      },
      {
        id: 'meat-2',
        type: 'meat',
        category: 'Mutton',
        name: 'Tender Goat Curry Cut',
        price: 16.80,
        originalPrice: 24.00,
        rating: 4.8,
        distance: '2.5km',
        deliveryTime: '20 min delivery',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
        desc: 'Prime grass-fed mutton curry cut with balanced bone-in and boneless pieces for rich, slow-cooked royal gravies.'
      },
      {
        id: 'meat-3',
        type: 'meat',
        category: 'Seafood',
        name: 'Fresh Cleaned Sea Prawns',
        price: 12.20,
        originalPrice: 18.50,
        rating: 4.7,
        distance: '3.0km',
        deliveryTime: '25 min delivery',
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&q=80',
        desc: 'Wild caught succulent sea prawns, peeled, deveined, tail-on and cleaned ready for sizzling pan fry or curries.'
      },
      {
        id: 'meat-4',
        type: 'meat',
        category: 'Chicken',
        name: 'Juicy Chicken Drumsticks',
        price: 6.90,
        originalPrice: 9.50,
        rating: 4.9,
        distance: '1.8km',
        deliveryTime: '15 min delivery',
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&q=80',
        desc: 'Pack of 6 plump chicken legs with skinless tender meat, perfect for roasting, frying or barbecue.'
      },
      {
        id: 'meat-5',
        type: 'meat',
        category: 'Seafood',
        name: 'Atlantic Salmon Fillet',
        price: 18.50,
        originalPrice: 26.00,
        rating: 4.8,
        distance: '3.2km',
        deliveryTime: '20 min delivery',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&q=80',
        desc: 'Fresh sashimi-grade Atlantic salmon fillet with rich pink marbling, loaded with natural Omega-3s.'
      },
      {
        id: 'meat-6',
        type: 'meat',
        category: 'Eggs',
        name: 'Organic Country Brown Eggs',
        price: 4.20,
        originalPrice: 6.50,
        rating: 4.9,
        distance: '1.2km',
        deliveryTime: '10 min delivery',
        image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&q=80',
        desc: 'Pack of 12 free-range brown country eggs with deep golden yolks and superior natural nutrition.'
      },
      {
        id: 'meat-7',
        type: 'meat',
        category: 'Marinated',
        name: 'Peri Peri Marinated Wings',
        price: 7.80,
        originalPrice: 11.00,
        rating: 4.8,
        distance: '2.0km',
        deliveryTime: '15 min delivery',
        image: 'https://images.unsplash.com/photo-1527477378408-1bc09c233134?w=500&q=80',
        desc: 'Fresh chicken wings marinated in fiery bird-eye chili peri peri sauce, ready for air fryer or grill.'
      },
      {
        id: 'meat-8',
        type: 'meat',
        category: 'Chicken',
        name: 'Smoked Crispy Bacon Strips',
        price: 8.90,
        originalPrice: 12.50,
        rating: 4.7,
        distance: '2.2km',
        deliveryTime: '18 min delivery',
        image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=500&q=80',
        desc: 'Wood-smoked streaky cured bacon strips that sizzle to crispy, savory gourmet perfection.'
      },

      // 3. Feedo Mart Items (Instant Grocery & Daily Essentials)
      {
        id: 'mart-1',
        type: 'mart',
        category: 'Fruits',
        name: 'Fresh Hass Avocados (Pack of 2)',
        price: 5.40,
        originalPrice: 8.00,
        rating: 4.8,
        distance: '1.5km',
        deliveryTime: '10 min delivery',
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80',
        desc: 'Ripe and creamy Mexican Hass avocados, packed with healthy monounsaturated fats for toasts & salads.'
      },
      {
        id: 'mart-2',
        type: 'mart',
        category: 'Fruits',
        name: 'Sweet Organic Strawberries (250g)',
        price: 4.80,
        originalPrice: 7.50,
        rating: 4.9,
        distance: '1.5km',
        deliveryTime: '12 min delivery',
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&q=80',
        desc: 'Plump hand-picked ripe sweet strawberries, chilled continuously to preserve peak farm flavor.'
      },
      {
        id: 'mart-3',
        type: 'mart',
        category: 'Dairy',
        name: 'Pure A2 Farm Cow Milk (1L)',
        price: 3.20,
        originalPrice: 4.50,
        rating: 4.9,
        distance: '1.0km',
        deliveryTime: '10 min delivery',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80',
        desc: 'Pure unadulterated whole A2 cow milk bottled fresh from local dairy farms within hours.'
      },
      {
        id: 'mart-4',
        type: 'mart',
        category: 'Bakery',
        name: 'Artisan Sourdough Loaf (400g)',
        price: 4.50,
        originalPrice: 6.80,
        rating: 4.7,
        distance: '2.0km',
        deliveryTime: '15 min delivery',
        image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500&q=80',
        desc: 'Naturally fermented rustic sourdough with an open airy crumb and crunchy toasted golden crust.'
      },
      {
        id: 'mart-5',
        type: 'mart',
        category: 'Dairy',
        name: 'Fresh Malai Paneer (400g)',
        price: 3.80,
        originalPrice: 5.50,
        rating: 4.8,
        distance: '1.5km',
        deliveryTime: '12 min delivery',
        image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&q=80',
        desc: 'Creamy soft whole milk cottage cheese blocks, freshly prepared daily with no artificial additives.'
      },
      {
        id: 'mart-6',
        type: 'mart',
        category: 'Fruits',
        name: 'Fresh Blueberries (Punnet 125g)',
        price: 5.90,
        originalPrice: 9.00,
        rating: 4.8,
        distance: '2.0km',
        deliveryTime: '15 min delivery',
        image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500&q=80',
        desc: 'Plump antioxidant-rich sweet blueberries fresh from high-altitude berry orchards.'
      },
      {
        id: 'mart-7',
        type: 'mart',
        category: 'Veggies',
        name: 'Farm Fresh Vine Tomatoes (1kg)',
        price: 2.80,
        originalPrice: 4.00,
        rating: 4.7,
        distance: '1.2km',
        deliveryTime: '10 min delivery',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80',
        desc: 'Juicy ripe red tomatoes harvested fresh off the vine, loaded with lycopene and vitamin C.'
      },
      {
        id: 'mart-8',
        type: 'mart',
        category: 'Snacks',
        name: 'Roasted Salted Almonds (250g)',
        price: 6.50,
        originalPrice: 9.50,
        rating: 4.9,
        distance: '2.0km',
        deliveryTime: '15 min delivery',
        image: 'https://images.unsplash.com/photo-1508061252445-5633a2515b02?w=500&q=80',
        desc: 'Premium California jumbo almonds slow-roasted with Himalayan pink salt for wholesome daily crunch.'
      }
    ];

    // Category mappings per main section
    const CATEGORIES_BY_TYPE = {
      food: ['All', 'Burger', 'Pizza', 'Sushi', 'Biryani', 'Noodles'],
      meat: ['All', 'Chicken', 'Mutton', 'Seafood', 'Eggs', 'Marinated'],
      mart: ['All', 'Fruits', 'Veggies', 'Dairy', 'Bakery', 'Snacks']
    };

    // Reactive Application State
    let currentTab = 'home';
    let currentTypeFilter = 'food';
    let currentCategoryFilter = 'All';
    let searchQuery = '';
    let favorites = new Set(['food-1', 'meat-1', 'mart-1']);
    let cart = [];
    let appliedCoupon = null;
    let orderTrackingStatus = 2; // 0=Placed, 1=Kitchen, 2=Rider, 3=Delivered
    let activeModalItem = null;
    let modalQuantity = 1;

    // OTP State (matches otp-input.tsx demo CODE = 204815)
    const DEMO_OTP_CODE = "204815";
    let otpValues = ["", "", "", "", "", ""];
    let otpStatus = "idle"; // "idle" | "error" | "success"

    // Initialize App
    function initApp() {
      renderCategoryPills();
      renderProducts();
      updateCartUI();
    }

    // =====================================
    // RENDER CATEGORY PILLS (Dynamic per section)
    // =====================================
    function renderCategoryPills() {
      const container = document.getElementById('categoryPillContainer');
      if (!container) return;
      container.innerHTML = '';
      const list = CATEGORIES_BY_TYPE[currentTypeFilter] || CATEGORIES_BY_TYPE.food;
      list.forEach(cat => {
        const isSelected = currentCategoryFilter === cat;
        const btn = document.createElement('button');
        btn.onclick = () => setCategoryFilter(cat);
        btn.id = 'catPill-' + cat;
        btn.className = isSelected 
          ? "cat-pill px-5 py-2 rounded-full text-xs font-bold bg-[#1E1E1E] text-white card-shadow transition whitespace-nowrap"
          : "cat-pill px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-100 text-gray-700 card-shadow transition whitespace-nowrap";
        btn.innerText = cat;
        container.appendChild(btn);
      });
    }

    // =====================================
    // RENDER PRODUCT CARDS (2-Column Grid)
    // =====================================
    function renderProducts() {
      const grid = document.getElementById('productGrid');
      grid.innerHTML = '';

      const filtered = CATALOG.filter(item => {
        const matchesType = (item.type === currentTypeFilter);
        const matchesCategory = (currentCategoryFilter === 'All') || (item.category === currentCategoryFilter);
        const matchesSearch = !searchQuery || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesCategory && matchesSearch;
      });

      if (filtered.length === 0) {
        grid.innerHTML = \`
          <div class="col-span-2 py-12 text-center text-gray-400">
            <span class="text-3xl">🔍</span>
            <p class="text-xs font-bold mt-2">No items found matching "\${searchQuery}".</p>
            <button onclick="setCategoryFilter('All');" class="mt-3 text-xs text-[#FFC727] font-extrabold underline">Clear Category Filter</button>
          </div>
        \`;
        return;
      }

      filtered.forEach(item => {
        const isFav = favorites.has(item.id);
        const card = document.createElement('div');
        card.className = "bg-white rounded-3xl p-3 border border-gray-100 card-shadow flex flex-col justify-between group hover:border-yellow-200 transition duration-200 cursor-pointer";
        card.onclick = (e) => {
          if (!e.target.closest('.fav-btn') && !e.target.closest('.quick-add-btn')) {
            openCustomModal(item.id);
          }
        };

        // Badge indicator based on type
        let tagEmoji = '🍽️';
        if (item.type === 'meat') tagEmoji = '🥩';
        if (item.type === 'mart') tagEmoji = '🛒';

        card.innerHTML = \`
          <div>
            <!-- Image with Heart Favorite Button -->
            <div class="relative w-full h-32 rounded-2xl overflow-hidden bg-gray-100">
              <img src="\${item.image}" alt="\${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
              
              <!-- Round Favorite Pill Button -->
              <button 
                onclick="toggleFavorite('\${item.id}', event)" 
                class="fav-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm card-shadow flex items-center justify-center text-xs transition active:scale-90"
              >
                \${isFav ? '<span class="text-red-500">❤️</span>' : '<span class="text-gray-400">♡</span>'}
              </button>
            </div>

            <!-- Title & Pricing Info -->
            <div class="mt-2.5">
              <h4 class="text-xs font-black text-gray-900 tracking-tight truncate">\${item.name}</h4>
              
              <div class="flex items-center space-x-1.5 mt-1">
                <span class="text-xs font-extrabold text-gray-900">$\${item.price.toFixed(2)}</span>
                <span class="strikethrough-coral text-[10px] font-bold">$\${item.originalPrice.toFixed(2)}</span>
                <span class="text-[10px] font-bold text-yellow-500 flex items-center ml-auto">
                  ⭐ \${item.rating}
                </span>
              </div>

              <!-- Distance & Delivery Time -->
              <div class="text-[10px] font-medium text-gray-400 mt-1 flex items-center justify-between">
                <span>\${item.distance}</span>
                <span>\${item.deliveryTime}</span>
              </div>
            </div>
          </div>

          <!-- Quick Add Button -->
          <button 
            onclick="quickAddToCart('\${item.id}', event)" 
            class="quick-add-btn mt-3 w-full bg-gray-50 hover:bg-[#FFC727] text-gray-900 font-extrabold text-[11px] py-1.5 rounded-xl border border-gray-100 transition duration-150 flex items-center justify-center space-x-1"
          >
            <span>+</span>
            <span>ADD</span>
          </button>
        \`;
        grid.appendChild(card);
      });
    }

    // =====================================
    // FILTERS & TAB HANDLERS
    // Supports: Food Item | Feedo Meat | Feedo Mart
    // =====================================
    function setTypeTab(type) {
      currentTypeFilter = type;
      currentCategoryFilter = 'All';
      
      const tabFood = document.getElementById('typeTabFood');
      const tabMeat = document.getElementById('typeTabMeat');
      const tabMart = document.getElementById('typeTabMart');

      [tabFood, tabMeat, tabMart].forEach(t => {
        if (t) t.className = "flex-1 py-2 rounded-full text-xs font-bold bg-white border border-gray-100 text-gray-500 card-shadow transition text-center hover:bg-gray-50 whitespace-nowrap";
      });

      const title = document.getElementById('topHeaderTitle');
      const heroImg = document.getElementById('heroBannerImage');

      if (type === 'food') {
        if (tabFood) tabFood.className = "flex-1 py-2 rounded-full text-xs font-extrabold bg-[#FFC727] text-gray-950 card-shadow transition text-center whitespace-nowrap";
        if (title) title.innerText = 'Popular Food';
        if (heroImg) heroImg.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80';
      } else if (type === 'meat') {
        if (tabMeat) tabMeat.className = "flex-1 py-2 rounded-full text-xs font-extrabold bg-[#FFC727] text-gray-950 card-shadow transition text-center whitespace-nowrap";
        if (title) title.innerText = 'Feedo Meat';
        if (heroImg) heroImg.src = 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80';
      } else if (type === 'mart') {
        if (tabMart) tabMart.className = "flex-1 py-2 rounded-full text-xs font-extrabold bg-[#FFC727] text-gray-950 card-shadow transition text-center whitespace-nowrap";
        if (title) title.innerText = 'Feedo Mart';
        if (heroImg) heroImg.src = 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80';
      }

      renderCategoryPills();
      renderProducts();
    }

    function setCategoryFilter(cat) {
      currentCategoryFilter = cat;
      document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.className = "cat-pill px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-100 text-gray-700 card-shadow transition whitespace-nowrap";
      });
      const activeBtn = document.getElementById('catPill-' + cat);
      if (activeBtn) {
        activeBtn.className = "cat-pill px-5 py-2 rounded-full text-xs font-bold bg-[#1E1E1E] text-white card-shadow transition whitespace-nowrap";
      }
      renderProducts();
    }

    function handleSearch(val) {
      searchQuery = val;
      renderProducts();
    }

    function toggleFavorite(id, e) {
      e.stopPropagation();
      if (favorites.has(id)) {
        favorites.delete(id);
        showToast('Removed from favorites', '💔');
      } else {
        favorites.add(id);
        showToast('Saved to your favorites!', '❤️');
      }
      renderProducts();
    }

    // =====================================
    // CART & ORDER MANAGEMENT
    // =====================================
    function quickAddToCart(id, e) {
      e.stopPropagation();
      const item = CATALOG.find(x => x.id === id);
      if (!item) return;

      const existing = cart.find(x => x.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...item, quantity: 1, portion: 'Standard', spice: 'Standard' });
      }
      showToast('Added ' + item.name + ' to Bag', '🛍️');
      updateCartUI();
    }

    function updateCartUI() {
      const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      const badge = document.getElementById('cartBadgeCount');
      const navBadge = document.getElementById('navCartCount');

      if (totalCount > 0) {
        badge.classList.remove('hidden');
        badge.innerText = totalCount;
        navBadge.classList.remove('hidden');
        navBadge.innerText = totalCount;
      } else {
        badge.classList.add('hidden');
        navBadge.classList.add('hidden');
      }

      // Calculate Bill
      let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      let discount = 0;

      if (appliedCoupon === 'SAVINGS30') {
        discount = subtotal * 0.30;
      } else if (appliedCoupon === 'WELCOME50') {
        discount = Math.min(subtotal * 0.50, 10.00);
      } else if (appliedCoupon === 'FREEDEL') {
        discount = 3.50;
      }

      let deliveryFee = subtotal >= 25 || appliedCoupon === 'FREEDEL' || subtotal === 0 ? 0 : 3.50;
      let tax = (subtotal - discount) * 0.05;
      if (tax < 0) tax = 0;
      let total = Math.max(0, subtotal - discount + deliveryFee + tax);

      document.getElementById('billSubtotal').innerText = '$' + subtotal.toFixed(2);
      document.getElementById('billDelivery').innerText = deliveryFee === 0 ? 'FREE' : '$' + deliveryFee.toFixed(2);
      document.getElementById('billTax').innerText = '$' + tax.toFixed(2);
      document.getElementById('billTotal').innerText = '$' + total.toFixed(2);
      document.getElementById('checkoutPayAmount').innerText = '$' + total.toFixed(2);

      const discountRow = document.getElementById('billDiscountRow');
      if (discount > 0) {
        discountRow.classList.remove('hidden');
        discountRow.classList.add('flex');
        document.getElementById('billDiscount').innerText = '-$' + discount.toFixed(2);
      } else {
        discountRow.classList.add('hidden');
        discountRow.classList.remove('flex');
      }

      // Render cart item list in drawer
      const list = document.getElementById('cartItemsList');
      document.getElementById('cartItemsSubtitle').innerText = totalCount + ' items in your cart';
      
      if (cart.length === 0) {
        list.innerHTML = \`
          <div class="py-12 text-center text-gray-400">
            <span class="text-4xl">🛍️</span>
            <p class="text-xs font-bold mt-2">Your cart is empty.</p>
            <p class="text-[11px] text-gray-400">Explore food, Feedo Meat, or Feedo Mart to add items!</p>
          </div>
        \`;
        return;
      }

      list.innerHTML = '';
      cart.forEach((item, idx) => {
        const itemRow = document.createElement('div');
        itemRow.className = "flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100";
        itemRow.innerHTML = \`
          <div class="flex items-center space-x-3">
            <img src="\${item.image}" class="w-12 h-12 rounded-xl object-cover">
            <div>
              <h4 class="text-xs font-bold text-gray-900">\${item.name}</h4>
              <p class="text-[10px] text-gray-400">$\${item.price.toFixed(2)} each</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-2 bg-white px-2 py-1 rounded-xl card-shadow">
              <button onclick="changeCartItemQty(\${idx}, -1)" class="w-5 h-5 rounded bg-gray-100 font-extrabold text-xs">-</button>
              <span class="text-xs font-black">\${item.quantity}</span>
              <button onclick="changeCartItemQty(\${idx}, 1)" class="w-5 h-5 rounded bg-gray-100 font-extrabold text-xs">+</button>
            </div>
            <span class="text-xs font-black text-gray-900 w-14 text-right">$\${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        \`;
        list.appendChild(itemRow);
      });
    }

    function changeCartItemQty(idx, delta) {
      cart[idx].quantity += delta;
      if (cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
      }
      updateCartUI();
    }

    function applyCartCoupon() {
      const code = document.getElementById('cartCouponInput').value.trim().toUpperCase();
      applyPromoCode(code);
    }

    function applyPromoCode(code) {
      if (code === 'SAVINGS30' || code === 'WELCOME50' || code === 'FREEDEL') {
        appliedCoupon = code;
        showToast('Coupon ' + code + ' applied successfully!', '🎉');
        updateCartUI();
        if (document.getElementById('cartCouponInput')) {
          document.getElementById('cartCouponInput').value = code;
        }
      } else {
        showToast('Invalid coupon code', '⚠️');
      }
    }

    // Modal Control
    function openCartModal() {
      document.getElementById('cartModal').classList.remove('hidden');
      updateCartUI();
    }

    function closeCartModal() {
      document.getElementById('cartModal').classList.add('hidden');
    }

    function proceedToCheckout() {
      if (cart.length === 0) {
        showToast('Please add items to cart first!', '⚠️');
        return;
      }
      closeCartModal();
      document.getElementById('checkoutModal').classList.remove('hidden');
    }

    function closeCheckoutModal() {
      document.getElementById('checkoutModal').classList.add('hidden');
    }

    // Transition from Checkout to OTP Verification
    function initiateCheckoutWithOtp() {
      closeCheckoutModal();
      openOtpModal();
    }

    // =====================================
    // SECTION 2: OTP INPUT LOGIC
    // =====================================
    function openOtpModal() {
      document.getElementById('otpModal').classList.remove('hidden');
      resetOtp();
      setTimeout(() => {
        const first = document.getElementById('otp-0');
        if (first) first.focus();
      }, 150);
    }

    function closeOtpModal() {
      document.getElementById('otpModal').classList.add('hidden');
      resetOtp();
    }

    function resetOtp() {
      otpValues = ["", "", "", "", "", ""];
      otpStatus = "idle";
      for (let i = 0; i < 6; i++) {
        const el = document.getElementById('otp-' + i);
        if (el) {
          el.value = "";
          el.className = "otp-cell w-10 h-12 rounded-[10px] border-2 border-stone-200 text-center font-mono text-[16px] font-bold text-gray-800 bg-stone-50 focus:border-[#4568FF] focus:bg-white outline-none transition duration-150";
        }
      }
      const msg = document.getElementById('otpStatusMessage');
      if (msg) {
        msg.className = "text-[11.5px] font-semibold text-stone-500";
        msg.innerHTML = 'Try <span class="font-mono font-bold text-stone-700">204815</span>, or anything else.';
      }
      const container = document.getElementById('otpContainer');
      if (container) container.classList.remove('otp-error-shake');
    }

    function handleOtpInput(idx, input) {
      const val = input.value.replace(/[^0-9]/g, '');
      input.value = val ? val[val.length - 1] : '';
      otpValues[idx] = input.value;

      if (input.value && idx < 5) {
        const next = document.getElementById('otp-' + (idx + 1));
        if (next) next.focus();
      }

      checkOtpCompletion();
    }

    function handleOtpKey(idx, e) {
      if (e.key === 'Backspace') {
        if (!inputIsFilled(idx) && idx > 0) {
          const prev = document.getElementById('otp-' + (idx - 1));
          if (prev) {
            prev.focus();
            prev.value = '';
            otpValues[idx - 1] = '';
          }
        } else {
          otpValues[idx] = '';
        }
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        document.getElementById('otp-' + (idx - 1)).focus();
      } else if (e.key === 'ArrowRight' && idx < 5) {
        document.getElementById('otp-' + (idx + 1)).focus();
      }
    }

    function inputIsFilled(idx) {
      const el = document.getElementById('otp-' + idx);
      return el && el.value.length > 0;
    }

    function autofillOtp(code) {
      resetOtp();
      for (let i = 0; i < 6; i++) {
        const char = code[i] || '';
        otpValues[i] = char;
        const el = document.getElementById('otp-' + i);
        if (el) el.value = char;
      }
      checkOtpCompletion();
    }

    function checkOtpCompletion() {
      const full = otpValues.join('');
      if (full.length === 6) {
        submitOtpVerification();
      }
    }

    function submitOtpVerification() {
      const code = otpValues.join('');
      const msg = document.getElementById('otpStatusMessage');
      const container = document.getElementById('otpContainer');

      if (code === DEMO_OTP_CODE) {
        // SUCCESS STATE (matches otp-input successMessage="Code accepted.")
        otpStatus = "success";
        msg.className = "text-[11.5px] font-bold text-emerald-600";
        msg.innerText = "✓ Code accepted. Order confirmed!";

        for (let i = 0; i < 6; i++) {
          const el = document.getElementById('otp-' + i);
          if (el) el.className = "otp-cell w-10 h-12 rounded-[10px] border-2 border-emerald-500 text-center font-mono text-[16px] font-bold text-emerald-700 bg-white outline-none";
        }

        setTimeout(() => {
          closeOtpModal();
          placeOrderFinal();
        }, 800);

      } else {
        // ERROR STATE (matches otp-input errorMessage="That code is not right.")
        otpStatus = "error";
        msg.className = "text-[11.5px] font-bold text-red-600";
        msg.innerText = "✕ That code is not right.";

        for (let i = 0; i < 6; i++) {
          const el = document.getElementById('otp-' + i);
          if (el) el.className = "otp-cell w-10 h-12 rounded-[10px] border-2 border-red-500 text-center font-mono text-[16px] font-bold text-red-600 bg-white outline-none";
        }

        if (container) {
          container.classList.remove('otp-error-shake');
          void container.offsetWidth; // trigger reflow
          container.classList.add('otp-error-shake');
        }

        // Auto-clear after 1.6s matching demo.tsx
        setTimeout(() => {
          resetOtp();
          const first = document.getElementById('otp-0');
          if (first) first.focus();
        }, 1600);
      }
    }

    function placeOrderFinal() {
      orderTrackingStatus = 0; // Start at Placed
      cart = [];
      updateCartUI();
      switchTab('orders');
      showToast('Order Placed Successfully! #CC-8821-492', '🚀');
      advanceTrackingStep(0);
    }

    // Live Tracking Simulation
    function advanceOrderStatus() {
      orderTrackingStatus = (orderTrackingStatus + 1) % 4;
      advanceTrackingStep(orderTrackingStatus);
    }

    function advanceTrackingStep(step) {
      const bar = document.getElementById('trackingProgressBar');
      const stepPlaced = document.getElementById('stepPlaced');
      const stepKitchen = document.getElementById('stepKitchen');
      const stepRider = document.getElementById('stepRider');
      const stepDelivered = document.getElementById('stepDelivered');

      if (step === 0) {
        bar.style.width = '25%';
        stepPlaced.className = 'text-green-600 font-extrabold';
        stepKitchen.className = 'text-gray-400';
        stepRider.className = 'text-gray-400';
        stepDelivered.className = 'text-gray-400';
        showToast('Order confirmed by Spice Junction!', '👨‍🍳');
      } else if (step === 1) {
        bar.style.width = '50%';
        stepPlaced.className = 'text-green-600';
        stepKitchen.className = 'text-yellow-600 font-extrabold';
        stepRider.className = 'text-gray-400';
        stepDelivered.className = 'text-gray-400';
        showToast('Chef / Butcher is preparing your items!', '🍳');
      } else if (step === 2) {
        bar.style.width = '75%';
        stepPlaced.className = 'text-green-600';
        stepKitchen.className = 'text-green-600';
        stepRider.className = 'text-yellow-600 font-extrabold';
        stepDelivered.className = 'text-gray-400';
        showToast('Rider Rahul Kumar is heading to you!', '🛵');
      } else if (step === 3) {
        bar.style.width = '100%';
        stepPlaced.className = 'text-green-600';
        stepKitchen.className = 'text-green-600';
        stepRider.className = 'text-green-600';
        stepDelivered.className = 'text-green-600 font-extrabold';
        showToast('Order delivered! Freshness guaranteed ✨', '🎉');
      }
    }

    // Item Detail Customization Modal (Dynamic per Food / Meat / Mart)
    function openCustomModal(id) {
      const item = CATALOG.find(x => x.id === id);
      if (!item) return;

      activeModalItem = item;
      modalQuantity = 1;
      document.getElementById('modalItemTitle').innerText = item.name;
      document.getElementById('modalItemDesc').innerText = item.desc;
      document.getElementById('modalCategoryTag').innerText = item.category;
      document.getElementById('modalItemImage').src = item.image;
      document.getElementById('modalQtyDisplay').innerText = '1';
      document.getElementById('modalAddPrice').innerText = '$' + item.price.toFixed(2);

      const optionsContainer = document.getElementById('modalDynamicOptions');
      if (item.type === 'meat') {
        optionsContainer.innerHTML = \`
          <div>
            <span class="text-xs font-extrabold text-gray-900">Cut & Cleaning Preference</span>
            <div class="grid grid-cols-2 gap-2 mt-1.5">
              <label class="p-2.5 border rounded-xl flex items-center space-x-2 text-xs font-bold cursor-pointer border-[#FFC727] bg-yellow-50/40">
                <input type="radio" name="meatCut" value="Curry Cut" checked>
                <span>Curry Cut (Medium)</span>
              </label>
              <label class="p-2.5 border rounded-xl flex items-center space-x-2 text-xs font-bold cursor-pointer border-gray-200">
                <input type="radio" name="meatCut" value="Biryani Cut">
                <span>Biryani Cut (Large)</span>
              </label>
            </div>
          </div>

          <div>
            <span class="text-xs font-extrabold text-gray-900">Pack Weight</span>
            <div class="flex space-x-2 mt-1.5">
              <label class="flex-1 text-center p-2 border rounded-xl text-xs font-bold cursor-pointer border-[#FFC727] bg-yellow-50/40">
                <input type="radio" name="meatWeight" value="500g" checked class="hidden">
                <span>500g Fresh</span>
              </label>
              <label class="flex-1 text-center p-2 border rounded-xl text-xs font-bold cursor-pointer border-gray-200">
                <input type="radio" name="meatWeight" value="1kg" class="hidden">
                <span>1kg Saver</span>
              </label>
            </div>
          </div>
        \`;
      } else if (item.type === 'mart') {
        optionsContainer.innerHTML = \`
          <div>
            <span class="text-xs font-extrabold text-gray-900">Pack Quantity</span>
            <div class="grid grid-cols-2 gap-2 mt-1.5">
              <label class="p-2.5 border rounded-xl flex items-center space-x-2 text-xs font-bold cursor-pointer border-[#FFC727] bg-yellow-50/40">
                <input type="radio" name="martPack" value="Single" checked>
                <span>Standard 1 Pack</span>
              </label>
              <label class="p-2.5 border rounded-xl flex items-center space-x-2 text-xs font-bold cursor-pointer border-gray-200">
                <input type="radio" name="martPack" value="Double">
                <span>Twin Value Pack</span>
              </label>
            </div>
          </div>

          <div class="p-2.5 bg-green-50 rounded-xl border border-green-200 flex items-center space-x-2 text-[11px] font-bold text-green-800">
            <span>❄️</span>
            <span>Cold-chain insulated packing guaranteed</span>
          </div>
        \`;
      } else {
        optionsContainer.innerHTML = \`
          <div>
            <span class="text-xs font-extrabold text-gray-900">Portion Size</span>
            <div class="grid grid-cols-2 gap-2 mt-1.5">
              <label class="p-2.5 border rounded-xl flex items-center space-x-2 text-xs font-bold cursor-pointer border-[#FFC727] bg-yellow-50/40">
                <input type="radio" name="portion" value="Regular" checked>
                <span>Regular (Included)</span>
              </label>
              <label class="p-2.5 border rounded-xl flex items-center space-x-2 text-xs font-bold cursor-pointer border-gray-200">
                <input type="radio" name="portion" value="Large">
                <span>Large (+$3.00)</span>
              </label>
            </div>
          </div>

          <div>
            <span class="text-xs font-extrabold text-gray-900">Spice Level</span>
            <div class="flex space-x-2 mt-1.5">
              <label class="flex-1 text-center p-2 border rounded-xl text-xs font-bold cursor-pointer border-gray-200">
                <input type="radio" name="spice" value="Mild" checked class="hidden">
                <span>Mild 🌶️</span>
              </label>
              <label class="flex-1 text-center p-2 border rounded-xl text-xs font-bold cursor-pointer border-[#FFC727] bg-yellow-50/40">
                <input type="radio" name="spice" value="Medium" class="hidden">
                <span>Medium 🌶️🌶️</span>
              </label>
              <label class="flex-1 text-center p-2 border rounded-xl text-xs font-bold cursor-pointer border-gray-200">
                <input type="radio" name="spice" value="Spicy" class="hidden">
                <span>Extra 🔥</span>
              </label>
            </div>
          </div>
        \`;
      }

      document.getElementById('customModal').classList.remove('hidden');
    }

    function closeCustomModal() {
      document.getElementById('customModal').classList.add('hidden');
    }

    function changeModalQty(delta) {
      modalQuantity = Math.max(1, modalQuantity + delta);
      document.getElementById('modalQtyDisplay').innerText = modalQuantity;
      if (activeModalItem) {
        document.getElementById('modalAddPrice').innerText = '$' + (activeModalItem.price * modalQuantity).toFixed(2);
      }
    }

    function confirmModalAddToCart() {
      if (!activeModalItem) return;
      const existing = cart.find(x => x.id === activeModalItem.id);
      if (existing) {
        existing.quantity += modalQuantity;
      } else {
        cart.push({ ...activeModalItem, quantity: modalQuantity, portion: 'Standard', spice: 'Standard' });
      }
      closeCustomModal();
      showToast('Added ' + modalQuantity + 'x ' + activeModalItem.name + ' to Bag', '🛍️');
      updateCartUI();
    }

    // Navigation Tabs
    function switchTab(tab) {
      currentTab = tab;
      
      // Views
      document.getElementById('viewHome').classList.add('hidden');
      document.getElementById('viewOrders').classList.add('hidden');
      document.getElementById('viewOffers').classList.add('hidden');
      document.getElementById('viewProfile').classList.add('hidden');

      // Dots
      document.getElementById('navDotHome').classList.add('hidden');
      document.getElementById('navDotOrders').classList.add('hidden');
      document.getElementById('navDotOffers').classList.add('hidden');
      document.getElementById('navDotProfile').classList.add('hidden');

      // Top title
      const title = document.getElementById('topHeaderTitle');

      if (tab === 'home') {
        document.getElementById('viewHome').classList.remove('hidden');
        document.getElementById('navDotHome').classList.remove('hidden');
        if (currentTypeFilter === 'meat') {
          title.innerText = 'Feedo Meat';
        } else if (currentTypeFilter === 'mart') {
          title.innerText = 'Feedo Mart';
        } else {
          title.innerText = 'Food Offer';
        }
      } else if (tab === 'orders') {
        document.getElementById('viewOrders').classList.remove('hidden');
        document.getElementById('navDotOrders').classList.remove('hidden');
        title.innerText = 'Track Orders';
      } else if (tab === 'offers') {
        document.getElementById('viewOffers').classList.remove('hidden');
        document.getElementById('navDotOffers').classList.remove('hidden');
        title.innerText = 'Food Offers';
      } else if (tab === 'profile') {
        document.getElementById('viewProfile').classList.remove('hidden');
        document.getElementById('navDotProfile').classList.remove('hidden');
        title.innerText = 'My Profile';
      }
    }

    function handleBackAction() {
      if (currentTab !== 'home') {
        switchTab('home');
      } else {
        showToast('You are on Home screen', '🏠');
      }
    }

    function focusSearch() {
      switchTab('home');
      const input = document.getElementById('searchInput');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth' });
      }
    }

    function toggleFilterDrawer() {
      showToast('Filters: Fast Delivery & Top Rated active', '⚡');
    }

    function showToast(msg, icon = '✨') {
      const toast = document.getElementById('toastNotification');
      document.getElementById('toastMessage').innerText = msg;
      document.getElementById('toastIcon').innerText = icon;
      toast.classList.remove('-translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.add('-translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 2500);
    }

    // Run on startup
    initApp();
  </script>
`;

// ==========================================
// 2. RESTAURANT APP (Port 8082)
// ==========================================
const restaurantHTML = `
  <div class="max-w-md mx-auto bg-gray-900 min-h-screen text-gray-100 shadow-xl border-x border-gray-800 flex flex-col">
    <div class="p-4 pt-10 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-extrabold text-white">Spice Junction</h2>
        <span class="text-xs text-gray-400">Kitchen Console • Indiranagar</span>
      </div>
      <span class="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">● ONLINE</span>
    </div>

    <div class="p-4 space-y-6 flex-1">
      <!-- Metrics Grid -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-800 p-4 rounded-2xl border-l-4 border-yellow-400">
          <span class="text-xs font-bold text-gray-400">PENDING ORDERS</span>
          <h3 class="text-2xl font-extrabold text-white mt-1">2</h3>
        </div>
        <div class="bg-gray-800 p-4 rounded-2xl border-l-4 border-blue-500">
          <span class="text-xs font-bold text-gray-400">TODAY'S REVENUE</span>
          <h3 class="text-2xl font-extrabold text-white mt-1">₹4,850</h3>
        </div>
      </div>

      <!-- Incoming Orders Feed -->
      <div>
        <h3 class="text-lg font-extrabold text-white mb-3">Incoming Kitchen Feed</h3>
        <div class="bg-gray-800 rounded-2xl p-4 border border-gray-700 space-y-3">
          <div class="flex justify-between items-center">
            <span class="font-extrabold text-yellow-400 text-lg">#CC-8821-492</span>
            <span class="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2 py-1 rounded-lg">PENDING</span>
          </div>
          <p class="text-xs text-gray-400">Customer: Alex Johnson (+91 9876543210)</p>
          <div class="py-2 border-y border-gray-700 space-y-1 text-sm">
            <div class="flex justify-between"><span>1x Hyderabadi Biryani</span><span>$22.50</span></div>
            <div class="flex justify-between"><span>1x Fresh Chicken Breast</span><span>$7.50</span></div>
          </div>
          <div class="flex space-x-2 pt-2">
            <button onclick="alert('Order Rejected!')" class="w-1/3 bg-red-950 text-red-400 font-bold py-2.5 rounded-xl text-xs">Reject</button>
            <button onclick="alert('Order Accepted! Status updated to preparing.')" class="w-2/3 bg-green-600 text-white font-bold py-2.5 rounded-xl text-xs">Accept Order ➔</button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// ==========================================
// 3. DELIVERY APP (Port 8083)
// ==========================================
const deliveryHTML = `
  <div class="max-w-md mx-auto bg-green-950 min-h-screen text-green-50 shadow-xl border-x border-green-900 flex flex-col">
    <div class="p-4 pt-10 bg-green-900 border-b border-green-800 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-extrabold text-white">Rahul Kumar</h2>
        <span class="text-xs text-green-300">CraveCart Delivery Champion</span>
      </div>
      <span class="bg-green-400 text-green-950 text-xs font-extrabold px-3 py-1 rounded-full">ON DUTY</span>
    </div>

    <div class="p-4 space-y-6 flex-1">
      <!-- Earnings -->
      <div class="bg-green-900 p-5 rounded-2xl border border-green-800 flex justify-between items-center">
        <div>
          <span class="text-xs font-bold text-green-400 tracking-wider">TODAY'S EARNINGS</span>
          <h3 class="text-3xl font-extrabold text-white mt-1">₹840.00</h3>
          <span class="text-xs text-green-300">7 Trips Delivered Today</span>
        </div>
        <span class="text-4xl">🚴</span>
      </div>

      <!-- Active Delivery Card -->
      <div>
        <h3 class="text-lg font-extrabold text-white mb-3">Active Delivery Task</h3>
        <div class="bg-green-900 rounded-2xl p-5 border-2 border-green-400 space-y-3">
          <div class="flex justify-between items-center">
            <span class="font-extrabold text-white text-lg">Order #CC-8821-492</span>
            <span class="bg-green-400 text-green-950 text-xs font-extrabold px-2.5 py-1 rounded-lg">PICKUP READY</span>
          </div>
          <div class="text-xs space-y-1 text-green-200">
            <p>🏪 <b>Feedo Central / Spice Junction</b> • 42 MG Road, Indiranagar</p>
            <p>📍 <b>Alex Johnson</b> • 108 100ft Road, Koramangala</p>
          </div>
          <div class="pt-3 border-t border-green-800 flex justify-between items-center">
            <span class="text-xs font-bold text-green-300">Est. Payout: ₹65.00</span>
            <button onclick="alert('Pickup Confirmed! Navigating to customer drop location.')" class="bg-green-400 text-green-950 font-extrabold text-xs px-4 py-2.5 rounded-xl">Confirm Pickup ➔</button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Start all local servers
createWebDevServer(8081, 'CraveCart Customer App', '#FFC727', 'customer', customerHTML);
const restaurantDistDir = path.join(__dirname, '..', 'apps', 'restaurant', 'dist');
if (fs.existsSync(path.join(restaurantDistDir, 'index.html'))) {
  createStaticSpaServer(8082, 'Feedo Restaurant Partner App (Integrated)', restaurantDistDir);
} else {
  createWebDevServer(8082, 'CraveCart Restaurant App', '#F59E0B', 'restaurant', restaurantHTML);
}
const deliveryDistDir = path.join(__dirname, '..', 'apps', 'delivery', 'dist');
if (fs.existsSync(path.join(deliveryDistDir, 'index.html'))) {
  createStaticSpaServer(8083, 'Feedo Delivery Partner App (Integrated)', deliveryDistDir);
} else {
  createWebDevServer(8083, 'CraveCart Delivery App', '#2ED573', 'delivery', deliveryHTML);
}

// ==========================================
// 4. ADMIN DASHBOARD & OPERATIONS (Port 8084)
// ==========================================
const adminHTML = `
  <div class="max-w-5xl mx-auto p-4 md:p-8 bg-gray-900 min-h-screen text-gray-100 rounded-3xl shadow-2xl border border-gray-800 my-4">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-800 gap-4">
      <div>
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-green-500 animate-pulse"></span>
          <h1 class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            CraveCart <span class="bg-yellow-400 text-gray-950 text-xs px-2.5 py-0.5 rounded-md font-extrabold uppercase">Platform Admin</span>
          </h1>
        </div>
        <p class="text-xs text-gray-400 mt-1">Enterprise Operations, Merchant Approvals, Financial Settlements & Security Audit</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="http://localhost:4000/api/v1/docs" target="_blank" class="text-xs font-bold bg-gray-800 hover:bg-gray-700 text-yellow-400 px-3 py-2 rounded-xl border border-gray-700 transition">Swagger / OpenAPI Docs ↗</a>
        <a href="http://localhost:4000/api/v1/health" target="_blank" class="text-xs font-bold bg-green-950 text-green-300 px-3 py-2 rounded-xl border border-green-800">Health: UP 200</a>
      </div>
    </div>

    <!-- KPI Summary Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      <div class="bg-gray-800 p-4 rounded-2xl border border-gray-700">
        <span class="text-xs text-gray-400 font-semibold uppercase">Total Platform GMV</span>
        <h3 class="text-2xl font-black text-white mt-1">₹1,85,000</h3>
        <span class="text-xs text-green-400 font-bold">↑ +18.4% this week</span>
      </div>
      <div class="bg-gray-800 p-4 rounded-2xl border border-gray-700">
        <span class="text-xs text-gray-400 font-semibold uppercase">Commission Earned (15%)</span>
        <h3 class="text-2xl font-black text-yellow-400 mt-1">₹27,750</h3>
        <span class="text-xs text-yellow-500 font-bold">Net platform revenue</span>
      </div>
      <div class="bg-gray-800 p-4 rounded-2xl border border-gray-700">
        <span class="text-xs text-gray-400 font-semibold uppercase">Active Fleet</span>
        <h3 class="text-2xl font-black text-white mt-1">4 Riders Online</h3>
        <span class="text-xs text-green-400 font-bold">Avg ETA: 24 mins</span>
      </div>
      <div class="bg-gray-800 p-4 rounded-2xl border border-gray-700">
        <span class="text-xs text-gray-400 font-semibold uppercase">Pending Approvals</span>
        <h3 class="text-2xl font-black text-red-400 mt-1" id="pending-count-badge">1 Merchant</h3>
        <span class="text-xs text-gray-400">Requires FSSAI check</span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-gray-800 space-x-2 text-sm font-bold overflow-x-auto hide-scrollbar mb-6" id="admin-tabs">
      <button onclick="switchAdminTab('approvals')" id="tab-btn-approvals" class="px-4 py-2.5 border-b-2 border-yellow-400 text-yellow-400 transition whitespace-nowrap">Restaurant Approvals <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">1</span></button>
      <button onclick="switchAdminTab('orders')" id="tab-btn-orders" class="px-4 py-2.5 text-gray-400 hover:text-white transition whitespace-nowrap">Live Order Command Center</button>
      <button onclick="switchAdminTab('settlements')" id="tab-btn-settlements" class="px-4 py-2.5 text-gray-400 hover:text-white transition whitespace-nowrap">Settlements & Ledger</button>
      <button onclick="switchAdminTab('audit')" id="tab-btn-audit" class="px-4 py-2.5 text-gray-400 hover:text-white transition whitespace-nowrap">Security Audit Trail</button>
    </div>

    <!-- Tab 1: Restaurant Approvals -->
    <div id="tab-approvals" class="space-y-4">
      <div class="bg-gray-800 p-5 rounded-2xl border border-gray-700" id="approval-card-royal">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-black text-white">Royal Sushi Bar</h3>
              <span class="bg-yellow-500 text-gray-950 text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase">Pending Review</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">📍 5th Block, HSR Layout, Bengaluru • Cuisine: Japanese / Sushi</p>
            <div class="mt-3 flex flex-wrap gap-2 text-xs">
              <span class="bg-gray-900 px-3 py-1 rounded-lg text-gray-300 border border-gray-700">FSSAI License: <b>#21221190000451</b></span>
              <span class="bg-gray-900 px-3 py-1 rounded-lg text-gray-300 border border-gray-700">Bank IFSC: <b>HDFC0001234</b></span>
              <span class="bg-gray-900 px-3 py-1 rounded-lg text-gray-300 border border-gray-700">Owner: <b>Chef Kenji Sato (+919876543290)</b></span>
            </div>
          </div>
          <div class="flex gap-2 w-full md:w-auto">
            <button onclick="rejectMerchant()" class="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800 transition">Reject</button>
            <button onclick="approveMerchant()" class="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-xs font-black transition">Approve & Make Live ➔</button>
          </div>
        </div>
      </div>
      <div id="approved-banner" class="hidden bg-green-950 p-4 rounded-2xl border border-green-800 text-green-300 text-xs font-bold flex items-center justify-between">
        <span>✅ Royal Sushi Bar was successfully approved and added to live customer discovery catalog!</span>
        <span class="bg-green-800 text-white px-2.5 py-1 rounded-md text-xs">Active in DB</span>
      </div>
    </div>

    <!-- Tab 2: Live Orders -->
    <div id="tab-orders" class="hidden space-y-4">
      <div class="bg-gray-800 p-5 rounded-2xl border border-gray-700">
        <div class="flex justify-between items-center pb-3 border-b border-gray-700">
          <div>
            <span class="text-xs font-bold text-yellow-400 tracking-wider">ORDER #CC-8821-492</span>
            <h4 class="text-base font-black text-white mt-0.5">Feedo Central / Spice Junction</h4>
          </div>
          <span id="order-status-badge" class="bg-yellow-400 text-gray-950 text-xs font-black px-3 py-1 rounded-full uppercase">READY_FOR_PICKUP</span>
        </div>
        <div class="py-3 text-xs space-y-1.5 text-gray-300">
          <p>👤 <b>Customer:</b> Alex Johnson • 108 Koramangala 4th Block</p>
          <p>🚴 <b>Assigned Rider:</b> Rahul Kumar (Electric Scooter, Rating 4.85)</p>
          <p>🍲 <b>Items:</b> 2x Hyderabadi Dum Biryani, 2x Orange Blossom Juice</p>
          <p>💰 <b>Financials:</b> Subtotal: ₹656.00 | Discount: ₹100.00 (WELCOME50) | Total: ₹598.80 (Paid via Razorpay)</p>
        </div>
        <div class="pt-3 border-t border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <span class="text-xs text-gray-400">Emergency Override:</span>
          <div class="flex gap-2 w-full md:w-auto">
            <select id="override-select" class="bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white">
              <option value="PICKED_UP">Advance to PICKED_UP</option>
              <option value="OUT_FOR_DELIVERY">Advance to OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">Force Complete DELIVERED</option>
              <option value="CANCELLED">Cancel & Trigger Full Refund</option>
            </select>
            <button onclick="applyOverride()" class="bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition">Apply</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: Settlements & Ledger -->
    <div id="tab-settlements" class="hidden space-y-4">
      <div class="bg-gray-800 p-5 rounded-2xl border border-gray-700 overflow-x-auto">
        <h3 class="text-sm font-black text-white mb-3">Merchant Commission & Payout Ledger</h3>
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-700 text-gray-400 uppercase font-bold">
              <th class="pb-2">Merchant Name</th>
              <th class="pb-2">Gross Sales</th>
              <th class="pb-2">Commission (15%)</th>
              <th class="pb-2">Net Payout</th>
              <th class="pb-2">Status</th>
              <th class="pb-2">UTR Reference</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700 text-gray-200">
            <tr>
              <td class="py-2.5 font-bold">Feedo Central / Spice Junction</td>
              <td class="py-2.5">₹18,500.00</td>
              <td class="py-2.5 text-yellow-400 font-bold">₹2,775.00</td>
              <td class="py-2.5 font-black text-white">₹15,725.00</td>
              <td class="py-2.5"><span class="bg-green-950 text-green-300 px-2 py-0.5 rounded font-bold">SETTLED</span></td>
              <td class="py-2.5 font-mono text-gray-400">UTR-HDFC-99201481</td>
            </tr>
            <tr>
              <td class="py-2.5 font-bold">The Burger Republic</td>
              <td class="py-2.5">₹9,450.00</td>
              <td class="py-2.5 text-yellow-400 font-bold">₹1,701.00</td>
              <td class="py-2.5 font-black text-white">₹7,749.00</td>
              <td class="py-2.5"><span id="burger-settle-status" class="bg-yellow-950 text-yellow-300 px-2 py-0.5 rounded font-bold">PENDING</span></td>
              <td class="py-2.5 font-mono text-gray-400" id="burger-utr"><button onclick="settleMerchant()" class="bg-yellow-400 text-gray-950 font-black px-2.5 py-1 rounded-lg">Trigger Payout ➔</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 4: Security Audit Trail -->
    <div id="tab-audit" class="hidden space-y-4">
      <div class="bg-gray-800 p-5 rounded-2xl border border-gray-700 overflow-x-auto">
        <h3 class="text-sm font-black text-white mb-3">Cryptographic Security & System Audit Trail</h3>
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-700 text-gray-400 uppercase font-bold">
              <th class="pb-2">Timestamp</th>
              <th class="pb-2">Actor</th>
              <th class="pb-2">Action</th>
              <th class="pb-2">Target</th>
              <th class="pb-2">IP Address</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700 text-gray-300 font-mono" id="audit-table-body">
            <tr>
              <td class="py-2 text-gray-400">2026-11-04 15:30:12</td>
              <td class="py-2">usr-admin-01</td>
              <td class="py-2 text-green-400 font-bold">APPROVE_RESTAURANT</td>
              <td class="py-2">res-feedo-central</td>
              <td class="py-2">127.0.0.1</td>
            </tr>
            <tr>
              <td class="py-2 text-gray-400">2026-11-04 15:28:45</td>
              <td class="py-2">SYSTEM_WEBHOOK</td>
              <td class="py-2 text-yellow-400 font-bold">PAYMENT_CAPTURED</td>
              <td class="py-2">pay_99201481</td>
              <td class="py-2">52.74.201.88</td>
            </tr>
            <tr>
              <td class="py-2 text-gray-400">2026-11-04 15:25:01</td>
              <td class="py-2">usr-customer-01</td>
              <td class="py-2 text-blue-400 font-bold">AUTH_LOGIN_JWT</td>
              <td class="py-2">customer@cravecart.in</td>
              <td class="py-2">127.0.0.1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    function switchAdminTab(tabName) {
      ['approvals', 'orders', 'settlements', 'audit'].forEach(t => {
        const el = document.getElementById('tab-' + t);
        const btn = document.getElementById('tab-btn-' + t);
        if (t === tabName) {
          el.classList.remove('hidden');
          btn.className = 'px-4 py-2.5 border-b-2 border-yellow-400 text-yellow-400 transition whitespace-nowrap';
        } else {
          el.classList.add('hidden');
          btn.className = 'px-4 py-2.5 text-gray-400 hover:text-white transition whitespace-nowrap';
        }
      });
    }

    function approveMerchant() {
      document.getElementById('approval-card-royal').classList.add('opacity-50');
      document.getElementById('approved-banner').classList.remove('hidden');
      document.getElementById('pending-count-badge').innerText = '0 Merchants';
      document.getElementById('pending-count-badge').className = 'text-2xl font-black text-green-400 mt-1';
      alert('Royal Sushi Bar has been verified and approved!');
    }

    function rejectMerchant() {
      alert('Restaurant registration marked as rejected with feedback sent to owner.');
      document.getElementById('approval-card-royal').style.display = 'none';
      document.getElementById('pending-count-badge').innerText = '0 Merchants';
    }

    function applyOverride() {
      const selected = document.getElementById('override-select').value;
      const badge = document.getElementById('order-status-badge');
      badge.innerText = selected;
      if (selected === 'CANCELLED') {
        badge.className = 'bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase';
      } else if (selected === 'DELIVERED') {
        badge.className = 'bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase';
      } else {
        badge.className = 'bg-yellow-400 text-gray-950 text-xs font-black px-3 py-1 rounded-full uppercase';
      }
      alert('Order status successfully overridden to: ' + selected);
    }

    function settleMerchant() {
      document.getElementById('burger-settle-status').innerText = 'SETTLED';
      document.getElementById('burger-settle-status').className = 'bg-green-950 text-green-300 px-2 py-0.5 rounded font-bold';
      document.getElementById('burger-utr').innerText = 'UTR-AXIS-' + Date.now().toString().slice(-8);
      alert('Settlement of ₹7,749.00 dispatched via IMPS/NEFT successfully!');
    }
  </script>
`;

const adminHtmlPath = path.resolve(__dirname, '../apps/admin/index.html');
const finalAdminHTML = fs.existsSync(adminHtmlPath) ? fs.readFileSync(adminHtmlPath, 'utf8') : adminHTML;

createWebDevServer(8084, 'Feedo Gold Admin Dashboard', '#D4AF37', 'admin', finalAdminHTML);

// ==========================================
// 5. CORE BACKEND API SERVER (Port 4000)
// ==========================================
const skipLegacyApi = process.env.SKIP_LEGACY_API === 'true' || process.argv.includes('--web-only');
let apiServer = null;

if (!skipLegacyApi) {
  try {
    const { createApiServer } = require('../apps/backend/src/server');
    apiServer = createApiServer();
    apiServer.listen(4000, HOST, () => {
      console.log(`[API] CraveCart REST API live at http://${HOST}:4000/api/v1`);
      console.log(`[API] Swagger / OpenAPI Docs live at http://${HOST}:4000/api/v1/docs`);
      console.log(`[ADMIN] Admin Dashboard live at http://${HOST}:8084`);
    });
  } catch (err) {
    console.warn(`[API] Legacy API server skipped or failed to bind: ${err.message}`);
  }
} else {
  console.log(`[WEB] Running in web-portals only mode. Port 4000 reserved for NestJS Enterprise API.`);
}

// Graceful container shutdown
const gracefulShutdown = () => {
  console.log('[CraveCart] Shutting down container services gracefully...');
  if (apiServer) {
    apiServer.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
  setTimeout(() => process.exit(0), 5000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
