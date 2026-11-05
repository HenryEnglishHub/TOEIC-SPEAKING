/* Henry English TOEIC Speaking – bilingual UI only.
   Learning content (English vocabulary, IPA, questions, examples and Vietnamese
   meanings) is deliberately excluded. Switch is stored across all four modules. */
(() => {
 'use strict';
 const KEY='henry_toeic_ui_lang_v1';
 const isPhrase=!!document.getElementById('app')&&!document.getElementById('henryHub');
 let current=(()=>{try{return localStorage.getItem(KEY)==='en'?'en':'vi'}catch{return 'vi'}})();
 const EN={
  // Four-area home
  'BẮT ĐẦU HỌC':'START LEARNING',
  'Chọn nội dung':'Choose a learning', 'luyện tập':'area',
  '4 khu vực học · Chọn một mục để bắt đầu.':'4 learning areas · Choose one to begin.',
  'Luyện đề TOEIC':'TOEIC Speaking Tests',
  '30 bộ đề Speaking có đồng hồ và nghe câu hỏi.':'30 Speaking tests with timers and question audio.',
  'Vào luyện đề':'Open practice tests',
  'Luyện phát âm':'Pronunciation Practice',
  '200 từ khó, IPA và 4 trò chơi ôn tập.':'200 challenging words, IPA and 4 practice games.',
  'Vào học phát âm':'Open pronunciation',
  'Từ vựng chủ đề':'Topic Vocabulary',
  '1.686 từ và cụm từ kèm IPA, ví dụ.':'1,686 words and phrases with IPA and examples.',
  'Vào học từ vựng':'Open vocabulary',
  'Luyện câu hỏi số 5, 6, 7 và 11':'Practice Questions 5, 6, 7 & 11',
  'Luyện trả lời câu hỏi, học cụm từ qua 8 game và ghi âm.':'Practice speaking, learn phrases with 8 games and record your answers.',
  'Vào luyện câu hỏi':'Open question practice',
  '⌂   4 mục học':'⌂   4 learning areas',
  '4 mục học':'4 learning areas',
  'Về trang chọn bốn mục học':'Return to the learning hub',
  // Exams and pronunciation
  'Tìm SET hoặc chủ đề…':'Search SETs or topics…',
  'Bắt đầu thời gian':'Start timer',
  '▶ Bắt đầu thời gian':'▶ Start timer',
  '🔊 Nghe câu hỏi':'🔊 Listen to question',
  '↻ Dừng / đặt lại':'↻ Stop / Reset',
  'CHUẨN BỊ':'PREPARATION',
  'TRẢ LỜI':'RESPONSE',
  '← Câu trước':'← Previous question',
  'Câu tiếp theo →':'Next question →',
  'Câu tiếp →':'Next question →',
  'Hình minh họa phong cách ảnh chụp được tạo bằng AI và đã nhúng sẵn; HTML mở ngoại tuyến. Nội dung tự biên soạn, không phải đề ETS chính thức.':'Illustrative images are AI-generated and bundled for offline use. Practice content is original and not official ETS material.',
  '🖨 In đề đang chọn':'🖨 Print selected test',
  'CÁC TỪ KHÓ PHÁT ÂM':'CHALLENGING PRONUNCIATION WORDS',
  '200 từ vựng trong 20 chủ đề dành cho TOEIC Speaking Questions 1–2. Học IPA (UK), nghe phát âm và luyện tập bằng Flashcard, Trắc nghiệm, Chữ bay, Ghép từ dựa trên nghĩa.':'200 words across 20 topics for TOEIC Speaking. Study UK IPA, listen and practise using Flashcards, Quiz, Flying Words and Matching.',
  'Từ vựng':'Vocabulary', 'Chủ đề':'Topics', 'Game luyện tập':'Practice games',
  'Chọn chủ đề':'Choose a topic', 'Tìm từ, IPA hoặc nghĩa':'Search words, IPA or meanings',
  '✓ Chọn tất cả kết quả lọc':'✓ Select all filtered words',
  'Chọn đủ 200 từ':'Select all 200 words',
  'Bỏ chọn tất cả':'Clear all selections',
  'Chỉ hiện từ đã chọn':'Show selected only',
  '⭐ 15 từ đặc biệt dễ sai':'⭐ 15 easily mispronounced words',
  '📚 Học từ':'📚 Study words','🗂️ Flashcard':'🗂️ Flashcards',
  '✅ Trắc nghiệm':'✅ Quiz', '🚀 Chữ bay':'🚀 Flying Words',
  '🧩 Ghép từ theo nghĩa':'🧩 Meaning Match',
  'Tất cả 20 chủ đề':'All 20 topics',
  'Học từ vựng và luyện phát âm':'Study words and pronunciation',
  'Chọn từng từ để ôn bằng game':'Select words to practise with games',
  'Bấm 🔊 để nghe từ, chú ý trọng âm được đánh dấu bằng ˈ trong IPA. Tích chọn từ muốn học; các game dùng từ đã chọn của chủ đề hiện tại.':'Tap 🔊 to hear words and note the ˈ stress mark in IPA. Select words to practise.',
  'Lựa chọn được lưu trên thiết bị này.':'Selections are saved on this device.',
  'Không có nghĩa':'No meaning available',
  // 1686 vocabulary workbench
  'HỌC TỪ VỰNG THEO CHỦ ĐỀ':'TOPIC VOCABULARY',
  '← Trang chính':'← Home', '↩ Danh sách từ':'↩ Word list',
  '📚 Chọn chủ đề':'📚 Choose a topic',
  'Học từ vựng':'Vocabulary learning',
  'Chọn từ muốn học, nghe giọng Anh–Anh và luyện bằng các trò chơi tương tác.':'Select words, listen to UK pronunciation and learn through games.',
  '30 chủ đề':'30 topics', '13 nhóm tính từ':'13 adjective groups', '9 nhóm trạng từ':'9 adverb groups',
  '🟠 Tính từ':'🟠 Adjectives','🔵 Trạng từ':'🔵 Adverbs',
  'Xem từ đã chọn':'Show selected words',
  '▦ Xem đầy đủ':'▦ Expanded view','▦ Xem gọn':'▦ Compact view',
  '✓ Chọn tất cả đang xem':'✓ Select all visible',
  'Bỏ chọn đang xem':'Clear visible selections',
  '🎲 Chọn 20 ngẫu nhiên':'🎲 Pick 20 random words',
  'Xóa toàn bộ lựa chọn':'Clear all selections',
  'Số câu:':'Questions:',
  '🃏 Flashcard':'🃏 Flashcards',
  '🧩 Ghép từ – nghĩa':'🧩 Word–Meaning Match',
  '← Trở lại chọn từ':'← Back to word selection',
  '← Chọn từ mới':'← Select new words',
  '↻ Chơi lại':'↻ Play again', '🔊 Phát âm':'🔊 Pronunciation',
  '🔊 Nghe từ':'🔊 Listen to word',
  'Chạm để xem nghĩa':'Tap to reveal meaning',
  'Chạm để xem lại mặt tiếng Anh':'Tap to see English again',
  'Chọn nghĩa tiếng Việt đúng.':'Choose the correct Vietnamese meaning.',
  'Hệ thống đọc 3 lần. Chạm vào từ tiếng Anh đang bay phù hợp với nghĩa:':'Listen three times. Tap the moving English word matching the meaning:',
  '🔊 Nghe lại 3 lần':'🔊 Listen three times again',
  'Chọn một từ tiếng Anh ở cột trái rồi chọn nghĩa phù hợp ở cột phải. Tối đa 10 cặp mỗi lượt.':'Choose an English word on the left, then match its meaning on the right. Up to 10 pairs per round.',
  '🔊 Nghe từ đã chọn':'🔊 Listen to selected word',
  'Chính xác!':'Correct!', 'Chưa đúng.':'Not quite.', 'Chưa đúng, hãy thử lại.':'Not quite. Try again.',
  'Tiếp →':'Next →', '← Trước':'← Previous',
  // Phrase module, questions, practice and 8 games
  '← TRANG CHÍNH':'← HOME', '← DANH SÁCH CỤM TỪ':'← PHRASE LIST',
  'Học cụm từ & luyện tập':'Learn phrases & practise',
  'Chọn cụm từ có IPA, nghĩa và ví dụ, sau đó luyện qua các trò chơi ghi nhớ.':'Select phrases with IPA, Vietnamese meanings and examples, then practise with memory games.',
  'CHỌN BỘ ĐỀ / CHỦ ĐỀ':'CHOOSE A TEST / TOPIC',
  '✓ Chọn tất cả':'✓ Select all', 'Bỏ chọn':'Clear selection',
  'Chỉ từ đã chọn':'Selected only',
  'Bỏ chọn tất cả':'Clear all',
  '📚 Học cụm từ':'📚 Study phrases',
  '🧩 Ghép từ':'🧩 Matching',
  '🇻🇳 Việt → Chọn Anh':'🇻🇳 Vietnamese → Choose English',
  '🎤 Việt → Nói Anh':'🎤 Vietnamese → Speak English',
  '✍️ Điền từ':'✍️ Fill in the Blank',
  '🔁 Word Echo':'🔁 Word Echo',
  'Chạm cả thẻ để chọn học · nút 🔊 để nghe phát âm Anh Anh.':'Tap a card to select it · Tap 🔊 to hear UK pronunciation.',
  'CÁC CỤM TỪ ĐÃ CHỌN':'SELECTED PHRASES',
  'PHÂN LOẠI:':'CATEGORY:',
  'Tất cả':'All',
  'Không có cụm từ phù hợp. Hãy thử bộ lọc khác.':'No matching phrases. Try another filter.',
  'CÂU HỎI LUYỆN NÓI':'SPEAKING QUESTION',
  'Đọc câu hỏi, học các cụm từ gợi ý bên dưới, rồi luyện nói khi sẵn sàng.':'Read the question, study the suggested phrases, then practise when ready.',
  'Đây là chủ điểm luyện nói; chưa có câu hỏi nguyên văn trong nguồn.':'This is a speaking topic; the source does not contain the full question.',
  '⏱ Bắt đầu luyện nói':'⏱ Start Speaking Practice',
  'Chuẩn bị':'Preparation', 'Trả lời':'Answer',
  '← Quay lại học cụm từ':'← Back to phrase list',
  '⏱ TOEIC SPEAKING · LUYỆN NÓI CÓ ĐẾM GIỜ':'⏱ TOEIC SPEAKING · TIMED SPEAKING PRACTICE',
  'Chưa có nguyên văn câu hỏi từ nguồn; đang hiển thị tên chủ điểm.':'Full source question unavailable; showing topic title.',
  'SẴN SÀNG':'READY', 'THỜI GIAN CHUẨN BỊ':'PREPARATION TIME',
  'ĐANG TRẢ LỜI':'SPEAK NOW', 'HOÀN THÀNH':'COMPLETED',
  'ĐÃ TẠM DỪNG':'PAUSED', 'ĐANG BẬT MICRO...':'STARTING MICROPHONE...',
  'Thiết lập thời gian':'Timer settings',
  'Chuẩn bị (giây)':'Preparation (seconds)',
  'Trả lời (giây)':'Answer (seconds)',
  'Tự ghi âm + tạo script':'Auto-record & transcribe',
  'Tự ghi âm + tạo script khi bắt đầu trả lời':'Auto-record & transcribe when speaking starts',
  'Xin quyền micro khi bắt đầu trả lời. Nếu nhận diện chưa hỗ trợ, em vẫn có thể ghi âm hoặc tự nhập script.':'Microphone permission is requested when you start. If speech recognition is unavailable, record or type your answer.',
  'Hệ thống sẽ xin quyền micro khi em bấm Bắt đầu tính giờ. Nếu không hỗ trợ nhận diện giọng nói, vẫn có thể ghi âm hoặc nhập script.':'Microphone permission is requested on start. You can record or type if recognition is unavailable.',
  'Gợi ý nhanh':'Suggested phrases',
  'Các cụm bạn đã chọn cho câu này':'Phrases selected for this question',
  'Một số cụm gợi ý để triển khai câu trả lời':'Phrases to help develop your answer',
  '▶ Bắt đầu tính giờ':'▶ Start timer', '↻ Luyện lại':'↻ Practise again',
  '⏸ Tạm dừng':'⏸ Pause', '▶ Tiếp tục':'▶ Resume',
  '↻ Đặt lại':'↻ Reset', 'Câu tiếp →':'Next question →',
  '🎙 Bản ghi âm & script câu trả lời':'🎙 Recording & Answer Transcript',
  'Nghe lại giọng nói và đọc lại phần trả lời của em.':'Listen again and review your answer.',
  'Nghe lại giọng nói và đọc lại những gì em đã trả lời.':'Listen again and read what you said.',
  'Luyện nói':'Speaking practice',
  'Đã kết thúc':'Finished','● Đang ghi âm':'● Recording',
  'Đã tạm dừng':'Paused',
  '🎙 Ghi âm ngay':'🎙 Record now','🎙 Ghi âm thêm':'🎙 Record again',
  '⏹ Dừng ghi âm':'⏹ Stop recording',
  '📝 Bật nhận diện lại':'📝 Restart transcription',
  '📝 ⏹ Dừng nhận diện':'📝 ⏹ Stop transcription',
  '⬇ Tải bản ghi âm':'⬇ Download recording',
  '📝 SCRIPT CÂU TRẢ LỜI CỦA EM':'📝 YOUR ANSWER TRANSCRIPT',
  '📋 Sao chép script':'📋 Copy transcript',
  '⬇ Tải script .txt':'⬇ Download transcript .txt',
  '💾 Lưu script trên máy':'💾 Save transcript locally',
  'Xoá script':'Clear transcript',
  'Bản ghi chỉ lưu tạm trong trình duyệt cho đến khi tải về.':'Recording is temporary until downloaded.',
  'Giọng Anh–Anh (en-GB). Nếu trình duyệt không hỗ trợ nhận diện, em vẫn có thể tự nhập script sau khi ghi âm.':'UK English (en-GB). If transcription is unavailable, type your answer after recording.',
  'Gợi ý cụm từ cho':'Phrase suggestions for',
  'Các cụm từ gợi ý; có thể chọn trước ở màn hình danh sách':'Suggested phrases; you can preselect them on the list screen.',
  'Những cụm bạn đã chọn trong Question này':'Phrases you selected for this question',
  'Chọn trò chơi ghi nhớ':'Choose a memory game',
  'Mỗi game chỉ sử dụng những cụm từ bạn đã chọn.':'Each game uses only the phrases you selected.',
  'Các trò chơi sử dụng đúng những cụm từ bạn đã chọn.':'Games use only your selected phrases.',
  '← Quay lại chọn cụm từ':'← Back to phrase selection',
  'Lật thẻ Anh – Việt để ghi nhớ':'Flip English–Vietnamese cards to memorise phrases',
  'Ghép đúng cụm từ với nghĩa':'Match phrases with their Vietnamese meanings',
  'Đọc tiếng Anh, chọn nghĩa đúng':'Read English and choose the correct Vietnamese meaning',
  'Nghe/đọc nghĩa và chọn cụm từ':'Read or listen to the Vietnamese meaning and choose English',
  'Nhìn nghĩa, tự nói lại tiếng Anh':'See the Vietnamese meaning and say the phrase in English',
  'Chọn từ còn thiếu trong cụm':'Choose the missing word in the phrase',
  'Nghe Anh hoặc Việt, chạm đúng cụm':'Listen in English or Vietnamese and tap the correct phrase',
  'Nghe nhanh → chậm, luyện nhắc lại':'Listen fast → slow, then repeat aloud',
  'Không tải được Word Echo. Vui lòng thử mở trang trên Chrome hoặc Edge.':'Word Echo could not load. Try Chrome or Edge.',
  '← Quay lại':'← Back',
  '← Danh sách cụm từ':'← Phrase list',
  'Trình duyệt chưa hỗ trợ đọc văn bản.':'Speech synthesis is unsupported in this browser.',
  'Trình duyệt không hỗ trợ đọc văn bản.':'Speech synthesis is unavailable in this browser.',
  'Hoàn thành lượt nghe.':'Playback finished.',
  'Đang phát âm...':'Speaking...',
  'Hãy chọn ít nhất 1 cụm từ trước khi chơi.':'Select at least one phrase to play.',
  'Game Ghép từ cần chọn ít nhất 2 cụm từ.':'Matching requires at least two phrases.',
  'Sang SET kế tiếp →':'Next SET →',
  'Trình duyệt không hỗ trợ giọng đọc.':'Speech synthesis is not supported.',
  'Trình duyệt này không hỗ trợ phát âm tự động.':'Automatic pronunciation is not supported in this browser.',
  'Không tìm thấy từ phù hợp. Thử chủ đề khác hoặc tắt bộ lọc.':'No matching words. Try another topic or turn off the filter.',
  '🗂️ Flashcard – Anh ↔ Việt':'🗂️ English ↔ Vietnamese Flashcards',
  'Chạm vào thẻ để lật mặt; mỗi lần hiện hoặc đổi mặt, hệ thống đọc từ tiếng Anh.':'Tap a flashcard to flip it. The English word is spoken on every flip.',
  'Mặt sau · Nghĩa tiếng Việt':'Back · Vietnamese meaning',
  'Mặt trước · Từ tiếng Anh':'Front · English word',
  'Học lại từ đầu ↻':'Restart ↻',
  'Thẻ tiếp theo →':'Next card →',
  '🎉 Hoàn thành phần trắc nghiệm':'🎉 Quiz completed',
  'Làm lại & đảo câu hỏi':'Retry & shuffle questions',
  '✅ Trắc nghiệm nghĩa tiếng Việt':'✅ Vietnamese Meaning Quiz',
  'Nghe hoặc nhìn từ tiếng Anh rồi chọn một trong bốn nghĩa.':'Listen to or read English, then choose one of four Vietnamese meanings.',
  'Xem kết quả':'View results',
  '🚀 Hoàn thành game Chữ bay!':'🚀 Flying Words completed!',
  'Chơi lại / Trộn từ':'Play again / Shuffle words',
  '🚀 Chữ bay – Nghe rồi chọn từ':'🚀 Flying Words – Listen and choose',
  'Các từ chuyển động nhẹ; hệ thống đọc từ mục tiêu 3 lần. Chạm chính xác vào từ bạn nghe.':'Words move around. Hear the target word three times, then tap the matching word.',
  'Đã hoàn tất lượt':'Round completed',
  'Các chữ đang bay':'Moving words',
  '✕ Chưa đúng. Nghe lại và chọn từ khác!':'✕ Not quite. Listen again and choose another word!',
  '🧩 Ghép từ dựa trên nghĩa':'🧩 Word–Meaning Matching',
  'Chọn một từ tiếng Anh rồi chọn nghĩa tiếng Việt tương ứng; hoàn thành toàn bộ từ đã chọn.':'Select an English word and its corresponding Vietnamese meaning.',
  'Hoàn thành lượt':'Round complete',
  'Ghép đúng!':'Matched!',
  'Sai, hãy thử ghép lại!':'Not a match. Try again!',
  '✓ Đã ghép đúng một cặp!':'✓ Pair matched!',
  '✕ Hai thẻ chưa khớp, thử lại nhé.':'✕ The two cards do not match. Try again.',
  '🎉 Hoàn thành game Ghép từ!':'🎉 Matching completed!',
  'Làm lại / Trộn thẻ':'Retry / Shuffle cards',
  'Tính từ':'Adjectives','Trạng từ':'Adverbs',
  'Không tìm thấy từ. Hãy đổi chủ đề hoặc từ khóa tìm kiếm.':'No matching words. Change the topic or search term.',
  '🎉 Hoàn thành!':'🎉 Completed!',
  'Bạn có thể chơi lại với cùng nhóm từ hoặc thay đổi lựa chọn.':'Play again with the same words or change your selection.',
  'Hãy chọn ít nhất một từ trước khi bắt đầu.':'Please select at least one word to begin.',
  'Chủ đề trước':'Previous topic','Chủ đề sau':'Next topic',
  'Chọn bộ đề hoặc chủ đề':'Choose a test or topic',
  'Chọn câu hỏi':'Choose a question',
  'Cụm từ':'Phrases',
  'Trắc nghiệm':'Quiz','Điền từ':'Fill in the blank','Chữ bay':'Flying Words',
  'Ghép từ':'Matching','Việt → Chọn Anh':'Vietnamese → Choose English',
  'Việt → Nói Anh':'Vietnamese → Speak English',
  'Chọn trò chơi':'Choose a game',
  'Chạm để lật ↻ · Mỗi lần lật sẽ đọc tiếng Anh':'Tap to flip ↻ · English is read on every flip',
  '✅ Chính xác!':'✅ Correct!',
  '💡 Đáp án đúng:':'💡 Correct answer:',
  'Xem kết quả →':'See results →',
  'CHỌN TỪ CÒN THIẾU':'CHOOSE THE MISSING WORD',
  '💡 Từ đúng:':'💡 Correct word:',
  '🔊 Nghe cụm từ':'🔊 Listen to phrase',
  'Tiếp theo →':'Next →',
  'Chạm một cụm tiếng Anh và nghĩa tiếng Việt tương ứng.':'Tap an English phrase and its matching Vietnamese meaning.',
  'TIẾNG ANH':'ENGLISH','TIẾNG VIỆT':'VIETNAMESE',
  'NHÌN NGHĨA – NÓI TIẾNG ANH':'READ MEANING – SPEAK ENGLISH',
  '🎙️ Bắt đầu nói':'🎙️ Start speaking',
  '🔊 Nghe mẫu':'🔊 Listen to model',
  'Chế độ này hỗ trợ nhận diện lời nói trên trình duyệt, không phải hệ thống chấm phát âm bằng AI.':'This mode uses browser speech recognition, not AI pronunciation scoring.',
  'DỌN SẠCH BẦU TRỜI!':'SKY CLEARED!',
  'Đóng game':'Close game',
  'Các cụm đang bay':'Flying phrases',
  'Ngôn ngữ đọc':'Audio language',
  'Tốc độ chữ bay':'Flying speed',
  'Chưa đúng rồi. Bấm Replay để nghe lại!':'Not correct. Press Replay to listen again!',
  'Tốc độ đầu':'Start speed',
  'Tốc độ cuối':'End speed',
  'Lặp lại':'Repeats',
  'Khoảng nghỉ':'Pause interval',
  'Tự chuyển':'Auto advance',
  '▶ Nghe & nhắc lại':'▶ Listen & Repeat',
  '■ Dừng':'■ Stop',
  'Nghe cụm tiếng Anh từ nhanh đến chậm, sau đó nghe nghĩa tiếng Việt.':'Listen to the English phrase from fast to slow, followed by its Vietnamese meaning.',
  'Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Bạn có thể tự nói rồi bấm Hiện đáp án.':'Speech recognition is unavailable. Speak aloud, then press Show Answer.',
  'Không thể bật micro. Hãy kiểm tra quyền micro.':'Cannot start the microphone. Check microphone permissions.',
  'Đã dừng nhận diện; script vẫn được giữ lại.':'Transcription stopped; your transcript is retained.',
  'Hãy dừng ghi âm trước khi tải.':'Stop recording before downloading.',
  'Script đang trống.':'Transcript is empty.',
  'Đã sao chép script.':'Transcript copied.',
  'Đã lưu script trên thiết bị này.':'Transcript saved on this device.',
  'Hãy chọn ít nhất 1 cụm từ trước khi chơi.':'Select at least one phrase before playing.',
  'Hãy chọn văn bản để sao chép.':'Select text to copy.',
  'Hãy chọn cụm từ rồi chọn trò chơi ở phía trên nhé.':'Choose phrases, then select a game above.',
  'Chọn ít nhất 1 cụm từ trước nhé.':'Select at least one phrase first.',
  'Hãy chọn nghĩa tương ứng ở cột bên phải.':'Choose the matching meaning on the right.',
  'Hãy chọn một cụm tiếng Anh bên trái trước.':'Choose an English phrase on the left first.',
  '✅ Ghép chính xác!':'✅ Correct match!',
  'Chưa đúng. Thử lại nhé!':'Not correct. Try again!',
  '🇻🇳 Đang đọc nghĩa tiếng Việt':'🇻🇳 Reading the Vietnamese meaning',
  'Đã dừng. Có thể phát lại hoặc chuyển cụm khác.':'Stopped. Replay or move to another phrase.',
  'Cần HTTPS và trình duyệt hỗ trợ micro để ghi âm.':'Recording requires HTTPS and a browser that supports microphones.',
  'Đang ghi âm câu trả lời...':'Recording your answer...',
  'Chưa bật được micro; em vẫn có thể luyện nói và gõ lại script.':'Microphone unavailable; you can still practise and type your transcript.',
  'Đã kết thúc lượt nói. Em có thể đọc lại và sửa script bên dưới.':'Speaking time ended. Review and edit your transcript below.',
  'Đã khôi phục script bạn lưu trước đó trên thiết bị này.':'Your previously saved transcript has been restored.',
  'Chưa ghi âm. Hãy chọn Bắt đầu tính giờ.':'No recording yet. Select Start timer.',
  'Đã dừng ghi âm. Em có thể nghe lại hoặc tải xuống.':'Recording stopped. Listen or download it.',
  'Chưa có nội dung để tải.':'Nothing to download yet.',
  'Đã xoá phần chữ. Bản ghi âm vẫn giữ nguyên.':'Transcript cleared; recording retained.',
  'Ghi âm và script câu trả lời':'Recording and answer transcript',
  // Word Echo original IELTS interface (visuals and mechanics unchanged)
  '← Trước':'← Previous',
  '▶ Bắt đầu':'▶ Start',
  '↻ Xem lại':'↻ Replay',
  'Từ tiếp theo →':'Next word →',
  'NGHE TỪ. NHỚ NHANH.':'LISTEN. REMEMBER FAST.',
  'NHỚ NHANH.':'REMEMBER FAST.',
  'Từ tiếng Anh được đọc rất nhanh ở đầu, giảm tốc dần qua từng lượt. Nghĩa tiếng Việt chỉ đọc một lần, sau cùng.':'English starts fast and slows down with each repetition. The Vietnamese meaning is read once at the end.',
  '▶ Nghe nhanh rồi chậm dần':'▶ Listen fast, then slow',
  'Tốc độ tiếng Anh ban đầu':'Starting English speed',
  'Tốc độ tiếng Anh cuối lượt':'Final English speed',
  'Tổng số lần đọc tiếng Anh':'English repetitions',
  'Khoảng nghỉ tối đa khi giảm tốc':'Maximum pause while slowing down',
  'Tự chuyển từ':'Auto advance',
  'Không nghỉ':'No pause'
 };
 const PLACEHOLDERS={
  'Tìm SET hoặc chủ đề…':'Search SETs or topics…',
  'Ví dụ: itinerary, /ˈ/, thông báo…':'Example: itinerary, /ˈ/, announcement…',
  'Tìm từ tiếng Anh, IPA hoặc nghĩa tiếng Việt...':'Search English, IPA or Vietnamese meanings...',
  'Tìm cụm từ, IPA, nghĩa hoặc ví dụ...':'Search phrases, IPA, meanings or examples...',
  'Script sẽ xuất hiện ở đây khi trình duyệt nhận diện được lời nói. Em cũng có thể gõ hoặc sửa lại câu trả lời.':'Your transcript appears here if speech recognition is available. You can also type or correct your answer.'
 };
 const skipSelector='script,style,textarea,pre,code,.vi,.lexMeaning,.lexWord,.lexWords,.lexEx,.vx-wordcard,.vx-choices,.vx-matchgrid,.wordrow,.phrase-list,.practice-phrase,.practice-phrase-grid,.practice-mini-chip-list,.practice-phrase-grid,.answer-grid,.questionbody,#qcontent,.lexGameWord,.lexGameMeaning,.lexMatchColumn,.lexChoices,.lexFeedback,.practice-script-label~textarea,.example,.phrase-card-body,.speaking-vi,.speech-result,.lexListWords';
 const nodeState=new WeakMap(),attrState=new WeakMap();
 const rules=[
  [/^(\d+) cụm đã chọn$/,'$1 phrases selected'],
  [/^(\d+) cụm từ$/,'$1 phrases'],
  [/^Đã chọn (\d+) cụm từ\.$/,'Selected $1 phrases.'],
  [/^(\d+) từ đã chọn$/,'$1 words selected'],
  [/^(\d+) từ hiển thị$/,'$1 words shown'],
  [/^(\d+) điểm$/,'$1 points'],
  [/^Hiển thị (\d+) từ$/,'Showing $1 words'],
  [/^Đã chọn (\d+)$/,'Selected $1'],
  [/^QUESTION (\d+) –/,'QUESTION $1 –'],
  [/^Câu hỏi (\d+)$/,'Question $1'],
  [/^Gợi ý cụm từ cho Question (\d+)$/,'Phrase suggestions for Question $1'],
  [/^Chuẩn bị (\d+)s · Trả lời (\d+)s$/,'Prepare $1s · Answer $2s'],
  [/^Chuẩn bị (\d+)s · Trả lời (\d+)s$/,'Prepare $1s · Answer $2s'],
  [/^Đã chọn (\d+) cụm từ\. Mỗi game chỉ sử dụng những cụm từ bạn đã chọn\.$/,'Selected $1 phrases. Games use only your selected phrases.'],
  [/^Chọn nghĩa tiếng Việt đúng\.$/,'Choose the correct Vietnamese meaning.'],
  [/^Tất cả (\d+) chủ đề$/,'All $1 topics'],
  [/^Chọn đủ (\d+) từ$/,'Select all $1 words'],
  [/^(\d+) lần$/,'$1 times'],
  [/^(\d+(?:[,.]\d+)?) giây$/,'$1 seconds'],
  [/^Nạp từ vào trí nhớ: (\d+)%$/,'Memory loading: $1%']
 ];
 function translateText(vi){
   if(EN[vi]!==undefined)return EN[vi];
   for(const [re,rep] of rules)if(re.test(vi))return vi.replace(re,rep);
   return vi;
 }
 function transformNode(node, lang){
   if(!node.nodeValue||!node.nodeValue.trim())return;
   const value=node.nodeValue;
   let record=nodeState.get(node);
   if(!record){record={vi:value,en:null};nodeState.set(node,record)}
   if(value!==record.vi&&value!==record.en){record.vi=value;record.en=null}
   if(record.en===null){
     const trimmed=record.vi.trim();
     const translated=translateText(trimmed);
     record.en=translated===trimmed?record.vi:record.vi.replace(trimmed,translated);
   }
   const desired=lang==='en'?record.en:record.vi;
   if(value!==desired)node.nodeValue=desired;
 }
 function transformAttr(el,attr,lang){
   if(!el.hasAttribute(attr))return;
   const value=el.getAttribute(attr);
   let attrMap=attrState.get(el);if(!attrMap){attrMap={};attrState.set(el,attrMap)}
   let r=attrMap[attr];if(!r){r={vi:value,en:null};attrMap[attr]=r}
   if(value!==r.vi&&value!==r.en){r.vi=value;r.en=null}
   if(r.en===null){r.en=(PLACEHOLDERS[r.vi]??translateText(r.vi))}
   const wanted=lang==='en'?r.en:r.vi;
   if(value!==wanted)el.setAttribute(attr,wanted);
 }
 function translateDocument(){
   document.documentElement.lang=current;
   const root=document.body;if(!root)return;
   const FILTER=window.NodeFilter;
   const walk=document.createTreeWalker(root,FILTER.SHOW_ELEMENT|FILTER.SHOW_TEXT,{
     acceptNode(node){
       if(node.nodeType===1&&node.matches(skipSelector))return FILTER.FILTER_REJECT;
       return FILTER.FILTER_ACCEPT;
     }
   });
   let node;
   while((node=walk.nextNode())){
     if(node.nodeType===3)transformNode(node,current);
     else if(node.nodeType===1&&node.matches('button,input,select,option,textarea,a,label,[title],[aria-label]')){
       for(const attr of ['placeholder','title','aria-label'])transformAttr(node,attr,current);
     }
   }
 }
 function makeSwitch(){
   const box=document.createElement('div');box.className='toeic-lang-switch';box.setAttribute('role','group');box.setAttribute('aria-label','Website language / Ngôn ngữ giao diện');
   for(const [lang,label] of [['vi','VI'],['en','EN']]){
     const btn=document.createElement('button');btn.type='button';btn.dataset.toeicLang=lang;btn.textContent=label;
     btn.title=lang==='en'?'English interface':'Giao diện tiếng Việt';
     btn.addEventListener('click',()=>setLanguage(lang));box.append(btn);
   }
   return box;
 }
 function ensureSwitch(){
   const selectors=isPhrase?['.top-right']:['.hubMinimalTop','.modebar','.lexTop'];
   for(const selector of selectors){
     const target=document.querySelector(selector);
     if(!target||target.querySelector('.toeic-lang-switch'))continue;
     target.append(makeSwitch());
   }
   document.querySelectorAll('.toeic-lang-switch button').forEach(b=>{
     b.setAttribute('aria-pressed',String(b.dataset.toeicLang===current));
   });
 }
 let scheduled=false;
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;ensureSwitch();translateDocument()})}
 function setLanguage(lang){
   if(lang!=='vi'&&lang!=='en')return;
   current=lang;
   try{localStorage.setItem(KEY,lang)}catch{}
   schedule();
 }
 window.HenryToeicLanguage={get:()=>current,set:setLanguage};
 window.addEventListener('storage',e=>{if(e.key===KEY){current=e.newValue==='en'?'en':'vi';schedule()}});
 function init(){
   ensureSwitch();translateDocument();
   const observer=new MutationObserver(()=>schedule());
   observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
