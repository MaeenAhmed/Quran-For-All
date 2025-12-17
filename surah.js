document.addEventListener('DOMContentLoaded', () => {
    const surahHeader = document.getElementById('surah-header');
    const ayahContainer = document.getElementById('ayah-container');
    const audioPlayer = document.getElementById('audio-player');
    const currentAyahInfo = document.getElementById('current-ayah-info');
    const loadingIndicator = document.getElementById('loading-indicator');

    const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
    const DEFAULT_RECITER = 'ar.alafasy'; // Guaranteed to work

    let currentAyahNumber = 0;
    let surahData = {};

    function showLoading(show ) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            surahNumber: params.get('number'),
            reciter: localStorage.getItem('selectedReciter') || DEFAULT_RECITER,
            translation: localStorage.getItem('selectedTranslation') || 'en.sahih'
        };
    }

    // v6.0 - Robust data fetching function
    async function fetchSurahEditions(surahNumber, reciter, translation) {
        const editions = `quran-uthmani,${reciter}${translation !== 'none' ? ',' + translation : ''}`;
        const url = `${QURAN_API_BASE}/surah/${surahNumber}/editions/${editions}`;
        
        // Using "no-cache" to prevent the browser from serving stale/failed responses
        const response = await fetch(url, { cache: "no-cache" }); 
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        if (data.code !== 200) throw new Error(`API returned non-200 code: ${data.message}`);

        const arabic = data.data.find(e => e.edition.identifier === 'quran-uthmani');
        const audio = data.data.find(e => e.edition.type === 'audio');
        
        // If audio is missing for the selected reciter, it's a failure
        if (!arabic || !audio) {
            return null; // Indicate failure
        }
        
        return data.data; // Success
    }

    // v6.0 - Main function with SAFE MODE logic
    async function loadSurahData() {
        showLoading(true);
        let { surahNumber, reciter, translation } = getUrlParams();

        if (!surahNumber) {
            ayahContainer.innerHTML = '<p class="text-center text-danger">لم يتم تحديد رقم السورة.</p>';
            showLoading(false);
            return;
        }

        try {
            let editionsData = await fetchSurahEditions(surahNumber, reciter, translation);

            // SAFE MODE: If the chosen reciter fails, fall back to the default
            if (!editionsData) {
                console.warn(`Failed to load reciter '${reciter}'. Falling back to default.`);
                const fallbackReciter = DEFAULT_RECITER;
                editionsData = await fetchSurahEditions(surahNumber, fallbackReciter, translation);
                
                // Show a non-intrusive notification to the user
                const fallbackNotice = document.createElement('div');
                fallbackNotice.className = 'alert alert-warning text-center';
                fallbackNotice.textContent = 'تعذر تحميل القارئ المختار. تم التبديل إلى القارئ الافتراضي.';
                // Using .before() to place it before the header, making it more visible
                document.querySelector('main').prepend(fallbackNotice);
            }

            if (!editionsData) {
                // If even the fallback fails, then it's a critical error
                throw new Error("Critical Error: Could not load even the default reciter. The API might be down.");
            }

            surahData.arabic = editionsData.find(e => e.edition.identifier === 'quran-uthmani');
            surahData.audio = editionsData.find(e => e.edition.type === 'audio');
            surahData.translation = editionsData.find(e => e.edition.type === 'translation');

            renderSurah();
            gtag('event', 'view_surah', { 'surah_number': surahNumber, 'reciter': reciter });

        } catch (error) {
            console.error('Critical error in loadSurahData:', error);
            ayahContainer.innerHTML = `<p class="text-center text-danger">حدث خطأ حرج أثناء تحميل بيانات السورة. قد تكون خدمة API متوقفة.</p><p class="text-center text-muted" style="font-size:0.8rem; direction:ltr;">${error.message}</p>`;
        } finally {
            showLoading(false);
        }
    }

    function renderSurah() {
        const { arabic, translation } = surahData;
        
        surahHeader.innerHTML = `
            <h1 class="arabic-text">${arabic.name}</h1>
            <p class="lead">${arabic.englishName} - ${arabic.englishNameTranslation}</p>
            <a href="index.html" class="btn btn-outline-primary">العودة إلى الفهرس</a>
        `;
        document.title = arabic.name;

        ayahContainer.innerHTML = '';
        arabic.ayahs.forEach(ayah => {
            const ayahBlock = document.createElement('div');
            ayahBlock.className = 'ayah-block';
            ayahBlock.id = `ayah-${ayah.numberInSurah}`;

            const translationText = translation ? `<p class="translation-text">${translation.ayahs.find(t => t.numberInSurah === ayah.numberInSurah).text}</p>` : '';

            ayahBlock.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span class="ayah-number">﴿${ayah.numberInSurah}﴾</span>
                    <span class="play-button" data-ayah="${ayah.numberInSurah}">&#9654;</span>
                </div>
                <p class="ayah-text arabic-text">${ayah.text}</p>
                ${translationText}
            `;
            ayahContainer.appendChild(ayahBlock);
        });
    }

    function playAyah(ayahNumber) {
        currentAyahNumber = parseInt(ayahNumber);
        const audioAyah = surahData.audio.ayahs.find(a => a.numberInSurah === currentAyahNumber);
        
        if (audioAyah && audioAyah.audio) {
            audioPlayer.src = audioAyah.audio;
            audioPlayer.play();
            updateHighlight();
            currentAyahInfo.textContent = `${surahData.arabic.englishName} - Ayah ${currentAyahNumber}`;
            gtag('event', 'play_audio', { 'surah_number': surahData.arabic.number, 'ayah_number': currentAyahNumber });
        }
    }

    function updateHighlight() {
        document.querySelectorAll('.ayah-block').forEach(block => block.classList.remove('ayah-highlight'));
        const currentBlock = document.getElementById(`ayah-${currentAyahNumber}`);
        if (currentBlock) {
            currentBlock.classList.add('ayah-highlight');
            currentBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    ayahContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('play-button')) {
            const ayahNumber = e.target.dataset.ayah;
            playAyah(ayahNumber);
        }
    });

    audioPlayer.addEventListener('ended', () => {
        if (currentAyahNumber < surahData.arabic.ayahs.length) {
            playAyah(currentAyahNumber + 1);
        } else {
            currentAyahInfo.textContent = "انتهت السورة";
        }
    });

    loadSurahData();
});
