export default class DiceRoller {
    
    dices = [];
    lastTestName = "";
    lastDamage = 0;

    roll(testName, base, skill, gear, artifacts, modifier, damage) {
        this.dices = [];
        this.lastTestName = testName;
        let computedSkill = skill + modifier;
        let computedSkillType;
        if (computedSkill > 0) {
            computedSkillType = "skill";
        } else {
            computedSkill = -computedSkill;
            computedSkillType = "skill-penalty";
        }
        this.rollDice(base, "base", 6);
        this.rollDice(computedSkill, computedSkillType, 6);
        this.rollDice(gear, "gear", 6);
        artifacts.forEach(artifact => {
            this.rollDice(artifact.dice, "artifact", artifact.face);
        });
        let computedDamage = damage;
        if (damage > 0) {
            computedDamage = computedDamage - 1;
        }
        this.lastDamage = computedDamage;
        this.sendRollToChat(false);
    }

    push() {
        this.dices.forEach(dice => {
            if ((dice.value < 6 && dice.value > 1 && dice.type !== "skill") || (dice.value < 6 && dice.type === "skill")) {
                dice.value = Math.floor(Math.random() * Math.floor(dice.face)) + 1;
                let successAndWeight = this.getSuccessAndWeight(dice.value, dice.type);
                dice.success = successAndWeight.success;
                dice.weight = successAndWeight.weight;
            }
        });
        this.sendRollToChat(true);
    }

    rollConsumable(consumable) {
        let consumableName = game.i18n.localize(consumable.label);
        let formula = "1d" + consumable.value;
        let roll = new Roll(formula, {});
        roll.roll();
        let resultMessage;
        if (roll._total > 1) {
            resultMessage = "<b>" + consumableName + "</b></br><b style='color:green'>Succeed</b>";
        } else if (parseInt(consumable.value, 10) === 6) {
            resultMessage = "<b>" + consumableName + "</b></br><b style='color:red'>Failed. No more " + consumableName.toLowerCase() + " !</b>";
        } else {
            resultMessage = "<b>" + consumableName + "</b></br><b style='color:red'>Failed. Downgrading to " + (consumable.value - 2) + "</b>";
        }
        let chatData = {
            user: game.user._id,
            content: resultMessage
        };
        ChatMessage.create(chatData, {});
    }

    sendRollToChat(isPushed) {
        this.dices.sort(function(a, b){return b.weight - a.weight});
        let numberOfSword = this.countSword();
        let numberOfSkull = this.countSkull();
        let resultMessage;
        const pushedMessage = isPushed ? " (PUSHED) " : "";
        const damage = numberOfSword > 0 ? numberOfSword + this.lastDamage : numberOfSword;

        resultMessage = "<b style='color:green'>" + this.lastTestName + "</b>" + pushedMessage + "<b> " + damage + "⚔️ | "+ numberOfSkull + " 💀</b></br>";

        let diceMessage = this.printDices() + "</br>";
        let chatData = {
            user: game.user._id,
            content: resultMessage + diceMessage
        };
        ChatMessage.create(chatData, {});
    }

    rollDice(numberOfDice, typeOfDice, numberOfFaces) {
        if (numberOfDice > 0) {
            let diceFormula = numberOfDice + "d" + numberOfFaces;
            let roll = new Roll(diceFormula, {});
            roll.roll();
            if (game.dice3d !== undefined) {
                game.dice3d.showForRoll(roll);
            }
            roll.parts.forEach(part => {
                part.rolls.forEach(r => {
                    let successAndWeight = this.getSuccessAndWeight(r.roll, typeOfDice);
                    this.dices.push({
                        value: r.roll,
                        type: typeOfDice,
                        success: successAndWeight.success,
                        weight: successAndWeight.weight,
                        face: numberOfFaces
                    });
                });
            });
        }
    }

    getSuccessAndWeight(diceValue, diceType) {
        if (diceValue === 12) {
            return {success: 4, weight: 4};
        } else if (diceValue >= 10) {
            return {success: 3, weight: 3};
        } else if (diceValue >= 8) {
            return {success: 2, weight: 2};
        } else if (diceValue >= 6) {
            if (diceType === "skill-penalty") {
                return {success: -1, weight: -1};
            } else {
                return {success: 1, weight: 1};
            }
        } else if (diceValue === 1 && diceType !== "skill-penalty" && diceType !== "skill") {
            return {success: 0, weight: -2};
        } else {
            return {success: 0, weight: 0};
        }
    }

    countSword() {
        let numberOfSword = 0;
        this.dices.forEach(dice => {
            numberOfSword = numberOfSword + dice.success;
        });
        return numberOfSword;
    }

    countSkull() {
        let numberOfSkull = 0;
        this.dices.forEach(dice => {
            if (dice.value === 1 && (dice.type === "base" || dice.type === "gear")) {
                numberOfSkull++;
            }
        });
        return numberOfSkull;
    }

    printDices() {
        let message = "";
        this.dices.forEach(dice => {
            message = message + "<img width='25px' height='25px' style='border:none;margin-right:2px;margin-top:2px' src='systems/forbidden-lands/asset/" + dice.type + "-dice-" + dice.value + ".png'/>"
        });
        return message;
    }
}