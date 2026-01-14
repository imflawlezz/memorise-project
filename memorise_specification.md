---
title: ""
---

# Informacje Ogólne

## Cel Projektu

Stworzenie nowoczesnej, responsywnej aplikacji mobilnej webowej do nauki z wykorzystaniem fiszek, implementującej algorytm powtórek z odstępami czasowymi (spaced repetition) oraz oferującej różne tryby nauki.

## Platforma Docelowa

- Aplikacja mobilna webowa (Progressive Web App)
- Kompatybilność z przeglądarkami mobilnymi (iOS Safari, Android Chrome)
- Możliwość instalacji jako PWA na urządzeniach mobilnych

## Grupa Docelowa

- Studenci i uczniowie
- Osoby uczące się języków obcych
- Użytkownicy szukający alternatywy dla aplikacji Anki
- Osoby preferujące minimalistyczny, nowoczesny interfejs

# Architektura Aplikacji

## Struktura Katalogów

```
src/
├── components/
│   ├── cards/
│   │   ├── FlashCard.tsx
│   │   ├── CardEditor.tsx
│   │   └── CardList.tsx
│   ├── review/
│   │   ├── ReviewSession.tsx
│   │   ├── ReviewControls.tsx
│   │   └── DifficultyButtons.tsx
│   ├── stats/
│   │   ├── StatsDashboard.tsx
│   │   ├── ProgressChart.tsx
│   │   └── Heatmap.tsx
│   └── common/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Modal.tsx
├── pages/
│   ├── Home.tsx
│   ├── Decks.tsx
│   ├── Review.tsx
│   ├── Statistics.tsx
│   └── Settings.tsx
├── contexts/
│   ├── DeckContext.tsx
│   └── ThemeContext.tsx
├── hooks/
│   ├── useSpacedRepetition.ts
│   ├── useStorage.ts
│   └── useReviewSession.ts
├── services/
│   ├── storageService.ts
│   ├── ankiImportService.ts
│   └── spacedRepetitionService.ts
├── models/
│   ├── Card.ts
│   ├── Deck.ts
│   └── ReviewLog.ts
├── utils/
│   ├── sm2Algorithm.ts
│   └── dateHelpers.ts
└── App.tsx
```

## Przepływ Danych

**Komponenty UI** → interakcja z użytkownikiem  
**Context/Hooks** → zarządzanie stanem i logiką biznesową  
**Services** → operacje na danych, algorytmy  
**Storage API** → persystencja danych

# Funkcjonalności Aplikacji

## Podstawowe Pojęcia

Przed opisem funkcjonalności, warto wyjaśnić kluczowe pojęcia używane w aplikacjach do nauki z fiszkami:

| Pojęcie | Opis |
|:--|:----------|
| **Fiszka (Card)** | Jednostka nauki składająca się z dwóch stron: przód (pytanie) i tył (odpowiedź). Użytkownik widzi przód, próbuje przypomnieć sobie odpowiedź, odkrywa tył i ocenia swoją pamięć. |
| **Talia (Deck)** | Zbiór powiązanych tematycznie fiszek, np. "Słówka angielskie" lub "Historia Polski". |
| **Powtórka (Review)** | Proces przeglądania fiszek i oceniania jakości swojej pamięci. Po każdej powtórce system oblicza, kiedy pokazać fiszkę ponownie. |
| **Spaced Repetition** | Metoda nauki oparta na powtarzaniu materiału w optymalnych odstępach czasowych — im lepiej pamiętasz, tym dłuższa przerwa przed kolejną powtórką. |
| **Interval** | Liczba dni do następnej powtórki danej fiszki. Wartość ta rośnie wraz z sukcesywnymi poprawnymi odpowiedziami. |
| **Easiness Factor (EF)** | Współczynnik określający jak trudna jest dana fiszka dla użytkownika. Karty trudniejsze mają niższy EF i są pokazywane częściej. |
| **Sesja nauki** | Pojedyncze uruchomienie trybu nauki, podczas którego użytkownik przegląda kolejne fiszki do momentu zakończenia lub wyczerpania puli. |

## Priorytety Realizacji

Poniższa tabela przedstawia kolejność realizacji funkcjonalności, podzieloną na fazy. Funkcjonalności oznaczone jako **MVP** są niezbędne do pierwszego działającego wydania aplikacji.

