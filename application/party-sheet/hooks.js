import { PartySheet } from "./script/party-sheet.js";
import { registerPartySheetSettings } from "./script/party-sheet-settings.js";

$(document).ready(() => {
    const partySheet = new PartySheet();

    Hooks.on('ready', () => {
        partySheet.loadSettings();

        const templatePath = "systems/my-forbidden-lands/application/party-sheet/template/widget.html";
        renderTemplate(templatePath, partySheet.getData()).then(html => { console.log(html); partySheet.render(true) });
    });

    Hooks.on('setup', () => {
        let operations = {
          showPartySheet: PartySheet.toggleCalendar,
        }
        game.FLPartySheet = operations;
        window.FLPartySheet = operations;
    });

    Hooks.once("init", async function () {
        registerPartySheetSettings(partySheet);
        preloadPartySheetTemplates();
    });
    
    async function preloadPartySheetTemplates() {
        const templatePaths = [
            "systems/my-forbidden-lands/application/party-sheet/template/widget.html",
        ];
        return loadTemplates(templatePaths);
    }
});
