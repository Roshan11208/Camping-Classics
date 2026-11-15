/* Camping Classics Excel tools. Files stay on the visitor's device. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const modal = $('excelImportModal');
  let sheets = [], pending = [], worker = null, timer = null, returnFocus = null;
  const aliases = {item:['item','name','itemname','checklistitem'], category:['category','section'], quantity:['quantity','qty','count'], packed:['packed','checked','complete','completed']};
  const headerKey = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g,'');
  const forbidden = new Set(['__proto__','prototype','constructor']);

  function parseSheet(sheet) {
    if (sheet.error) throw new Error(sheet.error);
    const rows = sheet.rows;
    if (!Array.isArray(rows)) throw new Error('This worksheet has no checklist data.');
    const headerIndex = rows.slice(0,20).findIndex(row => row.some(cell => aliases.item.includes(headerKey(cell.value))));
    if (headerIndex < 0) throw new Error('No Item column found. Use Item, Category, Quantity, and Packed headings, or download the template.');
    const headers = rows[headerIndex].map(cell => headerKey(cell.value));
    const columns = {};
    for (const [key,names] of Object.entries(aliases)) {
      const matches = headers.map((name,index)=>names.includes(name)?index:-1).filter(index=>index>=0);
      if (matches.length > 1) throw new Error(`Use only one ${key} column.`);
      columns[key] = matches[0] ?? -1;
    }
    const items = [], seen = new Set();
    rows.forEach((row,index) => {
      if (index < headerIndex) return;
      if (row.some(cell => cell.formula || cell.type === 'e')) throw new Error(`Row ${index+1}: formula or error cells are not supported. Paste values into your spreadsheet first.`);
      if (index === headerIndex || row.every(cell => cell.value === '' || cell.value == null)) return;
      const value = key => columns[key] < 0 ? '' : row[columns[key]]?.value ?? '';
      const rawItem = value('item'), label = typeof rawItem === 'string' ? rawItem.trim() : '';
      const rawCategory = value('category');
      const category = rawCategory === '' ? 'Extras' : typeof rawCategory === 'string' ? rawCategory.trim() : '';
      if (!label || label.length > 160) throw new Error(`Row ${index+1}: Item must be text with 1–160 characters.`);
      if (!category || category.length > 80 || forbidden.has(category)) throw new Error(`Row ${index+1}: Category must be text with 1–80 characters.`);
      const rawQuantity = value('quantity');
      const quantity = rawQuantity === '' ? 0 : typeof rawQuantity === 'number' ? rawQuantity : typeof rawQuantity === 'string' && /^\d+$/.test(rawQuantity.trim()) ? Number(rawQuantity.trim()) : NaN;
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) throw new Error(`Row ${index+1}: Quantity must be a whole number from 0 to 99.`);
      const packedValue = String(value('packed')).trim().toLowerCase();
      if (!['','yes','no','true','false','1','0','x','✓'].includes(packedValue)) throw new Error(`Row ${index+1}: Packed must be Yes/No or True/False.`);
      const checked = ['yes','true','1','x','✓'].includes(packedValue);
      if (checked && quantity === 0) throw new Error(`Row ${index+1}: a packed item needs a quantity of at least 1.`);
      const identity = `${category.toLowerCase()}\u0000${label.toLowerCase()}`;
      if (seen.has(identity)) throw new Error(`Row ${index+1}: duplicate item in the same category. Remove the duplicate first.`);
      seen.add(identity);
      items.push({category,label,quantity,checked,custom:true});
      if (items.length > 1000) throw new Error('Import up to 1,000 items at a time.');
    });
    if (!items.length) throw new Error('No items found in this worksheet.');
    return items;
  }

  function mergeItems(checklist, items, mode) {
    const next = mode === 'replace' ? {} : JSON.parse(JSON.stringify(checklist));
    let added = 0, skipped = 0;
    for (const item of items) {
      if (forbidden.has(item.category)) throw new Error('Invalid category.');
      const category = Object.keys(next).find(key => key.toLowerCase() === item.category.toLowerCase()) || item.category;
      if (!Object.hasOwn(next,category)) next[category] = [];
      if (next[category].some(existing => existing.label.trim().toLowerCase() === item.label.toLowerCase())) {skipped++;continue;}
      next[category].push({label:item.label,quantity:item.quantity,checked:item.checked,custom:true});
      added++;
    }
    if (Object.values(next).flat().length > 1000) throw new Error('The resulting checklist would exceed 1,000 items.');
    return {checklist:next,added,skipped};
  }

  function makeWorkbook(checklist) {
    if (!globalThis.XLSX) throw new Error('Excel tools could not load. Refresh the page and try again.');
    const rows = [['Category','Item','Quantity','Packed']];
    Object.entries(checklist).forEach(([category,items]) => items.forEach(item => rows.push([String(category),String(item.label),clampQuantity(item.quantity),Boolean(item.checked)])));
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = [{wch:25},{wch:48},{wch:12},{wch:12}];
    sheet['!autofilter'] = {ref:sheet['!ref']};
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book,sheet,'Checklist');
    book.Props = {Title:'Camping Classics checklist',Author:'Camping Classics'};
    return book;
  }
  function downloadExcel(template = false) {
    try {
      const source = template ? {'Shelter & Sleep':[{label:'Tent',quantity:0,checked:false}], 'Food & Water':[{label:'Drinking water',quantity:0,checked:false}], Extras:[{label:'Your custom item',quantity:0,checked:false}]} : currentChecklist;
      const name = template ? 'camping-classics-template' : (currentPlannerSettings?.tripName || 'camping-classics-checklist').replace(/[^a-z0-9_-]+/gi,'-').slice(0,65);
      XLSX.writeFile(makeWorkbook(source),`${name || 'checklist'}.xlsx`,{compression:true});
      $('excelStatus').textContent = template ? 'Template download started. Fill in the rows, then choose Import spreadsheet.' : 'Excel download started for your complete checklist, including items hidden by search or collapsed sections.';
    } catch (error) { $('excelStatus').textContent = error.message; }
  }
  function stopReading() {if(worker)worker.terminate();worker=null;clearTimeout(timer);}
  function closeImport() {
    stopReading(); pending=[];sheets=[];
    closeSiteModal(modal);
    returnFocus?.focus({preventScroll:true});
  }
  function showPreview() {
    pending=[];$('applyExcelImport').disabled=true;$('excelPreviewWrap').hidden=true;$('excelImportModes').hidden=true;
    $('excelPreviewRows').replaceChildren();
    try {
      pending=parseSheet(sheets[Number($('excelImportSheet').value)]);
      const fragment=document.createDocumentFragment();
      for(const item of pending.slice(0,50)) {
        const tr=document.createElement('tr');
        for(const value of [item.category,item.label,String(item.quantity),item.checked?'Yes':'No']) {const td=document.createElement('td');td.textContent=value;tr.append(td);}
        fragment.append(tr);
      }
      $('excelPreviewRows').append(fragment);
      $('excelImportStatus').textContent=`${pending.length} item${pending.length===1?'':'s'} ready to import.${pending.length>50?' Showing the first 50 rows.':''}`;
      $('excelPreviewWrap').hidden=false;$('excelImportModes').hidden=false;$('applyExcelImport').disabled=false;
    } catch(error) {$('excelImportStatus').textContent=error.message;}
  }
  $('importChecklistExcel').addEventListener('click',()=>{
    returnFocus=document.activeElement;pending=[];sheets=[];
    $('excelImportFile').value='';$('excelImportStatus').textContent='Choose a file to preview its items.';
    $('excelPreviewWrap').hidden=true;$('excelImportModes').hidden=true;$('excelSheetLabel').hidden=true;$('applyExcelImport').disabled=true;
    document.querySelector('input[name="excelImportMode"][value="add"]').checked=true;
    openSiteModal(modal);$('excelImportFile').focus();
  });
  $('excelImportFile').addEventListener('change',async event=>{
    stopReading(); pending=[];$('applyExcelImport').disabled=true;$('excelPreviewWrap').hidden=true;$('excelImportModes').hidden=true;$('excelSheetLabel').hidden=true;
    const file=event.target.files?.[0];if(!file)return;
    if(!/\.(xlsx|xls|csv)$/i.test(file.name)||file.size>2*1024*1024){$('excelImportStatus').textContent='Choose a .xlsx, .xls, or .csv file smaller than 2 MB.';return;}
    $('excelImportStatus').textContent='Reading spreadsheet…';
    let task;
    try {task=new Worker('./excel-worker.js');worker=task;}
    catch(_) {$('excelImportStatus').textContent='Spreadsheet import could not start. Open the hosted website and try again.';return;}
    timer=setTimeout(()=>{if(worker===task){stopReading();$('excelImportStatus').textContent='This file took too long to read. Try a smaller worksheet.';}},12000);
    task.onmessage=event=>{
      if(worker!==task)return;stopReading();
      if(event.data.error){$('excelImportStatus').textContent=event.data.error;return;}
      sheets=event.data.sheets;$('excelImportSheet').replaceChildren();
      sheets.forEach((sheet,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=sheet.name;$('excelImportSheet').append(option);});
      $('excelImportSheet').value=String(Math.max(0,sheets.findIndex(sheet=>sheet.name.toLowerCase()==='checklist')));
      $('excelSheetLabel').hidden=sheets.length<2;showPreview();
    };
    task.onerror=()=>{if(worker!==task)return;stopReading();$('excelImportStatus').textContent='Could not read the spreadsheet. Refresh and try the template.';};
    try {const buffer=await file.arrayBuffer();if(worker===task)task.postMessage(buffer,[buffer]);}
    catch(_){if(worker===task){stopReading();$('excelImportStatus').textContent='The selected file could not be opened.';}}
  });
  $('excelImportSheet').addEventListener('change',showPreview);
  $('applyExcelImport').addEventListener('click',()=>{
    if(!pending.length)return;
    const mode=document.querySelector('input[name="excelImportMode"]:checked').value;
    if(mode==='replace'&&!window.confirm(`Replace your current checklist with ${pending.length} imported items? Your trip details and daily notes will be kept.`))return;
    const previous=currentChecklist;
    try {
      const result=mergeItems(currentChecklist,pending,mode);
      currentChecklist=result.checklist;saveCurrentState();
      renderChecklist();updatePlannerPreview();renderSavedTrips();togglePanel(masterChecklistToggle,checklistBody,true,true);
      closeImport();$('excelStatus').textContent=`Imported ${result.added} item${result.added===1?'':'s'}.${result.skipped?` ${result.skipped} existing item${result.skipped===1?' was':'s were'} kept without changes.`:''}`;
    } catch(error) {currentChecklist=previous;try{saveCurrentState();renderChecklist();}catch(_){} $('excelImportStatus').textContent=error.name==='QuotaExceededError'?'Browser storage is full. Export a backup before trying again.':error.message;}
  });
  $('exportChecklistExcel').addEventListener('click',()=>downloadExcel());
  $('backupBeforeExcelImport').addEventListener('click',()=>downloadExcel());
  $('downloadChecklistTemplate').addEventListener('click',()=>downloadExcel(true));
  $('closeExcelImport').addEventListener('click',closeImport);$('cancelExcelImport').addEventListener('click',closeImport);
  modal.addEventListener('click',event=>{if(event.target===modal)closeImport();});
  modal.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.stopPropagation();closeImport();}
    if(event.key==='Tab'){
      const controls=[...modal.querySelectorAll('button,input,select,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  });
  // Pure helpers are also used by the functional checks.
  globalThis.CampingExcel={parseSheet,mergeItems,makeWorkbook};
})();
