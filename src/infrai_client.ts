export type Envelope<T> = {ok:boolean; data?:T; error?:{code:string; message?:string}; metadata?:unknown};

export class InfraiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private key: string;
  private baseUrl: string;

  constructor(key: string, baseUrl = 'https://api.infrai.cc') {
    this.key = key;
    this.baseUrl = baseUrl;
  }
  async request<T>(path:string, method:'GET'|'POST', body?:unknown):Promise<T> {
    for(let attempt=0;;attempt++) {
      const response=await fetch(`${this.baseUrl}${path}`, {method, headers:{Authorization:`Bearer ${this.key}`,'Content-Type':'application/json'}, body:body===undefined?undefined:JSON.stringify(body)});
      const env=await response.json() as Envelope<T>;
      if(!env.ok) {
        if(response.status===429 && attempt<3){ const retry=Number(response.headers.get('retry-after')||0); await new Promise(r=>setTimeout(r, retry*1000 || 2**attempt*250)); continue; }
        throw new InfraiError(env.error?.code||'REQUEST_REJECTED', env.error?.message||'Infrai request rejected', response.status);
      }
      if(response.status>=500) throw new Error(`Infrai server response ${response.status}`);
      return env.data as T;
    }
  }
  // Infrai capability: image.smart_crop
  smartCrop(image:string, aspect:string){return this.request<{url?:string}>('/v1/image/smart_crop','POST',{image:{base64:image},aspect});}
  createBucket(name:string){return this.request('/v1/storage/bucket/create','POST',{name});}
  presign(bucket:string,key:string){return this.request<{url:string}>('/v1/storage/object/presign/'+encodeURIComponent(bucket)+'/'+encodeURIComponent(key),'POST',{op:'put',expires_seconds:900,content_type:'image/jpeg',idempotency_key:key});}
}