| Priorytet | Funkcjonalność | Faza | Uzasadnienie |
|:-|:-----|:-|:------|
| 1 | Tworzenie i zarządzanie taliami | MVP | Podstawowa struktura danych — bez talii nie ma gdzie przechowywać kart |
| 2 | Tworzenie i edycja fiszek | MVP | Użytkownik musi móc dodawać treści do nauki |
| 3 | Algorytm SM-2 | MVP | Rdzeń aplikacji — bez algorytmu brak spaced repetition |
| 4 | Tryb klasyczny nauki | MVP | Podstawowy tryb interakcji z kartami |
| 5 | Sesja nauki (kolejka, interfejs) | MVP | Połączenie komponentów w funkcjonalną sesję |
| 6 | Podstawowe statystyki | MVP | Motywacja użytkownika (karty dzisiaj, streak) |
| 7 | Persistencja danych (localStorage) | MVP | Zapisywanie postępu między sesjami |
| 8 | Import z Anki (.apkg) | Faza 2 | Ułatwienie migracji dla istniejących użytkowników Anki |
| 9 | Tryby quiz/typing/reversed | Faza 2 | Rozszerzenie metod nauki |
| 10 | Zaawansowane statystyki (wykresy) | Faza 2 | Wizualizacja postępów |
| 11 | PWA i offline mode | Faza 2 | Możliwość nauki bez internetu |
| 12 | Animacje i gesty | Faza 3 | Poprawa UX, nie blokuje funkcjonalności |
| 13 | Heatmap aktywności | Faza 3 | Gamifikacja |
| 14 | Export/import danych (JSON) | Faza 3 | Backup i przenoszenie danych |

**Kryteria gotowości MVP:**

- Użytkownik może utworzyć talię i dodać karty
- Użytkownik może przeprowadzić sesję nauki w trybie klasycznym
- System poprawnie oblicza daty następnych powtórek (SM-2)
- Dane są zachowywane między sesjami przeglądarki
- Interfejs jest responsywny na urządzeniach mobilnych

## Zarządzanie Talią Fiszek

Talia (Deck) to kontener grupujący powiązane tematycznie fiszki. Użytkownik może mieć wiele talii, np. "Angielski B2", "Historia Europy", "Programowanie Python". Każda talia jest niezależną jednostką nauki z własnymi ustawieniami i statystykami.

### Tworzenie Talii

Użytkownik tworzy nową talię poprzez formularz zawierający:

| Pole | Typ | Wymagane | Opis |
|:--|:--|:-|:-------|
| **Nazwa** | string | Tak | Unikalna nazwa talii, maks. 100 znaków |
| **Opis** | string | Nie | Opcjonalny opis zawartości i celu talii |
| **Kategoria** | enum | Nie | Klasyfikacja tematyczna (Języki, Nauka, Historia, itd.) |
| **Kolor** | string (hex) | Nie | Kolor wyróżniający talię w interfejsie |

**Proces tworzenia:**

1. Użytkownik klika przycisk "Nowa talia" na ekranie Decks
2. System wyświetla modal z formularzem
3. Po wypełnieniu i walidacji, talia jest zapisywana do localStorage
4. Nowa talia pojawia się na liście z pustymi statystykami (0 kart)

### Edycja i Usuwanie Talii

**Edycja** — użytkownik może modyfikować wszystkie metadane talii (nazwa, opis, kategoria, kolor) bez wpływu na zawarte w niej karty ani ich postęp nauki.

**Usuwanie** — proces dwuetapowy dla bezpieczeństwa:

1. Użytkownik wybiera opcję "Usuń talię"
2. System wyświetla dialog potwierdzenia z informacją o liczbie kart do usunięcia
3. Po potwierdzeniu, talia i wszystkie jej karty są usuwane z localStorage

**Archiwizacja (soft delete)** — alternatywa dla trwałego usunięcia. Zarchiwizowana talia nie jest wyświetlana na głównej liście, ale dane pozostają w systemie i mogą być przywrócone.

### Import z Anki

Anki to popularna aplikacja do nauki z fiszkami z formatem eksportu `.apkg`. Funkcja importu pozwala użytkownikom przenieść istniejące kolekcje do naszej aplikacji.

**Format pliku .apkg:**

- Archiwum ZIP zawierające bazę SQLite (`collection.anki2`)
- Media (obrazki, dźwięki) w osobnych plikach

**Proces importu:**

1. Użytkownik wybiera plik .apkg z urządzenia
2. System dekompresuje archiwum za pomocą JSZip
3. SQL.js parsuje bazę SQLite i wyodrębnia:
   - Strukturę talii (tabela `decks`)
   - Karty z polami przód/tył (tabela `notes`, `cards`)
   - Historię powtórek (opcjonalnie, tabela `revlog`)
4. Progress bar wyświetla postęp konwersji
5. Skonwertowane dane są zapisywane do localStorage

**Obsługiwane typy kart:**

- **Basic** — prosta karta przód→tył
- **Basic (and reversed)** — karta działająca w obu kierunkach
- **Cloze** — karta z ukrytymi fragmentami tekstu (np. "Stolica Polski to {{c1::Warszawa}}")

