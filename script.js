document.addEventListener('DOMContentLoaded', () => {
    console.log("Quran-For-All Project: Page is ready.");

    // --- دالة عرض الرسائل النورانية ---
    function displayRandomMessage() {
        // التأكد من أن ملف messages.js قد تم تحميله وأن المصفوفة موجودة
        if (typeof messagesOfLight !== 'undefined' && messagesOfLight.length > 0) {
            const randomIndex = Math.floor(Math.random() * messagesOfLight.length);
            const message = messagesOfLight[randomIndex];

            document.getElementById('arabic-message').textContent = message.arabic;
            document.getElementById('english-message').textContent = message.english;
            document.getElementById('message-source').textContent = message.source;
        } else {
            console.error("Error: 'messagesOfLight' array not found or is empty.");
        }
    }

    // --- إعدادات العناصر ---
    const surahContainer = document.getElementById('surah-list-container');

    // --- دالة جلب وعرض السور ---
    async function fetchAndDisplaySurahs() {
        try {
            // جلب قائمة السور من الـ API
            const response = await fetch('https://api.alquran.cloud/v1/surah' );
            if (!response.ok) throw new Error(`Network Error: ${response.statusText}`);
            
            const data = await response.json();
            if (data.code !== 200) throw new Error('Invalid data from API');

            // إفراغ الحاوية من مؤشر التحميل
            surahContainer.innerHTML = '';
            
            // إنشاء بطاقة لكل سورة
            data.data.forEach(surah => {
                // استخدام عنصر <a> لجعله رابطًا قابلاً للنقر
                const card = document.createElement('a'); 
                card.href = `surah.html?surah=${surah.number}`; // الرابط إلى الصفحة الجديدة مع تمرير رقم السورة
                card.className = 'surah-card';
                card.dataset.surahNumber = surah.number;

                const revelationType = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
                
                // ملء محتوى البطاقة
                card.innerHTML = `
                    <div class="surah-card-header">
                        <span class="surah-name">${surah.name}</span>
                        <span class="surah-number">${surah.number}</span>
                    </div>
                    <div class="surah-details">
                        <span>${surah.englishName}</span> | <span>${revelationType}</span> | <span>${surah.numberOfAyahs} آيات</span>
                    </div>
                `;
                
                // إضافة البطاقة إلى الحاوية
                surahContainer.appendChild(card);

                // إضافة حدث النقر لتتبع الإحصائيات
                card.addEventListener('click', (e) => {
                    // لا نمنع الانتقال الافتراضي للرابط، فقط نسجل الحدث
                    if (typeof gtag === 'function') {
                        gtag('event', 'view_surah_details', {
                            'surah_number': surah.number,
                            'surah_name': surah.englishName
                        });
                    }
                });
            });

        } catch (error) {
            console.error('Error fetching Surahs:', error);
            surahContainer.innerHTML = '<p style="color: red; text-align: center;">عذرًا، حدث خطأ أثناء تحميل قائمة السور. يرجى التحقق من اتصالك بالإنترنت.</p>';
        }
    }

    // --- بدء العمليات عند تحميل الصفحة ---
    displayRandomMessage(); // عرض رسالة عشوائية
    fetchAndDisplaySurahs(); // جلب وعرض قائمة السور
});
