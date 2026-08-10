document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // THREE.JS 3D BACKGROUND ENGINE (WayneTech Cyber Globe)
    // ----------------------------------------------------
    let scene, camera, renderer, cyberSphere, starField;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const initThree = () => {
        const canvas = document.getElementById('three-canvas');
        if (!canvas) return;

        // Create Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x020204, 0.002);

        // Setup Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 220;

        // Setup Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // Central Cyber Globe Geometry (WayneTech Energy Core)
        const geometry = new THREE.IcosahedronGeometry(82, 2);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00b4d8,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        cyberSphere = new THREE.Mesh(geometry, material);
        mainGroup.add(cyberSphere);

        // Glowing points on sphere vertices
        const pointGeometry = new THREE.IcosahedronGeometry(82, 2);
        const pointMaterial = new THREE.PointsMaterial({
            color: 0x00f2fe,
            size: 3.5,
            transparent: true,
            opacity: 0.8
        });
        const spherePoints = new THREE.Points(pointGeometry, pointMaterial);
        mainGroup.add(spherePoints);

        // Surrounding Blue Star Particles
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 700;
        const starPositions = new Float32Array(starsCount * 3);
        const starColors = new Float32Array(starsCount * 3);

        const colors = [
            new THREE.Color(0x00b4d8), // Electric Blue
            new THREE.Color(0x0077b6), // Midnight Tech Blue
            new THREE.Color(0x00f2fe)  // Ice Blue
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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(ambientLight);

        // Event Listeners
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);

        animate();
    };

    const animate = () => {
        requestAnimationFrame(animate);

        if (cyberSphere) {
            cyberSphere.rotation.y += 0.0012;
            cyberSphere.rotation.x += 0.0006;
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
        const animatedTargets = document.querySelectorAll('.glass-panel, .passion-card, .gallery-item');
        
        const observerOptions = {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
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
    // UPI QR CODE GENERATOR (Rate Restored to 7000 INR)
    // ----------------------------------------------------
    const generateUpiQr = () => {
        const upiId = "arasu9629hf@okhdfcbank";
        const payeeName = "Victor Ezhil";
        const amount = "7000"; // Restored to ₹7,000
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
    // WAYNETECH SECURE COMMS CHATBOT SYSTEM
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
        order: "Secure connection verified. Video editing, cinematic visual compositing, and thumbnail graphics contracts begin at a minimum retainer fee of <strong>₹7,000</strong>. Transmission address: <a href='mailto:victorroot9629@gmail.com' class='neon-hover'>victorroot9629@gmail.com</a>, or scanning the payment card secures your bookings.",
        template: "The WayneTech 3D Profile configuration codebase requires a deployment license fee of <strong>₹7,000</strong>. Transfer to UPI ID <code>arasu9629hf@okhdfcbank</code> and email payment logs to victorroot9629@gmail.com to download files.",
        project: "B.Sc. Computer Science database models, backend security configurations, and custom script integrations can be commissioned. Send requirements to <a href='mailto:victorroot9629@gmail.com' class='neon-hover'>victorroot9629@gmail.com</a>.",
        hello: "Handshake verified. 🌌 Welcome to WayneTech Secure Terminal. Feel free to browse Victor's <strong>Creative Workshow</strong> designs or open custom queries."
    };

    const triggerBotResponse = (type) => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'dm-msg bot typing-indicator';
        typingDiv.innerHTML = '<p>Encrypting transmission...</p>';
        dmMessagesContainer.appendChild(typingDiv);
        scrollToBottom();

        setTimeout(() => {
            typingDiv.remove();
            const replyText = botReplies[type] || "Secure acknowledgement received. For direct custom briefs or scheduling, secure a ₹7,000 retainer or email victorroot9629@gmail.com.";
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
        } else if (lowercaseQuery.includes('price') || lowercaseQuery.includes('template') || lowercaseQuery.includes('buy') || lowercaseQuery.includes('code') || lowercaseQuery.includes('7000')) {
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
            contactForm.reset();
            triggerNotification("Transmission successful! WayneTech secure terminal has logged your message. Status: Dispatched.");
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
