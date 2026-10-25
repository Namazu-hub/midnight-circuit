import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const files=(await readdir(resolve(root,'dist'))).filter(f=>f.endsWith('.mjs'));
for(const f of files){
 const path=resolve(root,'dist',f), result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});
 if(result.status!==0)throw new Error(result.stderr||`Syntax check failed: ${f}`);
 const source=await readFile(path,'utf8');
 for(const m of source.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g))await readFile(resolve(dirname(path),m[1]));
}
const html=await readFile(resolve(root,'dist/index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
 const ref=m[1];if(ref.startsWith('#')||/^(?:https?:|data:)/.test(ref))continue;
 await readFile(resolve(root,'dist',ref));
}
console.log(`PASS: ${files.length} runtime modules parse; imports and HTML assets resolve.`);
if(process.argv.includes('--baseline')){
 const manifest=JSON.parse(await readFile(resolve(root,'docs/source-manifest.json'),'utf8'));let count=0;
 for(const file of manifest.files){
  if(!file.path.startsWith('dist/')&&!file.path.startsWith('tests/'))continue;
  const bytes=await readFile(resolve(root,file.path));
  if(createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new Error(`Baseline mismatch: ${file.path}`);
  count++;
 }
 console.log(`PASS: ${count} runtime/test files match ${manifest.source_commit}.`);
}
