document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // GLOBAL STATE & CORE DOM ELEMENTS
    // ----------------------------------------------------
    let isPlaying = false;
    let activeFilter = 'none';
    let duration = 0;
    let targetFps = 90;
    
    // Video Elements
    const video = document.getElementById('hidden-video-feed');
    const audio = document.getElementById('hidden-audio-feed');
    const canvas = document.getElementById('video-canvas');
    const ctx = canvas.getContext('2d');
    const perspectiveContainer = document.getElementById('perspective-element');

    // UI Buttons & Labels
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnSplit = document.getElementById('btn-split-clip');
    const lblTimeCurrent = document.getElementById('player-time-current');
    const lblTimeTotal = document.getElementById('player-time-total');
    const lblFpsDisplay = document.getElementById('lbl-fps-display');
    const membershipBadge = document.getElementById('membership-badge');

    // Canvas Size Initialization
    canvas.width = 640;
    canvas.height = 360;

    // ----------------------------------------------------
    // TAB CONTROLLER
    // ----------------------------------------------------
    const selectorButtons = document.querySelectorAll('.selector-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    selectorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPaneId = `pane-${btn.getAttribute('data-tab')}`;
            
            // Toggle Tab Buttons
            selectorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle Panes
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.getAttribute('id') === targetPaneId) {
                    pane.classList.add('active');
                }
            });
        });
    });

    // ----------------------------------------------------
    // MEDIA LOADER (UPLOAD & SAMPLE CLICKS)
    // ----------------------------------------------------
    const mediaDropzone = document.getElementById('media-dropzone');
    const mediaFileInput = document.getElementById('media-file-input');
    const sampleAssets = document.querySelectorAll('.sample-asset-item');
    const videoClipBlock = document.getElementById('video-clip-block');
    const audioClipBlock = document.getElementById('audio-clip-block');

    const loadMediaFile = (file) => {
        const fileUrl = URL.createObjectURL(file);
        const type = file.type.split('/')[0];
        
        if (type === 'video') {
            video.src = fileUrl;
            video.load();
            video.onloadedmetadata = () => {
                duration = video.duration;
                updateTimelineRuler(duration);
                lblTimeTotal.textContent = formatTime(duration);
                if (videoClipBlock) {
                    videoClipBlock.querySelector('.clip-title').textContent = file.name;
                    videoClipBlock.style.width = '70%'; // Reset to default timeline width
                }
            };
        } else if (type === 'audio') {
            audio.src = fileUrl;
            audio.load();
            if (audioClipBlock) {
                audioClipBlock.querySelector('.clip-title').textContent = file.name;
                audioClipBlock.style.width = '70%';
            }
        }
    };

    if (mediaDropzone && mediaFileInput) {
        mediaDropzone.addEventListener('click', () => mediaFileInput.click());
        mediaFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) loadMediaFile(file);
        });

        mediaDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            mediaDropzone.style.borderColor = 'var(--primary-neon)';
        });
        mediaDropzone.addEventListener('dragleave', () => {
            mediaDropzone.style.borderColor = 'rgba(0, 180, 216, 0.25)';
        });
        mediaDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            mediaDropzone.style.borderColor = 'rgba(0, 180, 216, 0.25)';
            const file = e.dataTransfer.files[0];
            if (file) loadMediaFile(file);
        });
    }

    sampleAssets.forEach(item => {
        item.addEventListener('click', () => {
            const url = item.getAttribute('data-url');
            const type = item.getAttribute('data-type');
            const name = item.getAttribute('data-name');

            if (type === 'video') {
                video.src = url;
                video.load();
                video.onloadedmetadata = () => {
                    duration = video.duration;
                    updateTimelineRuler(duration);
                    lblTimeTotal.textContent = formatTime(duration);
                    if (videoClipBlock) {
                        videoClipBlock.querySelector('.clip-title').textContent = name;
                    }
                };
            }
        });
    });

    // Default Video Load
    video.src = "https://assets.mixkit.co/videos/preview/mixkit-matrix-style-glowing-digital-cube-43177-large.mp4";
    video.load();
    video.onloadedmetadata = () => {
        duration = video.duration || 15;
        updateTimelineRuler(duration);
        lblTimeTotal.textContent = formatTime(duration);
    };

    // ----------------------------------------------------
    // VIDEO RENDER ENGINE (requestAnimationFrame Loop)
    // ----------------------------------------------------
    let lastTime = 0;
    let frameCount = 0;

    const renderLoop = (time) => {
        // Calculate FPS display
        frameCount++;
        if (time - lastTime >= 1000) {
            lblFpsDisplay.textContent = Math.round((frameCount * 1000) / (time - lastTime));
            frameCount = 0;
            lastTime = time;
        }

        // Draw Video Frame to Canvas
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw original frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Apply Chromatic aberration (Chroma Split) filter
            if (activeFilter === 'chroma') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Red Shift channel (source-over)
                ctx.drawImage(video, -4, 0, canvas.width, canvas.height);
                
                // Screen cyan layer shift
                ctx.globalCompositeOperation = 'screen';
                ctx.drawImage(video, 4, 0, canvas.width, canvas.height);
                
                // Restore compositing
                ctx.globalCompositeOperation = 'source-over';
            }

            // Apply Glitch slices
            if (activeFilter === 'glitch' && Math.random() < 0.15) {
                const sliceY = Math.random() * canvas.height;
                const sliceH = Math.random() * 40 + 15;
                const shiftX = (Math.random() - 0.5) * 35;
                ctx.drawImage(video, 0, sliceY, canvas.width, sliceH, shiftX, sliceY, canvas.width, sliceH);
            }

            // Apply Neon Blue gradient tint
            if (activeFilter === 'neon') {
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = 'rgba(0, 180, 216, 0.22)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'source-over';
            }
        } else {
            // Draw loading screen if no video loaded
            ctx.fillStyle = '#060a12';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00b4d8';
            ctx.font = "14px 'Orbitron'";
            ctx.textAlign = 'center';
            ctx.fillText("READY / LOADING TRACK...", canvas.width / 2, canvas.height / 2);
        }

        // Update timeline playhead while playing
        if (isPlaying) {
            const progress = video.currentTime / video.duration;
            const timelineWidth = document.getElementById('timeline-ruler-ticks').clientWidth;
            playhead.style.left = `${progress * timelineWidth + 120}px`;
            lblTimeCurrent.textContent = formatTime(video.currentTime);
        }

        requestAnimationFrame(renderLoop);
    };

    requestAnimationFrame(renderLoop);

    // Playback Toggle
    const togglePlayPause = () => {
        if (isPlaying) {
            video.pause();
            audio.pause();
            btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
            isPlaying = false;
        } else {
            video.play().catch(err => console.log("Play interrupted: ", err));
            if (audio.src) audio.play().catch(err => {});
            btnPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
            isPlaying = true;
        }
    };

    btnPlayPause.addEventListener('click', togglePlayPause);

    // ----------------------------------------------------
    // TIMELINE PLAYHEAD SCRUBBING
    // ----------------------------------------------------
    const playhead = document.getElementById('timeline-playhead-bar');
    const timelineRuler = document.querySelector('.timeline-ruler');

    const scrubPlayhead = (e) => {
        const rect = timelineRuler.getBoundingClientRect();
        const startX = rect.left + 120; // 120px offset
        const timelineWidth = rect.width - 120;
        
        let clientX = e.clientX;
        if (e.touches) clientX = e.touches[0].clientX;

        let posX = clientX - startX;
        posX = Math.max(0, Math.min(timelineWidth, posX));

        const percentage = posX / timelineWidth;
        playhead.style.left = `${posX + 120}px`;
        
        if (video.duration) {
            video.currentTime = percentage * video.duration;
            lblTimeCurrent.textContent = formatTime(video.currentTime);
        }
    };

    let isDraggingPlayhead = false;
    
    timelineRuler.addEventListener('mousedown', (e) => {
        isDraggingPlayhead = true;
        scrubPlayhead(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDraggingPlayhead) scrubPlayhead(e);
    });

    document.addEventListener('mouseup', () => {
        isDraggingPlayhead = false;
    });

    // ----------------------------------------------------
    // TIMELINE RULER TICKS GENERATION
    // ----------------------------------------------------
    const updateTimelineRuler = (dur) => {
        const ticksContainer = document.getElementById('timeline-ruler-ticks');
        if (!ticksContainer) return;
        ticksContainer.innerHTML = '';

        const ticksCount = 8;
        const interval = dur / ticksCount;

        for (let i = 0; i <= ticksCount; i++) {
            const tick = document.createElement('div');
            tick.className = 'tick-mark';
            const val = i * interval;
            tick.setAttribute('data-time', `${Math.floor(val)}s`);
            ticksContainer.appendChild(tick);
        }
    };

    // ----------------------------------------------------
    // SHADER & TUNER SETTINGS
    // ----------------------------------------------------
    const filterCards = document.querySelectorAll('.filter-card');
    
    // Sliders
    const sliderBrightness = document.getElementById('slider-brightness');
    const sliderContrast = document.getElementById('slider-contrast');
    const sliderSaturation = document.getElementById('slider-saturation');
    const sliderBlur = document.getElementById('slider-blur');

    const valBrightness = document.getElementById('val-brightness');
    const valContrast = document.getElementById('val-contrast');
    const valSaturation = document.getElementById('val-saturation');
    const valBlur = document.getElementById('val-blur');

    const applyViewFilters = () => {
        let cssString = '';

        if (activeFilter === 'grayscale') cssString += 'grayscale(100%) ';
        if (activeFilter === 'vintage') cssString += 'sepia(80%) hue-rotate(-20deg) ';
        
        cssString += `brightness(${sliderBrightness.value}%) `;
        cssString += `contrast(${sliderContrast.value}%) `;
        cssString += `saturate(${sliderSaturation.value}%) `;
        cssString += `blur(${sliderBlur.value}px)`;

        canvas.style.filter = cssString;
    };

    filterCards.forEach(card => {
        card.addEventListener('click', () => {
            filterCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            activeFilter = card.getAttribute('data-filter');
            applyViewFilters();
        });
    });

    const onTunerChange = () => {
        valBrightness.textContent = `${sliderBrightness.value}%`;
        valContrast.textContent = `${sliderContrast.value}%`;
        valSaturation.textContent = `${sliderSaturation.value}%`;
        valBlur.textContent = `${sliderBlur.value}px`;
        applyViewFilters();
    };

    sliderBrightness.addEventListener('input', onTunerChange);
    sliderContrast.addEventListener('input', onTunerChange);
    sliderSaturation.addEventListener('input', onTunerChange);
    sliderBlur.addEventListener('input', onTunerChange);

    // ----------------------------------------------------
    // 3D TRANSFORM TRIGGERS
    // ----------------------------------------------------
    const sliderRotX = document.getElementById('slider-rot-x');
    const sliderRotY = document.getElementById('slider-rot-y');
    const sliderRotZ = document.getElementById('slider-rot-z');

    const valRotX = document.getElementById('val-rot-x');
    const valRotY = document.getElementById('val-rot-y');
    const valRotZ = document.getElementById('val-rot-z');

    const btnResetTransforms = document.getElementById('btn-reset-transforms');

    const applyTransforms = () => {
        const x = sliderRotX.value;
        const y = sliderRotY.value;
        const z = sliderRotZ.value;

        valRotX.textContent = `${x} deg`;
        valRotY.textContent = `${y} deg`;
        valRotZ.textContent = `${z} deg`;

        perspectiveContainer.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
    };

    sliderRotX.addEventListener('input', applyTransforms);
    sliderRotY.addEventListener('input', applyTransforms);
    sliderRotZ.addEventListener('input', applyTransforms);

    if (btnResetTransforms) {
        btnResetTransforms.addEventListener('click', () => {
            sliderRotX.value = 0;
            sliderRotY.value = 0;
            sliderRotZ.value = 0;
            applyTransforms();
        });
    }

    // ----------------------------------------------------
    // DRAGGABLE STICKERS & TEXT OVERLAY DRAGS
    // ----------------------------------------------------
    const makeElementDraggable = (el) => {
        let isDragging = false;
        let startX, startY;
        let left = 0, top = 0;

        el.addEventListener('mousedown', (e) => {
            isDragging = true;
            el.classList.add('active-drag');
            startX = e.clientX - left;
            startY = e.clientY - top;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            left = e.clientX - startX;
            top = e.clientY - startY;
            el.style.transform = `translate(${left}px, ${top}px)`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                el.classList.remove('active-drag');
            }
        });

        // Touch support
        el.addEventListener('touchstart', (e) => {
            isDragging = true;
            el.classList.add('active-drag');
            startX = e.touches[0].clientX - left;
            startY = e.touches[0].clientY - top;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            left = e.touches[0].clientX - startX;
            top = e.touches[0].clientY - startY;
            el.style.transform = `translate(${left}px, ${top}px)`;
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
            el.classList.remove('active-drag');
        });
    };

    // Stickers selector
    const stickersList = document.querySelectorAll('.sticker-selector-item');
    const stickerOverlay = document.getElementById('canvas-sticker-overlay');
    const timelineStickersContainer = document.getElementById('timeline-stickers-container');
    const btnClearStickers = document.getElementById('btn-clear-stickers');

    stickersList.forEach(item => {
        item.addEventListener('click', () => {
            // Clear existing
            stickerOverlay.innerHTML = '';
            
            // Clone child elements (SVG or Icon)
            const node = item.firstElementChild.cloneNode(true);
            stickerOverlay.appendChild(node);
            stickerOverlay.classList.remove('hidden');
            makeElementDraggable(stickerOverlay);

            // Add sticker timeline track block clip
            timelineStickersContainer.innerHTML = `
                <div class="track-clip sticker-clip" style="width: 50%; left: 10%;">
                    <span class="clip-title">Sticker overlay</span>
                </div>
            `;
        });
    });

    btnClearStickers.addEventListener('click', () => {
        stickerOverlay.innerHTML = '';
        stickerOverlay.classList.add('hidden');
        timelineStickersContainer.innerHTML = '';
    });

    // Text apply
    const btnApplyText = document.getElementById('btn-apply-text');
    const textOverlay = document.getElementById('canvas-text-overlay');
    const timelineTextContainer = document.getElementById('timeline-text-container');
    const inputText = document.getElementById('input-overlay-text');
    const selectFont = document.getElementById('select-font');
    const textColorInput = document.getElementById('input-text-color');
    const sliderFontSize = document.getElementById('slider-font-size');
    const valFontSize = document.getElementById('val-font-size');

    if (btnApplyText) {
        btnApplyText.addEventListener('click', () => {
            const val = inputText.value || "TEXT OVERLAY";
            const color = textColorInput.value;
            const font = document.getElementById('select-text-font').value;
            const size = sliderFontSize.value;

            const textSpan = textOverlay.querySelector('span');
            textSpan.textContent = val;
            textSpan.style.color = color;
            textSpan.style.fontFamily = font;
            textSpan.style.fontSize = `${size}px`;

            textOverlay.classList.remove('hidden');
            makeElementDraggable(textOverlay);

            // Add text track block clip
            timelineTextContainer.innerHTML = `
                <div class="track-clip text-clip" style="width: 60%; left: 5%;">
                    <span class="clip-title">${val}</span>
                </div>
            `;
        });
    }

    if (sliderFontSize) {
        sliderFontSize.addEventListener('input', () => {
            valFontSize.textContent = `${sliderFontSize.value}px`;
        });
    }

    // ----------------------------------------------------
    // UPI QR CHECKOUT SYSTEM
    // ----------------------------------------------------
    const generateUpgradeQr = () => {
        const upiId = "arasu9629hf@okhdfcbank";
        const payeeName = "Victor Ezhil";
        const amount = "7000";
        const currency = "INR";
        const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=${currency}`;
        
        const qrImage = document.getElementById('checkout-upi-qr');
        if (qrImage) {
            qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiLink)}&color=000000&bgcolor=FFFFFF&margin=10`;
        }
    };
    
    generateUpgradeQr();

    const copyBtn = document.getElementById('btn-copy-checkout-upi');
    const copyToast = document.getElementById('copy-toast');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const val = copyBtn.getAttribute('data-clipboard');
            navigator.clipboard.writeText(val).then(() => {
                if (copyToast) {
                    copyToast.classList.add('show');
                    setTimeout(() => copyToast.classList.remove('show'), 2000);
                }
            });
        });
    }

    // ----------------------------------------------------
    // EXPORT AND HARDWARE-FPS MEDIARECORDER EXPORTER
    // ----------------------------------------------------
    const modalExport = document.getElementById('modal-export');
    const btnOpenExport = document.getElementById('btn-open-export');
    const btnCloseExport = document.getElementById('btn-close-export');

    const selectFps = document.getElementById('export-select-fps');
    const selectRes = document.getElementById('export-select-res');
    
    const settingsBody = document.getElementById('export-settings-body');
    const renderingBody = document.getElementById('export-rendering-body');
    const completeBody = document.getElementById('export-complete-body');

    const btnStartRendering = document.getElementById('btn-start-rendering');
    const renderProgressFill = document.getElementById('render-progress-fill');
    const lblRenderStatus = document.getElementById('lbl-render-status');
    const lblFramesProcessed = document.getElementById('lbl-frames-processed');
    const lblRenderFps = document.getElementById('lbl-render-fps');
    const btnDownloadResult = document.getElementById('btn-download-result');

    if (btnOpenExport) {
        btnOpenExport.addEventListener('click', () => {
            settingsBody.classList.remove('hidden');
            renderingBody.classList.add('hidden');
            completeBody.classList.add('hidden');
            modalExport.classList.add('show');
        });
    }

    if (btnCloseExport) {
        btnCloseExport.addEventListener('click', () => {
            modalExport.classList.remove('show');
        });
    }

    if (btnStartRendering) {
        btnStartRendering.addEventListener('click', () => {
            const fpsVal = selectFps.value;
            const resVal = selectRes.value;

            // Switch layout to compiling status
            settingsBody.classList.add('hidden');
            renderingBody.classList.remove('hidden');
            lblRenderFps.textContent = `${fpsVal} FPS`;

            // Pause if playing
            if (isPlaying) togglePlayPause();
            video.currentTime = 0;

            let frames = 0;
            const totalDuration = video.duration || 10;
            const targetFrames = fpsVal * totalDuration;

            // Start Canvas Captures Stream and MediaRecorder WebM pipeline
            let recordedChunks = [];
            const stream = canvas.captureStream(parseInt(fpsVal));
            
            // Setup MediaRecorder
            let mediaRecorder;
            try {
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
            } catch(e) {
                // Fallback for older browsers
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) recordedChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);
                
                // Show completion panel
                renderingBody.classList.add('hidden');
                completeBody.classList.remove('hidden');
                btnDownloadResult.href = videoUrl;
                btnDownloadResult.download = `waynetech-render-${resVal}p-${Date.now()}.webm`;
            };

            mediaRecorder.start();

            // Progress Rendering frame compiler loop
            video.play().catch(err => {});
            
            const timer = setInterval(() => {
                frames += parseInt(fpsVal) / 10; // compile chunks
                const progress = Math.min(100, (video.currentTime / totalDuration) * 100);
                
                renderProgressFill.style.width = `${progress}%`;
                lblFramesProcessed.textContent = Math.round(frames);

                if (progress < 30) {
                    lblRenderStatus.textContent = "Rasterizing CSS filter vectors...";
                } else if (progress < 60) {
                    lblRenderStatus.textContent = "Blending sticker channels...";
                } else if (progress < 90) {
                    lblRenderStatus.textContent = "Compiling audio track tick matrix...";
                } else {
                    lblRenderStatus.textContent = "Baking frame headers...";
                }

                if (video.currentTime >= totalDuration || video.ended) {
                    clearInterval(timer);
                    video.pause();
                    mediaRecorder.stop();
                }
            }, 100);
        });
    }

    // ----------------------------------------------------
    // IN-APP SYSTEM POPUPS (ABOUT, PRIVACY, TERMS)
    // ----------------------------------------------------
    const setupPopupModal = (openBtnId, closeBtnId, modalId) => {
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);
        const modal = document.getElementById(modalId);

        if (!openBtn || !modal) return;

        openBtn.addEventListener('click', () => {
            modal.classList.add('show');
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    };

    setupPopupModal('open-about-modal', 'close-about', 'modal-about');
    setupPopupModal('open-privacy-modal', 'close-privacy', 'modal-privacy');
    setupPopupModal('open-terms-modal', 'close-terms', 'modal-terms');

    // Promo upgrade btn trigger
    const upgradePromo = document.getElementById('btn-upgrade-promo');
    if (upgradePromo) {
        upgradePromo.addEventListener('click', () => {
            // Activate upgrade pane
            const upgradeSelector = document.querySelector('[data-tab="upgrade"]');
            if (upgradeSelector) upgradeSelector.click();
        });
    }

    // Helper functions
    function formatTime(secs) {
        if (isNaN(secs)) return "00:00:00";
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = Math.floor(secs % 60);
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    function pad(n) {
        return n.toString().padStart(2, '0');
    }
});
