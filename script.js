document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // GLOBAL STATE & CORE DOM ELEMENTS
    // ----------------------------------------------------
    let isPlaying = false;
    let activeFilter = 'none';
    let duration = 10; // Default timeline duration in seconds
    let targetFps = 90;
    
    // Procedural video loop parameters
    let isProcedural = true;
    let proceduralFrame = 0;
    let activeTemplate = null;

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
    // INTERACTIVE TIMELINE CLIP DRAGGING & TRIMMING
    // ----------------------------------------------------
    const makeClipInteractive = (clipEl) => {
        if (!clipEl) return;
        
        let isDragging = false;
        let isTrimmingLeft = false;
        let isTrimmingRight = false;
        let startX, startLeft, startWidth;

        const leftHandle = clipEl.querySelector('.left-handle');
        const rightHandle = clipEl.querySelector('.right-handle');

        const onPointerDown = (e, type) => {
            isDragging = type === 'drag';
            isTrimmingLeft = type === 'left';
            isTrimmingRight = type === 'right';
            startX = e.clientX;
            startLeft = parseFloat(clipEl.style.left) || 0;
            startWidth = parseFloat(clipEl.style.width) || 70;
            e.stopPropagation();
            e.preventDefault();
        };

        clipEl.addEventListener('mousedown', (e) => onPointerDown(e, 'drag'));
        if (leftHandle) leftHandle.addEventListener('mousedown', (e) => onPointerDown(e, 'left'));
        if (rightHandle) rightHandle.addEventListener('mousedown', (e) => onPointerDown(e, 'right'));

        document.addEventListener('mousemove', (e) => {
            if (!isDragging && !isTrimmingLeft && !isTrimmingRight) return;
            const deltaX = e.clientX - startX;
            const parentWidth = clipEl.parentElement.clientWidth || 1;
            const deltaPct = (deltaX / parentWidth) * 100;

            if (isDragging) {
                let newLeft = startLeft + deltaPct;
                newLeft = Math.max(0, Math.min(100 - startWidth, newLeft));
                clipEl.style.left = `${newLeft}%`;
            } else if (isTrimmingLeft) {
                let newLeft = startLeft + deltaPct;
                let newWidth = startWidth - deltaPct;
                if (newLeft >= 0 && newWidth >= 10) {
                    clipEl.style.left = `${newLeft}%`;
                    clipEl.style.width = `${newWidth}%`;
                }
            } else if (isTrimmingRight) {
                let newWidth = startWidth + deltaPct;
                newWidth = Math.max(10, Math.min(100 - startLeft, newWidth));
                clipEl.style.width = `${newWidth}%`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = isTrimmingLeft = isTrimmingRight = false;
        });
    };

    // Apply interactive listeners to default clips
    document.querySelectorAll('.track-clip').forEach(clip => makeClipInteractive(clip));

    // ----------------------------------------------------
    // TIMELINE SPLIT BUTTON
    // ----------------------------------------------------
    if (btnSplit) {
        btnSplit.addEventListener('click', () => {
            // Split active video clip at playhead position
            const playheadLeft = parseFloat(playhead.style.left) - 120; // remove track offset
            const timelineWidth = document.getElementById('timeline-ruler-ticks').clientWidth || 1;
            const playheadPct = (playheadLeft / timelineWidth) * 100;

            const activeClips = document.querySelectorAll('.track-clip');
            activeClips.forEach(clip => {
                const clipLeft = parseFloat(clip.style.left) || 0;
                const clipWidth = parseFloat(clip.style.width) || 70;
                const clipRight = clipLeft + clipWidth;

                // Check if playhead intersects clip
                if (playheadPct > clipLeft && playheadPct < clipRight) {
                    const firstPartWidth = playheadPct - clipLeft;
                    const secondPartWidth = clipRight - playheadPct;

                    // Resize first part
                    clip.style.width = `${firstPartWidth}%`;

                    // Create second part block
                    const secondClip = clip.cloneNode(true);
                    secondClip.style.left = `${playheadPct}%`;
                    secondClip.style.width = `${secondPartWidth}%`;
                    secondClip.removeAttribute('id');
                    
                    // Append and bind interactive events
                    clip.parentElement.appendChild(secondClip);
                    makeClipInteractive(secondClip);
                }
            });
        });
    }

    // ----------------------------------------------------
    // DRAGGABLE STICKERS & TEXT OVERLAY DRAGS
    // ----------------------------------------------------
    const makeElementDraggable = (el) => {
        let isDragging = false;
        let startX, startY;
        let currentX = 0, currentY = 0;

        // Parse existing transform translates
        const style = window.getComputedStyle(el);
        const matrix = new DOMMatrix(style.transform);
        currentX = matrix.m41;
        currentY = matrix.m42;

        el.addEventListener('mousedown', (e) => {
            isDragging = true;
            el.classList.add('active-drag');
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
            e.stopPropagation();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
            
            // Constrain within viewport bounds
            const parent = el.parentElement;
            const maxW = parent.clientWidth / 2 - el.clientWidth / 2;
            const maxH = parent.clientHeight / 2 - el.clientHeight / 2;
            currentX = Math.max(-maxW - 80, Math.min(maxW + 80, currentX));
            currentY = Math.max(-maxH - 40, Math.min(maxH + 40, currentY));

            el.style.transform = `translate(${currentX}px, ${currentY}px)`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                el.classList.remove('active-drag');
            }
        });

        // Touch Support
        el.addEventListener('touchstart', (e) => {
            isDragging = true;
            el.classList.add('active-drag');
            startX = e.touches[0].clientX - currentX;
            startY = e.touches[0].clientY - currentY;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX - startX;
            currentY = e.touches[0].clientY - startY;
            el.style.transform = `translate(${currentX}px, ${currentY}px)`;
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
            el.classList.remove('active-drag');
        });
    };

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
            isProcedural = false;
            video.src = fileUrl;
            video.load();
            video.onloadedmetadata = () => {
                duration = video.duration;
                updateTimelineRuler(duration);
                lblTimeTotal.textContent = formatTime(duration);
                if (videoClipBlock) {
                    videoClipBlock.querySelector('.clip-title').textContent = file.name;
                    videoClipBlock.style.width = '70%'; 
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
                isProcedural = false;
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

    // Header buttons (Import / Reset)
    const btnImportHeader = document.getElementById('btn-import-header');
    const btnResetHeader = document.getElementById('btn-reset-header');

    if (btnImportHeader) {
        btnImportHeader.addEventListener('click', () => mediaFileInput.click());
    }

    if (btnResetHeader) {
        btnResetHeader.addEventListener('click', () => {
            isProcedural = true;
            activeTemplate = null;
            activeFilter = 'none';
            document.getElementById('btn-clear-templates').click();
            document.getElementById('btn-clear-stickers').click();
            textOverlay.innerHTML = '<span>WAYNETECH ACTIVE</span>';
            textOverlay.classList.add('hidden');
            lblTimeTotal.textContent = formatTime(10);
            updateTimelineRuler(10);
            applyViewFilters();
        });
    }

    // ----------------------------------------------------
    // PROCEDURAL VIDEO GENERATOR (Bypasses CORS restrictions)
    // ----------------------------------------------------
    const drawProceduralVideo = (ctx, w, h, frame) => {
        // Core workspace obsidian background
        ctx.fillStyle = '#020308';
        ctx.fillRect(0, 0, w, h);

        // Perspective Horizon Grid (3D Horizon feel)
        ctx.strokeStyle = 'rgba(0, 180, 216, 0.15)';
        ctx.lineWidth = 1;
        const gridY = 240;
        for (let i = -12; i <= 12; i++) {
            ctx.beginPath();
            ctx.moveTo(w / 2 + i * 20, gridY);
            ctx.lineTo(w / 2 + i * 200, h);
            ctx.stroke();
        }
        const horizonLines = 6;
        for (let i = 0; i < horizonLines; i++) {
            const y = gridY + (i / horizonLines) * (h - gridY);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Center Rotating Wireframe Globe Core
        ctx.save();
        ctx.translate(w / 2, h / 2 - 35);
        
        let rotationTime = frame * 0.02;
        ctx.rotate(rotationTime);

        // Render Outer Orbit Rings
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 52, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#00f2fe';
        ctx.beginPath();
        ctx.ellipse(0, 0, 52, 16, rotationTime * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#ff0055';
        ctx.beginPath();
        ctx.ellipse(0, 0, 52, 16, -rotationTime * 1.8, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing core light (bouncing to beat if templates active)
        let pulseScaler = 1.0;
        if (activeTemplate === 'batman' || activeTemplate === 'rhythm') {
            pulseScaler = 1.0 + Math.sin(Date.now() / 150) * 0.08;
        }
        
        const coreSize = (14 + Math.sin(frame * 0.08) * 3) * pulseScaler;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.3, '#00f2fe');
        grad.addColorStop(1, 'rgba(0, 180, 216, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Draw VN Cinematic crop overlay if VN template active
        if (activeTemplate === 'cinematic') {
            ctx.fillStyle = '#000000';
            // Top bar
            ctx.fillRect(0, 0, w, 40);
            // Bottom bar
            ctx.fillRect(0, h - 40, w, 40);
        }

        // Live telemetry logs overlays
        ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.font = "8px monospace";
        ctx.textAlign = 'left';
        ctx.fillText(`SYS-CORE-FPS: ${targetFps}`, 15, 20);
        ctx.fillText(`FRAME-INDEX: ${Math.round(frame)}`, 15, 32);
        ctx.fillText(`TELEMETRY-TICK: ${Date.now()}`, 15, 44);
    };

    // ----------------------------------------------------
    // MAIN CANVAS RENDER & PLAYBACK LOOP
    // ----------------------------------------------------
    let lastTime = 0;
    let frameCount = 0;

    const renderLoop = (time) => {
        // Calculate Frame rate counters
        frameCount++;
        if (time - lastTime >= 1000) {
            lblFpsDisplay.textContent = Math.round((frameCount * 1000) / (time - lastTime));
            frameCount = 0;
            lastTime = time;
        }

        // Canvas Drawings
        if (isProcedural) {
            proceduralFrame += isPlaying ? 1 : 0;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw procedural core first
            drawProceduralVideo(ctx, canvas.width, canvas.height, proceduralFrame);

            // Apply Chromatic split composite shader
            if (activeFilter === 'chroma') {
                // Save original canvas image
                const rawImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Red Shift channel
                ctx.putImageData(rawImg, -4, 0);
                
                // Cyan Shift channel
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = '#00f2fe';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.putImageData(rawImg, 4, 0);
                
                ctx.globalCompositeOperation = 'source-over';
            }

            // Apply Cyber Glitch cuts
            if (activeFilter === 'glitch' && Math.random() < 0.12) {
                const sliceY = Math.random() * canvas.height;
                const sliceH = Math.random() * 35 + 10;
                const shiftX = (Math.random() - 0.5) * 30;
                
                ctx.drawImage(canvas, 0, sliceY, canvas.width, sliceH, shiftX, sliceY, canvas.width, sliceH);
            }

            // Apply Neon Blue screen tint
            if (activeFilter === 'neon') {
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = 'rgba(0, 180, 216, 0.22)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'source-over';
            }

        } else {
            // Render user loaded video frames
            if (video.readyState >= video.HAVE_CURRENT_DATA) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                if (activeFilter === 'chroma') {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video, -4, 0, canvas.width, canvas.height);
                    ctx.globalCompositeOperation = 'screen';
                    ctx.drawImage(video, 4, 0, canvas.width, canvas.height);
                    ctx.globalCompositeOperation = 'source-over';
                }

                if (activeFilter === 'glitch' && Math.random() < 0.15) {
                    const sliceY = Math.random() * canvas.height;
                    const sliceH = Math.random() * 40 + 15;
                    const shiftX = (Math.random() - 0.5) * 35;
                    ctx.drawImage(video, 0, sliceY, canvas.width, sliceH, shiftX, sliceY, canvas.width, sliceH);
                }

                if (activeFilter === 'neon') {
                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = 'rgba(0, 180, 216, 0.22)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.globalCompositeOperation = 'source-over';
                }
            }
        }

        // Apply dynamic scale pulses for rhythmic template effects
        if (isPlaying && (activeTemplate === 'batman' || activeTemplate === 'rhythm')) {
            const beatZoom = 1.0 + Math.sin(Date.now() / 150) * 0.05;
            perspectiveContainer.style.transform = `scale(${beatZoom})`;
        } else if (!isPlaying) {
            perspectiveContainer.style.transform = '';
        }

        // Sync timeline playhead and playback duration timers
        if (isPlaying) {
            let currentSec = 0;
            if (isProcedural) {
                currentSec = (proceduralFrame / targetFps) % duration;
                if (currentSec >= duration - 0.1) {
                    proceduralFrame = 0;
                }
            } else {
                currentSec = video.currentTime;
            }

            const progress = currentSec / duration;
            const timelineWidth = document.getElementById('timeline-ruler-ticks').clientWidth || 1;
            playhead.style.left = `${progress * timelineWidth + 120}px`;
            lblTimeCurrent.textContent = formatTime(currentSec);
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
            if (!isProcedural) {
                video.play().catch(err => console.log("Play interrupted: ", err));
            }
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
        
        const targetTime = percentage * duration;
        lblTimeCurrent.textContent = formatTime(targetTime);

        if (isProcedural) {
            proceduralFrame = targetTime * targetFps;
        } else {
            video.currentTime = targetTime;
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
    // SMART TEMPLATES MANAGER LOGIC
    // ----------------------------------------------------
    const templateCards = document.querySelectorAll('.template-card-item');
    const stickerOverlay = document.getElementById('canvas-sticker-overlay');
    const textOverlay = document.getElementById('canvas-text-overlay');
    const timelineStickersContainer = document.getElementById('timeline-stickers-container');
    const timelineTextContainer = document.getElementById('timeline-text-container');
    const btnClearTemplates = document.getElementById('btn-clear-templates');
    const timelineVideoContainer = document.getElementById('timeline-video-container');
    const timelineAudioContainer = document.getElementById('timeline-audio-container');

    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            templateCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const template = card.getAttribute('data-template');
            activeTemplate = template;

            // Clear current overlays
            stickerOverlay.innerHTML = '';
            stickerOverlay.classList.add('hidden');
            textOverlay.classList.add('hidden');

            // Apply specific template matrices
            if (template === 'batman') {
                // Glitch Shader
                activeFilter = 'glitch';
                filterCards.forEach(c => {
                    c.classList.remove('active');
                    if (c.getAttribute('data-filter') === 'glitch') c.classList.add('active');
                });
                
                // Bat Sticker
                stickerOverlay.innerHTML = `
                    <svg viewBox="0 0 100 45" fill="#00b4d8" style="width: 70px;">
                        <path d="M50 8c1-3 1.5-6 1.5-6h-3s.5 3 1.5 6c1.8 3.5 4.5 5.5 7.5 6.5C59 13.5 57 11 57 9.5c0-2.5 3.5-3 5-3.5 3-.5 6 .5 8 2.5 1.5 1.5 1.5 3.5.5 5.5C67.5 17 62 19 59.5 21.5c-2.5 2.5-4 5.5-4 9.5 0 2 .5 4.5 1.5 6.5 1 2 2.5 4 4.5 5 2.5 1.5 5 1.5 7 0 2-1 4-3 5.5-5 1.5-2 3.5-5 5.5-8 3.5-5 7-10.5 10-16.5C92.5 7 94 4 96 3h4s-1.5 5.5-3.5 11.5C94.5 20 91.5 26.5 88 32.5c-3.5 6-7.5 11.5-12 16.5-5 5.5-10.5 9-16.5 10.5-6.5 1.5-13.5.5-20-3C33 53 26 47.5 20.5 41c-5-6-9-12.5-12-19.5C5.5 15.5 3 9.5 1.5 3h4c2 1 3.5 4 6.5 10C15 19 18.5 24.5 22 29.5c2 3 4 6 5.5 8 1.5 2 3.5 4 5.5 5 2 1.5 4.5 1.5 7 0 2-1 3.5-3 4.5-5 1-2 1.5-4.5 1.5-6.5 0-4-1.5-7-4-9.5C39.5 19 34 17 31 14.5c-1-2-1-4 .5-5.5 2-2 5-3 8-2.5 1.5.5 5 1 5 3.5 0 1.5-2 4-3.5 5.5 3-1 5.7-3 7.5-6.5z" />
                    </svg>
                `;
                stickerOverlay.classList.remove('hidden');
                makeElementDraggable(stickerOverlay);

                // Text
                const textSpan = textOverlay.querySelector('span');
                textSpan.textContent = "WAYNETECH ACTIVE";
                textSpan.style.color = "#00b4d8";
                textSpan.style.fontFamily = "Orbitron";
                textSpan.style.fontSize = "26px";
                textOverlay.classList.remove('hidden');
                makeElementDraggable(textOverlay);

                // Timeline Rebuilds
                timelineVideoContainer.innerHTML = `
                    <div class="track-clip active-clip" style="width: 80%; left: 0%;">
                        <span class="clip-title">batman_glitch_template.mp4</span>
                        <div class="clip-trim-handle left-handle"></div>
                        <div class="clip-trim-handle right-handle"></div>
                    </div>
                `;
                timelineAudioContainer.innerHTML = `
                    <div class="track-clip audio-clip" style="width: 80%; left: 0%;">
                        <span class="clip-title">bass_drums_loop.mp3</span>
                        <div class="clip-trim-handle left-handle"></div>
                        <div class="clip-trim-handle right-handle"></div>
                    </div>
                `;
                timelineStickersContainer.innerHTML = `
                    <div class="track-clip sticker-clip" style="width: 40%; left: 10%;">
                        <span class="clip-title">Bat SVG Sticker</span>
                    </div>
                `;
                timelineTextContainer.innerHTML = `
                    <div class="track-clip text-clip" style="width: 60%; left: 0%;">
                        <span class="clip-title">WAYNETECH ACTIVE</span>
                    </div>
                `;

            } else if (template === 'neon') {
                activeFilter = 'neon';
                filterCards.forEach(c => {
                    c.classList.remove('active');
                    if (c.getAttribute('data-filter') === 'neon') c.classList.add('active');
                });

                // Bolt Sticker
                stickerOverlay.innerHTML = `<i class="fa-solid fa-bolt" style="color:#ffd700; font-size: 3.5rem;"></i>`;
                stickerOverlay.classList.remove('hidden');
                makeElementDraggable(stickerOverlay);

                // Text
                const textSpan = textOverlay.querySelector('span');
                textSpan.textContent = "NEON CORE ENABLED";
                textSpan.style.color = "#00f2fe";
                textSpan.style.fontFamily = "Orbitron";
                textSpan.style.fontSize = "24px";
                textOverlay.classList.remove('hidden');
                makeElementDraggable(textOverlay);

                // Timeline
                timelineVideoContainer.innerHTML = `
                    <div class="track-clip active-clip" style="width: 70%; left: 5%;">
                        <span class="clip-title">neon_energy_grid.mp4</span>
                        <div class="clip-trim-handle left-handle"></div>
                        <div class="clip-trim-handle right-handle"></div>
                    </div>
                `;
                timelineAudioContainer.innerHTML = `
                    <div class="track-clip audio-clip" style="width: 70%; left: 5%;">
                        <span class="clip-title">synthesizer_rhythm.mp3</span>
                        <div class="clip-trim-handle left-handle"></div>
                        <div class="clip-trim-handle right-handle"></div>
                    </div>
                `;
                timelineStickersContainer.innerHTML = `
                    <div class="track-clip sticker-clip" style="width: 30%; left: 20%;">
                        <span class="clip-title">Energy Bolt Icon</span>
                    </div>
                `;
                timelineTextContainer.innerHTML = `
                    <div class="track-clip text-clip" style="width: 50%; left: 10%;">
                        <span class="clip-title">NEON CORE ENABLED</span>
                    </div>
                `;

            } else if (template === 'cinematic') {
                activeFilter = 'vintage';
                filterCards.forEach(c => {
                    c.classList.remove('active');
                    if (c.getAttribute('data-filter') === 'vintage') c.classList.add('active');
                });

                // Scope Sticker
                stickerOverlay.innerHTML = `<i class="fa-solid fa-location-crosshairs" style="color:#ff0055; font-size: 4rem;"></i>`;
                stickerOverlay.classList.remove('hidden');
                makeElementDraggable(stickerOverlay);

                // Text
                const textSpan = textOverlay.querySelector('span');
                textSpan.textContent = "4K MOVIE LETTERBOX";
                textSpan.style.color = "#ffd700";
                textSpan.style.fontFamily = "Space Grotesk";
                textSpan.style.fontSize = "22px";
                textOverlay.classList.remove('hidden');
                makeElementDraggable(textOverlay);

                // Timeline
                timelineVideoContainer.innerHTML = `
                    <div class="track-clip active-clip" style="width: 90%; left: 0%;">
                        <span class="clip-title">widescreen_vintage.mp4</span>
                        <div class="clip-trim-handle left-handle"></div>
                        <div class="clip-trim-handle right-handle"></div>
                    </div>
                `;
                timelineAudioContainer.innerHTML = `
                    <div class="track-clip audio-clip" style="width: 90%; left: 0%;">
                        <span class="clip-title">slow_cinematic_waves.mp3</span>
                        <div class="clip-trim-handle left-handle"></div>
                        <div class="clip-trim-handle right-handle"></div>
                    </div>
                `;
                timelineStickersContainer.innerHTML = `
                    <div class="track-clip sticker-clip" style="width: 35%; left: 5%;">
                        <span class="clip-title">Target Scope Icon</span>
                    </div>
                `;
                timelineTextContainer.innerHTML = `
                    <div class="track-clip text-clip" style="width: 80%; left: 0%;">
                        <span class="clip-title">4K MOVIE LETTERBOX</span>
                    </div>
                `;

            } else if (template === 'rhythm') {
                activeFilter = 'chroma';
                filterCards.forEach(c => {
                    c.classList.remove('active');
                    if (c.getAttribute('data-filter') === 'chroma') c.classList.add('active');
                });

                // Target blip Sticker
                stickerOverlay.innerHTML = `<i class="fa-solid fa-crosshairs" style="color:#00f2fe; font-size: 3.5rem;"></i>`;
                stickerOverlay.classList.remove('hidden');
                makeElementDraggable(stickerOverlay);

                // Text
                const textSpan = textOverlay.querySelector('span');
                textSpan.textContent = "144 FPS SYNC MATRIX";
                textSpan.style.color = "#ff0055";
                textSpan.style.fontFamily = "Orbitron";
                textSpan.style.fontSize = "24px";
                textOverlay.classList.remove('hidden');
                makeElementDraggable(textOverlay);

                // Timeline
                timelineVideoContainer.innerHTML = `
                    <div class="track-clip active-clip" style="width: 80%; left: 10%;">
                        <span class="clip-title">high_fps_particle_flow.mp4</span>
                        <div class="clip-trim-handle left-handle"></div>
                        <div class="clip-trim-handle right-handle"></div>
                    </div>
                `;
                timelineAudioContainer.innerHTML = `
                    <div class="track-clip audio-clip" style="width: 80%; left: 10%;">
                        <span class="clip-title">rhythm_high_bass.mp3</span>
                        <div class="clip-trim-handle left-handle"></div>
                        <div class="clip-trim-handle right-handle"></div>
                    </div>
                `;
                timelineStickersContainer.innerHTML = `
                    <div class="track-clip sticker-clip" style="width: 50%; left: 20%;">
                        <span class="clip-title">Crosshair Icon</span>
                    </div>
                `;
                timelineTextContainer.innerHTML = `
                    <div class="track-clip text-clip" style="width: 70%; left: 15%;">
                        <span class="clip-title">144 FPS SYNC MATRIX</span>
                    </div>
                `;
            }

            // Bind events to newly spawned clips
            document.querySelectorAll('.track-clip').forEach(clip => makeClipInteractive(clip));
            applyViewFilters();
        });
    });

    btnClearTemplates.addEventListener('click', () => {
        templateCards.forEach(c => c.classList.remove('active'));
        activeTemplate = null;
        activeFilter = 'none';
        
        // Reset filter tab active state
        filterCards.forEach(c => {
            c.classList.remove('active');
            if (c.getAttribute('data-filter') === 'none') c.classList.add('active');
        });

        // Reset overlays
        stickerOverlay.innerHTML = '';
        stickerOverlay.classList.add('hidden');
        textOverlay.classList.add('hidden');
        
        timelineStickersContainer.innerHTML = '';
        timelineTextContainer.innerHTML = '';

        // Reset default timeline
        timelineVideoContainer.innerHTML = `
            <div class="track-clip active-clip" id="video-clip-block" style="width: 70%; left: 5%;">
                <span class="clip-title">Sample_Video.mp4</span>
                <div class="clip-trim-handle left-handle"></div>
                <div class="clip-trim-handle right-handle"></div>
            </div>
        `;
        timelineAudioContainer.innerHTML = `
            <div class="track-clip audio-clip" id="audio-clip-block" style="width: 70%; left: 5%;">
                <span class="clip-title">Ambient_Music.mp3</span>
                <div class="clip-trim-handle left-handle"></div>
                <div class="clip-trim-handle right-handle"></div>
            </div>
        `;

        // Re-bind interactive clips
        document.querySelectorAll('.track-clip').forEach(clip => makeClipInteractive(clip));
        applyViewFilters();
    });

    // ----------------------------------------------------
    // STICKER CLEAR & DRAG SELECTIONS
    // ----------------------------------------------------
    const stickersList = document.querySelectorAll('.sticker-selector-item');
    const btnClearStickers = document.getElementById('btn-clear-stickers');

    stickersList.forEach(item => {
        item.addEventListener('click', () => {
            stickerOverlay.innerHTML = '';
            
            const node = item.firstElementChild.cloneNode(true);
            stickerOverlay.appendChild(node);
            stickerOverlay.classList.remove('hidden');
            makeElementDraggable(stickerOverlay);

            timelineStickersContainer.innerHTML = `
                <div class="track-clip sticker-clip" style="width: 50%; left: 10%;">
                    <span class="clip-title">Sticker overlay</span>
                </div>
            `;
            makeClipInteractive(timelineStickersContainer.firstElementChild);
        });
    });

    btnClearStickers.addEventListener('click', () => {
        stickerOverlay.innerHTML = '';
        stickerOverlay.classList.add('hidden');
        timelineStickersContainer.innerHTML = '';
    });

    // ----------------------------------------------------
    // TEXT APPLY OVERLAY
    // ----------------------------------------------------
    const btnApplyText = document.getElementById('btn-apply-text');
    const inputText = document.getElementById('input-overlay-text');
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

            timelineTextContainer.innerHTML = `
                <div class="track-clip text-clip" style="width: 60%; left: 5%;">
                    <span class="clip-title">${val}</span>
                </div>
            `;
            makeClipInteractive(timelineTextContainer.firstElementChild);
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

            // Switch to encoding progress panel
            settingsBody.classList.add('hidden');
            renderingBody.classList.remove('hidden');
            lblRenderFps.textContent = `${fpsVal} FPS`;

            if (isPlaying) togglePlayPause();

            // Set playhead back to start
            if (isProcedural) {
                proceduralFrame = 0;
            } else {
                video.currentTime = 0;
            }

            let frames = 0;
            const totalDuration = duration;
            const targetFrames = fpsVal * totalDuration;

            // Setup MediaRecorder Canvas capture stream
            let recordedChunks = [];
            const stream = canvas.captureStream(parseInt(fpsVal));
            
            let mediaRecorder;
            try {
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
            } catch(e) {
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) recordedChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);
                
                renderingBody.classList.add('hidden');
                completeBody.classList.remove('hidden');
                btnDownloadResult.href = videoUrl;
                btnDownloadResult.download = `waynetech-render-${resVal}p-${Date.now()}.webm`;
            };

            mediaRecorder.start();

            // Loop playback during recording
            if (!isProcedural) {
                video.play().catch(err => {});
            }
            isPlaying = true;

            const timer = setInterval(() => {
                frames += parseInt(fpsVal) / 10;
                
                let currentSec = 0;
                if (isProcedural) {
                    currentSec = proceduralFrame / targetFps;
                } else {
                    currentSec = video.currentTime;
                }

                const progress = Math.min(100, (currentSec / totalDuration) * 100);
                
                renderProgressFill.style.width = `${progress}%`;
                lblFramesProcessed.textContent = Math.round(frames);

                if (progress < 30) {
                    lblRenderStatus.textContent = "Rasterizing CSS filter vectors...";
                } else if (progress < 60) {
                    lblRenderStatus.textContent = "Blending template overlays...";
                } else if (progress < 90) {
                    lblRenderStatus.textContent = "Compiling audio track tick matrix...";
                } else {
                    lblRenderStatus.textContent = "Baking frame headers...";
                }

                if (currentSec >= totalDuration) {
                    clearInterval(timer);
                    if (!isProcedural) video.pause();
                    isPlaying = false;
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
