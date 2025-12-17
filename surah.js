document.addEventListener('DOMContentLoaded', () => {
    const surahHeader = document.getElementById('surah-header');
    const ayahContainer = document.getElementById('ayah-container');
    const audioPlayer = document.getElementById('audio-player');
    const currentAyahInfo = document.getElementById('current-ayah-info');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noticesDiv = document.getElementById('notices');

    const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
    const DEFAULT_RECITER = 'ar.alafasy';

    // Expert Fix #1: Initialize surahData as an array, not an object.
    let surahData = [];
    let currentAyahNumber = 0;

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

        const editions = ['quran-uthmani', reciter];
        if (translation !== 'none') {
            editions.push(translation);
        }

        try {
            const results = await Promise.allSettled(
                editions.map(edition =>
                    fetch(`${QURAN_API_BASE}/surah/${surahNumber}/${edition}`, { cache: 'no-cache' }).then(res => res.json())
                )
            );

            const fulfilledResults = results
                .filter(result => result.status === 'fulfilled' && result.value.code === 200)
                .map(result => result.value.data);

            surahData = fulfilledResults; // Assign the array of results

            const arabicData = surahData.find(d => d.edition.identifier === 'quran-uthmani');
            if (!arabicData) {
                throw new Error('Critical: Could not load Arabic text.');
            }

            let audioData = surahData.find(d => d.edition.identifier === reciter);
            if (!audioData) {
                addNotice('تعذر تحميل القارئ المختار. جاري التبديل إلى القارئ الافتراضي.', 'warning');
                const fallbackResponse = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/${DEFAULT_RECITER}`, { cache: 'no-cache' }).then(res => res.json());
                if (fallbackResponse.code === 200) {
                    surahData.push(fallbackResponse.data); // Add fallback data to the array
                } else {
                    addNotice('فشل تحميل الصوت تمامًا. ستكون القراءة غير متاحة.', 'danger');
                }
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
        const arabicData = surahData.find(d => d.edition.identifier === 'quran-uthmani');
        const translationData = surahData.find(d => d.edition.type === 'translation');
        const audioData = surahData.find(d => d.edition.type === 'audio');

        surahHeader.innerHTML = `
            <h1 class="arabic-text">${arabicData.name}</h1>
            <p class="lead">${arabicData.englishName} - ${arabicData.englishNameTranslation}</p>
            <a href="index.html" class="btn btn-outline-primary">العودة إلى الفهرس</a>
        `;
        document.title = arabicData.name;

        ayahContainer.innerHTML = '';
        arabicData.ayahs.forEach(ayah => {
            const ayahBlock = document.createElement('div');
            ayahBlock.className = 'ayah-block';
            ayahBlock.id = `ayah-${ayah.numberInSurah}`;

            const translationText = translationData ? `<p class="translation-text">${translationData.ayahs.find(t => t.numberInSurah === ayah.numberInSurah).text}</p>` : '';
            const playButton = audioData ? `<span class="play-button" data-ayah="${ayah.numberInSurah}">&#9654;</span>` : '';

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
        const audioData = surahData.find(d => d.edition.type === 'audio');
        if (!audioData) return;

        // Expert Fix #2: Correctly define currentAyahNumber here.
        currentAyahNumber = parseInt(ayahNumber);
        const audioAyah = audioData.ayahs.find(a => a.numberInSurah === currentAyahNumber);
        
        if (audioAyah && audioAyah.audio) {
            audioPlayer.src = audioAyah.audio;
            audioPlayer.play();
            updateHighlight();
            const arabicData = surahData.find(d => d.edition.identifier === 'quran-uthmani');
            currentAyahInfo.textContent = `${arabicData.englishName} - Ayah ${currentAyahNumber}`;
            gtag('event', 'play_audio', { 'surah_number': arabicData.number, 'ayah_number': currentAyahNumber });
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

    // Expert Fix #3: Add the missing event listener.
    ayahContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('play-button')) {
            playAyah(e.target.dataset.ayah);
        }
    });

    audioPlayer.addEventListener('ended', () => {
        const arabicData = surahData.find(d => d.edition.identifier === 'quran-uthmani');
        if (arabicData && currentAyahNumber < arabicData.ayahs.length) {
            playAyah(currentAyahNumber + 1);
        } else {
            currentAyahInfo.textContent = "انتهت السورة";
        }
    });

    loadSurahData();
});
