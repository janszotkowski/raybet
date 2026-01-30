**Zadání:**

**Design a UI**
Vizuální styl: Celá aplikace musí být v ideálně v barvách loga Raynetu (tyrkysová, světle modrá a tmavě modrá). Logo samotné zakomponuj někam vkusně do horní části aplikace, ale whatever..

Layout: Musí to být jednotné pro mobil i web. Vycentrovaný kontejner pro mobilní zobrazení o maximální šířce 480px, který bude na desktopu uprostřed obrazovky. Viz. Figma.

**Registrace a login page**
Tahle část ve figme není. Jako db použít https://appwrite.io/ nebo https://supabase.com/ nebo https://pocketbase.io/ (nechám na mistrech v oboru)

Registrace, Login a systém Místností (Rooms)
Kromě samotného profilu a zápasů musíme vyřešit vstup uživatele do aplikace. Základem je, že každý hráč musí být v nějaké "Room", aby mohl soutěžit s ostatními.

1. Vstupní stránka (Landing / Login)

Pokud uživatel není přihlášen, uvidí jednoduchý rozcestník: Přihlásit se nebo Vytvořit účet.

Pod tím musí být výrazné pole: "Máš kód místnosti? Vlož ho zde". Po zadání ID místnosti a potvrzení bude uživatel přesměrován na registraci, která ho po dokončení automaticky hodí do dané místnosti.

2. Proces po registraci (Onboarding) Pokud se uživatel zaregistruje napřímo (ne přes pozvánku), musí mít na výběr dvě cesty:

Vytvořit novou místnost: Uživatel zadá název (např. "IT Oddělení - Tipovačka") a aplikace mu vygeneruje unikátní 6místné ID (např. #ZOH2026-XyZ).

Připojit se k existující místnosti: Ruční zadání ID kódu, který dostal od kolegy.

3. Správa místnosti a pozvánky

V profilu nebo na hlavní stránce bude sekce "Moje místnost".

Bude tam tlačítko "Pozvat kolegy", které jedním kliknutím zkopíruje do schránky vygenerovaný text: "Pojď tipovat hokej na ZOH 2026! Registruj se zde: [link] nebo použij kód místnosti: [ID]".

Úprava technického zadání pro ticket:
Registrace a Login:

Implementovat klasický e-mail + heslo (případně Google Auth pro zjednodušení v korporátu).

Po prvním přihlášení vynutit buď vytvoření místnosti, nebo zadání ID kódu pro vstup do existující. Bez místnosti nelze tipovat.

Logika místností:

Vytvoření místnosti: Každá místnost má svůj název a unikátní ID v databázi. Zakladatel místnosti je "Admin", ale pro začátek stačí, když budou mít všichni stejná práva (prohlížení žebříčku).

Vstup do místnosti: Uživatel může být členem více místností najednou (volitelné, ale doporučuji pro začátek omezit na jednu místnost pro jednoduchost vývoje).

Data a propojení:

Žebříček (Leaderboard) se bude vždy filtrovat podle ID místnosti. Uživatel tedy neuvidí tisíce cizích lidí, ale pouze své kolegy z dané místnosti.

**Profil hráče:** (obr. profil_hrace)

Uživatel si zde může nahrát vlastní avatar.

Musí zde být mřížka  se statistikami: Přesný výsledek, Správný rozdíl skóre, Tip vítěze zápasu a celková úspěšnost v procentech.

Pod celkovým počtem bodů bude speciální kolonka pro tip vítěze celého turnaje. Měl by to být dropdown s listem všech národních týmů. Tento tip musí jít před začátkem olympiády uložit a následně uzamknout, aby už nešel měnit.

**Zápasy a Data** (obr. zapasy)
API: Data pro jednotlivé zápasy budeme tahat z webu thesportsdb.com.

Zobrazení: Seznam zápasů nebude rozdělený na taby podle fází turnaje. Vše půjde chronologicky za sebou (skupiny a pak playoff).

Denní výpis: Na stránce se zápasy bude nahoře slider s jednotlivými dny. Po kliknutí na konkrétní den se zobrazí seznam zápasů pro dané datum. U každého zápasu budou dvě kolonky pro zadání výsledku.

**Systém bodování**
Body budeme rozdělovat následovně:

6 bodů za přesný tip výsledku zápasu.

4 body za uhodnutí správného rozdílu skóre.

2 body za správný tip vítěze zápasu.

15 bodů za správný tip celkového vítěze turnaje (toho, co si hráč uzamkne na profilu).

**Žebříček** (obr. ranking)
Poslední stránka bude obsahovat aktuální pořadí všech hráčů.

Aktuálně přihlášený uživatel musí svou pozici vidět neustále (např. v ukotveném řádku dole), i když se v seznamu zrovna nenachází. Zde by mohlo být kromě celkových bodů také počet přesnýh tipů a možnost prokliknout se na profil jiného uživatele.
