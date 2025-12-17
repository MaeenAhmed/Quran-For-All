document.addEventListener('DOMContentLoaded', () => {
    console.log("Quran-For-All Project: Page is ready.");

    // --- دالة عرض الرسائل النورانية ---
    function displayRandomMessage() {
        if (typeof messagesOfLight !== 'undefined' && messagesOfLight.length > 0) {
            const randomIndex = Math.floor(Math.random() * messagesOfLight.length);
            const message = messagesOfLight[randomIndex];
            document.getElementById('arabic-message').textContent = message.arabic;
            document.getElementById('english-message').textContent = message.english;
            document.getElementById('message-source').textContent = message.source;
        } else {
            console.error("Error: 'messagesOfLight' array not found.");
        }
    }

    // --- إعدادات العناصر ---
    const surahContainer = document.getElementById('surah-list-container');
    const modal = document.getElementById('audio-player-modal');
    const modalSurahName = document.getElementById('modal-surah-name');
    const reciterSelect = document.getElementById('reciter-select');
    const audioPlayer = document.getElementById('audio-player');
    const closeButton = document.querySelector('.close-button');

    // --- قائمة القراء ---
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

    // --- دالة جلب وعرض السور (مع إصلاح HTTPS) ---
    async function fetchAndDisplaySurahs() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/surah' );
            if (!response.ok) throw new Error(`Network Error: ${response.statusText}`);
            const data = await response.json();
            if (data.code !== 200) throw new Error('Invalid data from API');

            surahContainer.innerHTML = ''; // إزالة مؤشر التحميل
            
            data.data.forEach(surah => {
                const card = document.createElement('div');
                card.className = 'surah-card';
                card.dataset.surahNumber = surah.number;
                card.dataset.surahName = surah.name;
                card.dataset.englishName = surah.englishName;

                const revelationType = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
                card.innerHTML = `<div class="surah-card-header"><span class="surah-name">${surah.name}</span><span class="surah-number">${surah.number}</span></div><div class="surah-details"><span>${surah.englishName}</span> | <span>${revelationType}</span> | <span>${surah.numberOfAyahs} آيات</span></div>`;
                surahContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching Surahs:', error);
            surahContainer.innerHTML = '<p style="color: red; text-align: center;">عذرًا، حدث خطأ أثناء تحميل قائمة السور. يرجى التأكد من اتصالك بالإنترنت وتحديث الصفحة.</p>';
        }
    }

    // --- دالة تحديث مشغل الصوت (مع إصلاح HTTPS وتتبع الأحداث) ---
    function updateAudioPlayer() {
        let surahNumber = modal.dataset.currentSurah;
        const reciterIdentifier = reciterSelect.value;
        
        if (surahNumber && reciterIdentifier) {
            surahNumber = surahNumber.padStart(3, '0');
            const audioUrl = `https://server11.mp3quran.net/${reciterIdentifier}/${surahNumber}.mp3`;
            
            audioPlayer.src = audioUrl;
            audioPlayer.play( );

            // إرسال حدث إلى Google Analytics
            if (typeof gtag === 'function') {
                gtag('event', 'play_audio', {
                    'surah_number': modal.dataset.currentSurah,
                    'surah_name': modal.dataset.currentSurahName,
                    'reciter_name': reciters[reciterIdentifier]
                });
            }
        }
    }

    // --- إعداد مستمعي الأحداث (مع تتبع الأحداث) ---
    surahContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.surah-card');
        if (card) {
            const surahNumber = card.dataset.surahNumber;
            const surahName = card.dataset.surahName;
            const englishName = card.dataset.englishName;
            
            modal.dataset.currentSurah = surahNumber;
            modal.dataset.currentSurahName = englishName; // تخزين الاسم الإنجليزي للتتبع
            modalSurahName.textContent = `الاستماع لسورة: ${surahName}`;
            modal.style.display = 'block';
            
            updateAudioPlayer();

            // إرسال حدث مشاهدة السورة إلى Google Analytics
            if (typeof gtag === 'function') {
                gtag('event', 'view_surah', {
                    'surah_number': surahNumber,
                    'surah_name': englishName
                });
            }
        }
    });

    reciterSelect.addEventListener('change', updateAudioPlayer);

    closeButton.onclick = () => {
        modal.style.display = 'none';
        audioPlayer.pause();
        audioPlayer.src = "";
    };
    window.onclick = (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
            audioPlayer.pause();
            audioPlayer.src = "";
        }
    };

    // --- بدء العمليات عند تحميل الصفحة ---
    displayRandomMessage();
    fetchAndDisplaySurahs();
});
