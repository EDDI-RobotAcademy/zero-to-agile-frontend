/**
 * 학교 목록 가라 데이터
 * 추후 API: university_location 테이블의 university_name 컬럼
 */

export const SCHOOLS = [
  '서울대학교',
  '한국체육대학교',
  '서울과학기술대학교',
  '서울시립대학교',
  '가톨릭대학교',
  '감리교신학대학교',
  '건국대학교',
  '경기대학교',
  '경희대학교',
  '고려대학교',
  '광운대학교',
  '국민대학교',
  '강서대학교',
  '서울기독대학교',
  '덕성여자대학교',
  '동국대학교',
  '동덕여자대학교',
  '명지대학교',
  '삼육대학교',
  '상명대학교',
  '서강대학교',
  '서경대학교',
  '서울여자대학교',
  '성공회대학교',
  '성균관대학교',
  '성신여자대학교',
  '세종대학교',
  '숙명여자대학교',
  '숭실대학교',
  '연세대학교',
  '이화여자대학교',
  '장로회신학대학교',
  '중앙대학교',
  '총신대학교',
  '추계예술대학교',
  '한국성서대학교',
  '한국외국어대학교',
  '한성대학교',
  '한양대학교',
  '서울한영대학교',
  '홍익대학교',
  '서울교육대학교',
  '한국방송통신대학교',
  '정석대학',
  '경희사이버대학교',
  '서울디지털대학교',
  '서울사이버대학교',
  '세종사이버대학교',
  '한국열린사이버대학교',
  '고려사이버대학교',
  '숭실사이버대학교',
  '디지털서울문화예술대학교',
  '한양사이버대학교',
  '사이버한국외국어대학교',
];

/**
 * 추후 API로 대체될 함수
 * GET /api/universities?search=${keyword}
 */
export async function getUniversities(search?: string): Promise<string[]> {
  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 100));

  if (!search) {
    return SCHOOLS;
  }

  return SCHOOLS.filter(school =>
    school.toLowerCase().includes(search.toLowerCase())
  );
}
