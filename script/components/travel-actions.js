import { RollDialog } from "../dialog/roll-dialog.js";

function rollTravelAction(rollName, skillName, onAfterRoll) {
    if (game.user.character === null) return;
    console.log(game.user.character);

    const data = game.user.character.data.data;
    const skill = data.skill[skillName];
    RollDialog.prepareRollDialog(
        game.i18n.localize(rollName), 
        { name: game.i18n.localize(data.attribute[skill.attribute].label), value: data.attribute[skill.attribute].value},
        { name: game.i18n.localize(skill.label), value: skill.value}, 
        0, 
        "", 
        0, 
        0,
        null,
        onAfterRoll
    );
}

export let TravelActionsConfig = {
    hike: {
        key: "hike",
        journalEntryName: "Hike",
        name: "TRAVEL.HIKE",
        buttons: [
            {
                name: "TRAVEL_ROLL.FORCED_MARCH",
                class: "travel-forced-march",
                handler: function (event) {
                    console.log('Handle FORCED_MARCH');
                    rollTravelAction("TRAVEL_ROLL.FORCED_MARCH", 'endurance');
                },
            },
            {
                name: "TRAVEL_ROLL.HIKE_IN_DARKNESS",
                class: "travel-hike-in-darkness",
                handler: function (event) {
                    console.log('Handle HIKE_IN_DARKNESS');
                    rollTravelAction("TRAVEL_ROLL.HIKE_IN_DARKNESS", 'scouting');
                },
            },
        ],
    },
    lead: {
        key: "lead",
        journalEntryName: "Lead the Way",
        name: "TRAVEL.LEAD",
        buttons: [
            {
                name: "TRAVEL_ROLL.NAVIGATE",
                class: "travel-navigate",
                handler: function (event) {
                    console.log('Handle NAVIGATE');
                    rollTravelAction("TRAVEL_ROLL.NAVIGATE", 'survival');
                },
            },
        ],
    },
    watch: {
        key: "watch",
        journalEntryName: "Keep Watch",
        name: "TRAVEL.WATCH",
        buttons: [
            {
                name: "TRAVEL_ROLL.KEEP_WATCH",
                class: "travel-keep-watch",
                handler: function (event) {
                    console.log('Handle KEEP_WATCH');
                    rollTravelAction("TRAVEL_ROLL.KEEP_WATCH", 'scouting');
                },
            },
        ],
    },
    rest: {
        key: "rest",
        journalEntryName: "Rest",
        name: "TRAVEL.REST",
        buttons: [
            {
                name: "TRAVEL_ROLL.RECOVER",
                class: "travel-rest-recover",
                handler: async function (event) {
                    console.log('Handle rest RECOVER');
                    if (game.user.character === null) return;
                    console.log(game.user.character);

                    const data = game.user.character.data.data;
                    let updateData = {};
                    let isBroken = false;
                    for (let attribute in data.attribute) {
                        if (data.attribute[attribute].value === 0) isBroken = true;
                        if (data.attribute[attribute].value > 0 && data.attribute[attribute].value < data.attribute[attribute].max) {
                            updateData['data.attribute.' + attribute + '.value'] = data.attribute[attribute].max;
                        }
                    }
                    let updateNeeded = Object.keys(updateData).length > 0;
                    if (updateNeeded) await game.user.character.update(updateData);

                    let content = `<i>Wakes up ${updateNeeded ? 'recovered and' : 'feeling'} well rested</i>`;
                    if (isBroken) content = "<i>Broken and couldn't recover</i>";
                    let chatData = {
                        user: game.user._id,
                        content: content
                    };
                    ChatMessage.create(chatData, {});
                },
            },
        ],
    },
    sleep: {
        key: "sleep",
        journalEntryName: "Sleep",
        name: "TRAVEL.SLEEP",
        buttons: [
            {
                name: "TRAVEL_ROLL.RECOVER",
                class: "travel-sleep-recover",
                handler: async function (event) {
                    console.log('Handle sleep RECOVER');
                    if (game.user.character === null) return;
                    console.log(game.user.character);

                    const data = game.user.character.data.data;
                    let updateData = {};
                    let isBroken = false;
                    for (let attribute in data.attribute) {
                        if (data.attribute[attribute].value === 0) isBroken = true;
                        if (data.attribute[attribute].value > 0 && data.attribute[attribute].value < data.attribute[attribute].max) {
                            updateData['data.attribute.' + attribute + '.value'] = data.attribute[attribute].max;
                        }
                    }
                    let hasRecovered = Object.keys(updateData).length > 0;
                    if (data.condition.sleepless.value) updateData['data.condition.sleepless.value'] = false;
                    
                    let updateNeeded = Object.keys(updateData).length > 0;
                    if (updateNeeded) await game.user.character.update(updateData);

                    let content = `<i>Wakes up ${hasRecovered ? 'recovered and' : 'feeling'} well rested</i>`;
                    if (isBroken) content = "<i>Broken and couldn't recover</i>";
                    let chatData = {
                        user: game.user._id,
                        content: content
                    };
                    ChatMessage.create(chatData, {});
                },
            },
        ],
    },
    forage: {
        key: "forage",
        journalEntryName: "Forage",
        name: "TRAVEL.FORAGE",
        buttons: [
            {
                name: "TRAVEL_ROLL.FIND_FOOD",
                class: "travel-find-food",
                handler: function (event) {
                    console.log('Handle FIND_FOOD');
                    rollTravelAction("TRAVEL_ROLL.FIND_FOOD", 'survival');
                },
            },
        ],
    },
    hunt: {
        key: "hunt",
        journalEntryName: "Hunt",
        name: "TRAVEL.HUNT",
        buttons: [
            {
                name: "TRAVEL_ROLL.FIND_PREY",
                class: "travel-find-prey",
                handler: function (event) {
                    console.log('Handle FIND_PREY');
                    rollTravelAction(
                        "TRAVEL_ROLL.FIND_PREY", 
                        'survival',
                        function (diceRoller) { // onAfterRoll
                            const isSuccess = diceRoller.countSword() > 0;
                            if (isSuccess) {
                                let rolltable = game.tables.getName('Find a Prey');
                                if (rolltable) {
                                    rolltable.draw();
                                } else {
                                    let chatData = {
                                        user: game.user._id,
                                        content: "You've spotted a prey!<br><i>Create a roll table named 'Find a Prey' to automatically find out what creature have you spotted.<i>"
                                    };
                                    ChatMessage.create(chatData, {});
                                }
                            }
                        }
                    );
                },
            },
            {
                name: "TRAVEL_ROLL.KILL_PREY",
                class: "travel-kill-prey",
                handler: function (event) {
                    console.log('Handle KILL_PREY');
                    if (game.user.character === null) return;
                    console.log(game.user.character);

                    const data = game.user.character.data.data;
                    const skill = data.skill.marksmanship;
                    RollDialog.prepareRollDialog(
                        game.i18n.localize("TRAVEL_ROLL.KILL_PREY"), 
                        data.attribute[skill.attribute].value,
                        skill.value, 
                        0, 
                        "", 
                        0, 
                        0
                    );
                },
            },
        ],},
    fish: {
        key: "fish",
        journalEntryName: "Fish",
        name: "TRAVEL.FISH",
        buttons: [
            {
                name: "TRAVEL_ROLL.CATCH_FISH",
                class: "travel-catch-fish",
                handler: function (event) {
                    console.log('Handle CATCH_FISH');
                    rollTravelAction("TRAVEL_ROLL.CATCH_FISH", 'survival');
                },
            },
        ],
    },
    camp: {
        key: "camp",
        journalEntryName: "Make Camp",
        name: "TRAVEL.CAMP",
        buttons: [
            {
                name: "TRAVEL_ROLL.MAKE_CAMP",
                class: "travel-make-camp",
                handler: function (event) {
                    console.log('Handle MAKE_CAMP');
                    rollTravelAction("TRAVEL_ROLL.MAKE_CAMP", 'survival');
                },
            },
        ],
    },
    other: {
        key: "other",
        journalEntryName: "",
        name: "TRAVEL.OTHER",
        buttons: [],
    },
};