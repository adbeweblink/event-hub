-- ============================================================
-- Seed Data: venues, venue_images, speakers, sponsors,
--            sponsor_past_events, services
-- ============================================================

-- ===== 1. VENUES =====

INSERT INTO venues (name, type, district, address, capacity_min, capacity_max, price_half_day, price_full_day, contact_name, contact_phone, contact_email, website, nearest_mrt, parking_info, min_rental_hours, deposit_policy, equipment, notes, rating)
VALUES
  ('三創生活園區 12F 多元展演', 'studio', 'taipei', '台北市中正區市民大道三段 2 號 12 樓', 80, 200, NULL, NULL, '場地組', '02-2349-1366', '', 'https://www.syntrend.com.tw/space/venues.html', '忠孝新生站', '地下停車場', 4, '', ARRAY['projector','led','mic','wifi','livestream','stage'], '793 平方米、挑高 4.6 米、240 坪獨立空間。平日原價 4 折、假日 5 折。適合大型軟硬體聯合發表。週一至五分上午/下午/晚上三時段。', 4),
  ('WESTAR', 'studio', 'taipei', '台北市萬華區漢中街 116 號 8 樓', 200, 1000, NULL, NULL, 'WESTAR 營運部', '02-2370-0058', '', 'https://www.tremendia.com/westar/', '西門站 6 號出口', '無自有停車場，附近有獅子林停車場', NULL, '', ARRAY['led','mic','wifi','livestream','stage'], '西門捷運 6 號出口正前方，350 坪無樑柱室內空間，可容納近千人。西區唯一大坪數多媒體活動平台。潮流時尚感，社群打卡友善。價格需洽詢。', 4),
  ('CORNER MAX 大角落多功能展演館', 'studio', 'taipei', '台北市大安區光復南路 102 號 1 樓', 400, 650, NULL, NULL, 'CORNER MAX', '', 'cornermaxtw@gmail.com', 'https://www.corner-house.com.tw/', '國父紀念館站 5 號出口', '無自有停車場', NULL, '', ARRAY['mic','wifi','stage'], '座位 400 人、站席 650 人。捷運國父紀念館站 5 號出口步行 4 分鐘。百萬級專業燈光音響。適合技術研討會與實體工作坊。價格需洽詢。', 4),
  ('NUZONE 展演空間', 'studio', 'taipei', '台北市大安區市民大道三段 198 號 2 樓', 300, 500, NULL, NULL, 'NUZONE', '02-2711-0339', 'service@nuzone.com.tw', 'https://www.nuzone.com.tw/', '忠孝新生站', '', NULL, '', ARRAY['led','mic','wifi','livestream','stage'], '168 坪中型展演空間。站席 500 人 / 座席 300 人。舞台 9m×4.8m。法國 L-Acoustics 演唱會規格音響 + 400 吋 LED P3 電視牆。忠孝新生站旁。價格需洽詢。', 5),
  ('1921 共享空間', 'coworking', 'taipei', '台北市中山區雙城街 19 巷 21 號 8 樓', 30, 80, NULL, NULL, '1921 前台', '', '', 'https://www.1921.com.tw/', '中山國小站', '', 2, '', ARRAY['projector','mic','wifi'], '中山國小站步行可達。50-80 人。適合印刷產業小型沙龍、教育課程、工作坊。有中島廚房區、投影設備、白板。明亮採光、沙發討論區。', 3),
  ('映 CG 活動大廳', 'coworking', 'taipei', '台北市北投區中央南路二段 103 號 6 樓', NULL, NULL, NULL, NULL, '', '', '', 'https://www.incgmedia.com/', '', '', NULL, '', ARRAY['projector','mic','wifi'], '動畫/影像產業活動場地。適合 motion graphics、CG 相關沙龍。詳細資訊待補。', 3);

-- ===== 1b. VENUE IMAGES =====

