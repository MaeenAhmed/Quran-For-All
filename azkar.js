import { azkarData, azkarAudioBaseUrl } from './azkar_data.js';

document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('azkar-container');
    const audioPlayer = document.getElementById('azkar-audio-player');
    const morningBtn = document.getElementById('morning-btn');
    const eveningBtn = document.getElementById('evening-btn');
    const themeToggle = document.getElementById('theme-toggle');
    
    let currentMode = 'morning'; // 'morning' or 'evening'

    // Helper function to replace 'أصبحنا' with 'أمسينا' and vice versa
    function adaptZekr(zekr, mode) {
        if (mode === 'evening') {
            return zekr
                .replace(/أَصْبَحْنَا/g, 'أَمْسَيْنَا')
                .replace(/أَصْبَحْنا/g, 'أَمْسَيْنَا')
                .replace(/أَصْبَحْتُ/g, 'أَمْسَيْتُ')
                .replace(/هَذَا الْيَوْمِ/g, 'هَذِهِ اللَّيْلَةِ')
                .replace(/إِلَيْكَ النُّشُورُ/g, 'إِلَيْكَ الْمَصِيرُ')
                .replace(/أَصْبَحَ/g, 'أَمْسَى');
        } else {
            // Revert for morning mode (if needed, but usually the base text is morning)
            return zekr;
        }
    }

    function renderAzkar(mode) {
        mainContainer.innerHTML = '';
        
        const filteredAzkar = azkarData.filter(item => 
            item.category === 'صباح ومساء' || item.category === (mode === 'morning' ? 'صباح' : 'مساء')
        );

        filteredAzkar.forEach(item => {
            const zekrText = adaptZekr(item.zekr, mode);
            const card = document.createElement('div');
            card.className = 'azkar-card';
            card.setAttribute('data-zekr-id', item.id);
            card.setAttribute('data-count', item.count);
            card.setAttribute('data-current-count', 0);

            card.innerHTML = `
                <p class="zekr-text">${zekrText}</p>
                <div class="zekr-footer">
                    <span class="count-display">${item.count}</span>
                    <button class="play-audio-btn" data-audio-id="${item.audio_id}">تشغيل الصوت</button>
                    <button class="counter-btn">
                        <span class="current-count">0</span> / ${item.count}
                    </button>
                </div>
                ${item.virtue ? `<p class="virtue">${item.virtue}</p>` : ''}
                ${item.source ? `<p class="source">المصدر: ${item.source}</p>` : ''}
            `;

            const counterBtn = card.querySelector('.counter-btn');
            const currentCountSpan = card.querySelector('.current-count');
            
            counterBtn.addEventListener('click', () => {
                let current = parseInt(card.getAttribute('data-current-count'));
                const max = parseInt(card.getAttribute('data-count'));

                if (current < max) {
                    current++;
                    card.setAttribute('data-current-count', current);
                    currentCountSpan.textContent = current;
                    
                    if (current === max) {
                        card.classList.add('completed');
                        counterBtn.disabled = true;
                    }
                }
            });
            
            const playAudioBtn = card.querySelector('.play-audio-btn');
            playAudioBtn.addEventListener('click', () => {
                const audioId = playAudioBtn.getAttribute('data-audio-id');
                if (audioId) {
                    // الإصلاح: تنسيق audio_id ليصبح بثلاثة أرقام (مثل 135)
                    const formattedAudioId = audioId.padStart(3, '0');
                    audioPlayer.src = azkarAudioBaseUrl + formattedAudioId + '.mp3';
                    audioPlayer.play();
                }
            });

            mainContainer.appendChild(card);
        });
    }

    // Event listeners for mode switching
    morningBtn.addEventListener('click', () => {
        currentMode = 'morning';
        morningBtn.classList.add('active');
        eveningBtn.classList.remove('active');
        renderAzkar(currentMode);
    });

    eveningBtn.addEventListener('click', () => {
        currentMode = 'evening';
        eveningBtn.classList.add('active');
        morningBtn.classList.remove('active');
        renderAzkar(currentMode);
    });
    
    // Initial render
    morningBtn.classList.add('active');
    renderAzkar(currentMode);
    
    // Theme toggle (simple dark mode)
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
});
