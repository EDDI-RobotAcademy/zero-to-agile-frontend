/**
 * 날짜 포맷팅 유틸리티 함수
 */

/**
 * ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환
 * @param iso - ISO 형식의 날짜 문자열
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * ISO 날짜 문자열을 YYYY. MM. DD 형식으로 변환 (점 포함, 마지막 점 없음)
 * @param iso - ISO 형식의 날짜 문자열
 * @returns YYYY. MM. DD 형식의 날짜 문자열
 */
export function formatDateWithDots(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}. ${m}. ${day}`;
}

/**
 * ISO 날짜 문자열을 YYYY년 MM월 DD일 형식으로 변환
 * @param iso - ISO 형식의 날짜 문자열
 * @returns YYYY년 MM월 DD일 형식의 날짜 문자열
 */
export function formatDateKorean(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}년 ${m}월 ${day}일`;
}