## Zarządzanie Fiszkami

Fiszka (Card) to pojedyncza jednostka nauki składająca się z dwóch stron. Przód zawiera pytanie lub pojęcie do zapamiętania, tył zawiera odpowiedź lub definicję. Użytkownik widzi przód, próbuje przypomnieć sobie odpowiedź, następnie odkrywa tył i ocenia jakość swojej pamięci.

### Tworzenie Fiszek

Użytkownik dodaje nowe karty do wybranej talii poprzez edytor:

| Pole | Typ | Wymagane | Opis |
|:--|:--|:-|:-------|
| **Przód (Front)** | rich text | Tak | Treść wyświetlana jako pytanie/zagadnienie |
| **Tył (Back)** | rich text | Tak | Treść wyświetlana jako odpowiedź |
| **Obrazek** | file (base64) | Nie | Ilustracja wspierająca zapamiętywanie |
| **Dźwięk** | file (base64) | Nie | Audio (przydatne przy nauce języków) |
| **Tagi** | string[] | Nie | Etykiety do filtrowania i grupowania |

**Edytor WYSIWYG** obsługuje:

- Formatowanie tekstu (pogrubienie, kursywa, podkreślenie)
- Listy numerowane i punktowane
- Wstawianie obrazków inline
- Podgląd karty w czasie rzeczywistym (split view)

**Przy tworzeniu karty system automatycznie inicjalizuje:**
```typescript
reviewData: {
  easinessFactor: 2.5,  // domyślny EF
  interval: 0,          // nowa karta, brak interwału
  repetitions: 0,       // zero powtórek
  nextReviewDate: new Date(), // dostępna od razu
  state: 'new'          // stan: nowa karta
}
```

### Edycja Fiszek

Użytkownik może modyfikować treść istniejących kart:

- Zmiana tekstu przodu/tyłu
- Dodawanie/usuwanie mediów
- Modyfikacja tagów

**Kluczowa zasada:** edycja treści NIE resetuje postępu nauki. Wartości `easinessFactor`, `interval`, `repetitions` i `nextReviewDate` pozostają niezmienione. Dzięki temu poprawka literówki nie wymusza ponownego uczenia się karty od zera.

### Usuwanie Fiszek

**Usuwanie pojedyncze** — użytkownik usuwa wybraną kartę z talii. Akcja jest nieodwracalna.

**Usuwanie masowe** — użytkownik może:

1. Wybrać wiele kart za pomocą checkboxów
2. Zastosować filtry (np. "wszystkie karty z tagiem X", "karty ze stanem 'new'")
3. Usunąć wszystkie zaznaczone jednym kliknięciem

Usunięcie karty powoduje również usunięcie jej historii powtórek z `ReviewLog`.

## System Powtórek z Odstępami (Spaced Repetition)

Spaced Repetition to naukowo potwierdzona metoda efektywnego zapamiętywania, oparta na tzw. "krzywej zapominania" Ebbinghausa. Główna idea: materiał należy powtarzać tuż przed momentem, gdy zaczęlibyśmy go zapominać. Im lepiej coś pamiętamy, tym dłuższy może być odstęp do następnej powtórki.

**Przykład działania:**

- Dzień 1: Uczysz się nowego słówka "ephemeral" = "ulotny"
- Dzień 2: Powtórka — pamiętasz → następna za 6 dni
- Dzień 8: Powtórka — pamiętasz → następna za 15 dni
- Dzień 23: Powtórka — pamiętasz → następna za 38 dni
- ...i tak dalej, interwały rosną wykładniczo

### Algorytm SM-2 (SuperMemo 2)

SM-2 to klasyczny algorytm spaced repetition stworzony przez Piotra Woźniaka. Jest używany przez Anki i wiele innych aplikacji do nauki.

**Parametry przechowywane dla każdej karty:**

| Parametr | Typ | Wartość początkowa | Opis |
|:---|:-|:---|:--------|
| **EF** (Easiness Factor) | float | 2.5 | Mnożnik interwału. Karty trudniejsze (niższy EF) są pokazywane częściej. Zakres: 1.3–2.5+ |
| **Interval** | int (dni) | 0 | Aktualny odstęp między powtórkami w dniach |
| **Repetitions** | int | 0 | Licznik kolejnych poprawnych odpowiedzi. Reset do 0 przy błędzie |

### Formuły Algorytmu

**Inicjalizacja nowej karty:**
```typescript
easinessFactor = 2.5  // średnia trudność
interval = 0          // nowa karta
repetitions = 0       // brak powtórek
```

**Aktualizacja po odpowiedzi użytkownika:**

