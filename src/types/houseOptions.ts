export type HouseType =
  | "단독주택/다가구주택"
  | "아파트"
  | "연립주택"
  | "다세대주택"
  | "도시형생활주택"
  | "오피스텔"
  | "기숙사"
  | "노인복지주택"
  | "근린생활시설";

export type PriceType = "전세" | "월세" | "매매";

export type FinderRequestStatus = "Y" | "N";

/** 집 종류 옵션 */
export const HOUSE_TYPES: HouseType[] = [
  "단독주택/다가구주택",
  "아파트",
  "연립주택",
  "다세대주택",
  "도시형생활주택",
  "오피스텔",
  "기숙사",
  "노인복지주택",
  "근린생활시설",
];

/** 가격 타입 옵션 */
export const PRICE_TYPES: PriceType[] = ["전세", "월세", "매매"];

/** 상태 라벨 */
export const STATUS_LABEL: Record<FinderRequestStatus, string> = {
  Y: "물색중",
  N: "비활성화",
};