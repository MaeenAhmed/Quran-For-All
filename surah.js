document.addEventListener('DOMContentLoaded', async () => {
    const surahTitle = document.getElementById('surah-title');
    const surahSubtitle = document.getElementById('surah-subtitle');
    const ayahContainer = document.getElementById('ayah-list-container');
    const reciterSelect = document.getElementById('reciter-select');
    const audioPlayer = document.getElementById('audio-player');

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
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih` );
        if (!response.ok) throw new Error('Network response was not ok.');
        
        const data = await response.json();
        const arabicData = data.data[0];
        const englishData = data.data[1];

        surahTitle.textContent = `سورة ${arabicData.name}`;
        surahSubtitle.textContent = `${arabicData.englishName} - ${arabicData.numberOfAyahs} Ayahs`;
        document.title = `سورة ${arabicData.name} - Quran For All`;
        ayahContainer.innerHTML = '';

        arabicData.ayahs.forEach((ayah, index) => {
            const ayahCard = document.createElement('div');
            ayahCard.className = 'ayah-card';
            ayahCard.innerHTML = `
                <div class="ayah-header">
                    <span class="ayah-number">${ayah.numberInSurah}</span>
                </div>
                <p class="ayah-arabic">${ayah.text}</p>
                <p class="ayah-english">${englishData.ayahs[index].text}</p>
            `;
            ayahContainer.appendChild(ayahCard);
        });

        updateAudioPlayer();

    } catch (error) {
        console.error('Error fetching surah details:', error);
        ayahContainer.innerHTML = '<p style="color: red;">فشل تحميل بيانات السورة. يرجى التحقق من اتصالك بالإنترنت.</p>';
    }

    function updateAudioPlayer() {
        const reciterIdentifier = reciterSelect.value;
        const paddedSurahNumber = surahNumber.padStart(3, '0');
        const audioUrl = `https://server11.mp3quran.net/${reciterIdentifier}/${paddedSurahNumber}.mp3`;
        
        audioPlayer.src = audioUrl;
        console.log(`Audio URL set to: ${audioUrl}` );

        if (typeof gtag === 'function') {
            gtag('event', 'listen_to_surah', {
                'surah_number': surahNumber,
                'reciter_name': reciters[reciterIdentifier]
            });
        }
    }

    reciterSelect.addEventListener('change', updateAudioPlayer);
});
