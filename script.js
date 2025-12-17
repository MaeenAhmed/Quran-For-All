document.addEventListener('DOMContentLoaded', ( ) => {
    const surahGrid = document.getElementById('surah-grid');
    const reciterSelect = document.getElementById('reciter-select');
    const translationSelect = document.getElementById('translation-select');
    const loadingIndicator = document.getElementById('loading-indicator');

    // THE ONLY CHANGE IS HERE: http -> https
    const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

    function showLoading(show ) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    async function fetchData(endpoint) {
        try {
            const response = await fetch(`${QURAN_API_BASE}/${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    }

    async function populateSurahs() {
        const meta = await fetchData('meta');
        if (!meta) return;

        const surahs = meta.surahs.references;
        surahGrid.innerHTML = '';
        surahs.forEach(surah => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-lg-3 mb-4';
            col.innerHTML = `
                <a href="#" class="card surah-card h-100" data-surah-number="${surah.number}">
                    <div class="card-body text-center">
                        <h5 class="card-title arabic-text">${surah.number}. ${surah.name}</h5>
                        <p class="card-text">${surah.englishName}</p>
                        <small class="text-muted">${surah.numberOfAyahs} Ayahs</small>
                    </div>
                </a>
            `;
            surahGrid.appendChild(col);
        });
    }

    async function populateSelects() {
        const [reciters, translations] = await Promise.all([
            fetchData('edition/type/audio'),
            fetchData('edition/type/translation')
        ]);

        if (reciters) {
            reciters.forEach(reciter => {
                const option = new Option(reciter.englishName, reciter.identifier);
                reciterSelect.add(option);
            });
            reciterSelect.value = localStorage.getItem('selectedReciter') || 'ar.alafasy';
        }

        if (translations) {
            const noTranslationOption = new Option('بدون ترجمة', 'none');
            translationSelect.add(noTranslationOption);
            translations.forEach(translation => {
                const option = new Option(`${translation.englishName} (${translation.language})`, translation.identifier);
                translationSelect.add(option);
            });
            translationSelect.value = localStorage.getItem('selectedTranslation') || 'en.sahih';
        }
    }

    function saveSelections() {
        localStorage.setItem('selectedReciter', reciterSelect.value);
        localStorage.setItem('selectedTranslation', translationSelect.value);
    }

    surahGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.surah-card');
        if (card) {
            e.preventDefault();
            saveSelections();
            const surahNumber = card.dataset.surahNumber;
            window.location.href = `surah.html?number=${surahNumber}`;
        }
    });

    reciterSelect.addEventListener('change', saveSelections);
    translationSelect.addEventListener('change', saveSelections);

    async function initializeApp() {
        showLoading(true);
        await Promise.all([populateSurahs(), populateSelects()]);
        showLoading(false);
    }

    initializeApp();
});
