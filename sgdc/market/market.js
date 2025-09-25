/*  SGDC Market Core — v1.1
    - Assets & meta
    - Bits helpers
    - Portfolio + orders (buy/sell/swap)
    - Price simulation + seeded history
    - Market index (% vs yesterday)
*/
window.Market = (function(){
  // ----- Coin meta (10 stuks) -----
  const meta = {
    SNK:  { name:"Snacko",      ui:{color:"#FFB84D",icon:"🍪"}, tagline:"Alles uit de kantine in één mandje.", behavior:"Lichte stijging rond pauzes; zakt na schooltijd.", volatility:"laag-middel" },
    FRIK: { name:"Frikandelium",ui:{color:"#FF6B3D",icon:"🌭"}, tagline:"Knettervolatiel als de frituur aanslaat.", behavior:"Spikes tussen 10:30–11:00 en 12:30–13:30.", volatility:"hoog" },
    COKE: { name:"ColaCap",     ui:{color:"#D23B3B",icon:"🥤"}, tagline:"Bruisende koers, soms teveel bubbels.", behavior:"Microrally’s om het halve uur; random dips.", volatility:"middel-hoog" },
    BBIT: { name:"Bitterbit",   ui:{color:"#E87B2E",icon:"🟤"}, tagline:"Krokant rendement of verbrand je vingers.", behavior:"Range-bound met af en toe snelle knal.", volatility:"middel" },
    HWK:  { name:"HwCoin",      ui:{color:"#8A9BB6",icon:"📚"}, tagline:"Altijd een beetje bearish… tenzij studiedag.", behavior:"Langzame daling; +boost op studiedagen.", volatility:"laag" },
    TCH:  { name:"TeachToken",  ui:{color:"#6EC77A",icon:"👩‍🏫"}, tagline:"Gaat omhoog bij proefwerken & presentaties.", behavior:"Klimt op toetsdagen, corrigeert daarna.", volatility:"middel" },
    WIFI: { name:"LaggyFi",     ui:{color:"#4DB6E6",icon:"📶"}, tagline:"Soms maan, soms modem uit 2003.", behavior:"Onvoorspelbare gaps (af en toe freeze tick).", volatility:"hoog" },
    CHAIR:{ name:"ChairChain",  ui:{color:"#C9A06B",icon:"🪑"}, tagline:"Elke kraak is een kans.", behavior:"Zakt bij incidenten; mean-revert langzaam.", volatility:"laag-middel" },
    CHZB: { name:"CheezeBread", ui:{color:"#FFC94D",icon:"🧀"}, tagline:"Simpel, zout, verrassend steady.", behavior:"Zeer stabiel; kleine intraday swing.", volatility:"laag" },
    PPLX: { name:"PartyPlex",   ui:{color:"#B86BFF",icon:"🎉"}, tagline:"Explodeert voor feesten, implodeert erna.", behavior:"Harde run-ups vóór events, dump na afloop.", volatility:"zeer hoog" },
  };

  // ----- Storage helpers -----
  const LS = {
    get(k, d){ try{ const v = localStorage.getItem(k); return v? JSON.parse(v) : d; }catch{ return d; } },
    set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  };
  const bitsKey = 'bitsBalance';
  const assetsKey = 'market.assets';
  const portfolioKey = 'portfolio';
  const histPrefix = 'market.history.'; // +SYM -> array of numbers

  // ----- Bits -----
  const bits = {
    get(){ const v = parseInt(localStorage.getItem(bitsKey)||'0',10); return isNaN(v)?0:v; },
    set(v){ localStorage.setItem(bitsKey, String(Math.max(0, Math.floor(v)))); if(window.Bits?.onChange){ window.Bits.onChange(()=>{}) } }
  };

  // ----- Assets state -----
  let assets = {}; // {SYM:{price, anchor, vol, yClose}}
  function symbols(){ return Object.keys(meta); }

  // create a nice long seeded history for charts (about ~2000 ticks)
  function seedHistoryArray(startPrice, vol, anchor){
    const N = 2000;              // ~ long-term series (covers 'all')
    const data = new Array(N);
    let p = startPrice;
    for(let i=0;i<N;i++){
      // base random walk + mean reversion
      const r = (Math.random()*2-1) * (vol*0.9); // slightly softer during seed
      const theta = 0.02;
      p = p * (1 + r) + theta*(anchor - p);

      // gentle thematic nudges so het lijkt “echt”
      const hour = i % 720; // pseudo "minute of trading day"
      // small midday uptick
      if(hour>330 && hour<390) p *= 1.0006;
      // end-of-day fade
      if(hour>650 && hour<720) p *= 0.9996;

      // clamp and round
      p = Math.max(1, +p.toFixed(2));
      data[i] = p;
    }
    return data;
  }

  function setHistory(sym, arr){ LS.set(histPrefix+sym, arr); }
  function pushHistory(sym, price){
    const key = histPrefix+sym;
    const arr = LS.get(key, []);
    arr.push(+price.toFixed(2));
    if(arr.length>3000) arr.shift();
    LS.set(key, arr);
  }
  function history(sym){ return LS.get(histPrefix+sym, []); }

  function initAssets(force=false){
    const existing = LS.get(assetsKey, null);
    if(existing && !force){
      assets = existing;
      // ensure all known symbols exist; if not, (re)seed them
      for(const sym of symbols()){
        if(!assets[sym]){
          const seedPrice = 50 + Math.random()*100;
          const vol = .008;
          assets[sym] = {price:+seedPrice.toFixed(2), anchor:+seedPrice.toFixed(2), vol, yClose:+seedPrice.toFixed(2)};
        }
      }
      LS.set(assetsKey, assets);
      return;
    }
    // Fresh seed
    const seeded = {};
    const seedStart = { SNK:95, FRIK:42, COKE:60, BBIT:33, HWK:21, TCH:78, WIFI:54, CHAIR:18, CHZB:12, PPLX:140 };
    const volMap =  { SNK:.007, FRIK:.012, COKE:.010, BBIT:.008, HWK:.005, TCH:.009, WIFI:.014, CHAIR:.006, CHZB:.004, PPLX:.018 };
    symbols().forEach(sym=>{
      const p0 = seedStart[sym] ?? 50;
      const anchor = p0;
      const vol = volMap[sym] || .008;

      // “gisteren” iets anders, zodat % vandaag zinnig is
      const yClose = +(p0*(1 + (Math.random()*2-1)*0.02)).toFixed(2);

      // maak uitgebreide geschiedenis die eindigt bij p0
      const hist = seedHistoryArray(p0, vol, anchor);
      setHistory(sym, hist);

      seeded[sym] = { price:p0, anchor, vol, yClose };
    });
    assets = seeded;
    LS.set(assetsKey, assets);
  }

  // ----- Market Index (now vs yesterday) -----
  function indexNowY(){
    const syms = symbols();
    const now = syms.reduce((s, k)=> s + assets[k].price, 0) / syms.length;
    const y   = syms.reduce((s, k)=> s + assets[k].yClose, 0) / syms.length;
    return {now, y};
  }

  // ----- Portfolio -----
  function getPortfolio(){ return LS.get(portfolioKey, {}); }
  function setPortfolio(p){ LS.set(portfolioKey, p); }
  function portfolioValue(){
    const p = getPortfolio();
    let sum = 0;
    for(const [sym,pos] of Object.entries(p)){
      if(!assets[sym]) continue;
      sum += pos.qty * assets[sym].price;
    }
    return Math.floor(sum);
  }

  // ----- Orders -----
  const fee = 0.005; // 0.5%

  function buy(sym, qty){
    qty = Math.floor(qty);
    if(qty<=0) return {ok:false, msg:'Ongeldige hoeveelheid.'};
    const a = assets[sym]; if(!a) return {ok:false, msg:'Onbekend asset.'};
    const cost = Math.ceil(qty * a.price * (1 + fee));
    if(bits.get() < cost) return {ok:false, msg:'Onvoldoende Bits.'};
    bits.set(bits.get() - cost);

    const p = getPortfolio();
    const pos = p[sym] || {qty:0, avg:0};
    const newQty = pos.qty + qty;
    const newAvg = (pos.qty*pos.avg + qty*a.price) / newQty;
    p[sym] = {qty:newQty, avg:+newAvg.toFixed(2)};
    setPortfolio(p);

    return {ok:true, msg:`Kocht ${qty} ${sym} @ ₿${a.price.toFixed(2)} (fee ${(fee*100).toFixed(2)}%)`};
  }

  function sell(sym, qty){
    qty = Math.floor(qty);
    if(qty<=0) return {ok:false, msg:'Ongeldige hoeveelheid.'};
    const a = assets[sym]; if(!a) return {ok:false, msg:'Onbekend asset.'};
    const p = getPortfolio();
    const pos = p[sym]; if(!pos || pos.qty<qty) return {ok:false, msg:'Niet genoeg positie.'};

    const proceeds = Math.floor(qty * a.price * (1 - fee));
    bits.set(bits.get() + proceeds);

    const newQty = pos.qty - qty;
    if(newQty<=0) delete p[sym];
    else p[sym] = {qty:newQty, avg:pos.avg};
    setPortfolio(p);

    const pl = (a.price - pos.avg) * qty - (qty*a.price*fee); // fee ruw
    return {ok:true, msg:`Verkocht ${qty} ${sym} @ ₿${a.price.toFixed(2)} (P/L ${pl>=0?'+':''}${pl.toFixed(2)})`};
  }

  function swap(fromSym, toSym, qty){
    if(fromSym===toSym) return {ok:false, msg:'Zelfde asset.'};
    const s1 = sell(fromSym, qty);
    if(!s1.ok) return s1;
    const a = assets[toSym];
    const buyable = Math.floor(bits.get() / (a.price*(1+fee)));
    if(buyable<=0) return {ok:true, msg:`Verkocht ${qty} ${fromSym}. Niet genoeg Bits om ${toSym} te kopen na fees.`};
    const s2 = buy(toSym, buyable);
    return {ok:true, msg:`Swap: -${qty} ${fromSym}, +${buyable} ${toSym}.`};
  }

  // ----- Simulation tick -----
  function tickOne(sym){
    const a = assets[sym];
    // base random walk
    const r = (Math.random()*2-1) * a.vol;
    const theta = 0.02;
    let p = a.price * (1 + r) + theta*(a.anchor - a.price);

    // thematische impulsen
    const now = new Date();
    const tmin = now.getHours()*60 + now.getMinutes();

    if(sym==='SNK' || sym==='FRIK'){ // pauzes boost
      if((tmin>=630 && tmin<=660) || (tmin>=750 && tmin<=780)) p *= 1.002;
    }
    if(sym==='PPLX'){ // random event-drift
      if(Math.random()<0.02) p *= 1.01;
      if(Math.random()<0.02) p *= 0.99;
    }
    if(sym==='WIFI'){ // af en toe freeze/gap
      if(Math.random()<0.02) return; // freeze tick
      if(Math.random()<0.01) p *= (Math.random()<0.5?0.98:1.02);
    }

    a.price = Math.max(1, +p.toFixed(2));
    pushHistory(sym, a.price);
  }

  function tickAll(){
    for(const sym of symbols()) tickOne(sym);
    LS.set(assetsKey, assets);
  }

  // ----- Public API -----
  function init(){
    // Bits default seed
    if(!localStorage.getItem(bitsKey)) bits.set(1000);
    // Assets & history
    initAssets();
    // Ensure histories exist (older installs fallback)
    symbols().forEach(sym=>{
      const h = history(sym);
      if(!h.length){
        const a = assets[sym];
        setHistory(sym, seedHistoryArray(a.price, a.vol, a.anchor));
      }
    });
  }

  return {
    meta,
    get assets(){ return assets; },
    symbols,
    bits,
    fee,
    init,
    tickAll,
    history,
    indexNowY,
    portfolio: getPortfolio,
    portfolioValue,
    buy,
    sell,
    swap
  };
})();
