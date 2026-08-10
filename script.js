document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // THREE.JS 3D BACKGROUND ENGINE (Cyber Grid Sphere)
    // ----------------------------------------------------
    let scene, camera, renderer, cyberSphere, starField;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const initThree = () => {
        const canvas = document.getElementById('three-canvas');
        if (!canvas) return;

        // Create Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030307, 0.002);

        // Setup Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 220;

        // Setup Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // Central Cyber Globe Geometry
        const geometry = new THREE.IcosahedronGeometry(80, 2);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00f2fe,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        cyberSphere = new THREE.Mesh(geometry, material);
        mainGroup.add(cyberSphere);

        // Glowing points on sphere vertices
        const pointGeometry = new THREE.IcosahedronGeometry(80, 2);
        const pointMaterial = new THREE.PointsMaterial({
            color: 0xff007f,
            size: 3.5,
            transparent: true,
            opacity: 0.8
        });
        const spherePoints = new THREE.Points(pointGeometry, pointMaterial);
        mainGroup.add(spherePoints);

        // Surrounding Star Field
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 600;
        const starPositions = new Float32Array(starsCount * 3);
        const starColors = new Float32Array(starsCount * 3);

        const colors = [
            new THREE.Color(0x00f2fe), // Neon Cyan
            new THREE.Color(0x9d4edd), // Neon Purple
            new THREE.Color(0xff007f)  // Cyber Pink
        ];

        for (let i = 0; i < starsCount * 3; i += 3) {
            starPositions[i] = (Math.random() - 0.5) * 800;
            starPositions[i+1] = (Math.random() - 0.5) * 800;
            starPositions[i+2] = (Math.random() - 0.5) * 800;

            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            starColors[i] = randomColor.r;
            starColors[i+1] = randomColor.g;
            starColors[i+2] = randomColor.b;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 2.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        starField = new THREE.Points(starsGeometry, starsMaterial);
        mainGroup.add(starField);

        scene.mainGroup = mainGroup;

        // Ambient Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // Event Listeners
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);

        animate();
    };

    const animate = () => {
        requestAnimationFrame(animate);

        if (cyberSphere) {
            cyberSphere.rotation.y += 0.0015;
            cyberSphere.rotation.x += 0.0008;
        }

        if (scene.mainGroup) {
            currentX += (targetX - currentX) * 0.04;
            currentY += (targetY - currentY) * 0.04;

            scene.mainGroup.rotation.y = currentX * 0.25;
            scene.mainGroup.rotation.x = currentY * 0.25;
        }

        renderer.render(scene, camera);
    };

    const onMouseMove = (e) => {
        targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Initialize 3D Space
    try {
        initThree();
    } catch(err) {
        console.warn("WebGL Three.js initialization failed: ", err);
    }

    // ----------------------------------------------------
    // SUPER SMOOTH SCROLL REVEAL OBSERVER
    // ----------------------------------------------------
    const setupScrollReveal = () => {
        const animatedTargets = document.querySelectorAll('.glass-panel, .passion-card, .gallery-item, .studio-card');
        
        const observerOptions = {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Once animated, stop observing this element
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedTargets.forEach(target => {
            target.classList.add('reveal-element');
            revealObserver.observe(target);
        });
    };

    setupScrollReveal();

    // ----------------------------------------------------
    // SYSTEM ALERTS & ON-LOAD NOTIFICATIONS
    // ----------------------------------------------------
    const triggerNotification = (text) => {
        const liveNotification = document.getElementById('live-notification');
        if (!liveNotification) return;

        // If custom text passed, replace paragraph content
        if (text) {
            const p = liveNotification.querySelector('p');
            if (p) p.textContent = text;
        }

        liveNotification.classList.add('show');

        // Dismiss automatically after 6 seconds
        setTimeout(() => {
            liveNotification.classList.remove('show');
        }, 6000);
    };

    // Trigger greeting notification on window load
    setTimeout(() => {
        triggerNotification();
    }, 1500);

    // ----------------------------------------------------
    // CYBERPUNK IMAGE STUDIO (WEBCAM & FILE FILTERING)
    // ----------------------------------------------------
    const tabWebcam = document.getElementById('tab-webcam');
    const tabUpload = document.getElementById('tab-upload');
    const webcamView = document.getElementById('webcam-view');
    const uploadView = document.getElementById('upload-view');
    const video = document.getElementById('webcam-feed');
    const fileInput = document.getElementById('file-input');
    const dropzone = document.getElementById('dropzone');
    
    const filterCanvas = document.getElementById('filter-canvas');
    const canvasPlaceholder = document.getElementById('canvas-placeholder');
    const captureBtn = document.getElementById('capture-photo-btn');
    const resetBtn = document.getElementById('reset-filter-btn');
    const saveBtn = document.getElementById('download-render-btn');

    const sliderAberration = document.getElementById('slider-aberration');
    const sliderGlitch = document.getElementById('slider-glitch');
    const sliderNeon = document.getElementById('slider-neon');

    const valAberration = document.getElementById('val-aberration');
    const valGlitch = document.getElementById('val-glitch');
    const valNeon = document.getElementById('val-neon');

    let stream = null;
    let sourceImage = null;
    let imageWidth = 0;
    let imageHeight = 0;

    const startWebcam = async () => {
        if (stream) return;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
            if (video) video.srcObject = stream;
        } catch (err) {
            console.error("Camera access denied or unavailable: ", err);
        }
    };

    const stopWebcam = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    };

    // Start Webcam initially
    startWebcam();

    if (tabWebcam && tabUpload) {
        tabWebcam.addEventListener('click', () => {
            tabWebcam.classList.add('active');
            tabUpload.classList.remove('active');
            webcamView.classList.remove('hidden');
            uploadView.classList.add('hidden');
            startWebcam();
        });

        tabUpload.addEventListener('click', () => {
            tabUpload.classList.add('active');
            tabWebcam.classList.remove('active');
            uploadView.classList.remove('hidden');
            webcamView.classList.add('hidden');
            stopWebcam();
        });
    }

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleImageFile(file);
        });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--primary-neon)';
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = 'var(--border-glass)';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--border-glass)';
            const file = e.dataTransfer.files[0];
            if (file) handleImageFile(file);
        });
    }

    const handleImageFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                sourceImage = img;
                imageWidth = img.width;
                imageHeight = img.height;
                initCanvas();
                applyCyberFilters();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    if (captureBtn && video) {
        captureBtn.addEventListener('click', () => {
            if (!video.srcObject) return;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCtx.translate(tempCanvas.width, 0);
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
            
            const img = new Image();
            img.onload = () => {
                sourceImage = img;
                imageWidth = img.width;
                imageHeight = img.height;
                initCanvas();
                applyCyberFilters();
            };
            img.src = tempCanvas.toDataURL('image/png');
        });
    }

    const initCanvas = () => {
        if (!filterCanvas) return;
        const maxDim = 800;
        let scale = 1;
        if (imageWidth > maxDim || imageHeight > maxDim) {
            scale = maxDim / Math.max(imageWidth, imageHeight);
        }
        filterCanvas.width = imageWidth * scale;
        filterCanvas.height = imageHeight * scale;
        
        if (canvasPlaceholder) canvasPlaceholder.classList.add('hidden');
        if (resetBtn) resetBtn.removeAttribute('disabled');
        if (saveBtn) {
            saveBtn.style.pointerEvents = 'all';
            saveBtn.style.opacity = '1';
        }
    };

    const applyCyberFilters = () => {
        if (!sourceImage || !filterCanvas) return;
        const ctx = filterCanvas.getContext('2d');
        const w = filterCanvas.width;
        const h = filterCanvas.height;

        ctx.drawImage(sourceImage, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        const splitAmount = parseInt(sliderAberration.value);
        const glitchProb = parseInt(sliderGlitch.value) / 100;
        const neonBlend = parseInt(sliderNeon.value) / 100;

        const outData = ctx.createImageData(w, h);
        const out = outData.data;

        for (let y = 0; y < h; y++) {
            let rowOffset = 0;
            if (glitchProb > 0 && Math.random() < glitchProb * 0.08) {
                rowOffset = Math.floor((Math.random() - 0.5) * w * 0.08);
            }

            for (let x = 0; x < w; x++) {
                const targetIdx = (y * w + x) * 4;

                const rx = Math.min(w - 1, Math.max(0, x + rowOffset - splitAmount));
                const gx = Math.min(w - 1, Math.max(0, x + rowOffset));
                const bx = Math.min(w - 1, Math.max(0, x + rowOffset + splitAmount));

                const rIdx = (y * w + rx) * 4;
                const gIdx = (y * w + gx) * 4;
                const bIdx = (y * w + bx) * 4;

                out[targetIdx] = data[rIdx];
                out[targetIdx + 1] = data[gIdx + 1];
                out[targetIdx + 2] = data[bIdx + 2];
                out[targetIdx + 3] = data[gIdx + 3];
            }
        }

        ctx.putImageData(outData, 0, 0);

        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(0, 242, 254, ${neonBlend * 0.35})`;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = `rgba(255, 0, 127, ${neonBlend * 0.25})`;
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = 'multiply';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < h; i += 4) {
            ctx.moveTo(0, i);
            ctx.lineTo(w, i);
        }
        ctx.stroke();

        ctx.globalCompositeOperation = 'source-over';

        if (saveBtn) {
            saveBtn.href = filterCanvas.toDataURL('image/png');
            saveBtn.download = `victor-cyber-edit-${Date.now()}.png`;
        }
    };

    const onSliderChange = () => {
        if (valAberration) valAberration.textContent = `${sliderAberration.value}px`;
        if (valGlitch) valGlitch.textContent = `${sliderGlitch.value}%`;
        if (valNeon) valNeon.textContent = `${sliderNeon.value}%`;
        applyCyberFilters();
    };

    if (sliderAberration) sliderAberration.addEventListener('input', onSliderChange);
    if (sliderGlitch) sliderGlitch.addEventListener('input', onSliderChange);
    if (sliderNeon) sliderNeon.addEventListener('input', onSliderChange);

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            sliderAberration.value = 15;
            sliderGlitch.value = 20;
            sliderNeon.value = 35;
            onSliderChange();
        });
    }

    // ----------------------------------------------------
    // UPI QR CODE GENERATOR (Rate 299 INR)
    // ----------------------------------------------------
    const generateUpiQr = () => {
        const upiId = "arasu9629hf@okhdfcbank";
        const payeeName = "Victor Ezhil";
        const amount = "299"; // Updated to ₹299
        const currency = "INR";
        
        const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=${currency}`;
        
        const qrImage = document.getElementById('upi-qr');
        if (qrImage) {
            qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}&color=000000&bgcolor=FFFFFF&margin=10`;
        }
    };
    
    generateUpiQr();

    // ----------------------------------------------------
    // COPY TO CLIPBOARD + TOAST
    // ----------------------------------------------------
    const copyButton = document.getElementById('copy-upi-btn');
    const copyToast = document.getElementById('copy-toast');

    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const textToCopy = copyButton.getAttribute('data-clipboard');
            navigator.clipboard.writeText(textToCopy).then(() => {
                if (copyToast) {
                    copyToast.classList.add('show');
                    setTimeout(() => {
                        copyToast.classList.remove('show');
                    }, 2000);
                }
            }).catch(err => {
                console.error('Could not copy UPI ID: ', err);
            });
        });
    }

    // ----------------------------------------------------
    // MOBILE NAV BURGER TOGGLE
    // ----------------------------------------------------
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // ----------------------------------------------------
    // SCROLL ACTIONS (HEADER SCROLL & ACTIVE SECTION HIGHLIGHT)
    // ----------------------------------------------------
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    const handleScroll = () => {
        if (!header) return;
        
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);

    // ----------------------------------------------------
    // GALLERY LIGHTBOX EVENT LISTENERS
    // ----------------------------------------------------
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (lightboxModal && lightboxImg) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const src = item.getAttribute('data-src');
                const title = item.getAttribute('data-title');
                const desc = item.getAttribute('data-desc');

                lightboxImg.src = src;
                lightboxTitle.textContent = title;
                lightboxDesc.textContent = desc;

                lightboxModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        });

        lightboxClose.addEventListener('click', () => {
            lightboxModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        });

        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                lightboxModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // ----------------------------------------------------
    // FLOATING DM AI CHATBOT SYSTEM
    // ----------------------------------------------------
    const dmBubble = document.getElementById('dm-bubble');
    const dmBox = document.getElementById('dm-box');
    const closeDmBtn = document.getElementById('close-dm-btn');
    const dmInput = document.getElementById('dm-input-field');
    const sendDmBtn = document.getElementById('send-dm-btn');
    const dmMessagesContainer = document.getElementById('dm-messages-container');
    const quickReplyButtons = document.querySelectorAll('.quick-reply-btn');
    const notificationDot = document.querySelector('.dm-notification-dot');

    if (dmBubble && dmBox) {
        dmBubble.addEventListener('click', () => {
            dmBox.classList.toggle('show');
            if (notificationDot) {
                notificationDot.style.opacity = '0';
            }
            scrollToBottom();
        });

        if (closeDmBtn) {
            closeDmBtn.addEventListener('click', () => {
                dmBox.classList.remove('show');
            });
        }
    }

    const scrollToBottom = () => {
        if (dmMessagesContainer) {
            dmMessagesContainer.scrollTop = dmMessagesContainer.scrollHeight;
        }
    };

    const addMessage = (sender, text) => {
        if (!dmMessagesContainer) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `dm-msg ${sender}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        dmMessagesContainer.appendChild(msgDiv);
        scrollToBottom();
    };

    const botReplies = {
        order: "Outstanding choice! Video editing and graphic thumbnail designs contract starts at a minimum retainer of <strong>₹299</strong>. Send your design brief to <a href='mailto:victorroot9629@gmail.com' class='neon-hover'>victorroot9629@gmail.com</a>, or complete the UPI payment of ₹299 below to secure your slots immediately.",
        template: "This custom 3D glassmorphic profile codebase is licensed for a fee of <strong>₹299</strong>. Simply scan the UPI QR code on the profile card, execute the transfer to <code>arasu9629hf@okhdfcbank</code>, and email your transaction receipt to victorroot9629@gmail.com to download the full source code ZIP.",
        project: "Let's collaborate! I study B.Sc. Computer Science and love building interactive software, web tools, or gaming configurations. Email me the syllabus or project criteria at <a href='mailto:victorroot9629@gmail.com' class='neon-hover'>victorroot9629@gmail.com</a> to kick things off.",
        hello: "Greetings, traveler! 🌌 Thank you for connecting with Victor's AI. Feel free to browse through the <strong>Creative Workshow</strong> section to check out my edit thumbnails, or drop an inquiry."
    };

    const triggerBotResponse = (type) => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'dm-msg bot typing-indicator';
        typingDiv.innerHTML = '<p>Transmitting data...</p>';
        dmMessagesContainer.appendChild(typingDiv);
        scrollToBottom();

        setTimeout(() => {
            typingDiv.remove();
            const replyText = botReplies[type] || "Acknowledged. For complex questions or direct inquiries, please send a transmission to victorroot9629@gmail.com, or complete the UPI contract payment of ₹299.";
            addMessage('bot', replyText);
        }, 800);
    };

    quickReplyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-reply');
            const userText = btn.textContent;
            addMessage('user', userText);
            triggerBotResponse(type);
        });
    });

    const handleInputSend = () => {
        if (!dmInput) return;
        const query = dmInput.value.trim();
        if (!query) return;

        addMessage('user', query);
        dmInput.value = '';

        let matchedType = 'default';
        const lowercaseQuery = query.toLowerCase();
        if (lowercaseQuery.includes('edit') || lowercaseQuery.includes('hire') || lowercaseQuery.includes('work') || lowercaseQuery.includes('rate')) {
            matchedType = 'order';
        } else if (lowercaseQuery.includes('price') || lowercaseQuery.includes('template') || lowercaseQuery.includes('buy') || lowercaseQuery.includes('code') || lowercaseQuery.includes('299')) {
            matchedType = 'template';
        } else if (lowercaseQuery.includes('bsc') || lowercaseQuery.includes('science') || lowercaseQuery.includes('project') || lowercaseQuery.includes('study')) {
            matchedType = 'project';
        } else if (lowercaseQuery.includes('hi') || lowercaseQuery.includes('hello') || lowercaseQuery.includes('hey')) {
            matchedType = 'hello';
        }

        triggerBotResponse(matchedType);
    };

    if (sendDmBtn && dmInput) {
        sendDmBtn.addEventListener('click', handleInputSend);
        dmInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleInputSend();
            }
        });
    }

    // ----------------------------------------------------
    // CLONE SITE WIZARD MODAL LOGIC
    // ----------------------------------------------------
    const cloneModal = document.getElementById('clone-modal');
    const openCloneBtn = document.getElementById('open-clone-wizard');
    const heroCloneBtn = document.getElementById('hero-clone-btn');
    const closeCloneBtn = document.getElementById('close-clone-wizard');
    const proceedToPayBtn = document.getElementById('modal-pay-btn');

    const openCloneModal = (e) => {
        if (e) e.preventDefault();
        if (cloneModal) {
            cloneModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };

    if (openCloneBtn) openCloneBtn.addEventListener('click', openCloneModal);
    if (heroCloneBtn) heroCloneBtn.addEventListener('click', openCloneModal);

    if (cloneModal && closeCloneBtn) {
        closeCloneBtn.addEventListener('click', () => {
            cloneModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        });

        cloneModal.addEventListener('click', (e) => {
            if (e.target === cloneModal) {
                cloneModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    }

    if (proceedToPayBtn && cloneModal) {
        proceedToPayBtn.addEventListener('click', () => {
            cloneModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            // Smooth scroll to donate section
            const donateSec = document.getElementById('donate');
            if (donateSec) {
                donateSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ----------------------------------------------------
    // CONTACT FORM INTERCEPTOR -> TRIGGER TOAST
    // ----------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Clear inputs
            contactForm.reset();
            // Trigger customized success notification toast
            triggerNotification("Transmission successful! Victor's Core AI has logged your inquiry. Check your email shortly.");
        });
    }

    // ----------------------------------------------------
    // MODAL STATE MANAGEMENT (PRIVACY & TERMS)
    // ----------------------------------------------------
    const setupModal = (openBtnId, closeBtnId, modalId) => {
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);
        const modal = document.getElementById(modalId);

        if (!openBtn || !modal) return;

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    };

    setupModal('open-privacy', 'close-privacy', 'privacy-modal');
    setupModal('open-terms', 'close-terms', 'terms-modal');
});
