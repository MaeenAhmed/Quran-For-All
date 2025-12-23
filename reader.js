document.addEventListener('DOMContentLoaded', async () => {
    const surahTitle = document.getElementById('surah-title');
    const ayahContainer = document.getElementById('ayah-text-container');
    const reciterSelect = document.getElementById('reciter-select');
    const audioPlayer = document.getElementById('audio-player');
    const bismillahDisplay = document.getElementById('bismillah-display');

    const reciters = {
        "ar.alafasy": "مشاري راشد العفاسي",
        "ar.abdulbasitmurattal": "عبد الباسط عبد الصمد (مرتل)",
        "ar.sahl-yassin": "سهل ياسين",
        "ar.islamsobhi": "إسلام صبحي",
        "ar.yasseraddousari": "ياسر الدوسري"
    };

    for (const [identifier, name] of Object.entries(reciters)) {
        const option = document.createElement('option');
        option.value = identifier;
        option.textContent = name;
        reciterSelect.appendChild(option);
    }

    const params = new URLSearchParams(window.location.search);
    const surahNumber = params.get('surah');

    if (!surahNumber) {
        ayahContainer.innerHTML = '<p class="error-message">خطأ: لم يتم تحديد السورة.</p>';
        return;
    }

    let surahData = null;
    let timingsData = null;

    async function loadSurah() {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}` );
            const data = await response.json();
            surahData = data.data;

            surahTitle.textContent = `سورة ${surahData.name}`;
            document.title = `سورة ${surahData.name}`;
            
            if (surahNumber != 9 && surahNumber != 1) {
                bismillahDisplay.style.display = 'block';
            }

            let fullSurahText = '';
            surahData.ayahs.forEach(ayah => {
                fullSurahText += `<span class="ayah" id="ayah-${ayah.numberInSurah}">${ayah.text} <span class="ayah-marker">﴿${ayah.numberInSurah}﴾</span></span> `;
            });
            ayahContainer.innerHTML = fullSurahText;

            loadReciter();

        } catch (error) {
            console.error('Error fetching surah text:', error);
            ayahContainer.innerHTML = '<p class="error-message">فشل تحميل نص السورة.</p>';
        }
    }

    async function loadReciter() {
        try {
            const reciterId = reciterSelect.value;
            const audioResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}` );
            const audioData = await audioResponse.json();
            
            const timingsResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,${reciterId}`, { headers: { 'Accept': 'application/json' } } );
            const timingsJson = await timingsResponse.json();
            timingsData = timingsJson.data[1].ayahs;

            audioPlayer.src = audioData.data.ayahs[0].audio.replace(/^(http ):/i, 'https' ); // Force HTTPS
            audioPlayer.load();

        } catch (error) {
            console.error('Error fetching audio:', error);
            ayahContainer.innerHTML += '<p class="error-message">فشل تحميل الملف الصوتي لهذا القارئ.</p>';
        }
    }

    audioPlayer.addEventListener('timeupdate', () => {
        const currentTime = audioPlayer.currentTime * 1000;
        for (const ayah of timingsData) {
            const start = ayah.audioSecondary[0];
            const end = ayah.audioSecondary[ayah.audioSecondary.length - 1];
            if (currentTime >= start && currentTime <= end) {
                document.querySelectorAll('.ayah.highlight').forEach(el => el.classList.remove('highlight'));
                const currentAyahEl = document.getElementById(`ayah-${ayah.numberInSurah}`);
                if (currentAyahEl) {
                    currentAyahEl.classList.add('highlight');
                }
                break;
            }
        }
    });

    reciterSelect.addEventListener('change', loadReciter);
    loadSurah();
});
