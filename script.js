document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // THREE.JS 3D BACKGROUND ENGINE
    // ----------------------------------------------------
    let scene, camera, renderer, starField;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const initThree = () => {
        const canvas = document.getElementById('three-canvas');
        if (!canvas) return;

        // Create Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030307, 0.0015);

        // Setup Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 250;

        // Setup Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Generate Particles (Star Field)
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 1200;
        const starPositions = new Float32Array(starsCount * 3);
        const starColors = new Float32Array(starsCount * 3);

        const colors = [
            new THREE.Color(0x00f2fe), // Neon Cyan
            new THREE.Color(0x9d4edd), // Neon Purple
            new THREE.Color(0xff007f), // Cyber Pink
            new THREE.Color(0xffffff)  // Bright White
        ];

        for (let i = 0; i < starsCount * 3; i += 3) {
            // Position coords (wide spread)
            starPositions[i] = (Math.random() - 0.5) * 800;     // X
            starPositions[i+1] = (Math.random() - 0.5) * 800;   // Y
            starPositions[i+2] = (Math.random() - 0.5) * 800;   // Z

            // Randomly assign one of the theme colors
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            starColors[i] = randomColor.r;
            starColors[i+1] = randomColor.g;
            starColors[i+2] = randomColor.b;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        // Create Particle Material (Using canvas circles or simple glowing squares)
        const starsMaterial = new THREE.PointsMaterial({
            size: 2.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true
        });

        // Create Points Object
        starField = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starField);

        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // Event Listeners
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);

        // Start Animation Loop
        animate();
    };

    const animate = () => {
        requestAnimationFrame(animate);

        // Slow automatic rotation
        if (starField) {
            starField.rotation.y += 0.0006;
            starField.rotation.x += 0.0003;

            // Mouse parallax lerping (creates smooth floating lag)
            currentX += (targetX - currentX) * 0.05;
            currentY += (targetY - currentY) * 0.05;

            starField.rotation.y += currentX * 0.0005;
            starField.rotation.x += currentY * 0.0005;
        }

        renderer.render(scene, camera);
    };

    const onMouseMove = (e) => {
        // Normalize coordinates to range [-1, 1]
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
        console.warn("WebGL Three.js initialization failed: WebGL not supported or canvas error.", err);
    }

    // ----------------------------------------------------
    // UPI QR CODE GENERATOR (Rate Updated to 7000 INR)
    // ----------------------------------------------------
    const generateUpiQr = () => {
        const upiId = "arasu9629hf@okhdfcbank";
        const payeeName = "Victor Ezhil";
        const amount = "7000"; // Updated to ₹7,000
        const currency = "INR";
        
        // Formulate standard UPI Deep Link Scheme
        const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=${currency}`;
        
        // Generate QR code URL using standard QR Code API
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
                // Show Toast Notification
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

        // Close menu when clicking link (mobile experience)
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
        
        // Header background transition
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link highlighting
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // offset for nav header height
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

    // Toggle Chatbox
    if (dmBubble && dmBox) {
        dmBubble.addEventListener('click', () => {
            dmBox.classList.toggle('show');
            if (notificationDot) {
                notificationDot.style.opacity = '0'; // Hide notification once opened
            }
            scrollToBottom();
        });

        if (closeDmBtn) {
            closeDmBtn.addEventListener('click', () => {
                dmBox.classList.remove('show');
            });
        }
    }

    // Scroll chat to bottom
    const scrollToBottom = () => {
        if (dmMessagesContainer) {
            dmMessagesContainer.scrollTop = dmMessagesContainer.scrollHeight;
        }
    };

    // Add message bubble
    const addMessage = (sender, text) => {
        if (!dmMessagesContainer) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `dm-msg ${sender}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        dmMessagesContainer.appendChild(msgDiv);
        scrollToBottom();
    };

    // Bot replies dictionary
    const botReplies = {
        order: "Outstanding choice! Video editing and graphic thumbnail designs contract starts at a minimum retainer of <strong>₹7,000</strong>. Send your design brief to <a href='mailto:victorroot9629@gmail.com' class='neon-hover'>victorroot9629@gmail.com</a>, or complete the UPI payment of ₹7,000 below to secure your slots immediately.",
        template: "This custom 3D glassmorphic profile codebase is licensed for a fee of <strong>₹7,000</strong>. Simply scan the UPI QR code on the profile card, execute the transfer to <code>arasu9629hf@okhdfcbank</code>, and email your transaction receipt to victorroot9629@gmail.com to download the full source code ZIP.",
        project: "Let's collaborate! I study B.Sc. Computer Science and love building interactive software, web tools, or gaming configurations. Email me the syllabus or project criteria at <a href='mailto:victorroot9629@gmail.com' class='neon-hover'>victorroot9629@gmail.com</a> to kick things off.",
        hello: "Greetings, traveler! 🌌 Thank you for connecting with Victor's AI. Feel free to browse through the <strong>Creative Workshow</strong> section to check out my edit thumbnails, or drop an inquiry."
    };

    // Bot replies handling
    const triggerBotResponse = (type) => {
        // Show simulated typing status
        const typingDiv = document.createElement('div');
        typingDiv.className = 'dm-msg bot typing-indicator';
        typingDiv.innerHTML = '<p>Transmitting data...</p>';
        dmMessagesContainer.appendChild(typingDiv);
        scrollToBottom();

        setTimeout(() => {
            typingDiv.remove();
            const replyText = botReplies[type] || "Acknowledged. For complex questions or direct inquiries, please send a transmission to victorroot9629@gmail.com, or complete the UPI contract payment of ₹7,000.";
            addMessage('bot', replyText);
        }, 800);
    };

    // Listen to Quick Replies
    quickReplyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-reply');
            const userText = btn.textContent;
            addMessage('user', userText);
            triggerBotResponse(type);
        });
    });

    // Listen to Text Inputs
    const handleInputSend = () => {
        if (!dmInput) return;
        const query = dmInput.value.trim();
        if (!query) return;

        addMessage('user', query);
        dmInput.value = '';

        // Match keywords
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
            document.body.style.overflow = 'hidden'; // prevent scrolling underneath
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            });
        }

        // Close on overlay click
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
