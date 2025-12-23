document.addEventListener('DOMContentLoaded', async () => {
    // --- إعدادات العناصر ---
    const surahTitle = document.getElementById('surah-title');
    const ayahContainer = document.getElementById('ayah-text-container');
    const reciterSelect = document.getElementById('reciter-select');
    const audioPlayer = document.getElementById('audio-player');
    const bismillahDisplay = document.getElementById('bismillah-display');

    // --- قائمة القراء (بناءً على بنية tvquran.com) ---
    // المفتاح: هو اسم المجلد الخاص بالقارئ على خادم tvquran
    // القيمة: هو الاسم الذي سيظهر للمستخدم
    const reciters = {
        "Yasser": "ياسر الدوسري",
        "A_Aziz_S": "عبدالعزيز سحيم",
        "Nasser_Alqatami": "ناصر القطامي",
        "Mansour-Salmi": "منصور السالمي",
        "islam_sobhi": "إسلام صبحي",
        "Alafasy": "مشاري راشد العفاسي",
        "basit": "عبد الباسط عبد الصمد (مرتل)"
    };

    // ملء قائمة القراء
    for (const [identifier, name] of Object.entries(reciters)) {
        const option = document.createElement('option');
        option.value = identifier;
        option.textContent = name;
        reciterSelect.appendChild(option);
    }

    // --- الحصول على رقم السورة من الرابط ---
    const params = new URLSearchParams(window.location.search);
    const surahNumber = params.get('surah');

    if (!surahNumber) {
        ayahContainer.innerHTML = '<p class="error-message">خطأ: لم يتم تحديد السورة.</p>';
        return;
    }

    // --- دالة تحميل نص السورة ---
    async function loadSurahText() {
        try {
            // استخدام API موثوق لجلب النص فقط
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}` );
            if (!response.ok) throw new Error('Network response was not ok.');
            
            const data = await response.json();
            const surahData = data.data;

            // تحديث عناوين الصفحة
            surahTitle.textContent = `سورة ${surahData.name}`;
            document.title = `سورة ${surahData.name} - مشروع القرآن للجميع`;
            
            // عرض البسملة (ما عدا التوبة والفاتحة)
            if (surahNumber != 9 && surahNumber != 1) {
                bismillahDisplay.style.display = 'block';
            }

            // بناء نص السورة بأسلوب المصحف
            let fullSurahText = '';
            surahData.ayahs.forEach(ayah => {
                fullSurahText += `${ayah.text} <span class="ayah-marker">﴿${ayah.numberInSurah}﴾</span> `;
            });
            
            ayahContainer.innerHTML = fullSurahText;

        } catch (error) {
            console.error('Error fetching surah text:', error);
            ayahContainer.innerHTML = '<p class="error-message">فشل تحميل نص السورة. يرجى التحقق من اتصالك بالإنترنت.</p>';
        }
    }

    // --- دالة تحميل وتحديث الصوت (المحرك الجديد) ---
    function loadAudio() {
        try {
            const reciterIdentifier = reciterSelect.value;
            
            // تحويل رقم السورة إلى 3 أرقام (e.g., 1 -> 001, 114 -> 114)
            const paddedSurahNumber = surahNumber.padStart(3, '0');
            
            // بناء الرابط المباشر بناءً على بنية tvquran.com
            const audioUrl = `https://server11.mp3quran.net/${reciterIdentifier}/${paddedSurahNumber}.mp3`;
            
            console.log(`[Operation Certainty] Audio URL Generated: ${audioUrl}` );
            
            // تحديث مشغل الصوت
            audioPlayer.src = audioUrl;
            audioPlayer.load(); // أمر صريح للمتصفح بتحميل الملف الصوتي

            // إرسال حدث إلى Google Analytics
            if (typeof gtag === 'function') {
                gtag('event', 'audio_load_success', {
                    'surah_number': surahNumber,
                    'reciter_name': reciters[reciterIdentifier]
                });
            }

        } catch (error) {
            console.error('Error constructing audio URL:', error);
            // هذا الخطأ يحدث فقط إذا كان هناك مشكلة في الكود نفسه
        }
    }

    // --- معالجة أخطاء مشغل الصوت ---
    audioPlayer.addEventListener('error', (e) => {
        console.error("Audio Player Error:", e);
        alert("عذرًا، حدث خطأ أثناء محاولة تشغيل الملف الصوتي. قد يكون الملف غير متوفر لهذا القارئ أو هناك مشكلة في الشبكة. يرجى تجربة قارئ آخر أو التحقق من اتصالك بالإنترنت.");
        
        if (typeof gtag === 'function') {
            gtag('event', 'audio_load_failed', {
                'surah_number': surahNumber,
                'reciter_name': reciters[reciterSelect.value]
            });
        }
    });

    // --- ربط الأحداث ---
    reciterSelect.addEventListener('change', loadAudio);

    // --- بدء تسلسل التحميل ---
    await loadSurahText(); // أولاً، حمل النص
    loadAudio();           // ثانياً، حمل الصوت الافتراضي
});
