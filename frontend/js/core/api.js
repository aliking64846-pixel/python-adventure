const API_BASE='/api';

function apiUrl(url){
  const value=String(url||'');
  if(/^https?:\/\//i.test(value))return value;
  if(value.startsWith(API_BASE+'/')||value===API_BASE)return value;
  return API_BASE+(value.startsWith('/')?value:'/'+value);
}

async function parseApiResponse(res){
  const type=res.headers.get('content-type')||'';
  const data=type.includes('application/json')?await res.json().catch(()=>({})):await res.text().then(text=>({error:text})).catch(()=>({}));
  if(!res.ok){
    const message=data&&typeof data==='object'&&data.error?data.error:'حدث خطأ';
    const error=new Error(message);
    error.status=res.status;
    throw error;
  }
  return data;
}

async function api(url,options={}){
  const headers={Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})};
  const res=await fetch(apiUrl(url),{credentials:'include',...options,headers});
  return parseApiResponse(res);
}

async function apiRequest(path,options={}){
  try{return await api(path,options)}
  catch(error){console.warn('API request failed:',path,error);return null}
}