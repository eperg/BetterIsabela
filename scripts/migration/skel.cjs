const {parse}=require('node-html-parser');const fs=require('fs');
const root=parse(fs.readFileSync(process.argv[2],'utf8'));
const main=root.querySelector('main')||root;
const walk=(n,d)=>{
  if(d>4||n.nodeType!==1)return;
  if(['SCRIPT','STYLE','I','svg'].includes(n.tagName))return;
  const cls=n.getAttribute('class');
  console.log('  '.repeat(d)+n.tagName.toLowerCase()+(cls?'.'+cls.trim().split(/\s+/).join('.'):''));
  n.childNodes.forEach(c=>walk(c,d+1));
};
main.childNodes.forEach(c=>walk(c,0));
