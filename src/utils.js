export const compressImage=(file,maxW=600)=>new Promise(resolve=>{
  const img=new Image();const url=URL.createObjectURL(file);
  img.onload=()=>{const c=document.createElement("canvas");
    const scale=Math.min(1,maxW/img.width);c.width=img.width*scale;c.height=img.height*scale;
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    URL.revokeObjectURL(url);resolve(c.toDataURL("image/jpeg",0.7));};
  img.src=url;});

export const getWk=()=>{const n=new Date(),s=new Date(n.getFullYear(),0,1);return`${n.getFullYear()}-W${Math.ceil((n-s)/604800000)}`;};
export const getToday=()=>new Date().getDay();
export const getHour=()=>new Date().getHours();
export const getTimeStr=()=>{const n=new Date();return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;};
export const dateKey=(y,m,d)=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
export const getWkForDate=(date)=>{const d=new Date(date),s=new Date(d.getFullYear(),0,1);return`${d.getFullYear()}-W${Math.ceil((d-s)/604800000)}`;};
