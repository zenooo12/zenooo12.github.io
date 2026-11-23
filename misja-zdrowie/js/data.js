/* MISJA: ZDROWIE! – treści misji i źródła.
   Każda informacja ma źródło z listy SOURCES (klucz w polu "src"). */
window.MZ_DATA = (function () {
  'use strict';

  var SOURCES = {
    ncez_talerz: {
      org: 'NCEŻ (NIZP PZH-PIB)',
      title: 'Talerz Zdrowego Żywienia',
      url: 'https://ncez.pzh.gov.pl/abc-zywienia/talerz-zdrowego-zywienia/'
    },
    ncez_zalecenia: {
      org: 'NCEŻ (NIZP PZH-PIB)',
      title: 'Zalecenia zdrowego żywienia – „W 3 krokach do zdrowia” (PDF)',
      url: 'https://ncez.pzh.gov.pl/wp-content/uploads/2021/10/Talerz-Zdrowego-Zywienia-z-Zaleceniami.pdf'
    },
    who_diet: {
      org: 'WHO',
      title: 'Healthy diet – fact sheet',
      url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet'
    },
    who_activity: {
      org: 'WHO',
      title: 'Physical activity – fact sheet (zalecenia dla dzieci i młodzieży 5–17 lat)',
      url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity'
    },
    aasm_sleep: {
      org: 'American Academy of Sleep Medicine',
      title: 'Zalecana długość snu dzieci i młodzieży (konsensus ekspertów, 2016)',
      url: 'https://aasm.org/recharge-with-sleep-pediatric-sleep-recommendations-promoting-optimal-health/'
    },
    who_adolescent_mh: {
      org: 'WHO',
      title: 'Mental health of adolescents – fact sheet',
      url: 'https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health'
    },
    tel_116111: {
      org: 'Fundacja Dajemy Dzieciom Siłę',
      title: 'Telefon zaufania dla dzieci i młodzieży 116 111 (bezpłatny)',
      url: 'https://116111.pl/'
    },
    efsa_water: {
      org: 'EFSA',
      title: 'Scientific Opinion on Dietary Reference Values for water (2010)',
      url: 'https://www.efsa.europa.eu/en/efsajournal/pub/1459'
    },
    gov_energy: {
      org: 'gov.pl – PSSE we Wrocławiu',
      title: 'Napoje energetyzujące – zakaz sprzedaży osobom poniżej 18 lat',
      url: 'https://www.gov.pl/web/psse-wroclaw/napoje-energetyzujace'
    },
    aao_screen: {
      org: 'American Academy of Ophthalmology',
      title: 'Computers, Digital Devices and Eye Strain (zasada 20-20-20)',
      url: 'https://www.aao.org/eye-health/tips-prevention/computer-usage'
    },
    who_hands: {
      org: 'WHO',
      title: 'World Hand Hygiene Day – higiena rąk',
      url: 'https://www.who.int/campaigns/world-hand-hygiene-day'
    },
    who_oral: {
      org: 'WHO',
      title: 'Oral health – fact sheet',
      url: 'https://www.who.int/news-room/fact-sheets/detail/oral-health'
    },
    who_air: {
      org: 'WHO',
      title: 'Ambient (outdoor) air pollution – fact sheet',
      url: 'https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health'
    },
    gios_air: {
      org: 'GIOŚ',
      title: 'Jakość powietrza w Polsce – aktualne pomiary',
      url: 'https://powietrze.gios.gov.pl/'
    },
    nfz_pacjent: {
      org: 'NFZ / Ministerstwo Zdrowia',
      title: 'pacjent.gov.pl – Internetowe Konto Pacjenta i porady zdrowotne',
      url: 'https://pacjent.gov.pl/'
    }
  };

  var MISSIONS = [
    {
      id: 'food', num: 1, type: 'plate',
      topic: 'Zdrowe odżywianie', place: 'Bistro „Zdrowy Talerz”', icon: '🥗',
      color: '#ff8a3d', pos: { x: 13, y: 30 },
      story: 'Kucharz z Bistro zgubił przepis na zbilansowany obiad! Skomponujcie posiłek z maksymalnie 5 produktów.',
      badge: { icon: '🍽️', name: 'Mistrzowie Talerza' },
      products: [
        { id: 'broc', icon: '🥦', name: 'Brokuły', cat: 'veg' },
        { id: 'salad', icon: '🍅', name: 'Sałatka pomidorowa', cat: 'veg' },
        { id: 'carrot', icon: '🥕', name: 'Surówka z marchewki', cat: 'veg' },
        { id: 'apple', icon: '🍎', name: 'Jabłko', cat: 'fruit' },
        { id: 'groats', icon: '🌾', name: 'Kasza gryczana', cat: 'grain' },
        { id: 'bread', icon: '🍞', name: 'Chleb razowy', cat: 'grain' },
        { id: 'fish', icon: '🐟', name: 'Pieczona ryba', cat: 'protein' },
        { id: 'egg', icon: '🥚', name: 'Jajko', cat: 'protein' },
        { id: 'water', icon: '💧', name: 'Szklanka wody', cat: 'water' },
        { id: 'fries', icon: '🍟', name: 'Frytki', cat: 'limit', why: 'smażone, dużo soli i tłuszczu' },
        { id: 'cola', icon: '🥤', name: 'Słodki napój gazowany', cat: 'limit', why: 'dużo cukru – lepiej wybrać wodę' },
        { id: 'donut', icon: '🍩', name: 'Pączek', cat: 'limit', why: 'słodycz – zamiast tego owoc' }
      ],
      learn: [
        { t: 'Połowę talerza powinny zajmować kolorowe warzywa i owoce – z przewagą warzyw.', src: 'ncez_talerz' },
        { t: 'Ćwierć talerza to produkty zbożowe, najlepiej pełnoziarniste (kasze, razowy chleb, brązowy ryż).', src: 'ncez_talerz' },
        { t: 'Ćwierć talerza to białko: ryby, jaja, rośliny strączkowe, nabiał, drób.', src: 'ncez_talerz' },
        { t: 'Zamiast słodkich napojów – woda. Jedzmy minimum 400 g warzyw i owoców dziennie.', src: 'ncez_zalecenia' }
      ]
    },
    {
      id: 'move', num: 2, type: 'activity',
      topic: 'Aktywność fizyczna', place: 'Stadion Energii', icon: '⚽',
      color: '#ff4f6d', pos: { x: 36, y: 17 },
      story: 'Trener Stadionu potrzebuje planu dnia ucznia. Zbierzcie co najmniej 60 minut prawdziwego ruchu!',
      badge: { icon: '🏅', name: 'Turbo Sportowcy' },
      tiles: [
        { id: 'bike', icon: '🚲', name: 'Rower do szkoły i z powrotem', min: 20, active: true },
        { id: 'pe', icon: '⚽', name: 'Aktywna gra na WF', min: 30, active: true },
        { id: 'dog', icon: '🐕', name: 'Szybki spacer z psem', min: 15, active: true },
        { id: 'dance', icon: '💃', name: 'Taniec do ulubionej muzyki', min: 15, active: true },
        { id: 'swim', icon: '🏊', name: 'Basen z przyjaciółmi', min: 30, active: true },
        { id: 'console', icon: '🎮', name: 'Granie na konsoli', min: 60, active: false },
        { id: 'scroll', icon: '📱', name: 'Przewijanie filmików', min: 30, active: false },
        { id: 'car', icon: '🚗', name: 'Podwózka autem pod szkołę', min: 10, active: false }
      ],
      question: {
        q: 'Ile dni w tygodniu WHO zaleca dzieciom i młodzieży ćwiczenia wzmacniające mięśnie i kości?',
        options: [
          { t: 'Wystarczy 1 dzień w tygodniu', ok: false },
          { t: 'Co najmniej 3 dni w tygodniu', ok: true },
          { t: 'Nie są potrzebne w tym wieku', ok: false }
        ],
        explain: 'WHO zaleca młodzieży 5–17 lat ćwiczenia intensywne oraz wzmacniające mięśnie i kości co najmniej 3 dni w tygodniu.'
      },
      learn: [
        { t: 'Dzieci i młodzież (5–17 lat): średnio co najmniej 60 minut dziennie ruchu o umiarkowanej lub dużej intensywności.', src: 'who_activity' },
        { t: 'Co najmniej 3 dni w tygodniu: wysiłek intensywny i ćwiczenia wzmacniające mięśnie i kości.', src: 'who_activity' },
        { t: 'Warto ograniczać czas siedzenia, zwłaszcza rekreacyjny czas przed ekranem.', src: 'who_activity' }
      ]
    },
    {
      id: 'sleep', num: 3, type: 'sleep',
      topic: 'Zdrowy sen i odpoczynek', place: 'Osiedle Księżycowe', icon: '🌙',
      color: '#7c5cff', pos: { x: 63, y: 15 },
      story: 'Mieszkańcy Osiedla Księżycowego nie mogą się wyspać! Ułóżcie im plan spokojnego wieczoru.',
      badge: { icon: '😴', name: 'Strażnicy Snu' },
      cards: [
        { id: 'dinner', icon: '🍲', name: 'Lekka kolacja – nie tuż przed snem', good: true, order: 2 },
        { id: 'bag', icon: '🎒', name: 'Spakowanie plecaka na jutro', good: true, order: 1 },
        { id: 'phone', icon: '📵', name: 'Odłożenie telefonu poza sypialnię', good: true, order: 3 },
        { id: 'teeth', icon: '🦷', name: 'Mycie zębów i wieczorna toaleta', good: true, order: 4 },
        { id: 'book', icon: '📖', name: 'Czytanie książki przy przyciemnionym świetle', good: true, order: 5 },
        { id: 'room', icon: '🛏️', name: 'Sen w ciemnym, cichym, przewietrzonym pokoju', good: true, order: 6 },
        { id: 'energy', icon: '⚡', name: 'Energetyk lub cola wieczorem', good: false, why: 'Kofeina pobudza i utrudnia zaśnięcie. Energetyków nie sprzedaje się osobom poniżej 18 lat.' },
        { id: 'game', icon: '🎮', name: 'Gra online „do ostatniej rundy” o północy', good: false, why: 'Ekscytująca gra późno w nocy skraca sen i utrudnia zaśnięcie.' },
        { id: 'series', icon: '📱', name: 'Seriale na telefonie w łóżku', good: false, why: 'Ekran i powiadomienia w łóżku przeszkadzają w zasypianiu – telefon lepiej odłożyć.' }
      ],
      learn: [
        { t: 'Zalecany sen: 6–12 lat – 9 do 12 godzin, 13–18 lat – 8 do 10 godzin na dobę.', src: 'aasm_sleep' },
        { t: 'Liczy się nie tylko długość, ale też regularność i jakość snu. Za mało snu utrudnia naukę i koncentrację.', src: 'aasm_sleep' },
        { t: 'Kofeina z energetyków i coli pobudza – energetyków nie sprzedaje się osobom poniżej 18 lat.', src: 'gov_energy' }
      ]
    },
    {
      id: 'mood', num: 4, type: 'chat',
      topic: 'Dobre samopoczucie i relacje', place: 'Park Przyjaźni', icon: '💛',
      color: '#f5a524', pos: { x: 87, y: 32 },
      story: 'W Parku Przyjaźni zrobiło się smutno. Pomóżcie bohaterom w trzech codziennych sytuacjach.',
      badge: { icon: '🤝', name: 'Drużyna Wsparcia' },
      scenes: [
        {
          who: '🧑‍🎓', name: 'Ola',
          msg: 'Do naszej klasy doszedł nowy uczeń. Na każdej przerwie siedzi sam… Co robimy?',
          options: [
            { t: 'Zapraszamy go do wspólnej gry albo rozmowy', pts: 33, fb: 'Super! Jeden mały gest pomaga poczuć się częścią grupy. Dobre relacje to ważna część zdrowia psychicznego.' },
            { t: 'Czekamy, aż sam do nas zagada', pts: 10, fb: 'Nowej osobie często trudno zrobić pierwszy krok. Lepiej wyjść z inicjatywą i zaprosić ją do grupy.' },
            { t: 'Żartujemy z niego z kolegami', pts: 0, fb: 'Wyśmiewanie rani i może prowadzić do przemocy rówieśniczej. Szacunek i życzliwość budują dobrą atmosferę.' }
          ]
        },
        {
          who: '🧒', name: 'Kuba',
          msg: 'Na klasowym czacie ktoś wysyła złośliwe wiadomości o moim koledze. Co mam zrobić?',
          options: [
            { t: 'Nie przesyłam dalej, wspieram kolegę i mówię zaufanemu dorosłemu (zachowuję zrzuty ekranu)', pts: 33, fb: 'Dokładnie tak! Reagowanie i proszenie dorosłych o pomoc zatrzymuje cyberprzemoc. Zrzuty ekranu to dowody.' },
            { t: 'Udaję, że nic nie widzę', pts: 10, fb: 'Milczenie nie pomaga osobie krzywdzonej. Warto ją wesprzeć i powiedzieć o sytuacji dorosłemu.' },
            { t: 'Dopisuję śmieszny komentarz', pts: 0, fb: 'Dołączanie się do hejtu też jest przemocą. Lepiej stanąć po stronie osoby krzywdzonej.' }
          ]
        },
        {
          who: '👧', name: 'Zuzia',
          msg: 'Od kilku dni jestem smutna i bardzo zestresowana przed sprawdzianami…',
          options: [
            { t: 'Rozmawiam z kimś zaufanym (rodzic, wychowawca, psycholog szkolny) i dbam o sen i ruch', pts: 34, fb: 'Świetny wybór! Rozmowa pomaga, a sen i ruch wspierają samopoczucie. Można też zadzwonić pod bezpłatny numer 116 111.' },
            { t: 'Zamykam się w pokoju i nikomu nic nie mówię', pts: 10, fb: 'Tłumienie emocji w samotności często je wzmacnia. Proszenie o pomoc to oznaka siły, a nie słabości.' },
            { t: 'Gram całą noc, żeby o tym zapomnieć', pts: 0, fb: 'Brak snu pogarsza nastrój i koncentrację. Lepiej porozmawiać z kimś zaufanym i odpocząć.' }
          ]
        }
      ],
      learn: [
        { t: 'Dobre relacje, sen i aktywność fizyczna wspierają zdrowie psychiczne młodych ludzi.', src: 'who_adolescent_mh' },
        { t: 'Gdy dzieje się coś trudnego – porozmawiaj z zaufanym dorosłym.', src: 'who_adolescent_mh' },
        { t: 'Telefon zaufania dla dzieci i młodzieży 116 111 jest bezpłatny.', src: 'tel_116111' }
      ]
    },
    {
      id: 'water', num: 5, type: 'sort',
      topic: 'Nawodnienie organizmu', place: 'Fontanna Orzeźwienia', icon: '💧',
      color: '#1aa7ff', pos: { x: 82, y: 72 },
      story: 'Fontanna wysycha! Posortujcie napoje: co pijemy na co dzień, co tylko czasami, a co nie jest dla dzieci i młodzieży.',
      badge: { icon: '🌊', name: 'Wodni Bohaterowie' },
      bins: [
        { id: 'daily', icon: '💧', name: 'Na co dzień' },
        { id: 'sometimes', icon: '🕒', name: 'Tylko czasami' },
        { id: 'never', icon: '🚫', name: 'Nie dla nas (poniżej 18 lat)' }
      ],
      items: [
        { id: 'water', icon: '💧', name: 'Woda', bin: 'daily', fb: 'Woda to najlepszy napój do gaszenia pragnienia.' },
        { id: 'lemon', icon: '🍋', name: 'Woda z cytryną i miętą', bin: 'daily', fb: 'Woda z dodatkiem owoców lub ziół – bez cukru – to świetny wybór.' },
        { id: 'milk', icon: '🥛', name: 'Mleko bez dodatku cukru', bin: 'daily', fb: 'Mleko i napoje mleczne bez cukru dostarczają wapnia – zalecenia mówią o 2 szklankach dziennie.' },
        { id: 'tea', icon: '🍵', name: 'Niesłodzona herbata owocowa', bin: 'daily', fb: 'Niesłodzone napary nawadniają bez dodatku cukru.' },
        { id: 'juice', icon: '🧃', name: 'Sok owocowy 100%', bin: 'sometimes', fb: 'Sok ma dużo naturalnego cukru (WHO liczy go do „cukrów wolnych”). Lepiej zjeść cały owoc.' },
        { id: 'soda', icon: '🥤', name: 'Słodzony napój gazowany', bin: 'sometimes', fb: 'Słodkie napoje to dużo cukru – zamieniajmy je na wodę.' },
        { id: 'iso', icon: '🏃', name: 'Napój izotoniczny', bin: 'sometimes', fb: 'Przy zwykłym WF czy spacerze w zupełności wystarcza woda.' },
        { id: 'energy', icon: '⚡', name: 'Napój energetyczny', bin: 'never', fb: 'Od 1 stycznia 2024 r. w Polsce nie wolno sprzedawać energetyków osobom poniżej 18 lat ani na terenie szkół.' }
      ],
      learn: [
        { t: 'Woda to najlepszy wybór – zalecenia NCEŻ: „Zamień słodkie napoje na wodę”.', src: 'ncez_zalecenia' },
        { t: 'Wg EFSA młodzież od 14 lat potrzebuje ok. 2,0 l (dziewczęta) i 2,5 l (chłopcy) wody dziennie – razem z wodą z jedzenia.', src: 'efsa_water' },
        { t: 'Od 2024 r. obowiązuje zakaz sprzedaży napojów energetyzujących osobom poniżej 18 lat.', src: 'gov_energy' },
        { t: 'Cukry z soków owocowych WHO zalicza do cukrów wolnych, które warto ograniczać.', src: 'who_diet' }
      ]
    },
    {
      id: 'tech', num: 6, type: 'cards',
      topic: 'Zdrowe korzystanie z telefonu i komputera', place: 'Centrum Cyfrowe', icon: '💻',
      color: '#3d7cff', pos: { x: 58, y: 84 },
      story: 'W Centrum Cyfrowym pomieszały się nawyki. Oceńcie każdą kartę: zdrowy czy niezdrowy?',
      badge: { icon: '🛡️', name: 'Cyfrowi Mistrzowie' },
      cards: [
        { icon: '👀', t: 'Co 20 minut patrzysz przez 20 sekund na coś daleko (ok. 6 m) – zasada 20-20-20.', ok: true, fb: 'Tak! Krótkie przerwy dla oczu zmniejszają ich zmęczenie przy ekranie.' },
        { icon: '🔔', t: 'Telefon leży przy poduszce z włączonymi powiadomieniami.', ok: false, fb: 'Powiadomienia w nocy wybudzają i skracają sen. Telefon lepiej odłożyć poza sypialnię.' },
        { icon: '🧘', t: 'Podczas nauki przy komputerze co jakiś czas wstajesz i się przeciągasz.', ok: true, fb: 'Dobrze! WHO zaleca ograniczać długie siedzenie – przerwy na ruch pomagają.' },
        { icon: '🔑', t: 'Podajesz swoje hasło koledze, który o nie prosi w grze.', ok: false, fb: 'Hasło jest tylko twoje (ewentualnie znają je rodzice). Udostępnianie go grozi utratą konta.' },
        { icon: '🚨', t: 'Gdy ktoś cię obraża w sieci: robisz zrzut ekranu, blokujesz go i mówisz zaufanemu dorosłemu.', ok: true, fb: 'Dokładnie tak należy reagować na cyberprzemoc.' },
        { icon: '🍽️', t: 'Z rodziną ustalacie strefy bez telefonu – np. przy stole i w sypialni.', ok: true, fb: 'Świetny pomysł – więcej rozmowy i lepszy sen.' },
        { icon: '🖥️', t: 'Ekran masz mniej więcej na wysokości oczu i siedzisz prosto.', ok: true, fb: 'Tak – dobra pozycja zmniejsza napięcie szyi i pleców.' },
        { icon: '🌃', t: 'Grasz „jeszcze jedną rundę” do późna, choć jutro szkoła.', ok: false, fb: 'Granie do późna skraca sen, a niewyspanie utrudnia naukę i pogarsza nastrój.' }
      ],
      learn: [
        { t: 'Zasada 20-20-20: co 20 minut patrz przez 20 sekund na coś oddalonego o ok. 6 metrów.', src: 'aao_screen' },
        { t: 'Ograniczaj rekreacyjny czas przed ekranem i przerywaj długie siedzenie ruchem.', src: 'who_activity' },
        { t: 'Cyberprzemoc? Zrzut ekranu, zablokuj, powiedz dorosłemu. Pomoc: 116 111.', src: 'tel_116111' }
      ]
    },
    {
      id: 'hygiene', num: 7, type: 'hygiene',
      topic: 'Higiena i profilaktyka', place: 'Przychodnia „Czysty Start”', icon: '🧼',
      color: '#14b8a6', pos: { x: 32, y: 82 },
      story: 'W Przychodni szaleją zarazki! Wykonajcie trzy zadania doktor Zdrowiny.',
      badge: { icon: '✨', name: 'Pogromcy Zarazków' },
      steps: [
        { icon: '🚿', t: 'Zmocz ręce wodą' },
        { icon: '🧴', t: 'Nałóż mydło' },
        { icon: '👐', t: 'Pocieraj całe dłonie: wierzch, między palcami, kciuki, paznokcie' },
        { icon: '💦', t: 'Dokładnie spłucz mydło' },
        { icon: '🧻', t: 'Wysusz ręce czystym ręcznikiem' }
      ],
      when: [
        { t: 'Po skorzystaniu z toalety', ok: true },
        { t: 'Przed jedzeniem', ok: true },
        { t: 'Po powrocie do domu', ok: true },
        { t: 'Po kichaniu lub wydmuchaniu nosa', ok: true },
        { t: 'Po zabawie ze zwierzęciem', ok: true },
        { t: 'Tylko gdy ręce są widocznie brudne', ok: false }
      ],
      teeth: {
        q: 'Jak dbać o zęby?',
        options: [
          { t: 'Myć 2 razy dziennie pastą z fluorem', ok: true },
          { t: 'Myć tylko po zjedzeniu słodyczy', ok: false },
          { t: 'Wystarczy guma do żucia zamiast szczoteczki', ok: false }
        ],
        explain: 'WHO zaleca mycie zębów pastą z fluorem dwa razy dziennie. Warto też ograniczać cukier i chodzić na kontrole do dentysty.'
      },
      learn: [
        { t: 'Mycie rąk wodą z mydłem to jeden z najskuteczniejszych sposobów ochrony przed infekcjami.', src: 'who_hands' },
        { t: 'Zęby myjemy pastą z fluorem dwa razy dziennie i ograniczamy cukier.', src: 'who_oral' },
        { t: 'Profilaktyka to też kichanie w łokieć, szczepienia i regularne wizyty kontrolne u lekarza.', src: 'nfz_pacjent' }
      ]
    },
    {
      id: 'eco', num: 8, type: 'eco',
      topic: 'Zdrowie a środowisko', place: 'Eko-Dzielnica', icon: '🌳',
      color: '#22c55e', pos: { x: 12, y: 70 },
      story: 'Eko-Dzielnica potrzebuje mądrych decyzji. Każdy wybór wpływa na wasze zdrowie i na środowisko!',
      badge: { icon: '🌍', name: 'Obrońcy Planety' },
      decisions: [
        {
          icon: '🏫', q: 'Do szkoły macie 1,5 km. Jak tam docieracie?',
          options: [
            { t: 'Pieszo albo rowerem', pts: 25, h: 2, e: 2, fb: 'Najlepszy wybór: ruch dla was i brak spalin dla miasta.' },
            { t: 'Autobusem', pts: 15, h: 0, e: 1, fb: 'Komunikacja miejska to mniej spalin niż wiele aut. Na krótkich trasach jeszcze lepszy jest rower lub spacer.' },
            { t: 'Autem rodziców, choć nie trzeba', pts: 5, h: -1, e: -2, fb: 'Krótkie trasy autem to więcej spalin i mniej ruchu. Spróbujcie chodzić lub jeździć rowerem.' }
          ]
        },
        {
          icon: '🌫️', q: 'Aplikacja pokazuje bardzo złą jakość powietrza (smog). Macie w planie bieganie na dworze.',
          options: [
            { t: 'Przenosimy trening do hali lub domu', pts: 25, h: 2, e: 0, fb: 'Brawo! W dni smogowe warto ograniczać wysiłek na zewnątrz. Jakość powietrza sprawdzisz w serwisie GIOŚ.' },
            { t: 'Biegamy jeszcze dłużej, żeby „przewietrzyć płuca”', pts: 5, h: -2, e: 0, fb: 'Podczas wysiłku wdychamy więcej powietrza – a więc i więcej zanieczyszczeń. W smog lepiej ćwiczyć w środku.' },
            { t: 'Sprawdzamy, kiedy powietrze się poprawi, i biegamy wtedy', pts: 20, h: 1, e: 0, fb: 'Dobry pomysł! Planowanie aktywności według jakości powietrza chroni zdrowie.' }
          ]
        },
        {
          icon: '🔥', q: 'Sąsiad pali w piecu plastikowe butelki i śmieci. Dym wpada do waszego okna.',
          options: [
            { t: 'Prosimy dorosłych, by porozmawiali z sąsiadem lub zgłosili to do straży miejskiej albo gminy', pts: 25, h: 2, e: 2, fb: 'Tak! Spalanie odpadów w piecach jest zabronione – powstają przy nim toksyczne substancje szkodliwe dla płuc.' },
            { t: 'Zamykamy okno i nic nie robimy', pts: 10, h: 0, e: -1, fb: 'Zamknięcie okna chroni na chwilę, ale problem zostaje. Lepiej poprosić dorosłych o reakcję.' },
            { t: 'To nic, przecież każdy tak robi', pts: 0, h: -2, e: -2, fb: 'Dym ze spalanych śmieci szkodzi wszystkim w okolicy. Tego nie wolno robić.' }
          ]
        },
        {
          icon: '☀️', q: 'Upalny dzień i wycieczka do parku. Co zabieracie?',
          options: [
            { t: 'Bidon wielorazowy z wodą, czapkę i krem z filtrem – odpoczywamy w cieniu', pts: 25, h: 2, e: 2, fb: 'Idealnie: nawodnienie, ochrona przed słońcem i mniej plastikowych odpadów.' },
            { t: 'Kilka plastikowych butelek słodzonego napoju', pts: 5, h: -1, e: -2, fb: 'Słodkie napoje to dużo cukru, a jednorazowe butelki to dodatkowe śmieci. Woda w bidonie jest lepsza.' },
            { t: 'Nic nie bierzemy, kupimy coś na miejscu', pts: 10, h: -1, e: 0, fb: 'W upał łatwo o odwodnienie – lepiej mieć wodę i nakrycie głowy od początku.' }
          ]
        }
      ],
      learn: [
        { t: 'Zanieczyszczone powietrze szkodzi zdrowiu – wg WHO w 2019 r. aż 99% ludzi na świecie mieszkało tam, gdzie nie były spełnione normy jakości powietrza WHO.', src: 'who_air' },
        { t: 'Aktualną jakość powietrza w Polsce sprawdzisz w serwisie GIOŚ.', src: 'gios_air' },
        { t: 'Jedzenie mniej mięsa czerwonego i więcej roślin służy zdrowiu i środowisku.', src: 'ncez_talerz' }
      ]
    }
  ];

  var TITLES = [
    { min: 720, icon: '🏆', name: 'Legendarni Mistrzowie Zdrowia', text: 'Niesamowity wynik! Zdrowolandia znów tętni zdrowiem dzięki wam.' },
    { min: 560, icon: '🥇', name: 'Superbohaterowie Zdrowia', text: 'Świetna robota! Znacie zdrowe nawyki i potraficie je stosować.' },
    { min: 380, icon: '🥈', name: 'Strażnicy Zdrowych Nawyków', text: 'Dobra robota! Wiele już wiecie, a każda misja nauczyła was czegoś nowego.' },
    { min: 0, icon: '🥉', name: 'Odważni Odkrywcy Zdrowia', text: 'Każdy błąd to lekcja – teraz wiecie więcej niż na starcie. Brawo za odwagę!' }
  ];

  return { SOURCES: SOURCES, MISSIONS: MISSIONS, TITLES: TITLES, MAX_PER_MISSION: 100 };
})();
