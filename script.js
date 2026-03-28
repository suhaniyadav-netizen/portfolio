const themeBtn = document.getElementById("theme-toggle");
const body = document.body;

if (themeBtn) {
    const icon = themeBtn.querySelector("i");

    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        if (icon) {
            icon.classList.replace("fa-moon", "fa-sun");
        }
    }

    themeBtn.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        const isDark = body.classList.contains("dark-mode");

        if (icon) {
            icon.classList.replace(
                isDark ? "fa-moon" : "fa-sun",
                isDark ? "fa-sun" : "fa-moon"
            );
        }

        localStorage.setItem("theme", isDark ? "dark" : "light");

        if (window.updateWaveTheme) {
            window.updateWaveTheme();
        }
    });
}

const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const roles = [
    "Computer Science Student",
    "Web Developer",
    "Cybersecurity Enthusiast",
    "Tech Enthusiast"
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typeSpeed = 120;
const backSpeed = 50;
const delayBetweenRoles = 1800;

const rolesElement = document.getElementById("roles");

function typeEffect() {
    if (!rolesElement) return;

    const currentRole = roles[roleIndex];

    if (isDeleting) {
        rolesElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        rolesElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }

    let typingDelay = isDeleting ? backSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
        typingDelay = delayBetweenRoles;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingDelay = 500;
    }

    setTimeout(typeEffect, typingDelay);
}

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

function setActiveNav() {
    let currentSection = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }
    });
}

window.addEventListener("scroll", setActiveNav);

const fadeSections = document.querySelectorAll(".fade-in-section");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    },
    {
        threshold: 0.15
    }
);

fadeSections.forEach((section) => observer.observe(section));

const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if (!backToTopBtn) return;

    if (window.scrollY > 300) {
        backToTopBtn.style.display = "grid";
    } else {
        backToTopBtn.style.display = "none";
    }
});

if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    typeEffect();
    initSoftWaveMesh();
});

/* ---------------- SOFT WAVE MESH BACKGROUND ---------------- */

function initSoftWaveMesh() {
    const container = document.getElementById("three-bg");
    if (!container || typeof THREE === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let scene, camera, renderer;
    let mesh, material, geometry;
    let animationId = null;
    let mouseX = 0;
    let mouseY = 0;

    function getWaveSettings() {
        const isDark = document.body.classList.contains("dark-mode");
        return {
            color: isDark ? 0x86c5fc : 0x5aaef5,
            opacity: isDark ? 0.18 : 0.12,
            emissive: isDark ? 0x2f6ca3 : 0xbfe3ff,
            background: 0x000000
        };
    }

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 42;
    camera.position.y = 2;

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const segmentsX = window.innerWidth < 768 ? 40 : 70;
    const segmentsY = window.innerWidth < 768 ? 24 : 42;

    geometry = new THREE.PlaneGeometry(90, 60, segmentsX, segmentsY);

    const settings = getWaveSettings();

    material = new THREE.MeshBasicMaterial({
        color: settings.color,
        wireframe: true,
        transparent: true,
        opacity: settings.opacity
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -1.08;
    mesh.rotation.z = -0.18;
    mesh.position.y = -7;
    mesh.position.z = -8;

    scene.add(mesh);

    const basePositions = geometry.attributes.position.array.slice();

    function animate(time) {
        const positions = geometry.attributes.position.array;
        const t = time * 0.00045;

        for (let i = 0; i < positions.length; i += 3) {
            const x = basePositions[i];
            const y = basePositions[i + 1];

            positions[i + 2] =
                Math.sin(x * 0.22 + t * 2.2) * 0.9 +
                Math.cos(y * 0.32 + t * 1.7) * 0.7;
        }

        geometry.attributes.position.needsUpdate = true;

        mesh.rotation.z += (mouseX * 0.08 - mesh.rotation.z) * 0.02;
        mesh.rotation.x += ((-1.08 + mouseY * 0.04) - mesh.rotation.x) * 0.02;

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
    }

    function handleMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }

    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function updateWaveTheme() {
        const newSettings = getWaveSettings();
        material.color.set(newSettings.color);
        material.opacity = newSettings.opacity;
    }

    window.updateWaveTheme = updateWaveTheme;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    animate(0);
}