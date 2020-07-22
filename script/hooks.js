import {ForbiddenLandsActor} from "./actor/forbidden-lands.js";
import {ForbiddenLandsPartySheet} from "./sheet/party.js";
import {ForbiddenLandsCharacterSheet} from "./sheet/character.js";
import {ForbiddenLandsMonsterSheet} from "./sheet/monster.js";
import {ForbiddenLandsStrongholdSheet} from "./sheet/stronghold.js";
import {ForbiddenLandsWeaponSheet} from "./sheet/weapon.js";
import {ForbiddenLandsArmorSheet} from "./sheet/armor.js";
import {ForbiddenLandsArtifactSheet} from "./sheet/artifact.js";
import {ForbiddenLandsGearSheet} from "./sheet/gear.js";
import {ForbiddenLandsRawMaterialSheet} from "./sheet/raw-material.js";
import {ForbiddenLandsSpellSheet} from "./sheet/spell.js";
import {ForbiddenLandsTalentSheet} from "./sheet/talent.js";
import {ForbiddenLandsCriticalInjurySheet} from "./sheet/critical-injury.js";
import {ForbiddenLandsMonsterTalentSheet} from "./sheet/monster-talent.js";
import {ForbiddenLandsMonsterAttackSheet} from "./sheet/monster-attack.js";
import {ForbiddenLandsBuildingSheet} from "./sheet/building.js";
import {ForbiddenLandsHirelingSheet} from "./sheet/hireling.js";

Hooks.once("init", async function () {
    CONFIG.Combat.initiative = {formula: "1d10", decimals: 0};
    CONFIG.Actor.entityClass = ForbiddenLandsActor;
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("forbidden-lands", ForbiddenLandsPartySheet, {types: ["party"], makeDefault: true});
    Actors.registerSheet("forbidden-lands", ForbiddenLandsCharacterSheet, {types: ["character"], makeDefault: true});
    Actors.registerSheet("forbidden-lands", ForbiddenLandsMonsterSheet, {types: ["monster"], makeDefault: true});
    Actors.registerSheet("forbidden-lands", ForbiddenLandsStrongholdSheet, {types: ["stronghold"], makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("forbidden-lands", ForbiddenLandsWeaponSheet, {types: ["weapon"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsArmorSheet, {types: ["armor"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsArtifactSheet, {types: ["artifact"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsGearSheet, {types: ["gear"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsRawMaterialSheet, {types: ["rawMaterial"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsSpellSheet, {types: ["spell"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsTalentSheet, {types: ["talent"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsCriticalInjurySheet, {types: ["criticalInjury"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsMonsterTalentSheet, {types: ["monsterTalent"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsMonsterAttackSheet, {types: ["monsterAttack"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsBuildingSheet, {types: ["building"], makeDefault: true});
    Items.registerSheet("forbidden-lands", ForbiddenLandsHirelingSheet, {types: ["hireling"], makeDefault: true});
    preloadHandlebarsTemplates()
});

Handlebars.registerHelper('toUpperCase', function(value, options) {
    return typeof value === 'string' ? value.toUpperCase() : value;
});
Handlebars.registerHelper('strconcat', function() {
    const args = Array.prototype.slice.call(arguments);
    args.pop(); // remove unrelated data
    return args.join("");
});

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/my-forbidden-lands/model/party.html",
        "systems/forbidden-lands/model/character.html",
        "systems/forbidden-lands/model/monster.html",
        "systems/forbidden-lands/model/stronghold.html",
        "systems/forbidden-lands/model/weapon.html",
        "systems/forbidden-lands/model/armor.html",
        "systems/forbidden-lands/model/monster-talent.html",
        "systems/forbidden-lands/model/monster-attack.html",
        "systems/forbidden-lands/model/artifact.html",
        "systems/forbidden-lands/model/gear.html",
        "systems/forbidden-lands/model/raw-material.html",
        "systems/forbidden-lands/model/talent.html",
        "systems/forbidden-lands/model/spell.html",
        "systems/forbidden-lands/model/critical-injury.html",
        "systems/forbidden-lands/model/building.html",
        "systems/forbidden-lands/model/hireling.html",
        "systems/forbidden-lands/model/tab/main.html",
        "systems/forbidden-lands/model/tab/combat.html",
        "systems/forbidden-lands/model/tab/combat-monster.html",
        "systems/forbidden-lands/model/tab/talent.html",
        "systems/forbidden-lands/model/tab/spell.html",
        "systems/forbidden-lands/model/tab/gear.html",
        "systems/forbidden-lands/model/tab/gear-monster.html",
        "systems/forbidden-lands/model/tab/bio.html",
        "systems/forbidden-lands/model/tab/building-stronghold.html",
        "systems/forbidden-lands/model/tab/hireling-stronghold.html",
        "systems/forbidden-lands/model/tab/gear-stronghold.html",
        "systems/my-forbidden-lands/model/tab/party/main.html",
        "systems/my-forbidden-lands/model/tab/party/travel.html",
        "systems/my-forbidden-lands/model/tab/party/travel-action.html",
    ];
    return loadTemplates(templatePaths);
}