БИЗНЕС-ЗАВТРАК «ФРАНШИЗА ЯНДЕКС ЛАВКИ» — ФИНАЛЬНЫЙ САЙТ ({date})
Уфа, 28 октября. Одна страница, адаптив для всех экранов (десктоп, планшет, телефон).

Живая версия: https://nlapenqo.github.io/lavka-franchise-landing/breakfast-meeting/
Макет Figma:  https://www.figma.com/design/nvsaw9KxBQPzjHP7ln14dD (гайд, состояния, анимации)

ЧТО ВНУТРИ
site/                      Сайт по файлам — для заливки на хостинг:
  index.html               разметка
  styles.css               все стили страницы (только то, что используется)
  script.js                интерактив: шапка, меню, появление блоков, свечение, форма, карта, видео
  fonts/                   YS Geo (400/500/800/900), YS Text Cond Light — woff2
  images/                  логотипы, фото хиро, постер видео, og.png, favicon.svg
breakfast-meeting.html     Тот же сайт одним файлом (всё внутри) — для показа и проверки.

ЧТО ПОДКЛЮЧИТЬ
1. Отправка формы — сейчас демо (проверка полей, очистка, «Спасибо!»), никуда не отправляет.
   Обработчик — в конце script.js (submit у [data-form]). Имена полей: name, phone, telegram, messengers,
   email, city (несколько значений), industries, business, franchise, standards, role, budget, financing,
   extra, readiness, goal, marketing. У обязательного согласия на обработку данных name нет — добавить при необходимости.
2. og:image в <head> — относительный путь ./images/og.png, заменить на абсолютный URL.
3. Карта — Яндекс Карты API 2.1, работает без ключа; ключ — атрибут data-apikey у .map__canvas.
   Когда будет площадка: data-ymap="широта,долгота", data-pin, data-label="…", ссылка «Как добраться →».
4. Метрика — не подключена.
