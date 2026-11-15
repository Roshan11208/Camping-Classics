(() => {
  const id='G-FJWTZ4NWHB',name='__Host-cc-analytics',panel=document.getElementById('cookiesPanel'),settings=document.getElementById('cookiesOpen');
  const read=()=>document.cookie.split('; ').find(c=>c.startsWith(name+'='))?.split('=')[1];
  let loaded=false;
  function enable(){
    if(loaded)return; loaded=true;
    window['ga-disable-'+id]=false;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    window.gtag('config',id,{cookie_domain:'none',cookie_flags:'SameSite=Lax;Secure',allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+location.pathname,page_referrer:''});
    const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(tag);
  }
  function clean(){
    for(const part of document.cookie.split('; ')){
      const key=part.split('=')[0];if(!/^_ga(?:_|$)/.test(key))continue;
      for(const domain of ['', '; Domain='+location.hostname])document.cookie=key+'=; Max-Age=0; Path=/; Secure; SameSite=Lax'+domain;
    }
  }
  const previous=read();if(previous==='yes')enable();else clean();
  panel.hidden=previous==='yes'||previous==='no';
  settings.onclick=()=>{panel.hidden=false;document.getElementById('cookiesNo').focus();};
  function choose(yes){
    document.cookie=name+'='+(yes?'yes':'no')+'; Path=/; Max-Age=15552000; SameSite=Lax; Secure';
    panel.hidden=true;
    if(yes){enable();return;}
    window['ga-disable-'+id]=true;window.gtag=undefined;clean();
    if(loaded)location.reload();
  }
  document.getElementById('cookiesYes').onclick=()=>choose(true);
  document.getElementById('cookiesNo').onclick=()=>choose(false);
})();
