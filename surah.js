document.addEventListener('DOMContentLoaded', () => {
    const surahHeader = document.getElementById('surah-header');
    const ayahContainer = document.getElementById('ayah-container');
    const audioPlayer = document.getElementById('audio-player');
    const currentAyahInfo = document.getElementById('current-ayah-info');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noticesDiv = document.getElementById('notices');

    const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
    const DEFAULT_RECITER = 'ar.alafasy';

    let currentAyahNumber = 0;
    let surahData = {
        arabic: null,
        audio: null,
        translation: null,
    };

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

    function addNotice(message, type = 'warning') {
        const notice = document.createElement('div');
        notice.className = `alert alert-${type} text-center`;
        notice.textContent = message;
        noticesDiv.appendChild(notice);
    }

    async function loadSurahData() {
        showLoading(true);
        const { surahNumber, reciter, translation } = getUrlParams();

        if (!surahNumber) {
            addNotice('لم يتم تحديد رقم السورة.', 'danger');
            showLoading(false);
            return;
        }

        const endpoints = [
            `${QURAN_API_BASE}/surah/${surahNumber}/quran-uthmani`, // Arabic Text
            `${QURAN_API_BASE}/surah/${surahNumber}/${reciter}`, // Selected Audio
        ];
        if (translation !== 'none') {
            endpoints.push(`${QURAN_API_BASE}/surah/${surahNumber}/${translation}`); // Translation
        }

        try {
            const results = await Promise.allSettled(endpoints.map(url => fetch(url, { cache: 'no-cache' }).then(res => res.json())));

            const [arabicResult, audioResult, translationResult] = results;

            // Arabic text is essential
            if (arabicResult.status === 'fulfilled' && arabicResult.value.code === 200) {
                surahData.arabic = arabicResult.value.data;
            } else {
                throw new Error('Critical: Could not load Arabic text.');
            }

            // Audio is important, with fallback
            if (audioResult.status === 'fulfilled' && audioResult.value.code === 200) {
                surahData.audio = audioResult.value.data;
            } else {
                addNotice('تعذر تحميل القارئ المختار. سنحاول التبديل إلى القارئ الافتراضي.', 'warning');
                const fallbackAudioResponse = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/${DEFAULT_RECITER}`, { cache: 'no-cache' }).then(res => res.json());
                if (fallbackAudioResponse.code === 200) {
                    surahData.audio = fallbackAudioResponse.data;
                } else {
                    addNotice('فشل تحميل الصوت تمامًا. ستكون القراءة غير متاحة.', 'danger');
                }
            }

            // Translation is optional
            if (translationResult && translationResult.status === 'fulfilled' && translationResult.value.code === 200) {
                surahData.translation = translationResult.value.data;
            } else if (translationResult) {
                addNotice('تعذر تحميل الترجمة.', 'info');
            }

            renderSurah();
            gtag('event', 'view_surah', { 'surah_number': surahNumber, 'reciter': reciter });

        } catch (error) {
            console.error('Critical error in loadSurahData:', error);
            addNotice(`حدث خطأ حرج: ${error.message}`, 'danger');
        } finally {
            showLoading(false);
        }
    }

    function renderSurah() {
        const { arabic, translation, audio } = surahData;
        
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
            const playButton = audio ? `<span class="play-button" data-ayah="${ayah.numberInSurah}">&#9654;</span>` : '';

            ayahBlock.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span class="ayah-number">﴿${ayah.numberInSurah}﴾</span>
                    ${playButton}
                </div>
                <p class="ayah-text arabic-text">${ayah.text}</p>
                ${translationText}
            `;
            ayahContainer.appendChild(ayahBlock);
        });
    }

    function playAyah(ayahNumber) {
        if (!surahData.audio) return;
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
            playAyah(e.target.dataset.ayah);
        }
    });

    audioPlayer.addEventListener('ended', () => {
        if (surahData.audio && currentAyahNumber < surahData.arabic.ayahs.length) {
            playAyah(currentAyahNumber + 1);
        } else {
            currentAyahInfo.textContent = "انتهت السورة";
        }
    });

    loadSurahData();
});
