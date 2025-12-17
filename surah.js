document.addEventListener('DOMContentLoaded', async () => {
    const surahTitle = document.getElementById('surah-title');
    const surahSubtitle = document.getElementById('surah-subtitle');
    const ayahContainer = document.getElementById('ayah-text-container');
    const reciterSelect = document.getElementById('reciter-select');
    const audioPlayer = document.getElementById('audio-player');
    const audioError = document.getElementById('audio-error');
    const bismillahDisplay = document.getElementById('bismillah-display');

    const reciters = {
        "Abdulaziz_Al-Zahrani": "عبدالعزيز الزهراني (سحيم)",
        "Nasser_Al_qatami": "ناصر القطامي",
        "Mansour_Al-Salmi": "منصور السالمي",
        "islam_sobhi": "إسلام صبحي",
        "Yasser_Al-Dosari": "ياسر الدوسري"
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
        ayahContainer.innerHTML = '<p>لم يتم تحديد رقم السورة.</p>';
        return;
    }

    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}` );
        if (!response.ok) throw new Error('Network response was not ok.');
        
        const data = await response.json();
        const surahData = data.data;

        surahTitle.textContent = `سورة ${surahData.name}`;
        surahSubtitle.textContent = `${surahData.englishName} - ${surahData.numberOfAyahs} Ayahs`;
        document.title = `سورة ${surahData.name} - Quran For All`;
        
        // عرض البسملة إذا لم تكن سورة التوبة
        if (surahNumber != 9 && surahNumber != 1) {
            bismillahDisplay.style.display = 'block';
        }

        let fullSurahText = '';
        surahData.ayahs.forEach(ayah => {
            fullSurahText += `${ayah.text} <span class="ayah-marker">﴿${ayah.numberInSurah}﴾</span> `;
        });
        
        ayahContainer.innerHTML = fullSurahText;

        updateAudioPlayer();

    } catch (error) {
        console.error('Error fetching surah details:', error);
        ayahContainer.innerHTML = '<p class="error-message">فشل تحميل بيانات السورة. يرجى التحقق من اتصالك بالإنترنت.</p>';
    }

    function updateAudioPlayer() {
        const reciterIdentifier = reciterSelect.value;
        const paddedSurahNumber = surahNumber.padStart(3, '0');
        const audioUrl = `https://server11.mp3quran.net/${reciterIdentifier}/${paddedSurahNumber}.mp3`;
        
        audioPlayer.src = audioUrl;
        audioError.style.display = 'none'; // إخفاء رسالة الخطأ عند محاولة جديدة
        console.log(`Attempting to load audio: ${audioUrl}` );

        if (typeof gtag === 'function') {
            gtag('event', 'listen_to_surah', {
                'surah_number': surahNumber,
                'reciter_name': reciters[reciterIdentifier]
            });
        }
    }

    reciterSelect.addEventListener('change', updateAudioPlayer);

    // معالجة خطأ تحميل الصوت
    audioPlayer.addEventListener('error', () => {
        console.error("Failed to load audio file.");
        audioError.style.display = 'block';
    });
});
