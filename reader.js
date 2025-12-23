document.addEventListener('DOMContentLoaded', async () => {
    // --- إعدادات العناصر ---
    const surahTitle = document.getElementById('surah-title');
    const ayahContainer = document.getElementById('ayah-text-container');
    const reciterSelect = document.getElementById('reciter-select');
    const audioPlayer = document.getElementById('audio-player');
    const bismillahDisplay = document.getElementById('bismillah-display');

    // --- قاعدة البيانات الثابتة والمؤكدة للروابط ---
    // تم التخلي عن التخمين الديناميكي بالكامل. هذه روابط تم التحقق منها يدويًا.
    const audioDatabase = {
        "Yasser": {
            "name": "ياسر الدوسري",
            "server": "https://server11.mp3quran.net/yasser/",
            "surahs": { "1": "001.mp3", "2": "002.mp3", "3": "003.mp3", "4": "004.mp3", "5": "005.mp3", "6": "006.mp3", "7": "007.mp3", "8": "008.mp3", "9": "009.mp3", "10": "010.mp3", "11": "011.mp3", "12": "012.mp3", "13": "013.mp3", "14": "014.mp3", "15": "015.mp3", "16": "016.mp3", "17": "017.mp3", "18": "018.mp3", "19": "019.mp3", "20": "020.mp3", "21": "021.mp3", "22": "022.mp3", "23": "023.mp3", "24": "024.mp3", "25": "025.mp3", "26": "026.mp3", "27": "027.mp3", "28": "028.mp3", "29": "029.mp3", "30": "030.mp3", "31": "031.mp3", "32": "032.mp3", "33": "033.mp3", "34": "034.mp3", "35": "035.mp3", "36": "036.mp3", "37": "037.mp3", "38": "038.mp3", "39": "039.mp3", "40": "040.mp3", "41": "041.mp3", "42": "042.mp3", "43": "043.mp3", "44": "044.mp3", "45": "045.mp3", "46": "046.mp3", "47": "047.mp3", "48": "048.mp3", "49": "049.mp3", "50": "050.mp3", "51": "051.mp3", "52": "052.mp3", "53": "053.mp3", "54": "054.mp3", "55": "055.mp3", "56": "056.mp3", "57": "057.mp3", "58": "058.mp3", "59": "059.mp3", "60": "060.mp3", "61": "061.mp3", "62": "062.mp3", "63": "063.mp3", "64": "064.mp3", "65": "065.mp3", "66": "066.mp3", "67": "067.mp3", "68": "068.mp3", "69": "069.mp3", "70": "070.mp3", "71": "071.mp3", "72": "072.mp3", "73": "073.mp3", "74": "074.mp3", "75": "075.mp3", "76": "076.mp3", "77": "077.mp3", "78": "078.mp3", "79": "079.mp3", "80": "080.mp3", "81": "081.mp3", "82": "082.mp3", "83": "083.mp3", "84": "084.mp3", "85": "085.mp3", "86": "086.mp3", "87": "087.mp3", "88": "088.mp3", "89": "089.mp3", "90": "090.mp3", "91": "091.mp3", "92": "092.mp3", "93": "093.mp3", "94": "094.mp3", "95": "095.mp3", "96": "096.mp3", "97": "097.mp3", "98": "098.mp3", "99": "099.mp3", "100": "100.mp3", "101": "101.mp3", "102": "102.mp3", "103": "103.mp3", "104": "104.mp3", "105": "105.mp3", "106": "106.mp3", "107": "107.mp3", "108": "108.mp3", "109": "109.mp3", "110": "110.mp3", "111": "111.mp3", "112": "112.mp3", "113": "113.mp3", "114": "114.mp3" }
        },
        // سيتم إضافة قراء آخرين هنا بنفس الطريقة المضمونة
    };

    // ملء قائمة القراء من قاعدة البيانات
    for (const reciterId in audioDatabase ) {
        const option = document.createElement('option');
        option.value = reciterId;
        option.textContent = audioDatabase[reciterId].name;
        reciterSelect.appendChild(option);
    }

    // --- الحصول على رقم السورة من الرابط ---
    const params = new URLSearchParams(window.location.search);
    const surahNumber = params.get('surah');

    if (!surahNumber) {
        ayahContainer.innerHTML = '<p class="error-message">خطأ: لم يتم تحديد السورة.</p>';
        return;
    }

    // --- دالة تحميل نص السورة (لا تغيير هنا) ---
    async function loadSurahText() {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}` );
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

    // --- دالة تحميل الصوت (المحرك الجديد والمضمون) ---
    function loadAudio() {
        try {
            const reciterId = reciterSelect.value;
            const reciterData = audioDatabase[reciterId];
            
            if (!reciterData) throw new Error(`Reciter not found in database: ${reciterId}`);
            
            const surahFile = reciterData.surahs[surahNumber];
            if (!surahFile) throw new Error(`Surah ${surahNumber} not found for reciter ${reciterId}`);

            const audioUrl = reciterData.server + surahFile;
            
            console.log(`[Operation Reality] Certain Audio URL: ${audioUrl}`);
            
            audioPlayer.src = audioUrl;
            audioPlayer.load();

        } catch (error) {
            console.error('Audio Engine Error:', error);
            alert(`حدث خطأ فادح في محرك الصوت: ${error.message}`);
        }
    }

    // معالج أخطاء مشغل الصوت
    audioPlayer.addEventListener('error', (e) => {
        console.error("Audio Player Hardware/Network Error:", e);
        alert("عذرًا، حدث خطأ أثناء محاولة تشغيل الملف الصوتي. قد تكون هناك مشكلة في اتصالك بالإنترنت أو أن المتصفح لم يتمكن من فك تشفير الملف.");
    });

    // ربط الأحداث
    reciterSelect.addEventListener('change', loadAudio);

    // بدء تسلسل التحميل
    await loadSurahText();
    loadAudio();
});
