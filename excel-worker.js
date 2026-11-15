/* Spreadsheet parsing runs off the page so imports can be cancelled. */
importScripts('./vendor/xlsx-0.20.3.min.js');
self.onmessage = event => {
  try {
    const book = XLSX.read(event.data, {type:'array', sheetRows:1002, cellFormula:true, cellHTML:false, bookVBA:false});
    if (!book.SheetNames.length || book.SheetNames.length > 10) throw new Error('Choose a workbook with 1–10 worksheets.');
    const sheets = book.SheetNames.map(name => {
      const sheet = book.Sheets[name];
      const range = XLSX.utils.decode_range(sheet['!fullref'] || sheet['!ref'] || 'A1');
      if (range.e.r > 1001 || range.e.c > 29) return {name,error:'This worksheet is too large. Use up to 1,000 items and 30 columns.'};
      const rows = [];
      for (let r = 0; r <= range.e.r; r++) {
        const row = [];
        for (let c = 0; c <= range.e.c; c++) {
          const cell = sheet[XLSX.utils.encode_cell({r,c})];
          row.push(cell ? {value:cell.v ?? '', type:cell.t, formula:Boolean(cell.f || cell.F)} : {value:''});
        }
        rows.push(row);
      }
      return {name,rows};
    });
    self.postMessage({sheets});
  } catch (_) { self.postMessage({error:'This spreadsheet could not be read. Use an unencrypted .xlsx, .xls, or .csv file, or try the template.'}); }
};
