# 신발비교 Sinbal

러닝화·트레일화·워킹화를 **사양·가격·용도** 기준으로 나란히 비교하고, 질문 5개로 나에게 맞는 신발을 추천받는 사이트입니다.

> ⚠️ `data/shoes.json` 의 값은 실제 모델명을 쓴 **샘플 데이터**입니다. 사양·가격은 근사치이며 화면에 "샘플" 배지로 표시됩니다.

## 기능

| 화면 | 경로 | 내용 |
|---|---|---|
| 신발 목록 | `/` | 검색, 카테고리·용도·가격대·발볼·브랜드 필터, 평점/가격/무게/출시연도 정렬. 필터 상태가 URL에 반영되어 링크로 공유 가능 |
| 비교 | `/compare` | 최대 4켤레 비교 표. 값이 다른 행은 노란색으로 강조, 최저가·최경량·최고 평점 표시, "다른 항목만 보기", 공유 링크(`?ids=a,b`) |
| 상세 | `/shoes/[slug]` | 사양, 장단점, 추천 대상, 판매처별 가격, 비슷한 신발 |
| 추천 | `/finder` | 용도 → 주간 거리 → 발볼 → 예산 → 쿠션 선호, 이 5가지 질문으로 Top 3와 추천 이유 제시 |

- 비교 목록은 `localStorage`(`sinbal:compare:v1`)에 저장되어 새로고침해도 유지되고, 다른 탭과도 동기화됩니다.
- 표시 통화는 KRW와 EUR 중에 고를 수 있습니다. 두 통화 가격을 각각 데이터로 저장합니다(환율 변환이 아님).
- 테마는 시스템·라이트·다크 중에 고릅니다. 첫 화면이 그려지기 전에 적용되어 깜빡임이 없습니다.
- 모바일 우선으로 설계했습니다. 비교 표는 가로로 스크롤되고 첫 열은 고정됩니다.
- 접근성: 본문 바로가기 링크, 키보드만으로 모든 조작 가능, 포커스 링 표시, 색 대비 WCAG AA(4.5:1 이상), 스크린리더용 알림(`aria-live`), 질문이 바뀌면 포커스 이동.

## 기술 스택

Next.js 15 (App Router, 정적 생성), TypeScript, Tailwind CSS v4, Zod(데이터 검증), Vitest

## 실행 방법

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 단위 테스트 (데이터 검증 · 필터 · 추천 · 비교 로직)
npm run lint
npm run build      # 프로덕션 빌드 (data/shoes.json 검증 포함)
npm start          # 빌드 결과 실행
```

### Vercel 배포

1. GitHub 저장소를 Vercel에서 **Import**합니다.
2. Framework Preset은 Next.js로 자동 감지됩니다. 추가 설정이나 환경 변수는 필요 없습니다.
3. 모든 페이지가 빌드할 때 정적으로 생성되므로, 데이터를 바꾸면 다시 배포하면 됩니다.

## 폴더 구조

```
data/shoes.json              신발 데이터 (샘플 20켤레)
src/app/                     페이지 (목록, 비교, 상세, 추천)
src/components/              UI 컴포넌트
src/lib/schema.ts            Zod 스키마 = 데이터 형식의 단일 기준
src/lib/data/repository.ts   ShoeRepository 인터페이스 (UI는 여기에만 의존)
src/lib/data/json-repository.ts  JSON 파일 구현
src/lib/data/index.ts        사용할 데이터 소스 선택
src/lib/filters.ts           필터·정렬 (순수 함수)
src/lib/compare.ts           비교 표 행 정의, 차이 및 최고값 계산
src/lib/recommend.ts         추천 점수 계산
src/lib/compare-store.ts     비교 목록 (localStorage)
src/lib/i18n/ko.ts           한국어 라벨
src/tests/                   Vitest 테스트
```

## 데이터 추가 방법

`data/shoes.json` 배열에 객체를 하나 추가합니다.

```jsonc
{
  "id": "new-balance-1080v14",          // 소문자·숫자·하이픈, 고유값
  "slug": "new-balance-1080v14",        // URL (/shoes/<slug>), 고유값
  "brand": "New Balance",
  "model": "Fresh Foam X 1080v14",
  "category": "road",                   // road | trail | walking
  "usages": ["daily", "long"],          // daily | tempo | race | long | recovery | trail | walking
  "releaseYear": 2024,
  "price": { "eur": 180, "krw": 209000 },  // 정가(MSRP)
  "specs": {
    "weightG": 293,                     // 남성 US 9 기준
    "dropMm": 6,                        // = stackHeelMm - stackForefootMm (검증됨)
    "stackHeelMm": 38,
    "stackForefootMm": 32,
    "cushioning": 5,                    // 1(단단) ~ 5(푹신)
    "stability": 3                      // 1(중립) ~ 5(강한 지지)
  },
  "widths": ["standard", "wide", "extra-wide"],  // narrow | standard | wide | extra-wide
  "rating": 4.3,                        // 0 ~ 5
  "summary": "한 줄 소개",
  "pros": ["장점 1", "장점 2"],
  "cons": ["단점 1"],
  "recommendedFor": ["이런 분께 추천"],
  "offers": [
    {
      "retailer": "Zalando",
      "url": "https://www.zalando.de/...",
      "price": 159.95,
      "currency": "EUR",                // EUR | KRW
      "region": "DE",                   // DE | KR | EU | US
      "inStock": true,
      "checkedAt": "2026-11-20"
    }
  ],
  "image": "/shoes/nb-1080v14.png",     // 선택. 없으면 스택 높이를 반영한 실루엣 표시
  "isSample": false,                    // 실제 검증된 데이터면 false → "샘플" 배지 사라짐
  "updatedAt": "2026-11-20"
}
```

추가한 뒤 `npm test`를 실행해 스키마 검증을 확인하세요. 잘못된 값(드롭 불일치, id 중복, 범위 초과 등)이 있으면 테스트와 빌드가 실패하고 어느 필드가 문제인지 알려줍니다. 이미지는 `public/` 아래에 넣고 `/`로 시작하는 경로로 적습니다.

## 실제 데이터·가격 API로 바꾸기

UI는 `ShoeRepository` 인터페이스(`getAll`, `getBySlug`, `getByIds`, `getOffers`)만 사용합니다.

1. `src/lib/data/api-repository.ts`를 만들어 인터페이스를 구현합니다. 응답은 `ShoeSchema` / `OfferSchema`로 검증하세요.
2. `src/lib/data/index.ts`의 `export const repo = jsonRepository;`를 새 구현으로 교체합니다.
3. 가격만 자주 바뀐다면 `getOffers`만 API에서 가져오고 사양은 JSON에 두는 혼합 구현도 가능합니다.
4. 데이터가 자주 바뀌면 페이지에 `export const revalidate = 3600;`(ISR)을 추가해 재배포 없이 갱신되게 할 수 있습니다.
