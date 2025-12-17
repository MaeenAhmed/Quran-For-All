document.addEventListener('DOMContentLoaded', () => {
    console.log("Quran-For-All Project: Page is ready.");

    const surahContainer = document.getElementById('surah-list-container');
    const modal = document.getElementById('audio-player-modal');
    const modalSurahName = document.getElementById('modal-surah-name');
    const reciterSelect = document.getElementById('reciter-select');
    const audioPlayer = document.getElementById('audio-player');
    const closeButton = document.querySelector('.close-button');

    // قائمة القراء المحدثة
    const reciters = {
        "Abdulaziz_Al-Zahrani": "عبدالعزيز الزهراني (سحيم)",
        "Nasser_Al_qatami": "ناصر القطامي",
        "Mansour_Al-Salmi": "منصور السالمي",
        "islam_sobhi": "إسلام صبحي",
        "Yasser_Al-Dosari": "ياسر الدوسري"
    };

    // ملء قائمة اختيار القراء
    for (const [identifier, name] of Object.entries(reciters)) {
        const option = document.createElement('option');
        option.value = identifier;
        option.textContent = name;
        reciterSelect.appendChild(option);
    }

    // دالة لجلب وعرض السور باستخدام رابط HTTPS
    async function fetchAndDisplaySurahs() {
        try {
            // استخدام رابط HTTPS الآمن
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

                const revelationType = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
                card.innerHTML = `
                    <div class="surah-card-header">
                        <span class="surah-name">${surah.name}</span>
                        <span class="surah-number">${surah.number}</span>
                    </div>
                    <div class="surah-details">
                        <span>${surah.englishName}</span> | <span>${revelationType}</span> | <span>${surah.numberOfAyahs} آيات</span>
                    </div>
                `;
                surahContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching Surahs:', error);
            surahContainer.innerHTML = '<p style="color: red; text-align: center;">عذرًا، حدث خطأ أثناء تحميل قائمة السور. قد يكون بسبب سياسة أمان المتصفح.</p>';
        }
    }

    // دالة لتحديث مشغل الصوت باستخدام رابط HTTPS
    function updateAudioPlayer() {
        let surahNumber = modal.dataset.currentSurah;
        const reciterIdentifier = reciterSelect.value;
        
        if (surahNumber && reciterIdentifier) {
            surahNumber = surahNumber.padStart(3, '0');
            // استخدام رابط HTTPS الآمن لخادم الصوت
            const audioUrl = `https://server11.mp3quran.net/${reciterIdentifier}/${surahNumber}.mp3`;
            
            audioPlayer.src = audioUrl;
            audioPlayer.play( );
            console.log(`Playing Surah ${modal.dataset.currentSurah} by ${reciters[reciterIdentifier]}`);
            console.log(`Audio URL: ${audioUrl}`);
        }
    }

    // إضافة مستمع للنقر على حاوية السور
    surahContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.surah-card');
        if (card) {
            const surahNumber = card.dataset.surahNumber;
            const surahName = card.dataset.surahName;
            
            modal.dataset.currentSurah = surahNumber;
            modalSurahName.textContent = `الاستماع لسورة: ${surahName}`;
            modal.style.display = 'block';
            
            updateAudioPlayer();
        }
    });

    // مستمع لتغيير القارئ
    reciterSelect.addEventListener('change', updateAudioPlayer);

    // إغلاق النافذة المنبثقة
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

    // بدء العملية
    fetchAndDisplaySurahs();
});
