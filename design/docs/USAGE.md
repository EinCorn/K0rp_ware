# Runtime usage

- Používejte Pixel Operator pro běžné UI a Pixel Operator Mono pro čísla a systémové hodnoty.
- Window frames kreslete nad obsahem. Přesné souřadnice jsou v `window-metrics.json`.
- Text nepéct do blank komponent; používat reference pouze jako design contract.
- Modulová okna, dokumenty, složky a system modals mají odlišné content surfaces, ale společný kovový chrome.
