const staticBlackjack = 'blackjack-trainer-v4.2.1';
const assets = [
    'index.html',
    'favicon.ico',
    'css/main.css',
    'css/popups.css',
    'css/gameplay.css',
    'css/card_deck.css',
    'icons/android-chrome-192x192.png',
    'icons/android-chrome-512x512.png',
    'icons/appstore.png',
    'js/basic_strategy.js',
    'js/gamelogic.js',
    'js/utilities.js',
    'js/turn_log.js',
    'js/card_deck.js'
];

self.addEventListener('install', (installEvent) => {
    console.log('[Service Worker] Install');
    installEvent.waitUntil(
        (async () => {
            const cache = await caches.open(staticBlackjack);
            console.log('[Service Worker] Caching all');
            const stack = [];
            for (const file of assets) {
                stack.push(cache.add(file).catch(_ => console.error(`Can't load ${file} to cache`)));
            }
            await Promise.all(stack);
        })()
    );
})

self.addEventListener('fetch', (fetchEvent) => {
    fetchEvent.respondWith(
        (async() => {
            const r = await caches.match(fetchEvent.request);
            console.log(`[Service Worker] Fetching resource: ${fetchEvent.request.url}`);
            if (r) {
                return r;
            }
            const response = await fetch(fetchEvent.request);
            const cache = await caches.open(staticBlackjack);
            console.log(`[Service Worker] Caching new resource: ${fetchEvent.request.url}`);
            cache.put(fetchEvent.request, response.clone());
            return response;
        })()
    );
})

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key === staticBlackjack) {
                        return;
                    }
                    return caches.delete(key);
                })
            )
        })
    );
});