INSERT INTO venue_images (venue_id, url, caption, sort_order) VALUES
  ((SELECT id FROM venues WHERE name = '三創生活園區 12F 多元展演'), 'https://image.u-car.com.tw/cartitleimage_73388.jpg', '現場照片', 0),
  ((SELECT id FROM venues WHERE name = 'WESTAR'), 'https://resource.iyp.tw/static.iyp.tw/24856/files/8b59f37b-da82-484e-b002-2b3bb22f21bb.jpg', '現場照片', 0),
  ((SELECT id FROM venues WHERE name = 'CORNER MAX 大角落多功能展演館'), 'https://cc.tvbs.com.tw/img/upload/2021/11/25/20211125141058-484057b8.jpg', '現場照片', 0),
  ((SELECT id FROM venues WHERE name = 'NUZONE 展演空間'), 'https://www.popdaily.com.tw/wp-content/uploads/2019/12/45jw215tsy0404c4w8g0wc8wwq20wzf-1000x668.jpg', '現場照片', 0),
  ((SELECT id FROM venues WHERE name = '1921 共享空間'), 'https://www.1921.com.tw/images/1921space_img021.jpg', '現場照片', 0),
  ((SELECT id FROM venues WHERE name = '1921 共享空間'), 'https://www.1921.com.tw/images/1921space_img022.jpg', '現場照片', 1),
  ((SELECT id FROM venues WHERE name = '1921 共享空間'), 'https://www.1921.com.tw/images/1921space_img023.jpg', '現場照片', 2),
  ((SELECT id FROM venues WHERE name = '映 CG 活動大廳'), 'https://image.yes123.com.tw/enterprise_pict/p2/16/16295249_2024419_673000.jpg', '現場照片', 0);

-- ===== 2. SPEAKERS =====

