import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, X, Tag } from 'lucide-react';

interface CategorySelectDropdownProps {
  value: string;
  onChange: (newCategory: string) => void;
  availableCategories?: string[];
}

const DEFAULT_CATEGORIES = ['PRODUCT', 'UX', 'BUILD', 'EXPERIMENT'];
const LOCAL_STORAGE_KEY = 'aththar_custom_categories';

export const CategorySelectDropdown: React.FC<CategorySelectDropdownProps> = ({
  value,
  onChange,
  availableCategories = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [inputError, setInputError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize categories from presets + stored custom + props
  const [categoryList, setCategoryList] = useState<string[]>(() => {
    let saved: string[] = [];
    try {
      const item = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) saved = JSON.parse(item);
    } catch {
      // ignore
    }
    const combined = Array.from(
      new Set([...DEFAULT_CATEGORIES, ...saved, ...availableCategories, value].filter(Boolean))
    );
    return combined;
  });

  // Keep list updated if value changes to a new one
  useEffect(() => {
    if (value && !categoryList.includes(value)) {
      setCategoryList((prev) => [...prev, value]);
    }
  }, [value, categoryList]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingNew(false);
        setInputError('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when "+ Add new category" is clicked
  useEffect(() => {
    if (isAddingNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingNew]);

  const handleSaveNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      setInputError('Category name cannot be empty');
      return;
    }

    // Standardize uppercase or trimmed format
    const formatted = trimmed.toUpperCase();

    // Check if already in list
    if (!categoryList.includes(formatted)) {
      const updated = [...categoryList, formatted];
      setCategoryList(updated);
      try {
        const customOnly = updated.filter((c) => !DEFAULT_CATEGORIES.includes(c));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));
      } catch {
        // ignore
      }
    }

    // Set verified as current selection
    onChange(formatted);
    setNewCategoryInput('');
    setIsAddingNew(false);
    setInputError('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveNewCategory();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsAddingNew(false);
      setInputError('');
    }
  };

  const handleSelectCategory = (cat: string) => {
    onChange(cat);
    setIsOpen(false);
    setIsAddingNew(false);
    setInputError('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* 1. Category Field / Trigger Display */}
      <button
        type="button"
        id="category-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#FAF8F5] hover:bg-white border border-[#E8E3DD] focus:border-[#9B0F06] focus:ring-1 focus:ring-[#9B0F06] rounded-md text-xs font-display text-[#171514] transition-all cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Tag className="w-3.5 h-3.5 text-[#9B0F06] shrink-0" />
          <span className="font-semibold tracking-wider uppercase truncate">
            {value || 'SELECT CATEGORY'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6F6965] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#9B0F06]' : ''
          }`}
        />
      </button>

      {/* 2. Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-[#E8E3DD] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Top of the list: Add another category */}
          <div className="p-2 bg-[#FBF9F6] border-b border-[#E8E3DD]">
            {!isAddingNew ? (
              <button
                type="button"
                id="btn-open-add-category"
                onClick={() => {
                  setIsAddingNew(true);
                  setNewCategoryInput('');
                  setInputError('');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-[#F7F4F0] border border-dashed border-[#9B0F06]/60 text-[#9B0F06] font-display text-xs font-bold rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Category</span>
              </button>
            ) : (
              /* 3. Inline Category Creation Input with Save Button */
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <div className="text-[11px] font-display font-semibold text-[#171514] flex items-center justify-between">
                  <span>New Category Name</span>
                  <span className="text-[10px] text-[#6F6965] font-normal">Press Enter to save</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    ref={inputRef}
                    type="text"
                    id="new-category-input"
                    value={newCategoryInput}
                    onChange={(e) => {
                      setNewCategoryInput(e.target.value);
                      if (inputError) setInputError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. FINTECH, BRANDING..."
                    className="flex-1 px-2.5 py-1.5 text-xs font-display uppercase tracking-wider bg-white border border-[#9B0F06] focus:outline-none focus:ring-1 focus:ring-[#9B0F06] rounded"
                  />
                  <button
                    type="button"
                    id="btn-save-new-category"
                    onClick={handleSaveNewCategory}
                    className="px-3 py-1.5 bg-[#9B0F06] hover:bg-[#800C05] text-white text-xs font-display font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
                    title="Save and select this category"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setInputError('');
                    }}
                    className="p-1.5 text-[#6F6965] hover:text-[#171514] hover:bg-[#E8E3DD]/50 rounded transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {inputError && (
                  <p className="text-[11px] text-[#9B0F06] font-display font-medium">
                    {inputError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 4. List of Categories to Choose From */}
          <div className="max-h-56 overflow-y-auto divide-y divide-[#F7F4F0] p-1">
            <div className="px-2 py-1 text-[10px] font-display uppercase tracking-wider text-[#6F6965] font-bold">
              Available Categories
            </div>
            {categoryList.map((cat) => {
              const isSelected = value === cat;
              const isDefault = DEFAULT_CATEGORIES.includes(cat);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-display transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#9B0F06]/10 text-[#9B0F06] font-bold'
                      : 'text-[#171514] hover:bg-[#F7F4F0] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate tracking-wider uppercase">{cat}</span>
                    {!isDefault && (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#E8E3DD]/60 text-[#6F6965] rounded font-semibold">
                        Custom
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#9B0F06] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Badge Preview beneath field */}
      <div className="mt-1.5 flex items-center gap-2 text-[11px] font-display text-[#6F6965]">
        <span>Card badge preview:</span>
        <span
          title={value || 'PRODUCT'}
          className="inline-block max-w-[150px] truncate px-2.5 py-0.5 bg-[#171514] text-white text-[10px] font-display tracking-widest uppercase font-semibold rounded shadow-2xs"
        >
          {value || 'PRODUCT'}
        </span>
      </div>
    </div>
  );
};
