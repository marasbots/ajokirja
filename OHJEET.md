# Ajopäiväkirja – pilvisynkronointi (Cloudflare D1)

Tämä paketti lisää automaattisen synkronoinnin: matkat tallentuvat Cloudflaren
ilmaiseen D1-tietokantaan, joten samat tiedot näkyvät puhelimessa ja koneella.

## Mitä paketti sisältää
- `index.html` – itse sovellus (sama kuin ennen + synkronointi)
- `functions/api/sync.js` – palvelinpää (Cloudflare Pages Function)
- `schema.sql` – tietokannan rakenne (valinnainen, koodi luo taulut myös automaattisesti)

## Käyttöönotto (kertaluontoinen, n. 10 min)

### 1. Luo D1-tietokanta
1. Mene: dash.cloudflare.com → vasemmalta **Storage & Databases** → **D1 SQL Database**
2. **Create** → nimi esim. `ajopaivakirja` → Create
3. (Valinnainen) Avaa tietokanta → **Console** → liitä `schema.sql`:n sisältö → Execute.
   Tämä ei ole pakollista, koska sovellus luo taulut itse ensimmäisellä käytöllä.

### 2. Julkaise sovellus uudelleen tämän kansion sisällöllä
1. Mene: **Workers & Pages** → projektisi **ajokirja** → **Create deployment**
   (TAI luo uusi Pages-projekti ja lataa tämä kansio / zip)
2. Lataa **koko tämä kansio** (tai zip), jossa on `index.html` JA `functions`-kansio.
   Tärkeää: `functions`-kansion on oltava mukana, muuten synkronointi ei toimi.
3. Deploy.

### 3. Kytke tietokanta sovellukseen (binding)
1. Pages-projekti → **Settings** → **Bindings** (tai "Functions" → "D1 database bindings")
2. **Add** → D1 database
   - Variable name: `DB`   ← täsmälleen näin, isoilla kirjaimilla
   - D1 database: valitse `ajopaivakirja`
3. Tallenna.

### 4. Aseta salasana (SYNC_TOKEN)
1. Pages-projekti → **Settings** → **Variables and Secrets** (Environment variables)
2. **Add** → Production
   - Name: `SYNC_TOKEN`
   - Value: keksi vahva salasana, esim. `Muuri2026!Vantaa`
3. Tallenna.
4. Tee vielä yksi **Create deployment** (uudelleenjulkaisu), jotta sidos + muuttuja tulevat voimaan.

### 5. Ota synkronointi käyttöön sovelluksessa
1. Avaa `ajokirja.pages.dev` koneella
2. Paina **☁ Synkronointi** → kirjoita sama salasana (SYNC_TOKEN) → **Tallenna & yhdistä**
3. Ylhäällä lukee "✓ synkronoitu"
4. Tee sama puhelimella: avaa sama osoite → ☁ Synkronointi → sama salasana
5. Nyt matkat synkronoituvat automaattisesti molempiin suuntiin.

## Miten se toimii
- Sovellus toimii edelleen myös ilman nettiä (tiedot selaimen muistissa).
- Kun yhteys on, muutokset lähetetään palvelimelle 1,5 s viiveellä ja palvelimen
  muutokset haetaan takaisin. Uusin muokkaus voittaa (aikaleima ratkaisee).
- Poistot synkronoituvat (merkitään poistetuksi, ei katoa toisesta laitteesta).

## Turvallisuus
- Suojaus perustuu salasanaan (SYNC_TOKEN). Käytä vahvaa salasanaa.
- Tämä riittää henkilökohtaiseen ajopäiväkirjaan. Älä jaa osoitetta + salasanaa.

## Vianetsintä
- "⚠ väärä salasana": appin salasana ≠ SYNC_TOKEN. Tarkista molemmat.
- "⚠ ei yhteyttä" tai 500-virhe: tarkista että D1-binding nimi on tasan `DB`
  ja että teit uudelleenjulkaisun bindingin/muuttujan lisäämisen jälkeen.
- "vaatii julkaistun version": GPS/synkka ei toimi tiedostosta avattuna, vain HTTPS-osoitteessa.
