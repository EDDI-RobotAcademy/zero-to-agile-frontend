"use client";

import { useState, useEffect, useRef } from 'react';
import { getUniversityNames } from '@/lib/repositories/finderRepository';

interface SchoolSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SchoolSearchInput({
  value,
  onChange,
  placeholder = "학교명을 검색하세요",
  className = "",
}: SchoolSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [schools, setSchools] = useState<string[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 대학교 목록 불러오기
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const universities = await getUniversityNames();
        setSchools(universities);
      } catch (err) {
        console.error('대학교 목록 조회 실패:', err);
        setSchools([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 검색어에 따라 학교 목록 필터링
  useEffect(() => {
    if (!value) {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter(school =>
        school.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
  }, [value, schools]);

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectSchool = (school: string) => {
    onChange(school);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredSchools.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSchools.length) {
          handleSelectSchool(filteredSchools[highlightedIndex]);
        } else if (filteredSchools.length > 0) {
          handleSelectSchool(filteredSchools[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // 스크롤 자동 조정
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        className={className}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={loading ? "학교 목록을 불러오는 중..." : placeholder}
        autoComplete="off"
        disabled={loading}
      />

      {isOpen && filteredSchools.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {filteredSchools.map((school, index) => (
            <button
              key={school}
              type="button"
              className={`w-full px-4 py-2.5 text-left text-sm transition ${
                index === highlightedIndex
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                index === filteredSchools.length - 1 ? 'rounded-b-xl' : ''
              }`}
              onClick={() => handleSelectSchool(school)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {school}
            </button>
          ))}
        </div>
      )}

      {isOpen && filteredSchools.length === 0 && value && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
        >
          <p className="text-sm text-slate-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