```typescript
function processAnswer(card: Card, quality: number): void {
  // quality: 0-5, gdzie 0 = całkowite niepamięcie, 5 = idealna odpowiedź
  
  if (quality < 3) {
    // Odpowiedź niepoprawna — reset postępu
    card.repetitions = 0;
    card.interval = 1;  // powtórz jutro
  } else {
    // Odpowiedź poprawna — zwiększ interwał
    if (card.repetitions === 0) {
      card.interval = 1;   // pierwsza poprawna → 1 dzień
    } else if (card.repetitions === 1) {
      card.interval = 6;   // druga poprawna → 6 dni
    } else {
      card.interval = Math.round(card.interval * card.easinessFactor);
    }
    card.repetitions += 1;
  }
  
  // Aktualizacja współczynnika łatwości (EF)
  card.easinessFactor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  
  // EF nie może spaść poniżej 1.3
  if (card.easinessFactor < 1.3) {
    card.easinessFactor = 1.3;
  }
  
  // Oblicz datę następnej powtórki
  card.nextReviewDate = addDays(new Date(), card.interval);
}
```

**Przykład działania EF:**

- Karta z EF = 2.5 (łatwa): interwał rośnie szybko (1 → 6 → 15 → 37 → 93 dni)
- Karta z EF = 1.3 (trudna): interwał rośnie wolno (1 → 6 → 8 → 10 → 13 dni)

### Przypisanie Trudności

W interfejsie użytkownik widzi 4 przyciski odpowiadające różnym poziomom jakości odpowiedzi:

| Przycisk | Wartość quality | Efekt | Przykładowy nowy interwał |
|:-|:-|:----|:---|
| **Again** | 0 | Reset postępu, karta wraca jako "do nauczenia" | 1 dzień |
| **Hard** | 2 | Niepoprawna odpowiedź, ale blisko | 1 dzień |
| **Good** | 3 | Poprawna odpowiedź z pewnym wysiłkiem | `interval × EF` |
| **Easy** | 4 | Łatwa, pewna odpowiedź — EF rośnie jeszcze bardziej | `interval × EF × 1.3` |

**Pod każdym przyciskiem wyświetlany jest przewidywany interwał**, np.:

- Again: "<1 dzień"
- Hard: "1 dzień"
- Good: "6 dni"
- Easy: "10 dni"

## Tryby Nauki

### Tryb Klasyczny (MVP)

Podstawowy i najważniejszy tryb nauki, stanowiący rdzeń aplikacji.

**Przepływ sesji:**

1. System wyświetla przód karty (pytanie)
2. Użytkownik próbuje przypomnieć sobie odpowiedź
3. Użytkownik klika "Pokaż odpowiedź" lub wykonuje gest (tap/swipe up)
4. System wyświetla tył karty (odpowiedź) wraz z 4 przyciskami oceny
5. Pod każdym przyciskiem widoczny jest przewidywany interwał (np. "Again: <1d", "Good: 6d")
6. Użytkownik ocenia jakość swojej odpowiedzi
7. System aktualizuje parametry karty (EF, interval, repetitions) zgodnie z algorytmem SM-2
8. Przejście do następnej karty w kolejce

**Stan widoku karty:**
```typescript
type CardViewState = 'question' | 'answer';

// 'question' — widoczny tylko przód, przycisk "Pokaż odpowiedź"
// 'answer' — widoczny przód i tył, przyciski oceny trudności
```

### Tryb Quiz (Multiple Choice)

- Generowanie 4 opcji odpowiedzi
- Jedna poprawna odpowiedź
- 3 dystraktorów z innych kart z tej samej talii
- Automatyczna ocena (poprawna = Good, błędna = Again)

### Tryb Pisania

- Wyświetlanie przodu karty
- Pole tekstowe do wpisania odpowiedzi
- Porównanie odpowiedzi (case-insensitive, ignorowanie białych znaków)
- Fuzzy matching dla częściowej poprawności
- Wyświetlenie poprawnej odpowiedzi

### Tryb Odwrócony

- Zamiana przodu i tyłu karty
- Pozostałe mechanizmy jak w trybie klasycznym

### Tryb Mieszany

- Losowe mieszanie trybów podczas sesji
- Dynamiczne przełączanie między trybami

## Sesja Nauki

Sesja nauki to kluczowy element aplikacji, który łączy wszystkie komponenty w spójne doświadczenie użytkownika. Poniżej przedstawiono szczegółowy opis procesu sesji nauki od momentu jej rozpoczęcia do zakończenia.

### Inicjalizacja Sesji

Przed rozpoczęciem sesji system wykonuje następujące operacje:

1. Pobranie wszystkich kart z wybranej talii z localStorage
2. Filtrowanie kart według kryteriów:
   - Karty z `nextReviewDate <= today` (do powtórki)
   - Karty ze `state: 'new'` (nowe, do limitu dziennego)