INSERT INTO speakers (name, sub_type, title, company, specialties, bio, avatar_url, fee, fee_unit, contact_phone, contact_email, social_links, notes, rating)
VALUES
  ('Ernest Wong', 'ai', '技術顧問', 'Adobe', ARRAY['Acrobat','PDF 工作流','Custom Model'], 'Adobe 香港暨台灣區首席數位媒體技術顧問，2012 年加入 Adobe，深耕創意工具技術支援逾十年。專責為香港與台灣創意產業提供 Adobe 解決方案的示範、培訓與技術諮詢。', '/speakers/ernest.jpg', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], 'Adobe 原廠人員', 4),
  ('Mark', 'internal', '專案經理', '展碁國際', ARRAY['Photoshop','Claude Code','AI 工作流','Adobe Express'], 'Adobe 產品專家，擅長將 AI 工具融入設計與開發工作流。多次主持 Adobe 快充學堂系列活動。', '/speakers/mark.jpg', NULL, 'per_event', '', '', ARRAY[]::TEXT[], '內部講師，不需外部費用', 5),
  ('平芬秋色', 'creative', '攝影創作者', '', ARRAY['Lightroom','攝影','修圖'], '台灣攝影創作者，以 Lightroom 調色教學見長，活躍於社群媒體，是台灣攝影修圖社群中具有代表性的 KOL。', '/speakers/pfqc.jpg', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('小玩', 'creative', '插畫創作者', '', ARRAY['Illustrator','插畫','向量設計'], '台灣插畫創作者，擅長以 Adobe Illustrator 進行數位插畫創作，透過社群平台與教學內容積累廣大粉絲群。', '/speakers/xiaowanwan.jpg', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('徐漢強', 'creative', '導演', '', ARRAY['Film','導演','影像敘事'], '台灣導演，以改編遊戲的首部劇情長片《返校》獲第 56 屆金馬獎最佳新導演及最佳改編劇本。其後執導《鬼才之道》榮獲第 27 屆台北電影獎最佳導演。', 'https://www.nccu.edu.tw/var/file/0/1000/pictures/355/part_19437_4019049_43929.jpg', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('黃國瑜', 'creative', '設計師', '瑜悅設計', ARRAY['Design','品牌設計'], '瑜悅設計（Transform Design）創辦人，專注於品牌識別、包裝及視覺形象設計，以挖掘品牌本質為核心方法，作品屢獲國際設計獎項肯定。', 'https://image-cdn.learnin.tw/bnextmedia/image/album/2022-10/img-1665739052-70740.jpg?w=600&output=webp', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('田修銓', 'creative', '設計師', '', ARRAY['Design','金點設計'], '台灣新生代設計師，曾策劃《平面設計的形狀》主題特展，邀集方序中、廖小子、聶永真等逾四十位設計師共同參展，致力推廣台灣平面設計文化。', 'https://storage.googleapis.com/goldenpin/judger_account/avatar/296/thumb_2x_image_0a2f69.png', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('郭憲聰', 'creative', '特效總監', '再現影像', ARRAY['VFX','特效','After Effects'], '再現影像製作公司創辦人，曾以《返校》及《消失的情人節》連續榮獲第 56、57 屆金馬獎最佳視覺效果，並以《鬼才之道》奪得第 61 屆金馬獎同一獎項。', 'https://storage-asset.msi.com/tw/picture/news/2020/nb/creative-director-2.jpg', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('解孟儒', 'creative', '導演 / 剪輯師', 'ZABA 眨吧映像', ARRAY['Film','導演','剪輯'], '台灣導演及剪輯師，剪輯作品涵蓋《返校》、《緝魂》等重要台灣電影，曾獲第 58 屆金馬獎最佳剪輯，並以《誰是被害者》入圍金鐘獎。', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIkXqyqlg_aJb6Kyjwnip-h-VfCqX8J8chJA&s', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('陳清琳', 'creative', '設計師', '', ARRAY['Design','空間設計'], '台灣知名設計師，專注空間設計與視覺規劃領域。', 'https://www.taipeinewhorizon.com.tw/uploads/%E5%90%8D%E5%AE%B6%E8%A7%80%E9%BB%9E/2024/%E9%99%B3%E9%9D%92%E7%90%B3/cover.jpg', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('楊士慶', 'creative', '設計師', '', ARRAY['Design','唱片裝幀','視覺設計'], '台灣平面設計師，曾為張惠妹、孫燕姿、盧廣仲等知名藝人操刀演唱會視覺與唱片設計。作品入圍金曲獎及美國獨立音樂獎最佳音樂海報。', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJHueIjJL78sgrFEM5FIgOdHaU_JxEf9sG_A&s', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('陳泳勝', 'creative', '設計師', '海流設計', ARRAY['Design','品牌識別'], '海流設計主理人，以設計作為社會實踐的工具，深耕台灣本土文化議題。2014 年參與太陽花學運紀錄後，立志用設計的力量為這塊土地做點事。', 'https://image-cdn.learnin.tw/bnextmedia/image/album/2023-05/img-1685079844-97252.jpg?w=600&output=webp', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('何廷安', 'creative', '藝術指導', '', ARRAY['Design','字型設計','動態'], '台灣平面設計師與藝術指導，曾任 UltraCombos 數位體驗設計團隊藝術指導，代表作包含金曲獎 GMA30 主視覺及 Giant 品牌博物館。', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlV4VrJ180NTI78AZq_Mr0Vbu1DK4hpdU6Qg&s', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('顏伯駿', 'creative', '設計師', '三頁文', ARRAY['Design','金曲獎視覺'], '三頁文（YEN Design）創辦人暨藝術總監，連續四屆擔任金曲獎視覺統籌，以第 28 屆主視覺榮獲德國紅點及 iF 設計獎。2024 年巴黎文化奧運擔任台灣館視覺創意總監。', 'https://cdn-www.cw.com.tw/article/201912/article-5def74915132b.jpg', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('林呈軒', 'creative', '動畫導演', '二棲設計', ARRAY['Motion','動畫','MG'], '二棲設計創辦人，同時為動態設計教育平台 Motioner 共同創辦人。作品涵蓋連續多屆國慶典禮、台灣燈會、金曲獎等國家級活動主視覺。', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT-DvL7EPKAV2gasDncwihdmO9dVjE1eVhqg&s', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('陳柏尹', 'creative', '動態設計師', 'Motioner', ARRAY['Motion','動態設計'], '深耕動態設計逾五年，為亞洲動態設計學習平台 Motioner 創辦人之一，在 Hahow 等線上平台開設設計課程，累計學員逾三千人。', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQo3Fe3b3woQLOOLqmhr4kpc5T15_CeujQwQ&s', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('黃家賢', 'creative', '設計師', '洋蔥設計', ARRAY['Design','唱片裝幀'], '洋蔥設計創辦人，香港出生，1999 年於台北創立設計公司。曾獲金曲獎最佳專輯裝幀設計、德國紅點獎，並曾入圍葛萊美獎最佳唱片包裝。', 'https://storage.googleapis.com/goldenpin/judger_account/avatar/12/thumb_2x_avatar.png', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('宋政傑', 'creative', '設計師', '', ARRAY['Design','Motion'], '台灣平面暨動態設計師，曾任職洋蔥設計與奧美互動行銷，專長涵蓋平面、動態、插畫、網頁與策展。作品曾入圍金曲裝幀設計及金點設計獎。', 'https://motioner.tw/datas/upload/site/CxxEWw0v9QhwZKw24VsK4IlcHzi2WjiW.png', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('曾國展', 'creative', '設計師', '一件設計', ARRAY['Design','字型設計'], '台南出身，擅長字體設計與品牌視覺識別。代表作包含 2020 年中華民國國慶主視覺及 2019 台灣設計展台南館，曾任誠品書店視覺設計規劃師。', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtFx49T4e0KWjohHrrOnhR5C_yVFU3Ph31Lw&s', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('陳柏豪', 'ai', '設計師', '', ARRAY['Design','Adobe','AI'], '台灣設計師，擅長 Adobe 創意工具應用，活躍於設計教育與創作社群，長期深耕數位視覺設計領域。', 'https://pps.services.adobe.com/api/profile/56B62A1750F0E8330A490D4C@AdobeID/image/b11c7efb-d9b7-42e4-a6ec-17a82dc76b5a/276', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('董十行', 'creative', '設計師', '空集設計', ARRAY['Design','遊戲插畫'], '空集設計共同創辦人，專精 2D/3D 平面繪圖。曾多次參與雷亞遊戲《Cytus》插圖繪製，並與方序中究方社合作多項視覺專案。', 'https://today-obs.line-scdn.net/0hBjopXyPAHUVSCQnnVCdiEmpfETRhbwdMcGoCdycNF3UoJVkSOWpOJidcQGksal0ScmsAd3cBQiF-a14aOw/w280', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('廖國成', 'creative', '插畫家', '', ARRAY['插畫','環境議題'], '台灣插畫家，以溫柔筆觸與淡雅色調為創作特色，透過插畫訴說環境與生命的故事。曾受邀參展奇美博物館「搖擺吧！動物們」藝術設計展。', 'https://service.taipower.com.tw/dsone/images_data/fb49cbeb93b238eeb5c51bc659e8ad17_8000.jpg', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('方序中', 'creative', '設計師', '究方社', ARRAY['Design','金曲獎'], '2013 年創立設計工作室「究方社」，自 2016 年起多次擔任金曲獎、金鐘獎、金馬獎視覺總監，是台灣首位執行過三金典禮主視覺的設計師。', 'https://cdn-www.cw.com.tw/article/201905/article-5ccc244845d61.jpg', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('駿恆', 'creative', '插畫繪師', '龍族數位', ARRAY['Art','插畫','Photoshop'], '龍族數位創辦人，專精奇幻、仙俠與科幻風格的 CG 插畫，接案範疇涵蓋出版、遊戲、影視。長年透過線上課程傳授 CG 繪圖技法。', 'https://cdn1.techbang.com/system/excerpt_images/73745/original/774baf6f10935eb8eec8f96d198d4a4b.jpg?1576583250', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('劉承杰', 'creative', '動畫導演', '浮點設計', ARRAY['Motion','3D','動態設計'], '浮點設計創辦人，擅長 3D 空間構築與超寫實細節描繪。曾為 Gogoro、ASUS、Oppo 等知名品牌製作產品動畫，並於 Motioner 平台開設 3D 課程。', 'https://motioner.tw/datas/upload/site/dZnFbFl1zCnbXdXt2sBjQ4z9F9rsmL13.png', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('欣蒂小姐', 'creative', '插畫家', '', ARRAY['Art','插畫','Photoshop'], '台灣新生代人氣插畫家，自 2012 年起以畫筆記錄生活與情感，代表作《微熟女標本室》以圖文探討女性成長歷程，廣受讀者喜愛。', 'https://womany.net/cdn-cgi/image/w=800,fit=scale-down/https://castle.womany.net/images/content/pictures/21076/womany_ying_mu_kuai_zhao_2014_11_15__xia_wu_2_12_04_1416031942-31243-7109.png', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('鄭鼎', 'creative', '攝影師 / 講者', '單點影像', ARRAY['攝影','商業攝影'], '單點影像公司負責人，Nikon NPS 亞太區代表攝影師。擅長融合時尚與紀實觀點，曾獲 Epson 百萬影像大賞及 TIVAC 攝影新人獎。', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToemwJUzKLMEhGReVqrOLPjahLk2q-__CSYA&s', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4),
  ('蘇暉凱', 'creative', '攝影師 / 講者', '', ARRAY['攝影','Lightroom'], '台灣攝影師，擅長人像與風格攝影，作品兼具細膩光影與獨特視覺語言，長期深耕台灣攝影創作圈。', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI9pIdhIZhhNj_SuF2IoHGPm3VnItuX1_Vog&s', 5000, 'per_hour', '', '', ARRAY[]::TEXT[], '', 4);

-- ===== 3. SPONSORS =====

INSERT INTO sponsors (name, tier, status, logo, website, industry, contact_name, contact_title, contact_phone, contact_email, sponsor_fee, sponsor_benefits, contract_note, notes)
VALUES
  ('Adobe', 'platinum', 'active', '/logos/adobe.png', 'https://adobe.com', '軟體', '', '', '', '', NULL, '主視覺露出、講者提供、產品授權', '', '原廠合作夥伴'),
  ('Microsoft', 'platinum', 'active', '/logos/microsoft.png', 'https://microsoft.com', '軟體', '', '', '', '', NULL, '雲端服務、Copilot 展示', '', ''),
  ('Intel', 'gold', 'active', '/logos/intel.png', 'https://intel.com', 'CPU', '', '', '', '', NULL, '效能展示、聯合行銷', '', ''),
  ('AMD', 'gold', 'negotiating', '/logos/amd.png', 'https://amd.com', 'CPU', '', '', '', '', NULL, '效能展示', '', ''),
  ('NVIDIA', 'gold', 'active', '/logos/nvidia.png', 'https://nvidia.com', 'GPU', '', '', '', '', NULL, 'GPU 加速展示、AI 算力', '', ''),
  ('Wacom', 'gold', 'active', '/logos/wacom.png', 'https://wacom.com', '周邊', '', '', '', '', NULL, '繪圖板體驗區、活動禮品', '', ''),
  ('Logitech', 'silver', 'negotiating', '/logos/logitech.png', 'https://logitech.com', '周邊', '', '', '', '', NULL, '周邊設備體驗', '', ''),
  ('ASUS ProArt', 'gold', 'active', '/logos/asus.png', 'https://asus.com', '工作站', '', '', '', '', NULL, 'ProArt 工作站展示', '', ''),
  ('MSI', 'silver', 'active', '/logos/msi.png', 'https://msi.com', '工作站', '', '', '', '', NULL, '創作者筆電展示', '', ''),
  ('Lenovo', 'silver', 'negotiating', '/logos/lenovo.png', 'https://lenovo.com', '工作站', '', '', '', '', NULL, 'ThinkPad 工作站', '', ''),
  ('GIGABYTE', 'silver', 'negotiating', '/logos/gigabyte.png', 'https://gigabyte.com', '工作站', '', '', '', '', NULL, 'AERO 創作者筆電', '', ''),
  ('Apple', 'gold', 'active', '/logos/apple.png', 'https://apple.com', '工作站', '', '', '', '', NULL, 'Mac 生態系展示', '', ''),
  ('BenQ', 'gold', 'negotiating', '/logos/benq.png', 'https://benq.com', '螢幕', '', '', '', '', NULL, '色準螢幕展示、色彩管理沙龍', '', ''),
  ('LG', 'silver', 'negotiating', '/logos/lg.png', 'https://lg.com', '螢幕', '', '', '', '', NULL, 'UltraFine 螢幕', '', ''),
  ('Sony', 'silver', 'negotiating', '/logos/sony.png', 'https://sony.com', '螢幕/相機', '', '', '', '', NULL, '專業顯示器', '', ''),
  ('Pantone', 'silver', 'active', '/logos/pantone.png', 'https://pantone.com', '色彩', '', '', '', '', NULL, '色彩趨勢分享', '', ''),
  ('SanDisk Pro', 'silver', 'active', '/logos/westerndigital.png', 'https://westerndigital.com', '儲存', '', '', '', '', NULL, '高速儲存展示', '', ''),
  ('QNAP', 'silver', 'active', '/logos/qnap.png', 'https://qnap.com', 'NAS', '', '', '', '', NULL, 'NAS 創作者方案', '', ''),
  ('映 CG / INCG Media', 'media', 'active', '/logos/incgmedia.png', 'https://incgmedia.com', '媒體', '', '', '', '', NULL, '活動報導、社群曝光、場地提供', '', ''),
  ('華康 DynaFont', 'reciprocal', 'active', '/logos/dynacw.png', 'https://dynacw.com.tw', '字型', '', '', '', '', NULL, '字型授權、字型設計沙龍', '', ''),
  ('Reallusion', 'reciprocal', 'active', '/logos/reallusion.png', 'https://reallusion.com', '3D/動畫', '', '', '', '', NULL, 'iClone/Character Creator 展示', '', ''),
  ('Leadtek 麗臺', 'silver', 'active', '/logos/leadtek.png', 'https://leadtek.com', 'GPU', '', '', '', '', NULL, '專業繪圖卡展示', '', '');

-- ===== 3b. SPONSOR PAST EVENTS =====

INSERT INTO sponsor_past_events (sponsor_id, event_name) VALUES
  ((SELECT id FROM sponsors WHERE name = 'Adobe'), 'AI 快充學堂 2026'),
  ((SELECT id FROM sponsors WHERE name = 'Wacom'), 'AI 快充學堂 — Illustrator');

-- ===== 4. SERVICES =====

INSERT INTO services (category, service_name, description, contact_name, contact_phone, contact_email, vendor_name, notes)
VALUES
  ('photography', '活動攝影（全日）', '含空拍機、Nikon NPS 攝影師', '鄭鼎', '', '', '單點影像', 'Epson 百萬影像大賞得主'),
  ('photography', '活動側拍 / 人像攝影', '人像與風格攝影，Lightroom 後製', '蘇暉凱', '', '', '', '個人接案，無公司抬頭'),
  ('livestream', '雙平台同步直播', 'YouTube + Facebook 雙平台，備有導播機', '吳工程師', '0935-678-901', 'live@streamtech.tw', '串流科技', ''),
  ('design', '主視覺設計 + EDM 排版', '主視覺、EDM、社群圖卡', '許設計師', '0922-111-222', 'design@dami.tw', '達美設計', ''),
  ('printing', '大圖輸出 / 海報印刷', '大圖輸出、背板製作、DM 印刷，急件可處理', '李小姐', '02-2567-8901', 'print@creative-print.tw', '創意印刷', ''),
  ('gift', '客製禮品 / 贈品', '客製化禮品、環保袋、馬克杯，MOQ 100 起', '黃業務', '02-2345-6789', 'sales@globalgift.tw', '全球禮品', ''),
  ('catering', '活動餐飲 / Buffet / 餐盒', 'buffet 和餐盒都可做，素食選項多', '王主廚', '02-2712-3456', 'catering@lexiang.tw', '樂饗餐飲', '');
