/* SGDC Market Core — v1.2 (Bits adapter + slower ticks) */
window.Market = (function(){
  // ---------- Meta (10 coins) ----------
  const meta = {
    SNK:{name:"Snacko",ui:{color:"#FFB84D",icon:"🍪"},tagline:"Alles uit de kantine in één mandje.",behavior:"Lichte stijging rond pauzes; zakt na schooltijd.",volatility:"laag-middel"},
    FRIK:{name:"Frikandelium",ui:{color:"#FF6B3D",icon:"🌭"},tagline:"Knettervolatiel als de frituur aanslaat.",behavior:"Spikes tussen 10:30–11:00 en 12:30–13:30.",volatility:"hoog"},
    COKE:{name:"ColaCap",ui:{color:"#D23B3B",icon:"🥤"},tagline:"Bruisende koers, soms teveel bubbels.",behavior:"Microrally’s om het halve uur; random dips.",volatility:"middel-hoog"},
    BBIT:{name:"Bitterbit",ui:{color:"#E87B2E",icon:"🟤"},tagline:"Krokant rendement of verbrand je vingers.",behavior:"Range-bound met af en toe snelle knal.",volatility:"middel"},
    HWK:{name:"HwCoin",ui:{color:"#8A9BB6",icon:"📚"},tagline:"Altijd een beetje bearish… tenzij studiedag.",behavior:"Langzame daling; +boost op studiedagen.",volatility:"laag"},
    TCH:{name:"TeachToken",ui:{color:"#6EC77A",icon:"👩‍🏫"},tagline:"Gaat omhoog bij proefwerken & presentaties.",behavior:"Klimt op toetsdagen, corrigeert daarna.",volatility:"middel"},
    WIFI:{name:"LaggyFi",ui:{color:"#4DB6E6",icon:"📶"},tagline:"Soms maan, soms modem uit 2003.",behavior:"Onvoorspelbare gaps (af en toe freeze tick).",volatility:"hoog"},
    CHAIR:{name:"ChairChain",ui:{color:"#C9A06B",icon:"🪑"},tagline:"Elke kraak is een kans.",behavior:"Zakt bij incidenten; mean-revert langzaam.",volatility:"laag-middel"},
    CHZB:{name:"CheezeBread",ui:{color:"#FFC94D",icon:"🧀"},tagline:"Simpel, zout, verrassend steady.",behavior:"Zeer stabiel; kleine intraday swing.",volatility:"laag"},
    PPLX:{name:"PartyPlex",ui:{color:"#B86BFF",icon:"🎉"},tagline:"Explodeert voor feesten, implodeert erna.",behavior:"Harde run-ups vóór events, dump na afloop.",volatility:"zeer hoog"},
  };

  // ---------- Storage + Bits adapter ----------
  const LS={ get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}}, set(k,v){localStorage.setItem(k,JSON.stringify(v))} };
  const bitsKey='bitsBalance', assetsKey='market.assets', portfolioKey='portfolio', histPrefix='market.history.';

  // If your app exposes window.Bits with {get,set,onChange}, use that. Else fallback to localStorage.
  const bits = (function(){
    const has = typeof window !== 'undefined' && window.Bits && typeof window.Bits.get==='function' && typeof window.Bits.set==='function';
    const api = {
      get(){ return has ? Math.floor(window.Bits.get()) : (parseInt(localStorage.getItem(bitsKey)||'0',10) || 0); },
      set(v){
        const nv = Math.max(0, Math.floor(v));
        if(has){ window.Bits.set(nv); }
        else { localStorage.setItem(bitsKey, String(nv)); }
        // notify listeners
        listeners.forEach(fn=>{ try{ fn(nv); }catch{} });
      },
      onChange(fn){
        listeners.push(fn);
        if(has && typeof window.Bits.onChange==='function'){ window.Bits.onChange(fn); }
      }
    };
    const listeners = [];
    return api;
  })();

  // ---------- Assets ----------
  let assets={}; const fee=0.005;
  const symbols=()=>Object.keys(meta);

  function seedHistoryArray(startPrice, vol, anchor){
    const N=2000; const data=new Array(N); let p=startPrice;
    for(let i=0;i<N;i++){
      const r=(Math.random()*2-1)*(vol*0.9); const theta=0.02;
      p=p*(1+r)+theta*(anchor-p);
      const hour=i%720; if(hour>330&&hour<390) p*=1.0004; if(hour>650&&hour<720) p*=0.9996; // subtiel
      p=Math.max(1,+p.toFixed(2)); data[i]=p;
    }
    return data;
  }
  const setHistory=(sym,arr)=>LS.set(histPrefix+sym,arr);
  function pushHistory(sym, price){
    const key=histPrefix+sym; const arr=LS.get(key,[]); arr.push(+price.toFixed(2)); if(arr.length>3000) arr.shift(); LS.set(key,arr);
  }
  const history=(sym)=>LS.get(histPrefix+sym,[]);

  function initAssets(force=false){
    const existing=LS.get(assetsKey,null);
    if(existing && !force){ assets=existing; // ensure all coins exist
      symbols().forEach(sym=>{ if(!assets[sym]){ const p=50+Math.random()*100; assets[sym]={price:+p.toFixed(2),anchor:+p.toFixed(2),vol:.008,yClose:+p.toFixed(2)}; } });
      LS.set(assetsKey,assets); return;
    }
    const seeded={}; const seedStart={SNK:95,FRIK:42,COKE:60,BBIT:33,HWK:21,TCH:78,WIFI:54,CHAIR:18,CHZB:12,PPLX:140};
    const volMap={SNK:.006,FRIK:.010,COKE:.009,BBIT:.007,HWK:.004,TCH:.008,WIFI:.012,CHAIR:.005,CHZB:.003,PPLX:.015}; // iets rustiger
    symbols().forEach(sym=>{
      const p0=seedStart[sym]??50; const anchor=p0; const vol=volMap[sym]||.007;
      const yClose=+(p0*(1+(Math.random()*2-1)*0.02)).toFixed(2);
      setHistory(sym, seedHistoryArray(p0,vol,anchor));
      seeded[sym]={price:p0,anchor,vol,yClose};
    });
    assets=seeded; LS.set(assetsKey,assets);
  }

  // ---------- Index ----------
  function indexNowY(){
    const syms=symbols(); const now=syms.reduce((s,k)=>s+assets[k].price,0)/syms.length; const y=syms.reduce((s,k)=>s+assets[k].yClose,0)/syms.length; return {now,y};
  }

  // ---------- Portfolio ----------
  function getPortfolio(){ return LS.get(portfolioKey,{}); }
  function setPortfolio(p){ LS.set(portfolioKey,p); }
  function portfolioValue(){
    const p=getPortfolio(); let sum=0; for(const [sym,pos] of Object.entries(p)){ if(!assets[sym]) continue; sum += pos.qty*assets[sym].price; } return Math.floor(sum);
  }

  // ---------- Orders ----------
  function buy(sym, qty){
    qty=Math.floor(qty); if(qty<=0) return {ok:false,msg:'Ongeldige hoeveelheid.'};
    const a=assets[sym]; if(!a) return {ok:false,msg:'Onbekend asset.'};
    const cost=Math.ceil(qty*a.price*(1+fee)); if(bits.get()<cost) return {ok:false,msg:'Onvoldoende Bits.'};
    bits.set(bits.get()-cost);
    const p=getPortfolio(); const pos=p[sym]||{qty:0,avg:0}; const newQty=pos.qty+qty; const newAvg=(pos.qty*pos.avg+qty*a.price)/newQty;
    p[sym]={qty:newQty,avg:+newAvg.toFixed(2)}; setPortfolio(p);
    return {ok:true,msg:`Kocht ${qty} ${sym} @ ₿${a.price.toFixed(2)} (fee ${(fee*100).toFixed(2)}%)`};
  }
  function sell(sym, qty){
    qty=Math.floor(qty); if(qty<=0) return {ok:false,msg:'Ongeldige hoeveelheid.'};
    const a=assets[sym]; if(!a) return {ok:false,msg:'Onbekend asset.'};
    const p=getPortfolio(); const pos=p[sym]; if(!pos||pos.qty<qty) return {ok:false,msg:'Niet genoeg positie.'};
    const proceeds=Math.floor(qty*a.price*(1-fee)); bits.set(bits.get()+proceeds);
    const newQty=pos.qty-qty; if(newQty<=0) delete p[sym]; else p[sym]={qty:newQty,avg:pos.avg}; setPortfolio(p);
    const pl=(a.price-pos.avg)*qty-(qty*a.price*fee); return {ok:true,msg:`Verkocht ${qty} ${sym} @ ₿${a.price.toFixed(2)} (P/L ${pl>=0?'+':''}${pl.toFixed(2)})`};
  }
  function swap(fromSym,toSym,qty){
    if(fromSym===toSym) return {ok:false,msg:'Zelfde asset.'};
    const s1=sell(fromSym,qty); if(!s1.ok) return s1;
    const a=assets[toSym]; const buyable=Math.floor(bits.get()/(a.price*(1+fee)));
    if(buyable<=0) return {ok:true,msg:`Verkocht ${qty} ${fromSym}. Niet genoeg Bits om ${toSym} te kopen na fees.`};
    buy(toSym,buyable); return {ok:true,msg:`Swap: -${qty} ${fromSym}, +${buyable} ${toSym}.`};
  }

  // ---------- Simulation (slower) ----------
  function tickOne(sym){
    const a=assets[sym]; const r=(Math.random()*2-1)*a.vol; const theta=0.02;
    let p=a.price*(1+r)+theta*(a.anchor-a.price);
    const now=new Date(); const tmin=now.getHours()*60+now.getMinutes();
    if(sym==='SNK'||sym==='FRIK'){ if((tmin>=630&&tmin<=660)||(tmin>=750&&tmin<=780)) p*=1.0015; } // kleinere boost
    if(sym==='PPLX'){ if(Math.random()<0.01) p*=1.008; if(Math.random()<0.01) p*=0.992; }
    if(sym==='WIFI'){ if(Math.random()<0.015) return; if(Math.random()<0.008) p*=(Math.random()<0.5?0.985:1.015); }
    a.price=Math.max(1,+p.toFixed(2)); pushHistory(sym,a.price);
  }
  function tickAll(){ for(const sym of symbols()) tickOne(sym); LS.set(assetsKey,assets); }

  // ---------- Public ----------
  function init(){
    if(!localStorage.getItem(bitsKey) && !(window.Bits && typeof window.Bits.get==='function')) bits.set(1000);
    initAssets();
    symbols().forEach(sym=>{ if(!history(sym).length){ const a=assets[sym]; setHistory(sym,seedHistoryArray(a.price,a.vol,a.anchor)); }});
  }

  return { meta, get assets(){return assets}, symbols, bits, fee, init, tickAll, history, indexNowY, portfolio:getPortfolio, portfolioValue, buy, sell, swap };
})();
