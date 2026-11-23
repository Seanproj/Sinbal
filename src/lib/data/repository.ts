import type { Offer, Shoe } from "../schema";

/**
 * UI는 이 인터페이스에만 의존합니다.
 * 실제 데이터/가격 API로 바꿀 때는 새 구현을 만들고 ./index.ts 에서 교체하세요.
 */
export interface ShoeRepository {
  getAll(): Promise<Shoe[]>;
  getBySlug(slug: string): Promise<Shoe | undefined>;
  getByIds(ids: string[]): Promise<Shoe[]>;
  /** 판매처 가격은 사양보다 자주 바뀌므로 별도 메서드로 분리 */
  getOffers(id: string): Promise<Offer[]>;
}
