# Artist Database Update & Naver Review Queue

Generated: 2026-07-02

## 本次正式入库/修正

- 新增 TWS 6 名成员，使用唯一 ID 860-865，避免触碰现有历史 ID。
- 修正 ALLDAY PROJECT 团体出道日期 `2025.04.01 -> 2025.06.23`，经纪公司 `Unknown -> THEBLACKLABEL`。
- 为 `ArtistStatic` 增加 `generationTag`、`verificationStatus`、`sourceUrls`，后续可以区分正式数据、待复核数据和占位数据。
- 补充 2024-2025 新团 `GROUP_META`：ALLDAY PROJECT、BABYMONSTER、ILLIT、MEOVV、NCT WISH、TWS。

## 数据写入原则

Only stable public profile data is written to src/data/artists.ts. Entries without two reliable sources stay marked as needs_review or placeholder.

## 新增团体

| Group | Debut | Agency | Tags | Status | Source |
| --- | --- | --- | --- | --- | --- |
| TWS | 2024.01.22 | PLEDIS娱乐 | 新人团, 六代团 | needs_review | [link](https://search.naver.com/search.naver?query=TWS%20%ED%94%84%EB%A1%9C%ED%95%84%20%EB%8D%B0%EB%B7%94%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC)<br>[link](https://www.pledis.co.kr/) |

## 修正记录

| Group | Change | Old | New | Status | Source |
| --- | --- | --- | --- | --- | --- |
| ALLDAY PROJECT | correct_debut_and_agency | 2025.04.01 / Unknown | 2025.06.23 / THEBLACKLABEL | needs_review | [link](https://search.naver.com/search.naver?query=ALLDAY%20PROJECT%20%EB%8D%B0%EB%B7%94%20THEBLACKLABEL)<br>[link](https://www.theblacklabel.com/) |

## 待补全 / 禁止直接标记已验证

| Group | Reason |
| --- | --- |
| KiiiKiii | Current record is a group placeholder with birthDate 2005-01-01. Needs member-level official profiles before formal matching. |
| Heart2Heart | Current record is a group placeholder with birthDate 2005-01-01. Needs official member profile split. |
| IDID | Current agency is Unknown and birthDate is placeholder. Keep out of verified pool until official profile is confirmed. |
| ALD1 | Multiple members use 01-01 placeholder birthdays and Unknown agency. Requires official debut/member source reconciliation. |
| LNGSHOT | Rookie data should be rechecked against agency/Naver records before marking verified. |
| SMTR25 | Pre-debut/public trainee data is volatile. Keep as provisional unless official debut/member profile is published. |

## 自动字段审计结果

- Parsed artists: 380
- Groups parsed: 52
- Duplicate IDs already present: 107, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127
- Entries with field issues: 37

| ID | Artist | Group | Birthday | Debut | Agency | Issues | Naver Check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 37 | 金旼炡 / Winter | aespa | 2001-01-01 | 2020.11.17 | SM娱乐 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=aespa%20Winter%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 38 | 宁艺卓 / Ningning | aespa | 2002-10-23 | 2020.11.17 | SM娱乐 | 星座与生日不一致，应为 天秤座 | [Naver](https://search.naver.com/search.naver?query=aespa%20Ningning%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 50 | Minnie / Minnie | (G)I-DLE | 1997-10-23 | 2018.05.02 | CUBE娱乐 | 星座与生日不一致，应为 天秤座 | [Naver](https://search.naver.com/search.naver?query=(G)I-DLE%20Minnie%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 65 | 李知勋 / Woozi | SEVENTEEN | 1996-11-22 | 2015.05.26 | PLEDIS娱乐 | 星座与生日不一致，应为 天蝎座 | [Naver](https://search.naver.com/search.naver?query=SEVENTEEN%20Woozi%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 118 | 钟辰乐 / Chenle | NCT DREAM | 2001-11-22 | 2016.08.25 | SM娱乐 | 星座与生日不一致，应为 天蝎座 | [Naver](https://search.naver.com/search.naver?query=NCT%20DREAM%20Chenle%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 562 | Winter / Winter | aespa | 2001-01-01 | 2020.11.17 | SM娱乐 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=aespa%20Winter%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 563 | Ningning / Ningning | aespa | 2002-10-23 | 2020.11.17 | SM娱乐 | 星座与生日不一致，应为 天秤座 | [Naver](https://search.naver.com/search.naver?query=aespa%20Ningning%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 580 | KiiiKiii / KiiiKiii | KiiiKiii | 2005-01-01 | 2025.03.01 | STARSHIP娱乐 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=KiiiKiii%20KiiiKiii%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 604 | 金廷祐 / Jungwoo | NCT 127 | 1998-02-19 | 2018.03.14 | SM娱乐 | 星座与生日不一致，应为 双鱼座 | [Naver](https://search.naver.com/search.naver?query=NCT%20127%20Jungwoo%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 612 | 钟辰乐 / Chenle | NCT DREAM | 2001-11-22 | 2016.08.25 | SM娱乐 | 星座与生日不一致，应为 天蝎座 | [Naver](https://search.naver.com/search.naver?query=NCT%20DREAM%20Chenle%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 640 | Heart2Heart / Heart2Heart | Heart2Heart | 2005-01-01 | 2025.02.01 | SM娱乐 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=Heart2Heart%20Heart2Heart%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 645 | IDID / IDID | IDID | 2005-01-01 | 2025.03.01 | Unknown | 疑似占位生日 01-01<br>经纪公司缺失 | [Naver](https://search.naver.com/search.naver?query=IDID%20IDID%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 650 | 李相沅 / Sangwon | ALD1 | 2002-01-01 | 2025.06.01 | Unknown | 疑似占位生日 01-01<br>经纪公司缺失 | [Naver](https://search.naver.com/search.naver?query=ALD1%20Sangwon%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 651 | 周安信 / Anxin | ALD1 | 2003-01-01 | 2025.06.01 | Unknown | 疑似占位生日 01-01<br>经纪公司缺失 | [Naver](https://search.naver.com/search.naver?query=ALD1%20Anxin%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 652 | 贺鑫隆 / Xinlong | ALD1 | 2003-01-01 | 2025.06.01 | Unknown | 疑似占位生日 01-01<br>经纪公司缺失 | [Naver](https://search.naver.com/search.naver?query=ALD1%20Xinlong%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 653 | 金虔佑 / Geonwoo | ALD1 | 2004-01-01 | 2025.06.01 | Unknown | 疑似占位生日 01-01<br>经纪公司缺失 | [Naver](https://search.naver.com/search.naver?query=ALD1%20Geonwoo%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 654 | 张家豪 / Arno | ALD1 | 2004-01-01 | 2025.06.01 | Unknown | 疑似占位生日 01-01<br>经纪公司缺失 | [Naver](https://search.naver.com/search.naver?query=ALD1%20Arno%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 655 | LEO 李理悟 / Leo | ALD1 | 2005-01-01 | 2025.06.01 | Unknown | 疑似占位生日 01-01<br>经纪公司缺失 | [Naver](https://search.naver.com/search.naver?query=ALD1%20Leo%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 656 | 郑相炫 / Sanghyeon | ALD1 | 2005-01-01 | 2025.06.01 | Unknown | 疑似占位生日 01-01<br>经纪公司缺失 | [Naver](https://search.naver.com/search.naver?query=ALD1%20Sanghyeon%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 657 | 金俊抒 / Junseo | ALD1 | 2001-01-01 | 2025.06.01 | Unknown | 疑似占位生日 01-01<br>经纪公司缺失 | [Naver](https://search.naver.com/search.naver?query=ALD1%20Junseo%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 720 | 童禹坤 / 童禹坤 | TF家族 | 2006-01-01 | 2022.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%20%E7%AB%A5%E7%A6%B9%E5%9D%A4%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 721 | 邓佳鑫 / 邓佳鑫 | TF家族 | 2006-01-01 | 2022.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%20%E9%82%93%E4%BD%B3%E9%91%AB%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 722 | 穆祉丞 / 穆祉丞 | TF家族 | 2007-01-01 | 2022.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%20%E7%A9%86%E7%A5%89%E4%B8%9E%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 723 | 张子墨 / 张子墨 | TF家族 | 2007-01-01 | 2023.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%20%E5%BC%A0%E5%AD%90%E5%A2%A8%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 724 | 黄朔 / 黄朔 | TF家族 | 2008-01-01 | 2023.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%20%E9%BB%84%E6%9C%94%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 730 | 陈浚铭 / 陈浚铭 | TF家族四代 | 2010-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E9%99%88%E6%B5%9A%E9%93%AD%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 731 | 汪浚熙 / 汪浚熙 | TF家族四代 | 2010-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E6%B1%AA%E6%B5%9A%E7%86%99%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 732 | 张函瑞 / 张函瑞 | TF家族四代 | 2010-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E5%BC%A0%E5%87%BD%E7%91%9E%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 733 | 王浩 / 王浩 | TF家族四代 | 2011-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E7%8E%8B%E6%B5%A9%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 734 | 官俊臣 / 官俊臣 | TF家族四代 | 2011-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E5%AE%98%E4%BF%8A%E8%87%A3%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 735 | 左奇函 / 左奇函 | TF家族四代 | 2011-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E5%B7%A6%E5%A5%87%E5%87%BD%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 736 | 张桂源 / 张桂源 | TF家族四代 | 2012-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E5%BC%A0%E6%A1%82%E6%BA%90%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 737 | 杨博文 / 杨博文 | TF家族四代 | 2012-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E6%9D%A8%E5%8D%9A%E6%96%87%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 738 | 王橹杰 / 王橹杰 | TF家族四代 | 2012-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E7%8E%8B%E6%A9%B9%E6%9D%B0%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 739 | 陈奕恒 / 陈奕恒 | TF家族四代 | 2013-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E9%99%88%E5%A5%95%E6%81%92%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 740 | 魏子宸 / 魏子宸 | TF家族四代 | 2013-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E9%AD%8F%E5%AD%90%E5%AE%B8%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |
| 741 | 杨涵博 / 杨涵博 | TF家族四代 | 2014-01-01 | 2024.01.01 | 时代峰峻 | 疑似占位生日 01-01 | [Naver](https://search.naver.com/search.naver?query=TF%E5%AE%B6%E6%97%8F%E5%9B%9B%E4%BB%A3%20%E6%9D%A8%E6%B6%B5%E5%8D%9A%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%83%9D%EB%85%84%EC%9B%94%EC%9D%BC%20%EB%8D%B0%EB%B7%94) |

## 后续爬虫接入建议

1. 使用 Naver Developers Search API 或允许登录态的内部抓取任务拉取候选 URL。
2. 对每个候选艺人执行 `Naver profile + agency official profile/announcement` 双源比对。
3. 只把双源一致的生日、出道日期、经纪公司写入 `src/data/artists.ts` 并标记 `verificationStatus: "verified"`。
4. 单源或冲突项写入 `data/artist_pending_review.json`，不要进入正式推荐池。
