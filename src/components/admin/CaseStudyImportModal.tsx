import React, { useState } from 'react';
import {
  X,
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileJson,
  Layers,
  Tag,
  BarChart2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Project } from '../../types';
import { validateAndParseCaseStudyJson, ValidationReport } from '../../lib/caseStudyData';
import { createProject, updateProject } from '../../lib/api';

interface CaseStudyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number, titles: string[]) => void;
  existingProjects?: Project[];
  /** If provided, will load into the editor instead of saving immediately to database */
  onLoadIntoEditor?: (projectData: Partial<Project>) => void;
}

export const CaseStudyImportModal: React.FC<CaseStudyImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingProjects = [],
  onLoadIntoEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedJson, setPastedJson] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [conflictStrategy, setConflictStrategy] = useState<'auto_suffix' | 'overwrite'>('auto_suffix');
  const [defaultStatus, setDefaultStatus] = useState<'PRESERVE' | 'DRAFT'>('DRAFT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setImportError('Please select a valid .json file.');
      return;
    }

    setFileName(file.name);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const report = validateAndParseCaseStudyJson(content);
      setValidationReport(report);
    };
    reader.onerror = () => {
      setImportError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (val: string) => {
    setPastedJson(val);
    setImportError(null);
    if (!val.trim()) {
      setValidationReport(null);
      return;
    }
    const report = validateAndParseCaseStudyJson(val);
    setValidationReport(report);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationReport || !validationReport.valid || validationReport.projects.length === 0) {
      return;
    }

    setIsProcessing(true);
    setImportError(null);

    try {
      // If we are in "Load into editor" mode (single item)
      if (onLoadIntoEditor && validationReport.projects.length === 1) {
        onLoadIntoEditor(validationReport.projects[0]);
        onClose();
        return;
      }

      let successCount = 0;
      const importedTitles: string[] = [];

      for (const projectData of validationReport.projects) {
        if (!projectData.title) continue;

        let targetSlug = projectData.slug || projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const existingMatch = existingProjects.find((p) => p.slug === targetSlug);

        const projectStatus = defaultStatus === 'DRAFT' ? 'DRAFT' : projectData.status || 'DRAFT';

        if (existingMatch && conflictStrategy === 'overwrite') {
          // Update existing
          await updateProject(existingMatch.id, {
            ...projectData,
            status: projectStatus,
          });
        } else {
          // Create new with auto unique slug if necessary
          if (existingMatch && conflictStrategy === 'auto_suffix') {
            let counter = 1;
            let uniqueSlug = `${targetSlug}-imported`;
            while (existingProjects.some((p) => p.slug === uniqueSlug)) {
              uniqueSlug = `${targetSlug}-imported-${counter}`;
              counter++;
            }
            projectData.slug = uniqueSlug;
          }

          await createProject({
            ...projectData,
            status: projectStatus,
          });
        }

        successCount++;
        importedTitles.push(projectData.title);
      }

      onImportSuccess(successCount, importedTitles);
      onClose();
    } catch (err: any) {
      console.error('Import failure:', err);
      setImportError(err.message || 'An error occurred while saving the imported case study.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setFileName(null);
    setPastedJson('');
    setValidationReport(null);
    setImportError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#E8E3DD] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E3DD] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#9B0F06]/10 text-[#9B0F06] flex items-center justify-center font-bold">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#171514]">
                Import Case Study (JSON)
              </h3>
              <p className="text-xs font-display text-[#6F6965]">
                Upload or paste structured case study data to import into your portfolio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6F6965] hover:text-[#171514] hover:bg-[#F7F4F0] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E8E3DD] bg-[#F7F4F0] px-6 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('upload');
              resetState();
            }}
            className={`px-4 py-2 text-xs font-display font-semibold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-[#9B0F06] border-t-2 border-[#9B0F06] shadow-2xs'
                : 'text-[#6F6965] hover:text-[#171514]'
            }`}
          >
            Upload JSON File
          </button>
          <button
            onClick={() => {
              setActiveTab('paste');
              resetState();
            }}
            className={`px-4 py-2 text-xs font-display font-semibold uppercase tracking-wider rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-white text-[#9B0F06] border-t-2 border-[#9B0F06] shadow-2xs'
                : 'text-[#6F6965] hover:text-[#171514]'
            }`}
          >
            Paste Raw JSON
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Upload File Zone */}
          {activeTab === 'upload' && (
            <div>
              {!fileName ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? 'border-[#9B0F06] bg-[#9B0F06]/5'
                      : 'border-[#E8E3DD] hover:border-[#9B0F06]/60 bg-white'
                  }`}
                  onClick={() => document.getElementById('json-file-input')?.click()}
                >
                  <input
                    id="json-file-input"
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-[#F7F4F0] text-[#9B0F06] flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-[#171514]">
                    Choose a JSON file or drag & drop here
                  </h4>
                  <p className="text-xs font-display text-[#6F6965] mt-1 max-w-sm mx-auto">
                    Accepts exported case study files or standard JSON schemas containing title and content blocks.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-white border border-[#E8E3DD] rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileCode className="w-5 h-5 text-[#9B0F06]" />
                    <div>
                      <div className="font-display font-bold text-xs text-[#171514]">
                        {fileName}
                      </div>
                      <div className="text-[10px] font-display text-[#6F6965]">
                        Ready for import validation
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetState}
                    className="text-xs font-display text-[#9B0F06] hover:underline cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Paste Raw JSON Area */}
          {activeTab === 'paste' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-display uppercase font-semibold text-[#171514]">
                Raw JSON Input
              </label>
              <textarea
                rows={7}
                value={pastedJson}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder='{\n  "title": "Autonomous Fleet Dispatcher",\n  "category": "PRODUCT",\n  "content_json": [\n    { "type": "heading", "level": 1, "text": "Overview" }\n  ]\n}'
                className="w-full px-3.5 py-3 bg-white border border-[#E8E3DD] rounded-xl text-xs font-mono text-[#171514] focus:outline-none focus:border-[#9B0F06] leading-relaxed"
              />
            </div>
          )}

          {/* Error Message */}
          {importError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-display text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{importError}</span>
            </div>
          )}

          {/* Validation Report Area */}
          {validationReport && (
            <div className="space-y-4">
              {validationReport.valid ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-display font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Compatible Structure Confirmed</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-display text-[10px] font-bold">
                      {validationReport.summary.totalProjects} Case Study found
                    </span>
                  </div>

                  {/* Summary Stat Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-display">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#9B0F06]" />
                      <span>{validationReport.summary.totalBlocks} Content Blocks</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#9B0F06]" />
                      <span className="truncate">
                        Category: {validationReport.projects[0]?.category || 'PRODUCT'}
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 flex items-center gap-2">
                      <BarChart2 className="w-3.5 h-3.5 text-[#9B0F06]" />
                      <span>{validationReport.projects[0]?.impact_metrics?.length || 0} Metrics</span>
                    </div>
                  </div>

                  {/* Warnings (if any) */}
                  {validationReport.warnings.length > 0 && (
                    <div className="pt-2 border-t border-emerald-200/60 space-y-1">
                      {validationReport.warnings.map((warn, i) => (
                        <div key={i} className="text-[11px] font-display text-amber-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-red-800 font-display font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Incompatible Structure</span>
                  </div>
                  <ul className="text-xs font-display text-red-700 space-y-1 list-disc list-inside">
                    {validationReport.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] font-display text-[#6F6965] pt-1">
                    Please ensure the JSON contains a project with a <code className="text-[#171514] font-mono">title</code> property and structured blocks.
                  </p>
                </div>
              )}

              {/* Import Options (Only if valid and not single load into editor) */}
              {validationReport.valid && !onLoadIntoEditor && (
                <div className="p-4 bg-white border border-[#E8E3DD] rounded-xl space-y-3.5">
                  <h5 className="text-xs font-display uppercase tracking-wider font-bold text-[#171514]">
                    Import Preferences
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-display">
                    {/* Slug Conflict Handling */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6F6965] mb-1">
                        If Slug Already Exists
                      </label>
                      <select
                        value={conflictStrategy}
                        onChange={(e) => setConflictStrategy(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                      >
                        <option value="auto_suffix">Create New (Auto-generate unique slug)</option>
                        <option value="overwrite">Overwrite / Update Existing Project</option>
                      </select>
                    </div>

                    {/* Initial Status */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6F6965] mb-1">
                        Initial Publish State
                      </label>
                      <select
                        value={defaultStatus}
                        onChange={(e) => setDefaultStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                      >
                        <option value="DRAFT">Import as Draft (Recommended)</option>
                        <option value="PRESERVE">Preserve JSON status</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8E3DD] bg-white">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-display uppercase tracking-wider font-semibold text-[#6F6965] hover:text-[#171514] cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleExecuteImport}
            disabled={!validationReport || !validationReport.valid || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B0F06] hover:bg-[#7E0C05] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-display uppercase tracking-wider font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <span>
                  {onLoadIntoEditor
                    ? 'Load into Editor'
                    : `Import ${validationReport?.summary.totalProjects || 1} Case Study`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
