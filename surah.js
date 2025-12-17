document.addEventListener('DOMContentLoaded', () => {
    const surahHeader = document.getElementById('surah-header');
    const ayahContainer = document.getElementById('ayah-container');
    const audioPlayer = document.getElementById('audio-player');
    const currentAyahInfo = document.getElementById('current-ayah-info');
    const loadingIndicator = document.getElementById('loading-indicator');

    const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

    let currentAyahNumber = 0;
    let surahData = {};

    function showLoading(show ) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            surahNumber: params.get('number'),
            reciter: localStorage.getItem('selectedReciter') || 'ar.alafasy',
            translation: localStorage.getItem('selectedTranslation') || 'en.sahih'
        };
    }

    async function loadSurahData() {
        showLoading(true);
        const { surahNumber, reciter, translation } = getUrlParams();

        if (!surahNumber) {
            ayahContainer.innerHTML = '<p class="text-center text-danger">لم يتم تحديد رقم السورة.</p>';
            showLoading(false);
            return;
        }

        const editions = `quran-uthmani,${reciter}${translation !== 'none' ? ',' + translation : ''}`;
        
        try {
            const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/editions/${editions}`);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            if (data.code !== 200) throw new Error(`API returned non-200 code: ${data.message}`);

            surahData.arabic = data.data.find(e => e.edition.identifier === 'quran-uthmani');
            surahData.audio = data.data.find(e => e.edition.type === 'audio');
            surahData.translation = data.data.find(e => e.edition.type === 'translation');

            if (!surahData.arabic || !surahData.audio) {
                throw new Error("Could not find essential Arabic text or audio edition in the API response. The selected reciter might be invalid.");
            }

            renderSurah();
            gtag('event', 'view_surah', { 'surah_number': surahNumber, 'reciter': reciter });

        } catch (error) {
            console.error('Error loading surah:', error);
            ayahContainer.innerHTML = `<p class="text-center text-danger">حدث خطأ أثناء تحميل بيانات السورة. تأكد من اختيارك لقارئ صالح وأن اتصالك بالإنترنت يعمل.</p><p class="text-center text-muted" style="font-size:0.8rem; direction:ltr;">${error.message}</p>`;
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