3. Utworzenie kolejki kart zgodnie z algorytmem sortowania
4. Zapisanie timestampu rozpoczęcia sesji

**Struktura obiektu sesji:**

```typescript
interface ActiveSession {
  id: string;
  deckId: string;
  startTime: Date;
  queue: Card[];           // karty do przejrzenia
  currentIndex: number;    // aktualny indeks w kolejce
  reviewed: ReviewResult[]; // wyniki już przeglądniętych kart
  isPaused: boolean;
}

interface ReviewResult {
  cardId: string;
  quality: number;
  timeSpent: number;  // ms
  timestamp: Date;
}
```

### Kolejka Kart

System buduje kolejkę kart według następującego algorytmu:

**Krok 1: Kategoryzacja kart**

| Kategoria | Warunek | Priorytet |
|:--|:------|:-|
| Zaległe | `nextReviewDate < today` | Najwyższy |
| Do powtórki | `nextReviewDate === today` | Wysoki |
| Nowe | `state === 'new'` | Średni (do limitu) |
| Przyszłe | `nextReviewDate > today` | Pomijane |

**Krok 2: Sortowanie wewnątrz kategorii**

- Zaległe: od najstarszych (najbardziej opóźnione)
- Do powtórki: losowo
- Nowe: losowo (do osiągnięcia dziennego limitu)

**Krok 3: Mieszanie (interleaving)**

Aby uniknąć monotonii, nowe karty są przeplatane z powtórkami w proporcji 1:3 (domyślnie konfigurowalne).

```typescript
function buildQueue(deck: Deck, settings: DeckSettings): Card[] {
  const overdue = cards.filter(c => c.nextReviewDate < today)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate);
  
  const dueToday = cards.filter(c => isSameDay(c.nextReviewDate, today));
  const newCards = cards.filter(c => c.state === 'new')
    .slice(0, settings.newCardsPerDay);
  
  return interleave(overdue, dueToday, newCards, ratio: 3);
}
```

### Interfejs Sesji

Ekran sesji nauki składa się z następujących elementów:

**Nagłówek sesji:**

- Nazwa talii
- Progress bar: `currentIndex / queue.length`
- Timer sesji (opcjonalny, włączany w ustawieniach)
- Przycisk menu (pauza, wyjście, ustawienia)

**Obszar karty:**

- Kontener FlashCard zajmujący ~70% wysokości ekranu
- Responsywne dopasowanie do treści
- Obsługa przewijania dla długich treści

**Obszar kontrolek:**

- Stan "pytanie": przycisk "Pokaż odpowiedź"
- Stan "odpowiedź": 4 przyciski DifficultyButtons

**Gesty dotykowe (opcjonalne):**

| Gest | Akcja | Stan karty |
|:-|:----|:-|
| Tap na kartę | Odkrycie odpowiedzi | question → answer |
| Swipe w górę | Odkrycie odpowiedzi | question → answer |
| Swipe w lewo | Ocena "Again" | answer → następna |
| Swipe w prawo | Ocena "Good" | answer → następna |

### Przetwarzanie Odpowiedzi

Po wybraniu oceny przez użytkownika system wykonuje:

1. **Zapisanie wyniku:**
   ```typescript
   const result: ReviewResult = {
     cardId: currentCard.id,
     quality: selectedQuality,
     timeSpent: Date.now() - cardShowTime,
     timestamp: new Date()
   };
   session.reviewed.push(result);
   ```

2. **Aktualizacja karty** (algorytm SM-2):
   - Obliczenie nowego EF, interval, repetitions
   - Ustawienie `nextReviewDate`
   - Aktualizacja `state` ('new' → 'learning' → 'review')

3. **Zapis do localStorage:**
   - Zaktualizowana karta
   - Wpis do `ReviewLog`

4. **Przejście do następnej karty** lub zakończenie sesji

### Animacje Kart

Aplikacja wykorzystuje następujące animacje dla lepszego UX:

| Animacja | Trigger | Czas trwania | Technologia |
|:-|:----|:-|:-|
| Flip 3D | Odkrycie odpowiedzi | 300ms | CSS transform |
| Slide out | Przejście do następnej | 200ms | CSS transition |
| Slide in | Pojawienie nowej karty | 200ms | CSS transition |
| Haptic | Każda interakcja | 10ms | Vibration API |

**Implementacja flip animation:**

```css
.flashcard {
  transform-style: preserve-3d;
  transition: transform 0.3s ease-in-out;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.flashcard-front, .flashcard-back {
  backface-visibility: hidden;
}

.flashcard-back {
  transform: rotateY(180deg);
}
```

### Zakończenie Sesji

