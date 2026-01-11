"use client";

import { useState, useEffect, useRef } from 'react';
import { searchAddresses } from '@/lib/repositories/addressRepository';

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function AddressAutocompleteInput({
  value,
  onChange,
  placeholder = "지역을 입력하세요 (예: 서울, 마포구)",
  className = "",
  required = false,
}: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 외부 value 변경 시 inputValue 동기화
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 입력값 변경 시 자동완성 검색
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!inputValue || inputValue.trim().length === 0) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      try {
        setLoading(true);
        const results = await searchAddresses(inputValue.trim());
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('주소 검색 실패:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    };

    // 300ms debounce
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 ${className}`}
        autoComplete="off"
      />

      {/* 로딩 표시 */}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
        </div>
      )}

      {/* 자동완성 드롭다운 */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
            >
              <span className="text-slate-900">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* 결과 없음 표시 */}
      {isOpen && !loading && inputValue.trim().length > 0 && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <p className="text-sm text-slate-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
