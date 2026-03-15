// Init AOS
AOS.init({ duration: 1000, once: true });

const canvas = document.getElementById('gravityCanvas');
const ctx = canvas.getContext('2d');
let nodes = [];
const mouse = { x: -1000, y: -1000 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Node {
    constructor() {
        this.originX = Math.random() * canvas.width;
        this.originY = Math.random() * canvas.height;
        this.x = this.originX;
        this.y = this.originY;
        this.size = Math.random() * 2;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
    }

    update() {
        // Drift movement
        this.originX += this.vx;
        this.originY += this.vy;

        // Bounce
        if (this.originX < 0 || this.originX > canvas.width) this.vx *= -1;
        if (this.originY < 0 || this.originY > canvas.height) this.vy *= -1;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // Interaction (Repel)
        if (dist < 160) {
            const angle = Math.atan2(dy, dx);
            const force = (160 - dist) / 15;
            this.x -= Math.cos(angle) * force;
            this.y -= Math.sin(angle) * force;
        } else {
            this.x += (this.originX - this.x) * 0.05;
            this.y += (this.originY - this.y) * 0.05;
        }
    }

    draw() {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Populate (Adjust density for performance)
const nodeCount = window.innerWidth < 768 ? 100 : 250;
for (let i = 0; i < nodeCount; i++) nodes.push(new Node());

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
        nodes[i].draw();

        // Connection logic
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(56, 189, 248, ${0.2 * (1 - distance / 120)})`;
                ctx.lineWidth = 0.8;
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

// Progress Bar
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById("progress-bar").style.width = scrolled + "%";
});

animate();



// Add this at the bottom of your script.js
const archiveToggle = document.getElementById('archive-toggle');
const projectArchive = document.getElementById('project-archive');

archiveToggle.addEventListener('click', () => {
    projectArchive.classList.toggle('archive-visible');

    if (projectArchive.classList.contains('archive-visible')) {
        archiveToggle.innerText = "Close System Archive";
        // Recalculate AOS positions
        AOS.refresh();
    } else {
        archiveToggle.innerText = "View System Archive [5 Projects]";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const archiveToggle = document.getElementById('archive-toggle');
    const projectArchive = document.getElementById('project-archive');

    if (archiveToggle) {
        archiveToggle.onclick = function(e) {
            e.preventDefault();
            projectArchive.classList.toggle('archive-visible');

            if (projectArchive.classList.contains('archive-visible')) {
                this.innerText = "Close System Archive";
                // Refresh AOS so it detects the new cards appearing
                setTimeout(() => { AOS.refresh(); }, 600);
            } else {
                this.innerText = "View System Archive [5 Projects]";
            }
        };
    }
});

// Wrap nav logic in a check so it doesn't crash on the Archive page
window.addEventListener("scroll", () => {
    // Progress Bar (Always runs)
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const pb = document.getElementById("progress-bar");
    if(pb) pb.style.width = scrolled + "%";

    // Nav Active State (Only runs on main page)
    const nav = document.querySelector(".glass-nav");
    if (nav) {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });
        // ... rest of your nav logic
    }
});

// Only initialize AOS if the library is loaded
if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 1000, once: true });
}


const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".glass-nav a");

function updateActiveNav() {
    let current = "";

    // Calculate which section is currently in view
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        // We use an offset of 150px to trigger the change slightly before
        // the user reaches the next section
        if (window.pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        // Check if the link href matches the current section ID
        if (link.getAttribute("href").includes(current)) {
            link.classList.add("active");
        }
    });
}

// 1. Run on scroll
window.addEventListener("scroll", updateActiveNav);

// 2. Run on page load (This fixes the "Intro" highlight on refresh)
window.addEventListener("load", updateActiveNav);


// Ensure this runs after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll(".glass-nav a");

    // Intersection Observer Options
    // 'threshold: 0.6' means the section is "active" when 60% of it is on screen
    const options = {
        threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");

                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    // Add active class if the href matches the section ID
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }, options);

    // Track all sections
    document.querySelectorAll("section").forEach(section => {
        observer.observe(section);
    });
});


// Function to toggle the photo story overlay
function togglePhotoInfo(sporeButton) {
    // Find the closest parent that is a collage-item
    const collageItem = sporeButton.closest('.collage-item');

    // Toggle the 'info-active' class on that item
    if (collageItem) {
        // Option 1: Close other open cards before opening this one (Cleaner)
        document.querySelectorAll('.collage-item').forEach(item => {
            if (item !== collageItem) {
                item.classList.remove('info-active');
            }
        });

        // Option 2: Just toggle this one (Allows multiple open)
        collageItem.classList.toggle('info-active');
    }
}

// Add to your existing script.js

document.querySelectorAll('.ability-card').forEach(card => {
    const typewriterText = card.querySelector('.typewriter');
    const fullText = typewriterText.getAttribute('data-type');
    let typingInterval;

    card.addEventListener('mouseenter', () => {
        // Clear any previous text
        typewriterText.innerText = "";
        let charIndex = 0;

        // Start typing
        clearInterval(typingInterval);
        typingInterval = setInterval(() => {
            if (charIndex < fullText.length) {
                typewriterText.innerText += fullText[charIndex];
                charIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 30); // Speed of typing (ms per char)
    });

    card.addEventListener('mouseleave', () => {
        // Instantly complete or clear the text
        clearInterval(typingInterval);
        typewriterText.innerText = ""; // Or fullText if you prefer it stays
    });
});

// GLASS orbit
const portrait = document.getElementById('hero-portrait');

if (portrait) {
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 30;
        const y = (window.innerHeight / 2 - e.pageY) / 30;
        portrait.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });
}
