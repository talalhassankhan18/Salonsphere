import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">
          {selected.length > 0
            ? selected
                .map(
                  (value) => options.find((opt) => opt.value === value)?.label
                )
                .join(", ")
            : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search..."
            className="w-full px-3 py-2 text-sm border-b border-gray-200 focus:outline-none"
          />
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => handleSelect(option.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
