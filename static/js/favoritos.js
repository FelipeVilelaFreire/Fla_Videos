// JavaScript para a página de favoritos (VERSÃO FINAL E REATORADA)

document.addEventListener('DOMContentLoaded', () => {

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;


    function initStarRemovalSystem() {
        const movieListContainer = document.querySelector('.movie-list');
        if (!movieListContainer) return;

        movieListContainer.addEventListener('click', (event) => {
            const starButton = event.target.closest('.btn-star');

            // Se o clique não foi na estrela, a função para aqui.
            if (!starButton) return;

            // Impede que o clique na estrela acione o player de vídeo.
            event.preventDefault();
            event.stopPropagation();

            const epId = starButton.dataset.episodeId;
            if (!epId || !csrfToken) return;

            // Lógica de fetch para remover o favorito
            fetch(`/toggle-star-remove/episodio/${epId}/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' },
            })
            .then(response => {
                if (!response.ok) {
                    // Lança um erro para ser pego pelo .catch()
                    throw new Error('Falha na resposta da rede ao tentar remover favorito.');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.status === 'ok' && data.removido) {
                    const movieCard = starButton.closest('.movie-card');
                    if (movieCard) {
                        movieCard.style.transition = 'opacity 0.5s ease';
                        movieCard.style.opacity = '0';
                        setTimeout(() => movieCard.remove(), 500); // Remove o card da tela após a transição
                    }
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                // Opcional: Adicionar um feedback visual para o usuário informando o erro.
            });
        });
    }

    function initCustomVideoPlayer() {

        const playerOverlay = document.getElementById('player-overlay');
        if (!playerOverlay) return;

        // Seleção de todos os elementos
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

        // --- Funções do Player ---
        function registrarVisualizacao(episodeId) {
            if (!episodeId || !csrfToken) return;
            // A URL aqui deve corresponder à sua URL de registrar visualização
            fetch(`/registrar-visualizacao/episodio/${episodeId}/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' }
            }).then(res => res.json()).then(data => console.log('Visualização registrada:', data));
        }

        function openCustomPlayer(videoSrc, episodeId) {
            if (!videoSrc) {
                alert('Vídeo não disponível.');
                return;
            }
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

        function togglePlayPause() {
            video.paused ? video.play() : video.pause();
        }

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

        function setVideoProgress() {
            video.currentTime = (progressBar.value / 100) * video.duration;
        }

        function seekBackward() {
            video.currentTime -= 10;
        }

        function seekForward() {
            video.currentTime += 10;
        }

        function toggleMute() {
            video.muted = !video.muted;
        }

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

        function setVolume() {
            video.volume = volumeBar.value;
        }

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

        // --- Conexão dos Eventos ---
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


    initStarRemovalSystem()
    initCustomVideoPlayer()
});