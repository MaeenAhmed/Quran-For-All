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
    
    const NOOR_MESSAGES = [
        { arabic: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ", english: "And We have not sent you, [O Muhammad], except as a mercy to the worlds.", source: "سورة الأنبياء، 107" },
        { arabic: "وَقُولُوا لِلنَّاسِ حُسْنًا", english: "And speak to people good [words].", source: "سورة البقرة، 83" },
        { arabic: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ", english: "Indeed, Allah commands justice and good conduct.", source: "سورة النحل، 90" },
        { arabic: "وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ", english: "And not equal are the good deed and the bad. Repel [evil] by that [deed] which is better.", source: "سورة فصلت، 34" },
        { arabic: "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا", english: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another.", source: "سورة الحجرات، 13" },
        { arabic: "لَّا إِكْرَاهَ فِي الدِّينِ", english: "There shall be no compulsion in [acceptance of] the religion.", source: "سورة البقرة، 256" },
        { arabic: "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ", english: "And indeed, you are of a great moral character.", source: "سورة القلم، 4" },
        { arabic: "فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ الْقَلْبِ لَانفَضُّوا مِنْ حَوْلِكَ", english: "So by mercy from Allah, you were lenient with them. And if you had been rude [in speech] and harsh in heart, they would have disbanded from about you.", source: "سورة آل عمران، 159" },
        { arabic: "مَنْ قَتَلَ نَفْسًا بِغَيْرِ نَفْسٍ أَوْ فَسَادٍ فِي الْأَرْضِ فَكَأَنَّمَا قَتَلَ النَّاسَ جَمِيعًا", english: "Whoever kills a soul unless for a soul or for corruption [done] in the land - it is as if he had slain mankind entirely.", source: "سورة المائدة، 32" },
        { arabic: "هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ", english: "Is the reward for good [anything] but good?", source: "سورة الرحمن، 60" }
    ];
    const MODAL_COOLDOWN_HOURS = 3;

    // --- Functions ---
    function showLoading(show ) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    async function fetchData(endpoint, isJson = true) {
        try {
            const response = await fetch(`${QURAN_API_BASE}/${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return isJson ? data.data : data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            surahGrid.innerHTML = `<p class="text-center text-danger">فشل تحميل البيانات. قد يكون الاتصال بالإنترنت بطيئًا. حاول تحديث الصفحة.</p>`;
            return null;
        }
    }

    async function populateSurahs() {
        showLoading(true);
        const surahData = await fetchData('surah', false);
        showLoading(false);
        if (!surahData || !surahData.data) return;
        const surahs = surahData.data;
        surahGrid.innerHTML = '';
        surahs.forEach(surah => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-lg-3 mb-4';
            col.innerHTML = `<a href="#" class="card surah-card h-100" data-surah-number="${surah.number}"><div class="card-body text-center"><h5 class="card-title arabic-text">${surah.number}. ${surah.name}</h5><p class="card-text">${surah.englishName}</p><small class="text-muted">${surah.numberOfAyahs} Ayahs</small></div></a>`;
            surahGrid.appendChild(col);
        });
    }

    async function populateSelects() {
        const [reciters, translations] = await Promise.all([fetchData('edition/type/audio'), fetchData('edition/type/translation')]);
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
        }, 2000);
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
    async function initializeApp() {
        await populateSurahs();
        populateSelects();
        showNoorMessage();
    }

    initializeApp();
});
