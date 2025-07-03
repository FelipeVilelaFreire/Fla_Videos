document.addEventListener('DOMContentLoaded', () => {
    // ✅  Pega o token de segurança uma única vez
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // ✅  ===================================================================
    // ✅  FUNÇÃO 1: Animação do contador de visualizações no topo
    // ✅  ===================================================================
    function initViewCounterAnimation() {
        const viewsElement = document.querySelector('.views-count');
        if (!viewsElement) return;

        const text = viewsElement.textContent.trim();
        const match = text.match(/\d+/);
        if (!match) return;

        const target = parseInt(match[0], 10);
        const duration = 1000;
        const startTime = performance.now();

        function animateCount(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const exponentialProgress = Math.pow(progress, 2);
            const current = Math.floor(exponentialProgress * target);
            viewsElement.textContent = text.replace(/\d+/, current);

            if (progress < 1) {
                requestAnimationFrame(animateCount);
            } else {
                viewsElement.textContent = text;
                viewsElement.classList.add('active');
            }
        }
        requestAnimationFrame(animateCount);
    }

    // ✅  ===================================================================
    // ✅  FUNÇÃO 2: Rolar a página ao clicar no botão "Play" do banner
    // ✅  ===================================================================
    function initHeroPlayButtonScroll() {
        const heroPlayButton = document.querySelector('.hero-actions .play-button');
        const targetSection = document.querySelector('.content-section');
        if (heroPlayButton && targetSection) {
            heroPlayButton.addEventListener('click', function (event) {
                event.preventDefault();
                targetSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // ✅ ===================================================================
    // ✅  FUNÇÃO 3: Lógica dos botões
    // ✅  ===================================================================
    function initActionButtons() {
        function updateButtonView(button, isActive) {
            if (!button) return;
            button.classList.toggle('ativo', isActive);
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-solid', isActive);
                icon.classList.toggle('fa-regular', !isActive);
                button.style.color = isActive && button.matches('.btn-like') ? 'green' : '';
            }
        }

        function applyClickAnimation(button) {
            const icon = button.querySelector('i');
            if (icon && (button.matches('.btn-like') || button.matches('.btn-heart'))) {
                icon.classList.add('animate-pulse');
                setTimeout(() => icon.classList.remove('animate-pulse'), 400);
            }
        }

        function getEpisodeIdFromButton(button) {
            const episodeCard = button.closest('.episode-card');
            const thumbnailWrapper = episodeCard.querySelector('.thumbnail-wrapper');
            return thumbnailWrapper ? thumbnailWrapper.dataset.episodeId : null;
        }

        document.querySelectorAll('.video-buttons').forEach(videoButtons => {
            const likeBtn = videoButtons.querySelector('.btn-like');
            const dislikeBtn = videoButtons.querySelector('.btn-dislike');
            const heartBtn = videoButtons.querySelector('.btn-heart');
            const starBtn = videoButtons.querySelector('.btn-star');

            videoButtons.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    const epId = getEpisodeIdFromButton(button);
                    if (!epId) return;

                    if (button.matches('.btn-like')) {
                        fetch(`/toggle-like/episodio/${epId}/`, { method: 'POST', headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' }, })
                            .then(response => response.ok ? response.json() : null)
                            .then(data => {
                                if (data && data.status === 'ok') {
                                    if (data.liked) applyClickAnimation(likeBtn);
                                    const likeCountSpan = document.getElementById(`like-count-${epId}`);
                                    const dislikeCountSpan = document.getElementById(`dislike-count-${epId}`);
                                    if (likeCountSpan) likeCountSpan.textContent = data.total_likes;
                                    if (dislikeCountSpan) dislikeCountSpan.textContent = data.total_dislikes;
                                    updateButtonView(likeBtn, data.liked);
                                    updateButtonView(dislikeBtn, data.disliked);
                                }
                            });
                    }

                    if (button.matches('.btn-dislike')) {
                        fetch(`/toggle-dislike/episodio/${epId}/`, { method: 'POST', headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' }, })
                            .then(response => response.ok ? response.json() : null)
                            .then(data => {
                                if (data && data.status === 'ok') {
                                    if (data.disliked) applyClickAnimation(dislikeBtn);
                                    updateButtonView(dislikeBtn, data.disliked);
                                    const dislikedCountSpan = document.getElementById(`dislike-count-${epId}`);
                                    if (dislikedCountSpan) dislikedCountSpan.textContent = data.total_dislikes;
                                    if (data.disliked) {
                                        updateButtonView(likeBtn, false);
                                        const likedCountSpan = document.getElementById(`like-count-${epId}`);
                                        if (likedCountSpan) likedCountSpan.textContent = data.total_likes;
                                    }
                                }
                            });
                    }

                    if (button.matches('.btn-heart')) {
                        fetch(`/toggle-coracao/episodio/${epId}/`, { method: 'POST', headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' }, })
                            .then(response => response.ok ? response.json() : null)
                            .then(data => {
                                if (data && data.status === 'ok') {
                                    if (data.heart) applyClickAnimation(heartBtn);
                                    const heartsCountSpan = document.getElementById(`heart-count-${epId}`);
                                    updateButtonView(heartBtn, data.heart);
                                    if (heartsCountSpan) heartsCountSpan.textContent = data.total_hearts;
                                }
                            });
                    }

                    if (button.matches('.btn-star')) {
                        const starBtn = button;
                        fetch(`/toggle-star/episodio/${epId}/`, { method: 'POST', headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' }, })
                            .then(response => response.ok ? response.json() : null)
                            .then(data => {
                                if (data && data.status === 'ok') {
                                    updateButtonView(starBtn, data.star);
                                    if (data.star) applyClickAnimation(starBtn);
                                }
                            });
                    }
                });
            });
        });
    }

    // ✅  ===================================================================
    // ✅  FUNÇÃO 4: Lógica do Player de Vídeo Customizado
    // ✅ ===================================================================
    function initCustomVideoPlayer() {
        const playerOverlay = document.getElementById('player-overlay');
        if (!playerOverlay) return;

        const playerContainer = playerOverlay.querySelector('.meu-player-container');
        const video = playerOverlay.querySelector('#meu-video');
        const playPauseBtn = playerOverlay.querySelector('#play-pause-btn');
        const rewindBtn = playerOverlay.querySelector('#rewind-btn');
        const forwardBtn = playerOverlay.querySelector('#forward-btn');
        const progressBar = playerOverlay.querySelector('#progress-bar');
        const muteBtn = playerOverlay.querySelector('#mute-btn');
        const volumeBar = playerOverlay.querySelector('#volume-bar');
        const fullscreenBtn = playerOverlay.querySelector('#fullscreen-btn');
        const closePlayerBtn = playerOverlay.querySelector('#close-player-btn');
        const currentTimeEl = playerOverlay.querySelector('#current-time');
        const durationEl = playerOverlay.querySelector('#duration');
        const episodeClickables = document.querySelectorAll('.thumbnail-wrapper');

        function registrarVisualizacao(episodeId) {
            if (!episodeId || !csrfToken) return;
            fetch(`/registrar-visualizacao/episodio/${episodeId}/`, { method: 'POST', headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' } })
                .then(res => res.json()).then(data => console.log('Visualização registrada:', data));
        }

        function openCustomPlayer(videoSrc, episodeId) {
            if (!videoSrc) { alert('Vídeo não disponível.'); return; }
            document.body.classList.add('body-no-scroll');
            video.src = videoSrc;
            playerOverlay.classList.add('visible');
            video.play();
            registrarVisualizacao(episodeId);
        }

        function closeCustomPlayer() {
            document.body.classList.remove('body-no-scroll');
            video.pause();
            video.src = "";
            playerOverlay.classList.remove('visible');
        }

        function togglePlayPause() { video.paused ? video.play() : video.pause(); }
        function updatePlayIcon() {
            const icon = playPauseBtn.querySelector('i');
            icon.classList.toggle('fa-play', video.paused);
            icon.classList.toggle('fa-pause', !video.paused);
            playerContainer.classList.toggle('paused', video.paused);
        }
        function formatTime(time) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        function updateProgress() {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.setProperty('--progress', `${progress}%`);
            progressBar.value = isNaN(progress) ? 0 : progress;
            currentTimeEl.textContent = formatTime(video.currentTime);
        }
        function setVideoProgress() { video.currentTime = (progressBar.value / 100) * video.duration; }
        function seekBackward() { video.currentTime -= 10; }
        function seekForward() { video.currentTime += 10; }
        function toggleMute() { video.muted = !video.muted; }
        function updateMuteIcon() {
            const icon = muteBtn.querySelector('i');
            volumeBar.style.setProperty('--volume', `${video.volume * 100}%`);
            if (video.muted || video.volume === 0) {
                icon.classList.remove('fa-volume-high', 'fa-volume-low');
                icon.classList.add('fa-volume-xmark');
            } else if (video.volume < 0.5) {
                icon.classList.remove('fa-volume-high', 'fa-volume-xmark');
                icon.classList.add('fa-volume-low');
            } else {
                icon.classList.remove('fa-volume-low', 'fa-volume-xmark');
                icon.classList.add('fa-volume-high');
            }
        }
        function setVolume() { video.volume = volumeBar.value; }
        function toggleFullscreen() {
            const icon = fullscreenBtn.querySelector('i');
            if (!document.fullscreenElement) {
                playerContainer.requestFullscreen ? playerContainer.requestFullscreen() : playerContainer.webkitRequestFullscreen();
                icon.classList.remove('fa-expand');
                icon.classList.add('fa-compress');
            } else {
                document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
            }
        }

        episodeClickables.forEach(el => el.addEventListener('click', () => openCustomPlayer(el.dataset.videoSrc, el.dataset.episodeId)));
        closePlayerBtn.addEventListener('click', closeCustomPlayer);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && playerOverlay.classList.contains('visible')) closeCustomPlayer();
        });
        playPauseBtn.addEventListener('click', togglePlayPause);
        rewindBtn.addEventListener('click', seekBackward);
        forwardBtn.addEventListener('click', seekForward);
        muteBtn.addEventListener('click', toggleMute);
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fullscreenBtn.querySelector('i').classList.remove('fa-compress');
                fullscreenBtn.querySelector('i').classList.add('fa-expand');
            }
        });
        volumeBar.addEventListener('input', setVolume);
        progressBar.addEventListener('input', setVideoProgress);
        video.addEventListener('play', updatePlayIcon);
        video.addEventListener('pause', updatePlayIcon);
        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('volumechange', updateMuteIcon);
        video.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(video.duration);
            updateProgress();
            updateMuteIcon();
        });
    }

    // ✅ ===================================================================
    // ✅ FUNÇÃO 5: FILTRAGEM DE FILMES POR RODADA
    // ✅ ===================================================================
    function initFaseFilter() {
    const seletorDeFase = document.getElementById('rodada');
    if (!seletorDeFase) return;

    // Não buscamos a lista aqui fora.

    seletorDeFase.addEventListener('change', function() {
        // ✅ A lista de episódios é buscada AQUI DENTRO, no momento do clique.
        const todosOsEpisodios = document.querySelectorAll('.episode-card');

        const faseSelecionada = seletorDeFase.value;

        todosOsEpisodios.forEach(card => { // <-- Usa a lista sempre atualizada
            const faseDoCard = card.dataset.fase;
            const deveMostrar = faseSelecionada === "" || faseDoCard === faseSelecionada;

            if (deveMostrar) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
}

    // --- INICIALIZAÇÃO DE TODAS AS FUNÇÕES ---
    initViewCounterAnimation();
    initHeroPlayButtonScroll();
    initActionButtons();
    initCustomVideoPlayer();
    initFaseFilter();
});