Sesja kończy się gdy:
- Użytkownik przejrzał wszystkie karty w kolejce
- Użytkownik ręcznie zakończył sesję (przycisk "Wyjdź")
- Osiągnięto dzienny limit powtórek

**Ekran podsumowania zawiera:**

- Liczba przeglądniętych kart
- Czas trwania sesji
- Rozkład ocen (ile Again/Hard/Good/Easy)
- Przycisk "Kontynuuj naukę" lub "Wróć do talii"

## Statystyki i Postęp

Statystyki pomagają użytkownikowi śledzić postępy w nauce i utrzymać motywację. System zbiera dane z każdej sesji nauki i prezentuje je w przystępnej formie.

### Dashboard Statystyk (MVP)

Główny ekran statystyk wyświetla kluczowe metryki:

| Metryka | Źródło danych | Opis |
|:--|:---|:-------|
| **Karty dzisiaj** | `ReviewLog` z dzisiejszą datą | Liczba kart przeglądniętych w bieżącym dniu |
| **Nowe karty** | Karty ze `state: 'new'` przeglądnięte dziś | Ile nowych kart użytkownik zaczął dziś uczyć |
| **Do powtórki** | Karty z `nextReviewDate <= today` | Ile kart wymaga powtórki (backlog) |
| **Czas nauki** | Suma `timeSpent` z dzisiejszych `ReviewLog` | Łączny czas spędzony na nauce dziś |
| **Streak** | Analiza `ReviewLog` | Liczba kolejnych dni z co najmniej jedną powtórką |

**Streak (seria)** to popularna mechanika gamifikacji: użytkownik widzi ile dni z rzędu uczył się bez przerwy. Przerwanie serii (brak nauki przez dzień) resetuje licznik do 0, co motywuje do codziennej nauki.

### Wykresy Postępu

- Wykres słupkowy — karty przejrzane w ostatnich 30 dniach
- Wykres kołowy — rozkład trudności kart
- Heatmap — aktywność w ciągu roku (podobnie do GitHub)
- Wykres liniowy — czas nauki w czasie

### Statystyki Talii

- Całkowita liczba kart
- Liczba kart w każdym stadium nauki
- Średni współczynnik łatwości (EF)
- Procent opanowania

### Szczegółowe Statystyki Karty

- Historia powtórek
- Wykres zmian EF w czasie
- Ostatnia data powtórki
- Następna data powtórki

## Ustawienia Aplikacji

### Ustawienia Nauki

- Limit nowych kart dziennie (10–100)
- Limit powtórek dziennie (50–500)
- Kolejność prezentacji kart (random, oldest first)
- Automatyczne przejście do następnej karty
- Czas na odpowiedź w trybie quiz

### Ustawienia Interfejsu

- Motyw (jasny/ciemny/automatyczny)
- Rozmiar czcionki
- Język interfejsu (PL/EN)
- Włączenie/wyłączenie animacji
- Włączenie/wyłączenie haptyki

### Ustawienia Zaawansowane

- Modyfikacja parametrów algorytmu SM-2
- Export danych (JSON)
- Import danych (JSON)
- Reset postępu
- Czyszczenie cache

## Progressive Web App (PWA)

### Funkcjonalności PWA

- Manifest.json z metadanymi aplikacji
- Service Worker dla offline mode
- Ikony w różnych rozmiarach
- Splash screen
- Instalacja na ekranie głównym

### Offline Mode

- Pełna funkcjonalność bez internetu
- Synchronizacja danych przy powrocie online (opcjonalne)
- Cache statycznych zasobów

# Modele Danych

## Model Deck (Talia)

```typescript
interface Deck {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  settings: DeckSettings;
  stats: DeckStats;
}

interface DeckSettings {
  newCardsPerDay: number;
  reviewsPerDay: number;
  cardOrder: 'random' | 'oldest' | 'newest';
}

interface DeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  averageEF: number;
}
```

## Model Card (Fiszka)

```typescript
interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  image?: string;
  audio?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  reviewData: ReviewData;
}

interface ReviewData {
  easinessFactor: number; // EF
  interval: number; // dni
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate?: Date;
  state: 'new' | 'learning' | 'review' | 'relearning';
}
```

## Model ReviewLog (Historia Powtórek)

```typescript
interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  reviewDate: Date;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  reviewMode: 'classic' | 'quiz' | 'typing' | 'reversed';
  timeSpent: number; // sekundy
  previousEF: number;
  newEF: number;
  previousInterval: number;
  newInterval: number;
}
```

## Model StudySession (Sesja Nauki)

