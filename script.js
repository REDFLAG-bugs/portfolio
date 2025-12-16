const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function toggleMenu() {
    $('.nav-links').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;
    const toggle = $('#theme-toggle');

    // Theme
    const theme = localStorage.getItem('theme') ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') html.dataset.theme = 'dark';

    toggle?.addEventListener('click', () => {
        const isDark = html.dataset.theme === 'dark';
        html.dataset.theme = isDark ? '' : 'dark';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // Mobile menu close on link click
    $$('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            $('.nav-links').classList.remove('open');
        });
    });

    // Scroll animations
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => e.isIntersecting && e.target.classList.add('show'));
    }, { threshold: 0.1 });

    $$('.hidden').forEach(el => observer.observe(el));
});