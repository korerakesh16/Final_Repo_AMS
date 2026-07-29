import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

const ExcelImportModal = ({
  isOpen,
  onClose,
  title = "Import Data from Excel",
  onImportData,
  sampleColumns = ["Type", "Brand", "Model", "SerialNumber", "Status", "Scope"],
  sampleData = [
    { Type: "Laptop", Brand: "Dell", Model: "Latitude 5430", SerialNumber: "DELL-LT-9901", Status: "Available", Scope: "Employee" },
    { Type: "Monitor", Brand: "LG", Model: "UltraFine 27", SerialNumber: "LG-MN-8802", Status: "Available", Scope: "Organization" }
  ],
  templateFileName = "Import_Template.xlsx"
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setImportSummary(null);
    setParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      alert("Please select a valid Excel (.xlsx, .xls) or CSV file.");
      return;
    }
    setSelectedFile(file);
    setImportSummary(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: sampleColumns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, templateFileName);
  };

  const handleProcessImport = () => {
    if (!selectedFile) return;
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON rows
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        if (!rawRows || rawRows.length === 0) {
          setImportSummary({
            totalRows: 0,
            successCount: 0,
            failedRows: [{ row: 0, reason: "The uploaded file is empty or contains no valid rows." }]
          });
          setParsing(false);
          return;
        }

        // Invoke caller callback to validate and import
        const summary = onImportData(rawRows);
        setImportSummary(summary || {
          totalRows: rawRows.length,
          successCount: rawRows.length,
          failedRows: []
        });
      } catch (err) {
        console.error("Excel parse error:", err);
        setImportSummary({
          totalRows: 0,
          successCount: 0,
          failedRows: [{ row: 0, reason: `Failed to parse file: ${err.message || 'Corrupted Excel file.'}` }]
        });
      } finally {
        setParsing(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl p-6 z-10 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base leading-tight">{title}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Upload Excel (.xlsx, .xls) or CSV files</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Template Download Hint */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
          <span className="text-slate-600 font-medium text-[11px]">Need a formatted template file?</span>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-blue-600 font-bold rounded-xl text-[11px] shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Template</span>
          </button>
        </div>

        {!importSummary ? (
          <div className="space-y-4">
            {/* File Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : selectedFile 
                  ? 'border-emerald-400 bg-emerald-50/20' 
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                onChange={(e) => e.target.files && handleFileSelected(e.target.files[0])}
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="h-10 w-10 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drag to replace</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-9 w-9 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Click to select file or drag & drop</p>
                  <p className="text-[10px] text-slate-400">Supports Microsoft Excel (.xlsx, .xls) and CSV format</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || parsing}
                onClick={handleProcessImport}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {parsing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload & Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Import Results Summary */
          <div className="space-y-4 text-xs animate-fade-in">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-extrabold text-slate-800 text-sm">Import Results Summary</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  importSummary.failedRows.length === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {importSummary.failedRows.length === 0 ? 'Success' : 'Completed with Notices'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Rows</span>
                  <span className="font-extrabold text-slate-800 text-sm">{importSummary.totalRows}</span>
                </div>
                <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/50">
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase">Imported</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{importSummary.successCount}</span>
                </div>
                <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100/50">
                  <span className="block text-[10px] font-bold text-rose-600 uppercase">Skipped</span>
                  <span className="font-extrabold text-rose-700 text-sm">{importSummary.failedRows.length}</span>
                </div>
              </div>

              {/* Error/Notice details list */}
              {importSummary.failedRows.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Skipped Row Details:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1 border border-slate-200/70 rounded-xl p-2 bg-white">
                    {importSummary.failedRows.map((err, i) => (
                      <div key={i} className="text-[10px] text-rose-600 font-medium flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
                        <span>{err.row > 0 ? `Row ${err.row}: ` : ''}{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 transition-all cursor-pointer"
              >
                Import Another File
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelImportModal;
