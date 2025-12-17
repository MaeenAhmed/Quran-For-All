document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const surahGrid = document.getElementById('surah-grid');
    const reciterSelect = document.getElementById('reciter-select');
    const translationSelect = document.getElementById('translation-select');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noorModalElement = document.getElementById('noorModal');
    const noorMessageText = document.getElementById('noorMessageText');
    const noorMessageTranslation = document.getElementById('noorMessageTranslation');
    const noorMessageSource = document.getElementById('noorMessageSource');

    // --- Constants ---
    const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
    const MODAL_COOLDOWN_HOURS = 3;

    // V2.0 ARCHITECTURE: Static Surah list for 100% reliability and instant load.
    const STATIC_SURAHS = [
        {number: 1, name: "سُورَةُ ٱلْفَاتِحَةِ", englishName: "Al-Faatiha", numberOfAyahs: 7}, {number: 2, name: "سُورَةُ ٱلْبَقَرَةِ", englishName: "Al-Baqara", numberOfAyahs: 286},
        {number: 3, name: "سُورَةُ آلِ عِمْرَانَ", englishName: "Aal-i-Imraan", numberOfAyahs: 200}, {number: 4, name: "سُورَةُ ٱلنِّسَاءِ", englishName: "An-Nisaa", numberOfAyahs: 176},
        {number: 5, name: "سُورَةُ ٱلْمَائِدَةِ", englishName: "Al-Maaida", numberOfAyahs: 120}, {number: 6, name: "سُورَةُ ٱلْأَنْعَامِ", englishName: "Al-An'aam", numberOfAyahs: 165},
        {number: 7, name: "سُورَةُ ٱلْأَعْرَافِ", englishName: "Al-A'raaf", numberOfAyahs: 206}, {number: 8, name: "سُورَةُ ٱلْأَنْفَالِ", englishName: "Al-Anfaal", numberOfAyahs: 75},
        {number: 9, name: "سُورَةُ ٱلتَّوْبَةِ", englishName: "At-Tawba", numberOfAyahs: 129}, {number: 10, name: "سُورَةُ يُونُسَ", englishName: "Yunus", numberOfAyahs: 109},
        {number: 11, name: "سُورَةُ هُودٍ", englishName: "Hud", numberOfAyahs: 123}, {number: 12, name: "سُورَةُ يُوسُفَ", englishName: "Yusuf", numberOfAyahs: 111},
        {number: 13, name: "سُورَةُ ٱلرَّعْدِ", englishName: "Ar-Ra'd", numberOfAyahs: 43}, {number: 14, name: "سُورَةُ إِبْرَاهِيمَ", englishName: "Ibrahim", numberOfAyahs: 52},
        {number: 15, name: "سُورَةُ ٱلْحِجْرِ", englishName: "Al-Hijr", numberOfAyahs: 99}, {number: 16, name: "سُورَةُ ٱلنَّحْلِ", englishName: "An-Nahl", numberOfAyahs: 128},
        {number: 17, name: "سُورَةُ ٱلْإِسْرَاءِ", englishName: "Al-Israa", numberOfAyahs: 111}, {number: 18, name: "سُورَةُ ٱلْكَهْفِ", englishName: "Al-Kahf", numberOfAyahs: 110},
        {number: 19, name: "سُورَةُ مَرْيَمَ", englishName: "Maryam", numberOfAyahs: 98}, {number: 20, name: "سُورَةُ طه", englishName: "Taa-Haa", numberOfAyahs: 135},
        {number: 21, name: "سُورَةُ ٱلْأَنْبِيَاءِ", englishName: "Al-Anbiyaa", numberOfAyahs: 112}, {number: 22, name: "سُورَةُ ٱلْحَجِّ", englishName: "Al-Hajj", numberOfAyahs: 78},
        {number: 23, name: "سُورَةُ ٱلْمُؤْمِنُونَ", englishName: "Al-Muminoon", numberOfAyahs: 118}, {number: 24, name: "سُورَةُ ٱلنُّورِ", englishName: "An-Noor", numberOfAyahs: 64},
        {number: 25, name: "سُورَةُ ٱلْفُرْقَانِ", englishName: "Al-Furqaan", numberOfAyahs: 77}, {number: 26, name: "سُورَةُ ٱلشُّعَرَاءِ", englishName: "Ash-Shu'araa", numberOfAyahs: 227},
        {number: 27, name: "سُورَةُ ٱلنَّمْلِ", englishName: "An-Naml", numberOfAyahs: 93}, {number: 28, name: "سُورَةُ ٱلْقَصَصِ", englishName: "Al-Qasas", numberOfAyahs: 88},
        {number: 29, name: "سُورَةُ ٱلْعَنْكَبُوتِ", englishName: "Al-Ankaboot", numberOfAyahs: 69}, {number: 30, name: "سُورَةُ ٱلرُّومِ", englishName: "Ar-Room", numberOfAyahs: 60},
        {number: 31, name: "سُورَةُ لُقْمَانَ", englishName: "Luqman", numberOfAyahs: 34}, {number: 32, name: "سُورَةُ ٱلسَّجْدَةِ", englishName: "As-Sajda", numberOfAyahs: 30},
        {number: 33, name: "سُورَةُ ٱلْأَحْزَابِ", englishName: "Al-Ahzaab", numberOfAyahs: 73}, {number: 34, name: "سُورَةُ سَبَإٍ", englishName: "Saba", numberOfAyahs: 54},
        {number: 35, name: "سُورَةُ فَاطِرٍ", englishName: "Faatir", numberOfAyahs: 45}, {number: 36, name: "سُورَةُ يسٓ", englishName: "Yaseen", numberOfAyahs: 83},
        {number: 37, name: "سُورَةُ ٱلصَّافَّاتِ", englishName: "As-Saaffaat", numberOfAyahs: 182}, {number: 38, name: "سُورَةُ صٓ", englishName: "Saad", numberOfAyahs: 88},
        {number: 39, name: "سُورَةُ ٱلزُّمَرِ", englishName: "Az-Zumar", numberOfAyahs: 75}, {number: 40, name: "سُورَةُ غَافِرٍ", englishName: "Ghafir", numberOfAyahs: 85},
        {number: 41, name: "سُورَةُ فُصِّلَتْ", englishName: "Fussilat", numberOfAyahs: 54}, {number: 42, name: "سُورَةُ ٱلشُّورَىٰ", englishName: "Ash-Shura", numberOfAyahs: 53},
        {number: 43, name: "سُورَةُ ٱلزُّخْرُفِ", englishName: "Az-Zukhruf", numberOfAyahs: 89}, {number: 44, name: "سُورَةُ ٱلدُّخَانِ", englishName: "Ad-Dukhaan", numberOfAyahs: 59},
        {number: 45, name: "سُورَةُ ٱلْجَاثِيَةِ", englishName: "Al-Jaathiya", numberOfAyahs: 37}, {number: 46, name: "سُورَةُ ٱلْأَحْقَافِ", englishName: "Al-Ahqaf", numberOfAyahs: 35},
        {number: 47, name: "سُورَةُ مُحَمَّدٍ", englishName: "Muhammad", numberOfAyahs: 38}, {number: 48, name: "سُورَةُ ٱلْفَتْحِ", englishName: "Al-Fath", numberOfAyahs: 29},
        {number: 49, name: "سُورَةُ ٱلْحُجُرَاتِ", englishName: "Al-Hujuraat", numberOfAyahs: 18}, {number: 50, name: "سُورَةُ قٓ", englishName: "Qaaf", numberOfAyahs: 45},
        {number: 51, name: "سُورَةُ ٱلذَّارِيَاتِ", englishName: "Adh-Dhaariyat", numberOfAyahs: 60}, {number: 52, name: "سُورَةُ ٱلطُّورِ", englishName: "At-Tur", numberOfAyahs: 49},
        {number: 53, name: "سُورَةُ ٱلنَّجْمِ", englishName: "An-Najm", numberOfAyahs: 62}, {number: 54, name: "سُورَةُ ٱلْقَمَرِ", englishName: "Al-Qamar", numberOfAyahs: 55},
        {number: 55, name: "سُورَةُ ٱلرَّحْمَٰنِ", englishName: "Ar-Rahmaan", numberOfAyahs: 78}, {number: 56, name: "سُورَةُ ٱلْوَاقِعَةِ", englishName: "Al-Waaqia", numberOfAyahs: 96},
        {number: 57, name: "سُورَةُ ٱلْحَدِيدِ", englishName: "Al-Hadid", numberOfAyahs: 29}, {number: 58, name: "سُورَةُ ٱلْمُجَادِلَةِ", englishName: "Al-Mujaadila", numberOfAyahs: 22},
        {number: 59, name: "سُورَةُ ٱلْحَشْرِ", englishName: "Al-Hashr", numberOfAyahs: 24}, {number: 60, name: "سُورَةُ ٱلْمُمْتَحَنَةِ", englishName: "Al-Mumtahana", numberOfAyahs: 13},
        {number: 61, name: "سُورَةُ ٱلصَّفِّ", englishName: "As-Saff", numberOfAyahs: 14}, {number: 62, name: "سُورَةُ ٱلْجُمُعَةِ", englishName: "Al-Jumu'a", numberOfAyahs: 11},
        {number: 63, name: "سُورَةُ ٱلْمُنَافِقُونَ", englishName: "Al-Munaafiqoon", numberOfAyahs: 11}, {number: 64, name: "سُورَةُ ٱلتَّغَابُنِ", englishName: "At-Taghaabun", numberOfAyahs: 18},
        {number: 65, name: "سُورَةُ ٱلطَّلَاقِ", englishName: "At-Talaaq", numberOfAyahs: 12}, {number: 66, name: "سُورَةُ ٱلتَّحْرِيمِ", englishName: "At-Tahrim", numberOfAyahs: 12},
        {number: 67, name: "سُورَةُ ٱلْمُلْكِ", englishName: "Al-Mulk", numberOfAyahs: 30}, {number: 68, name: "سُورَةُ ٱلْقَلَمِ", englishName: "Al-Qalam", numberOfAyahs: 52},
        {number: 69, name: "سُورَةُ ٱلْحَاقَّةِ", englishName: "Al-Haaqqa", numberOfAyahs: 52}, {number: 70, name: "سُورَةُ ٱلْمَعَارِجِ", englishName: "Al-Ma'aarij", numberOfAyahs: 44},
        {number: 71, name: "سُورَةُ نُوحٍ", englishName: "Nooh", numberOfAyahs: 28}, {number: 72, name: "سُورَةُ ٱلْجِنِّ", englishName: "Al-Jinn", numberOfAyahs: 28},
        {number: 73, name: "سُورَةُ ٱلْمُزَّمِّلِ", englishName: "Al-Muzzammil", numberOfAyahs: 20}, {number: 74, name: "سُورَةُ ٱلْمُدَّثِّرِ", englishName: "Al-Muddaththir", numberOfAyahs: 56},
        {number: 75, name: "سُورَةُ ٱلْقِيَامَةِ", englishName: "Al-Qiyaama", numberOfAyahs: 40}, {number: 76, name: "سُورَةُ ٱلْإِنْسَانِ", englishName: "Al-Insaan", numberOfAyahs: 31},
        {number: 77, name: "سُورَةُ ٱلْمُرْسَلَاتِ", englishName: "Al-Mursalaat", numberOfAyahs: 50}, {number: 78, name: "سُورَةُ ٱلنَّبَإِ", englishName: "An-Naba", numberOfAyahs: 40},
        {number: 79, name: "سُورَةُ ٱلنَّازِعَاتِ", englishName: "An-Naazi'aat", numberOfAyahs: 46}, {number: 80, name: "سُورَةُ عَبَسَ", englishName: "Abasa", numberOfAyahs: 42},
        {number: 81, name: "سُورَةُ ٱلتَّكْوِيرِ", englishName: "At-Takwir", numberOfAyahs: 29}, {number: 82, name: "سُورَةُ ٱلْإِنْفِطَارِ", englishName: "Al-Infitaar", numberOfAyahs: 19},
        {number: 83, name: "سُورَةُ ٱلْمُطَفِّفِينَ", englishName: "Al-Mutaffifin", numberOfAyahs: 36}, {number: 84, name: "سُورَةُ ٱلْإِنْشِقَاقِ", englishName: "Al-Inshiqaaq", numberOfAyahs: 25},
        {number: 85, name: "سُورَةُ ٱلْبُرُوجِ", englishName: "Al-Burooj", numberOfAyahs: 22}, {number: 86, name: "سُورَةُ ٱلطَّارِقِ", englishName: "At-Taariq", numberOfAyahs: 17},
        {number: 87, name: "سُورَةُ ٱلْأَعْلَىٰ", englishName: "Al-A'laa", numberOfAyahs: 19}, {number: 88, name: "سُورَةُ ٱلْغَاشِيَةِ", englishName: "Al-Ghaashiya", numberOfAyahs: 26},
        {number: 89, name: "سُورَةُ ٱلْفَجْرِ", englishName: "Al-Fajr", numberOfAyahs: 30}, {number: 90, name: "سُورَةُ ٱلْبَلَدِ", englishName: "Al-Balad", numberOfAyahs: 20},
        {number: 91, name: "سُورَةُ ٱلشَّمْسِ", englishName: "Ash-Shams", numberOfAyahs: 15}, {number: 92, name: "سُورَةُ ٱللَّيْلِ", englishName: "Al-Lail", numberOfAyahs: 21},
        {number: 93, name: "سُورَةُ ٱلضُّحَىٰ", englishName: "Ad-Dhuhaa", numberOfAyahs: 11}, {number: 94, name: "سُورَةُ ٱلشَّرْحِ", englishName: "Ash-Sharh", numberOfAyahs: 8},
        {number: 95, name: "سُورَةُ ٱلتِّينِ", englishName: "At-Tin", numberOfAyahs: 8}, {number: 96, name: "سُورَةُ ٱلْعَلَقِ", englishName: "Al-Alaq", numberOfAyahs: 19},
        {number: 97, name: "سُورَةُ ٱلْقَدْرِ", englishName: "Al-Qadr", numberOfAyahs: 5}, {number: 98, name: "سُورَةُ ٱلْبَيِّنَةِ", englishName: "Al-Bayyina", numberOfAyahs: 8},
        {number: 99, name: "سُورَةُ ٱلزَّلْزَلَةِ", englishName: "Az-Zalzala", numberOfAyahs: 8}, {number: 100, name: "سُورَةُ ٱلْعَادِيَاتِ", englishName: "Al-Aadiyaat", numberOfAyahs: 11},
        {number: 101, name: "سُورَةُ ٱلْقَارِعَةِ", englishName: "Al-Qaari'a", numberOfAyahs: 11}, {number: 102, name: "سُورَةُ ٱلتَّكَاثُرِ", englishName: "At-Takaathur", numberOfAyahs: 8},
        {number: 103, name: "سُورَةُ ٱلْعَصْرِ", englishName: "Al-Asr", numberOfAyahs: 3}, {number: 104, name: "سُورَةُ ٱلْهُمَزَةِ", englishName: "Al-Humaza", numberOfAyahs: 9},
        {number: 105, name: "سُورَةُ ٱلْفِيلِ", englishName: "Al-Fil", numberOfAyahs: 5}, {number: 106, name: "سُورَةُ قُرَيْشٍ", englishName: "Quraish", numberOfAyahs: 4},
        {number: 107, name: "سُورَةُ ٱلْمَاعُونِ", englishName: "Al-Maa'un", numberOfAyahs: 7}, {number: 108, name: "سُورَةُ ٱلْكَوْثَرِ", englishName: "Al-Kawthar", numberOfAyahs: 3},
        {number: 109, name: "سُورَةُ ٱلْكَافِرُونَ", englishName: "Al-Kaafiroon", numberOfAyahs: 6}, {number: 110, name: "سُورَةُ ٱلنَّصْرِ", englishName: "An-Nasr", numberOfAyahs: 3},
        {number: 111, name: "سُورَةُ ٱلْمَسَدِ", englishName: "Al-Masad", numberOfAyahs: 5}, {number: 112, name: "سُورَةُ ٱلْإِخْلَاصِ", englishName: "Al-Ikhlaas", numberOfAyahs: 4},
        {number: 113, name: "سُورَةُ ٱلْفَلَقِ", englishName: "Al-Falaq", numberOfAyahs: 5}, {number: 114, name: "سُورَةُ ٱلنَّاسِ", englishName: "An-Naas", numberOfAyahs: 6}
    ];

    const NOOR_MESSAGES = [
        { arabic: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ", english: "And We have not sent you, [O Muhammad], except as a mercy to the worlds.", source: "سورة الأنبياء، 107" },
        { arabic: "وَقُولُوا لِلنَّاسِ حُسْنًا", english: "And speak to people good [words].", source: "سورة البقرة، 83" },
        { arabic: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ", english: "Indeed, Allah commands justice and good conduct.", source: "سورة النحل، 90" }
    ];

    // --- Functions ---
    function populateSurahs( ) {
        loadingIndicator.style.display = 'none'; // Hide loading indicator immediately
        surahGrid.innerHTML = ''; // Clear any previous error messages
        STATIC_SURAHS.forEach(surah => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-lg-3 mb-4';
            col.innerHTML = `<a href="#" class="card surah-card h-100" data-surah-number="${surah.number}"><div class="card-body text-center"><h5 class="card-title arabic-text">${surah.number}. ${surah.name}</h5><p class="card-text">${surah.englishName}</p><small class="text-muted">${surah.numberOfAyahs} Ayahs</small></div></a>`;
            surahGrid.appendChild(col);
        });
    }

    async function fetchData(endpoint) {
        try {
            const response = await fetch(`${QURAN_API_BASE}/${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null; // Return null on failure, don't block the UI
        }
    }

    async function populateSelects() {
        // These are non-critical, they can load in the background
        const [reciters, translations] = await Promise.all([
            fetchData('edition/type/audio'),
            fetchData('edition/type/translation')
        ]);
        if (reciters) {
            reciters.forEach(reciter => reciterSelect.add(new Option(reciter.englishName, reciter.identifier)));
            reciterSelect.value = localStorage.getItem('selectedReciter') || 'ar.alafasy';
        }
        if (translations) {
            translationSelect.add(new Option('بدون ترجمة', 'none'));
            translations.forEach(translation => translationSelect.add(new Option(`${translation.englishName} (${translation.language})`, translation.identifier)));
            translationSelect.value = localStorage.getItem('selectedTranslation') || 'en.sahih';
        }
    }

    function saveSelections() {
        localStorage.setItem('selectedReciter', reciterSelect.value);
        localStorage.setItem('selectedTranslation', translationSelect.value);
    }

    function showNoorMessage() {
        const lastShown = localStorage.getItem('noorModalLastShown');
        const now = new Date().getTime();
        if (lastShown && (now - lastShown < MODAL_COOLDOWN_HOURS * 60 * 60 * 1000)) return;

        const randomMessage = NOOR_MESSAGES[Math.floor(Math.random() * NOOR_MESSAGES.length)];
        
        noorMessageText.textContent = randomMessage.arabic;
        noorMessageTranslation.textContent = randomMessage.english;
        noorMessageSource.textContent = randomMessage.source;

        const modal = new bootstrap.Modal(noorModalElement);
        setTimeout(() => {
            modal.show();
            localStorage.setItem('noorModalLastShown', now);
        }, 2500);
    }

    // --- Event Listeners ---
    surahGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.surah-card');
        if (card) {
            e.preventDefault();
            saveSelections();
            window.location.href = `surah.html?number=${card.dataset.surahNumber}`;
        }
    });
    reciterSelect.addEventListener('change', saveSelections);
    translationSelect.addEventListener('change', saveSelections);

    // --- App Initialization ---
    function initializeApp() {
        populateSurahs();   // INSTANTLY load surahs from static list
        populateSelects();  // Load non-critical dropdowns in the background
        showNoorMessage();  // Show inspirational message
    }

    initializeApp();
});
