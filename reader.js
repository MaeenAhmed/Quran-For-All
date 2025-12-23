import { azkarData, azkarAudioBaseUrl } from './azkar_data.js';

document.addEventListener('DOMContentLoaded', async () => {
    const surahTitle = document.getElementById('surah-title');
    const ayahContainer = document.getElementById('ayah-text-container');
    const reciterSelect = document.getElementById('reciter-select');
    const audioPlayer = document.getElementById('audio-player');
    const bismillahDisplay = document.getElementById('bismillah-display');

    // --- قاعدة البيانات المحدثة والمؤكدة للروابط من MP3Quran API ---
    const audioDatabase = {
        "M_Muhaissini": { "name": "محمد المحيسني", "server": "https://server11.mp3quran.net/mhsny/" },
        "Mansour_Salmi": { "name": "منصور السالمي", "server": "https://server14.mp3quran.net/mansor/" },
        "Islam_Sobhi": { "name": "إسلام صبحي", "server": "https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/" },
        "Nasser_Alqatami": { "name": "ناصر القطامي", "server": "https://server6.mp3quran.net/qtm/" },
        "Hani_Rifai": { "name": "هاني الرفاعي", "server": "https://server8.mp3quran.net/hani/" },
        "Yasser": { "name": "ياسر الدوسري", "server": "https://server11.mp3quran.net/yasser/" },
    };

    // ملء قائمة القراء من قاعدة البيانات
    for (const reciterId in audioDatabase  ) {
        const option = document.createElement('option');
        option.value = reciterId;
        option.textContent = audioDatabase[reciterId].name;
        reciterSelect.appendChild(option);
    }

    const params = new URLSearchParams(window.location.search);
    const surahNumber = params.get('surah');

    if (!surahNumber) {
        ayahContainer.innerHTML = '<p class="error-message">خطأ: لم يتم تحديد السورة.</p>';
        return;
    }

    async function loadSurahText() {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`  );
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            const surahData = data.data;
            surahTitle.textContent = `سورة ${surahData.name}`;
            document.title = `سورة ${surahData.name} - مشروع القرآن للجميع`;
            if (surahNumber != 9 && surahNumber != 1) {
                bismillahDisplay.style.display = 'block';
            }
            let fullSurahText = '';
            surahData.ayahs.forEach(ayah => {
                fullSurahText += `${ayah.text} <span class="ayah-marker">﴿${ayah.numberInSurah}﴾</span> `;
            });
            ayahContainer.innerHTML = fullSurahText;
        } catch (error) {
            console.error('Error fetching surah text:', error);
            ayahContainer.innerHTML = '<p class="error-message">فشل تحميل نص السورة.</p>';
        }
    }

    function loadAudio() {
        try {
            const reciterId = reciterSelect.value;
            const reciterData = audioDatabase[reciterId];
            if (!reciterData) throw new Error(`Reciter not found: ${reciterId}`);
            
            const paddedSurahNumber = surahNumber.padStart(3, '0');
            // MP3Quran API pattern: [Server URL] + [Surah Number padded to 3 digits] + .mp3
            const audioUrl = reciterData.server + `${paddedSurahNumber}.mp3`;
            
            console.log(`[Operation Fath] Certain Audio URL: ${audioUrl}`);
            
            audioPlayer.src = audioUrl;
            audioPlayer.load();

        } catch (error) {
            console.error('Audio Engine Error:', error);
            alert(`حدث خطأ فادح في محرك الصوت: ${error.message}`);
        }
    }

    audioPlayer.addEventListener('error', (e) => {
        console.error("Audio Player Hardware/Network Error:", e);
        alert("عذرًا، حدث خطأ أثناء محاولة تشغيل الملف الصوتي. قد يكون الملف غير متوفر لهذا القارئ أو هناك مشكلة في الشبكة. يرجى تجربة قارئ آخر أو التحقق من اتصالك بالإنترنت.");
    });

    reciterSelect.addEventListener('change', loadAudio);

    await loadSurahText();
    loadAudio();
});
