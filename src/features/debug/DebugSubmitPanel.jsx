import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function DebugSubmitPanel(){
  const [email,setEmail]=useState('');
  const [details,setDetails]=useState('');
  const [status,setStatus]=useState('idle');
  const submit=async()=>{
    setStatus('sending');
    try{
      await base44.functions.invoke('submitDebugReport', { email, details });
      setStatus('sent');
    }catch{ setStatus('error'); }
  };
  return (
    <div className="space-y-2">
      <input className="w-full p-2 rounded" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
      <textarea className="w-full p-2 rounded" placeholder="Describe the issue" value={details} onChange={e=>setDetails(e.target.value)} />
      <button onClick={submit} className="px-3 py-2 bg-blue-600 text-white rounded">Send</button>
      <div className="text-sm text-white/70">We never sell your information.</div>
      {status!=='idle' && <div className="text-xs text-white/60">{status}</div>}
    </div>
  );
}