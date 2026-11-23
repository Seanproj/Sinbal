import { jsonRepository } from "./json-repository";
import type { ShoeRepository } from "./repository";

// 데이터 소스를 바꾸려면 이 한 줄만 교체하세요. (예: apiRepository)
export const repo: ShoeRepository = jsonRepository;
export type { ShoeRepository };
