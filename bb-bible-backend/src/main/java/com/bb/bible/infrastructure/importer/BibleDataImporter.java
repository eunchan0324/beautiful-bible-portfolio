package com.bb.bible.infrastructure.importer;

import com.bb.bible.domain.bible.entity.BibleBook;
import com.bb.bible.domain.bible.entity.BibleChapter;
import com.bb.bible.domain.bible.entity.BibleVerse;
import com.bb.bible.domain.bible.entity.Testament;
import com.bb.bible.domain.bible.repository.BibleBookRepository;
import com.bb.bible.domain.bible.repository.BibleChapterRepository;
import com.bb.bible.domain.bible.repository.BibleVerseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.io.ClassPathResource;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Transactional
public class BibleDataImporter implements CommandLineRunner {
    private final BibleBookRepository bookRepository;
    private final BibleChapterRepository chapterRepository;
    private final BibleVerseRepository verseRepository;
    private final ObjectMapper objectMapper;

    private static final Object[][] BOOK_META = {{"창", "창세기", Testament.OLD, 1, 50}, {"출", "출애굽기", Testament.OLD, 2, 40}, {"레", "레위기", Testament.OLD, 3, 27}, {"민", "민수기", Testament.OLD, 4, 36}, {"신", "신명기", Testament.OLD, 5, 34}, {"수", "여호수아", Testament.OLD, 6, 24}, {"삿", "사사기", Testament.OLD, 7, 21}, {"룻", "룻기", Testament.OLD, 8, 4}, {"삼상", "사무엘상", Testament.OLD, 9, 31}, {"삼하", "사무엘하", Testament.OLD, 10, 24}, {"왕상", "열왕기상", Testament.OLD, 11, 22}, {"왕하", "열왕기하", Testament.OLD, 12, 25}, {"대상", "역대상", Testament.OLD, 13, 29}, {"대하", "역대하", Testament.OLD, 14, 36}, {"스", "에스라", Testament.OLD, 15, 10}, {"느", "느헤미야", Testament.OLD, 16, 13}, {"에", "에스더", Testament.OLD, 17, 10}, {"욥", "욥기", Testament.OLD, 18, 42}, {"시", "시편", Testament.OLD, 19, 150}, {"잠", "잠언", Testament.OLD, 20, 31}, {"전", "전도서", Testament.OLD, 21, 12}, {"아", "아가", Testament.OLD, 22, 8}, {"사", "이사야", Testament.OLD, 23, 66}, {"렘", "예레미야", Testament.OLD, 24, 52}, {"애", "예레미야애가", Testament.OLD, 25, 5}, {"겔", "에스겔", Testament.OLD, 26, 48}, {"단", "다니엘", Testament.OLD, 27, 12}, {"호", "호세아", Testament.OLD, 28, 14}, {"욜", "요엘", Testament.OLD, 29, 3}, {"암", "아모스", Testament.OLD, 30, 9}, {"옵", "오바댜", Testament.OLD, 31, 1}, {"욘", "요나", Testament.OLD, 32, 4}, {"미", "미가", Testament.OLD, 33, 7}, {"나", "나훔", Testament.OLD, 34, 3}, {"합", "하박국", Testament.OLD, 35, 3}, {"습", "스바냐", Testament.OLD, 36, 3}, {"학", "학개", Testament.OLD, 37, 2}, {"슥", "스가랴", Testament.OLD, 38, 14}, {"말", "말라기", Testament.OLD, 39, 4}, {"마", "마태복음", Testament.NEW, 40, 28}, {"막", "마가복음", Testament.NEW, 41, 16}, {"눅", "누가복음", Testament.NEW, 42, 24}, {"요", "요한복음", Testament.NEW, 43, 21}, {"행", "사도행전", Testament.NEW, 44, 28}, {"롬", "로마서", Testament.NEW, 45, 16}, {"고전", "고린도전서", Testament.NEW, 46, 16}, {"고후", "고린도후서", Testament.NEW, 47, 13}, {"갈", "갈라디아서", Testament.NEW, 48, 6}, {"엡", "에베소서", Testament.NEW, 49, 6}, {"빌", "빌립보서", Testament.NEW, 50, 4}, {"골", "골로새서", Testament.NEW, 51, 4}, {"살전", "데살로니가전서", Testament.NEW, 52, 5}, {"살후", "데살로니가후서", Testament.NEW, 53, 3}, {"딤전", "디모데전서", Testament.NEW, 54, 6}, {"딤후", "디모데후서", Testament.NEW, 55, 4}, {"딛", "디도서", Testament.NEW, 56, 3}, {"몬", "빌레몬서", Testament.NEW, 57, 1}, {"히", "히브리서", Testament.NEW, 58, 13}, {"약", "야고보서", Testament.NEW, 59, 5}, {"벧전", "베드로전서", Testament.NEW, 60, 5}, {"벧후", "베드로후서", Testament.NEW, 61, 3}, {"요일", "요한일서", Testament.NEW, 62, 5}, {"요이", "요한이서", Testament.NEW, 63, 1}, {"요삼", "요한삼서", Testament.NEW, 64, 1}, {"유", "유다서", Testament.NEW, 65, 1}, {"계", "요한계시록", Testament.NEW, 66, 22}};

    @Override
    public void run(String... args) throws Exception {
        if (bookRepository.count() > 0) return;

        List<BibleBook> books = new ArrayList<>();
        for (Object[] meta : BOOK_META) {
            BibleBook book = BibleBook.builder().bookCode((String) meta[0]).nameKorean((String) meta[1]).testament((Testament) meta[2]).bookOrder((Integer) meta[3]).chapterCount((Integer) meta[4]).build();

            books.add(book);
        }

        List<BibleBook> savedBooks = bookRepository.saveAll(books);

        List<BibleChapter> chapters = new ArrayList<>();
        for (BibleBook savedBook : savedBooks) {
            for (int c = 1; c <= savedBook.getChapterCount(); c++) {
                chapters.add(BibleChapter.builder().book(savedBook).chapterNum(c).build());
            }
        }
        List<BibleChapter> savedChapters = chapterRepository.saveAll(chapters);

        Map<String, Map<Integer, BibleChapter>> chapterMap = new HashMap<>();
        for (BibleChapter ch : savedChapters) {
            chapterMap.computeIfAbsent(ch.getBook().getBookCode(), k -> new HashMap<>()).put(ch.getChapterNum(), ch);
        }

        ClassPathResource resource = new ClassPathResource("data/bible.json");
        Map<String, String> verseMap = objectMapper.readValue(resource.getInputStream(), new TypeReference<Map<String, String>>() {
        });

        List<BibleVerse> batch = new ArrayList<>();

        for (Map.Entry<String, String> entry : verseMap.entrySet()) {
            String verseKey = entry.getKey();
            String verseText = entry.getValue().replace("\u0000", "");

            int i = 0;
            while (i < verseKey.length() && !Character.isDigit(verseKey.charAt(i))) {
                i++;
            }
            String bookCode = verseKey.substring(0, i);
            String[] parts = verseKey.substring(i).split(":");
            int chapterNum = Integer.parseInt(parts[0]);

            if (parts[1].contains("-")) continue;

            int verseNum = Integer.parseInt(parts[1]);

            BibleChapter chapter = chapterMap.get(bookCode).get(chapterNum);

            batch.add(BibleVerse.builder().chapter(chapter).verseNum(verseNum).verseText(verseText).verseKey(verseKey).build());

            if (batch.size() == 500) {
                verseRepository.saveAll(batch);
                batch.clear();
            }
        }

        if (!batch.isEmpty()) {
            verseRepository.saveAll(batch);
        }
    }
}