```typescript
interface StudySession {
  id: string;
  deckId: string;
  startDate: Date;
  endDate?: Date;
  cardsReviewed: number;
  newCardsSeen: number;
  totalTime: number; // sekundy
  reviewMode: ReviewMode;
}

type ReviewMode = 'classic' | 'quiz' | 'typing' | 'reversed' | 'mixed';
```

# Interfejs Użytkownika

## Ekrany Główne

### Ekran Startowy (Home)

- Powitanie użytkownika
- Szybki dostęp do nauki dzisiaj
- Podsumowanie dzisiejszych statystyk
- Karty do powtórki
- Seria dni nauki

### Ekran Talii (Decks)

- Lista wszystkich talii
- Karta każdej talii z:
  - Nazwą i ikoną
  - Liczbą kart do powtórki
  - Liczbą nowych kart
  - Progress bar postępu
- Przycisk dodania nowej talii
- Przycisk importu z Anki
- Wyszukiwanie talii

### Ekran Szczegółów Talii

- Metadane talii
- Lista wszystkich kart
- Filtrowanie kart (nowe, do nauki, opanowane)
- Przycisk rozpoczęcia sesji nauki
- Przycisk dodania nowej karty
- Statystyki talii

### Ekran Nauki (Review)

- Główny widok karty
- Przyciski trudności
- Progress bar sesji
- Timer
- Menu kontekstowe (pauza, wyjście, ustawienia)

### Ekran Statystyk (Statistics)

- Dashboard z kluczowymi metrykami
- Wykresy postępu
- Heatmap aktywności
- Szczegółowe statystyki dla każdej talii

### Ekran Ustawień (Settings)

- Sekcje ustawień pogrupowane tematycznie
- Przełączniki, slidery, selecty
- Przycisk exportu/importu danych

## Komponenty UI

### FlashCard Component

- Kontener karty z animacją flip
- Responsywny design
- Obsługa gestów
- Wyświetlanie obrazków i formatowania

### DifficultyButtons Component

Przyciski oceny trudności:

| Przycisk | Kolor |
|:---|:---|
| **Again** | Czerwony |
| **Hard** | Pomarańczowy |
| **Good** | Zielony |
| **Easy** | Niebieski |

- Wyświetlanie następnych interwałów
- Duże targety touch-friendly

### ProgressChart Component

- Wykres słupkowy z biblioteki Recharts
- Responsive na różnych rozmiarach ekranu
- Tooltips z szczegółami

### Heatmap Component

- Siatka 7×52 reprezentująca dni roku
- Gradient kolorów według aktywności
- Tooltips z datą i liczbą kart

## Paleta Kolorów

### Tryb Jasny

| Element | Kolor | Hex |
|:---|:---|:-|
| Primary | Niebieski | `#5B8DEF` |
| Secondary | Różowy | `#FF6B9D` |
| Success | Zielony | `#4CAF50` |
| Warning | Pomarańczowy | `#FF9800` |
| Danger | Czerwony | `#F44336` |
| Background | — | `#FAFAFA` |
| Surface | — | `#FFFFFF` |
| Text Primary | — | `#212121` |
| Text Secondary | — | `#757575` |

### Tryb Ciemny

| Element | Kolor | Hex |
|:---|:---|:-|
| Primary | Niebieski | `#5B8DEF` |
| Secondary | Różowy | `#FF6B9D` |
| Success | Zielony | `#66BB6A` |
| Warning | Pomarańczowy | `#FFA726` |
| Danger | Czerwony | `#EF5350` |
| Background | — | `#121212` |
| Surface | — | `#1E1E1E` |
| Text Primary | — | `#FFFFFF` |
| Text Secondary | — | `#B0B0B0` |

## Typografia

**Font:** System font stack (San Francisco na iOS, Roboto na Android)

| Element | Rozmiar | Grubość |
|:---|:-|:-|
| Heading 1 | 32px | Bold |
| Heading 2 | 24px | Bold |
| Heading 3 | 20px | SemiBold |
| Body | 16px | Regular |
| Caption | 14px | Regular |
| Small | 12px | Regular |

# Bezpieczeństwo i Prywatność

## Przechowywanie Danych

- Wszystkie dane przechowywane lokalnie na urządzeniu
- Brak wysyłania danych na serwery zewnętrzne
- Opcjonalne szyfrowanie danych wrażliwych

## Backup i Synchronizacja

- Export danych do pliku JSON
- Import danych z pliku JSON
- Możliwość ręcznej synchronizacji między urządzeniami

# Wydajność

## Optymalizacje

- Lazy loading komponentów
- Virtualizacja długich list kart
- Memoizacja kosztownych obliczeń
- Throttling/debouncing przy wyszukiwaniu
- Kompresja danych w storage

## Metryki Wydajności

| Metryka | Cel |
|:----|:-|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 90 |

# Stos Technologiczny

## Frontend Framework

