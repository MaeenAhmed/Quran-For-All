import messages from './messages.js';

document.addEventListener('DOMContentLoaded', () => {
    function displayRandomMessage() {
        if (messages && messages.length > 0) {
            const randomIndex = Math.floor(Math.random() * messages.length);
            const message = messages[randomIndex];
            document.getElementById('arabic-message').textContent = message.ar.text;
            document.getElementById('english-message').textContent = message.en.text;
            document.getElementById('message-source').textContent = message.ar.reference ? `(${message.ar.reference})` : '';
        }
    }

    const surahContainer = document.getElementById('surah-list-container');

    async function fetchAndDisplaySurahs() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/surah'  );
            if (!response.ok) throw new Error(`Network Error: ${response.statusText}`);
            const data = await response.json();
            if (data.code !== 200) throw new Error('Invalid data from API');

            surahContainer.innerHTML = '';
            
            data.data.forEach(surah => {
                const card = document.createElement('a'); 
                card.href = `reader.html?surah=${surah.number}`; // توجيه إلى المحرك الجديد
                card.className = 'surah-card';
                card.dataset.surahNumber = surah.number;

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
            surahContainer.innerHTML = '<p class="error-message">عذرًا، حدث خطأ أثناء تحميل قائمة السور.</p>';
        }
    }

    displayRandomMessage();
    fetchAndDisplaySurahs();
});