- **Ionic Framework 8.x** — framework do tworzenia aplikacji mobilnych
- **React 18.x** — biblioteka JavaScript do budowy interfejsu użytkownika
- **TypeScript 5.x** — statyczne typowanie

## Routing i Nawigacja

- **React Router 6.x** — routing w aplikacji
- **Ionic React Router** — integracja routingu z komponentami Ionic

## Zarządzanie Stanem

- **React Hooks** (useState, useEffect, useReducer, useContext)
- **Context API** — globalny stan aplikacji

## Stylizacja

- **Ionic Components** — gotowe komponenty UI
- **CSS Variables** — customizacja motywu
- **CSS Modules / Styled Components** — lokalne style komponentów

## Persystencja Danych

- **Window Storage API** (dostępne w środowisku Claude Artifacts) — zapis i odczyt danych użytkownika
- **IndexedDB** (opcjonalnie w wersji produkcyjnej) — lokalna baza danych

## Obsługa Plików Anki

- **JSZip** — dekompresja plików .apkg
- **SQL.js** — parsowanie bazy SQLite z Anki

## Build i Deployment

- **Vite 5.x** — szybki bundler i dev server
- **Capacitor 6.x** (opcjonalnie) — deployment na natywne platformy

# Testowanie

## Testy Jednostkowe

- Algorytm SM-2
- Utility functions
- Services (storage, import)

## Testy Integracyjne

- Przepływ tworzenia talii i kart
- Przepływ sesji nauki
- Import z Anki

## Testy Manualne

- Testowanie na różnych urządzeniach mobilnych
- Testowanie gestów dotykowych
- Testowanie offline mode

# Roadmapa Rozwoju

## Faza 1 — MVP (Minimum Viable Product)

- Podstawowe zarządzanie taliami i kartami
- Tryb klasyczny nauki
- Algorytm SM-2
- Podstawowe statystyki
- Responsywny UI

## Faza 2 — Rozszerzenie Funkcji

- Dodatkowe tryby nauki (quiz, typing, reversed)
- Import z Anki
- Zaawansowane statystyki z wykresami
- PWA z offline mode

## Faza 3 — Polerowanie

- Animacje i mikro-interakcje
- Heatmap aktywności
- Eksport/import danych
- Optymalizacja wydajności

## Faza 4 — Funkcje Dodatkowe (Opcjonalne)

- Synchronizacja między urządzeniami (backend)
- Udostępnianie talii między użytkownikami
- Text-to-speech dla nauki językowej
- Rozpoznawanie mowy w trybie pisania
- Gamifikacja (osiągnięcia, rankingi)

# Wymagania Techniczne

## Minimalne Wymagania

- Przeglądarka wspierająca ES6+
- 50 MB wolnej pamięci na urządzeniu
- Rozdzielczość ekranu min. 320×568 (iPhone SE)

## Zalecane Wymagania

- Najnowsza wersja Chrome/Safari
- 200 MB wolnej pamięci
- Rozdzielczość Full HD

# Dokumentacja Użytkownika

## Onboarding

- Tutorial przy pierwszym uruchomieniu
- Wskazówki dla nowych użytkowników
- Przykładowa talia demonstracyjna

## Pomoc w Aplikacji

- Sekcja FAQ
- Tooltips przy skomplikowanych funkcjach
- Link do pełnej dokumentacji

# Deployment

## Build Production

```bash
npm run build
```

## Hosting

- **Vercel / Netlify** — darmowy hosting PWA
- **GitHub Pages** — alternatywna opcja
- **Własny serwer** z HTTPS

## CI/CD (Opcjonalne)

- GitHub Actions do automatycznego deploymentu
- Automatyczne testy przed deploymentem

# Podsumowanie

Niniejsza specyfikacja przedstawia kompletny plan implementacji nowoczesnej aplikacji do nauki z fiszkami. Aplikacja łączy sprawdzone algorytmy powtórek z odstępami z intuicyjnym, mobilnym interfejsem użytkownika. Zastosowanie stosu technologicznego opartego o Ionic React oraz TypeScript zapewnia solidne fundamenty dla skalowalnej i łatwej w utrzymaniu aplikacji.

**Kluczowe cechy projektu:**

| Cecha | Opis |
|:-|:----|
| Offline | Pełna funkcjonalność bez internetu |
| Design | Nowoczesny, responsywny interfejs |
| Algorytm | Skuteczny system powtórek SM-2 |
| Tryby | Różnorodne metody nauki |
| Kompatybilność | Import z Anki |
| Analityka | Szczegółowe statystyki i wizualizacje |

Projekt jest przygotowany do realizacji etapami, co pozwala na iteracyjny rozwój i szybkie dostarczanie wartości użytkownikom końcowym.